import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import mssql from 'mssql';
import { AuthRequest } from '../middleware/auth';
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
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT id, title, slug, content, thumbnail_url, category, published_at, view_count, is_published FROM News WHERE 1=1';
    const params: any[] = [];
    if (category) {
        query += ' AND category=@cat';
        params.push({ name: 'cat', type: mssql.VarChar, value: category });
    }
    query += ' ORDER BY published_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    params.push({ name: 'offset', type: mssql.Int, value: offset });
    params.push({ name: 'limit', type: mssql.Int, value: Number(limit) });

    const result = await executeQuery(query, params);
    res.json({ success: true, data: result.recordset });
};

export const getNewsBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    await executeQuery('UPDATE News SET view_count = view_count + 1 WHERE slug=@slug', [
        { name: 'slug', type: mssql.VarChar, value: slug }
    ]);
    const result = await executeQuery('SELECT * FROM News WHERE slug=@slug', [
        { name: 'slug', type: mssql.VarChar, value: slug }
    ]);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result.recordset[0] });
};

export const createNews = async (req: AuthRequest, res: Response) => {
    try {
        const { title, slug, content, category, is_published } = req.body;
        let thumbnail_url = req.body.thumbnail_url;
        if (req.file) {
            thumbnail_url = `/uploads/thumbnails/${req.file.filename}`;
        }
        
        await executeQuery(
            `INSERT INTO News (title, slug, content, thumbnail_url, category, author_id, is_published) 
             VALUES (@title, @slug, @content, @thumb, @cat, @author, @pub)`,
            [
                { name: 'title', type: mssql.NVarChar, value: title },
                { name: 'slug', type: mssql.VarChar, value: slug },
                { name: 'content', type: mssql.NVarChar, value: content },
                { name: 'thumb', type: mssql.VarChar, value: thumbnail_url || null },
                { name: 'cat', type: mssql.VarChar, value: category || 'news' },
                { name: 'author', type: mssql.Int, value: req.user?.id || null },
                { name: 'pub', type: mssql.Bit, value: (is_published === 'true' || is_published === true || is_published === 1) ? 1 : 0 }
            ]
        );
        res.json({ success: true, message: 'News created' });
    } catch (err: any) {
        console.error("Create News Error: ", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateNews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        let thumbnail_url = req.body.thumbnail_url;
        if (req.file) {
            const existing = await executeQuery('SELECT thumbnail_url FROM News WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
            if (existing.recordset.length > 0) {
                removeUploadFile(existing.recordset[0].thumbnail_url);
            }
            thumbnail_url = `/uploads/thumbnails/${req.file.filename}`;
        }
        
        await executeQuery(
            `UPDATE News SET title=COALESCE(@title, title), content=COALESCE(@content, content), thumbnail_url=COALESCE(@thumb, thumbnail_url) WHERE id=@id`,
            [
                { name: 'id', type: mssql.Int, value: parseInt(id) },
                { name: 'title', type: mssql.NVarChar, value: title || null },
                { name: 'content', type: mssql.NVarChar, value: content || null },
                { name: 'thumb', type: mssql.VarChar, value: thumbnail_url || null }
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
    const existing = await executeQuery('SELECT thumbnail_url FROM News WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    if (existing.recordset.length > 0) {
        removeUploadFile(existing.recordset[0].thumbnail_url);
    }
    await executeQuery('DELETE FROM News WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    res.json({ success: true, message: 'News deleted' });
};
