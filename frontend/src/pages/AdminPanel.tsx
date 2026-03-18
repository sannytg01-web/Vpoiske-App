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
import { apiClient } from '../utils/apiClient';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfileStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'dashboard' && !stats) {
      setIsLoading(true);
      apiClient.get('/admin/dashboard')
        .then((res: any) => setStats(res.data))
        .catch((err: any) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab, stats]);

  const isAdminLocal = localStorage.getItem('vpoiske_is_admin') === 'true';

  if (!profile?.is_admin && !isAdminLocal) {
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

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto pb-32">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <GlassCard className="p-5 flex flex-col items-center justify-center h-32">
                <span className="text-secondary text-sm">Новые регистрации сегодня</span>
                <span className="text-4xl text-white font-serif mt-2">
                  {isLoading ? '...' : stats?.new_users_today || 0}
                </span>
              </GlassCard>
              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col items-center justify-center">
                  <span className="text-secondary text-xs text-center">Конверсия онбординга</span>
                  <span className="text-2xl text-accent-primary mt-1">
                    {isLoading ? '...' : `${stats?.conversion_onboarding || 0}%`}
                  </span>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center justify-center">
                  <span className="text-secondary text-xs text-center">Активные Premium</span>
                  <span className="text-2xl text-white mt-1">
                    {isLoading ? '...' : stats?.active_premium || 0}
                  </span>
                </GlassCard>
              </div>
              <GlassCard className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white text-lg">MRR (Выручка)</h3>
                  <span className="text-accent-primary text-xl font-medium">
                    {isLoading ? '...' : `${stats?.mrr_revenue || 0} ₽`}
                  </span>
                </div>
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
            <UsersTabContent />
          )}

          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'ai' && <AITab />}
          {activeTab === 'matching' && <MatchingTab />}
          {activeTab === 'mailing' && <MailingTab />}
          {activeTab === 'moderation' && <ModerationTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </motion.div>
  );
};

