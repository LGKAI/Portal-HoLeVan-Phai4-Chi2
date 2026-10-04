import { Request, Response } from 'express';
import { executeQuery } from '../config/db';
import { AuthRequest } from '../middleware/auth';

function computeMemorial(death_date: string | null): { gio_date: string; month: number } {
    if (!death_date) return { gio_date: '', month: 0 };
    const match = death_date.match(/(\d{1,2})\/(\d{1,2})/);
    if (!match) {
        return {
            gio_date: 'Chưa rõ ngày tháng cụ thể',
            month: 0,
        };
    }
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    if (isNaN(day) || isNaN(month)) {
        return {
            gio_date: 'Chưa rõ ngày tháng cụ thể',
            month: 0,
        };
    }
    if (day === 1) {
        const prevMonth = month - 1 <= 0 ? 12 : month - 1;
        return {
            gio_date: `Ngày cuối Tháng ${prevMonth} Âm lịch`,
            month: prevMonth,
        };
    }
    const prevDay = day - 1;
    return {
        gio_date: `${String(prevDay).padStart(2, '0')}/${String(month).padStart(2, '0')} Âm lịch`,
        month: month,
    };
}

function parseLunarMonth(gio_date: string): number {
    if (!gio_date) return 0;
    const slashMatch = gio_date.match(/(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
        const m = parseInt(slashMatch[2], 10);
        if (m >= 1 && m <= 12) return m;
    }
    const textMatch = gio_date.match(/tháng\s*(\d{1,2})/i);
    if (textMatch) {
        const m = parseInt(textMatch[1], 10);
        if (m >= 1 && m <= 12) return m;
    }
    if (/tháng\s*giêng/i.test(gio_date)) return 1;
    if (/tháng\s*chạp/i.test(gio_date)) return 12;
    return 0;
}

function formatGioDate(input: string): string {
    const trimmed = input.trim();
    // Khớp dạng 7/1 hoặc 07/01
    const matchSimple = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (matchSimple) {
        const d = String(parseInt(matchSimple[1], 10)).padStart(2, '0');
        const m = String(parseInt(matchSimple[2], 10)).padStart(2, '0');
        return `${d}/${m} Âm lịch`;
    }
    // Khớp dạng 7/1 Âm lịch hoặc 07/01 al
    const matchAl = trimmed.match(/^(\d{1,2})\/(\d{1,2})\s*(?:âm\s*lịch|al)$/i);
    if (matchAl) {
        const d = String(parseInt(matchAl[1], 10)).padStart(2, '0');
        const m = String(parseInt(matchAl[2], 10)).padStart(2, '0');
        return `${d}/${m} Âm lịch`;
    }
    return trimmed;
}

function extractDay(gio_date: string): number {
    if (gio_date.toLowerCase().includes('ngày cuối')) return 30;
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
                m.custom_gio_date,
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
            const hasCustom = Boolean(
                row.custom_gio_date &&
                typeof row.custom_gio_date === 'string' &&
                row.custom_gio_date.trim() !== ''
            );

            let gio_date = '';
            let month = 0;
            let is_custom = false;

            if (hasCustom) {
                gio_date = row.custom_gio_date.trim();
                month = parseLunarMonth(gio_date);
                is_custom = true;
            } else {
                const memorial = computeMemorial(row.death_date);
                gio_date = memorial.gio_date;
                month = memorial.month;
                is_custom = false;
            }

            const genderDesc = row.gender === 'male' ? 'Nam' : row.gender === 'female' ? 'Nữ' : 'Không rõ';
            const genDesc = `Đời ${row.generation_in_branch} Chi 2 - Đời ${row.generation_in_branch + 8} Phái 4`;

            return {
                id: row.id,
                month: month,
                gio_date: gio_date,
                is_custom: is_custom,
                custom_gio_date: row.custom_gio_date || null,
                death_date: row.death_date,
                full_name: row.full_name,
                generation_desc: genDesc,
                father_name: row.father_name || '-',
                mother_name: row.mother_name || '-',
                gender: genderDesc,
                burial_place: (row.burial_place && row.burial_place.trim() !== '' && row.burial_place !== 'Chưa ghi nhận') ? row.burial_place : 'Không rõ',
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

/**
 * PUT /api/memorials/:id - Quản trị viên cập nhật ngày giỗ ngoại lệ (hoặc khôi phục mặc định)
 * Chỉ cho phép cập nhật cột ngày giỗ (custom_gio_date), tuyệt đối không sửa ngày mất trong gia phả.
 */
export const updateMemorial = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { gio_date } = req.body;

        const memberId = parseInt(id, 10);
        if (isNaN(memberId)) {
            return res.status(400).json({ success: false, message: 'ID thành viên không hợp lệ.' });
        }

        // Kiểm tra thành viên có tồn tại và đã qua đời hay không
        const checkSql = `SELECT id, full_name, death_date, custom_gio_date FROM members WHERE id = $1`;
        const checkRes = await executeQuery(checkSql, [memberId]);
        if (checkRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin thành viên.' });
        }

        const member = checkRes.rows[0];

        let finalCustomDate: string | null = null;
        if (gio_date && typeof gio_date === 'string' && gio_date.trim() !== '') {
            finalCustomDate = formatGioDate(gio_date);
        }

        // Cập nhật custom_gio_date vào bảng members
        const updateSql = `
            UPDATE members 
            SET custom_gio_date = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING id, full_name, death_date, custom_gio_date
        `;
        await executeQuery(updateSql, [finalCustomDate, memberId]);

        // Tính toán thông tin ngày giỗ hiệu lực sau cập nhật
        let effectiveGioDate = '';
        let effectiveMonth = 0;
        let isCustom = false;

        if (finalCustomDate) {
            effectiveGioDate = finalCustomDate;
            effectiveMonth = parseLunarMonth(finalCustomDate);
            isCustom = true;
        } else {
            const defaultMemorial = computeMemorial(member.death_date);
            effectiveGioDate = defaultMemorial.gio_date;
            effectiveMonth = defaultMemorial.month;
            isCustom = false;
        }

        return res.json({
            success: true,
            message: finalCustomDate
                ? `Đã cập nhật ngày giỗ cho ${member.full_name} thành công.`
                : `Đã khôi phục ngày giỗ cho ${member.full_name} theo quy tắc mặc định.`,
            data: {
                id: memberId,
                gio_date: effectiveGioDate,
                month: effectiveMonth,
                is_custom: isCustom,
                custom_gio_date: finalCustomDate,
            },
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Error updating memorial:', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật ngày giỗ.' });
    }
};
