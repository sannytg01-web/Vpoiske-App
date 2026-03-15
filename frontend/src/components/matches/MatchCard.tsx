import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

export interface MatchCardProps {
  name: string;
  age: number;
  photoUrl: string;
  compatibilityScore: number;
  isLocked?: boolean;
  onUnlockClick?: () => void;
  onClick?: () => void;
  delayIndex?: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  name, 
  age, 
  photoUrl, 
  compatibilityScore, 
  isLocked = false, 
  onUnlockClick,
  onClick,
  delayIndex = 0
}) => {
  return (
    <motion.div 
      variants={cardVariants}
      custom={delayIndex}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden w-full cursor-pointer"
      onClick={isLocked ? onUnlockClick : onClick}
      style={{
        aspectRatio: '3/4',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70%', // Photo takes top 70%
        }}
      />

      {/* Gradient Overlay bottom to top */}
      <div 
        className="absolute inset-x-0 bottom-0 top-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(13, 31, 26, 0.6) 40%, rgba(13, 31, 26, 1) 100%)',
        }}
      />

      {/* Compatibility Badge top-left */}
      {!isLocked && (
        <div 
          className="absolute top-3 left-3 text-label text-white flex items-center justify-center font-bold"
          style={{
            background: 'var(--gradient-accent)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 8px',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          {compatibilityScore}% совпадение
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'rgba(13, 31, 26, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div 
            className="p-3 mb-2 rounded-full"
            style={{ background: 'var(--gradient-warm)', boxShadow: '0 4px 16px rgba(196, 149, 106, 0.4)' }}
          >
            <Lock color="white" size={24} />
          </div>
          <p className="text-body text-white font-semibold">Скрыто</p>
        </div>
      )}

      {/* Content Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 flex flex-col">
        <h2 className="text-h2 text-white m-0 mb-1">{name}, {age}</h2>
        {/* Additional info can go here */}
      </div>
    </motion.div>
  );
};
