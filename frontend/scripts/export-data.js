import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const DATA_DIR = path.join(__dirname, '../src/data');
const PUBLIC_UPLOADS_DIR = path.join(__dirname, '../public/uploads');

// Hàm lấy tất cả file trong thư mục đệ quy
function getAllFiles(dir, base = '') {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.join(base, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath, relPath));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

// Hàm dọn dẹp các thư mục con rỗng
function cleanEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanEmptyDirs(fullPath);
      if (fs.readdirSync(fullPath).length === 0) {
        try {
          fs.rmdirSync(fullPath);
        } catch (_) {}
      }
    }
  }
}

async function exportData() {
  console.log('🔄 Đang kết nối tới Backend tại:', BACKEND_URL);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let members = [];
  let news = [];
  let donations = [];
  let hasBackendData = false;

  // 1. Export Members
  try {
    const mRes = await fetch(`${BACKEND_URL}/api/members`);
    if (mRes.ok) {
      const mJson = await mRes.json();
      members = mJson.data || [];
      fs.writeFileSync(path.join(DATA_DIR, 'members.json'), JSON.stringify(members, null, 2), 'utf8');
      console.log(`✅ Đã xuất ${members.length} thành viên vào src/data/members.json`);
      hasBackendData = true;
    }
  } catch (err) {
    console.error('❌ Lỗi khi xuất thành viên từ Backend:', err.message);
  }

  // 2. Export News
  try {
    const nRes = await fetch(`${BACKEND_URL}/api/news`);
    if (nRes.ok) {
      const nJson = await nRes.json();
      news = nJson.data || [];
      fs.writeFileSync(path.join(DATA_DIR, 'news.json'), JSON.stringify(news, null, 2), 'utf8');
      console.log(`✅ Đã xuất ${news.length} bài viết vào src/data/news.json`);
      hasBackendData = true;
    }
  } catch (err) {
    console.error('❌ Lỗi khi xuất bài viết từ Backend:', err.message);
  }

  // 3. Export Donations
  try {
    const dRes = await fetch(`${BACKEND_URL}/api/donations`);
    if (dRes.ok) {
      const dJson = await dRes.json();
      donations = dJson.data || [];
      fs.writeFileSync(path.join(DATA_DIR, 'donations.json'), JSON.stringify(donations, null, 2), 'utf8');
      console.log(`✅ Đã xuất ${donations.length} khoản công đức vào src/data/donations.json`);
      hasBackendData = true;
    }
  } catch (err) {
    console.error('❌ Lỗi khi xuất danh sách công đức từ Backend:', err.message);
  }

  // Fallback: Nếu không kết nối được Backend, dùng file JSON đã có sẵn trong src/data
  if (!hasBackendData) {
    console.warn('⚠️ Không tải được dữ liệu từ Backend, đọc file JSON sẵn có trong src/data để kiểm tra ảnh...');
    try {
      if (fs.existsSync(path.join(DATA_DIR, 'members.json'))) {
        members = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'members.json'), 'utf8'));
      }
      if (fs.existsSync(path.join(DATA_DIR, 'news.json'))) {
        news = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'news.json'), 'utf8'));
      }
      if (fs.existsSync(path.join(DATA_DIR, 'donations.json'))) {
        donations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'donations.json'), 'utf8'));
      }
    } catch (e) {
      console.error('❌ Lỗi đọc file JSON dự phòng:', e.message);
    }
  }

  // 4. Lọc toàn bộ đường dẫn ảnh ĐANG HOẠT ĐỘNG trên web (chỉ những ảnh này mới được giữ / xuất)
  const activeImages = new Set();

  for (const m of members) {
    if (m.avatar_url && typeof m.avatar_url === 'string' && m.avatar_url.startsWith('/uploads/')) {
      activeImages.add(path.normalize(m.avatar_url.replace('/uploads/', '')));
    }
  }

  for (const n of news) {
    if (n.thumbnail_url && typeof n.thumbnail_url === 'string' && n.thumbnail_url.startsWith('/uploads/')) {
      activeImages.add(path.normalize(n.thumbnail_url.replace('/uploads/', '')));
    }
    // Quét thêm ảnh chèn trong nội dung bài viết nếu có
    if (n.content && typeof n.content === 'string') {
      const matches = n.content.match(/\/uploads\/[^\s"')<>]+/g);
      if (matches) {
        matches.forEach(m => activeImages.add(path.normalize(m.replace('/uploads/', ''))));
      }
    }
  }

  for (const d of donations) {
    if (d.proof_url && typeof d.proof_url === 'string' && d.proof_url.startsWith('/uploads/')) {
      activeImages.add(path.normalize(d.proof_url.replace('/uploads/', '')));
    }
  }

  console.log(`\n🎯 Tìm thấy ${activeImages.size} ảnh đang hoạt động và hiển thị trên web.`);

  // 5. Đồng bộ CHỈ CÁC ẢNH ĐANG HOẠT ĐỘNG từ Backend / Docker về public/uploads
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }

  let downloadedCount = 0;
  for (const relImg of activeImages) {
    const localPath = path.join(PUBLIC_UPLOADS_DIR, relImg);
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(path.dirname(localPath), { recursive: true });
      const webUrl = `${BACKEND_URL}/uploads/${relImg.split(path.sep).join('/')}`;
      try {
        const imgRes = await fetch(webUrl);
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
          downloadedCount++;
        }
      } catch (e) {
        // Fallback docker cp nếu fetch qua HTTP lỗi
        try {
          const containerSrc = `portal_backend:/app/uploads/${relImg.split(path.sep).join('/')}`;
          execSync(`docker cp "${containerSrc}" "${localPath}"`, { stdio: 'ignore' });
          downloadedCount++;
        } catch (_) {}
      }
    }
  }
  if (downloadedCount > 0) {
    console.log(`📥 Đã tải mới / đồng bộ ${downloadedCount} ảnh đang hoạt động.`);
  }

  // 6. Xoá TOÀN BỘ ảnh cũ / ảnh đã bị thay thế / không còn hiển thị trên web
  const existingFiles = getAllFiles(PUBLIC_UPLOADS_DIR);
  let deletedCount = 0;

  for (const relFile of existingFiles) {
    const normalized = path.normalize(relFile);
    if (!activeImages.has(normalized)) {
      const fullPath = path.join(PUBLIC_UPLOADS_DIR, relFile);
      try {
        fs.unlinkSync(fullPath);
        deletedCount++;
        console.log(`🗑️ Đã xoá ảnh đã bị thay thế (local): ${relFile}`);
      } catch (err) {
        console.warn(`⚠️ Không thể xoá ${relFile}:`, err.message);
      }

      // Xoá luôn file rác trong container Docker nếu container đang chạy
      try {
        const dockerFilePath = `/app/uploads/${relFile.split(path.sep).join('/')}`;
        execSync(`docker exec portal_backend rm -f "${dockerFilePath}"`, { stdio: 'ignore' });
      } catch (_) {}
    }
  }

  cleanEmptyDirs(PUBLIC_UPLOADS_DIR);

  if (deletedCount > 0) {
    console.log(`🧹 Đã dọn dẹp tổng cộng ${deletedCount} file ảnh cũ bị thay thế khỏi public/uploads.`);
  } else {
    console.log(`✨ Thư mục uploads hoàn toàn sạch sẽ, chỉ chứa ảnh đang dùng!`);
  }

  console.log('\n🎉 Quá trình xuất dữ liệu tĩnh hoàn tất! Chỉ dữ liệu đang hiện trên web và ảnh hợp lệ được giữ lại.');
  console.log('👉 Bây giờ bạn có thể an tâm commit và push lên GitHub để Netlify deploy.');
}

exportData();
