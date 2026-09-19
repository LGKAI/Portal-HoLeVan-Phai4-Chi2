import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Bot, ChevronRight, BookOpen } from 'lucide-react';
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
      <section className="relative h-[calc(100vh-4rem)] min-h-[620px] flex flex-col justify-end overflow-hidden">
        {/* Background: nhích lên cao hơn để cắt bầu trời, nhưng không để mái nhà chạm đỉnh */}
        <div
          className="absolute inset-0 bg-cover z-0 bg-no-repeat transition-all duration-500 origin-top
            scale-[1.1] -translate-y-[8%]
            sm:scale-[1.2] sm:-translate-y-[12%]
            md:scale-[1.28] md:-translate-y-[20%]
            bg-[position:49.5%_top] sm:bg-[position:center_top] md:bg-[position:center_top]"
          style={{
            backgroundImage: 'url("/background.jpg?v=panoramic5")'
          }}
        />
        {/* Lớp tối đều toàn ảnh */}
        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
        {/* Gradient overlay: tối mạnh hơn phía dưới để tôn chữ */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 via-40% to-black/80 z-10 pointer-events-none" />

        {/* Khối chữ và nút bấm - nhích lên cao hơn khỏi đáy, đồng nhất mobile/desktop */}
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto pb-24 sm:pb-16 md:pb-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-[0_4px_14px_rgba(0,0,0,0.98)] tracking-wide leading-tight">
            <span
              className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ textShadow: '0 0 20px rgba(255,200,50,0.35), 0 4px 14px rgba(0,0,0,0.98)' }}
            >
              CỔNG THÔNG TIN DÒNG HỌ
            </span>
            <div className="h-1"></div>
            <span
              className="text-secondary drop-shadow-[0_4px_12px_rgba(0,0,0,0.98)]"
              style={{ textShadow: '0 0 24px rgba(255,180,0,0.6), 0 4px 16px rgba(0,0,0,0.98)' }}
            >
              LÊ VĂN - PHÁI 4 - CHI 2
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-5 sm:mb-6 font-bold tracking-wide"
            style={{
              color: '#ffffff',
              textShadow: '0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.8)'
            }}
          >
            Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/tree" className="bg-primary/80 hover:bg-primary border-2 border-red-400 text-red-300 min-w-[150px] sm:min-w-[180px] flex justify-center items-center gap-2 px-6 sm:px-8 py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all backdrop-blur-md shadow-xl hover:scale-105">
              <BookOpen size={18} />
              Xem Gia Phả
            </Link>
            <Link to="/memorials" className="bg-secondary/80 hover:bg-secondary border-2 border-yellow-300 text-yellow-900 min-w-[150px] sm:min-w-[180px] flex justify-center items-center gap-2 px-6 sm:px-8 py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all backdrop-blur-md shadow-xl hover:scale-105">
              <Calendar size={18} />
              Lịch Giỗ Kỵ
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl p-6 text-center hover:shadow-lg transition-all border-2 border-red-300/60 shadow-sm flex flex-col justify-between" style={{background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)'}}>
              <div>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Users size={28} className="text-red-700" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-red-800">Gia Phả Số</h3>
                <p className="text-red-900/70 text-sm mb-4 line-clamp-3">
                  Hệ thống phả hệ trực quan giúp con cháu dễ dàng tra cứu nguồn cội, thế thứ và quan hệ thân tộc.
                </p>
              </div>
              <Link to="/tree" className="text-red-700 font-bold text-sm flex items-center justify-center gap-1 hover:underline mt-2">
                Khám phá ngay <ChevronRight size={16} />
              </Link>
            </div>

            <div className="rounded-xl p-6 text-center hover:shadow-lg transition-all border-2 border-secondary/60 shadow-sm flex flex-col justify-between" style={{background: 'linear-gradient(135deg, #fffde7 0%, #fff8c5 100%)'}}>
              <div>
                <div className="w-14 h-14 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Calendar size={28} className="text-yellow-700" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-yellow-800">Lịch Giỗ Kỵ</h3>
                <p className="text-yellow-900/70 text-sm mb-4 line-clamp-3">
                  Tra cứu ngày cúng giỗ, nơi an táng các bậc tiền nhân trong 12 tháng Âm lịch để phụng sự hương khói.
                </p>
              </div>
              <Link to="/memorials" className="text-yellow-700 font-bold text-sm flex items-center justify-center gap-1 hover:underline mt-2">
                Xem lịch kỵ nhật <ChevronRight size={16} />
              </Link>
            </div>

            <div className="rounded-xl p-6 text-center hover:shadow-lg transition-all border-2 border-green-300/60 shadow-sm flex flex-col justify-between" style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'}}>
              <div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Calendar size={28} className="text-green-700" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-800">Tư Liệu - Sự Kiện</h3>
                <p className="text-green-900/70 text-sm mb-4 line-clamp-3">
                  Nơi cập nhật thông báo, hình ảnh tư liệu và các sinh hoạt truyền thống quan trọng của dòng họ.
                </p>
              </div>
              <Link to="/news" className="text-green-700 font-bold text-sm flex items-center justify-center gap-1 hover:underline mt-2">
                Xem sự kiện <ChevronRight size={16} />
              </Link>
            </div>

            <div className="rounded-xl p-6 text-center hover:shadow-lg transition-all border-2 border-blue-300/60 shadow-sm flex flex-col justify-between" style={{background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'}}>
              <div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Bot size={28} className="text-blue-700" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-blue-800">Trợ Lý AI Dòng Họ</h3>
                <p className="text-blue-900/70 text-sm mb-4 line-clamp-3">
                  Trí tuệ nhân tạo học sâu từ gia phả, sẵn sàng giải đáp thắc mắc của con cháu về dòng họ 24/7.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
                className="text-blue-700 font-bold text-sm flex items-center justify-center gap-1 hover:underline mx-auto mt-2"
              >
                Bắt đầu hỏi đáp <ChevronRight size={16} />
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
              <h2 className="text-3xl font-bold text-dark mb-2">Tư liệu - Sự kiện Dòng họ</h2>
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
