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

// Helper lấy danh xưng chuẩn mực theo đời
const getHonorific = (genPhai: number, gender?: string | null, birthDateStr?: string | null, fullName?: string): string => {
    // Nếu giới tính không rõ, unknown hoặc tên là LÊ HVVD: TUYỆT ĐỐI KHÔNG GẮN DANH XƯNG (chỉ gọi họ tên)
    if (!gender || gender === 'unknown' || gender.toLowerCase().includes('không rõ') || (fullName && fullName.includes('HVVD'))) {
        return '';
    }
    const isFemale = gender === 'female';
    if (genPhai <= 13) {
        if (genPhai === 9) return isFemale ? 'Cụ bà Thủy tổ' : 'Ngài Thủy tổ';
        return isFemale ? 'Cụ bà' : gender === 'male' ? 'Cụ ông' : 'Cụ';
    } else if (genPhai === 14) {
        return isFemale ? 'Bà' : 'Ông';
    } else {
        const match = (birthDateStr || '').match(/\b(201\d|202\d)\b/);
        if (match) return isFemale ? 'Bé' : 'Cháu';
        return isFemale ? 'Chị' : 'Anh';
    }
};

// Helper tính ngày giỗ (ngày ngay trước ngày mất theo phong tục)
const getGioDate = (deathDateStr?: string | null): string => {
    if (!deathDateStr || deathDateStr.trim() === 'Không rõ' || deathDateStr.trim() === '' || deathDateStr.includes('còn sống')) {
        return 'Chưa rõ';
    }
    const match = deathDateStr.match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
    if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        if (day > 1) {
            return `${String(day - 1).padStart(2, '0')}/${String(month).padStart(2, '0')} Âm lịch`;
        } else {
            const prevMonth = month === 1 ? 12 : month - 1;
            return `29 hoặc 30/${String(prevMonth).padStart(2, '0')} Âm lịch (ngày cuối tháng ${prevMonth})`;
        }
    }
    return `Chưa rõ ngày cụ thể (ngày mất ghi nhận: ${deathDateStr.trim()})`;
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

    // 1. Luôn đưa vào phần Tổng quan & Thống kê ngắn gọn
    if (cachedOverview) {
        contextParts.push("### TỔNG QUAN DÒNG HỌ & QUY ƯỚC TÍNH ĐỜI:\n" + cachedOverview);
    }

    // 2. Tra cứu Lịch giỗ kỵ nếu câu hỏi liên quan đến ngày giỗ, kỵ nhật, mộ phần, hoặc các tháng
    const isAskingAboutDeath = /giỗ|kỵ|mất|mộ|an táng|nghĩa trang|tháng/i.test(normalizedQuery);
    if (isAskingAboutDeath && cachedCalendar) {
        const monthMatch = normalizedQuery.match(/tháng\s*(\d{1,2}|giêng|hai|ba|tư|năm|sáu|bảy|tám|chín|mười|mười một|chạp)/i);
        if (monthMatch) {
            contextParts.push("### LỊCH GIỖ KỴ TIỀN NHÂN THEO ÂM LỊCH:\n" + cachedCalendar);
        } else {
            contextParts.push("### LỊCH GIỖ KỴ & MỘ PHẦN TIỀN NHÂN:\n" + cachedCalendar.slice(0, 8000));
        }
    }

    // 3. Tìm kiếm thành viên cụ thể trong members.json theo tên, biệt danh (trong ngoặc) hoặc ID
    const scoredMembers: Array<{ score: number; member: MemberRecord }> = [];
    const stopwords = new Set(['cụ', 'ông', 'bà', 'bác', 'chú', 'cô', 'dì', 'anh', 'chị', 'em', 'cháu', 'con', 'bé', 'cho', 'hỏi', 'về', 'ngày', 'giỗ', 'mất', 'kỵ', 'mộ', 'ở', 'đâu', 'là', 'ai', 'nào', 'bao', 'nhiêu', 'thế', 'lê', 'văn', 'thị', 'chi', 'phái', 'họ', 'tại', 'thông', 'tin', 'của', 'như', 'người', 'tên']);
    const queryTokens = normalizedQuery
        .replace(/[.,?!:;]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 0 && !stopwords.has(t));

    for (const m of members) {
        const fullNameLower = m.full_name.toLowerCase();
        const birthNameLower = (m.birth_name || '').toLowerCase();
        let matchScore = 0;

        // 1. Khớp ID
        if (new RegExp(`\\bid\\s*[:=]?\\s*${m.id}\\b`).test(normalizedQuery)) {
            matchScore += 200;
        }

        // 2. Khớp Tên gọi thường / Nickname trong ngoặc đơn (VD: Chởng, Ben, Mây, Thoại, Suyền...)
        const nickMatches = fullNameLower.match(/\((.*?)\)/g) || [];
        for (const nm of nickMatches) {
            const cleanNick = nm.replace(/[()]/g, '').trim();
            if (cleanNick && cleanNick !== 'không rõ họ') {
                if (normalizedQuery.includes(cleanNick) || queryTokens.includes(cleanNick)) {
                    matchScore += 160;
                }
            }
        }

        // 3. Khớp tên húy (birth_name)
        if (birthNameLower && (normalizedQuery.includes(birthNameLower) || queryTokens.includes(birthNameLower))) {
            matchScore += 130;
        }

        // 4. Khớp họ tên chính (bỏ ngoặc)
        const mainName = fullNameLower.replace(/\(.*?\)/g, '').trim();
        const mainTokens = mainName.split(/\s+/).filter(Boolean);
        if (mainName && normalizedQuery.includes(mainName)) {
            matchScore += 100 + mainName.length;
        } else {
            const lastMainWord = mainTokens[mainTokens.length - 1] || '';
            for (const t of queryTokens) {
                if (t === lastMainWord && t.length >= 2) {
                    matchScore += 50;
                } else if (mainTokens.includes(t) && t.length >= 2) {
                    matchScore += 20;
                }
            }
        }

        // 5. Khớp Thủy tổ
        if ((normalizedQuery.includes('thủy tổ') || normalizedQuery.includes('thuỷ tổ')) && (m.id === 1005 || m.id === 1006)) {
            matchScore += 85;
        }

        if (matchScore > 0) {
            scoredMembers.push({ score: matchScore, member: m });
        }
    }

    scoredMembers.sort((a, b) => b.score - a.score);
    const topScore = scoredMembers.length > 0 ? scoredMembers[0].score : 0;
    const matchedMembers = topScore >= 80 
        ? scoredMembers.filter(s => s.score >= 80).slice(0, 3).map(s => s.member)
        : scoredMembers.slice(0, 3).map(s => s.member);

    // Xây dựng hồ sơ chi tiết cho các thành viên được nhắc tới
    if (matchedMembers.length > 0) {
        const memberDetails: string[] = ["### CHI TIẾT THÀNH VIÊN LIÊN QUAN TRONG GIA PHẢ:"];
        for (const m of matchedMembers) {
            const gen = m.generation_in_branch;
            const genPhai = gen + 8;
            const honorific = getHonorific(genPhai, m.gender, m.birth_date, m.full_name);
            const prefixHon = honorific ? `${honorific} ` : '';

            let fatherStr = 'Không rõ';
            if (m.father_id && idMap.get(m.father_id)) {
                const fMem = idMap.get(m.father_id)!;
                const fGenPhai = fMem.generation_in_branch + 8;
                const fHon = getHonorific(fGenPhai, 'male', fMem.birth_date, fMem.full_name);
                const fPrefix = fHon ? `${fHon} ` : '';
                fatherStr = `${fPrefix}${fMem.full_name} (Đời ${fGenPhai} Phái 4)`;
            }

            let motherStr = 'Không rõ';
            if (m.mother_id && idMap.get(m.mother_id)) {
                const mMem = idMap.get(m.mother_id)!;
                const mGenPhai = mMem.generation_in_branch + 8;
                const mHon = getHonorific(mGenPhai, 'female', mMem.birth_date, mMem.full_name);
                const mPrefix = mHon ? `${mHon} ` : '';
                motherStr = `${mPrefix}${mMem.full_name} (Đời ${mGenPhai} Phái 4)`;
            } else if (m.father_id && idMap.get(m.father_id)) {
                const fid = m.father_id;
                const fSpouse = members.find(c => c.spouse_id === fid || (idMap.get(fid)!.spouse_id && c.id === idMap.get(fid)!.spouse_id));
                if (fSpouse) {
                    const spGenPhai = fSpouse.generation_in_branch + 8;
                    const spHon = getHonorific(spGenPhai, 'female', fSpouse.birth_date, fSpouse.full_name);
                    const spPrefix = spHon ? `${spHon} ` : '';
                    motherStr = `${spPrefix}${fSpouse.full_name} (Chánh phối của thân phụ, Đời ${spGenPhai} Phái 4)`;
                } else {
                    motherStr = 'Chưa ghi nhận';
                }
            }

            const spouse = m.spouse_id && idMap.get(m.spouse_id) 
                ? `${idMap.get(m.spouse_id)!.full_name} (${m.spouse_type || 'Phối ngẫu'})` 
                : (() => {
                    const sp = members.find(c => c.spouse_id === m.id);
                    return sp ? `${sp.full_name} (${sp.spouse_type || 'Phối ngẫu'})` : 'Chưa ghi nhận hoặc chưa có';
                })();
            
            // Tìm con cái
            const children = members
                .filter(c => c.father_id === m.id || c.mother_id === m.id)
                .map(c => {
                    const cGenPhai = c.generation_in_branch + 8;
                    const cHon = getHonorific(cGenPhai, c.gender, c.birth_date, c.full_name);
                    const cPrefix = cHon ? `${cHon} ` : '';
                    return `${cPrefix}${c.full_name} (Đời ${c.generation_in_branch})`;
                });
            const childrenStr = children.length > 0 ? children.join(', ') : 'Không có ghi nhận con cái (hoặc Vô tự)';

            // Tìm anh chị em ruột
            const siblings = members
                .filter(s => s.id !== m.id && ((m.father_id && s.father_id === m.father_id) || (m.mother_id && s.mother_id === m.mother_id)))
                .map(s => {
                    const sGenPhai = s.generation_in_branch + 8;
                    const sHon = getHonorific(sGenPhai, s.gender, s.birth_date, s.full_name);
                    const sPrefix = sHon ? `${sHon} ` : '';
                    return `${sPrefix}${s.full_name}`;
                });
            const siblingsStr = siblings.length > 0 ? siblings.join(', ') : 'Chưa ghi nhận hoặc là con một';

            const nicks = (m.full_name.match(/\((.*?)\)/g) || [])
                .map(n => n.replace(/[()]/g, '').trim())
                .filter(n => n && n.toLowerCase() !== 'không rõ họ');
            const nickStr = nicks.length > 0 ? ` | Tên gọi thường / Biệt danh: ${nicks.join(', ')}` : '';

            const bioText = m.bio || 'Không có ghi chú thêm';
            const prohibition = genPhai >= 15 ? "TUYỆT ĐỐI KHÔNG GỌI LÀ 'CỤ' HAY 'BÀ'!" : (genPhai === 14 ? "TUYỆT ĐỐI KHÔNG GỌI LÀ 'CỤ'!" : "");

            memberDetails.push(
                `- Họ tên: ${prefixHon}${m.full_name}${nickStr}\n` +
                (honorific ? `  + DANH XƯNG BẮT BUỘC: Phải gọi là '${honorific}' (do thuộc Đời ${genPhai} Phái 4, Đời ${gen} Chi 2). ${prohibition}\n` : `  + DANH XƯNG: KHÔNG ĐƯỢC THÊM DANH XƯNG (do Giới tính Không rõ, chỉ gọi họ tên '${m.full_name}')\n`) +
                `  + Tên húy: ${m.birth_name || 'Không có'}\n` +
                `  + Đời thứ: Đời ${gen} của Chi 2 (tương ứng Đời ${genPhai} của Phái 4)\n` +
                `  + Giới tính: ${m.gender === 'male' ? 'Nam' : m.gender === 'female' ? 'Nữ' : 'Không rõ'}\n` +
                `  + Tình trạng: ${m.is_deceased ? 'Đã mất (Quy tiên)' : 'Còn sống (Hiện tiền)'}\n` +
                `  + Ngày sinh: ${m.birth_date || 'Không rõ'}\n` +
                `  + Nghề nghiệp: ${m.occupation || 'Không rõ'}\n` +
                `  + Ngày mất: ${m.death_date || (m.is_deceased ? 'Không rõ' : 'N/A (còn sống)')}\n` +
                `  + Ngày giỗ: ${m.is_deceased ? getGioDate(m.death_date) : 'N/A (còn sống)'}\n` +
                `  + Nơi an táng: ${m.burial_place || 'Không rõ'}\n` +
                `  + Thân phụ (Cha): ${fatherStr}\n` +
                `  + Thân mẫu (Mẹ): ${motherStr}\n` +
                `  + Phối ngẫu (Vợ/Chồng): ${spouse}\n` +
                `  + Con cái: ${childrenStr}\n` +
                `  + Anh chị em ruột: ${siblingsStr}\n` +
                `  + Quê quán: ${m.hometown || 'Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị'}\n` +
                `  + Tiểu sử / Ghi chú: ${bioText}`
            );

            // Nạp trích đoạn trực tiếp từ gia_pha_chi_tiet_ho_le_van.md nếu có
            if (cachedDetailDoc) {
                const escapedName = m.full_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const blockRegex = new RegExp(`(###\\s+${escapedName}[\\s\\S]*?)(?=\\n###|\\Z)`, 'i');
                const matchBlock = cachedDetailDoc.match(blockRegex);
                if (matchBlock) {
                    memberDetails.push(`[TRÍCH ĐOẠN GIA PHẢ CHI TIẾT CỦA ${m.full_name}]:\n` + matchBlock[1].trim());
                }
            }
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

    let rawContext = contextParts.join('\n\n---\n\n');
    // Xóa bỏ triệt để mọi mã ID khỏi ngữ cảnh truyền cho AI
    let cleanedContext = rawContext.replace(/\(ID:\s*\d+\)/g, '').replace(/\bID:\s*\d+,?\s*/g, '');
    // Xóa bỏ danh xưng trước LÊ HVVD nếu còn sót
    cleanedContext = cleanedContext.replace(/\b(?:Cụ ông|Cụ bà|Cụ|Ông|Bà|Bác|Chú|Cô|Dì|Anh|Chị|Cháu|Bé)\s+(LÊ\s+HVVD)\b/g, '$1');

    return cleanedContext;
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

    const systemInstruction = `Bạn là Trợ lý Trí tuệ Nhân tạo tra cứu gia phả dòng họ Lê Văn - Phái 4 - Chi 2 (thôn An Lợi, xã Triệu Bình, tỉnh Quảng Trị).

QUY TẮC BẮT BUỘC (TUÂN THỦ TUYỆT ĐỐI 100%):

1. MẪU TRÌNH BÀY ĐẦY ĐỦ KHI HỎI VỀ MỘT THÀNH VIÊN:
   Bất kể hỏi về ai, luôn luôn trình bày chi tiết và đồng bộ theo định dạng gạch đầu dòng chuẩn mực sau (TUYỆT ĐỐI KHÔNG TRẢ LỜI CỤT NGỦN HOẶC VIẾT THÀNH ĐOẠN VĂN NGẮN):
   Mở đầu: "Dạ thưa quý bà con dòng họ, thông tin về [Họ và tên hoặc Danh xưng + Họ và tên] trong gia phả như sau:"
   - Họ và tên: [Họ và tên đầy đủ, kèm Biệt danh/tên gọi thường trong ngoặc nếu có]
   - Thế thứ: [Đời thứ mấy Chi 2 (Đời thứ mấy Phái 4)]
   - Giới tính: [Nam / Nữ / Không rõ]
   - Tình trạng: [Còn sống (Hiện tiền) hoặc Đã mất (Quy tiên)]
   - Năm sinh: [Ngày/tháng/năm sinh, kèm năm Âm lịch nếu có]
   - Ngày mất: [Chỉ ghi nếu ĐÃ MẤT. Nếu còn sống (Hiện tiền) thì TUYỆT ĐỐI KHÔNG ghi dòng này]
   - Ngày giỗ: [Chỉ ghi nếu ĐÃ MẤT: theo phong tục dòng họ, ngày cúng giỗ vào ngày ngay trước ngày mất (Âm lịch). Nếu còn sống thì TUYỆT ĐỐI KHÔNG ghi dòng này]
   - Nơi an táng: [Chỉ ghi nếu ĐÃ MẤT. Nếu còn sống thì TUYỆT ĐỐI KHÔNG ghi dòng này]
   - Nguyên quán: [Nguyên quán]
   - Nghề nghiệp: [Nghề nghiệp / Học vấn]
   - Quan hệ thân tộc:
     - Thân phụ (Cha): [Danh xưng + Họ tên cha đúng theo tài liệu bên dưới, tuyệt đối không chép nhầm tên người khác]
     - Thân mẫu (Mẹ): [Danh xưng + Họ tên mẹ đúng theo tài liệu bên dưới, tuyệt đối không chép nhầm tên người khác]
     - Phối ngẫu (Vợ/Chồng): [Danh xưng + Họ tên vợ/chồng nếu có, hoặc "Chưa ghi nhận hoặc chưa có"]
     - Con cái: [Số lượng và danh sách con cái nếu có, hoặc "Không có ghi nhận con cái (hoặc Vô tự)"]
     - Anh chị em ruột: [Danh sách anh chị em ruột]
   - Tiểu sử / Ghi chú: [Nội dung ghi chú nếu có, hoặc "Không có ghi chú thêm"]

2. TUYỆT ĐỐI KHÔNG HIỂN THỊ MÃ ID:
   - Người dùng không hiểu và không cần mã ID. TUYỆT ĐỐI KHÔNG ghi bất kỳ mã ID nào (như ID: 4041, ID: 8026, ID: 9058...) trong toàn bộ câu trả lời. Chỉ ghi danh xưng và họ tên!

3. DANH XƯNG CHO NGƯỜI KHÔNG RÕ GIỚI TÍNH:
   - Những người có Giới tính là "Không rõ" (thường có tên dạng LÊ HVVD):
   - BẮT BUỘC CHỈ GHI HỌ TÊN (ví dụ: "LÊ HVVD"), TUYỆT ĐỐI KHÔNG ĐƯỢC THÊM BẤT KỲ DANH XƯNG NÀO (KHÔNG thêm Anh, Chị, Ông, Bà, Cụ, Cháu, Bé) vì nếu gắn nhầm giới tính là rất thiếu tôn trọng!
   - Khi liệt kê trong danh sách cha mẹ, con cái, anh chị em ruột: cũng chỉ ghi tên họ của họ, không gắn danh xưng phía trước.

4. NGUYÊN TẮC TRUNG THỰC - CHỐNG ẢO GIÁC:
   - CHỈ ĐƯỢC PHÉP trả lời dựa trên thông tin có trong Ngữ cảnh tài liệu gia phả bên dưới.
   - NẾU TÀI LIỆU KHÔNG CÓ HOẶC GHI 'KHÔNG TÌM THẤY THÔNG TIN': Bắt buộc trả lời trung thực, lễ phép: "Dạ thưa quý bà con dòng họ, trong tài liệu gia phả hiện tại không ghi nhận thông tin về [người hoặc nội dung được hỏi]." Tuyệt đối không tự bịa đặt hay đoán mò.
   - PHÂN BIỆT RÕ RÀNG: 'Phối ngẫu' là Vợ hoặc Chồng. 'Thân mẫu' là Mẹ, 'Thân phụ' là Cha. Tuyệt đối không nhầm lẫn mẹ thành vợ, cha thành chồng.

5. QUY TẮC XƯNG HÔ THEO ĐỜI:
   - Đời 15 Phái 4 trở về sau (như anh Lê Gia Khánh, chị Lê Thị Thu Hiền...): Xưng "Anh" hoặc "Chị" (trẻ nhỏ xưng "Bé", "Cháu"). TUYỆT ĐỐI KHÔNG GỌI LÀ ÔNG HAY BÀ!
   - Đời 14 Phái 4: Xưng "Ông" hoặc "Bà" (ví dụ: ông Lê Văn Nhàn, bà Lê Thị Thu Nguyệt).
   - Đời 13 Phái 4 trở về trước: Xưng "Cụ" / "Cụ ông" / "Cụ bà" (Thủy tổ: Ngài Thủy tổ Lê Văn Khôi, Cụ bà Thủy tổ Phan Thị Mưu).
   - Khi nhắc đến cha mẹ: Luôn có từ tôn kính ("thân phụ là ông...", "thân mẫu là bà...").
   - Giữ nguyên vẹn chính tả họ tên riêng (ví dụ "Lê Văn Nhàn" dấu huyền, tuyệt đối không viết thành "Nhạn").`;

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
    let isOverloaded = false;

    for (const model of modelsToTry) {
        // Thử tối đa 2 lần cho mỗi model nếu gặp 503 (quá tải tạm thời)
        for (let attempt = 1; attempt <= 2; attempt++) {
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
                            temperature: 0.0,
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
                    if (response.status === 503 || response.status === 429) {
                        isOverloaded = true;
                        console.warn(`[Gemini API] Model ${model} quá tải tạm thời (${response.status}) lần ${attempt}. Đợi 1.5s thử lại...`);
                        await new Promise(res => setTimeout(res, 1500));
                        continue;
                    }
                    lastError = new Error(`Model ${model} trả về lỗi ${response.status}: ${errText}`);
                    console.warn(`[Gemini API] Thử model ${model} thất bại:`, response.status);
                    break; // lỗi khác 503 thì chuyển model khác
                }
            } catch (err: any) {
                lastError = err;
                console.warn(`[Gemini API] Lỗi với model ${model} lần ${attempt}:`, err.message);
                await new Promise(res => setTimeout(res, 1000));
            }
        }
        if (reply) break;
    }

    if (reply) {
        let cleanedReply = reply.replace(/\s*\(ID:\s*\d+\)/g, '').replace(/\s*ID:\s*\d+,?/g, '');
        cleanedReply = cleanedReply.replace(/\b(?:Cụ ông|Cụ bà|Cụ|Ông|Bà|Bác|Chú|Cô|Dì|Anh|Chị|Cháu|Bé)\s+(LÊ\s+HVVD)\b/g, '$1');
        return cleanedReply;
    }

    if (isOverloaded) {
        return 'Dạ, máy chủ AI của Google hiện đang bị quá tải đột xuất trong giây lát (Lỗi 503: High demand). Bạn vui lòng bấm gửi lại câu hỏi sau vài giây nhé!';
    }

    throw lastError || new Error('Không nhận được phản hồi từ Google Gemini');
};
