import { Pool } from 'pg';
import membersJsonData from '../data/members.json';

interface MemberSeed {
    id: number;
    full_name: string;
    birth_name?: string | null;
    generation_in_branch: number;
    gender?: string | null;
    birth_date?: string | null;
    death_date?: string | null;
    is_deceased?: boolean;
    occupation?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    burial_place?: string | null;
    father_id?: number | null;
    mother_id?: number | null;
    spouse_id?: number | null;
    hometown?: string | null;
    spouse_type?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export const seedMembersIfEmpty = async (pool: Pool) => {
    try {
        const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM members');
        const count = countRes.rows[0]?.count || 0;

        const members: MemberSeed[] = membersJsonData as unknown as MemberSeed[];
        if (!Array.isArray(members) || members.length === 0) {
            console.log('File members.json không có dữ liệu.');
            return;
        }

        if (count >= members.length) {
            console.log(`Bảng members đã có ${count} bản ghi (đầy đủ ${members.length}). Bỏ qua nạp dữ liệu.`);
            return;
        }

        console.log(`Bảng members hiện có ${count} bản ghi, đang đồng bộ ${members.length} bản ghi từ members.json...`);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Bước 1: Thêm/cập nhật tất cả thành viên với thông tin cơ bản
            const insertQuery = `
                INSERT INTO members (
                    id, full_name, birth_name, generation_in_branch, gender,
                    birth_date, death_date, is_deceased, occupation, avatar_url,
                    bio, burial_place, hometown, spouse_type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    birth_name = EXCLUDED.birth_name,
                    generation_in_branch = EXCLUDED.generation_in_branch,
                    gender = EXCLUDED.gender,
                    birth_date = EXCLUDED.birth_date,
                    death_date = EXCLUDED.death_date,
                    is_deceased = EXCLUDED.is_deceased,
                    occupation = EXCLUDED.occupation,
                    avatar_url = EXCLUDED.avatar_url,
                    bio = EXCLUDED.bio,
                    burial_place = EXCLUDED.burial_place,
                    hometown = EXCLUDED.hometown,
                    spouse_type = EXCLUDED.spouse_type;
            `;

            for (const m of members) {
                await client.query(insertQuery, [
                    m.id,
                    m.full_name,
                    m.birth_name || null,
                    m.generation_in_branch || 1,
                    m.gender || 'unknown',
                    m.birth_date || null,
                    m.death_date || null,
                    m.is_deceased ? true : false,
                    m.occupation || null,
                    m.avatar_url || null,
                    m.bio || null,
                    m.burial_place || null,
                    m.hometown || null,
                    m.spouse_type || null
                ]);
            }

            // Bước 2: Cập nhật quan hệ cha - mẹ - phối ngẫu
            const updateRelQuery = `
                UPDATE members SET
                    father_id = $2,
                    mother_id = $3,
                    spouse_id = $4
                WHERE id = $1;
            `;

            for (const m of members) {
                if (m.father_id || m.mother_id || m.spouse_id) {
                    await client.query(updateRelQuery, [
                        m.id,
                        m.father_id || null,
                        m.mother_id || null,
                        m.spouse_id || null
                    ]);
                }
            }

            // Bước 3: Đồng bộ lại sequence ID của PostgreSQL
            await client.query(`
                SELECT setval(
                    pg_get_serial_sequence('members', 'id'),
                    COALESCE((SELECT MAX(id) FROM members), 1) + 1,
                    false
                );
            `);

            await client.query('COMMIT');
            console.log(`Đã nạp thành công ${members.length} thành viên gia phả vào cơ sở dữ liệu!`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Lỗi khi nạp dữ liệu members.json:', err);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Không thể kiểm tra/nạp dữ liệu gia phả ban đầu:', err);
    }
};
