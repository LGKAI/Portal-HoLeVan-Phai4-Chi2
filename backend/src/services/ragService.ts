import fs from 'fs';
import path from 'path';
import membersJsonData from '../data/members.json';

interface MemberRecord {
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
    spouse_type?: string | null;
    hometown?: string | null;
}

const members: MemberRecord[] = membersJsonData as unknown as MemberRecord[];
const idMap = new Map<number, MemberRecord>();
members.forEach(m => idMap.set(m.id, m));

// Cache cho tài liệu tri thức
let cachedOverview = '';
let cachedCalendar = '';
let cachedDetailDoc = '';

// Hàm tìm và đọc file tri thức từ các đường dẫn khả dĩ
const loadKnowledgeFile = (fileName: string): string => {
    const candidates = [
        path.join(__dirname, '../data/knowledge', fileName),
        path.join(process.cwd(), 'src/data/knowledge', fileName),
        path.join(process.cwd(), 'data/raw_documents', fileName),
        path.join(__dirname, '../../data/raw_documents', fileName),
        path.join(__dirname, '../../../data/raw_documents', fileName)
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                return fs.readFileSync(p, 'utf-8');
            } catch (err) {
                console.warn(`Không thể đọc file tại ${p}:`, err);
            }
        }
    }
    return '';
};

// Khởi tạo nạp tài liệu
const initKnowledge = () => {
    if (!cachedOverview) {
        cachedOverview = loadKnowledgeFile('tong_quan_va_thong_ke_dong_ho.md');
    }
    if (!cachedCalendar) {
        cachedCalendar = loadKnowledgeFile('lich_gio_ky_va_an_tang.md');
    }
    if (!cachedDetailDoc) {
        cachedDetailDoc = loadKnowledgeFile('gia_pha_chi_tiet_ho_le_van.md');
    }
};

/**
 * Tìm kiếm các đoạn tài liệu và thông tin thành viên phù hợp với câu hỏi
 */
