import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import mssql from 'mssql';

export const getDonations = async (req: Request, res: Response) => {
    const result = await executeQuery('SELECT id, donor_name, amount, message, donated_at FROM Donations WHERE is_verified=1 ORDER BY donated_at DESC');
    res.json({ success: true, data: result.recordset });
};

export const getAdminDonations = async (req: Request, res: Response) => {
    const result = await executeQuery('SELECT id, donor_name, amount, message, donated_at, is_verified FROM Donations ORDER BY donated_at DESC');
    res.json({ success: true, data: result.recordset });
};

export const createDonation = async (req: Request, res: Response) => {
    const { donor_name, amount, message } = req.body;
    await executeQuery(
        'INSERT INTO Donations (donor_name, amount, message) VALUES (@name, @amount, @msg)',
        [
            { name: 'name', type: mssql.NVarChar, value: donor_name },
            { name: 'amount', type: mssql.Decimal(18,0), value: amount },
            { name: 'msg', type: mssql.NVarChar, value: message || null }
        ]
    );
    res.json({ success: true, message: 'Donation recorded and pending verification' });
};

export const verifyDonation = async (req: Request, res: Response) => {
    const { id } = req.params;
    await executeQuery('UPDATE Donations SET is_verified=1 WHERE id=@id', [
        { name: 'id', type: mssql.Int, value: parseInt(id) }
    ]);
    res.json({ success: true, message: 'Donation verified' });
};

export const deleteDonation = async (req: Request, res: Response) => {
    const { id } = req.params;
    await executeQuery('DELETE FROM Donations WHERE id=@id', [
        { name: 'id', type: mssql.Int, value: parseInt(id) }
    ]);
    res.json({ success: true, message: 'Donation deleted' });
};
