import os
import re
import json
import logging
from typing import List, Dict, AsyncGenerator
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain.prompts import PromptTemplate
from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Bạn là Trợ lý Trí tuệ Nhân tạo tra cứu gia phả dòng họ Lê Văn - Phái 4 - Chi 2 (thôn An Lợi, xã Triệu Bình, tỉnh Quảng Trị).

Nhiệm vụ:
Hỗ trợ bà con dòng họ tra cứu thông tin chính xác, trang trọng, đầy đủ và tôn kính về các thành viên, thế thứ, quan hệ thân tộc (cha mẹ, vợ chồng, con cái, anh chị em ruột), ngày giỗ, nơi an táng dựa trên NGỮ CẢNH TÀI LIỆU GIA PHẢ được cung cấp bên dưới.

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
   - CHỈ ĐƯỢC PHÉP trả lời dựa trên thông tin có trong [Ngữ cảnh tài liệu gia phả] bên dưới.
   - TUYỆT ĐỐI KHÔNG tự bịa đặt, suy diễn hoặc thay thế họ tên cha mẹ, con cái, anh chị em của người được hỏi bằng tên của người khác. Hãy nhìn kỹ mục "Thân phụ (Cha)" và "Thân mẫu (Mẹ)" trong khối thông tin của người đó trong Ngữ cảnh tài liệu để chép chính xác họ tên.
   - NẾU TÀI LIỆU KHÔNG CÓ HOẶC GHI 'KHÔNG TÌM THẤY THÔNG TIN': Bắt buộc trả lời trung thực, lễ phép: "Dạ thưa quý bà con dòng họ, trong tài liệu gia phả hiện tại không ghi nhận thông tin về [người hoặc nội dung được hỏi]." Tuyệt đối không tự bịa đặt hay đoán mò.
   - PHÂN BIỆT RÕ RÀNG: 'Phối ngẫu' là Vợ hoặc Chồng. 'Thân mẫu' là Mẹ, 'Thân phụ' là Cha. Tuyệt đối không nhầm lẫn mẹ thành vợ, cha thành chồng.

5. QUY TẮC XƯNG HÔ THEO ĐỜI:
   - Đời 15 Phái 4 trở về sau (Đời 7 và 8 Chi 2): Xưng "Anh" hoặc "Chị" (trẻ nhỏ xưng "Bé", "Cháu"). TUYỆT ĐỐI KHÔNG GỌI LÀ ÔNG HAY BÀ!
   - Đời 14 Phái 4 (Đời 6 Chi 2): Xưng "Ông" hoặc "Bà".
   - Đời 13 Phái 4 trở về trước: Xưng "Cụ" / "Cụ ông" / "Cụ bà" (Thủy tổ: Ngài Thủy tổ Lê Văn Khôi, Cụ bà Thủy tổ Phan Thị Mưu).
   - Khi nhắc đến cha mẹ: Luôn có từ tôn kính ("thân phụ là ông/anh...", "thân mẫu là bà/chị...").
   - Giữ nguyên vẹn chính tả họ tên riêng đúng theo ngữ cảnh.

Ngữ cảnh tài liệu gia phả:
{context}

Lịch sử trò chuyện gần đây:
{history}

