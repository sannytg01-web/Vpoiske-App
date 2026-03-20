import React from 'react';
import { Lock, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';
import type { MatchProfile } from '../../store/matchStore';

export interface MatchCardProps {
  match: MatchProfile;
  onClick?: () => void;
  onUnlockClick?: () => void;
  delayIndex?: number;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match,
  onUnlockClick,
  onClick,
  delayIndex = 0
}) => {
  const isLocked = match.locked;

  // Helper to extract values
  const sharedValues = match.details?.values?.shared_values || [];

  return (
    <motion.div 
      variants={cardVariants}
      custom={delayIndex}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden w-full cursor-pointer flex flex-col p-5"
      onClick={isLocked ? onUnlockClick : onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-card)',
        backdropFilter: 'var(--blur-card)',
      }}
    >
      {/* Compatibility Badge top-left */}
      <div className="flex justify-between items-start mb-4">
         <div>
            <h2 className="text-[19px] font-bold tracking-wide text-white m-0 drop-shadow-md">
              {isLocked ? "Анонимный Профиль" : `${match.name}, ${match.age}`}
            </h2>
            <p className="text-xs text-[#00FF88]/70 font-medium tracking-widest uppercase mt-1">
              {match.hd_type}
            </p>
         </div>
         {!isLocked && (
            <div 
              className="text-label text-[#00FF88] flex items-center justify-center font-extrabold shadow-lg"
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '13px',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}
            >
              {match.score}% Мэтч
            </div>
         )}
      </div>

      {isLocked ? (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="p-4 mb-4 rounded-full" style={{ background: 'var(--gradient-warm)', boxShadow: '0 4px 16px rgba(196, 149, 106, 0.4)' }}>
            <Lock color="white" size={28} />
          </div>
          <p className="text-body text-white font-semibold mb-2">Профиль скрыт</p>
          <p className="text-xs text-white/50 text-center max-w-[200px]">
            Оплатите премиум доступ, чтобы увидеть детальную совместимость.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
            
            {/* Detailed AI Match Reason */}
            {match.match_reason && (
              <div className="bg-white/5 border border-[#4A9E7F]/30 rounded-xl p-4 shadow-inner">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[#00FF88]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#00FF88]">Зоны пересечения (AI-анализ)</span>
                 </div>
                 <p className="text-[13px] leading-relaxed text-white/90">
                   {match.match_reason}
                 </p>
              </div>
            )}

            {/* Matrix details */}
            <div className="bg-black/20 rounded-xl p-3 flex flex-col border border-white/5">
                <div className="flex items-center text-[#4A9E7F] mb-1.5">
                  <Heart size={14} className="mr-1.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Общие ценности</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sharedValues.length > 0 ? sharedValues.slice(0,4).map((v: string) => (
                    <span key={v} className="bg-[#4A9E7F]/10 text-white/80 px-2 py-1 rounded text-[11px] font-medium border border-[#4A9E7F]/20">
                      {v}
                    </span>
                  )) : (
                    <span className="text-[12px] text-white/50 font-medium">Общие интересы не найдены</span>
                  )}
                </div>
            </div>

            <button 
               className="mt-2 w-full py-3 rounded-xl font-bold flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98]"
               style={{ background: 'var(--gradient-accent)', color: 'var(--text-on-accent)' }}
               onClick={(e) => { e.stopPropagation(); if(onClick) onClick(); }}
            >
               Раскрыть профиль
            </button>
        </div>
      )}
    </motion.div>
  );
};
