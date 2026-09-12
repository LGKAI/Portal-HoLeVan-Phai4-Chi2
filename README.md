# Cổng Thông Tin & Gia Phả Dòng Họ Lê Văn (Chi 2 - Phái 4)

Hệ thống **Cổng thông tin & Gia phả số hóa** dòng họ **Lê Văn (Chi 2 - Phái 4)** — Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị.

Dự án kết hợp công nghệ web hiện đại với trí tuệ nhân tạo (**RAG - Retrieval Augmented Generation**) nhằm bảo tồn và phát huy truyền thống tổ tiên, số hóa cây gia phả tương tác đa thế hệ, cập nhật tư liệu và sự kiện dòng họ, đồng thời hỗ trợ con cháu tra cứu cội nguồn nhanh chóng qua **Trợ lý AI dòng họ**.

---

## 1. Kiến trúc Triển khai Cloud (100% Miễn Phí)

Hệ thống được thiết kế theo kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend, Backend và Database, cho phép vận hành trực tuyến **0 VNĐ / tháng**:

```mermaid
flowchart LR
    User([Người dùng / Con cháu]) --> Frontend[Frontend React\nDeploy trên VERCEL]
    Frontend --> Backend[Backend Node.js Express\nDeploy trên RENDER]
    Backend --> SupabaseDB[(Database PostgreSQL 17\nLưu trữ trên SUPABASE)]
    Backend --> SupabaseStorage[(Cloud Storage Bucket\nLưu ảnh trên SUPABASE)]
    Frontend -. Tra cứu AI .-> RAG[RAG AI Service\nFastAPI & Vector DB]
```

### Các thành phần chính:

| Thành phần | Nền tảng Deploy | Công nghệ sử dụng | Chức năng |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | React 18, Vite 5, TypeScript, Tailwind CSS, `@xyflow/react` | Giao diện web người dùng, cây gia phả tương tác, tin tức, tư liệu, đố vui gia phả |
| **Backend** | **Render** | Node.js 22, Express.js, TypeScript, `pg` driver, `@supabase/storage-js` | RESTful API, xác thực JWT, nghiệp vụ phả hệ, xử lý tải file |
| **Database** | **Supabase** | PostgreSQL 17 (Connection Pooling, SSL) | CSDL quan hệ lưu trữ cây phả hệ, tài khoản, tin tức, tài liệu |
| **Storage** | **Supabase** | Supabase Storage Bucket (`uploads`) | Lưu trữ vĩnh viễn ảnh đại diện thành viên và thumbnail bài viết (không bị mất khi Render sleep) |
| **AI Tra cứu** | Local / Cloud | Python FastAPI, LangChain, ChromaDB, Ollama (`qwen2.5:7b`) | Trợ lý AI hỏi đáp cội nguồn dòng họ qua kỹ thuật RAG |

---

## 2. Tính năng Nổi bật

### 🌳 Cây Gia Phả Tương Tác Trực Quan (@xyflow/react)
- **Tự động phân tầng thế hệ**: Căn chỉnh chuẩn xác theo thứ tự đời (từ Thủy tổ đến các thế hệ con cháu).
- **Hỗ trợ đa thê truyền thống**: Phân nhánh rõ ràng con cái theo từng đời vợ (*Chánh phối, Thứ phối, Thứ thứ phối...*).
- **Đường nối huyết thống chuẩn xác**: Nối từ trung điểm của người cha và người mẹ sinh thành đến người con.
- **Thống kê thời gian thực**: Bộ đếm tự động góc trên hiển thị:
  - 🔵 **Tổng số thành viên**
  - 🔴 **Số thành viên đã mất**
  - 🟢 **Số thành viên còn sống**
- **Cắt xén ảnh chân dung bo tròn**: Tích hợp `react-easy-crop` trực tiếp trên web trước khi tải lên.
- **Cơ chế dự phòng dữ liệu (Static Fallback)**: Tự động nạp dữ liệu tĩnh từ `members.json` nếu backend đang khởi động, đảm bảo website luôn hiển thị mượt mà.

