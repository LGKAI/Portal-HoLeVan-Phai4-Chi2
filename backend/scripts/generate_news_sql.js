const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/news.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let sql = '-- ====================================================\n';
sql += '-- SCRIPT ĐỒNG BỘ 5 BÀI VIẾT TỪ LOCALHOST LÊN SUPABASE\n';
sql += '-- Mở Supabase -> SQL Editor -> Dán toàn bộ script này -> Run\n';
sql += '-- ====================================================\n\n';
sql += 'BEGIN;\n\n';

for (const item of data) {
    const title = item.title.replace(/'/g, "''");
    const slug = item.slug.replace(/'/g, "''");
    const content = item.content.replace(/'/g, "''");
    const thumb = item.thumbnail_url ? `'${item.thumbnail_url.replace(/'/g, "''")}'` : 'NULL';
    const cat = item.category || 'event';
    const pubAt = item.published_at || new Date().toISOString();
    const views = item.view_count || 0;
    const isPub = item.is_published !== false;

    sql += `-- Bài viết: ${item.title}\n`;
    sql += `INSERT INTO news (id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published)\n`;
    sql += `VALUES (${item.id}, '${title}', '${slug}', '${content}', ${thumb}, '${cat}', '${pubAt}', ${views}, ${isPub})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET\n`;
    sql += `  title = EXCLUDED.title,\n`;
    sql += `  slug = EXCLUDED.slug,\n`;
    sql += `  content = EXCLUDED.content,\n`;
    sql += `  thumbnail_url = EXCLUDED.thumbnail_url,\n`;
    sql += `  category = EXCLUDED.category,\n`;
    sql += `  is_published = EXCLUDED.is_published;\n\n`;
}

sql += `-- Đồng bộ lại sequence ID của bảng news\n`;
sql += `SELECT setval(pg_get_serial_sequence('news', 'id'), COALESCE((SELECT MAX(id) FROM news), 1) + 1, false);\n\n`;
sql += `COMMIT;\n`;

const outPath = path.join(__dirname, '../sync_news_to_supabase.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Đã tạo thành công file SQL tại:', outPath);
