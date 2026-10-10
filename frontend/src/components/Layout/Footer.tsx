import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Paperclip } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2D1A1A] text-white py-3.5 mt-auto overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 lg:gap-12 md:translate-x-6 lg:translate-x-12">
          {/* Cột 1: Thông tin dòng họ */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
              <h3 className="font-artistic font-bold text-sm sm:text-lg text-secondary tracking-tight">CHI 2 - PHÁI 4 - HỌ LÊ VĂN</h3>
            </div>
            <p className="text-gray-300 text-xs md:text-sm leading-normal">
              Cổng thông tin lưu trữ gia phả, tư liệu và kết nối con cháu Chi 2 - Phái 4 - Họ Lê Văn.
            </p>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Phone size={18} className="text-secondary flex-shrink-0" />
              <h4 className="text-base font-bold text-secondary">Liên hệ</h4>
            </div>
            <ul className="space-y-0.5 text-xs md:text-sm text-gray-300">
              <li>Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị</li>
              <li>Email: leogiakhanh1609@gmail.com</li>
              <li>Điện thoại: 0813123474</li>
            </ul>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Paperclip size={18} className="text-secondary flex-shrink-0" />
              <h4 className="text-base font-bold text-secondary">Liên kết</h4>
            </div>
            <div className="flex items-start gap-5 sm:gap-6 text-xs md:text-sm text-gray-300">
              <ul className="space-y-0.5">
                <li><Link to="/" className="hover:text-white transition-colors whitespace-nowrap">Trang chủ</Link></li>
                <li><Link to="/tree" className="hover:text-white transition-colors whitespace-nowrap">Gia phả số</Link></li>
                <li><Link to="/memorials" className="hover:text-white transition-colors whitespace-nowrap">Lịch giỗ kỵ</Link></li>
              </ul>
              <ul className="space-y-0.5">
                <li><Link to="/news" className="hover:text-white transition-colors whitespace-nowrap">Tư liệu & Sự kiện</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors whitespace-nowrap">Bản đồ</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-3 pt-2.5 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Cổng thông tin Dòng họ Lê Văn - Phái 4 - Chi 2. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
