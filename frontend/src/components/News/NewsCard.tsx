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
        {news.thumbnail_url ? (
          <img 
            src={news.thumbnail_url} 
            alt={news.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">Không có ảnh</span>
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
        
        {/* Placeholder for content excerpt if needed, skipping for brevity */}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{format(new Date(news.published_at), 'dd/MM/yyyy', { locale: vi })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{news.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