const UsersTabContent = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    apiClient.get('/admin/users')
      .then((res: any) => setUsers(res.data))
      .catch((err: any) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <GlassCard className="p-5 text-center text-secondary">Загрузка...</GlassCard>;

  return (
    <GlassCard className="p-5">
      <h3 className="text-white mb-4">Пользователи ({users.length})</h3>
      <div className="space-y-3">
        {users.map((u, i) => (
          <div key={i} className="flex flex-col bg-white/5 p-3 rounded-lg border border-white/10">
            <span className="text-white">{u.name || 'Без имени'} <span className="text-secondary text-sm">({u.phone})</span></span>
            <span className="text-secondary text-xs">
              HD: {u.hd_type || '—'} | 
              Интервью: {u.completed_interview ? '✅ Да' : '❌ Нет'} | 
              Premium: {u.is_premium ? '⭐' : 'Нет'}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const PaymentsTab = () => (
  <div className="space-y-4">
    <GlassCard className="p-4">
      <h3 className="text-white mb-2">Фильтры платежей</h3>
      <div className="flex space-x-2">
        <button className="bg-white/10 px-3 py-1 rounded text-white text-xs">Все</button>
        <button className="border border-white/20 px-3 py-1 rounded text-secondary text-xs">Success</button>
        <button className="border border-white/20 px-3 py-1 rounded text-secondary text-xs">Failed</button>
        <button className="border border-white/20 px-3 py-1 rounded text-secondary text-xs">T-Bank</button>
        <button className="border border-white/20 px-3 py-1 rounded text-secondary text-xs">Рекуррент</button>
      </div>
    </GlassCard>
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-4 flex flex-col items-center justify-center">
        <span className="text-secondary text-xs text-center">Средний чек</span>
        <span className="text-xl text-white mt-1">1,990 ₽</span>
      </GlassCard>
      <GlassCard className="p-4 flex flex-col items-center justify-center">
        <span className="text-secondary text-xs text-center">Успех рекуррентов</span>
        <span className="text-xl text-accent-primary mt-1">94%</span>
      </GlassCard>
    </div>
    <GlassCard className="p-5">
      <h3 className="text-white mb-4">Последние транзакции</h3>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
            <div className="flex flex-col">
              <span className="text-white text-sm">user_{i}99@tg</span>
              <span className="text-secondary text-xs">T-Bank • 1,990 ₽</span>
            </div>
            <span className="text-accent-primary text-xs bg-accent-primary/20 px-2 py-1 rounded">Success</span>
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);

const AITab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Ср. длина сессии</span>
        <span className="text-xl text-white mt-1">24 обмена</span>
      </GlassCard>
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Завершили 18 в.</span>
        <span className="text-xl text-accent-primary mt-1">82%</span>
      </GlassCard>
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Токенов/день (M)</span>
        <span className="text-xl text-white mt-1">4.2</span>
      </GlassCard>
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Задержка агента</span>
        <span className="text-xl text-white mt-1">1.2s</span>
      </GlassCard>
    </div>
    <GlassCard className="p-5">
      <h3 className="text-white mb-4">Типы привязанности в базе</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white"><span>Надёжный (Secure)</span><span>45%</span></div>
        <div className="w-full h-2 bg-white/10 rounded overflow-hidden"><div className="w-[45%] h-full bg-accent-primary"/></div>
        <div className="flex justify-between text-xs text-white mt-2"><span>Тревожный (Anxious)</span><span>35%</span></div>
        <div className="w-full h-2 bg-white/10 rounded overflow-hidden"><div className="w-[35%] h-full bg-[#e8a030]"/></div>
        <div className="flex justify-between text-xs text-white mt-2"><span>Избегающий (Avoidant)</span><span>20%</span></div>
        <div className="w-full h-2 bg-white/10 rounded overflow-hidden"><div className="w-[20%] h-full bg-[#e05555]"/></div>
      </div>
    </GlassCard>
  </div>
);

const MatchingTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Ср. мэтчей/юзер</span>
        <span className="text-2xl text-white mt-1">4.8</span>
      </GlassCard>
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-secondary text-xs">Мэтч → Чат</span>
        <span className="text-2xl text-accent-primary mt-1">68%</span>
      </GlassCard>
    </div>
    <GlassCard className="p-5">
      <h3 className="text-white text-lg mb-2">Активность (Часы)</h3>
      <div className="w-full h-24 flex items-end justify-between px-2 pt-8 gap-1">
         {[2,3,4,3,5,8,12,7,4,6].map((h, i) => (
           <div key={i} className="flex-1 bg-accent-primary/60 rounded-t" style={{height: `${h*8}%`}} />
         ))}
      </div>
    </GlassCard>
  </div>
);

const MailingTab = () => (
  <div className="space-y-4">
    <GlassCard className="p-5">
      <h3 className="text-white mb-2">Новая рассылка</h3>
      <select className="w-full bg-[#142920] border border-white/20 text-white rounded p-3 mb-3 outline-none">
        <option>Сегмент: Без интервью</option>
        <option>Сегмент: Без подписки</option>
        <option>Сегмент: Давно не заходили</option>
      </select>
      <textarea className="w-full bg-[#0d1f1a]/50 border border-white/20 text-white rounded p-3 min-h-[80px] outline-none mb-3" placeholder="Текст PUSH/сообщения..." />
      <button className="w-full bg-accent-primary text-white py-2 rounded font-medium">Отправить (тест)</button>
    </GlassCard>
    <GlassCard className="p-5">
      <h3 className="text-white mb-4">История рассылок</h3>
      <div className="text-secondary text-xs text-center border border-white/10 border-dashed py-4 rounded">Пусто</div>
    </GlassCard>
  </div>
);

const ModerationTab = () => (
  <div className="space-y-4">
    <GlassCard className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white">Жалобы (Очередь)</h3>
        <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">2 новые</span>
      </div>
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="flex flex-col bg-white/5 p-3 rounded-lg border border-red-500/30">
            <span className="text-white mb-1">user_toxic{i}</span>
            <span className="text-secondary text-xs mb-2">Причина: Оскорбления в чате</span>
            <div className="flex gap-2">
              <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition">Бан</button>
              <button className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded transition">Игнор</button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </div>
);

const SettingsTab = () => (
  <div className="space-y-4">
    <GlassCard className="p-5">
      <h3 className="text-white mb-2">Промпт AI-Агента</h3>
      <textarea className="w-full bg-black/40 border border-white/10 text-accent-secondary font-mono text-xs rounded p-3 min-h-[120px] outline-none mb-3" defaultValue={'Ты AI-агент, эксперт по отношениям...'} />
      <button className="w-auto bg-white/10 text-white px-4 py-2 rounded text-sm hover:bg-white/20 transition">Сохранить</button>
    </GlassCard>
    <GlassCard className="p-5">
      <h3 className="text-white mb-4">Feature Flags & Лимиты</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">MAX Платформа</span>
          <div className="w-10 h-5 bg-accent-primary rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">Реферальная система</span>
          <div className="w-10 h-5 bg-white/20 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-[#142920] rounded-full absolute left-0.5 top-0.5" /></div>
        </div>
        <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
          <span className="text-white text-sm">Цена Premium (₽)</span>
          <input type="text" defaultValue="1990" className="w-20 bg-black/40 border border-white/20 text-white text-right px-2 py-1 rounded outline-none" />
        </div>
      </div>
    </GlassCard>
  </div>
);
