import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/db';
import mssql from 'mssql';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
    const { phone, password, full_name } = req.body;
    if (!phone || !password || !full_name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await executeQuery('SELECT * FROM Users WHERE phone = @phone', [
        { name: 'phone', type: mssql.VarChar, value: phone }
    ]);

    if (result.recordset.length > 0) {
        return res.status(400).json({ success: false, message: 'Phone already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await executeQuery(
        'INSERT INTO Users (phone, password_hash, full_name, role) VALUES (@phone, @hash, @name, @role)',
        [
            { name: 'phone', type: mssql.VarChar, value: phone },
            { name: 'hash', type: mssql.VarChar, value: password_hash },
            { name: 'name', type: mssql.NVarChar, value: full_name },
            { name: 'role', type: mssql.VarChar, value: 'member' }
        ]
    );

    const newUser = await executeQuery('SELECT id, phone, role FROM Users WHERE phone = @phone', [
        { name: 'phone', type: mssql.VarChar, value: phone }
    ]);

    const user = newUser.recordset[0];
    const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        process.env.JWT_SECRET || 'portal_hlevan_jwt_secret_2024',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as number }
    );

    res.json({ success: true, data: { token } });
};

export const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    
    const result = await executeQuery('SELECT * FROM Users WHERE phone = @phone', [
        { name: 'phone', type: mssql.VarChar, value: phone }
    ]);

    if (result.recordset.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid phone or password' });
    }

    const user = result.recordset[0];
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
    const result = await executeQuery('SELECT id, phone, full_name, role, avatar_url, member_id, is_active, created_at FROM Users WHERE id = @id', [
        { name: 'id', type: mssql.Int, value: req.user?.id }
    ]);
    res.json({ success: true, data: result.recordset[0] });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
    const { full_name, avatar_url } = req.body;
    await executeQuery('UPDATE Users SET full_name = @full_name, avatar_url = @avatar_url WHERE id = @id', [
        { name: 'full_name', type: mssql.NVarChar, value: full_name },
        { name: 'avatar_url', type: mssql.VarChar, value: avatar_url || null },
        { name: 'id', type: mssql.Int, value: req.user?.id }
    ]);
    res.json({ success: true, message: 'User updated' });
};
