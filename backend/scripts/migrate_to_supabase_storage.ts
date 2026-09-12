import fs from 'fs';
import path from 'path';
import { StorageClient } from '@supabase/storage-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env from backend or root
if (fs.existsSync(path.join(__dirname, '../.env'))) {
    dotenv.config({ path: path.join(__dirname, '../.env') });
} else if (fs.existsSync(path.join(__dirname, '../../.env'))) {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
const databaseUrl = process.env.DATABASE_URL;

async function migrate() {
    console.log('=== BẮT ĐẦU MIGRATION ẢNH LÊN SUPABASE STORAGE ===');

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ LỖI: Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
        console.log('👉 Vui lòng truyền qua command line hoặc khai báo trong file .env:');
        console.log('   SUPABASE_URL=https://[project-ref].supabase.co');
        console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJh...');
        process.exit(1);
    }

    const storageClient = new StorageClient(`${supabaseUrl.replace(/\/$/, '')}/storage/v1`, {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
    });

    // Thư mục chứa ảnh local
    const avatarsDir = path.resolve(__dirname, '../../frontend/public/uploads/avatars');
    const thumbnailsDir = path.resolve(__dirname, '../../frontend/public/uploads/thumbnails');

    const urlMapping: Record<string, string> = {};

    // 1. Upload Avatars
    if (fs.existsSync(avatarsDir)) {
        const files = fs.readdirSync(avatarsDir).filter(f => !f.startsWith('.'));
        console.log(`\n📸 Tìm thấy ${files.length} ảnh avatar trong local...`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const localPath = path.join(avatarsDir, file);
            const fileBuffer = fs.readFileSync(localPath);
            const remotePath = `avatars/${file}`;
            const ext = path.extname(file).toLowerCase();
            const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

            process.stdout.write(`   [${i + 1}/${files.length}] Uploading ${file}... `);

            const { error } = await storageClient.from(bucketName).upload(remotePath, fileBuffer, {
                contentType,
                upsert: true
            });

            if (error) {
                console.log(`❌ Thất bại: ${error.message}`);
            } else {
                const { data: pubUrl } = storageClient.from(bucketName).getPublicUrl(remotePath);
                urlMapping[`/uploads/avatars/${file}`] = pubUrl.publicUrl;
                console.log(`✅ OK`);
            }
        }
    }

    // 2. Upload Thumbnails
    if (fs.existsSync(thumbnailsDir)) {
        const files = fs.readdirSync(thumbnailsDir).filter(f => !f.startsWith('.'));
        console.log(`\n🖼️ Tìm thấy ${files.length} ảnh thumbnail trong local...`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const localPath = path.join(thumbnailsDir, file);
            const fileBuffer = fs.readFileSync(localPath);
            const remotePath = `thumbnails/${file}`;
            const ext = path.extname(file).toLowerCase();
            const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

            process.stdout.write(`   [${i + 1}/${files.length}] Uploading ${file}... `);

            const { error } = await storageClient.from(bucketName).upload(remotePath, fileBuffer, {
                contentType,
                upsert: true
            });

            if (error) {
                console.log(`❌ Thất bại: ${error.message}`);
            } else {
                const { data: pubUrl } = storageClient.from(bucketName).getPublicUrl(remotePath);
                urlMapping[`/uploads/thumbnails/${file}`] = pubUrl.publicUrl;
                console.log(`✅ OK`);
            }
        }
    }

    // 3. Cập nhật vào members.json (Frontend & Backend)
    console.log('\n📝 Đang cập nhật đường dẫn mới vào members.json...');
    const membersFiles = [
        path.resolve(__dirname, '../../frontend/src/data/members.json'),
        path.resolve(__dirname, '../src/data/members.json'),
    ];

    for (const mf of membersFiles) {
        if (fs.existsSync(mf)) {
            const members = JSON.parse(fs.readFileSync(mf, 'utf8'));
            let updatedCount = 0;
            for (const m of members) {
                if (m.avatar_url && urlMapping[m.avatar_url]) {
                    m.avatar_url = urlMapping[m.avatar_url];
                    updatedCount++;
                }
            }
            fs.writeFileSync(mf, JSON.stringify(members, null, 2), 'utf8');
            console.log(`   Đã cập nhật ${updatedCount} bản ghi trong ${path.basename(path.dirname(mf))}/${path.basename(mf)}`);
        }
    }

    // 4. Cập nhật vào PostgreSQL nếu có DATABASE_URL
    if (databaseUrl) {
        console.log('\n🐘 Đang cập nhật URL ảnh trong PostgreSQL Database...');
        const pool = new Pool({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false }
        });

        try {
            let dbUpdatedCount = 0;
            for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
                const res = await pool.query('UPDATE members SET avatar_url = $1 WHERE avatar_url = $2', [newUrl, oldUrl]);
                dbUpdatedCount += res.rowCount || 0;
                await pool.query('UPDATE news SET thumbnail_url = $1 WHERE thumbnail_url = $2', [newUrl, oldUrl]);
            }
            console.log(`   Đã cập nhật ${dbUpdatedCount} dòng trong bảng members trên database!`);
        } catch (dbErr: any) {
            console.error('   Lỗi cập nhật database:', dbErr.message);
        } finally {
            await pool.end();
        }
    } else {
        console.log('\nℹ️ Không có DATABASE_URL cục bộ, bỏ qua bước cập nhật database trực tiếp.');
        console.log('   (Dữ liệu members.json đã được cập nhật URL Cloud để deploy lên)');
    }

    console.log('\n🎉 HOÀN TẤT MIGRATION!');
    console.log('Tất cả ảnh đã có mặt trên Supabase Storage bucket:', bucketName);
}

migrate().catch(console.error);
