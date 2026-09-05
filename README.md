# Portal Chi 2 - Phái 4 - Họ Lê Văn

Hệ thống **Cổng thông tin & Gia phả số hóa** dòng họ **Lê Văn (Chi 2 - Phái 4)** — Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị. 

Dự án kết hợp công nghệ web hiện đại với trí tuệ nhân tạo (**RAG - Retrieval Augmented Generation**) nhằm bảo tồn và phát huy truyền thống tổ tiên, số hóa cây gia phả tương tác đa thế hệ, cập nhật tư liệu và sự kiện dòng họ, quản lý quỹ công đức minh bạch, đồng thời hỗ trợ con cháu tra cứu cội nguồn nhanh chóng qua **Trợ lý AI dòng họ**.

---

## 1. Kiến trúc & Công nghệ sử dụng

Hệ thống được thiết kế theo kiến trúc Microservices / Client-Server tách biệt, bao gồm 4 thành phần chính:

### 1.1. Frontend (Giao diện Web)
- **Framework:** React 18, Vite 5
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (bộ icon tối giản hiện đại)
- **Quản lý State:** Zustand (quản lý trạng thái phiên đăng nhập, thông tin người dùng)
- **Cây gia phả tương tác:** `@xyflow/react` (React Flow v12)
  - Thuật toán căn chỉnh layout tự động phân tầng con cái theo từng đời vợ (Chánh phối, Thứ phối, Thứ thứ phối...).
  - Đường nối huyết thống trực tiếp từ trung điểm của người cha và người mẹ sinh thành.
  - Bảng thống kê động thời gian thực ở góc trên bên trái: **Tổng số thành viên** (Xanh dương), **Số thành viên đã mất** (Đỏ), **Số thành viên còn sống** (Xanh lá).
- **Cắt xén ảnh chân dung:** `react-easy-crop` (cắt ảnh bo tròn chuẩn avatar trước khi tải lên)
- **Định tuyến SPA:** React Router DOM v6
- **Cấu hình Cổng:** Cố định duy nhất tại cổng `:3000` (`strictPort: true`)

### 1.2. Backend (API Server)
- **Framework:** Node.js, Express.js
- **Ngôn ngữ:** TypeScript
- **Database Driver:** `mssql` (kết nối Microsoft SQL Server)
- **Xác thực:** JSON Web Token (JWT) + mã hóa mật khẩu `bcryptjs`
- **Quản lý Upload:** `multer` (xử lý upload ảnh chân dung thành viên và ảnh đại diện bài viết)
- **Bảo mật & Middleware:** Helmet, CORS, Express Async Errors
- **Cổng dịch vụ:** Chạy tại cổng `:5000`

### 1.3. RAG Service (Trợ lý AI Tra cứu Dòng họ)
- **Framework:** Python 3.10+, FastAPI, Uvicorn
- **Framework AI:** LangChain (LangChain Core, LangChain Community, LangChain Chroma)
- **Vector Database:** ChromaDB (lưu trữ vector embeddings cục bộ)
- **Mô hình AI cục bộ (Local LLM via Ollama):**
  - **LLM:** `qwen2.5:7b` (hỗ trợ tiếng Việt tự nhiên, chuẩn xác)
  - **Embedding Model:** `nomic-embed-text`
- **Cổng dịch vụ:** Chạy tại cổng `:8000`

### 1.4. Cơ sở dữ liệu & Hạ tầng
- **Cơ sở dữ liệu:** Microsoft SQL Server 2022 Developer Edition (Collation `Vietnamese_CI_AS` chuẩn tiếng Việt)
- **Containerization:** Docker & Docker Compose
- **Web Server Production:** Nginx Alpine (Reverse Proxy & Serve static files React)

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
> **Về cấu hình cổng `:3000`:** 
> Cấu hình Vite đã được thiết lập `strictPort: true`. Frontend sẽ **luôn luôn chạy cố định ở cổng `:3000`**, ngăn chặn việc tự ý nhảy sang `:3001` khi xảy ra xung đột.

---

## 3. Cấu trúc thư mục dự án

