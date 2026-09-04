# Portal Họ Lê Văn - Phái 4 - Chi 2

Hệ thống Cổng thông tin & Gia phả số hóa dòng họ **Lê Văn (Phái 4 - Chi 2)**. Dự án kết hợp công nghệ web hiện đại với trí tuệ nhân tạo (RAG - Retrieval Augmented Generation) nhằm bảo tồn, quản lý cây gia phả tương tác, cập nhật tin tức sự kiện dòng họ, lưu trữ tài liệu lịch sử, quản lý quỹ công đức và hỗ trợ con cháu tra cứu thông tin cội nguồn qua Trợ lý AI thông minh.

---

## 1. Kiến trúc & Công nghệ sử dụng

Hệ thống được thiết kế theo kiến trúc Microservices / Client-Server tách biệt, bao gồm 4 thành phần chính:

### Frontend (Giao diện Web)
- **Framework:** React 18, Vite 5
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (bộ icon hiện đại)
- **Quản lý State:** Zustand
- **Sơ đồ cây gia phả tương tác:** `@xyflow/react` (React Flow v12) với thuật toán phân tầng đa thê, nhánh con tự động căn chỉnh và xử lý chồng chéo
- **Cắt xén ảnh chân dung:** `react-easy-crop`
- **Định tuyến SPA:** React Router DOM v6
- **Cấu hình Cổng:** Cố định duy nhất tại cổng `:3000` (`strictPort: true`)

### Backend (API Server)
- **Framework:** Node.js, Express.js
- **Ngôn ngữ:** TypeScript
- **Database Driver:** `mssql` (kết nối Microsoft SQL Server)
- **Xác thực:** JSON Web Token (JWT) + bcryptjs mã hóa mật khẩu
- **Quản lý Upload:** Multer (xử lý tải ảnh đại diện, ảnh tin tức, tài liệu số)
- **Bảo mật & Middleware:** Helmet, CORS, Express Async Errors
- **Cổng dịch vụ:** Chạy tại cổng `:5000`

### RAG Service (Trợ lý AI Tra cứu Dòng họ)
- **Framework:** Python 3.10+, FastAPI, Uvicorn
- **Framework AI:** LangChain (LangChain Core, LangChain Community, LangChain Chroma)
- **Vector Database:** ChromaDB (lưu trữ vector embedding cục bộ)
- **Mô hình AI (Local LLM via Ollama):**
  - **LLM:** `qwen2.5:7b` (hỗ trợ tiếng Việt xuất sắc)
  - **Embedding Model:** `nomic-embed-text`
- **Cổng dịch vụ:** Chạy tại cổng `:8000`

### Cơ sở dữ liệu & Hạ tầng
- **Database:** Microsoft SQL Server 2022 Developer Edition (Collation `Vietnamese_CI_AS`)
- **Containerization:** Docker & Docker Compose
- **Web Server Production:** Nginx Alpine (Reverse Proxy & Serve static files)

---

## 2. Bảng phân bổ Cổng kết nối (Ports)

| Dịch vụ | Cổng Host | Cổng Container | Mô tả |
| :--- | :---: | :---: | :--- |
| **Frontend Web** | **`:3000`** | `80` (Docker) / `3000` (Dev) | Giao diện web người dùng & quản trị |
| **Backend API** | **`:5000`** | `5000` | Hệ thống RESTful API |
| **RAG AI Service** | **`:8000`** | `8000` | Dịch vụ AI & Vector Database ChromaDB |
| **MSSQL Database** | **`:1433`** | `1433` | Cơ sở dữ liệu quan hệ SQL Server |
| **Ollama (Host)** | **`:11434`** | Máy host | Cung cấp inference LLM & Embeddings |

> [!NOTE]
> **Về vấn đề cổng `:3000` vs `:3001`**: 
> Cấu hình Vite đã được thiết lập `strictPort: true`. Frontend sẽ **luôn luôn cố định ở cổng `:3000`**, không còn tình trạng tự ý nhảy sang `:3001` khi xảy ra xung đột. Nếu cổng `:3000` đang bị chiếm giữ (ví dụ bởi container `portal_frontend`), Vite sẽ thông báo rõ ràng để bạn dừng container thay vì chuyển cổng ngầm.

---

## 3. Cấu trúc thư mục dự án

