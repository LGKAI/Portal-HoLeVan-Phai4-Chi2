export const defaultPostgresSchema = `
-- 1. Bảng Người dùng hệ thống (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
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

-- Index hỗ trợ truy vấn cây gia phả
CREATE INDEX IF NOT EXISTS idx_members_generation ON members(generation_in_branch);
CREATE INDEX IF NOT EXISTS idx_members_father ON members(father_id);
CREATE INDEX IF NOT EXISTS idx_members_mother ON members(mother_id);
CREATE INDEX IF NOT EXISTS idx_members_spouse ON members(spouse_id);

-- 3. Bảng Tin tức / Sự kiện dòng họ (News)
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(20) DEFAULT 'news' CHECK (category IN ('news', 'event', 'announcement')),
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0
);

-- 4. Bảng Tư liệu / Văn bản lịch sử (Documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    doc_type VARCHAR(20) DEFAULT 'text' CHECK (doc_type IN ('text', 'image', 'video', 'pdf')),
    author_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Bộ câu hỏi đố vui gia phả (QuizSets)
CREATE TABLE IF NOT EXISTS quiz_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Câu hỏi (Questions)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_set_id INT REFERENCES quiz_sets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer INT NOT NULL,
    explanation TEXT,
    order_num INT DEFAULT 1
);

-- 7. Bảng Kết quả thi đố (QuizAttempts)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    quiz_set_id INT REFERENCES quiz_sets(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    answers TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tài khoản Admin mặc định (mật khẩu: Admin@123456)
INSERT INTO users (phone, password_hash, full_name, role)
VALUES ('0901234567', '$2a$10$Gj.6jCMx1vcs0gQOjckoguDrl6Y3mX5F0EUl7jqkdeTMMd/QNfPyW', 'Quản trị viên', 'admin')
ON CONFLICT (phone) DO NOTHING;
`;
