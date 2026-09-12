import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
    const { phone, password, full_name } = req.body;
    if (!phone || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const checkExisting = await executeQuery('SELECT id FROM users WHERE phone = $1', [phone]);

    if (checkExisting.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insertResult = await executeQuery(
        `INSERT INTO users (phone, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, phone, role`,
        [phone, password_hash, full_name, 'member']
    );

    const user = insertResult.rows[0];
    const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || 'portal_hlevan_jwt_secret_2024',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    res.json({ success: true, data: { token, user } });
};

export const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    const result = await executeQuery('SELECT * FROM users WHERE phone = $1', [phone]);

    if (result.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid phone or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid phone or password' });
    }

    const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || 'portal_hlevan_jwt_secret_2024',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    delete user.password_hash;
    res.json({ success: true, data: { token, user } });
};

export const getMe = async (req: AuthRequest, res: Response) => {
    const result = await executeQuery(
        'SELECT id, phone, full_name, role, avatar_url, member_id, is_active, created_at FROM users WHERE id = $1',
        [req.user?.id]
    );
    res.json({ success: true, data: result.rows[0] });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
    const { full_name, avatar_url } = req.body;
    await executeQuery(
        'UPDATE users SET full_name = $1, avatar_url = $2 WHERE id = $3',
        [full_name, avatar_url || null, req.user?.id]
    );
    res.json({ success: true, message: 'User updated' });
};