### 📰 Bản Tin & Sự Kiện Dòng Họ
- Đăng tải tin tức, thông báo ngày giỗ tổ, sự kiện khuyến học, tôn tạo nhà thờ, mồ mả tổ tiên.
- Phân loại danh mục (`news`, `event`, `announcement`), tự động tăng lượt xem.

### 📚 Tư Liệu & Văn Bản Lịch Sử
- Lưu trữ hình ảnh sắc phong, gia phả chữ Hán - Nôm, văn cúng, bài văn tế qua các thời kỳ.

### 🎯 Đố Vui Gia Phả (Quiz)
- Bộ câu hỏi trắc nghiệm tương tác giúp thế hệ con cháu tìm hiểu cội nguồn một cách hào hứng.

### 🤖 Trợ Lý AI Dòng Họ (RAG Chatbot)
- Ứng dụng mô hình ngôn ngữ lớn kết hợp cơ sở tri thức số hóa của dòng họ để giải đáp tức thì: danh xưng vai vế, ngày giỗ, mộ phần tổ tiên.

---

## 3. Cấu trúc Thư mục Dự án

```
Portal-HoLeVan-Phai4-Chi2/
├── .env.example                      # File mẫu biến môi trường chuẩn PostgreSQL/Supabase
├── .gitignore                        # Cấu hình loại trừ file nhạy cảm và thư mục build
├── docker-compose.yml                # Khởi chạy toàn bộ hệ thống cục bộ với PostgreSQL
├── README.md                         # Tài liệu hướng dẫn dự án
│
├── backend/                          # MÃ NGUỒN BACKEND (Node.js/Express + TypeScript)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                 # Kết nối PostgreSQL (pg.Pool) hỗ trợ DATABASE_URL & SSL
│   │   │   ├── init_postgres.sql     # Script DDL khởi tạo bảng PostgreSQL
│   │   │   ├── initSql.ts            # Schema nhúng sẵn phòng ngừa thiếu file môi trường
│   │   │   └── seed_members.ts       # Script tự động nạp 300+ thành viên gia phả ban đầu
│   │   ├── controllers/              # Xử lý nghiệp vụ: authController, membersController, newsController
│   │   ├── data/
│   │   │   └── members.json          # Dữ liệu gia phả gốc đóng gói sẵn
│   │   ├── middleware/               # Xác thực JWT (auth.ts), Upload ảnh Supabase (upload.ts)
│   │   ├── routes/                   # Định tuyến API (/api/auth, /api/members, /api/news)
│   │   └── server.ts                 # Điểm khởi động ứng dụng
│   ├── Dockerfile                    # Container hóa Backend trên nền Node 22 Alpine
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # MÃ NGUỒN FRONTEND (React 18 + Vite + TypeScript)
│   ├── public/                       # Ảnh nền, favicon, huy hiệu dòng họ
│   ├── src/
│   │   ├── components/               # Cây gia phả (FamilyTree), Chatbot, Navbar, Modals
│   │   ├── data/                     # Dữ liệu gia phả dự phòng (members.json)
│   │   ├── hooks/                    # Custom hooks (useChat.ts)
│   │   ├── pages/                    # Các trang: Trang chủ, Gia phả, Tin tức, Tư liệu, Đố vui
│   │   ├── services/                 # Kết nối API linh hoạt qua VITE_API_URL
│   │   └── store/                    # Quản lý trạng thái đăng nhập (Zustand)
│   ├── vercel.json                   # Cấu hình Rewrite định tuyến SPA trên Vercel
│   ├── Dockerfile                    # Container hóa Frontend với Nginx
│   ├── package.json
│   └── vite.config.ts
│
└── rag-service/                      # DỊCH VỤ TRỢ LÝ AI (Python FastAPI + LangChain)
    ├── src/                          # FastAPI server, RAG pipeline, ingest tài liệu
    ├── data/                         # Vector store ChromaDB & tài liệu thô
    ├── Dockerfile
    └── requirements.txt
```

---

## 4. Hướng dẫn Triển khai Trực tuyến (Production Deployment)

