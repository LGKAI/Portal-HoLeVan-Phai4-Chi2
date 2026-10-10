import React from 'react';
import { Quote } from 'lucide-react';

const DeveloperMessageSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-primary-dark text-white border-y border-yellow-500/20 relative overflow-hidden shadow-inner" style={{ background: 'linear-gradient(135deg, #661212 0%, #7F1D1D 50%, #5B1010 100%)' }}>
      {/* Subtle background ornamentation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,205,0,0.08),_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

          {/* Avatar Người phát triển Lê Gia Khánh */}
          <div className="relative flex-shrink-0 group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-secondary shadow-[0_0_20px_rgba(255,205,0,0.35)] ring-4 ring-yellow-400/20 bg-primary transition-transform duration-300 group-hover:scale-105">
              <img
                src="/le-gia-khanh.jpg"
                alt="Lê Gia Khánh"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>
            {/* Huy hiệu nhỏ */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-secondary text-yellow-950 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow whitespace-nowrap">
              Tác giả
            </div>
          </div>

          {/* Lời tự sự từ người phát triển */}
          <div className="flex-1 text-center md:text-left">
            <Quote className="text-secondary/40 w-7 h-7 sm:w-8 sm:h-8 mb-2 mx-auto md:mx-0 rotate-180" />

            <p className="text-sm sm:text-base md:text-[17px] text-yellow-50/95 font-serif italic leading-relaxed sm:leading-relaxed mb-3">
              &ldquo;Đây là cổng thông tin số hóa được xây dựng với tất cả tâm huyết, tình cảm và lòng thành kính hướng về nguồn cội quê hương An Lợi, Triệu Bình, Quảng Trị. Kính mong nơi đây sẽ là nhịp cầu kết nối muôn đời con cháu Họ Lê Văn - Phái 4 - Chi 2 dù đang ở quê nhà hay muôn phương xa xứ; cùng nhau gìn giữ gia phả thiêng liêng, tưởng nhớ công đức tiền nhân và bồi đắp tình thân tộc đời đời bền chặt.&rdquo;
            </p>

            <div className="font-artistic text-secondary text-base sm:text-lg font-bold tracking-wide">
              - Lê Gia Khánh -
            </div>
            <div className="text-xs sm:text-sm text-yellow-200/70 font-medium mt-0.5">
              Người sáng lập & phát triển Cổng thông tin Dòng họ
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DeveloperMessageSection;
