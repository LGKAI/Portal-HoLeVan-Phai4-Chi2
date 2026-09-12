import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createClient } from '@supabase/supabase-js';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

const ensureDirExists = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        let dest = path.join(uploadDir, 'general');
        if (file.fieldname === 'avatar') {
            dest = path.join(uploadDir, 'avatars');
        } else if (file.fieldname === 'thumbnail') {
            dest = path.join(uploadDir, 'thumbnails');
        }
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Khởi tạo Supabase client nếu có cấu hình
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

const supabaseClient = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/**
 * Xử lý file tải lên:
 * - Nếu có Supabase Storage: Tải trực tiếp lên Cloud bucket và trả về URL HTTPS vĩnh viễn (chống mất file trên Render).
 * - Nếu không có Supabase: Dùng đường dẫn cục bộ /uploads/...
 */
export const processUploadedFile = async (
    file: Express.Multer.File,
    subfolder: 'avatars' | 'thumbnails' | 'general' = 'general'
): Promise<string> => {
    if (supabaseClient) {
        try {
            const fileBuffer = file.buffer || (file.path && fs.existsSync(file.path) ? fs.readFileSync(file.path) : null);
            if (fileBuffer) {
                const ext = path.extname(file.originalname) || '.jpg';
                const remotePath = `${subfolder}/${subfolder}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

                const { data, error } = await supabaseClient.storage
                    .from(supabaseBucket)
                    .upload(remotePath, fileBuffer, {
                        contentType: file.mimetype || 'image/jpeg',
                        upsert: true
                    });

                if (error) {
                    console.error('Supabase Storage upload error:', error.message);
                } else if (data) {
                    const { data: publicData } = supabaseClient.storage
                        .from(supabaseBucket)
                        .getPublicUrl(remotePath);

                    // Xóa file tạm cục bộ sau khi đã đẩy lên Cloud thành công
                    if (file.path && fs.existsSync(file.path)) {
                        try { fs.unlinkSync(file.path); } catch (_) {}
                    }

                    console.log(`Đã tải ảnh lên Supabase Storage thành công: ${publicData.publicUrl}`);
                    return publicData.publicUrl;
                }
            }
        } catch (err) {
            console.error('Không thể tải file lên Supabase Storage:', err);
        }
    }

    // Fallback nếu không có Supabase: trả về đường dẫn local
    return `/uploads/${subfolder}/${file.filename}`;
};