Câu hỏi của bà con dòng họ: {question}
Trả lời:"""


class RAGPipeline:
    def __init__(self):
        use_gemini = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())
        self.use_gemini = use_gemini

        if use_gemini:
            logger.info(f"Khởi tạo RAG Pipeline với Cloud LLM: Google Gemini ({settings.GEMINI_MODEL})")
            from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.GEMINI_API_KEY
            )
            self.llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.0
            )
        else:
            logger.info(f"Khởi tạo RAG Pipeline với Local Ollama ({settings.OLLAMA_LLM_MODEL}) - temperature=0.0")
            from langchain_community.embeddings import OllamaEmbeddings
            from langchain_community.llms import Ollama
            self.embeddings = OllamaEmbeddings(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_EMBED_MODEL
            )
            self.llm = Ollama(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.OLLAMA_LLM_MODEL,
                timeout=120,
                temperature=0.0
            )

        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings
        )
        self.prompt = PromptTemplate(
            template=SYSTEM_PROMPT,
            input_variables=["context", "history", "question"]
        )

        # Nạp các file markdown thô
        self.cached_overview = self._read_raw_doc("tong_quan_va_thong_ke_dong_ho.md")
        self.cached_calendar = self._read_raw_doc("lich_gio_ky_va_an_tang.md")
        self.cached_detail = self._read_raw_doc("gia_pha_chi_tiet_ho_le_van.md")

        # Xây dựng chỉ mục tìm kiếm chuyên sâu
        self.member_index: Dict[int, Dict] = {}
        self.members_list: List[Dict] = []
        self._build_member_index()

    def _read_raw_doc(self, filename: str) -> str:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(settings.RAW_DOCS_DIR, filename),
            os.path.join(base_dir, "data", "raw_documents", filename),
            os.path.join(base_dir, "data", filename),
            f"/app/data/raw_documents/{filename}",
            f"/app/data/{filename}"
        ]
        for p in candidates:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        content = f.read()
                        if content:
                            return content
                except Exception as e:
                    logger.warning(f"Lỗi khi đọc file tài liệu {p}: {e}")
        return ""

    def _build_member_index(self):
        """Phân tích toàn bộ 313 khối thành viên từ gia_pha_chi_tiet_ho_le_van.md thành chỉ mục tra cứu tốc độ cao"""
        if not self.cached_detail:
            logger.warning("Không có dữ liệu gia_pha_chi_tiet_ho_le_van.md để lập chỉ mục.")
            return

        blocks = re.findall(r'(###\s+([^\n]+?)\s*\(ID:\s*(\d+)\)[\s\S]*?)(?=\n###|\Z)', self.cached_detail)
        for raw, name, id_str in blocks:
            mid = int(id_str)
            fn = name.strip()
            clean_fn = re.sub(r'\(.*?\)', '', fn).strip()
            words = clean_fn.split()
            last_word = words[-1] if words else ''

            # Trích xuất quan hệ ID
            spouse_match = re.search(r'Phối ngẫu[^\n]*', raw)
            spouse_ids = [int(x) for x in re.findall(r'\(ID:\s*(\d+)', spouse_match.group(0))] if spouse_match else []
            
            children_match = re.search(r'Con cái[^\n]*', raw)
            children_ids = [int(x) for x in re.findall(r'\(ID:\s*(\d+)', children_match.group(0))] if children_match else []
            
            father_match = re.search(r'Thân phụ[^\n]*', raw)
            father_ids = [int(x) for x in re.findall(r'\(ID:\s*(\d+)', father_match.group(0))] if father_match else []
            mother_match = re.search(r'Thân mẫu[^\n]*', raw)
            mother_ids = [int(x) for x in re.findall(r'\(ID:\s*(\d+)', mother_match.group(0))] if mother_match else []

            # Trích xuất biệt danh / tên trong ngoặc đơn
            nicks = [n.strip() for n in re.findall(r'\((.*?)\)', fn) if n.strip().lower() != 'không rõ họ']

            member_data = {
                'id': mid,
                'full_name': fn,
                'clean_name': clean_fn,
                'last_word': last_word,
                'nicks': nicks,
                'raw': raw.strip(),
                'spouse_ids': spouse_ids,
                'children_ids': children_ids,
                'parent_ids': father_ids + mother_ids,
                'search_text': raw.lower()
            }
            self.member_index[mid] = member_data
            self.members_list.append(member_data)

        logger.info(f"Đã lập chỉ mục chi tiết cho {len(self.member_index)} thành viên dòng họ.")

    def find_matched_members(self, query: str) -> List[Dict]:
        """Tìm kiếm thành viên dựa trên ID, tên đầy đủ, tên gọi thân mật hoặc danh xưng + tên"""
        q = query.lower()
        q_norm = re.sub(r'[^\w\s]', ' ', q)
        q_words = q_norm.split()

        # 1. Khớp theo ID cụ thể
        id_matches = re.findall(r'\bid\s*[:=]?\s*(\d+)\b', q)
        if id_matches:
            req_id = int(id_matches[0])
            if req_id in self.member_index:
                return [self.member_index[req_id]]

        scored = []
        for m in self.members_list:
            score = 0
            cn_lower = m['clean_name'].lower()
            lw = m['last_word'].lower()

            # Khớp họ tên đầy đủ chính xác
            if cn_lower in q:
                score += 250 + len(cn_lower)

            # Khớp biệt danh trong ngoặc đơn (như Ý, Chởng, Suyền, Ben, Mây...)
            for nick in m['nicks']:
                nick_lower = nick.lower()
                if nick_lower in q_words or f"({nick_lower})" in q or nick_lower in q:
                    score += 190

            # Khớp danh xưng + tên gọi (vd: 'ông nhàn', 'anh khánh', 'cụ khôi', 'bà mưu', 'bà vận')
            if lw:
                for honorific in ['cụ', 'ông', 'bà', 'bác', 'chú', 'cô', 'dì', 'anh', 'chị', 'cháu', 'bé']:
                    if f"{honorific} {lw}" in q:
                        score += 150
                    elif f"{honorific} lê văn {lw}" in q or f"{honorific} lê thị {lw}" in q:
                        score += 220

            # Khớp Thủy tổ
            if ('thủy tổ' in q or 'thuỷ tổ' in q) and m['id'] in (1005, 1006):
                score += 160

            if score > 0:
                scored.append((score, m))

        scored.sort(key=lambda x: x[0], reverse=True)
        if scored:
            top_score = scored[0][0]
            # Trả về các thành viên có điểm cao tương đương
            return [m for s, m in scored if s >= top_score * 0.75][:3]
        return []

    def search_by_attribute_keywords(self, query: str) -> List[Dict]:
        """Tìm kiếm các thành viên theo danh hiệu, chức vụ, sự kiện, nơi an táng hoặc ghi chú đặc biệt"""
        q = query.lower()
        matched_by_kw = []

        keywords_map = {
            'liệt sĩ': ['liệt sĩ', 'liệt sỹ'],
            'hội chủ': ['hội chủ'],
            'tập đoàn trưởng': ['tập đoàn trưởng', 'tập đoàn 4', 'tập đoàn 5'],
            'pháp danh': ['pháp danh', 'niệm phật đường'],
            'vô tự': ['vô tự'],
            'hồi tôn': ['hồi tôn'],
            'song sinh': ['song sinh'],
            'lâm đồng': ['lâm đồng'],
            'cồn giữa': ['cồn giữa'],
            'lai bình': ['lai bình'],
            'đồng giám': ['đồng giám'],
            'trẹc trung': ['trẹc trung'],
            'khe sanh': ['khe sanh'],
            'lấp lổ': ['lấp lổ'],
            'triệu đại': ['triệu đại'],
            'trung yên': ['trung yên']
        }

        active_keywords = []
        for kw_key, kw_phrases in keywords_map.items():
            if any(phrase in q for phrase in kw_phrases):
                active_keywords.append(kw_key)

        if not active_keywords:
            return []

        for m in self.members_list:
            text = m['search_text']
            for kw in active_keywords:
                phrases = keywords_map[kw]
                if any(p in text for p in phrases):
                    matched_by_kw.append(m)
                    break

        return matched_by_kw[:8]

    def extract_month_calendar(self, query: str) -> str:
        """Trích xuất trích đoạn tháng cụ thể từ lich_gio_ky_va_an_tang.md"""
        if not self.cached_calendar:
            return ""

        month_patterns = [
            (1, r'tháng\s*(?:1|01|giêng)\b'),
            (2, r'tháng\s*(?:2|02|hai)\b'),
            (3, r'tháng\s*(?:3|03|ba)\b'),
            (4, r'tháng\s*(?:4|04|tư)\b'),
            (5, r'tháng\s*(?:5|05|năm)\b'),
            (6, r'tháng\s*(?:6|06|sáu)\b'),
            (7, r'tháng\s*(?:7|07|bảy)\b'),
            (8, r'tháng\s*(?:8|08|tám)\b'),
            (9, r'tháng\s*(?:9|09|chín)\b'),
            (10, r'tháng\s*(?:10|mười)\b'),
            (11, r'tháng\s*(?:11|mười một)\b'),
            (12, r'tháng\s*(?:12|chạp)\b')
        ]

        for m_num, m_regex in month_patterns:
            if re.search(m_regex, query, re.IGNORECASE):
                if m_num == 1:
                    pattern = r'(##\s+Tháng Giêng[^\n]*[\s\S]*?)(?=\n##\s+Tháng|\n##\s+Khu vực|\Z)'
                elif m_num == 12:
                    pattern = r'(##\s+Tháng Chạp[^\n]*[\s\S]*?)(?=\n##\s+Tháng|\n##\s+Khu vực|\Z)'
                else:
                    pattern = rf'(##\s+Tháng\s*{m_num}\b[^\n]*[\s\S]*?)(?=\n##\s+Tháng|\n##\s+Khu vực|\Z)'
                match = re.search(pattern, self.cached_calendar, re.IGNORECASE)
                if match:
                    return match.group(1).strip()

        return ""

    def build_hybrid_context(self, query: str) -> str:
        """Xây dựng ngữ cảnh chuẩn xác 100% từ tài liệu gia phả để chống ảo giác triệt để"""
        context_sections = []
        found_any_info = False

        # 1. Tra cứu Lịch giỗ theo tháng nếu câu hỏi nhắc đến tháng
        month_calendar = self.extract_month_calendar(query)
        if month_calendar:
            context_sections.append("### LỊCH GIỖ KỴ THEO THÁNG TRÍCH XUẤT TỪ TÀI LIỆU:\n" + month_calendar)
            found_any_info = True

        # 2. Tra cứu theo thành viên cụ thể
        matched_members = self.find_matched_members(query)
        if matched_members:
            found_any_info = True
            included_ids = set()
            member_blocks = []

            for m in matched_members:
                mid = m['id']
                if mid not in included_ids:
                    member_blocks.append(m['raw'])
                    included_ids.add(mid)

                # Nạp thêm thông tin phối ngẫu (vợ/chồng) nếu có
                for sid in m.get('spouse_ids', []):
                    if sid not in included_ids and sid in self.member_index:
                        member_blocks.append(f"[THÔNG TIN PHỐI NGẪU / VỢ/CHỒNG]:\n" + self.member_index[sid]['raw'])
                        included_ids.add(sid)

                # Nạp thêm thông tin cha mẹ nếu câu hỏi liên quan đến gia đình/cha mẹ/nguồn gốc
                is_asking_family = bool(re.search(r'cha|mẹ|ba|má|thân phụ|thân mẫu|con|vợ|chồng|gia đình|dòng|gốc', query, re.IGNORECASE))
                if is_asking_family:
                    for pid in m.get('parent_ids', []):
                        if pid not in included_ids and pid in self.member_index:
                            member_blocks.append(f"[THÔNG TIN THÂN PHỤ/MẪU]:\n" + self.member_index[pid]['raw'])
                            included_ids.add(pid)

                # Nạp thông tin tóm tắt các con nếu câu hỏi hỏi về con cái
                if re.search(r'con|con cái|mấy người con|sinh được', query, re.IGNORECASE):
                    for cid in m.get('children_ids', []):
                        if cid not in included_ids and cid in self.member_index:
                            member_blocks.append(f"[THÔNG TIN CON CÁI]:\n" + self.member_index[cid]['raw'])
                            included_ids.add(cid)

            if member_blocks:
                context_sections.append("### HỒ SƠ CHI TIẾT THÀNH VIÊN TỪ GIA PHẢ:\n" + "\n\n---\n\n".join(member_blocks))

        # 3. Tra cứu theo từ khóa danh hiệu, chức vụ, sự kiện (liệt sĩ, hội chủ, tập đoàn trưởng, nơi an táng...)
        attr_members = self.search_by_attribute_keywords(query)
        if attr_members:
            found_any_info = True
            attr_blocks = [m['raw'] for m in attr_members if m['id'] not in [x['id'] for x in matched_members]]
            if attr_blocks:
                context_sections.append("### HỒ SƠ CÁC THÀNH VIÊN KHỚP VỚI DANH HIỆU / TIỂU SỬ / NƠI AN TÁNG:\n" + "\n\n---\n\n".join(attr_blocks))

        # 4. Đính kèm Tổng quan & Thống kê nếu hỏi về lịch sử, nguồn gốc, mấy đời, bao nhiêu người, liệt sĩ, tổng quan
        is_general_query = bool(re.search(
            r'thủy tổ|thuỷ tổ|nguồn gốc|lịch sử|tổng quan|thống kê|mấy đời|bao nhiêu đời|bao nhiêu người|chi 2|phái 4|làng an lợi|liệt sĩ|liệt sỹ|nam nữ|hiện tiền|quy tiên',
            query, re.IGNORECASE
        ))
        if is_general_query and self.cached_overview:
            context_sections.append("### TỔNG QUAN & THỐNG KÊ DÒNG HỌ LÊ VĂN (CHI 2 - PHÁI 4):\n" + self.cached_overview.strip())
            found_any_info = True

        # 5. Nếu chưa có thông tin từ các bộ tìm kiếm chính xác, tìm kiếm tương đồng qua vector store
        if not matched_members and not attr_members and not month_calendar:
            try:
                vector_docs = self.vector_store.similarity_search(query, k=3)
                if vector_docs:
                    vector_content = "\n\n".join([doc.page_content for doc in vector_docs])
                    context_sections.append("### TƯ LIỆU THAM KHẢO:\n" + vector_content)
                    found_any_info = True
            except Exception as e:
                logger.warning(f"Lỗi similarity search Chroma: {e}")

        # 6. NẾU HOÀN TOÀN KHÔNG TÌM THẤY THÔNG TIN LIÊN QUAN:
        if not found_any_info or not context_sections:
            return f"KHÔNG TÌM THẤY THÔNG TIN: Trong toàn bộ tài liệu gia phả dòng họ Lê Văn (Chi 2 - Phái 4), hoàn toàn không có ghi nhận thông tin nào về đối tượng hoặc câu hỏi: \"{query}\"."

        raw_context = "\n\n========================================\n\n".join(context_sections)

        # 7. LÀM SẠCH NGỮ CẢNH: LOẠI BỎ TOÀN BỘ MÃ ID ĐỂ LLM KHÔNG BAO GIỜ HIỂN THỊ ID
        cleaned_context = re.sub(r'\(ID:\s*\d+\)', '', raw_context)
        cleaned_context = re.sub(r'\bID:\s*\d+,\s*', '', cleaned_context)
        cleaned_context = re.sub(r'\bID:\s*\d+\b', '', cleaned_context)

        # 8. LOẠI BỎ TIỀN TỐ DANH XƯNG CHO NGƯỜI KHÔNG RÕ GIỚI TÍNH (LÊ HVVD) ĐỂ ĐẢM BẢO CHỈ GỌI TÊN
        cleaned_context = re.sub(r'\b(?:Cụ ông|Cụ bà|Cụ|Ông|Bà|Bác|Chú|Cô|Dì|Anh|Chị|Cháu|Bé)\s+(LÊ\s+HVVD)\b', r'\1', cleaned_context)

        return cleaned_context

    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """Tìm kiếm tài liệu liên quan trong vector store"""
        try:
            return self.vector_store.similarity_search(query, k=k)
        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm similarity: {e}")
            return []

    def add_documents(self, docs: List[Document]):
        """Thêm tài liệu vào vector store"""
        if not docs:
            return
        self.vector_store.add_documents(docs)
        logger.info(f"Đã nạp {len(docs)} tài liệu vào vector store")

    async def query(self, message: str, history: List[Dict] = None) -> AsyncGenerator[str, None]:
        """Truy vấn RAG Pipeline và trả về kết quả dưới dạng stream"""
        try:
            context = self.build_hybrid_context(message)

            history_str = ""
            if history:
                history_str = "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in history[-5:]])

            final_prompt = self.prompt.format(
                context=context,
                history=history_str,
                question=message
            )

            if self.use_gemini:
                async for chunk in self.llm.astream(final_prompt):
                    text_chunk = getattr(chunk, 'content', str(chunk))
                    # Lọc sạch bất kỳ mã ID nào còn sót lại
                    clean_chunk = re.sub(r'\(ID:\s*\d+\)', '', text_chunk)
                    yield clean_chunk
            else:
                async for chunk in self.llm.astream(final_prompt):
                    clean_chunk = re.sub(r'\(ID:\s*\d+\)', '', chunk)
                    yield clean_chunk

        except Exception as e:
            logger.error(f"Lỗi khi query RAG: {e}")
            yield f"Dạ kính thưa quý bà con, đã có lỗi xảy ra khi xử lý câu hỏi: {str(e)}"
