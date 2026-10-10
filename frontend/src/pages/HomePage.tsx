import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Bot, ChevronRight, BookOpen, Landmark, Users, Clock } from 'lucide-react';
import NewsCard from '../components/News/NewsCard';
import { newsService } from '../services/newsService';
import { NewsItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AncestralMapSection from '../components/Home/AncestralMapSection';
import DeveloperMessageSection from '../components/Home/DeveloperMessageSection';

const HomePage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#map') {
      const el = document.getElementById('map');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

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
      <section className="relative h-[calc(100vh-4rem)] min-h-[600px] flex flex-col justify-end overflow-hidden">
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
        {/* Lớp tối đều toàn ảnh: cân chỉnh vừa phải (38%) để nền sáng hơn một chút nhưng vẫn tôn rõ chữ */}
        <div className="absolute inset-0 bg-black/[0.38] z-10 pointer-events-none" />
        {/* Gradient overlay: tối dần xuống phía dưới để làm nổi bật các dòng chữ và nút bấm */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 via-40% to-black/80 z-10 pointer-events-none" />

        {/* Khối chữ và nút bấm - cân đối và nhích lên trên một chút theo yêu cầu */}
        <div className="relative z-20 text-center text-white px-3 sm:px-4 max-w-4xl mx-auto pb-44 sm:pb-24 md:pb-28">

          <h1 className="mb-2 tracking-wide leading-tight">
            <span
              className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] block text-base sm:text-2xl md:text-[26px] font-bold tracking-wider whitespace-nowrap"
              style={{ textShadow: '0 0 20px rgba(255,200,50,0.35), 0 4px 14px rgba(0,0,0,0.98)' }}
            >
              Cổng Thông Tin Dòng Họ
            </span>
            <div className="h-1"></div>
            <span
              className="font-artistic text-secondary block text-[clamp(1.35rem,6.2vw,3.2rem)] font-extrabold whitespace-nowrap tracking-tight sm:tracking-wide mt-0.5 animate-gold-glow"
            >
              LÊ VĂN - PHÁI 4 - CHI 2
            </span>
          </h1>
          <p className="text-[clamp(0.85rem,3.8vw,1.35rem)] mb-2.5 sm:mb-3 font-extrabold whitespace-nowrap tracking-wide"
            style={{
              color: '#ff5252',
              textShadow: '0 2px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.85)'
            }}
          >
            Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị
          </p>

          {/* 2 câu đối thơ nghệ thuật thư pháp */}
          <div
            className="font-cursive text-white text-lg sm:text-2xl md:text-3xl tracking-wide mb-3.5 sm:mb-5 space-y-0.5 sm:space-y-1"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,1), 0 4px 14px rgba(0,0,0,0.95), 0 0 25px rgba(0,0,0,0.9)'
            }}
          >
            <p className="leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] whitespace-nowrap">
              Mai Sơn cao ngút ơn dưỡng dục
            </p>
            <p className="leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] whitespace-nowrap">
              Hãn Giang tuôn chảy nghĩa sinh thành
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/tree" className="bg-primary/90 hover:bg-primary border-2 border-red-400 text-white min-w-[145px] sm:min-w-[185px] flex justify-center items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all backdrop-blur-md shadow-xl hover:scale-105 active:scale-95">
              <BookOpen size={19} />
              Xem Gia Phả
            </Link>
            <Link to="/memorials" className="bg-secondary/90 hover:bg-secondary border-2 border-yellow-300 text-yellow-950 min-w-[145px] sm:min-w-[185px] flex justify-center items-center gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base whitespace-nowrap transition-all backdrop-blur-md shadow-xl hover:scale-105 active:scale-95">
              <Calendar size={19} />
              Xem Lịch Giỗ
            </Link>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-1.5 sm:mb-2">Kết nối Truyền thống & Tương lai</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              Nền tảng số hóa gìn giữ nguồn cội, kết nối muôn đời thế hệ con cháu dòng họ.
            </p>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Link
              to="/tree"
              className="group cursor-pointer rounded-xl p-5 sm:p-6 text-center transition-all duration-300 border-2 border-red-300/60 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between"
              style={{background: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)'}}
            >
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110">
                  <BookOpen size={24} className="text-red-700" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 sm:mb-2 text-red-800">Gia Phả Số</h3>
                <p className="text-red-900/75 text-sm mb-3 sm:mb-4 leading-relaxed">
                  Hệ thống phả hệ trực quan giúp con cháu muôn phương dễ dàng tra cứu nguồn cội, thế thứ và tỏ tường quan hệ thân tộc.
                </p>
              </div>
              <div className="text-red-700 font-bold text-sm flex items-center justify-center gap-1 group-hover:gap-2 transition-all mt-2">
                <span>Khám phá ngay</span> <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/memorials"
              className="group cursor-pointer rounded-xl p-5 sm:p-6 text-center transition-all duration-300 border-2 border-secondary/60 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between"
              style={{background: 'linear-gradient(135deg, #fffde7 0%, #fff8c5 100%)'}}
            >
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110">
                  <Calendar size={24} className="text-yellow-700" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 sm:mb-2 text-yellow-800">Lịch Giỗ Kỵ</h3>
                <p className="text-yellow-900/75 text-sm mb-3 sm:mb-4 leading-relaxed">
                  Tra cứu ngày cúng giỗ, nơi an táng các bậc tiền nhân trong 12 tháng Âm lịch để con cháu chu toàn phụng sự hương khói.
                </p>
              </div>
              <div className="text-yellow-700 font-bold text-sm flex items-center justify-center gap-1 group-hover:gap-2 transition-all mt-2">
                <span>Xem lịch kỵ nhật</span> <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <div
              onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
              className="group cursor-pointer rounded-xl p-5 sm:p-6 text-center transition-all duration-300 border-2 border-blue-300/60 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between"
              style={{background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'}}
            >
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-110">
                  <Bot size={24} className="text-blue-700" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 sm:mb-2 text-blue-800">Trợ Lý AI Dòng Họ</h3>
                <p className="text-blue-900/75 text-sm mb-3 sm:mb-4 leading-relaxed">
                  Trí tuệ nhân tạo học sâu từ gia phả, sẵn sàng tận tâm giải đáp mọi thắc mắc của con cháu về dòng họ 24/7.
                </p>
              </div>
              <div className="text-blue-700 font-bold text-sm flex items-center justify-center gap-1 group-hover:gap-2 transition-all mt-2">
                <span>Bắt đầu hỏi đáp</span> <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-primary-dark text-secondary">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-8 text-center">
            <div className="flex flex-col items-center animate-gold-glow">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2 text-secondary">
                <Landmark size={26} className="text-secondary flex-shrink-0 sm:w-9 sm:h-9" />
                <span className="text-2xl sm:text-4xl font-bold">8+</span>
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider text-secondary font-semibold whitespace-nowrap">Đời</div>
            </div>
            <div className="flex flex-col items-center animate-gold-glow">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2 text-secondary">
                <Users size={26} className="text-secondary flex-shrink-0 sm:w-9 sm:h-9" />
                <span className="text-2xl sm:text-4xl font-bold">300+</span>
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider text-secondary font-semibold whitespace-nowrap">Thành viên</div>
            </div>
            <div className="flex flex-col items-center animate-gold-glow">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2 text-secondary">
                <Clock size={26} className="text-secondary flex-shrink-0 sm:w-9 sm:h-9" />
                <span className="text-2xl sm:text-4xl font-bold">250+</span>
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider text-secondary font-semibold whitespace-nowrap">Năm lịch sử</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-1.5 sm:mb-2">Tư liệu & Sự kiện Dòng họ</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Nơi cập nhật thông báo, hình ảnh tư liệu và các sự kiện quan trọng của dòng họ.
              </p>
              <div className="w-16 h-1 bg-primary"></div>
            </div>
            {news.length > 0 && (
              <Link to="/news" className="text-primary hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
                Xem tất cả <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {loadingNews ? (
            <LoadingSpinner />
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {news.map(item => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-cream/50 rounded-lg border border-dashed border-primary/30">
              <p className="text-gray-500 italic text-sm">Chưa có tư liệu & sự kiện nào được đăng tải.</p>
            </div>
          )}
        </div>
      </section>

      {/* Thông điệp từ Người phát triển Cổng thông tin (Lê Gia Khánh) */}
      <DeveloperMessageSection />

      {/* Bản đồ Cội Nguồn Dòng Tộc (Nhà Thờ Họ & Cồn Giữa) */}
      <AncestralMapSection />

    </div>
  );
};

export default HomePage;
