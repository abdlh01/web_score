import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        className="flex space-x-2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div 
          className="w-4 h-4 bg-blue-500 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="w-4 h-4 bg-blue-400 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
        />
        <motion.div 
          className="w-4 h-4 bg-blue-300 rounded-full"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
        />
      </motion.div>
      <p className="mt-4 text-blue-200">جاري التحميل...</p>
    </div>
  );
};

export default Loading;