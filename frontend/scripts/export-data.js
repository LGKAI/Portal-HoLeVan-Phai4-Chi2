import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const DATA_DIR = path.join(__dirname, '../src/data');
const PUBLIC_UPLOADS_DIR = path.join(__dirname, '../public/uploads');

async function exportData() {
  console.log('🔄 Đang kết nối tới Backend tại:', BACKEND_URL);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Export Members
  try {
    const mRes = await fetch(`${BACKEND_URL}/api/members`);
    const mJson = await mRes.json();
    const members = mJson.data || [];
    fs.writeFileSync(path.join(DATA_DIR, 'members.json'), JSON.stringify(members, null, 2), 'utf8');
    console.log(`✅ Đã xuất ${members.length} thành viên vào src/data/members.json`);
  } catch (err) {
    console.error('❌ Lỗi khi xuất thành viên:', err.message);
  }

  // 2. Export News
  try {
    const nRes = await fetch(`${BACKEND_URL}/api/news`);
    const nJson = await nRes.json();
    const news = nJson.data || [];
    fs.writeFileSync(path.join(DATA_DIR, 'news.json'), JSON.stringify(news, null, 2), 'utf8');
    console.log(`✅ Đã xuất ${news.length} bài viết vào src/data/news.json`);
  } catch (err) {
    console.error('❌ Lỗi khi xuất bài viết:', err.message);
  }

  // 3. Export Donations
  try {
    const dRes = await fetch(`${BACKEND_URL}/api/donations`);
    const dJson = await dRes.json();
    const donations = dJson.data || [];
    fs.writeFileSync(path.join(DATA_DIR, 'donations.json'), JSON.stringify(donations, null, 2), 'utf8');
    console.log(`✅ Đã xuất ${donations.length} khoản công đức vào src/data/donations.json`);
  } catch (err) {
    console.error('❌ Lỗi khi xuất danh sách công đức:', err.message);
  }

  // 4. Đồng bộ ảnh avatar và thumbnail từ Docker sang public/uploads
  try {
    console.log('🔄 Đang đồng bộ ảnh từ container portal_backend vào public/uploads...');
    execSync('docker cp portal_backend:/app/uploads frontend/public/', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });
    console.log('✅ Đã đồng bộ toàn bộ ảnh đại diện và thumbnail thành công!');
  } catch (err) {
    console.warn('⚠️ Không thể đồng bộ từ Docker (có thể container chưa chạy).');
  }

  console.log('\n🎉 Quá trình xuất dữ liệu tĩnh hoàn tất! Bạn có thể build và deploy lên Netlify.');
}

exportData();
