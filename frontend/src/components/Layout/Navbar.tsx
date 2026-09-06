import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import LoginModal from '../Auth/LoginModal';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Gia phả', path: '/tree' },
    { name: 'Tư liệu - Sự kiện', path: '/news' },
  ];

  return (
    <>
      <nav className="bg-primary text-white shadow-md fixed w-full z-40 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <img src="/favicon.ico" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-sm sm:text-lg tracking-tight whitespace-nowrap">CHI 2 - PHÁI 4 - HỌ LÊ VĂN</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary-dark' : 'hover:bg-primary-dark'}`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="ml-4 flex items-center gap-4 border-l border-white/20 pl-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3 relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>
                      <span className="text-sm font-medium">{user.full_name}</span>
                    </div>
                    {/* Dropdown menu can go here, for now just logout button */}
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

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-primary border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'bg-primary-dark' : 'hover:bg-primary-dark'}`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="border-t border-white/10 pt-4 pb-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <UserIcon size={20} />
                      </div>
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                    <button onClick={handleLogout} className="p-2">
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

      {/* Floating Chat Button for Mobile & Desktop context if needed, though we will handle via standard FAB */}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
