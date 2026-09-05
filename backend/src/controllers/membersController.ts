import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import mssql from 'mssql';
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

export const getFamilyTree = async (req: Request, res: Response) => {
    const result = await executeQuery('SELECT * FROM Members');
    const members = result.recordset;

    const memberMap = new Map<number, any>();
    members.forEach((m: any) => memberMap.set(m.id, { ...m, children: [], spouses: [] }));

    const roots: any[] = [];

    members.forEach((m: any) => {
        const node = memberMap.get(m.id);
        
        // Setup spouses
        if (m.spouse_id && memberMap.has(m.spouse_id)) {
            const spouse = memberMap.get(m.spouse_id);
            if (!node.spouses.find((s:any) => s.id === spouse.id)) {
                node.spouses.push({ id: spouse.id, full_name: spouse.full_name, gender: spouse.gender, avatar_url: spouse.avatar_url, hometown: spouse.hometown, occupation: spouse.occupation, spouse_type: spouse.spouse_type });
            }
            if (!spouse.spouses.find((s:any) => s.id === node.id)) {
                spouse.spouses.push({ id: node.id, full_name: node.full_name, gender: node.gender, avatar_url: node.avatar_url, hometown: node.hometown, occupation: node.occupation, spouse_type: node.spouse_type });
            }
        }
        
        if (m.father_id || m.mother_id) {
            const parentId = m.father_id || m.mother_id;
            const parent = memberMap.get(parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            // Determine if root: no parents. If female and has a husband in the tree, she is not a root.
            let isWife = false;
            if (m.gender === 'female' && node.spouses.length > 0) {
                // If any of her husbands has parents, she is a wife married into the family, not a root
                for (const h of node.spouses) {
                    const husband = memberMap.get(h.id);
                    if (husband && (husband.father_id || husband.mother_id || husband.gender === 'male')) {
                        isWife = true;
                        break;
                    }
                }
            }
            if (!isWife) {
                roots.push(node);
            }
        }
    });

    res.json({ success: true, data: roots });
};

export const getAllMembers = async (req: Request, res: Response) => {
    const { generation, gender, search } = req.query;
    let query = 'SELECT * FROM Members WHERE 1=1';
    const params: any[] = [];

    if (generation) {
        query += ' AND generation_in_branch = @gen';
        params.push({ name: 'gen', type: mssql.Int, value: parseInt(generation as string) });
    }
    if (gender) {
        query += ' AND gender = @gender';
        params.push({ name: 'gender', type: mssql.VarChar, value: gender });
    }
    if (search) {
        query += ' AND full_name LIKE @search';
        params.push({ name: 'search', type: mssql.NVarChar, value: `%${search}%` });
    }

    query += ' ORDER BY generation_in_branch ASC, id ASC';
    const result = await executeQuery(query, params);
    res.json({ success: true, data: result.recordset });
};

export const getMemberById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await executeQuery('SELECT * FROM Members WHERE id = @id', [
        { name: 'id', type: mssql.Int, value: parseInt(id) }
    ]);
    if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: result.recordset[0] });
};

export const createMember = async (req: Request, res: Response) => {
    const m = req.body;
    const result = await executeQuery(
        `INSERT INTO Members (full_name, birth_name, generation_in_branch, gender, birth_date, death_date, is_deceased, occupation, avatar_url, bio, burial_place, father_id, mother_id, spouse_id, hometown, spouse_type)
         OUTPUT INSERTED.id
         VALUES (@full_name, @birth_name, @gen, @gender, @bdate, @ddate, @is_deceased, @occ, @avatar, @bio, @burial, @fid, @mid, @sid, @ht, @stype)`,
        [
            { name: 'full_name', type: mssql.NVarChar, value: m.full_name },
            { name: 'birth_name', type: mssql.NVarChar, value: m.birth_name || null },
            { name: 'gen', type: mssql.Int, value: m.generation_in_branch },
            { name: 'gender', type: mssql.VarChar, value: m.gender },
            { name: 'bdate', type: mssql.NVarChar, value: m.birth_date || null },
            { name: 'ddate', type: mssql.NVarChar, value: m.death_date || null },
            { name: 'is_deceased', type: mssql.Bit, value: m.is_deceased ? 1 : 0 },
            { name: 'occ', type: mssql.NVarChar, value: m.occupation || null },
            { name: 'avatar', type: mssql.VarChar, value: m.avatar_url || null },
            { name: 'bio', type: mssql.NVarChar, value: m.bio || null },
            { name: 'burial', type: mssql.NVarChar, value: m.burial_place || null },
            { name: 'fid', type: mssql.Int, value: m.father_id || null },
            { name: 'mid', type: mssql.Int, value: m.mother_id || null },
            { name: 'sid', type: mssql.Int, value: m.spouse_id || null },
            { name: 'ht', type: mssql.NVarChar, value: m.hometown || null },
            { name: 'stype', type: mssql.NVarChar, value: m.spouse_type || null }
        ]
    );
    res.json({ success: true, data: { id: result.recordset[0].id }, message: 'Member created' });
};

