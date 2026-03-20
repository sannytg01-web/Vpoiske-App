import React from 'react';
import { motion } from 'framer-motion';



export const TypingIndicator: React.FC = () => {
  const dotVariants = {
    bounce: {
      y: [0, -6, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <div className="w-full flex justify-start mb-4">
      <div 
        className="flex flex-col relative max-w-[85%]"
      >
        <div
          className="flex items-center space-x-2 relative overflow-hidden"
          style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)',
            border: '1px solid var(--border-card)',
            backdropFilter: 'var(--blur-card)',
            height: '44px' // keep height consistent
          }}
        >
          <div className="flex items-center space-x-1">
            <motion.div 
              variants={dotVariants} animate="bounce"
              className="w-1.5 h-1.5 rounded-full bg-[#4A9E7F] opacity-80"
            />
            <motion.div 
              variants={dotVariants} animate="bounce" transition={{ delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#4A9E7F] opacity-80"
              style={{ animationDelay: '0.2s' }}
            />
            <motion.div 
              variants={dotVariants} animate="bounce" transition={{ delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-[#4A9E7F] opacity-80"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
          <span className="text-[12px] opacity-50 italic tracking-wide ml-1">Анализирует...</span>
        </div>
      </div>
    </div>
  );
};
