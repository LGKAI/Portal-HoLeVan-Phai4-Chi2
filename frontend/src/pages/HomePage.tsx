import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Bot, ChevronRight } from 'lucide-react';
import NewsCard from '../components/News/NewsCard';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsService.getNewsList({ limit: 3 });
        // Assume getNewsList returns an array directly, or check how the service is structured
        // In the error, it says Promise<NewsItem[]>, so res is likely NewsItem[]
        setNews(res);
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover z-0 bg-no-repeat"
          style={{ 
            backgroundImage: 'url("/background.jpg")',
            backgroundPosition: 'center 25%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-10" />
        
        <div className="relative z-20 text-center text-white px-4 max-w-6xl mx-auto mt-10">
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold mb-12 drop-shadow-2xl text-white tracking-wide sm:whitespace-nowrap">
            CỔNG THÔNG TIN DÒNG HỌ
            <div className="h-6"></div>
            <span className="text-secondary drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">LÊ VĂN - PHÁI 4 - CHI 2</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-medium text-cream drop-shadow-md">
            Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tree" className="bg-black/40 hover:bg-black/60 border border-red-500 text-red-500 min-w-[220px] flex justify-center items-center px-8 py-3 rounded-md font-bold text-lg transition-colors backdrop-blur-sm shadow-lg">
              Xem Gia Phả
            </Link>
            <Link to="/donate" className="bg-black/40 hover:bg-black/60 border border-secondary text-secondary min-w-[220px] flex justify-center items-center px-8 py-3 rounded-md font-bold text-lg transition-colors backdrop-blur-sm shadow-lg">
              Ủng Hộ Quỹ
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark mb-4">Kết nối Truyền thống & Tương lai</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow border border-primary/20 shadow-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Gia Phả Số</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">
                Hệ thống phả hệ trực quan giúp con cháu dễ dàng tra cứu, tìm hiểu về nguồn cội và mối quan hệ họ hàng trong dòng họ.
              </p>
              <Link to="/tree" className="text-primary font-medium flex items-center justify-center gap-1 hover:underline">
                Khám phá ngay <ChevronRight size={16} />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow border border-primary/20 shadow-sm">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-secondary-dark" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Tư Liệu - Sự Kiện</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">
                Nơi cập nhật thông báo, hình ảnh tư liệu và các sự kiện truyền thống quan trọng của con cháu dòng họ.
              </p>
              <Link to="/news" className="text-secondary-dark font-medium flex items-center justify-center gap-1 hover:underline">
                Xem sự kiện <ChevronRight size={16} />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow border border-primary/20 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-dark">Trợ Lý AI Dòng Họ</h3>
              <p className="text-gray-600 mb-6 line-clamp-3">
                Hệ thống trí tuệ nhân tạo học dữ liệu từ gia phả, sẵn sàng giải đáp mọi thắc mắc của con cháu về dòng họ 24/7.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="text-blue-600 font-medium flex items-center justify-center gap-1 hover:underline mx-auto"
              >
                Bắt đầu trò chuyện <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary-dark text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 text-secondary">8+</div>
              <div className="text-sm uppercase tracking-wider text-secondary">Đời</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-secondary">300+</div>
              <div className="text-sm uppercase tracking-wider text-secondary">Thành viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-secondary">250+</div>
              <div className="text-sm uppercase tracking-wider text-secondary">Năm lịch sử</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-dark mb-2">Tư liệu - Sự kiện dòng họ</h2>
              <div className="w-16 h-1 bg-primary"></div>
            </div>
            {news.length > 0 && (
              <Link to="/news" className="text-primary hover:underline font-medium flex items-center gap-1">
                Xem tất cả <ChevronRight size={18} />
              </Link>
            )}
          </div>
          
          {loadingNews ? (
            <LoadingSpinner />
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map(item => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-cream/50 rounded-lg border border-dashed border-primary/30">
              <p className="text-gray-500 italic">Chưa có tư liệu - sự kiện nào được đăng tải.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
