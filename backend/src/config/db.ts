import { Pool, PoolConfig, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { seedMembersIfEmpty } from './seed_members';
import { defaultPostgresSchema } from './initSql';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const hasSsl = process.env.DB_SSL === 'true' || Boolean(process.env.DATABASE_URL) || isProduction;

const getPoolConfig = (): PoolConfig => {
    if (process.env.DATABASE_URL) {
        return {
            connectionString: process.env.DATABASE_URL,
            ssl: hasSsl ? { rejectUnauthorized: false } : undefined,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        };
    }

    return {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'portal_hlevan',
        ssl: hasSsl ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
};

let pool: Pool | null = null;

export const getPool = async (): Promise<Pool> => {
    if (pool) return pool;

    try {
        const config = getPoolConfig();
        pool = new Pool(config);

        // Test connection
        const client = await pool.connect();
        const res = await client.query('SELECT current_database(), version()');
        console.log('PostgreSQL Connected successfully:', res.rows[0]);
        client.release();

        return pool;
    } catch (err) {
        console.error('Database connection failed. Retrying in 5 seconds...', err);
        await new Promise((res) => setTimeout(res, 5000));
        return getPool();
    }
};

export interface ExecuteResult<T = any> {
    rows: T[];
    recordset: T[];
    rowCount: number | null;
}

/**
 * Hàm thực thi truy vấn PostgreSQL hỗ trợ cả params dạng mảng [$1, $2]
 * và tương thích ngược với kết quả .recordset
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const executeQuery = async <T extends QueryResultRow = any>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[] = []
): Promise<ExecuteResult<T>> => {
    const p = await getPool();

    // Hỗ trợ truyền mảng giá trị thông thường [$1, $2]
    // hoặc mảng object cũ [{ name, value }]
    let normalizedParams: any[] = [];
    if (params.length > 0) {
        if (typeof params[0] === 'object' && params[0] !== null && 'value' in params[0]) {
            normalizedParams = params.map((item) => item.value);
        } else {
            normalizedParams = params;
        }
    }

    const result = await p.query<T>(query, normalizedParams);

    return {
        rows: result.rows,
        recordset: result.rows,
        rowCount: result.rowCount,
    };
};

/**
 * Khởi tạo cơ sở dữ liệu (tạo bảng và nạp dữ liệu ban đầu)
 */
export const initDb = async () => {
    try {
        const p = await getPool();

        // Đọc script khởi tạo PostgreSQL hoặc dùng schema tích hợp sẵn
        const possiblePaths = [
            path.join(__dirname, 'init_postgres.sql'),
            path.join(process.cwd(), 'src/config/init_postgres.sql'),
            path.join(process.cwd(), 'dist/config/init_postgres.sql')
        ];

        let initScript: string = defaultPostgresSchema;
        for (const sqlPath of possiblePaths) {
            if (fs.existsSync(sqlPath)) {
                initScript = fs.readFileSync(sqlPath, 'utf8');
                break;
            }
        }

        console.log('Đang khởi tạo các bảng trong PostgreSQL...');
        await p.query(initScript);
        console.log('Khởi tạo bảng PostgreSQL hoàn tất.');

        // Tự động nạp dữ liệu gia phả ban đầu nếu bảng members đang trống
        await seedMembersIfEmpty(p);
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};
