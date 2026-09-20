import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2D1A1A] text-white py-3.5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div>
            <h3 className="text-base font-bold mb-1.5 text-secondary">CHI 2 - PHÁI 4 - HỌ LÊ VĂN</h3>
            <p className="text-gray-300 text-xs md:text-sm leading-normal">
              Cổng thông tin lưu trữ gia phả, tư liệu và kết nối con cháu dòng họ Lê Văn - Phái 4 - Chi 2.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1.5 text-secondary">Liên hệ</h4>
            <ul className="space-y-0.5 text-xs md:text-sm text-gray-300">
              <li>Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị</li>
              <li>Email: leogiakhanh1609@gmail.com</li>
              <li>Điện thoại: 0813123474</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1.5 text-secondary">Liên kết</h4>
            <ul className="space-y-0.5 text-xs md:text-sm text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">Trang chủ</a></li>
              <li><a href="/tree" className="hover:text-white transition-colors">Gia phả số</a></li>
              <li><a href="/memorials" className="hover:text-white transition-colors">Lịch giỗ kỵ</a></li>
              <li><a href="/news" className="hover:text-white transition-colors">Tư liệu - Sự kiện</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-3 pt-2.5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <div className="flex-1 hidden md:block"></div>
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Cổng thông tin Dòng họ Lê Văn - Phái 4 - Chi 2. Bảo lưu mọi quyền.</p>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            <img src="/favicon.ico" alt="Logo" className="h-7 w-7 object-contain opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
