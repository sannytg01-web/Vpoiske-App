import React from 'react';
import { motion } from 'framer-motion';
import { bubbleVariants } from '../../utils/animations';

export interface ChatBubbleProps {
  type: 'agent' | 'user';
  message: string;
  time: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ type, message, time }) => {
  const isAgent = type === 'agent';
  
  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`w-full flex mb-4 ${isAgent ? 'justify-start' : 'justify-end'}`}
    >
      <div className="flex flex-col relative max-w-[85%]">
        <div
          className="text-body relative overflow-hidden"
          style={{
            padding: '12px 16px',
            color: isAgent ? 'var(--text-primary)' : 'var(--text-on-accent)',
            background: isAgent ? 'var(--bg-card)' : 'var(--gradient-accent)',
            borderRadius: isAgent 
              ? 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)' 
              : 'var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)',
            border: isAgent ? '1px solid var(--border-card)' : 'none',
            backdropFilter: isAgent ? 'var(--blur-card)' : 'none',
          }}
        >
          {message}
        </div>
        
        {/* Timestamp */}
        <span 
          className="text-caption mt-1 px-1" 
          style={{
            fontSize: '11px',
            color: 'rgba(240, 244, 242, 0.45)',
            textAlign: isAgent ? 'left' : 'right'
          }}
        >
          {time}
        </span>
      </div>
    </motion.div>
  );
};
