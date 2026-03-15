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
        className="flex items-center space-x-1"
        style={{
          padding: '12px 16px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)',
          border: '1px solid var(--border-card)',
          backdropFilter: 'var(--blur-card)',
          height: '44px' // keep height consistent
        }}
      >
        <motion.div 
          variants={dotVariants} animate="bounce"
          className="w-1.5 h-1.5 rounded-full bg-white opacity-60"
        />
        <motion.div 
          variants={dotVariants} animate="bounce" transition={{ delay: 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-white opacity-60"
          style={{ animationDelay: '0.2s' }}
        />
        <motion.div 
          variants={dotVariants} animate="bounce" transition={{ delay: 0.4 }}
          className="w-1.5 h-1.5 rounded-full bg-white opacity-60"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
};
