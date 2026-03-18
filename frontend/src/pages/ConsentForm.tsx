import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check } from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { SectionTag } from '../components/ui/SectionTag';
import { pageTransition } from '../utils/animations';
import { apiClient } from '../utils/apiClient';

export const ConsentForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // States
  const [agreedPDP, setAgreedPDP] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleStep1 = async () => {
    if (!agreedPDP) return;
    try {
      await apiClient.post('/consent/pdp');
      setStep(2);
    } catch (e) {
      console.error(e);
      // Even if offline/failed on dev, proceed for testability
      setStep(2);
    }
  };

  const handleStep2 = async (agree: boolean) => {
    if (agree) {
      try {
        await apiClient.post('/consent/psychological');
        setStep(3);
      } catch (e) { console.error(e); setStep(3); }
    } else {
      alert("Без психологического профиля матчинг будет неточным. Вы можете дать согласие позже в профиле.");
      setStep(3);
    }
  };

  const handleStep3 = async () => {
    try {
      if (analytics) await apiClient.post('/consent/analytics');
      if (marketing) await apiClient.post('/consent/marketing');
      navigate('/create-profile');
    } catch(e) {
      navigate('/create-profile');
    }
  };

  return (
    <motion.div 
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="page-content px-4 py-8 relative"
    >
      <AppBackground />

      {/* DEV STUB: Clear Auth Button */}
      {(window.location.hostname === 'localhost' || window.location.hostname.includes('loca.lt')) && (
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/onboarding');
            window.location.reload();
          }}
          className="absolute top-4 right-4 z-50 text-[10px] text-white/40 border border-white/20 rounded-md px-2 py-1 hover:text-white"
        >
          [DEV] Сбросить
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <SectionTag className="self-start mb-4">ПРЕЖДЕ ЧЕМ НАЧАТЬ</SectionTag>
            <h2 className="text-h2 text-white mb-6">Твои данные защищены</h2>
            
            <GlassCard className="p-5 mb-8">
              <p className="text-body text-secondary mb-4">Для корректной работы алгоритмов и безопасности платформы мы бережно храним:</p>
              <ul className="space-y-3 mb-2 text-body text-white">
                <li className="flex items-center space-x-2"><span className="text-accent-secondary">•</span><span>Имя и контактные данные</span></li>
                <li className="flex items-center space-x-2"><span className="text-accent-secondary">•</span><span>Дату, время и место рождения</span></li>
                <li className="flex items-center space-x-2"><span className="text-accent-secondary">•</span><span>Психологический профиль</span></li>
                <li className="flex items-center space-x-2"><span className="text-accent-secondary">•</span><span>Зашифрованные переписки</span></li>
              </ul>
            </GlassCard>

            <div className="mt-auto flex flex-col pt-8">
              <label className="flex items-start space-x-3 mb-6 cursor-pointer group">
                <div className="relative mt-1">
                  <input type="checkbox" className="sr-only" checked={agreedPDP} onChange={(e) => setAgreedPDP(e.target.checked)} />
                  <div className="w-6 h-6 rounded-md border-2 
                    flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: agreedPDP ? 'transparent' : 'var(--border-subtle)',
                      background: agreedPDP ? 'var(--gradient-accent)' : 'var(--bg-card)'
                    }}>
                    {agreedPDP && <Check size={16} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-body text-white block mb-1.5">Соглашаюсь с обработкой персональных данных</span>
                  <span 
                    className="inline-block text-caption text-accent-secondary underline underline-offset-4 decoration-[rgba(74,158,127,0.3)] hover:text-[#4A9E7F] transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Документ «Политика конфиденциальности» в данный момент находится в разработке. Скоро он здесь появится.");
                    }}
                  >
                    Политика конфиденциальности →
                  </span>
                </div>
              </label>

              <Button variant="primary" disabled={!agreedPDP} onClick={handleStep1}>
                Продолжить
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="mb-6 w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg" style={{ background: 'var(--gradient-warm)' }}>
              <ShieldCheck size={28} color="white" />
            </div>
            
            <h2 className="text-h2 text-white mb-6">Психологический профиль</h2>
            
            <GlassCard className="p-5 mb-4">
              <p className="text-body text-white m-0">
                Ты собираешься пройти глубокое интервью с AI-агентом. Мы проанализируем ответы для создания твоего уникального психологического слепка. Это данные <span className="text-accent-warm">специальной категории</span> (ст.10 152-ФЗ).
              </p>
            </GlassCard>

            <GlassCard className="p-5 mb-8">
              <h3 className="text-h3 text-white mb-3">Твои права:</h3>
              <ul className="space-y-3 text-body text-secondary">
                <li>Удалить аккаунт в любой момент</li>
                <li>Скачать архив своих данных</li>
                <li>Отозвать согласие через настройки</li>
                <li>Твои данные никогда не будут проданы 3-м лицам</li>
              </ul>
            </GlassCard>

            <div className="mt-auto flex flex-col space-y-3">
              <Button variant="primary" onClick={() => handleStep2(true)}>
                Даю согласие
              </Button>
              <Button variant="danger" onClick={() => handleStep2(false)}>
                Не соглашаюсь
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <h3 className="text-h2 text-white mt-10 mb-8 max-w-[200px]">Ещё пара <br/>вопросов</h3>
            
            <GlassCard className="p-4 mb-4 flex justify-between items-center">
              <div className="flex-1 pr-4">
                <span className="text-body text-white block">Помочь улучшить алгоритм</span>
                <span className="text-caption text-secondary">Обезличенный анализ диалогов с агентом</span>
              </div>
              <Toggle checked={analytics} onChange={setAnalytics} />
            </GlassCard>

            <GlassCard className="p-4 mb-8 flex justify-between items-center">
              <div className="flex-1 pr-4">
                <span className="text-body text-white block">Получать новости</span>
                <span className="text-caption text-secondary">Акции, персональные скидки, события</span>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} />
            </GlassCard>

            <div className="mt-auto">
              <Button variant="primary" onClick={handleStep3}>
                Начать <span className="ml-2">→</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