export const retrieveContext = (query: string): string => {
    initKnowledge();

    const normalizedQuery = query.toLowerCase();
    const contextParts: string[] = [];

    // 1. Luôn đưa vào phần Tổng quan & Thống kê ngắn gọn (chỉ ~2-3 KB)
    if (cachedOverview) {
        contextParts.push("### TỔNG QUAN DÒNG HỌ & QUY ƯỚC TÍNH ĐỜI:\n" + cachedOverview);
    }

    // 2. Tra cứu Lịch giỗ kỵ nếu câu hỏi liên quan đến ngày giỗ, kỵ nhật, mộ phần, hoặc các tháng
    const isAskingAboutDeath = /giỗ|kỵ|mất|mộ|an táng|nghĩa trang|tháng/i.test(normalizedQuery);
    if (isAskingAboutDeath && cachedCalendar) {
        // Kiểm tra xem có hỏi cụ thể tháng nào không (vd: "tháng 8", "tháng tám", "tháng chạp", "tháng giêng")
        const monthMatch = normalizedQuery.match(/tháng\s*(\d{1,2}|giêng|hai|ba|tư|năm|sáu|bảy|tám|chín|mười|mười một|chạp)/i);
        if (monthMatch) {
            const mStr = monthMatch[1];
            // Lấy toàn bộ văn bản lịch giỗ nếu tìm thấy tháng để AI có ngữ cảnh đầy đủ
            contextParts.push("### LỊCH GIỖ KỴ TIỀN NHÂN THEO ÂM LỊCH:\n" + cachedCalendar);
        } else {
            // Đưa một phần lịch giỗ tiêu biểu vào
            contextParts.push("### LỊCH GIỖ KỴ & MỘ PHẦN TIỀN NHÂN:\n" + cachedCalendar.slice(0, 8000));
        }
    }

    // 3. Tìm kiếm thành viên cụ thể trong members.json theo tên hoặc ID
    const matchedMembers: MemberRecord[] = [];
    const queryTokens = normalizedQuery
        .replace(/[.,?!:;]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1 && !['họ', 'tên', 'cho', 'tôi', 'biết', 'về', 'ông', 'bà', 'bác', 'chú', 'cô', 'dì', 'người'].includes(t));

    for (const m of members) {
        const fullNameLower = m.full_name.toLowerCase();
        const birthNameLower = (m.birth_name || '').toLowerCase();
        
        // Trùng khớp cả cụm tên hoặc trùng khớp từ khóa chính (vd: "Khôi", "Mưu", "Tán", "Lợi", "Vịnh", "Phổ"...)
        let matchScore = 0;
        if (normalizedQuery.includes(fullNameLower)) {
            matchScore += 10;
        } else {
            for (const token of queryTokens) {
                if (token.length >= 3 && fullNameLower.includes(token)) {
                    matchScore += 2;
                }
            }
        }

        if (matchScore > 0) {
            matchedMembers.push(m);
        }
        if (matchedMembers.length >= 8) break;
    }

    // Xây dựng hồ sơ chi tiết cho các thành viên được nhắc tới
    if (matchedMembers.length > 0) {
        const memberDetails: string[] = ["### CHI TIẾT THÀNH VIÊN LIÊN QUAN TRONG GIA PHẢ:"];
        for (const m of matchedMembers) {
            const father = m.father_id && idMap.get(m.father_id) ? `${idMap.get(m.father_id)!.full_name} (Đời ${idMap.get(m.father_id)!.generation_in_branch})` : 'Không rõ';
            const mother = m.mother_id && idMap.get(m.mother_id) ? `${idMap.get(m.mother_id)!.full_name} (Đời ${idMap.get(m.mother_id)!.generation_in_branch})` : 'Không rõ';
            const spouse = m.spouse_id && idMap.get(m.spouse_id) ? `${idMap.get(m.spouse_id)!.full_name} (${m.spouse_type || 'Phối ngẫu'})` : 'Chưa ghi nhận';
            
            // Tìm con cái
            const children = members
                .filter(c => c.father_id === m.id || c.mother_id === m.id)
                .map(c => `${c.full_name} (Đời ${c.generation_in_branch})`);
            const childrenStr = children.length > 0 ? children.join(', ') : 'Không có ghi nhận (hoặc vô tự)';

            memberDetails.push(
                `- Họ tên: ${m.full_name} (ID: ${m.id})\n` +
                `  + Tên húy: ${m.birth_name || 'Không có'}\n` +
                `  + Đời thứ: Đời ${m.generation_in_branch} của Chi 2 (tương ứng Đời ${m.generation_in_branch + 8} của Phái 4)\n` +
                `  + Giới tính: ${m.gender === 'male' ? 'Nam' : m.gender === 'female' ? 'Nữ' : 'Chưa rõ'}\n` +
                `  + Tình trạng: ${m.is_deceased ? 'Đã mất' : 'Còn sống'}\n` +
                `  + Ngày sinh: ${m.birth_date || 'Không rõ'}\n` +
                `  + Ngày mất (kỵ nhật): ${m.death_date || 'Không rõ'}\n` +
                `  + Nơi an táng: ${m.burial_place || 'Không rõ'}\n` +
                `  + Cha: ${father}, Mẹ: ${mother}\n` +
                `  + Vợ/Chồng: ${spouse}\n` +
                `  + Con cái: ${childrenStr}\n` +
                `  + Ghi chú / Tiểu sử: ${m.bio || 'Không có ghi chú'}`
            );
        }
        contextParts.push(memberDetails.join('\n\n'));
    }

    // 4. Nếu câu hỏi về một đời cụ thể (ví dụ: "đời 4", "đời thứ 6")
    const genMatch = normalizedQuery.match(/đời\s*(thứ)?\s*(\d)/i);
    if (genMatch) {
        const genNum = parseInt(genMatch[2], 10);
        const membersInGen = members.filter(m => m.generation_in_branch === genNum);
        if (membersInGen.length > 0) {
            const listNames = membersInGen.slice(0, 30).map(m => m.full_name).join(', ');
            contextParts.push(
                `### DANH SÁCH THÀNH VIÊN ĐỜI THỨ ${genNum} CỦA CHI 2 (Tổng cộng ${membersInGen.length} người):\n` +
                listNames + (membersInGen.length > 30 ? ` ...và ${membersInGen.length - 30} người khác.` : '')
            );
        }
    }

    return contextParts.join('\n\n---\n\n');
};

