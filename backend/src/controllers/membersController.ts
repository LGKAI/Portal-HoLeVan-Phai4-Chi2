import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
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

export const getFamilyTree = async (req: Request, res: Response) => {
    const result = await executeQuery('SELECT * FROM members ORDER BY generation_in_branch ASC, id ASC');
    const members = result.rows;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberMap = new Map<number, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members.forEach((m: any) => memberMap.set(m.id, { ...m, children: [], spouses: [] }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roots: any[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members.forEach((m: any) => {
        const node = memberMap.get(m.id);

        // Setup spouses
        if (m.spouse_id && memberMap.has(m.spouse_id)) {
            const spouse = memberMap.get(m.spouse_id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!node.spouses.find((s: any) => s.id === spouse.id)) {
                node.spouses.push({
                    id: spouse.id,
                    full_name: spouse.full_name,
                    gender: spouse.gender,
                    avatar_url: spouse.avatar_url,
                    hometown: spouse.hometown,
                    occupation: spouse.occupation,
                    spouse_type: spouse.spouse_type,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!spouse.spouses.find((s: any) => s.id === node.id)) {
                spouse.spouses.push({
                    id: node.id,
                    full_name: node.full_name,
                    gender: node.gender,
                    avatar_url: node.avatar_url,
                    hometown: node.hometown,
                    occupation: node.occupation,
                    spouse_type: node.spouse_type,
                });
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
    let query = 'SELECT * FROM members WHERE 1=1';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    let paramIndex = 1;

    if (generation) {
        query += ` AND generation_in_branch = $${paramIndex++}`;
        params.push(parseInt(generation as string, 10));
    }
    if (gender) {
        query += ` AND gender = $${paramIndex++}`;
        params.push(gender);
    }
    if (search) {
        query += ` AND full_name ILIKE $${paramIndex++}`;
        params.push(`%${search}%`);
    }

    query += ' ORDER BY generation_in_branch ASC, id ASC';
    const result = await executeQuery(query, params);
    res.json({ success: true, data: result.rows });
};

export const getMemberById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await executeQuery('SELECT * FROM members WHERE id = $1', [parseInt(id, 10)]);
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: result.rows[0] });
};

export const createMember = async (req: Request, res: Response) => {
    const m = req.body;
    const result = await executeQuery(
        `INSERT INTO members (
            full_name, birth_name, generation_in_branch, gender, birth_date,
            death_date, is_deceased, occupation, avatar_url, bio, burial_place,
            father_id, mother_id, spouse_id, hometown, spouse_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
            m.full_name,
            m.birth_name || null,
            parseInt(m.generation_in_branch, 10) || 1,
            m.gender || 'unknown',
            m.birth_date || null,
            m.death_date || null,
            Boolean(m.is_deceased),
            m.occupation || null,
            m.avatar_url || null,
            m.bio || null,
            m.burial_place || null,
            m.father_id ? parseInt(m.father_id, 10) : null,
            m.mother_id ? parseInt(m.mother_id, 10) : null,
            m.spouse_id ? parseInt(m.spouse_id, 10) : null,
            m.hometown || null,
            m.spouse_type || null,
        ]
    );
    res.json({ success: true, data: { id: result.rows[0].id }, message: 'Member created' });
};

export const updateMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const m = req.body;
    await executeQuery(
        `UPDATE members SET 
            full_name=$1, birth_name=$2, generation_in_branch=$3, gender=$4,
            birth_date=$5, death_date=$6, is_deceased=$7, occupation=$8, 
            avatar_url=$9, bio=$10, burial_place=$11, hometown=$12, spouse_type=$13, updated_at=NOW()
         WHERE id=$14`,
        [
            m.full_name,
            m.birth_name || null,
            parseInt(m.generation_in_branch, 10) || 1,
            m.gender || 'unknown',
            m.birth_date || null,
            m.death_date || null,
            Boolean(m.is_deceased),
            m.occupation || null,
            m.avatar_url || null,
            m.bio || null,
            m.burial_place || null,
            m.hometown || null,
            m.spouse_type || null,
            parseInt(id, 10),
        ]
    );
    res.json({ success: true, message: 'Member updated' });
};

export const deleteMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await executeQuery('SELECT avatar_url FROM members WHERE id = $1', [parseInt(id, 10)]);
    if (existing.rows.length > 0) {
        removeUploadFile(existing.rows[0].avatar_url);
    }
    await executeQuery('DELETE FROM members WHERE id = $1', [parseInt(id, 10)]);
    res.json({ success: true, message: 'Member deleted' });
};

export const marryMember = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { spouse_id } = req.body;
    if (spouse_id) {
        const memberId = parseInt(id, 10);
        const targetSpouseId = parseInt(spouse_id, 10);
        await executeQuery('UPDATE members SET spouse_id = $2 WHERE id = $1', [memberId, targetSpouseId]);
        await executeQuery('UPDATE members SET spouse_id = $2 WHERE id = $1', [targetSpouseId, memberId]);
        res.json({ success: true, message: 'Marriage linked' });
    } else {
        res.status(400).json({ success: false, message: 'Spouse ID required' });
    }
};

export const addChildren = async (req: Request, res: Response) => {
    const { id } = req.params;
    const m = req.body;
    const parent = await executeQuery('SELECT gender FROM members WHERE id = $1', [parseInt(id, 10)]);
    if (parent.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const isFather = parent.rows[0].gender === 'male';
    const father_id = isFather ? parseInt(id, 10) : null;
    const mother_id = !isFather ? parseInt(id, 10) : null;

    await executeQuery(
        `INSERT INTO members (full_name, generation_in_branch, gender, birth_date, father_id, mother_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
            m.full_name,
            parseInt(m.generation_in_branch, 10) || 1,
            m.gender || 'unknown',
            m.birth_date || null,
            father_id,
            mother_id,
        ]
    );
    res.json({ success: true, message: 'Child added' });
};

export const uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { id } = req.params;
    const memberId = parseInt(id, 10);

    const existing = await executeQuery('SELECT avatar_url FROM members WHERE id = $1', [memberId]);
    if (existing.rows.length > 0) {
        removeUploadFile(existing.rows[0].avatar_url);
    }

    // Xử lý upload avatar (Supabase Storage nếu có hoặc lưu local)
    const avatarUrl = await processUploadedFile(req.file, 'avatars');

    await executeQuery('UPDATE members SET avatar_url = $1 WHERE id = $2', [avatarUrl, memberId]);
    res.json({ success: true, data: { avatarUrl }, message: 'Avatar updated' });
};
