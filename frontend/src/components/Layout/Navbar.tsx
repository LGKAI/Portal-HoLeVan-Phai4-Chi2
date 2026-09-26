import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, BookOpen, Calendar, Newspaper } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import LoginModal from '../Auth/LoginModal';
import UserProfileModal from '../Auth/UserProfileModal';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, token, isAuthenticated, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Luôn tự động cập nhật lại thông tin mới nhất từ database (đảm bảo họ tên luôn đủ)
      authService.getMe()
        .then((userData) => {
          if (userData && (userData.full_name || userData.role)) {
            setUser(userData);
          }
        })
        .catch(() => {
          // Xử lý bởi axios interceptor nếu token hết hạn
        });
    }
  }, [isAuthenticated, token, setUser]);

  const displayName = user?.full_name?.trim() || (user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Gia phả số', path: '/tree', icon: BookOpen },
    { name: 'Lịch giỗ kỵ', path: '/memorials', icon: Calendar },
    { name: 'Tư liệu - Sự kiện', path: '/news', icon: Newspaper },
  ];

  return (
    <>
      <nav className="bg-primary text-white shadow-md fixed w-full z-40 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <img src="/favicon.ico" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-sm sm:text-lg tracking-tight whitespace-nowrap">CHI 2 - PHÁI 4 - HỌ LÊ VĂN</span>
              </Link>
            </div>

            {/* Desktop Menu - only shown on true desktop (≥1024px) */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark text-white/90'}`}
                  >
                    <Icon size={16} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <div className="ml-4 flex items-center gap-4 border-l border-white/20 pl-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3 relative group">
                    <div 
                      onClick={() => setIsProfileModalOpen(true)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                      title="Xem thông tin tài khoản & Nâng cấp vai trò"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FAF5EF] border border-[#E8D8C3] flex items-center justify-center text-primary font-bold text-sm overflow-hidden flex-shrink-0 shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{displayName}</span>
                    </div>
                    {/* Logout button */}
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors tooltip"
                      title="Đăng xuất"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="bg-white text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Đăng nhập
                  </button>
                )}
                
              </div>
            </div>

            {/* Mobile / landscape menu button — visible on anything < 1024px */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

        </div>

        {/* Ô thông báo vai trò nho nhỏ ở góc trên phải trang chủ, sát mép phải màn hình (ẩn khi mở menu mobile) */}
        {isAuthenticated && user && location.pathname === '/' && !isMenuOpen && (
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="fixed right-2 sm:right-3 top-[4.25rem] cursor-pointer animate-fade-in group select-none transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 z-40 max-w-[calc(100vw-1rem)]"
            title="Nhấn để xem thông tin tài khoản & làm bài test"
          >
            {user.role === 'admin' ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-800 via-amber-700 to-red-800 text-white shadow-lg border border-amber-300/40 text-xs font-semibold backdrop-blur-md hover:brightness-110 transition-all">
                <span className="text-sm">👑</span>
                <span>Bạn đang là Trùm cuối!</span>
              </div>
            ) : user.role === 'elite' ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-lg border border-purple-300/40 text-xs font-semibold backdrop-blur-md hover:brightness-110 transition-all">
                <span className="text-sm">⭐</span>
                <span>Bạn đang là Thành viên ưu tú!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-gray-800 shadow-xl border border-primary/30 text-xs font-medium backdrop-blur-md hover:bg-amber-50 hover:border-primary/50 transition-all">
                <span className="text-sm flex-shrink-0">💡</span>
                <span className="text-gray-700">
                  Bạn đang là <strong className="text-gray-900 font-bold">Thành viên tiêu chuẩn</strong>, hãy <strong className="text-primary font-bold underline underline-offset-2">làm bài Test</strong> để nâng cấp vai trò!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-primary border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'bg-primary-dark text-white' : 'hover:bg-primary-dark text-white/90'}`}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-white/10 pt-4 pb-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-3">
                    <div 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1.5 rounded-lg transition-colors flex-1 mr-2"
                      title="Xem thông tin tài khoản"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FAF5EF] border border-[#E8D8C3] flex items-center justify-center text-primary font-bold text-base overflow-hidden flex-shrink-0 shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{displayName}</span>
                        <span className="text-xs text-white/70">
                          {user.role === 'admin' ? '👑 Trùm cuối' : user.role === 'elite' ? '⭐ Thành viên ưu tú' : '👤 Thành viên tiêu chuẩn'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium bg-white/10 rounded-md hover:bg-white/20 transition-colors"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* User Profile & Upgrade Role Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
