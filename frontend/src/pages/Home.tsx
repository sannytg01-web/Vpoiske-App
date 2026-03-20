import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, User, ChevronRight, Activity } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuthStore } from "../store/authStore";
import { useMatchStore } from "../store/matchStore";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { matches } = useMatchStore();
  const { hasCompletedInterview, hasCompletedBirthData, bio } = useAuthStore();

  const mockInsight = "Сегодня твоя энергия требует покоя. Дай себе паузу перед важными решениями. Это хорошее время для общения с теми, кто разделяет твою ценность «Глубина».";
  const matchOfTheDay = matches.length > 0 ? matches[0] : null;

  // Calculate profile progress
  let progress = 20; // Default base
  if (hasCompletedInterview) progress += 40;
  if (hasCompletedBirthData) progress += 30;
  if (bio) progress += 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-content bg-transparent flex flex-col items-center"
    >
      <AppBackground />

      <div className="flex-1 w-full max-w-md overflow-y-auto px-4 py-6 pb-32">
        <div className="flex justify-between items-center mb-8 pt-2">
          <h1 className="text-h1 text-white m-0">Главная</h1>
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg relative"
          >
            <User size={20} className="text-white" />
            {progress < 100 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-warm rounded-full border border-[#0d1f1a]"></span>
            )}
          </button>
        </div>

        {/* PROFILE PROGRESS */}
        <GlassCard className="p-4 mb-6 relative overflow-hidden group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate("/profile")}>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#7bc4a0] uppercase mb-1">Ваш профиль</p>
              <h3 className="text-h3 text-white m-0">Заполнен на {progress}%</h3>
            </div>
            <ChevronRight size={20} className="text-white/30 group-hover:text-white/70 transition-colors" />
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-[#4A9E7F] to-[#7bc4a0]"
            />
          </div>
          {progress < 100 && (
            <p className="text-xs text-white/50 mt-3 tabular-nums">
              Заполните профиль на 100%, чтобы получать более точные метчи.
            </p>
          )}
        </GlassCard>

        {/* DAILY INSIGHT */}
        <div className="mb-6 relative">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#4A9E7F]/20 blur-2xl rounded-full pointer-events-none" />
          <h2 className="text-h3 text-white mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-[#4A9E7F]" />
            Инсайт дня от ИИ
          </h2>
          <GlassCard className="p-5" style={{ background: 'linear-gradient(135deg, rgba(74, 158, 127, 0.15) 0%, rgba(20, 41, 32, 0.8) 100%)', border: '1px solid rgba(74, 158, 127, 0.3)' }}>
             <p className="text-sm leading-relaxed text-white/90 italic m-0">"{mockInsight}"</p>
          </GlassCard>
        </div>

        {/* MATCH OF THE DAY */}
        <div className="mb-6">
          <h2 className="text-h3 text-white mb-3 flex items-center gap-2">
            <Heart size={18} className="text-accent-main" />
            Совместимость дня
          </h2>
          {matchOfTheDay ? (
            <GlassCard 
              className="p-1 items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" 
              onClick={() => navigate(`/matches/${matchOfTheDay.id}`)}
              style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto' }}
            >
               <div className="w-[70px] h-[80px] rounded-xl overflow-hidden relative">
                 {matchOfTheDay.photo ? (
                   <img src={matchOfTheDay.photo} className="w-full h-full object-cover blur-sm opacity-60 scale-110" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-[#4A9E7F] to-[#142920] flex items-center justify-center">
                     <span className="text-2xl text-white font-serif">{matchOfTheDay.name.charAt(0)}</span>
                   </div>
                 )}
               </div>
               <div className="px-4 py-2 flex flex-col justify-center">
                 <h3 className="text-body font-semibold text-white m-0 tracking-tight">{matchOfTheDay.name}, {matchOfTheDay.age}</h3>
                 <p className="text-xs text-secondary mt-0.5 truncate">{matchOfTheDay.hd_type}</p>
                 <div className="flex items-center gap-1.5 mt-2">
                   <Activity size={12} className="text-[#4A9E7F]" />
                   <span className="text-[11px] font-bold text-[#4A9E7F]">{matchOfTheDay.score}% Мэтч</span>
                 </div>
               </div>
               <div className="px-4">
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   <ChevronRight size={16} className="text-white/50" />
                 </div>
               </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-6 flex flex-col items-center justify-center text-center">
              <Heart size={30} className="text-white/20 mb-3" />
              <p className="text-sm text-secondary m-0">Сегодня ИИ ещё подбирает для вас идеальную пару. Загляните позже.</p>
            </GlassCard>
          )}
        </div>

        {/* ALL MATCHES BUTTON */}
        <button
          onClick={() => navigate("/matches")}
          className="w-full relative py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span className="text-sm font-bold tracking-wider uppercase text-white shadow-sm flex items-center justify-center gap-2">
            Смотреть все совпадения <ChevronRight size={16} />
          </span>
        </button>

      </div>
    </motion.div>
  );
};
