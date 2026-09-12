# 📜 Phân Hệ Trợ Lý Ảo Gia Phả (RAG Service)
### Dòng Họ Lê Văn - Phái 4 - Chi 2 (Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị)

---

## 📌 1. Giới Thiệu Tổng Quan (Introduction)

**RAG Service** là microservice AI chuyên sâu thuộc hệ thống Cổng thông tin Gia phả Họ Lê Văn - Phái 4 - Chi 2. Module này ứng dụng kiến trúc **RAG (Retrieval-Augmented Generation - Tạo sinh tăng cường bằng truy xuất dữ liệu)**, cho phép con cháu dòng họ trò chuyện, hỏi đáp bằng ngôn ngữ tự nhiên và tra cứu chính xác, tức thì về:

- **Phả hệ & Thế thứ:** Tra cứu các đời từ Đời 1 Chi 2 (tương đương Đời 9 Phái 4) đến các thế hệ con cháu Đời 8 hiện nay.
- **Ngày kỵ nhật (Lịch giỗ kỵ):** Tra cứu ngày giỗ của các bậc tiền nhân theo chuẩn Âm lịch (từ Tháng Giêng đến Tháng Chạp).
- **Mộ phần & Nơi an táng:** Tra cứu vị trí các khu nghĩa trang mồ mả tổ tiên.
- **Quan hệ thân tộc:** Thân phụ mẫu, chánh phối/kế thất, con cái, anh chị em ruột, cành nhánh phụng tự.
- **Lịch sử & Sự nghiệp:** Danh xưng, tên húy/tên tự, chức sắc, nghề nghiệp, công đức và hành trạng cuộc đời.

> [!IMPORTANT]
> **Cam kết Chống Ảo Giác (Zero Hallucination):** Dữ liệu gia phả mang tính chất lịch sử thiêng liêng. Hệ thống được lập trình với System Prompt nghiêm ngặt: **chỉ trả lời dựa trên tư liệu đã được Hội đồng gia tộc kiểm chứng**, tôn kính xưng hô (cụ, ông, bà), và tuyệt đối từ chối phỏng đoán sai sự thật nếu dữ liệu chưa ghi nhận.

---

## 🏗️ 2. Kiến Trúc Kỹ Thuật (Architecture & Tech Stack)

Phân hệ RAG được xây dựng theo mô hình dịch vụ độc lập (Microservice), giao tiếp qua giao thức HTTP RESTful và hỗ trợ cả phản hồi đồng bộ (Sync JSON) lẫn truyền phát dòng dữ liệu thời gian thực (SSE Streaming).

```mermaid
flowchart TD
    subgraph Data_Pipeline ["1. Quy Trình Chuẩn Bị Tri Thức (Knowledge Pipeline)"]
        RawDB[("backend/src/data/members.json<br/>(313 thành viên)")] --> Script["scripts/generate_rag_documents.py"]
        Script --> MD1["tong_quan_va_thong_ke_dong_ho.md"]
        Script --> MD2["lich_gio_ky_va_an_tang.md"]
        Script --> MD3["gia_pha_chi_tiet_ho_le_van.md"]
        MD1 & MD2 & MD3 --> Ingest["src/ingest.py<br/>(RecursiveCharacterTextSplitter)"]
        Ingest --> Chunking["Chia nhỏ Chunks (500 chars, overlap 50)"]
    end

    subgraph Vector_DB ["2. Cơ Sở Dữ Liệu Vector (ChromaDB)"]
        Chunking --> EmbedFunc["Embedding Model<br/>(Gemini text-embedding-004 hoặc Ollama nomic-embed-text)"]
        EmbedFunc --> ChromaDB[("ChromaDB Vector Store<br/>./data/vector_store")]
    end

    subgraph User_Query_Flow ["3. Quy Trình Xử Lý Câu Hỏi (Inference Flow)"]
        User(["Con cháu dòng họ (Client)"]) --> API["FastAPI Endpoint (/chat hoặc /chat/sync)"]
        API --> Retriever["Chroma Retriever<br/>(Similarity Search top-k=6)"]
        ChromaDB -.->|Truy xuất ngữ cảnh liên quan| Retriever
        Retriever --> PromptAssembler["Lắp ráp Prompt Template<br/>(System Instruction + Context + History + Query)"]
        PromptAssembler --> LLM_Core{"Lựa chọn LLM<br/>(Hybrid Provider)"}
        LLM_Core -->|Ưu tiên Cloud Miễn Phí| Gemini["Google Gemini API<br/>(gemini-1.5-flash)"]
        LLM_Core -->|Tùy chọn Local Offline| Ollama["Local Ollama<br/>(qwen2.5:7b)"]
        Gemini & Ollama --> StreamResp["StreamingResponse (SSE) / JSON Reply"]
        StreamResp --> User
    end
```

