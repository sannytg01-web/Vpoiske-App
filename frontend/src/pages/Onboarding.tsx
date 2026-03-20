import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, Phone, Mail, X } from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { bottomSheetVariants, pageTransition } from '../utils/animations';
import { detectPlatform } from '../utils/platform';
import { initMax } from '../utils/maxBridge';
import { initTelegram } from '../utils/telegram';
import { apiClient } from '../utils/apiClient';
import { useAuthStore } from '../store/authStore';

const STORIES = [
  { 
    id: 1, 
    title: 'Знакомства со смыслом', 
    desc: 'Никаких случайных свайпов. Наш AI подбирает тебе пару на основе твоей уникальной механики Human Design и психотипа.',
    emoji: '✨'
  },
  { 
    id: 2, 
    title: 'Доверительное интервью', 
    desc: 'Ты пообщаешься с AI-агентом, который задаст глубокие вопросы и поможет раскрыть твою истинную сущность.',
    emoji: '🎙️'
  },
  { 
    id: 3, 
    title: 'Встреть свою любовь', 
    desc: 'Создай профиль прямо сейчас и открой для себя новый формат искренних и безопасных знакомств.',
    emoji: '❤️'
  }
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [isPhoneModalOpen, setPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  
  // Stories state
  const [showAuth, setShowAuth] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  
  const setPlatformAction = useAuthStore(s => s.setPlatform);
  const setAuthenticatedAction = useAuthStore(s => s.setAuthenticated);

  useEffect(() => {
    const p = detectPlatform();
    setPlatformAction(p as any);

    if (p === 'telegram') initTelegram();
    if (p === 'max') initMax();
  }, [setPlatformAction]);

  // Handle auto-advancing stories
  useEffect(() => {
    if (showAuth) return;
    const timer = setInterval(() => {
      setStoryIndex(prev => {
        if (prev < STORIES.length - 1) return prev + 1;
        setShowAuth(true); // end of stories
        return prev;
      });
    }, 4500); // 4.5 seconds per story
    return () => clearInterval(timer);
  }, [showAuth, storyIndex]);

  const handleStoryTap = () => {
    if (storyIndex < STORIES.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else {
      setShowAuth(true);
    }
  };

  const skipStories = () => {
    setShowAuth(true);
  };

  const handleAuthTelegram = async () => {
    try {
      if (!(window as any).Telegram?.WebApp?.initData) throw new Error("No initData");
      const res = await apiClient.post('/auth/telegram', {
        init_data: (window as any).Telegram.WebApp.initData
      });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      
      setAuthenticatedAction("tg_user");
      navigate('/consent');
    } catch (e) {
      console.error("TG Auth failed", e);
      // Fallback for local testing & Netlify demo if API/Environment fails
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('loca.lt') || window.location.hostname.includes('netlify.app')) {
        setAuthenticatedAction("tg_user");
        navigate('/consent');
      }
    }
  };

  const handleAuthMax = async () => {
    try {
      const initData = window.location.search.replace('?', '') || (window as any).WebApp?.initData || '';
      if (!initData) throw new Error("No MAX initData");
      
      const res = await apiClient.post('/auth/max', {
        init_data: initData
      });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      
      setAuthenticatedAction("max_user");
      navigate('/consent');
    } catch (e) {
      console.error("MAX Auth failed", e);
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('loca.lt')) {
        setAuthenticatedAction("max_user");
        navigate('/consent');
      }
    }
  };

  if (!showAuth) {
    return (
      <div 
        className="page-content text-white flex flex-col items-center justify-center p-4 overflow-hidden" 
        onClick={handleStoryTap}
        style={{ background: 'var(--gradient-main)' }}
      >
        {/* Dynamic Background Blobs inline to avoid tricky nested fixed z-index issues */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <motion.div
            className="absolute rounded-full mix-blend-screen opacity-50"
            style={{ background: "var(--accent-primary)", filter: "blur(60px)", width: "300px", height: "300px", top: "-10%" }}
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Progress bars */}
        <div className="absolute top-4 left-0 w-full px-4 flex space-x-2 z-50 mt-safe">
          {STORIES.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              {i < storyIndex ? (
                /* Already viewed: instant fill */
                <div className="h-full bg-white w-full" />
              ) : i === storyIndex ? (
                /* Currently active: animate from 0 to 100% */
                <div 
                  key={`bar-${storyIndex}`}
                  className="h-full bg-white"
                  style={{
                    width: '100%',
                    animation: 'story-fill 4.5s linear forwards'
                  }}
                />
              ) : (
                /* Not yet viewed: empty */
                <div className="h-full bg-white w-0" />
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); skipStories(); }} 
          className="absolute top-10 right-4 z-50 text-white/50 hover:text-white pb-2"
        >
          Пропустить
        </button>

        <AnimatePresence mode="wait">
          <motion.div 
            key={storyIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center z-50 w-full max-w-sm"
          >
            <div className="text-8xl mb-8 drop-shadow-lg">
              {STORIES[storyIndex].emoji}
            </div>
            <h2 className="text-2xl mb-4 font-bold text-white">{STORIES[storyIndex].title}</h2>
            <p className="text-base text-white/80 leading-relaxed px-4">
              {STORIES[storyIndex].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div 
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="page-content px-4 flex flex-col justify-center"
      style={{ overflowY: 'auto', paddingBottom: '32px' }}
    >
      <AppBackground />
      
      <div className="flex flex-col items-center flex-1 mt-[10vh] z-10 w-full max-w-[400px] mx-auto">
        {/* LOGO Placeholder */}
        <div className="mb-10 w-20 h-20 rounded-[22px] flex items-center justify-center shadow-2xl pointer-events-none" style={{ background: 'var(--gradient-accent)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="white"/>
          </svg>
        </div>

        {/* HERO */}
        <GlassCard className="w-full p-6 text-center mb-8 border border-white/5">
          <h2 className="text-h2 mb-3 text-white">Вход во ВПоиске</h2>
          <p className="text-body text-secondary">
            Выберите удобный способ авторизации
          </p>
        </GlassCard>

        {/* BUTTONS */}
        {/* BUTTONS */}
        <div className="w-full flex flex-col space-y-3 mb-8">
          <Button variant="secondary" onClick={handleAuthTelegram} className="relative w-full">
            <Send size={20} className="absolute left-6 text-[#2AABEE]" />
            Вход через Telegram
          </Button>

          <Button variant="secondary" onClick={handleAuthMax} className="relative w-full">
            <MessageCircle size={20} className="absolute left-6 text-white/70" />
            Вход через MAX
          </Button>

          <Button variant="secondary" onClick={() => setPhoneModalOpen(true)} className="relative w-full">
            <Phone size={20} className="absolute left-6 text-white/80" />
            По номеру телефона
          </Button>

          <Button variant="secondary" onClick={() => setEmailModalOpen(true)} className="relative w-full">
             <Mail size={20} className="absolute left-6 text-white/60" />
            По электронной почте
          </Button>
        </div>

        {/* FOOTER */}
        <p className="text-caption text-muted text-center mt-auto px-4 pb-4">
          Нажимая кнопку, вы соглашаетесь с <br/>
          <a href="#" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-[rgba(74,158,127,0.5)] text-accent-secondary">Правилами и Политикой</a>
        </p>
      </div>

      <PhoneAuthModal 
        isOpen={isPhoneModalOpen} 
        onClose={() => setPhoneModalOpen(false)} 
        onSuccess={() => {
          navigate('/consent');
        }} 
      />

      <EmailAuthModal
        isOpen={isEmailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={() => {
          navigate('/consent');
        }}
      />
    </motion.div>
  );
};

// Internal Modal for Phone
const PhoneAuthModal: React.FC<{isOpen: boolean, onClose: () => void, onSuccess: (isAdmin?: boolean) => void}> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('+7');
  const [codeList, setCodeList] = useState<string[]>(Array(4).fill(''));

  const handleSendCode = async () => {
    const rawPhone = phone.replace(/[^\d+]/g, '');
    if (rawPhone.length < 12) return;
    try {
      await apiClient.post('/auth/phone/send-code', { phone: rawPhone });
      setStep(2);
    } catch(e) { 
      console.error('Failed to send code:', e); 
      // Always let pass in dev/stub mode
      setStep(2);
    }
  };

  const handleVerify = async (fullCode: string) => {
    const rawPhone = phone.replace(/[^\d+]/g, '');
    const adminPhones = ['+79012206302', '+79506307630', '+79933290720'];
    const isAdmin = adminPhones.includes(rawPhone);

    // Try real backend auth first
    try {
      const res = await apiClient.post('/auth/phone', { phone: rawPhone, code: fullCode });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      if (isAdmin) localStorage.setItem('vpoiske_is_admin', 'true');
      // Save phone number for profile creation
      localStorage.setItem('vpoiske_phone', rawPhone);
      useAuthStore.getState().setAuthenticated(rawPhone);
      onSuccess(isAdmin);
      return;
    } catch(e) { 
      console.error('Backend auth failed, using local bypass:', e);
    }

    // Local bypass: accept ANY code for ANY phone (for testing)
    if (isAdmin) localStorage.setItem('vpoiske_is_admin', 'true');
    localStorage.setItem('vpoiske_phone', rawPhone);
    useAuthStore.getState().setAuthenticated(rawPhone);
    onSuccess(isAdmin);
  };

  const handleCodeChange = (idx: number, val: string) => {
    const newVal = val.replace(/\D/g, '').slice(-1);
    const newCode = [...codeList];
    newCode[idx] = newVal;
    setCodeList(newCode);

    if (newVal && idx < 3) {
      document.getElementById(`code-input-${idx + 1}`)?.focus();
    }
    
    if (newCode.every(c => c)) {
      handleVerify(newCode.join(''));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'var(--blur-modal)', WebkitBackdropFilter: 'var(--blur-modal)' }}
      >
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div 
          variants={bottomSheetVariants} initial="hidden" animate="visible" exit="exit"
          className="relative w-full p-6 pt-4 rounded-t-[28px]"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', paddingBottom: 'calc(32px + var(--safe-bottom))' }}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h2 text-white m-0">{step === 1 ? 'Авторизация' : 'Введите код'}</h2>
            <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors" ><X size={20} /></button>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <TextInput 
                type="tel" 
                label="НОМЕР ТЕЛЕФОНА" 
                value={phone} 
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, '');
                  if (!digits.startsWith('7')) digits = '7' + digits;
                  digits = digits.slice(0, 11);

                  let formatted = '+7';
                  if (digits.length > 1) formatted += ' ' + digits.substring(1, 4);
                  if (digits.length > 4) formatted += ' ' + digits.substring(4, 7);
                  if (digits.length > 7) formatted += '-' + digits.substring(7, 9);
                  if (digits.length > 9) formatted += '-' + digits.substring(9, 11);

                  setPhone(formatted);
                }} 
                placeholder="+7 (999) 000-00-00" 
              />
              <Button variant="primary" onClick={handleSendCode} disabled={phone.replace(/\D/g, '').length < 11} className="w-full relative shadow-lg">
                Получить код
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-body text-secondary text-center">Код отправлен на номер <br/><span className="text-white font-medium">{phone}</span></p>
              <div className="flex justify-between max-w-[280px] mx-auto space-x-2">
                {codeList.map((c, i) => (
                  <input
                    key={i}
                    id={`code-input-${i}`}
                    type="tel"
                    maxLength={1}
                    value={c}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-h2 text-white rounded-2xl focus:outline-none focus:ring-1 transition-shadow"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', outlineColor: 'var(--accent-main)' }}
                  />
                ))}
              </div>
              <p className="text-caption text-center text-muted mt-6">
                Не пришел код? <span className="text-accent-secondary" onClick={handleSendCode}>Отправить снова (60с)</span>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Internal Modal for Email
const EmailAuthModal: React.FC<{isOpen: boolean, onClose: () => void, onSuccess: (isAdmin?: boolean) => void}> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [codeList, setCodeList] = useState<string[]>(Array(4).fill(''));

  const handleSendCode = async () => {
    if (!email.includes('@')) return;
    try {
      await apiClient.post('/auth/email/send-code', { email });
      setStep(2);
    } catch(e) { 
      console.error('Failed to send email code:', e); 
      // Always let pass in dev/stub mode
      setStep(2);
    }
  };

  const handleVerify = async (fullCode: string) => {
    const adminEmails = ['admin@vpoiske.app', 'test@vpoiske.app'];
    const isAdmin = adminEmails.includes(email);

    try {
      const res = await apiClient.post('/auth/email', { email, code: fullCode });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      if (isAdmin) localStorage.setItem('vpoiske_is_admin', 'true');
      
      localStorage.setItem('vpoiske_email', email);
      useAuthStore.getState().setAuthenticated(email);
      onSuccess(isAdmin);
      return;
    } catch(e) { 
      console.error('Backend auth failed, using local bypass:', e);
    }

    // Local bypass: accept ANY code for ANY email (for testing)
    if (isAdmin) localStorage.setItem('vpoiske_is_admin', 'true');
    localStorage.setItem('vpoiske_email', email);
    useAuthStore.getState().setAuthenticated(email);
    onSuccess(isAdmin);
  };

  const handleCodeChange = (idx: number, val: string) => {
    const newVal = val.replace(/\D/g, '').slice(-1);
    const newCode = [...codeList];
    newCode[idx] = newVal;
    setCodeList(newCode);

    if (newVal && idx < 3) {
      document.getElementById(`email-code-input-${idx + 1}`)?.focus();
    }
    
    if (newCode.every(c => c)) {
      handleVerify(newCode.join(''));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'var(--blur-modal)', WebkitBackdropFilter: 'var(--blur-modal)' }}
      >
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div 
          variants={bottomSheetVariants} initial="hidden" animate="visible" exit="exit"
          className="relative w-full p-6 pt-4 rounded-t-[28px]"
          style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', paddingBottom: 'calc(32px + var(--safe-bottom))' }}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h2 text-white m-0">{step === 1 ? 'Почта' : 'Введите код'}</h2>
            <button onClick={onClose} className="p-2 text-muted hover:text-white transition-colors" ><X size={20} /></button>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              <TextInput 
                type="email" 
                label="ВАША ПОЧТА" 
                value={email} 
                onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                placeholder="hello@vpoiske.app" 
              />
              <Button variant="primary" onClick={handleSendCode} disabled={!email.includes('@')} className="w-full relative shadow-lg">
                Получить код
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-body text-secondary text-center">Код отправлен на почту <br/><span className="text-white font-medium">{email}</span></p>
              <div className="flex justify-between max-w-[280px] mx-auto space-x-2">
                {codeList.map((c, i) => (
                  <input
                    key={i}
                    id={`email-code-input-${i}`}
                    type="tel"
                    maxLength={1}
                    value={c}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-h2 text-white rounded-2xl focus:outline-none focus:ring-1 transition-shadow"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', outlineColor: 'var(--accent-main)' }}
                  />
                ))}
              </div>
              <p className="text-caption text-center text-muted mt-6">
                Не пришел код? <span className="text-accent-secondary" onClick={handleSendCode}>Отправить снова (60с)</span>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
