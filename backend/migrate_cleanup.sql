-- ========================================
-- MIGRATION: Dọn dẹp database dư thừa
-- Portal Họ Lê Văn - Phái 4 - Chi 2
-- ========================================
-- Chạy script này trên Supabase SQL Editor:
-- https://supabase.com/dashboard > SQL Editor > New Query
-- Rồi dán toàn bộ nội dung này vào và bấm "Run"
-- ========================================

-- BƯỚC 1: Xóa các bảng không sử dụng (theo thứ tự để tránh lỗi foreign key)
-- Bảng quiz_attempts phụ thuộc vào quiz_sets, phải xóa trước
DROP TABLE IF EXISTS quiz_attempts CASCADE;

-- Bảng questions phụ thuộc vào quiz_sets
DROP TABLE IF EXISTS questions CASCADE;

-- Bảng quiz_sets
DROP TABLE IF EXISTS quiz_sets CASCADE;

-- Bảng documents (tư liệu cũ - đã gộp vào bảng news)
DROP TABLE IF EXISTS documents CASCADE;

-- BƯỚC 2: Thêm các index còn thiếu cho bảng news (nếu chưa có)
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);

-- BƯỚC 3: Kiểm tra kết quả - liệt kê các bảng còn lại
-- Bạn sẽ thấy chỉ còn: users, members, news
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