```
Portal-HoLeVan-Phai4-Chi2/
├── .env                              # File biến môi trường thực tế
├── .env.example                      # File mẫu biến môi trường
├── .gitignore                        # Cấu hình bỏ qua file trong Git
├── docker-compose.yml                # Cấu hình Docker Compose toàn bộ hệ thống
├── README.md                         # Tài liệu hướng dẫn dự án
│
├── backend/                          # Mã nguồn Backend (Node.js/Express + TypeScript)
│   ├── src/
│   │   ├── config/                   # Kết nối CSDL (db.ts) & script tạo bảng (init.sql)
│   │   ├── controllers/              # Bộ điều khiển (auth, members, news, donations)
│   │   ├── middleware/               # Xác thực JWT (auth.ts), xử lý upload ảnh (upload.ts)
│   │   ├── routes/                   # Khai báo các endpoints API (/api/auth, /members, /news, /donations)
│   │   ├── types/                    # Định nghĩa TypeScript interfaces
│   │   └── server.ts                 # Điểm khởi động Express server
│   ├── .env.example                  # Mẫu biến môi trường Backend
│   ├── Dockerfile                    # Dockerfile đóng gói container Backend
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Mã nguồn Frontend (React 18 + Vite + TypeScript)
│   ├── public/                       # Tài nguyên tĩnh (favicon.ico, qr.jpg...)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                 # Modal đăng nhập (LoginModal), đăng ký (RegisterModal)
│   │   │   ├── Chatbot/              # Hộp chat trợ lý AI nổi góc dưới phải (ChatbotPanel)
│   │   │   ├── common/               # Component dùng chung (LoadingSpinner...)
│   │   │   ├── FamilyTree/           # Thành phần Cây gia phả:
│   │   │   │   ├── TreeCanvas.tsx    # Canvas hiển thị cây & thuật toán sắp xếp vị trí node/edge
│   │   │   │   ├── MemberNode.tsx    # Thẻ thành viên (màu sắc theo giới tính, viền theo tình trạng sinh/tử)
│   │   │   │   ├── MemberFormModal.tsx # Form thêm/sửa thông tin thành viên (tích hợp crop ảnh đại diện)
│   │   │   │   ├── CustomFamilyEdge.tsx # Đường nối liên kết huyết thống cha - mẹ - con
│   │   │   │   ├── CustomOverSpouseEdge.tsx
│   │   │   │   └── CustomSpouseStraightEdge.tsx
│   │   │   ├── Layout/               # Thanh điều hướng (Navbar) & Chân trang (Footer)
│   │   │   └── News/                 # Thẻ bài viết tư liệu & sự kiện (NewsCard)
│   │   ├── hooks/                    # Custom hooks (useChat, useFamilyTree)
│   │   ├── pages/                    # Các trang màn hình:
│   │   │   ├── HomePage.tsx          # Trang chủ giới thiệu, thống kê tổng quan, sự kiện mới
│   │   │   ├── FamilyTreePage.tsx    # Cây gia phả tương tác, tìm kiếm, lọc đời, widget thống kê
│   │   │   ├── NewsPage.tsx          # Trang danh sách Tư liệu - Sự kiện nội tộc
│   │   │   ├── NewsDetailPage.tsx    # Xem chi tiết bài viết tư liệu / sự kiện
│   │   │   └── DonatePage.tsx        # Trang ủng hộ quỹ công đức & bảng vàng vinh danh
│   │   ├── services/                 # Gọi API backend (api, authService, memberService, newsService, donationService)
│   │   ├── store/                    # Zustand store (authStore)
│   │   ├── types/                    # Định nghĩa kiểu dữ liệu (Member, User, NewsItem, Donation...)
│   │   ├── utils/                    # Tiện ích cắt xén ảnh canvas (cropImage.ts)
│   │   ├── App.tsx                   # Định tuyến Router
│   │   ├── index.css                 # CSS toàn cục & cấu hình Tailwind
│   │   └── main.tsx                  # Điểm khởi tạo ứng dụng React
│   ├── nginx.conf                    # Cấu hình Nginx reverse proxy cho production
│   ├── Dockerfile                    # Multi-stage build (Node builder -> Nginx Alpine)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts                # Cấu hình Vite (port: 3000, strictPort: true, proxy API)
│
└── rag-service/                      # Dịch vụ Trợ lý AI (Python FastAPI + LangChain + ChromaDB)
    ├── src/
    │   ├── config.py                 # Cấu hình tham số RAG & Ollama
    │   ├── ingest.py                 # Kịch bản đồng bộ dữ liệu gia phả vào Vector Database
    │   ├── main.py                   # FastAPI app (API endpoints: /chat, /ingest, /health)
    │   ├── models.py                 # Pydantic schemas cho request/response
    │   └── rag_pipeline.py           # Luồng truy xuất thông tin & sinh câu trả lời RAG
    ├── data/
    │   └── raw_documents/            # Thư mục lưu trữ văn bản thô phục vụ nạp kiến thức bổ sung
    ├── .env.example                  # Mẫu biến môi trường cho RAG Service
    ├── Dockerfile
    └── requirements.txt              # Danh sách thư viện Python
```