```
Portal-HoLeVan-Phai4-Chi2/
├── .env                              # File biến môi trường thực tế
├── .env.example                      # File mẫu biến môi trường
├── .gitignore                        # Cấu hình bỏ qua file trong Git
├── docker-compose.yml                # Cấu hình khởi chạy trọn gói các dịch vụ Docker
├── README.md                         # Tài liệu hướng dẫn dự án
│
├── backend/                          # Mã nguồn Backend (Node.js/Express + TypeScript)
│   ├── src/
│   │   ├── config/                   # Cấu hình DB (db.ts) & script tạo bảng (init.sql)
│   │   ├── controllers/              # Bộ điều khiển (auth, members, news, documents, donations)
│   │   ├── middleware/               # Xác thực JWT (auth.ts), xử lý upload file (upload.ts)
│   │   ├── routes/                   # Khai báo các endpoints API
│   │   ├── types/                    # Định nghĩa TypeScript interfaces
│   │   └── server.ts                 # File khởi động chính của Backend
│   ├── .env.example                  # Mẫu biến môi trường cho Backend
│   ├── Dockerfile                    # Đóng gói container Backend
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Mã nguồn Frontend (React 18 + Vite + TypeScript)
│   ├── public/                       # Tài nguyên tĩnh (ảnh nền background.jpg, qr.jpg, favicon.ico)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                 # Modal đăng nhập (LoginModal), đăng ký (RegisterModal)
│   │   │   ├── Chatbot/              # Giao diện hộp chat trợ lý AI (ChatbotPanel)
│   │   │   ├── common/               # Component dùng chung (LoadingSpinner)
│   │   │   ├── FamilyTree/           # Hệ thống Cây gia phả (TreeCanvas, MemberNode, Edges...)
│   │   │   ├── Layout/               # Thanh điều hướng (Navbar) và chân trang (Footer)
│   │   │   └── News/                 # Thẻ hiển thị sự kiện/tin tức (NewsCard)
│   │   ├── hooks/                    # Custom hooks (useChat, useFamilyTree)
│   │   ├── pages/                    # Các trang màn hình chính (Home, Tree, News, Docs, Donate)
│   │   ├── services/                 # Kết nối gọi API backend (api, memberService, newsService...)
│   │   ├── store/                    # Quản lý state toàn cục Zustand (authStore)
│   │   ├── types/                    # Định nghĩa kiểu dữ liệu TypeScript
│   │   ├── utils/                    # Tiện ích cắt ảnh (cropImage.ts)
│   │   ├── App.tsx                   # Khởi tạo Router và bố cục chính
│   │   ├── index.css                 # CSS chung & cấu hình Tailwind
│   │   └── main.tsx                  # Điểm khởi tạo ứng dụng React
│   ├── nginx.conf                    # Cấu hình Nginx reverse proxy cho production
│   ├── Dockerfile                    # Multi-stage Dockerfile (Build React -> Nginx Alpine)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts                # Cấu hình Vite (khóa cố định port: 3000, strictPort: true)
│
└── rag-service/                      # Dịch vụ Trợ lý AI (FastAPI + LangChain + ChromaDB)
    ├── src/
    │   ├── config.py                 # Cấu hình biến môi trường RAG
    │   ├── ingest.py                 # Kịch bản đồng bộ dữ liệu gia phả vào Vector Database
    │   ├── main.py                   # FastAPI app (cung cấp API /chat, /ingest, /health)
    │   ├── models.py                 # Pydantic schemas cho dữ liệu request/response
    │   └── rag_pipeline.py           # Luồng truy xuất thông tin & sinh câu trả lời RAG
    ├── data/
    │   └── raw_documents/            # Thư mục chứa tài liệu thô phục vụ nạp vector
    ├── .env.example                  # Mẫu biến môi trường cho RAG Service
    ├── Dockerfile
    └── requirements.txt              # Danh sách thư viện Python
```

---

