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
    await executeQuery('UPDATE news SET view_count = view_count + 1 WHERE slug = $1', [slug]);
    const result = await executeQuery('SELECT * FROM news WHERE slug = $1', [slug]);
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
        const { title, content } = req.body;
        let thumbnail_url = req.body.thumbnail_url;

        if (req.file) {
            const existing = await executeQuery('SELECT thumbnail_url FROM news WHERE id = $1', [newsId]);
            if (existing.rows.length > 0) {
                removeUploadFile(existing.rows[0].thumbnail_url);
            }
            thumbnail_url = await processUploadedFile(req.file, 'thumbnails');
        }

        await executeQuery(
            `UPDATE news SET 
                title = COALESCE($1, title), 
                content = COALESCE($2, content), 
                thumbnail_url = COALESCE($3, thumbnail_url) 
             WHERE id = $4`,
            [
                title || null,
                content || null,
                thumbnail_url || null,
                newsId
            ]
        );
        res.json({ success: true, message: 'News updated' });
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
