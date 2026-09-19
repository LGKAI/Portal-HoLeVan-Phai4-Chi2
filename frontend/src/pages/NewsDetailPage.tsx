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
        <div className="flex justify-center mb-8">
          <img 
            src={news.thumbnail_url} 
            alt={news.title} 
            className="max-w-full h-auto rounded-lg shadow-md border border-[#E8D8C3]/50"
            onError={(e) => {
              const parent = e.currentTarget.parentElement;
              if (parent) parent.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="prose max-w-none prose-lg text-gray-800 leading-relaxed">
        {news.content && (news.content.includes('<p') || news.content.includes('<img') || news.content.includes('<div') || news.content.includes('<h') || news.content.includes('<ul') || news.content.includes('<ol')) ? (
          <div
            className="article-rich-content [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6 [&_img]:mx-auto [&_img]:max-w-full [&_img]:max-h-[650px] [&_img]:object-contain [&_p]:my-4 [&_p]:leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-gray-900 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{news.content}</p>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;
