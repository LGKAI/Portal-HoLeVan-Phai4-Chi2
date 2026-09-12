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