export const updateMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const m = req.body;
    await executeQuery(
        `UPDATE Members SET 
            full_name=@full_name, birth_name=@birth_name, generation_in_branch=@gen, gender=@gender,
            birth_date=@bdate, death_date=@ddate, is_deceased=@is_deceased, occupation=@occ, 
            avatar_url=@avatar, bio=@bio, burial_place=@burial, hometown=@ht, spouse_type=@stype, updated_at=GETDATE()
         WHERE id=@id`,
        [
            { name: 'id', type: mssql.Int, value: parseInt(id) },
            { name: 'full_name', type: mssql.NVarChar, value: m.full_name },
            { name: 'birth_name', type: mssql.NVarChar, value: m.birth_name || null },
            { name: 'gen', type: mssql.Int, value: m.generation_in_branch },
            { name: 'gender', type: mssql.VarChar, value: m.gender },
            { name: 'bdate', type: mssql.NVarChar, value: m.birth_date || null },
            { name: 'ddate', type: mssql.NVarChar, value: m.death_date || null },
            { name: 'is_deceased', type: mssql.Bit, value: m.is_deceased ? 1 : 0 },
            { name: 'occ', type: mssql.NVarChar, value: m.occupation || null },
            { name: 'avatar', type: mssql.VarChar, value: m.avatar_url || null },
            { name: 'bio', type: mssql.NVarChar, value: m.bio || null },
            { name: 'burial', type: mssql.NVarChar, value: m.burial_place || null },
            { name: 'ht', type: mssql.NVarChar, value: m.hometown || null },
            { name: 'stype', type: mssql.NVarChar, value: m.spouse_type || null }
        ]
    );
    res.json({ success: true, message: 'Member updated' });
};

export const deleteMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await executeQuery('SELECT avatar_url FROM Members WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    if (existing.recordset.length > 0) {
        removeUploadFile(existing.recordset[0].avatar_url);
    }
    await executeQuery('DELETE FROM Members WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    res.json({ success: true, message: 'Member deleted' });
};

export const marryMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { spouse_id } = req.body;
    if (spouse_id) {
        await executeQuery('UPDATE Members SET spouse_id=@sid WHERE id=@id; UPDATE Members SET spouse_id=@id WHERE id=@sid;', [
            { name: 'id', type: mssql.Int, value: parseInt(id) },
            { name: 'sid', type: mssql.Int, value: parseInt(spouse_id) }
        ]);
        res.json({ success: true, message: 'Marriage linked' });
    } else {
        res.status(400).json({ success: false, message: 'Spouse ID required' });
    }
};

export const addChildren = async (req: Request, res: Response) => {
    const { id } = req.params;
    const m = req.body;
    const parent = await executeQuery('SELECT gender FROM Members WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    if (parent.recordset.length === 0) return res.status(404).json({ success: false, message: 'Parent not found' });
    
    const isFather = parent.recordset[0].gender === 'male';
    const father_id = isFather ? parseInt(id) : null;
    const mother_id = !isFather ? parseInt(id) : null;

    await executeQuery(
        `INSERT INTO Members (full_name, generation_in_branch, gender, birth_date, father_id, mother_id)
         VALUES (@full_name, @gen, @gender, @bdate, @fid, @mid)`,
        [
            { name: 'full_name', type: mssql.NVarChar, value: m.full_name },
            { name: 'gen', type: mssql.Int, value: m.generation_in_branch },
            { name: 'gender', type: mssql.VarChar, value: m.gender },
            { name: 'bdate', type: mssql.NVarChar, value: m.birth_date || null },
            { name: 'fid', type: mssql.Int, value: father_id },
            { name: 'mid', type: mssql.Int, value: mother_id }
        ]
    );
    res.json({ success: true, message: 'Child added' });
};

export const uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { id } = req.params;
    const existing = await executeQuery('SELECT avatar_url FROM Members WHERE id=@id', [{ name: 'id', type: mssql.Int, value: parseInt(id) }]);
    if (existing.recordset.length > 0) {
        removeUploadFile(existing.recordset[0].avatar_url);
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await executeQuery('UPDATE Members SET avatar_url=@avatar WHERE id=@id', [
        { name: 'avatar', type: mssql.VarChar, value: avatarUrl },
        { name: 'id', type: mssql.Int, value: parseInt(id) }
    ]);
    res.json({ success: true, data: { avatarUrl }, message: 'Avatar updated' });
};
