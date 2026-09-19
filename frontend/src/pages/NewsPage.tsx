import React, { useEffect, useState, useCallback, useRef } from 'react';
import NewsCard from '../components/News/NewsCard';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { Crop as CropIcon, X, Upload, Trash2 } from 'lucide-react';
import RichDocEditor, { toHtmlFormat } from '../components/News/RichDocEditor';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newThumb, setNewThumb] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // States for cover image cropper
  const [coverImageSrc, setCoverImageSrc] = useState<string | null>(null);
  const [isCroppingCover, setIsCroppingCover] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const fetchNews = async () => {
    try {
      const res = await newsService.getNewsList({});
      setNews(res);
    } catch (error) {
      console.error("Lỗi khi tải tư liệu - sự kiện:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const createSlug = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '') + '-' + Date.now();
  };

  const openAdd = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setNewThumb('');
    setFile(null);
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverPreviewUrl(null);
    setCoverImageSrc(null);
    setIsAddOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewContent(toHtmlFormat(item.content));
    setNewThumb(item.thumbnail_url || '');
    setFile(null);
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverPreviewUrl(item.thumbnail_url || null);
    setCoverImageSrc(null);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await newsService.deleteNews(id);
        fetchNews();
      } catch (error) {
        alert("Lỗi khi xóa bài viết.");
      }
    }
  };

  // Xử lý khi chọn file ảnh bìa từ máy tính -> mở Cropper
  const onCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCoverImageSrc(reader.result?.toString() || null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setIsCroppingCover(true);
      });
      reader.readAsDataURL(selectedFile);
      e.target.value = '';
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // Áp dụng ảnh bìa sau khi cắt
  const applyCroppedCover = useCallback(async () => {
    try {
      if (coverImageSrc && croppedAreaPixels) {
        const croppedFile = await getCroppedImg(coverImageSrc, croppedAreaPixels, 'cover.jpg');
        setFile(croppedFile);
        if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(coverPreviewUrl);
        }
        setCoverPreviewUrl(URL.createObjectURL(croppedFile));
        setNewThumb('');
        setIsCroppingCover(false);
      }
    } catch (err) {
      console.error('Lỗi khi cắt ảnh bìa:', err);
      alert('Không thể cắt ảnh bìa. Vui lòng thử lại.');
    }
  }, [coverImageSrc, croppedAreaPixels, coverPreviewUrl]);

  // Gỡ ảnh bìa
  const removeCoverImage = () => {
    setFile(null);
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverPreviewUrl(null);
    setCoverImageSrc(null);
    setNewThumb('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('content', newContent);
      if (file) {
        formData.append('thumbnail', file);
      } else {
        formData.append('thumbnail_url', newThumb || coverPreviewUrl || '');
      }

      if (editingId) {
        await newsService.updateNews(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        formData.append('slug', createSlug(newTitle));
        formData.append('category', 'event');
        formData.append('is_published', 'true');
        await newsService.createNews(formData);
        alert("Đăng bài thành công!");
      }
      setIsAddOpen(false);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      setNewThumb('');
      setFile(null);
      setCoverPreviewUrl(null);
      setCoverImageSrc(null);
      fetchNews();
    } catch (error: any) {
      console.error("Lỗi khi lưu bài viết:", error?.response?.data || error);
      alert("Lỗi khi lưu bài viết: " + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Tư liệu - Sự kiện Dòng họ</h1>
          <p className="text-gray-600">Nơi cập nhật thông báo, hình ảnh tư liệu và các sự kiện quan trọng của dòng họ.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium shadow transition-colors flex items-center gap-2"
          >
            + Đăng bài mới
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-cream rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 italic">Hiện tại chưa có tư liệu hoặc sự kiện nào được đăng tải.</p>
        </div>
      )}

      {/* Modal Add/Edit News */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-5 pb-3 border-b">
              <h2 className="text-2xl font-bold text-dark">
                {editingId ? 'Sửa bài viết' : 'Đăng tư liệu / sự kiện mới'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              {/* Tiêu đề */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề tư liệu hoặc sự kiện..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              {/* Ảnh bìa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ảnh bìa bài viết (Hỗ trợ căn chỉnh & cắt ảnh)
                </label>

                {/* Khung xem trước hoặc nút chọn ảnh bìa */}
                {coverPreviewUrl || newThumb ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 group">
                      <div className="w-full aspect-[16/9] max-h-[260px] overflow-hidden flex items-center justify-center bg-black/5">
                        <img
                          src={coverPreviewUrl || newThumb}
                          alt="Ảnh bìa bài viết"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {coverImageSrc && (
                          <button
                            type="button"
                            onClick={() => setIsCroppingCover(true)}
                            className="px-3.5 py-2 bg-white text-gray-800 rounded-lg shadow-md font-medium text-sm hover:bg-gray-100 flex items-center gap-1.5"
                          >
                            <CropIcon size={16} /> Cắt lại ảnh
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-primary text-white rounded-lg shadow-md font-medium text-sm hover:bg-primary-dark flex items-center gap-1.5"
                        >
                          <Upload size={16} /> Đổi ảnh khác
                        </button>
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="px-3.5 py-2 bg-red-600 text-white rounded-lg shadow-md font-medium text-sm hover:bg-red-700 flex items-center gap-1.5"
                        >
                          <Trash2 size={16} /> Gỡ ảnh
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Ảnh bìa bài viết</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          <Upload size={13} /> Tải ảnh mới từ máy tính
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="text-red-500 hover:underline font-medium flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Gỡ ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-3 border-2 border-dashed border-primary/50 hover:border-primary rounded-xl text-primary bg-primary/5 hover:bg-primary/10 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload size={18} />
                      Tải ảnh bìa lên & Căn chỉnh
                    </button>
                    <span className="text-xs text-gray-400">hoặc nhập URL:</span>
                    <input
                      type="text"
                      placeholder="Dán link ảnh https://..."
                      value={newThumb}
                      onChange={(e) => {
                        setNewThumb(e.target.value);
                        setCoverPreviewUrl(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onCoverFileChange}
                  className="hidden"
                />
              </div>

              {/* Nội dung bài viết (Trình soạn thảo phong phú như tài liệu Word) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nội dung bài viết * (Hỗ trợ chèn & dán ảnh trực tiếp Ctrl+V)
                </label>
                <RichDocEditor
                  value={newContent}
                  onChange={setNewContent}
                />
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium shadow-md transition-colors"
                >
                  {editingId ? 'Cập nhật bài viết' : 'Đăng bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Căn chỉnh & Cắt ảnh bìa (Cover Image Cropper Modal) */}
      {isCroppingCover && coverImageSrc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CropIcon size={20} className="text-primary" /> Căn chỉnh & Cắt ảnh bìa
              </h3>
              <button
                type="button"
                onClick={() => setIsCroppingCover(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thanh công cụ tỉ lệ khung hình (Aspect Ratio Bar) */}
            <div className="px-5 py-2.5 bg-gray-50 border-b flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Tỉ lệ cắt:</span>
                <button
                  type="button"
                  onClick={() => setAspectRatio(16 / 9)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    aspectRatio === 16 / 9
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  16:9 (Chuẩn bìa)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(4 / 3)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    aspectRatio === 4 / 3
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  4:3
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(1)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    aspectRatio === 1
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1:1 (Vuông)
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio(undefined)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    aspectRatio === undefined
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tự do
                </button>
              </div>

              {/* Thanh trượt zoom */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Phóng to:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-28 accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Vùng Cropper */}
            <div className="relative flex-1 bg-gray-900">
              <Cropper
                image={coverImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsCroppingCover(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={applyCroppedCover}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-sm shadow transition-colors"
              >
                Áp dụng ảnh này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