---

## 4. Các tính năng cốt lõi

### 4.1. Cây gia phả số hóa tương tác (`/tree`)
- **Hiển thị trực quan:** Xem toàn bộ cây gia phả nhiều thế hệ (từ Đời thứ 9 đến Đời thứ 16 theo thứ bậc Phái 4).
- **Quan hệ hôn phối & huyết thống:**
  - Tự động nhận diện thứ bậc vợ chồng: *Chánh phối*, *Thứ phối*, *Thứ thứ phối*...
  - Cho phép chỉ định chính xác **Người mẹ sinh thành** trong gia đình đa thê để đường nối huyết thống xuất phát chuẩn xác từ trung điểm giữa người cha và người mẹ tương ứng.
- **Thống kê thời gian thực (Góc trên bên trái, dưới ô tìm kiếm):**
  - **- Tổng số thành viên:** Hiển thị màu xanh dương (**Blue**).
  - **- Số thành viên đã mất:** Hiển thị màu đỏ (**Red**).
  - **- Số thành viên còn sống:** Hiển thị màu xanh lá (**Green**).
  - Sử dụng thuật toán đếm động phản hồi ngay lập tức khi quản trị viên thực hiện thao tác thêm, sửa hoặc xóa thành viên.
- **Tìm kiếm & Bộ lọc:** Tìm kiếm tức thì theo họ tên thành viên; lọc hiển thị theo từng Đời cụ thể.
- **Quản trị viên:** Thêm con cái, thêm hôn phối, chỉnh sửa thông tin chi tiết, tải ảnh chân dung bo tròn và xóa thành viên với hộp thoại xác nhận an toàn.

### 4.2. Tư liệu - Sự kiện dòng họ (`/news`)
- Cập nhật các thông báo, hoạt động truyền thống (Lễ tảo mộ, chạp mả, giỗ tổ, khuyến học...).
- Đăng tải bài viết kèm hình ảnh minh họa, tự động tạo slug thân thiện, đếm số lượt xem và định dạng thời gian tiếng Việt.
- Quản trị viên có toàn quyền đăng mới, chỉnh sửa nội dung và xóa bài viết.

### 4.3. Quỹ phát triển & Công đức (`/donate`)
- Cung cấp thông tin tài khoản ngân hàng và mã QR thanh toán nhanh phục vụ việc đóng góp xây dựng từ đường, tu bổ lăng mộ và quỹ khuyến học.
- Bảng vàng vinh danh công đức minh bạch, cập nhật công khai các khoản ủng hộ, có bộ lọc theo mức tiền đóng góp và tìm kiếm nhà hảo tâm.
- Quản trị viên có quyền ghi nhận hoặc xác thực các khoản công đức.

### 4.4. Trợ lý AI Dòng họ (AI Chatbot)
- Trợ lý AI thông minh sẵn sàng trò chuyện và giải đáp 24/7.
- Sử dụng mô hình ngôn ngữ lớn cục bộ qua Ollama (`qwen2.5:7b`), bảo mật tuyệt đối dữ liệu nội bộ dòng họ.
- Tích hợp kỹ thuật **RAG (Retrieval Augmented Generation)**: tự động truy xuất thông tin từ cơ sở dữ liệu phả hệ để trả lời chính xác các câu hỏi về tổ tiên, quan hệ gia đình, vai vế họ hàng.

---

## 5. Yêu cầu môi trường (Prerequisites)

