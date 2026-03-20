import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

export interface MatchCardProps {
  name: string;
  age: number;
  photoUrl: string;
  compatibilityScore: number;
  matchReason?: string;
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
  matchReason,
  isLocked = false, 
  onUnlockClick,
  onClick,
  delayIndex = 0
}) => {
  const hasPhoto = !!photoUrl && photoUrl.trim() !== "";

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
      {/* Background Image or Placeholder */}
      {hasPhoto ? (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${photoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
          }}
        />
      ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center pointer-events-none p-4"
          style={{
            background: 'linear-gradient(135deg, #1c3d33 0%, #0d1f1a 100%)',
          }}
        >
          <span className="text-[72px] font-thin text-white/10 uppercase" style={{ fontFamily: "Inter", transform: "translateY(-10px)" }}>
            {name.charAt(0)}
          </span>
          {matchReason && !hasPhoto && (
            <p className="text-[11px] leading-tight text-white/70 text-center font-medium line-clamp-4 absolute bottom-[80px] px-4 opacity-90">
              {matchReason}
            </p>
          )}
        </div>
      )}

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
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5 flex flex-col z-20">
        <h2 className="text-[17px] font-semibold tracking-wide text-white m-0 drop-shadow-md pb-1">{name}, {age}</h2>
        {matchReason && hasPhoto && (
           <p className="text-[11px] leading-tight text-white/80 m-0 line-clamp-2">
             {matchReason}
           </p>
        )}
      </div>
    </motion.div>
  );
};
