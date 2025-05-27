import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, BookText } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-blue-900/80 backdrop-blur-sm border-t border-blue-800 z-10"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex justify-around items-center h-full px-2 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/home')} 
          className={`nav-item ${isActive('/home') ? 'active' : ''} w-1/3`}
        >
          <Home className="h-6 w-6 mb-1" />
          <span>الرئيسية</span>
        </button>
        
        <button 
          onClick={() => navigate('/study')} 
          className={`nav-item ${isActive('/study') ? 'active' : ''} w-1/3`}
        >
          <BookOpen className="h-6 w-6 mb-1" />
          <span>دراسة</span>
        </button>
        
        <button 
          onClick={() => navigate('/subjects')} 
          className={`nav-item ${isActive('/subjects') ? 'active' : ''} w-1/3`}
        >
          <BookText className="h-6 w-6 mb-1" />
          <span>المواد الدراسية</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Navigation;