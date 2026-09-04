import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import mssql from 'mssql';
import { AuthRequest } from '../middleware/auth';

export const getDocuments = async (req: Request, res: Response) => {
    const result = await executeQuery('SELECT * FROM Documents ORDER BY created_at DESC');
    res.json({ success: true, data: result.recordset });
};

export const getDocumentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await executeQuery('SELECT * FROM Documents WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result.recordset[0] });
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
    const { title, description, doc_type } = req.body;
    const file_url = req.file ? `/uploads/documents/${req.file.filename}` : null;

    if (!file_url) return res.status(400).json({ success: false, message: 'File is required' });

    await executeQuery(
        `INSERT INTO Documents (title, description, file_url, doc_type, author_id) VALUES (@title, @desc, @file, @type, @author)`,
        [
            { name: 'title', type: mssql.NVarChar, value: title },
            { name: 'desc', type: mssql.NVarChar, value: description || null },
            { name: 'file', type: mssql.VarChar, value: file_url },
            { name: 'type', type: mssql.VarChar, value: doc_type || 'text' },
            { name: 'author', type: mssql.Int, value: req.user?.id }
        ]
    );
    res.json({ success: true, message: 'Document uploaded', data: { file_url } });
};

export const deleteDocument = async (req: Request, res: Response) => {
    const { id } = req.params;
    await executeQuery('DELETE FROM Documents WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    res.json({ success: true, message: 'Document deleted' });
};

export const updateDocument = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description } = req.body;
    await executeQuery(
        `UPDATE Documents SET title=COALESCE(@title, title), description=COALESCE(@desc, description) WHERE id=@id`,
        [
            { name: 'id', type: mssql.Int, value: parseInt(id) },
            { name: 'title', type: mssql.NVarChar, value: title || null },
            { name: 'desc', type: mssql.NVarChar, value: description || null }
        ]
    );
    res.json({ success: true, message: 'Document updated' });
};
