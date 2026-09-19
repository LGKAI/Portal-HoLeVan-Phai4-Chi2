import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { processUploadedFile } from '../middleware/upload';
import fs from 'fs';
import path from 'path';

const removeUploadFile = (fileUrl?: string | null) => {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;
    try {
        const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
        const rel = fileUrl.replace('/uploads/', '');
        const targetPath = path.join(uploadDir, rel);
        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }
    } catch (e) {
        console.warn('Could not remove file:', fileUrl, e);
    }
};

export const getNews = async (req: Request, res: Response) => {
    const { category, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published FROM news WHERE 1=1';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(category);
    }

    query += ` ORDER BY published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const result = await executeQuery(query, params);
    res.json({ success: true, data: result.rows });
};

export const getNewsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const isNum = /^\d+$/.test(slug);
    let result;
    if (isNum) {
        const id = parseInt(slug, 10);
        await executeQuery('UPDATE news SET view_count = view_count + 1 WHERE id = $1', [id]);
        result = await executeQuery('SELECT * FROM news WHERE id = $1', [id]);
    } else {
        await executeQuery('UPDATE news SET view_count = view_count + 1 WHERE slug = $1', [slug]);
        result = await executeQuery('SELECT * FROM news WHERE slug = $1', [slug]);
    }
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, data: result.rows[0] });
};

export const createNews = async (req: AuthRequest, res: Response) => {
    try {
        const { title, slug, content, category, is_published } = req.body;
        let thumbnail_url = req.body.thumbnail_url;
        if (req.file) {
            thumbnail_url = await processUploadedFile(req.file, 'thumbnails');
        }

        const isPub = (is_published === 'true' || is_published === true || is_published === 1);

        const result = await executeQuery(
            `INSERT INTO news (title, slug, content, thumbnail_url, category, author_id, is_published) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [
                title,
                slug,
                content,
                thumbnail_url || null,
                category || 'news',
                req.user?.id || null,
                isPub
            ]
        );
        res.json({ success: true, data: { id: result.rows[0].id }, message: 'News created' });
    } catch (err: any) {
        console.error("Create News Error: ", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateNews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const newsId = parseInt(id, 10);
        if (isNaN(newsId)) {
            return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
        }

        const { title, content } = req.body;
        let thumbnail_url = req.body.thumbnail_url;

        const existing = await executeQuery('SELECT id, thumbnail_url FROM news WHERE id = $1', [newsId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
        }

        let finalThumbUrl = existing.rows[0].thumbnail_url;
        if (req.file) {
            removeUploadFile(existing.rows[0].thumbnail_url);
            finalThumbUrl = await processUploadedFile(req.file, 'thumbnails');
        } else if (thumbnail_url !== undefined) {
            finalThumbUrl = thumbnail_url || null;
        }

        const updateResult = await executeQuery(
            `UPDATE news SET 
                title = COALESCE($1, title), 
                content = COALESCE($2, content), 
                thumbnail_url = $3 
             WHERE id = $4
             RETURNING id, title, slug, content, thumbnail_url`,
            [
                title ? title.trim() : null,
                content ? content : null,
                finalThumbUrl,
                newsId
            ]
        );
        res.json({ success: true, message: 'Cập nhật bài viết thành công', data: updateResult.rows[0] });
    } catch (err: any) {
        console.error("Update News Error: ", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteNews = async (req: Request, res: Response) => {
    const { id } = req.params;
    const newsId = parseInt(id, 10);

    const existing = await executeQuery('SELECT thumbnail_url FROM news WHERE id = $1', [newsId]);
    if (existing.rows.length > 0) {
        removeUploadFile(existing.rows[0].thumbnail_url);
    }
    await executeQuery('DELETE FROM news WHERE id = $1', [newsId]);
    res.json({ success: true, message: 'News deleted' });
};

export const uploadNewsImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Chưa có file ảnh được tải lên' });
        }
        const imageUrl = await processUploadedFile(req.file, 'general');
        res.json({ success: true, url: imageUrl, message: 'Tải ảnh thành công' });
    } catch (err: any) {
        console.error("Upload News Image Error: ", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
