import { Pool } from 'pg';
import newsJsonData from '../data/news.json';

interface NewsSeed {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail_url?: string | null;
    category?: string;
    published_at?: string;
    view_count?: number;
    is_published?: boolean;
}

export const seedNewsIfEmpty = async (pool: Pool) => {
    try {
        const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM news');
        const count = countRes.rows[0]?.count || 0;

        if (count > 0) {
            console.log(`Bảng news đã có ${count} bản ghi. Bỏ qua nạp dữ liệu ban đầu.`);
            return;
        }

        console.log('Bảng news đang trống. Bắt đầu nạp dữ liệu ban đầu từ news.json...');
        const newsList: NewsSeed[] = newsJsonData as unknown as NewsSeed[];
        if (!Array.isArray(newsList) || newsList.length === 0) {
            console.log('File news.json không có dữ liệu.');
            return;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertQuery = `
                INSERT INTO news (
                    id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content;
            `;

            for (const item of newsList) {
                await client.query(insertQuery, [
                    item.id,
                    item.title,
                    item.slug,
                    item.content,
                    item.thumbnail_url || null,
                    item.category || 'event',
                    item.published_at ? new Date(item.published_at) : new Date(),
                    item.view_count || 0,
                    item.is_published !== undefined ? item.is_published : true
                ]);
            }

            // Đồng bộ lại sequence ID của PostgreSQL
            await client.query(`
                SELECT setval(
                    pg_get_serial_sequence('news', 'id'),
                    COALESCE((SELECT MAX(id) FROM news), 1) + 1,
                    false
                );
            `);

            await client.query('COMMIT');
            console.log(`Đã nạp thành công ${newsList.length} bài viết/sự kiện vào bảng news!`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Lỗi khi nạp dữ liệu news.json:', err);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Không thể kiểm tra/nạp dữ liệu news ban đầu:', err);
    }
};
