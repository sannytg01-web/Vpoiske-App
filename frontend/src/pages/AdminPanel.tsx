import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Settings,
  Brain,
  Mail,
} from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { pageTransition } from '../utils/animations';
import { useProfileStore } from '../store/profileStore';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!profile?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#0A0D10]">
        <h2>Доступ запрещен</h2>
        <button className="mt-4 text-accent-primary" onClick={() => navigate('/profile')}>
          Вернуться
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Пользователи', icon: <Users size={20} /> },
    { id: 'payments', label: 'Платежи', icon: <CreditCard size={20} /> },
    { id: 'ai', label: 'AI-агент', icon: <Brain size={20} /> },
    { id: 'matching', label: 'Матчинг', icon: <MessageSquare size={20} /> },
    { id: 'mailing', label: 'Рассылки', icon: <Mail size={20} /> },
    { id: 'moderation', label: 'Модерация', icon: <ShieldAlert size={20} /> },
    { id: 'settings', label: 'Настройки', icon: <Settings size={20} /> },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-content bg-transparent"
    >
      <AppBackground />

      {/* TOP HEADER */}
      <div
        className="absolute top-0 left-0 w-full p-4 z-20 flex items-center justify-between"
        style={{ paddingTop: 'calc(16px + var(--safe-top, 0px))' }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-white text-h3">Панель Администратора</h1>
        <div className="w-[44px]" />
      </div>

      <div className="flex flex-col h-full overflow-hidden mt-16 px-4">
        {/* TAB LIST */}
        <div className="flex overflow-x-auto py-2 -mx-4 px-4 space-x-2 no-scrollbar mb-4 z-10 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT (MOCKUP) */}
        <div className="flex-1 overflow-y-auto pb-32">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <GlassCard className="p-5 flex flex-col items-center justify-center h-32">
                <span className="text-secondary text-sm">Новые регистрации сегодня</span>
                <span className="text-4xl text-white font-serif mt-2">1,024</span>
              </GlassCard>
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col items-center justify-center">
                  <span className="text-secondary text-xs text-center">Конверсия онбординга</span>
                  <span className="text-2xl text-accent-primary mt-1">78%</span>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center justify-center">
                  <span className="text-secondary text-xs text-center">Активные Premium</span>
                  <span className="text-2xl text-white mt-1">456</span>
                </GlassCard>
              </div>
              <GlassCard className="p-5">
                <h3 className="text-white text-lg mb-2">MRR (Выручка)</h3>
                <div className="w-full h-24 bg-gradient-to-t from-green-500/20 to-transparent border-b border-green-500 flex items-end justify-between px-2 pt-8">
                   <div className="w-4 h-1/3 bg-green-500/50 rounded-t" />
                   <div className="w-4 h-1/2 bg-green-500/60 rounded-t" />
                   <div className="w-4 h-2/3 bg-green-500/70 rounded-t" />
                   <div className="w-4 h-full bg-green-500 rounded-t" />
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'users' && (
            <GlassCard className="p-5">
               <h3 className="text-white mb-4">Пользователи</h3>
               <div className="space-y-3">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/10">
                     <span className="text-white">user_{i}23@tg</span>
                     <span className="text-secondary text-xs">Статус: Завершил интервью | HD: Проектор</span>
                   </div>
                 ))}
               </div>
            </GlassCard>
          )}

          {/* Add basic placeholders for other tabs */}
          {activeTab !== 'dashboard' && activeTab !== 'users' && (
            <GlassCard className="p-10 flex flex-col items-center justify-center text-center">
               <ShieldAlert className="text-white/30 mb-4" size={48} />
               <p className="text-secondary">
                 Раздел "{tabs.find((t) => t.id === activeTab)?.label}" находится в разработке. 
                 <br />
                 Здесь будут отображаться запрашиваемые метрики.
               </p>
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
};
