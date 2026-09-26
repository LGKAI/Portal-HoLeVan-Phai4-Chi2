import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { NewsItem } from '../../types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsCardProps {
  news: NewsItem;
  isAdmin?: boolean;
  onEdit?: (news: NewsItem) => void;
  onDelete?: (id: number) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, isAdmin, onEdit, onDelete }) => {
  const [imgError, setImgError] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) onDelete(news.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onEdit) onEdit(news);
  };

  return (
    <Link to={`/news/${news.slug}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full border border-gray-100 relative">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {news.thumbnail_url && !imgError ? (
          <img 
            src={news.thumbnail_url} 
            alt={news.title} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4 text-center">
            <span className="text-sm font-medium">Tư liệu - Sự kiện</span>
            <span className="text-xs text-gray-400 mt-1">Họ Lê Văn - Phái 4 - Chi 2</span>
          </div>
        )}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={handleEdit} className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow z-10">
              <Edit size={14} />
            </button>
            <button onClick={handleDelete} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow z-10">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-dark mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>
        
        {/* Footer with Date, Views, and Author */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>{format(new Date(news.published_at), 'dd/MM/yyyy', { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={13} />
              <span>{news.view_count} lượt xem</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-600 truncate mt-0.5">
            Bài viết được đăng bởi <span className="font-semibold text-primary">{news.author_name || 'Quản trị viên'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