### Công Nghệ Nền Tảng:
- **Ngôn ngữ & Framework:** Python 3.11, [FastAPI](https://fastapi.tiangolo.com/) (Async web server), [Uvicorn](https://www.uvicorn.org/).
- **Điều phối RAG (Orchestration):** [LangChain](https://www.langchain.com/) (`langchain`, `langchain-chroma`, `langchain-community`, `langchain-google-genai`).
- **Vector Database:** [ChromaDB](https://www.trychroma.com/) (Lưu trữ nhúng vector trực tiếp trên disk, siêu nhẹ, không cần server riêng biệt).
- **Mô hình Trí tuệ Nhân tạo (LLM) hỗ trợ linh hoạt 2 chế độ:**
  1. **Cloud Mode (Khuyên Dùng):** Google Gemini 1.5 Flash + Embedding `models/text-embedding-004` (Tốc độ cao, hoàn toàn miễn phí qua Google AI Studio API).
  2. **Local Offline Mode:** Ollama chạy cục bộ mô hình ngôn ngữ `qwen2.5:7b` (tiếng Việt rất tốt) kết hợp nhúng vector `nomic-embed-text`.

---

## 📂 3. Cấu Trúc Thư Mục (Folder Structure)

```text
rag-service/
├── .env.example                 # Mẫu cấu hình biến môi trường
├── Dockerfile                   # Kịch bản đóng gói container Docker Python 3.11-slim
├── README.md                    # Tài liệu hướng dẫn kỹ thuật chi tiết của module RAG
├── requirements.txt             # Danh sách thư viện phụ thuộc Python
├── data/
│   ├── raw_documents/           # Thư mục chứa các tài liệu tri thức markdown gốc
│   │   ├── gia_pha_chi_tiet_ho_le_van.md      # Chi tiết 313 thành viên theo từng đời
│   │   ├── lich_gio_ky_va_an_tang.md          # Lịch giỗ kỵ Âm lịch & nơi an táng
│   │   └── tong_quan_va_thong_ke_dong_ho.md   # Lịch sử, nguồn gốc An Lợi, quy ước tính đời
│   └── vector_store/            # Thư mục dữ liệu Vector ChromaDB lưu trên đĩa (persist)
├── scripts/
│   └── generate_rag_documents.py# Script tự động trích xuất JSON gia phả thành tài liệu RAG Markdown
└── src/
    ├── config.py                # Quản lý cấu hình dịch vụ (Pydantic BaseSettings)
    ├── ingest.py                # Logic đọc, phân tách (chunking) và nạp vector vào Chroma
    ├── main.py                  # Điểm khởi động FastAPI server, định nghĩa các router HTTP
    ├── models.py                # Schema Pydantic dữ liệu request/response
    └── rag_pipeline.py          # Lõi RAG: Prompt template, Chroma vector store, kết nối LLM
```

---

## 🧠 4. Cơ Chế Tri Thức & Nạp Dữ Liệu (Ingestion Engine)

Hệ thống RAG sử dụng dữ liệu 313 nhân sự từ cơ sở dữ liệu gia tộc (`members.json`), sau đó chuẩn hóa thành tài liệu cấu trúc Markdown trước khi nhúng vector:

### 4.1. Sinh tài liệu tri thức (`generate_rag_documents.py`)
Khi dữ liệu gia tộc trong database được bổ sung hoặc cập nhật, script `scripts/generate_rag_documents.py` sẽ thực hiện phân tích cấu trúc cây phả hệ:
1. **Liên kết cây gia đình:** Xác định chính xác cha/mẹ, vợ/chồng, số lượng con cái và anh chị em ruột của từng thành viên.
2. **Quy ước tính thế hệ:** 
   $$\text{Đời Phái 4} = \text{Đời Chi 2} + 8$$
   *(Ví dụ: Cụ Thủy tổ Lê Văn Khôi là Đời 1 Chi 2 $\Leftrightarrow$ Đời 9 toàn Phái 4 họ Lê Văn).*
3. **Phân loại lịch giỗ Âm lịch:** Bóc tách ngày kỵ nhật từ chuỗi văn bản (ví dụ: `09/08 Âm lịch`, `12/09`, `ngày 15 tháng 7`) và sắp xếp theo 12 tháng Âm lịch từ Tháng Giêng đến Tháng Chạp.
4. **Phân vùng mộ phần:** Thống kê danh sách mộ táng tại Cồn Giữa, Cồn Cát, Ba Lăng, Cửa Bụt...

### 4.2. Kỹ thuật Phân mảnh & Nhúng Vector (`ingest.py`)
- **Text Splitter:** `RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)`.
  - Giúp mỗi đoạn văn bản giữ trọn vẹn ngữ cảnh của từng cá nhân hoặc từng nhánh gia phả.
  - Độ gối đầu (overlap) 50 ký tự đảm bảo các thông tin ranh giới giữa các câu hỏi không bị cắt đứt.
- **Tự động Nạp (Auto-ingestion):** Khi FastAPI khởi động (`lifespan` trong `src/main.py`), hệ thống kiểm tra số lượng vector trong ChromaDB. Nếu vector store đang trống (`count == 0`), dịch vụ tự động đọc toàn bộ file trong `data/raw_documents` và tiến hành nạp ngay lập tức.

---

## 🎯 5. Prompt Engineering & Bộ Quy Tắc Ứng Xử (Prompt Engineering & System Prompt)

Trọng tâm xử lý logic ngôn ngữ nằm ở `SYSTEM_PROMPT` trong `src/rag_pipeline.py`:

```text
Bạn là trợ lý AI thông thái của dòng họ Lê Văn - Phái 4 - Chi 2, thôn An Lợi, xã Triệu Bình (xã Triệu Độ cũ), huyện Triệu Phong, tỉnh Quảng Trị.
Nhiệm vụ của bạn là hỗ trợ con cháu dòng họ tra cứu thông tin chính xác về:
- Phả hệ, thế thứ, các bậc tiền nhân và hậu duệ (Đời 1 Chi 2 tương ứng Đời 9 Phái 4)
- Ngày giỗ, lễ kỵ (theo Âm lịch) hằng năm của các vị tiền nhân
- Mộ phần, các khu nghĩa trang an táng (như Cồn Giữa, Cồn Cát...)
- Lịch sử dòng họ, danh hiệu, tiểu sử, chức vụ và công trạng
- Mối quan hệ thân tộc (thân phụ mẫu, chánh phối, con cái, anh chị em ruột)

Quy tắc trả lời:
1. Dựa trên Ngữ cảnh được cung cấp bên dưới để trả lời.
2. Nếu thông tin không có trong ngữ cảnh, hãy nói rõ là gia phả hiện tại chưa ghi nhận thông tin này, không tự bịa đặt.
3. Luôn xưng hô thân mật, trang trọng và tôn kính đối với các bậc tiền nhân (dùng cụ, ông, bà...).
```

---

## 🔌 6. Chi Tiết Các Cổng Giao Tiếp (REST API Endpoints)

| Phương Thức | Endpoint | Mô Tả | Định Dạng Dữ Liệu |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra tình trạng hoạt động của service | JSON |
| `POST` | `/chat` | Chat hỏi đáp phả hệ dạng luồng truyền phát thời gian thực | Server-Sent Events (`text/event-stream`) |
| `POST` | `/chat/sync` | Chat hỏi đáp trả về kết quả JSON một lần (phù hợp Backend Proxy) | JSON |
| `GET` | `/stats` | Lấy số lượng vector tài liệu đã được index trong ChromaDB | JSON |
| `POST` | `/ingest/raw-documents` | Quét và nạp lại toàn bộ file trong thư mục `raw_documents` | JSON |
| `POST` | `/ingest/members` | Đồng bộ dữ liệu thành viên từ Backend API (`/api/members`) | JSON |
| `POST` | `/ingest` | Nạp một đoạn tài liệu tùy biến vào Vector Store | JSON |

### Chi tiết Request & Response mẫu:

#### 1. Chat Luồng Trực Tuyến (`POST /chat`):
- **Request Body:**
```json
{
  "message": "Cụ Thủy tổ họ Lê Văn Chi 2 là ai và an táng ở đâu?",
  "conversation_history": [
    {"role": "user", "content": "Xin chào trợ lý gia phả"},
    {"role": "assistant", "content": "Dạ, xin kính chào bác/anh/chị con cháu dòng tộc họ Lê Văn."}
  ]
}
```
- **Response Stream (SSE):**
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"chunk": "Kính thưa quý con cháu, "}
data: {"chunk": "Thủy tổ của Chi 2 họ Lê Văn "}
data: {"chunk": "(thuộc Đời 9 của Phái 4) là cụ "}
data: {"chunk": "Lê Văn Khôi. Cụ phối ngẫu cùng cụ bà Phan Thị Mưu..."}
data: [DONE]
```

#### 2. Chat Đồng Bộ (`POST /chat/sync`):
- **Request Body:** Tương tự như trên.
- **Response:**
```json
{
  "reply": "Kính thưa quý con cháu, Thủy tổ của Chi 2 họ Lê Văn (Đời thứ 1 của Chi 2, tương đương Đời thứ 9 của toàn Phái 4) là cụ Lê Văn Khôi. Cụ phối ngẫu cùng cụ bà Phan Thị Mưu. Mộ phần của cụ được an táng tại nghĩa trang Cồn Giữa, làng An Lợi."
}
```

#### 3. Xem Thống Kê Index (`GET /stats`):
- **Response:**
```json
{
  "documents_count": 684
}
```

---

## ⚙️ 7. Hướng Dẫn Cài Đặt & Vận Hành (How to Run)

### Yêu Cầu Hệ Thống:
- **Python:** Phiên bản 3.10 hoặc 3.11.
- **RAM:** Tối thiểu 2GB (nếu dùng Google Gemini Cloud); Tối thiểu 8GB - 16GB nếu muốn tự chạy Local Ollama trên máy.

### 7.1. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục `rag-service/` (sao chép từ `.env.example`):

```bash
cp .env.example .env
```

Nội dung `.env`:
```env
# =======================================================
# LỰA CHỌN 1: GOOGLE GEMINI API (Khuyên dùng - Nhanh, nhẹ, miễn phí)
# Đăng ký lấy API key tại: https://aistudio.google.com/
# =======================================================
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
GEMINI_MODEL=gemini-1.5-flash

# =======================================================
# LỰA CHỌN 2: LOCAL OLLAMA (Chạy offline không cần internet)
# Để trống GEMINI_API_KEY để hệ thống chuyển sang dùng Ollama
# =======================================================
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_LLM_MODEL=qwen2.5:7b
OLLAMA_EMBED_MODEL=nomic-embed-text

# =======================================================
# CẤU HÌNH HỆ THỐNG
# =======================================================
CHROMA_PERSIST_DIR=./data/vector_store
RAW_DOCS_DIR=./data/raw_documents
BACKEND_URL=http://localhost:5000
PORT=8000
```

---

### 7.2. Cách 1: Chạy trực tiếp trên máy Host (Local Python Environment)

1. **Mở terminal và di chuyển vào thư mục dịch vụ:**
   ```bash
   cd rag-service
   ```

2. **Khởi tạo môi trường ảo Python (Virtualenv):**
   ```bash
   # Trên Windows (PowerShell/CMD):
   python -m venv venv
   venv\Scripts\activate

   # Trên Linux/macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Cài đặt các thư viện phụ thuộc:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **(Tùy chọn) Sinh lại tài liệu tri thức mới nhất từ database:**
   ```bash
   python scripts/generate_rag_documents.py
   ```

5. **Khởi động server RAG FastAPI:**
   ```bash
   python src/main.py
   ```
   *Máy chủ sẽ lắng nghe tại: `http://localhost:8000` (Tài liệu Swagger UI tương tác tại: `http://localhost:8000/docs`).*

---

### 7.3. Cách 2: Triển khai bằng Docker & Docker Compose

Dịch vụ đã được cấu hình sẵn trong file `docker-compose.yml` gốc của dự án:

```bash
# Từ thư mục gốc của toàn dự án (Portal-HoLeVan-Phai4-Chi2)
docker compose up -d --build rag-service

# Theo dõi log hoạt động của dịch vụ RAG
docker compose logs -f rag-service
```

> [!NOTE]
> Khi chạy trong Docker trên Windows/macOS, biến `OLLAMA_BASE_URL` được cấu hình là `http://host.docker.internal:11434` kết hợp với cờ mạng `extra_hosts: ["host.docker.internal:host-gateway"]`, cho phép container Docker kết nối trực tiếp với ứng dụng Ollama đang chạy trên máy tính của bạn.

---

## 🧪 8. Hướng Dẫn Kiểm Thử Bằng Lệnh (Testing Guide)

Bạn có thể mở một cửa sổ Terminal khác để kiểm tra tính sẵn sàng của RAG Service bằng lệnh `curl`:

#### 1. Kiểm tra trạng thái máy chủ:
```bash
curl -X GET http://localhost:8000/health
# Kết quả mong đợi: {"status": "healthy", "service": "rag-service"}
```

#### 2. Kiểm tra số lượng văn bản trong Vector Store:
```bash
curl -X GET http://localhost:8000/stats
# Kết quả mong đợi: {"documents_count": 684}
```

#### 3. Test gửi câu hỏi phả hệ (JSON đồng bộ):
```bash
curl -X POST http://localhost:8000/chat/sync \
  -H "Content-Type: application/json" \
  -d '{"message": "Cho tôi biết thông tin về cụ Lê Văn Tán và các con của cụ?"}'
```

#### 4. Kích hoạt nạp lại tri thức thủ công:
```bash
curl -X POST http://localhost:8000/ingest/raw-documents
```

---

## 💡 9. Danh Sách Câu Hỏi Mẫu Dành Cho Người Dùng (Example Questions)

Để trải nghiệm năng lực tra cứu của chatbot, bạn có thể đặt các câu hỏi thuộc nhiều chủ đề:

### 🌟 Về Nguồn gốc & Thế thứ:
- *"Dòng họ Lê Văn Phái 4 Chi 2 có nguồn gốc ở đâu?"*
- *"Quy ước tính đời giữa Chi 2 và Phái 4 như thế nào?"*
- *"Đời thứ 3 của Chi 2 gồm những ai?"*
- *"Thủy tổ Lê Văn Khôi sinh năm nào và vợ của ngài là ai?"*

### 🕯️ Về Lịch giỗ kỵ (Kỵ nhật Âm lịch):
- *"Trong tháng 8 Âm lịch dòng họ có những ngày giỗ nào?"*
- *"Ngày giỗ của cụ Lê Văn Vịnh là ngày mấy?"*
- *"Các ngày giỗ kỵ trong tháng Giêng và tháng Chạp?"*

### 🪦 Về Mồ mả & Nơi an táng:
- *"Nghĩa trang Cồn Giữa hiện là nơi an táng của bao nhiêu vị tiền nhân?"*
- *"Mộ phần của cụ Lê Văn Lợi được an táng ở đâu?"*
- *"Có những vị tiền nhân nào được an táng tại khu Cồn Cát?"*

### 👨‍👩‍👧‍👦 Về Quan hệ Thân tộc:
- *"Ông Lê Văn Phổ là con của ai và có những người con nào?"*
- *"Cho tôi biết mối quan hệ giữa cụ Lê Văn Tán và cụ Lê Văn Lợi?"*

---

## 🛠️ 10. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi `503 RAG Pipeline chưa sẵn sàng` khi gọi `/chat`:
- **Nguyên nhân:** Khóa `GEMINI_API_KEY` bị thiếu hoặc không chính xác; hoặc Ollama cục bộ chưa được bật.
- **Khắc phục:** Kiểm tra file `.env`. Nếu dùng Gemini, hãy xác nhận API Key hoạt động tại [Google AI Studio](https://aistudio.google.com/).

### 2. Cần cập nhật dữ liệu gia phả mới sau khi thêm người trên Portal:
- **Bước 1:** Chạy script sinh lại tài liệu:
  ```bash
  python scripts/generate_rag_documents.py
  ```
- **Bước 2:** Gọi API nạp lại vào ChromaDB:
  ```bash
  curl -X POST http://localhost:8000/ingest/raw-documents
  ```
  *(Hoặc xóa thư mục `data/vector_store` và khởi động lại dịch vụ để hệ thống tự động index lại từ đầu).*

### 3. Lỗi kết nối Ollama khi chạy trong Docker:
- Đảm bảo trong cấu hình Ollama trên máy tính host có biến môi trường `OLLAMA_HOST=0.0.0.0` để cho phép kết nối từ bên ngoài mạng localhost.

---

## 🏛️ 11. Đạo Đức AI & Bản Quyền Dữ Liệu (AI Ethics & Data Copyright)

1. **Bảo mật & Tôn kính:** Dữ liệu gia phả họ Lê Văn là tài sản tinh thần vô giá của con cháu dòng tộc. Hệ thống RAG được thiết kế để giữ kín các thông tin nhạy cảm và luôn thể hiện sự trang trọng, thành kính đối với tổ tiên.
2. **Mã nguồn mở & Tích hợp:** Mã nguồn module tuân thủ nguyên tắc mô-đun hóa, dễ dàng mở rộng sang các chi phái khác hoặc tích hợp các mô hình LLM tiên tiến nhất trong tương lai.
