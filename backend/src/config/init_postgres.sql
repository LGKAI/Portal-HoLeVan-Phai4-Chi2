-- ========================================
-- Portal Họ Lê Văn - Phái 4 - Chi 2
-- PostgreSQL DDL Initialization Script (Supabase Compatible)
-- Chỉ giữ lại 3 bảng nghiệp vụ thực tế:
--   users, members, news
-- ========================================

-- 1. Bảng Người dùng hệ thống (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest', 'elite')),
    avatar_url VARCHAR(500),
    member_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Thành viên Gia Phả (Members)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    birth_name VARCHAR(100),
    generation_in_branch INT NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    birth_date VARCHAR(100),
    death_date VARCHAR(100),
    is_deceased BOOLEAN DEFAULT FALSE,
    occupation VARCHAR(200),
    avatar_url VARCHAR(500),
    bio TEXT,
    burial_place VARCHAR(300),
    hometown VARCHAR(300),
    spouse_type VARCHAR(50),
    father_id INT REFERENCES members(id) ON DELETE SET NULL,
    mother_id INT REFERENCES members(id) ON DELETE SET NULL,
    spouse_id INT REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL
);

-- Index hỗ trợ truy vấn cây gia phả nhanh chóng
CREATE INDEX IF NOT EXISTS idx_members_generation ON members(generation_in_branch);
CREATE INDEX IF NOT EXISTS idx_members_father ON members(father_id);
CREATE INDEX IF NOT EXISTS idx_members_mother ON members(mother_id);
CREATE INDEX IF NOT EXISTS idx_members_spouse ON members(spouse_id);

-- 3. Bảng Tin tức / Sự kiện / Tư liệu dòng họ (News)
-- (Gộp cả "Tin tức" và "Tư liệu" vào một bảng duy nhất, phân loại qua category)
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(20) DEFAULT 'event' CHECK (category IN ('news', 'event', 'announcement')),
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0
);

-- Index hỗ trợ tìm theo slug và lọc tin tức
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- 4. Tài khoản Admin mặc định (mật khẩu: Admin@123456)
INSERT INTO users (phone, password_hash, full_name, role)
VALUES ('0901234567', '$2a$10$Qdu0xlJipmjUmjJJzdjEsOlr240uAkCv0pSF8O2o5iVkLoayBJ.Wu', 'Quản trị viên', 'admin')
ON CONFLICT (phone) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin';

-- ========================================
-- 5. Kích hoạt Row-Level Security (RLS) bảo mật Supabase
-- ========================================
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news ENABLE ROW LEVEL SECURITY;
