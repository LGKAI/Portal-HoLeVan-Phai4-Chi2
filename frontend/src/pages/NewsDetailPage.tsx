import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const NewsDetailPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>(); // React Router passes it as `id` based on Route config
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (!slug) return;
        const data = await newsService.getNewsById(slug);
        setNews(data);
        window.scrollTo(0, 0);
      } catch (err) {
        setError('Không tìm thấy tư liệu - sự kiện hoặc có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  useEffect(() => {
    if (!loading && news) {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [loading, news]);

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;
  if (error || !news) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/news" className="inline-flex items-center text-primary hover:underline mb-6">
        <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
      </Link>
      
      <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">{news.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{format(new Date(news.published_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye size={16} />
          <span>{news.view_count} lượt xem</span>
        </div>
      </div>

      {news.thumbnail_url && (
        <img 
          src={news.thumbnail_url} 
          alt={news.title} 
          className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-sm mb-8"
        />
      )}

      <div className="prose max-w-none prose-lg">
        <p className="whitespace-pre-wrap">{news.content}</p>
      </div>
    </div>
  );
};

export default NewsDetailPage;