## 4. Yêu cầu môi trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
1. **Docker Desktop:** [Tải Docker](https://www.docker.com/) (hỗ trợ WSL2 trên Windows).
2. **Node.js:** Phiên bản 18 LTS hoặc 20 LTS (nếu muốn phát triển cục bộ).
3. **Ollama:** [Tải Ollama](https://ollama.com/) (dùng cho tính năng Trợ lý AI). Sau khi cài đặt, tải 2 mô hình sau:
   ```bash
   ollama pull qwen2.5:7b
   ollama pull nomic-embed-text
   ```

---

## 5. Hướng dẫn khởi chạy

### Bước 1: Chuẩn bị biến môi trường
Sao chép file mẫu `.env.example` thành `.env` tại thư mục gốc của dự án:
```bash
cp .env.example .env
```
*(Trên Windows PowerShell: `Copy-Item .env.example .env`)*

---

### Chế độ 1: Khởi chạy trọn gói bằng Docker Compose (Khuyên dùng)
Chế độ này sẽ khởi chạy tất cả 4 container: SQL Server, Backend, Frontend (Nginx), và RAG Service.

1. **Build và khởi động tất cả container:**
   ```bash
   docker-compose up -d --build
   ```

2. **Khởi tạo bảng dữ liệu (chỉ cần chạy lần đầu tiên):**
   ```bash
   docker exec -i portal_mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Portal@Hle2024!" -d portal_hlevan -C < backend/src/config/init.sql
   ```

3. **Truy cập hệ thống:**
   - **Giao diện Web:** `http://localhost:3000`
   - **Backend API:** `http://localhost:5000`
   - **RAG Service API:** `http://localhost:8000/docs`

4. **Dừng hệ thống:**
   ```bash
   docker-compose down
   ```

---

### Chế độ 2: Phát triển cục bộ (Local Development với Hot-Reload)
Khi bạn cần sửa code frontend hoặc backend và muốn xem thay đổi tức thì (HMR):

1. **Khởi chạy Database & RAG Service bằng Docker:**
   ```bash
   # Chỉ khởi chạy Database SQL Server và RAG Service
   docker-compose up -d mssql rag-service
   ```
   *(Lưu ý: Không khởi chạy container `frontend` trong Docker để tránh chiếm cổng 3000).*

2. **Chạy Backend cục bộ:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend sẽ lắng nghe tại `http://localhost:5000`.

3. **Chạy Frontend cục bộ (Hot-Reload):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend sẽ lắng nghe **duy nhất** tại `http://localhost:3000`.

---

## 6. Thông tin Quản trị & Kết nối Database

### Tài khoản Quản trị viên (Admin mặc định)
Sau khi nạp script `init.sql`, hệ thống tự động khởi tạo tài khoản quản trị:
- **Số điện thoại:** `0901234567`
- **Mật khẩu:** `Admin@123`

*Quản trị viên có quyền: Thêm, sửa, xóa thành viên trên cây gia phả, kết nối hôn phối, thêm con, tải lên tư liệu lịch sử, đăng bài viết/sự kiện, xác nhận tiền công đức.*

### Kết nối Database SQL Server
Port `1433` đã được mở ra máy host. Bạn có thể dùng SSMS, DBeaver, hoặc Azure Data Studio để kết nối:
- **Server:** `localhost,1433` (hoặc `127.0.0.1,1433`)
- **Authentication:** SQL Server Authentication
- **Username:** `sa`
- **Password:** `Portal@Hle2024!`
- **Database:** `portal_hlevan`

---

## 7. Nạp dữ liệu vào Trợ lý AI (RAG Ingestion)

Sau khi hệ thống đã có dữ liệu thành viên trong cây gia phả, bạn có thể đồng bộ vào cơ sở dữ liệu vector ChromaDB để Trợ lý AI nắm bắt đầy đủ thông tin:

Chạy lệnh gọi API nạp dữ liệu:
```bash
curl -X POST http://localhost:8000/ingest/members
```
*(Trên Windows PowerShell: `Invoke-RestMethod -Method Post -Uri http://localhost:8000/ingest/members`)*

---

## 8. Xử lý sự cố thường gặp (Troubleshooting)

### 1. Báo lỗi cổng 3000 đang được sử dụng (`Port 3000 is in use`)
- **Nguyên nhân:** Container `portal_frontend` của Docker đang chạy và chiếm giữ cổng `:3000`.
- **Cách khắc phục:**
  ```bash
  # Tắt container frontend của Docker
  docker stop portal_frontend
  # Sau đó khởi động lại lệnh dev cục bộ:
  cd frontend && npm run dev
  ```

### 2. Kiểm tra log của các container
- Log backend: `docker logs -f portal_backend`
- Log frontend (Nginx): `docker logs -f portal_frontend`
- Log RAG AI: `docker logs -f portal_rag`
- Log SQL Server: `docker logs -f portal_mssql`

### 3. RAG Service không kết nối được với Ollama
- Đảm bảo Ollama đang chạy trên máy tính: `ollama list`.
- Trong file `.env`, giá trị `OLLAMA_BASE_URL` mặc định là `http://host.docker.internal:11434` để container Docker có thể giao tiếp với Ollama chạy trên máy host Windows.