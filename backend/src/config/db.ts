import mssql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const dbConfig: mssql.config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Portal@Hle2024!',
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    database: process.env.DB_NAME || 'portal_hlevan',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool: mssql.ConnectionPool;

export const getPool = async (): Promise<mssql.ConnectionPool> => {
    if (pool) return pool;
    try {
        // First connect without specifying the database to create it if needed
        const masterConfig = { ...dbConfig };
        delete masterConfig.database;
        const masterPool = await mssql.connect(masterConfig);
        
        const dbName = dbConfig.database as string;
        
        // Check if database exists, create if not
        const checkDbResult = await masterPool.request().query(`SELECT name FROM master.dbo.sysdatabases WHERE name = N'${dbName}'`);
        if (checkDbResult.recordset.length === 0) {
            console.log(`Database ${dbName} does not exist. Creating...`);
            await masterPool.request().query(`CREATE DATABASE [${dbName}]`);
            console.log(`Database ${dbName} created.`);
        }
        await masterPool.close();

        // Now connect to the target database
        pool = await mssql.connect(dbConfig);
        console.log('MSSQL Connected successfully to', dbName);
        return pool;
    } catch (err) {
        console.error('Database connection failed. Retrying in 5 seconds...', err);
        await new Promise(res => setTimeout(res, 5000));
        return getPool();
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const executeQuery = async (query: string, params: { name: string; type: any; value: any }[] = []) => {
    const connection = await getPool();
    const request = connection.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    return request.query(query);
};

export const initDb = async () => {
    try {
        const pool = await getPool();
        const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        const statements = initScript.split('GO').map(s => s.trim()).filter(s => s.length > 0);
        
        for (const statement of statements) {
            try {
                await pool.request().query(statement);
            } catch (err: any) {
                if (!err.message.includes('There is already an object named')) {
                    console.error('Error executing init script part:', err);
                }
            }
        }
        console.log('Database initialization completed.');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
};
