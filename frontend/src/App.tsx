import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import FamilyTreePage from './pages/FamilyTreePage';
import MemorialCalendarPage from './pages/MemorialCalendarPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ChatbotPanel from './components/Chatbot/ChatbotPanel';
import ScrollToTop from './components/common/ScrollToTop';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isTreePage = location.pathname === '/tree';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tree" element={<FamilyTreePage />} />
          <Route path="/memorials" element={<MemorialCalendarPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
        </Routes>
      </main>
      {!isTreePage && <Footer />}
      <ChatbotPanel />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