Trước khi tiến hành cài đặt, máy tính cần có:
1. **Docker Desktop:** [Tải Docker](https://www.docker.com/) (yêu cầu kích hoạt WSL2 trên Windows).
2. **Node.js:** Phiên bản 18 LTS hoặc 20 LTS (nếu muốn chạy phát triển cục bộ).
3. **Ollama:** [Tải Ollama](https://ollama.com/) (dành cho tính năng Trợ lý AI). Sau khi cài đặt, tải 2 mô hình sau:
   ```bash
   ollama pull qwen2.5:7b
   ollama pull nomic-embed-text
   ```

---

## 6. Hướng dẫn khởi chạy

### Bước 1: Chuẩn bị file môi trường
Tạo file `.env` tại thư mục gốc từ file mẫu:
```bash
# Trên Linux/macOS
cp .env.example .env

# Trên Windows PowerShell
Copy-Item .env.example .env
```

---

### Cách 1: Khởi chạy trọn gói bằng Docker Compose (Khuyên dùng)
Phương thức này sẽ tự động build và chạy toàn bộ 4 containers: Database MSSQL, Backend API, Frontend Web (Nginx), và RAG AI Service.

1. **Khởi động toàn bộ hệ thống:**
   ```bash
   docker-compose up -d --build
   ```

2. **Khởi tạo bảng cơ sở dữ liệu (chỉ cần thực hiện trong lần đầu tiên):**
   ```bash
   docker exec -i portal_mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Portal@Hle2024!" -d portal_hlevan -C < backend/src/config/init.sql
   ```

3. **Truy cập các dịch vụ:**
   - **Giao diện Web:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **Tài liệu Swagger RAG AI:** [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Dừng toàn bộ hệ thống:**
   ```bash
   docker-compose down
   ```

---

### Cách 2: Phát triển cục bộ (Local Development với Hot-Reload)
Khi cần phát triển và chỉnh sửa mã nguồn với tính năng Hot-Module Replacement (HMR):

1. **Khởi chạy Database & RAG Service bằng Docker:**
   ```bash
   docker-compose up -d mssql rag-service
   ```
   *(Lưu ý: Không khởi chạy container `frontend` trong Docker để tránh chiếm dụng cổng 3000).*

2. **Khởi chạy Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend sẽ lắng nghe tại [http://localhost:5000](http://localhost:5000).

3. **Khởi chạy Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend sẽ mở tại cổng cố định [http://localhost:3000](http://localhost:3000).

---

## 7. Thông tin Quản trị & Cơ sở dữ liệu

### 7.1. Tài khoản Quản trị viên (Admin mặc định)
Sau khi chạy script khởi tạo `init.sql`, hệ thống tự động có sẵn tài khoản:
- **Số điện thoại:** `0901234567`
- **Mật khẩu:** `Admin@123`

*Quyền hạn quản trị viên: Quản lý cây gia phả (thêm, sửa, xóa thành viên, gắn quan hệ cha-mẹ-con, hôn phối, đổi ảnh đại diện), đăng tải bài viết Tư liệu - Sự kiện, duyệt và quản lý danh sách đóng góp quỹ.*

### 7.2. Kết nối Cơ sở dữ liệu SQL Server
Cổng `1433` đã được ánh xạ ra máy host. Có thể kết nối qua Azure Data Studio, DBeaver hoặc SQL Server Management Studio (SSMS):
- **Host / Server:** `localhost,1433` (hoặc `127.0.0.1,1433`)
- **Authentication:** SQL Server Authentication
- **User:** `sa`
- **Password:** `Portal@Hle2024!`
- **Database:** `portal_hlevan`

---

## 8. Đồng bộ dữ liệu vào Trợ lý AI (RAG Ingestion)

Mỗi khi dữ liệu gia phả có sự thay đổi lớn hoặc sau khi nạp dữ liệu ban đầu, bạn có thể gọi API để AI nạp vector kiến thức mới nhất:

```bash
# Trên Linux/macOS
curl -X POST http://localhost:8000/ingest/members

# Trên Windows PowerShell
Invoke-RestMethod -Method Post -Uri http://localhost:8000/ingest/members
```

---

## 9. Xử lý sự cố thường gặp (Troubleshooting)

### 1. Xung đột cổng `:3000` (`Port 3000 is in use`)
- **Nguyên nhân:** Container `portal_frontend` của Docker đang chạy và chiếm giữ cổng 3000.
- **Xử lý:**
  ```bash
  docker stop portal_frontend
  # Sau đó chạy lệnh dev cục bộ:
  cd frontend && npm run dev
  ```

### 2. Xem log trực tiếp của từng container
- Log Backend: `docker logs -f portal_backend`
- Log Frontend (Nginx): `docker logs -f portal_frontend`
- Log RAG AI Service: `docker logs -f portal_rag`
- Log SQL Server: `docker logs -f portal_mssql`

### 3. RAG AI Service không kết nối được Ollama
- Kiểm tra xem tiến trình Ollama đã khởi động chưa: `ollama list`.
- Đảm bảo biến `OLLAMA_BASE_URL` trong file `.env` trỏ đến `http://host.docker.internal:11434` (để container Docker có thể gọi dịch vụ Ollama đang chạy trên máy chủ Windows host).