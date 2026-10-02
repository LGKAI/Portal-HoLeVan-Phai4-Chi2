import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { NewsItem } from '../../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsCardProps {
  news: NewsItem;
  isAdmin?: boolean;
  onEdit?: (news: NewsItem) => void;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, isAdmin, onEdit, onDelete, onApprove }) => {
  const [imgError, setImgError] = React.useState(false);
  const isPending = !news.is_published;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(news.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(news);
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onApprove) onApprove(news.id);
  };

  const CardWrapper = isPending ? 'div' : Link;
  const cardProps = isPending 
    ? { className: "bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-amber-300 relative select-none" } 
    : { to: `/news/${news.slug}`, className: "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full border border-gray-100 relative" };

  return (
    <CardWrapper {...(cardProps as any)}>
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {news.thumbnail_url && !imgError ? (
          <img 
            src={news.thumbnail_url} 
            alt={news.title} 
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ${!isPending ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
            <span className="text-sm font-medium">Tư liệu - Sự kiện</span>
            <span className="text-xs text-gray-400 mt-1">Họ Lê Văn - Phái 4 - Chi 2</span>
          </div>
        )}

        {/* Nút sửa/xóa góc phải trên dành cho bài đã xuất bản */}
        {isAdmin && !isPending && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={handleEdit} className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow z-10" title="Chỉnh sửa bài viết">
              <Edit size={14} />
            </button>
            <button onClick={handleDelete} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow z-10" title="Xóa bài viết">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className={`text-lg font-semibold text-dark mb-2 line-clamp-2 transition-colors ${!isPending ? 'group-hover:text-primary' : ''}`}>
          {news.title}
        </h3>
        
        {/* Footer with Date, Views, and Author */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>{news.published_at ? format(new Date(news.published_at), 'dd/MM/yyyy', { locale: vi }) : 'Vừa xong'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={13} />
              <span>{news.view_count || 0} lượt xem</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-600 truncate mt-0.5">
            Bài viết được đăng bởi <span className="font-semibold text-primary">{news.author_name || 'Quản trị viên'}</span>
          </div>
        </div>
      </div>

      {/* Lớp phủ tối cho bài viết chờ duyệt (dành cho quản trị viên) */}
      {isPending && isAdmin && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-4 text-center rounded-lg animate-fadeIn">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 text-xs font-bold mb-2 shadow-sm animate-pulse">
            ⏳ Chờ Quản trị viên duyệt
          </span>
          <p className="text-white text-xs mb-1 line-clamp-1 font-medium">
            Người gửi: <span className="text-amber-300 font-bold">{news.author_name || 'Thành viên ưu tú'}</span>
          </p>
          <p className="text-gray-300 text-xs font-semibold mb-4 line-clamp-2 max-w-[90%]">
            {news.title}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleEdit}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              title="Xem và chỉnh sửa nội dung bài viết"
            >
              <Eye size={14} />
              <span>Xem nội dung</span>
            </button>
            
            <button
              type="button"
              onClick={handleApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              title="Phê duyệt để bài viết hiển thị công khai"
            >
              <CheckCircle2 size={14} />
              <span>Phê duyệt</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              title="Loại bỏ bài viết này"
            >
              <Trash2 size={14} />
              <span>Loại bỏ</span>
            </button>
          </div>
        </div>
      )}
    </CardWrapper>
  );
};

export default NewsCard;
