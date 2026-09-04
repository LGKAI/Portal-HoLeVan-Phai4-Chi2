import React, { useEffect, useState } from 'react';
import NewsCard from '../components/News/NewsCard';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../store/authStore';

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

  const fetchNews = async () => {
    try {
      const res = await newsService.getNewsList({});
      setNews(res);
    } catch (error) {
      console.error("Lỗi khi tải sự kiện:", error);
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
    setIsAddOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setNewTitle(item.title);
    setNewContent(item.content);
    setNewThumb(item.thumbnail_url || '');
    setFile(null);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await newsService.deleteNews(id);
        fetchNews();
      } catch (error) {
        alert("Lỗi khi xóa sự kiện.");
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      alert("Vui lòng nhập đủ tiêu đề và nội dung.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('content', newContent);
      if (file) {
        formData.append('thumbnail', file);
      } else {
        formData.append('thumbnail_url', newThumb);
      }
      
      if (editingId) {
        await newsService.updateNews(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        formData.append('slug', createSlug(newTitle));
        formData.append('category', 'event');
        formData.append('is_published', 'true');
        await newsService.createNews(formData);
        alert("Đăng sự kiện thành công!");
      }
      setIsAddOpen(false);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      setNewThumb('');
      setFile(null);
      fetchNews();
    } catch (error: any) {
      console.error("Lỗi khi lưu sự kiện:", error?.response?.data || error);
      alert("Lỗi khi lưu sự kiện: " + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Sự kiện dòng họ</h1>
          <p className="text-gray-600">Nơi cập nhật thông báo và các sự kiện quan trọng của dòng họ.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium shadow transition-colors"
          >
            + Đăng sự kiện
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
          <p className="text-gray-500 italic">Hiện tại chưa có sự kiện nào được đăng tải.</p>
        </div>
      )}

      {/* Modal Add/Edit News */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-dark">{editingId ? 'Sửa sự kiện' : 'Đăng sự kiện mới'}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa (Tải lên)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border rounded-md"
                />
              </div>
              <div className="text-center text-sm text-gray-500">Hoặc sử dụng URL ảnh:</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Ảnh bìa</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newThumb}
                  onChange={(e) => setNewThumb(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary min-h-[200px]"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-medium"
                >
                  {editingId ? 'Cập nhật' : 'Đăng tải'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage;