/**
 * Gửi câu hỏi kèm ngữ cảnh tới Google Gemini API
 */
export const askGeminiRAG = async (message: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> => {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || !geminiKey.trim()) {
        throw new Error('Chưa cấu hình GEMINI_API_KEY trong biến môi trường');
    }

    const context = retrieveContext(message);

    const systemInstruction = `Bạn là Trợ lý Trí tuệ Nhân tạo Gia Phả của Dòng họ Lê Văn - Phái 4 - Chi 2, thôn An Lợi, xã Triệu Bình (xã Triệu Độ cũ), huyện Triệu Phong, tỉnh Quảng Trị.
Nhiệm vụ của bạn là hỗ trợ con cháu dòng họ tra cứu phả hệ, thế thứ, ngày giỗ kỵ, nơi an táng và thông tin các bậc tiền nhân.

QUY TẮC BẮT BUỘC:
1. Trả lời hoàn toàn dựa trên NGỮ CẢNH TƯ LIỆU GIA PHẢ được cung cấp. Tuyệt đối không tự suy đoán thông tin sai lệch về danh tính hay gia phả.
2. Nếu thông tin không có trong tài liệu, hãy lịch sự thông báo là gia phả dòng họ hiện chưa có ghi nhận dữ liệu này.
3. Cách xưng hô: Thân mật, tôn kính đối với bậc tiền nhân (dùng cụ, ông, bà...). Ngôn ngữ tiếng Việt thuần túy, rõ ràng, chuẩn xác.
4. Chú ý cách tính thế hệ: Đời thứ N của Chi 2 tương ứng với Đời thứ (N + 8) của toàn Phái 4 họ Lê Văn (ví dụ: Thủy tổ Lê Văn Khôi là Đời 1 Chi 2 = Đời 9 Phái 4).`;

    // Chuẩn bị lịch sử hội thoại cho Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Thêm các tin nhắn gần nhất trong lịch sử hội thoại
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-4);
        for (const item of recentHistory) {
            contents.push({
                role: item.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: item.content }]
            });
        }
    }

    // Tin nhắn hiện tại kèm ngữ cảnh
    const userPrompt = `NGỮ CẢNH TƯ LIỆU GIA PHẢ:
${context}

CÂU HỎI CỦA CON CHÁU DÒNG HỌ:
${message}`;

    contents.push({
        role: 'user',
        parts: [{ text: userPrompt }]
    });

    const apiKey = geminiKey.trim();
    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    
    let lastError: any = null;
    let reply: string | null = null;

    for (const model of modelsToTry) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents: contents,
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2048
                    }
                }),
                signal: AbortSignal.timeout(25000)
            });

            if (response.ok) {
                const data = await response.json() as any;
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    reply = text;
                    break;
                }
            } else {
                const errText = await response.text();
                lastError = new Error(`Model ${model} trả về lỗi ${response.status}: ${errText}`);
                console.warn(`[Gemini API] Thử model ${model} thất bại:`, response.status);
            }
        } catch (err: any) {
            lastError = err;
            console.warn(`[Gemini API] Lỗi với model ${model}:`, err.message);
        }
    }

    if (reply) {
        return reply;
    }

    throw lastError || new Error('Không nhận được phản hồi từ Google Gemini');
};