### Bước 1: Khởi tạo Database & Storage trên Supabase
1. Đăng nhập [supabase.com](https://supabase.com) bằng tài khoản GitHub $\rightarrow$ Tạo **New Project** (chọn Region `Singapore`).
2. **Lấy chuỗi kết nối Database**: Bấm nút **Connect** ở thanh trên cùng $\rightarrow$ chọn tab **URI** $\rightarrow$ Copy chuỗi `postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`.
3. **Tạo Storage Bucket**: Vào mục **Storage** $\rightarrow$ **New bucket** $\rightarrow$ Đặt tên `uploads`, bật **Public bucket: ON**.
4. **Lấy API Keys**: Vào **Project Settings** $\rightarrow$ **API Keys** $\rightarrow$ Lấy `Project URL` và khóa `service_role`.

### Bước 2: Deploy Backend lên Render
1. Đăng nhập [render.com](https://render.com) bằng GitHub $\rightarrow$ **New +** $\rightarrow$ **Web Service** $\rightarrow$ Chọn repo `Portal-HoLeVan-Phai4-Chi2`.
2. Cấu hình cơ bản:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
3. Cấu hình **Environment Variables**:
   - `DATABASE_URL`: *Chuỗi kết nối Supabase URI*
   - `JWT_SECRET`: *Bấm Generate trên Render để tự sinh*
   - `JWT_EXPIRES_IN`: `7d`
   - `SUPABASE_URL`: *Project URL trên Supabase*
   - `SUPABASE_SERVICE_ROLE_KEY`: *Khóa `service_role` trên Supabase*
   - `SUPABASE_STORAGE_BUCKET`: `uploads`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
4. Bấm **Create Web Service**. Sau khi hoàn tất, bạn sẽ nhận được đường dẫn API (ví dụ: `https://portal-holevan-phai4-chi2.onrender.com`).

### Bước 3: Deploy Frontend lên Vercel
1. Đăng nhập [vercel.com](https://vercel.com) bằng GitHub $\rightarrow$ **Add New...** $\rightarrow$ **Project** $\rightarrow$ Chọn repo `Portal-HoLeVan-Phai4-Chi2`.
2. Cấu hình:
   - **Root Directory**: Bấm Edit chọn `frontend`.
   - **Environment Variables**: Thêm biến `VITE_API_URL` với giá trị là đường link Backend Render kèm đuôi `/api`:
     ```text
     https://portal-holevan-phai4-chi2.onrender.com/api
     ```
3. Bấm **Deploy**. Sau 30 giây, website chính thức của bạn sẽ trực tuyến tại domain `https://portal-holevan-phai4-chi2.vercel.app`.

---

## 5. Hướng dẫn Chạy Cục bộ (Local Development)

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên dùng)
Yêu cầu đã cài đặt **Docker Desktop**. Chạy lệnh tại thư mục gốc:

```bash
# Khởi chạy đồng thời PostgreSQL, Backend và Frontend
docker compose up -d --build

# Xem logs hoạt động
docker compose logs -f
```

- Giao diện Web: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Database PostgreSQL: `localhost:5432`

---

### Cách 2: Khởi chạy thủ công từng dịch vụ

#### Backend:
```bash
cd backend
npm install
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Tài khoản Quản trị Mặc định

Hệ thống được khởi tạo sẵn một tài khoản Quản trị viên để quản lý thành viên, phê duyệt tin tức:

| Thông tin | Giá trị |
| :--- | :--- |
| **Số điện thoại** | `0901234567` |
| **Mật khẩu** | `Admin@123456` |
| **Vai trò** | `admin` |

*(Sau khi đăng nhập lần đầu, vui lòng đổi mật khẩu để đảm bảo an toàn tuyệt đối).*

---

## 7. Giấy phép & Bản quyền

Dự án được xây dựng với mục đích phi lợi nhuận nhằm gìn giữ, tôn vinh truyền thống và kết nối các thế hệ con cháu dòng họ **Lê Văn - Phái 4 - Chi 2**. Mọi đóng góp, tư liệu bổ sung xin vui lòng liên hệ Ban Liên lạc Dòng họ.