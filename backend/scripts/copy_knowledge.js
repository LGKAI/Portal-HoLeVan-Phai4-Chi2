const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'data', 'knowledge');
const distDir = path.join(__dirname, '..', 'dist', 'data', 'knowledge');

if (fs.existsSync(srcDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
        fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
    }
    console.log(`[Build] Đã sao chép ${files.length} tài liệu tri thức vào ${distDir}`);
} else {
    console.warn('[Build] Thư mục src/data/knowledge không tồn tại.');
}

// Sao chép các file JSON dữ liệu hạt giống (seed data)
const srcDataDir = path.join(__dirname, '..', 'src', 'data');
const distDataDir = path.join(__dirname, '..', 'dist', 'data');
if (fs.existsSync(srcDataDir)) {
    fs.mkdirSync(distDataDir, { recursive: true });
    const files = fs.readdirSync(srcDataDir);
    for (const file of files) {
        if (file.endsWith('.json')) {
            fs.copyFileSync(path.join(srcDataDir, file), path.join(distDataDir, file));
            console.log(`[Build] Đã sao chép file seed data ${file} vào ${distDataDir}`);
        }
    }
}
