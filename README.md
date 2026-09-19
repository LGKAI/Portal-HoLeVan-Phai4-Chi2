# Cổng Thông Tin & Gia Phả Số Hóa Dòng Họ Lê Văn - Phái 4 - Chi 2

> **Website:** [https://portal-holevan-phai4-chi2.vercel.app/](https://portal-holevan-phai4-chi2.vercel.app/)  

---

## 📖 Mục Lục

1. [Giới thiệu Dự án (Introduction)](#-giới-thiệu-dự-án)
2. [Kiến trúc Hệ thống Tổng thể (System Architecture)](#-kiến-trúc-hệ-thống-tổng-thể-system-architecture)
3. [Phân Tích Chuyên Sâu 3 Module Cốt Lõi (Core Modules)](#-phân-tích-chuyên-sâu-3-module-cốt-lõi)
   - [Module 1: Frontend (Client-side Web Application)](#1-module-frontend-client-side-web-application)
   - [Module 2: Backend (API Gateway & Data Management)](#2-module-backend-api-gateway--data-management)
   - [Module 3: RAG & Trợ Lý AI Gia Phả (Retrieval-Augmented Generation)](#3-module-rag--trợ-lý-ai-gia-phả-retrieval-augmented-generation)
4. [Thiết Kế Cơ Sở Dữ Liệu Chi Tiết (PostgreSQL Schema)](#-thiết-kế-cơ-sở-dữ-liệu-chi-tiết-postgresql-schema)
5. [Cấu Trúc Thư Mục Toàn Dự Án (Project Structure)](#-cấu-trúc-thư-mục-toàn-dự-án)
6. [Danh Mục Biến Môi Trường (Environment Variables)](#-danh-mục-biến-môi-trường-environment-variables)
7. [Hướng Dẫn Triển Khai Thực Tế (Production Deployment)](#-hướng-dẫn-triển-khai-thực-tế-production-deployment)
8. [Hướng Dẫn Chạy Môi Trường Cục Bộ (Local Development)](#-hướng-dẫn-chạy-môi-trường-cục-bộ-local-development)
9. [Bản Quyền & Cam Kết Bảo Mật (Security & Copyright)](#-bản-quyền--cam-kết-bảo-mật)

---

## 📖 Giới thiệu Dự án (Introduction)

Dự án **Portal Họ Lê Văn - Phái 4 - Chi 2** là nền tảng số hóa di sản dòng họ toàn diện, kết hợp công nghệ web hiện đại với trí tuệ nhân tạo thế hệ mới (**RAG - Retrieval Augmented Generation**). Dự án giải quyết bài toán cấp thiết: các tư liệu gia phả giấy truyền thống qua hàng trăm năm bị mục nát, thất lạc, thông tin phân tán qua nhiều thế hệ và địa lý, đồng thời tạo ra một không gian tương tác trực quan, sinh động giúp con cháu trong và ngoài nước tra cứu nguồn cội, kết nối huyết thống và tưởng nhớ công đức tổ tiên.

Hệ thống quản lý dữ liệu **hơn 313 thành viên trải qua 8 thế hệ** (tương ứng Đời 9 đến Đời 16 của toàn Phái 4 Họ Lê Văn tại An Lợi, Triệu Bình, Quảng Trị), cung cấp 4 phân hệ chính:
- **Trang chủ & Cổng thông tin**: Giới thiệu cội nguồn, câu đối tổ tiên, thống kê số liệu tổng quan và 4 thẻ điều hướng đặc sắc:
  - 🔴 **Gia phả số**: Khám phá cây phả hệ trực quan phân tầng theo đời.
  - 🟡 **Lịch giỗ kỵ**: Sổ kỵ nhật tiền nhân 12 tháng Âm lịch & vị trí an táng.
  - 🟢 **Tư liệu - Sự kiện**: Tin tức, hoạt động, thông báo, tài liệu lịch sử họ tộc.
  - 🔵 **Trợ lý AI dòng họ**: Tra cứu gia phả thông minh, đối thoại phả hệ tức thì.
- **Cây phả hệ tương tác động đa chiều**: Trực quan hóa cây phả hệ phân tầng theo đời (`@xyflow/react`), tự động định vị tọa độ, quản lý đa hôn phối, tìm kiếm thông minh và hiển thị thẻ thành viên chi tiết.
- **Lịch giỗ kỵ 12 tháng Âm lịch**: Tra cứu ngày cúng giỗ của 109 vị tiền nhân đã quy tiên. Áp dụng chuẩn phong tục dòng họ: **ngày cúng giỗ tiên thường là ngày ngay trước ngày mất theo Âm lịch**; hiển thị bảng chi tiết gồm họ tên, đời thứ, thân phụ, thân mẫu, nơi an táng; tự động cập nhật khi Admin thêm người mất.
- **Tư liệu - Sự kiện dòng họ**: Cập nhật sự kiện, thông báo việc họ, chia sẻ hình ảnh sinh hoạt, lưu giữ tư liệu văn hóa lịch sử.
- **Trợ lý AI Gia Phả am tường nguồn cội**: Giải đáp thắc mắc về vai vế xưng hô, huyết thống, tiểu sử tiền nhân với độ chính xác tuyệt đối, chuẩn hóa cấu trúc trả lời dạng gạch đầu dòng, ẩn 100% mã ID, chuẩn hóa danh xưng người không rõ giới tính (`LÊ HVVD`) và loại trừ hoàn toàn ảo giác.

---

## 🏛️ Kiến trúc Hệ thống Tổng thể (System Architecture)

Hệ thống được thiết kế theo mô hình kiến trúc phân tán linh hoạt (**Decoupled Micro-services Architecture**), vận hành trực tuyến **24/7 hoàn toàn miễn phí** với độ ổn định cao:

```mermaid
flowchart TB
    subgraph ClientTier["1. LỚP GIAO DIỆN CLIENT - Vercel Edge"]
        UI["React 18 SPA (Vite + Tailwind CSS)"]
        Tree["Interactive Family Tree - xyflow"]
        Memorials["Sổ Kỵ Nhật 12 Tháng Âm Lịch"]
        ChatUI["AI Chatbot Widget & Drawer"]
        AdminUI["Portal Quản Trị & Cắt Ảnh Tròn"]
        OfflineFallback["Offline Fallback Engine (Local Data)"]
    end

    subgraph APITier["2. LỚP XỬ LÝ TRUNG TÂM - Render Web Service"]
        API["Node.js 22 LTS + Express + TypeScript"]
        AuthMid["JWT & RBAC Middleware"]
        UploadMid["Supabase Storage Service"]
        MemorialsService["Memorials Controller (Dynamic Merge)"]
        RAGCore["Hybrid RAG Service Engine<br/>(Smart Router + Gemini API)"]
    end

    subgraph DataTier["3. LỚP LƯU TRỮ ĐÁM MÂY - Supabase Cloud"]
        PG[("PostgreSQL 17 Database<br/>(SSL Connection Pooling)")]
        Storage[("Supabase Storage Bucket uploads<br/>(Avatars & News Images)")]
    end

    subgraph FallbackTier["4. LỚP RAG DỰ PHÒNG - Local Docker"]
        FastAPIApp["Python FastAPI Service"]
        VectorDB[("ChromaDB Vector Store")]
        OllamaLocal["Ollama Local LLM (qwen2.5:7b)"]
    end

    UI -->|HTTPS REST API| API
    UI -.->|Kích hoạt khi Backend Cold-start| OfflineFallback

    API -->|pg.Pool Connection| PG
    API -->|Upload Buffer qua SDK| Storage
    API -->|Tra cứu & Đồng bộ kỵ nhật| MemorialsService
    API -->|Retrieve Context & Build Prompts| RAGCore
    RAGCore -->|HTTPS REST Header x-goog-api-key| GeminiAI["Google Gemini 3.6 Flash<br/>(Google AI Studio)"]

    API -.->|Proxy Fallback khi chạy Local| FastAPIApp
    FastAPIApp --> VectorDB
    FastAPIApp --> OllamaLocal
```

---

## 🔬 Phân Tích Chuyên Sâu Các Module Cốt Lõi (Core Modules)

---

### 1. MODULE FRONTEND (Client-side Web Application)

Được xây dựng trên nền tảng **React 18**, **Vite 5**, **TypeScript** và **Tailwind CSS**, triển khai tối ưu hóa tại biên (**Edge Network**) trên Vercel.

```
frontend/src/
├── components/
│   ├── FamilyTree/         # Bộ nhân đồ thị cây gia phả (@xyflow/react)
│   │   ├── MemberNode.tsx  # Custom Node hiển thị thành viên & phối ngẫu
│   │   ├── TreeControls.tsx# Nút điều hướng, zoom, pan, fullscreen
│   │   └── layoutEngine.ts # Thuật toán tính toán toạ độ cây phả hệ
│   ├── Chatbot/            # Widget trợ lý AI nổi và cửa sổ hội thoại
│   ├── Layout/             # Header, Footer, Navbar, Responsive Mobile Menu
│   └── modals/             # Modal chi tiết thành viên, Modal đăng nhập...
├── pages/
│   ├── HomePage.tsx            # Trang chủ, thống kê số liệu, 4 thẻ điều hướng
│   ├── FamilyTreePage.tsx      # Cây gia phả số hóa & danh bạ dòng họ
│   ├── MemorialCalendarPage.tsx# Sổ kỵ nhật 12 tháng Âm lịch & nơi an táng
│   ├── NewsPage.tsx            # Cổng tư liệu - sự kiện dòng họ
│   └── NewsDetailPage.tsx      # Trang chi tiết bài viết tư liệu dòng họ
├── store/
│   └── authStore.ts        # Quản lý phiên đăng nhập Zustand
└── services/
    └── api.ts              # Cấu hình Axios Client & Interceptor JWT
```

#### a. Trực quan hóa Cây Phả Hệ Động đa chiều (`@xyflow/react`)
- **Thuật toán Phân tầng Tọa độ Tự động (Dynamic Tree Layout Engine)**:
  - **Phân tầng dọc (Y)**: Dựa vào số đời của từng thành viên trong Chi tộc (`generation_in_branch` từ 1 đến 8):
    $$Y = (\text{Generation} - 1) \times \Delta Y$$
  - **Phân tầng ngang (X) & Chống chồng lấn (Anti-collision Layout)**: Tự động tính toán bề rộng nhánh con cái để phân bổ khoảng cách hợp lý cho cha mẹ, đảm bảo các nhánh thế hệ sau không đè lên nhau.
- **Xử lý Đa Hôn Phối Phức Tạp (Multi-Spouse Handling)**:
  - Cấu trúc gia phả truyền thống thường có tiền nhân nhiều vợ (*Chánh phối, Kế thất, Thứ phối...*).
  - Nút `MemberNode.tsx` hiển thị cạnh nhau giữa người chồng và các bà vợ; đồng thời phân bổ đường kết nối (Edges) từ đúng cặp phụ mẫu tương ứng xuống các con.
- **Tối ưu Hiệu Năng & Tương tác UX**:
  - Tích hợp **MiniMap** định vị toàn cảnh cây phả hệ, thanh công cụ thu/phóng (ZoomIn, ZoomOut, FitView).
  - **Search & Auto-Focus**: Khi người dùng nhập tên thành viên trên thanh tìm kiếm, hệ thống tự động pan khung nhìn và zoom tập trung vào đúng vị trí của thành viên đó trên cây.
  - **Chỉ báo Sinh - Tử trang trọng**: Thành viên đã quy tiên hiển thị biểu tượng hoa cúc vàng hoặc dải băng tưởng niệm; người hiện tiền hiển thị trạng thái sinh hoạt.

#### b. Sổ Kỵ Nhật & Lịch Giỗ Kỵ 12 Tháng Âm Lịch (`MemorialCalendarPage.tsx`)
- **Phân nhóm theo 12 tháng Âm lịch**: Hiển thị danh sách kỵ nhật của 109 vị tiền nhân đã quy tiên, chia theo từng tháng (từ Tháng Giêng đến Tháng Chạp).
- **Quy ước phong tục truyền thống**: Ngày cúng giỗ tiên thường là ngày ngay trước ngày mất theo Âm lịch (Ví dụ: ngày mất là 10/01 thì ngày giỗ là 09/01; ngày mất 12/04 thì ngày giỗ là 11/04 Âm lịch).
- **Bảng tra cứu thông minh**: Cung cấp đầy đủ thông tin: Ngày giỗ (kèm ngày mất), Họ và tên, Đời thứ (Chi 2 & Phái 4), Thân phụ, Thân mẫu, Nơi an táng.
- **Tìm kiếm đa trường**: Cho phép tìm kiếm nhanh theo họ tên tiền nhân, theo đời thứ, tên cha mẹ hoặc theo địa danh an táng (Cồn Giữa, Đồng Giám, Lai Bình, Lâm Đồng...).
- **Cơ chế tự động đồng bộ (Auto Sync)**: Khi quản trị viên cập nhật thêm người mất trong mục Quản trị gia phả, hệ thống tự động bổ sung người đó vào bảng kỵ nhật mà không cần nhập lại.

#### c. Quản trị State & Trải nghiệm Người dùng
- **Zustand Auth Store (`authStore.ts`)**: Quản lý trạng thái xác thực toàn cục, lưu trữ JWT Token và thông tin định danh (`Admin`, `Member`, `Guest`) đồng bộ qua `localStorage`.
- **Cắt xén hình ảnh chân dung chuẩn xác (`react-easy-crop`)**:
  - Trang Admin tích hợp công cụ cắt ảnh tỉ lệ vuông tròn 1:1, phóng to, thu nhỏ, xoay ảnh trước khi gửi lên máy chủ.
  - Đảm bảo toàn bộ ảnh chân dung hiển thị trên cây phả hệ đạt chuẩn thẩm mỹ đồng nhất.
- **Cơ chế Dự phòng Ngoại tuyến (Resilient Offline Fallback)**:
  - Khi Backend gặp sự cố khởi động (Cold-start trên môi trường Free Cloud) hoặc mất kết nối Internet, Frontend tự động fallback nạp từ tệp dữ liệu tĩnh `frontend/src/data/members.json`.
  - Giữ vững 100% khả năng tra cứu gia phả của người dùng, không bao giờ để xảy ra màn hình trắng hay lỗi ứng dụng.

---

### 2. MODULE BACKEND (API Gateway & Data Management)

Xây dựng trên nền tảng **Node.js 22 LTS**, **Express.js** và **TypeScript**, tuân thủ nghiêm ngặt mô hình kiến trúc Controller - Service - Middleware - Route.

```
backend/src/
├── config/
│   ├── db.ts               # Kết nối PostgreSQL Pooler qua SSL
│   ├── initSql.ts          # Script khởi tạo cấu trúc 4 bảng tự động
│   └── seed_members.ts     # Script tự động import 313 thành viên vào DB
├── controllers/
│   ├── authController.ts   # Đăng nhập, xác thực danh tính
│   ├── membersController.ts# Nghiệp vụ CRUD thành viên gia phả
│   ├── newsController.ts   # Nghiệp vụ bài viết, tin tức dòng họ
│   └── chatController.ts   # Điều phối truy vấn RAG & AI Chat
├── middleware/
│   ├── auth.ts             # Kiểm tra Bearer JWT & Phân quyền Role-based (RBAC)
│   └── upload.ts           # Tiếp nhận file qua Multer MemoryStorage
├── services/
│   └── ragService.ts       # Trích xuất ngữ cảnh & Tích hợp Gemini 3.6 Flash
└── server.ts               # Điểm khởi tạo máy chủ Express
```

#### a. Xác thực & Phân quyền Bảo mật Đa cấp (JWT & RBAC)
- **Mã hóa Mật khẩu**: Mật khẩu quản trị và người dùng được băm bằng thuật toán **Bcrypt** với Salt Rounds = 10, ngăn chặn hoàn toàn việc giải mã ngược.
- **Middleware `verifyToken` & `requireAdmin`**:
  - Trích xuất token từ header `Authorization: Bearer <token>`.
  - Xác thực chữ ký số bằng `JWT_SECRET`.
  - Chặn đứng mọi hành vi chỉnh sửa, xóa dữ liệu thành viên hoặc đăng bài trái phép từ tài khoản không có quyền Admin.
- **Bảo mật Header HTTP**: Tích hợp `cors` (giới hạn domain cho phép từ Vercel) và `helmet` ngăn ngừa XSS, MIME-sniffing và Clickjacking.

#### b. Hệ thống Kết nối Dữ liệu (PostgreSQL 17 on Supabase)
- **Quản lý Kết nối Connection Pooling (`pg.Pool`)**:
  - Kết nối tới Supabase qua cổng Pooler chuyên dụng với cấu hình SSL (`rejectUnauthorized: false`).
  - Đảm bảo tái sử dụng kết nối hiệu quả, tránh cạn kiệt tài nguyên kết nối (Connection Exhaustion) trên môi trường Serverless/PaaS.
- **Cơ chế Khởi tạo & Đồng bộ Dữ liệu Tự động (Auto-Migration & Seeding)**:
  - Khi máy chủ khởi động, tự động thực thi `initSql.ts` để kiểm tra và tạo các bảng nếu chưa có.
  - Nếu bảng `members` trống, hệ thống tự động kích hoạt `seed_members.ts`, nạp toàn bộ 313 thành viên từ `members.json` với quan hệ đa tầng (Cha, Mẹ, Vợ/Chồng, Con cái).
  - Tự động reset và cân bằng Sequence ID: `SELECT setval('members_id_seq', (SELECT MAX(id) FROM members))` giúp việc thêm mới thành viên qua giao diện Admin không bao giờ bị lỗi trùng khóa chính (duplicate key violation).
  - Tự động kiểm tra và khởi tạo tài khoản Quản trị viên mặc định (`ON CONFLICT (phone) DO UPDATE`).

#### c. Quản lý Đa Phương Tiện (Supabase Cloud Storage CDN)
- **100% Ảnh lưu trữ trên Cloud CDN**: Toàn bộ hơn 153 ảnh chân dung tiền nhân và hình ảnh bài viết được lưu trữ vĩnh viễn trên Supabase Storage bucket `uploads`, phân cấp thư mục `avatars/` và `thumbnails/`.
- **Cơ chế tải lên Không ghi đĩa (Diskless Upload)**:
  - Sử dụng `Multer.memoryStorage()` tiếp nhận file ảnh trực tiếp vào bộ nhớ đệm (RAM) mà không ghi tệp rác lên ổ cứng máy chủ.
  - Sử dụng `@supabase/storage-js` truyền tải buffer lên Cloud bucket và sinh đường dẫn CDN công khai vĩnh viễn.
  - Khắc phục triệt để tình trạng mất dữ liệu của các máy chủ PaaS như Render (ổ đĩa tạm - ephemeral disk).
- **Kho mã nguồn Tinh gọn (Lightweight Repository)**:
  - Loại bỏ hoàn toàn việc commit hàng trăm file ảnh nặng vào Git. Thư mục `frontend/public/uploads` được bảo vệ bởi `.gitignore`.
  - Tích hợp công cụ di chuyển dữ liệu tự động `npm run migrate:storage` (`backend/scripts/migrate_to_supabase_storage.ts`) hỗ trợ đồng bộ hàng loạt ảnh lên Cloud khi cần.

---

### 3. MODULE RAG & TRỢ LÝ AI GIA PHẢ (Retrieval-Augmented Generation)

Hệ thống RAG được thiết kế theo kiến trúc kép (**Hybrid RAG Engine**), ưu tiên tối đa cho việc vận hành Cloud 100% miễn phí mà vẫn sẵn sàng chuyển đổi sang giải pháp hoàn toàn Offline/Local:

```mermaid
sequenceDiagram
    autonumber
    actor User as Con Cháu Dòng Họ
    participant Front as Giao diện Web
    participant Back as Backend API Gateway
    participant RAG as RAG Retrieval Engine
    participant DB as PostgreSQL Supabase
    participant Gemini as Google Gemini 3.6 Flash

    User->>Front: Gửi câu hỏi tra cứu gia phả
    Front->>Back: POST /api/chat
    Back->>RAG: Phân tích ý định và từ khóa thực thể
    
    alt Truy vấn về Nhân thân hoặc Thế hệ
        RAG->>DB: Truy vấn quan hệ gia đình (Cha, Mẹ, Vợ, Con)
        DB-->>RAG: Trả về hồ sơ thành viên liên quan
    else Truy vấn về Kỵ nhật hoặc Mộ phần
        RAG->>RAG: Đọc sổ kỵ nhật âm lịch và vị trí mồ mả
    end

    RAG->>RAG: Tổng hợp ngữ cảnh văn hóa trang trọng
    RAG->>Gemini: Gửi Prompt và Context kèm Header API Key
    
    alt Xử lý thành công
        Gemini-->>RAG: Trả về câu trả lời chuẩn xác tôn kính
    else Gặp lỗi quá tải 503 hoặc 429
        RAG->>RAG: Kích hoạt Auto-retry với Exponential Backoff
        RAG->>Gemini: Thử lại yêu cầu tự động
        Gemini-->>RAG: Trả về kết quả sau khi hồi phục
    end

    RAG-->>Back: Chuyển tiếp câu trả lời hoàn chỉnh
    Back-->>Front: Phản hồi JSON kết quả
    Front-->>User: Hiển thị câu trả lời trang trọng và đẹp mắt
```

#### a. Cơ chế RAG Tích hợp Trực tiếp (Cloud-Native In-Backend RAG Engine)
Được tích hợp trực tiếp trong `backend/src/services/ragService.ts`, giải pháp này tối ưu hóa tài nguyên: **không cần chạy thêm container Python riêng**, tiết kiệm 100% RAM và chi phí trên Cloud.

- **Kho Tri Thức Chuẩn Hóa Chuyên Biệt (Structured Knowledge Base)**:
  Tọa lạc tại `backend/src/data/knowledge/`, bao gồm 3 tài liệu lõi:
  1. `tong_quan_va_thong_ke_dong_ho.md`: Lịch sử khai hoang lập ấp tại Thôn An Lợi, nguồn gốc thủy tổ, công thức quy đổi thế hệ (**Đời Chi 2 + 8 = Đời Phái 4**), tổng quan thống kê số liệu 8 thế hệ.
  2. `lich_gio_ky_va_an_tang.md`: Sổ kỵ nhật sắp xếp tuần tự theo 12 tháng Âm lịch và danh mục vị trí mồ mả, nghĩa trang tiền nhân (Cồn Giữa, Đồng Giám, Lai Bình...).
  3. `gia_pha_chi_tiet_ho_le_van.md`: Hồ sơ từng cụ tiền nhân với cấu trúc trường dữ liệu chặt chẽ (Họ tên, Thế hệ, Thân phụ, Thân mẫu, Phối ngẫu, Con cái, Anh chị em ruột, Ngày kỵ, Nơi an táng, Tiểu sử công đức).

- **Thuật toán Trích Xuất Ngữ Cảnh Lai (Hybrid Context Retrieval)**:
  - **Phân tích thực thể (Named Entity Recognition)**: Bóc tách tên thành viên (ví dụ: *Lê Văn Khôi, Lê Văn Thường, Lê Gia Khánh, Ben...*), số thế hệ hoặc các mốc thời gian âm lịch.
  - **Mở rộng quan hệ đa thế hệ**: Tự động gom thêm hồ sơ của thân phụ mẫu, phối ngẫu, con cái và anh chị em ruột vào ngữ cảnh để AI trả lời chính xác, mạch lạc toàn bộ cây huyết thống.
  - **Trích xuất theo chủ đề kỵ nhật**: Nếu câu hỏi nhắc đến "giỗ", "kỵ", "mộ", "an táng", "tháng 8"... → tự động trích lọc các trang kỵ nhật âm lịch tương ứng.
  - **Tự động làm sạch dữ liệu đầu vào**: Lọc bỏ triệt để toàn bộ mã ID nội bộ (`ID: xxxx`) và tiền tố danh xưng sai lệch trước khi nạp ngữ cảnh vào mô hình LLM.

- **Bộ Quy Tắc Prompt & Xử Lý Chuẩn Mực Văn Hóa (Culture-Aware System Prompt)**:
  - **Mẫu trả lời chuẩn hóa đồng bộ**: Bất kể hỏi về ai, AI luôn xuất định dạng danh sách gạch đầu dòng chi tiết: Họ tên, Thế thứ, Giới tính, Tình trạng, Năm sinh, Ngày mất/giỗ nếu mất, Nguyên quán, Nghề nghiệp, Quan hệ thân tộc (Thân phụ, Thân mẫu, Phối ngẫu, Con cái, Anh chị em ruột), Tiểu sử/Ghi chú. Tuyệt đối không trả lời cụt ngủn hay tóm tắt sơ sài.
  - **Tuyệt đối ẩn mã ID**: Toàn bộ câu trả lời không xuất hiện bất kỳ mã số ID hệ thống nào, đảm bảo văn phong tự nhiên, thuần phả hệ.
  - **Chuẩn hóa danh xưng người không rõ giới tính**: Với các thành viên mang tên `LÊ HVVD` có giới tính "Không rõ", chỉ gọi đúng họ tên `LÊ HVVD`, tuyệt đối không tự gán danh xưng (Anh, Chị, Ông, Bà, Cụ, Cháu, Bé) để giữ gìn sự tôn kính trang nghiêm.
  - **Kết nối Google Gemini 3.6 Flash & Xử lý Ổn định**: Tự động thử lại (Exponential Backoff) khi gặp quá tải 503 hoặc giới hạn tần suất 429 từ Google AI Studio.

#### b. Microservice Python FastAPI Độc lập (`rag-service`) - *Dùng cho Local / Docker*
Dành riêng cho môi trường nghiên cứu hoặc triển khai cục bộ không cần kết nối Internet:
- **Ngăn xếp công nghệ**: Python 3.10+, **FastAPI**, **LangChain**, **ChromaDB**, và **Ollama** (`qwen2.5:7b` + `nomic-embed-text`).
- **Quy trình Ingestion (`ingest.py`)**:
  - Phân mảnh văn bản bằng `RecursiveCharacterTextSplitter` (chunk_size: 500 ký tự, chunk_overlap: 50 ký tự).
  - Tạo vector nhúng và lưu trữ bền vững vào ChromaDB trên đĩa (`/app/data/vector_store`).
- **Kịch bản Tự động Sinh Tri thức (`rag-service/scripts/generate_rag_documents.py`)**:
  - Quét cơ sở dữ liệu `members.json` để tự động tái tạo toàn bộ các file Markdown trong kho tri thức khi có thay đổi dữ liệu gia phả.

---

## 🗄️ Thiết Kế Cơ Sở Dữ Liệu Chi Tiết (PostgreSQL Schema)

Sơ đồ quan hệ thực thể (ERD) của hệ thống:

```mermaid
erDiagram
    USERS ||--o{ NEWS : creates
    USERS ||--o{ DOCUMENTS : uploads
    MEMBERS ||--o{ MEMBERS : parent_of

    USERS {
        int id PK
        string phone "Unique phone number"
        string password_hash "Bcrypt password hash"
        string full_name "Full name"
        string role "admin member or guest"
        string avatar_url "Supabase CDN avatar URL"
        boolean is_active "Active status"
        timestamp created_at "Created timestamp"
    }

    MEMBERS {
        int id PK
        string full_name "Full name"
        string birth_name "Birth name"
        int generation_in_branch "Generation 1 to 8"
        string gender "male female or unknown"
        string birth_date "Birth date"
        string death_date "Death date lunar"
        boolean is_deceased "Deceased status"
        string occupation "Occupation"
        string avatar_url "Supabase CDN avatar URL"
        text bio "Biography"
        string burial_place "Burial location"
        string hometown "Hometown"
        string spouse_type "Chanh phoi or Thu phoi"
        int father_id FK "References members id"
        int mother_id FK "References members id"
        int spouse_id FK "References members id"
        timestamp created_at "Created timestamp"
        timestamp updated_at "Updated timestamp"
    }

    NEWS {
        int id PK
        string title "Article title"
        string slug "Unique SEO slug"
        text content "Article content"
        string thumbnail_url "Supabase CDN thumbnail URL"
        string category "news event or announcement"
        int author_id FK "References users id"
        boolean is_published "Published status"
        int view_count "View counter"
        timestamp published_at "Published timestamp"
    }

    DOCUMENTS {
        int id PK
        string title "Document title"
        string file_url "Supabase CDN document URL"
        string file_type "pdf image or doc"
        int uploaded_by FK "References users id"
        timestamp created_at "Created timestamp"
    }
```

---

## 📁 Cấu Trúc Thư Mục Toàn Dự Án (Project Structure)

```
Portal-HoLeVan-Phai4-Chi2/
├── .env.example                          # Mẫu khai báo biến môi trường chuẩn hóa
├── .gitignore                            # Danh sách tệp nhạy cảm cần loại trừ khỏi git
├── admin.txt                             # Thông tin tài khoản quản trị (đã gitignore an toàn)
├── docker-compose.yml                    # Cấu hình Docker Compose đa container cục bộ
├── README.md                             # Tài liệu kiến trúc và hướng dẫn toàn diện
│
├── backend/                              # [MODULE 2] MÁY CHỦ BACKEND API (Node.js/Express)
│   ├── scripts/
│   │   └── copy_knowledge.js             # Sao chép tệp Markdown tri thức vào thư mục dist khi build
│   ├── src/
│   │   ├── config/                       # db.ts (PostgreSQL Pool), initSql.ts, seed_members.ts
│   │   ├── controllers/                  # authController, membersController, memorialsController, newsController, chatController
│   │   ├── data/
│   │   │   ├── knowledge/                # 3 Tệp Markdown tri thức phục vụ In-Backend RAG
│   │   │   │   ├── gia_pha_chi_tiet_ho_le_van.md
│   │   │   │   ├── lich_gio_ky_va_an_tang.md
│   │   │   │   └── tong_quan_va_thong_ke_dong_ho.md
│   │   │   └── members.json              # Bản ghi 313 thành viên có cấu trúc dữ liệu
│   │   ├── middleware/                   # auth.ts (JWT RBAC), upload.ts (Supabase Storage)
│   │   ├── routes/                       # auth.ts, members.ts, memorials.ts, news.ts, chat.ts
│   │   ├── services/                     # ragService.ts (RAG Engine + Gemini Flash API)
│   │   └── server.ts                     # Điểm khởi chạy ứng dụng Express
│   ├── Dockerfile                        # Đóng gói image Node.js 22 Alpine
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # [MODULE 1] ỨNG DỤNG GIAO DIỆN CLIENT (React/Vite)
│   ├── src/
│   │   ├── components/                   # FamilyTree (@xyflow/react), Chatbot, Layout, Modals
│   │   ├── data/members.json             # Dữ liệu tĩnh dự phòng ngoại tuyến (Offline Fallback)
│   │   ├── hooks/                        # useChat.ts, useAuth.ts
│   │   ├── pages/                        # HomePage, FamilyTreePage, MemorialCalendarPage, NewsPage, NewsDetailPage
│   │   ├── services/                     # api.ts (Axios Base Instance & Interceptors)
│   │   └── store/                        # authStore.ts (Zustand Global State)
│   ├── vercel.json                       # Cấu hình định tuyến SPA cho Vercel Edge
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
└── rag-service/                          # [MODULE 3] DỊCH VỤ PYTHON RAG (Tùy chọn Local/Docker)
    ├── data/raw_documents/               # Thư mục chứa tài liệu thô nạp Vector DB
    ├── scripts/
    │   └── generate_rag_documents.py     # Công cụ bóc tách members.json ra các file Markdown
    ├── src/
    │   ├── config.py                     # Cấu hình Pydantic Settings
    │   ├── ingest.py                     # Module cắt văn bản và vector hóa vào ChromaDB
    │   ├── main.py                       # Máy chủ FastAPI & REST/Streaming Endpoints
    │   ├── models.py                     # Pydantic Schemas
    │   └── rag_pipeline.py               # Chuỗi xử lý LangChain + ChromaDB + Ollama/Gemini
    ├── Dockerfile
    └── requirements.txt
```

---

## 🔐 Danh Mục Biến Môi Trường (Environment Variables)

### 1. Dành cho Backend (`backend/.env` hoặc cấu hình trên Render)

| Tên Biến | Bắt Buộc | Ý Nghĩa / Giá Trị Mẫu |
|---|:---:|---|
| `PORT` | Không | Cổng dịch vụ chạy (mặc định: `5000`) |
| `NODE_ENV` | Có | Môi trường (`production` hoặc `development`) |
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL Supabase (`postgresql://postgres.[ref]:[pass]@...:6543/postgres`) |
| `JWT_SECRET` | Có | Khóa bí mật ký phát JWT token (tối thiểu 32 ký tự ngẫu nhiên) |
| `SUPABASE_URL` | Có | Địa chỉ Project Supabase (`https://[project-ref].supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Có | Khóa `service_role` quản trị để ghi file vào Storage Bucket |
| `SUPABASE_STORAGE_BUCKET` | Có | Tên bucket lưu ảnh trên Supabase (mặc định: `uploads`) |
| `GEMINI_API_KEY` | Có | Khóa API lấy từ [Google AI Studio](https://aistudio.google.com/) |

### 2. Dành cho Frontend (`frontend/.env` hoặc cấu hình trên Vercel)

| Tên Biến | Bắt Buộc | Loại Biến | Ý Nghĩa / Giá Trị Mẫu |
|---|:---:|:---:|---|
| `VITE_API_URL` | Có | `Config` | Đường dẫn API Backend (`https://<ten-backend>.onrender.com/api`) |

---

## 🚀 Hướng Dẫn Triển Khai Thực Tế (Production Deployment)

Hệ thống được thiết kế tối ưu hóa 100% để vận hành liên tục không tốn chi phí trên các nền tảng Cloud hiện đại:

### Bước 1: Thiết lập Cơ sở dữ liệu & Storage trên Supabase Cloud
1. Đăng ký tài khoản miễn phí tại [Supabase](https://supabase.com/) và tạo một Project mới.
2. Điều hướng tới **Project Settings** → **Database** → Tìm mục **Connection Pooling** → Sao chép chuỗi kết nối URI dạng `Transaction` hoặc `Session`.
3. Điều hướng tới **Storage** → Nhấn **New Bucket** → Đặt tên `uploads` → Đánh dấu chọn **Public bucket** → Nhấn **Save**.
4. Điều hướng tới **Project Settings** → **API** → Sao chép `Project URL` và khóa `service_role` (bí mật).

### Bước 2: Triển khai Backend API trên Render
1. Đăng nhập [Render Dashboard](https://dashboard.render.com/) → Chọn **New** → **Web Service**.
2. Kết nối với kho mã nguồn GitHub của dự án.
3. Thiết lập thông số:
   - **Name:** `portal-holevan-phai4-chi2`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`
4. Mở rộng mục **Advanced** → **Environment Variables**, thêm đầy đủ các biến:
   - `DATABASE_URL`: *(Dán chuỗi kết nối từ Supabase)*
   - `JWT_SECRET`: *(Tạo chuỗi bảo mật ngẫu nhiên dài từ 32 ký tự)*
   - `SUPABASE_URL`: *(Dán Project URL từ Supabase)*
   - `SUPABASE_SERVICE_ROLE_KEY`: *(Dán key service_role từ Supabase)*
   - `SUPABASE_STORAGE_BUCKET`: `uploads`
   - `GEMINI_API_KEY`: *(Dán API Key từ Google AI Studio)*
   - `NODE_ENV`: `production`
5. Nhấn **Deploy Web Service** và chờ Render hoàn tất quá trình build. Sao chép đường dẫn Web Service được cấp (ví dụ: `https://portal-holevan-phai4-chi2.onrender.com`).

### Bước 3: Triển khai Giao diện Người dùng trên Vercel
1. Đăng nhập [Vercel Dashboard](https://vercel.com/) → Nhấn **Add New...** → **Project**.
2. Import kho mã nguồn GitHub của dự án.
3. Trong phần cấu hình:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Nhấn **Edit** và chọn thư mục `frontend`.
4. Mở rộng phần **Environment Variables**:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://portal-holevan-phai4-chi2.onrender.com/api` *(Lưu ý có đuôi `/api`)*
   - **Type:** Chọn `Config` (chế độ công khai cho client Vite).
5. Nhấn **Deploy**. Sau khi hoàn tất, bạn có thể truy cập website tại đường link Vercel cung cấp.

---

## 💻 Hướng Dẫn Chạy Môi Trường Cục Bộ (Local Development)

### Cách 1: Sử dụng Docker Compose (Đầy đủ toàn bộ dịch vụ)
Yêu cầu máy tính đã cài đặt **Docker Desktop**.

```bash
# Clone kho mã nguồn về máy tính
git clone https://github.com/LGKAI/Portal-HoLeVan-Phai4-Chi2.git
cd Portal-HoLeVan-Phai4-Chi2

# Khởi tạo và chạy đồng thời: PostgreSQL, Backend, Frontend, Python RAG Service
docker compose up -d --build

# Theo dõi log hoạt động của các container
docker compose logs -f
```

Địa chỉ truy cập các dịch vụ:
- **Giao diện Frontend:** [http://localhost:3000](http://localhost:3000)
- **Cổng Backend API:** [http://localhost:5000](http://localhost:5000)
- **Cơ sở dữ liệu PostgreSQL:** `localhost:5432`
- **Dịch vụ Python RAG (FastAPI):** [http://localhost:8000](http://localhost:8000)

---

### Cách 2: Khởi chạy Thủ công từng phần (Dành cho Lập trình viên)

#### 1. Khởi chạy Backend API:
```bash
cd backend
npm install
npm run dev
# Máy chủ Express lắng nghe tại http://localhost:5000
```

#### 2. Khởi chạy Giao diện Frontend:
```bash
# Mở một cửa sổ Terminal mới
cd frontend
npm install
npm run dev
# Giao diện Vite khởi chạy tại http://localhost:5173
```

#### 3. (Tùy chọn) Khởi chạy Python RAG Service:
```bash
# Mở một cửa sổ Terminal mới
cd rag-service
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
# FastAPI khởi chạy tại http://localhost:8000
```

---

## 🛡️ Bản Quyền & Cam Kết Bảo Mật (Security & Copyright)

1. **Quyền Sở Hữu Dữ Liệu**:
   - Toàn bộ dữ liệu phả hệ, thông tin thân tộc, hình ảnh và vị trí mồ mả thuộc quyền sở hữu thiêng liêng của Hội đồng Gia tộc **Họ Lê Văn - Phái 4 - Chi 2**, Thôn An Lợi, Xã Triệu Bình, Huyện Triệu Phong, Tỉnh Quảng Trị.
   - Dự án được xây dựng với lòng thành kính tri ân công đức tổ tiên, phụng sự việc họ, kết nối thế hệ con cháu muôn đời sau.

2. **Nguyên Tắc Bảo Mật**:
   - Mã nguồn công khai trên GitHub hoàn toàn tuân thủ các quy chuẩn bảo mật: tuyệt đối không lưu vết mật khẩu, khóa API bí mật hay chuỗi kết nối nhạy cảm trong mã nguồn hoặc lịch sử commit.
   - Tất cả tài khoản quản trị và khóa kết nối trên môi trường vận hành thực tế đều được bảo vệ nghiêm ngặt qua biến môi trường độc lập.