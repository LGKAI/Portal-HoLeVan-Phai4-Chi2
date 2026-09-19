import { Request, Response } from 'express';
import { executeQuery } from '../config/db';

function computeMemorial(death_date: string | null): { gio_date: string; month: number } {
    if (!death_date) return { gio_date: '', month: 0 };
    const match = death_date.match(/(\d{1,2})\/(\d{1,2})/);
    if (!match) {
        return {
            gio_date: `Chưa rõ ngày cụ thể (mất ${death_date})`,
            month: 0,
        };
    }
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    if (isNaN(day) || isNaN(month)) {
        return {
            gio_date: `Chưa rõ ngày cụ thể (mất ${death_date})`,
            month: 0,
        };
    }
    if (day === 1) {
        const prevMonth = month - 1 <= 0 ? 12 : month - 1;
        return {
            gio_date: `29 hoặc 30/${String(prevMonth).padStart(2, '0')} Âm lịch (ngày cuối tháng ${prevMonth})`,
            month: prevMonth,
        };
    }
    const prevDay = day - 1;
    return {
        gio_date: `${String(prevDay).padStart(2, '0')}/${String(month).padStart(2, '0')} Âm lịch`,
        month: month,
    };
}

function extractDay(gio_date: string): number {
    const m = gio_date.match(/^(\d{1,2})\//);
    return m ? parseInt(m[1], 10) : 999;
}

export const getMemorials = async (req: Request, res: Response) => {
    try {
        const SQL = `
            SELECT 
                m.id, 
                m.full_name, 
                m.generation_in_branch, 
                m.gender,
                m.death_date, 
                m.burial_place, 
                m.bio AS notes,
                f.full_name AS father_name, 
                mo.full_name AS mother_name
            FROM members m
            LEFT JOIN members f ON f.id = m.father_id
            LEFT JOIN members mo ON mo.id = m.mother_id
            WHERE m.is_deceased = true 
              AND m.death_date IS NOT NULL 
              AND m.death_date != '' 
              AND m.death_date NOT ILIKE '%không rõ%' 
              AND m.death_date NOT ILIKE '%khong ro%'
            ORDER BY m.generation_in_branch ASC, m.id ASC
        `;
        const result = await executeQuery(SQL);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = (result.rows as any[]).map((row: any) => {
            const memorial = computeMemorial(row.death_date);
            const genderDesc = row.gender === 'male' ? 'Nam' : row.gender === 'female' ? 'Nữ' : 'Không rõ';
            const genDesc = `Đời ${row.generation_in_branch} Chi 2 - Đời ${row.generation_in_branch + 8} Phái 4`;

            return {
                id: row.id,
                month: memorial.month,
                gio_date: memorial.gio_date,
                death_date: row.death_date,
                full_name: row.full_name,
                generation_desc: genDesc,
                father_name: row.father_name || '-',
                mother_name: row.mother_name || '-',
                gender: genderDesc,
                burial_place: row.burial_place || 'Chưa ghi nhận',
                notes: row.notes || '',
            };
        });

        // Sắp xếp theo tháng (1..12 rồi đến 0), trong từng tháng sắp xếp theo ngày giỗ tăng dần
        records.sort((a, b) => {
            const mA = a.month === 0 ? 99 : a.month;
            const mB = b.month === 0 ? 99 : b.month;
            if (mA !== mB) return mA - mB;
            const dayA = extractDay(a.gio_date);
            const dayB = extractDay(b.gio_date);
            if (dayA !== dayB) return dayA - dayB;
            return a.id - b.id;
        });

        res.json({ success: true, total: records.length, data: records });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Error fetching memorials:', err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy dữ liệu lịch giỗ.' });
    }
};
