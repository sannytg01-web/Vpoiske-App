import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, AlertOctagon } from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { pageTransition } from '../utils/animations';
import { tgAlert } from '../utils/telegram';
import { useAuthStore } from '../store/authStore';

export const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const REQUIRED_PHRASE = 'УДАЛИТЬ';

  const handleDeleteAccount = () => {
    if (confirmationPhrase !== REQUIRED_PHRASE) return;
    
    setIsDeleting(true);
    // Имитация задержки перед удалением (в реальном приложении — запрос к API)
    setTimeout(() => {
      logout();
      tgAlert('Ваш аккаунт и все связанные персональные данные были безвозвратно удалены.');
      navigate('/onboarding', { replace: true });
    }, 1500);
  };

  return (
    <motion.div 
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="page-content px-4 py-8 bg-transparent"
    >
      <AppBackground />

      <div className="absolute top-0 left-0 w-full p-4 z-20" style={{ paddingTop: 'calc(16px + var(--safe-top, 0px))' }}>
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors" disabled={isDeleting}>
          <ChevronLeft size={28} />
        </button>
      </div>

      <div className="flex flex-col items-center mt-12 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e05555] to-[#7a2e2e] flex items-center justify-center shadow-lg mb-4 shadow-[#e05555]/20 border border-[#e05555]/30">
          <Trash2 size={32} color="white" />
        </div>
        <h2 className="text-h2 text-white text-center m-0">Удаление профиля</h2>
      </div>
      
      <GlassCard variant="error" className="p-5 mb-8 border-[#e05555]/50 bg-black/20">
        <div className="flex items-start space-x-3 mb-4">
          <AlertOctagon className="text-[#e05555] shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-h3 text-white mb-2">Это действие необратимо</h3>
            <p className="text-body text-secondary m-0 text-sm">
              Удаление аккаунта приведет к безвозвратной потере всех ваших данных, включая:
            </p>
          </div>
        </div>
        <ul className="space-y-2 mb-4 ml-9 text-body text-white/70 text-sm">
          <li>— Историю сообщений и совпадения</li>
          <li>— Ваш психологический профиль</li>
          <li>— Расчеты механики Human Design</li>
          <li>— Активную Premium-подписку</li>
        </ul>
        <div className="p-4 bg-[#e05555]/10 rounded-xl border border-[#e05555]/20">
          <p className="text-caption text-white/90 m-0">
            Согласно 152-ФЗ, мы обязаны полностью стереть все ваши персональные данные с наших серверов. 
          </p>
        </div>
      </GlassCard>

      <div className="mt-auto flex flex-col pt-4">
        <p className="text-caption text-secondary mb-4 text-center">
          Чтобы подтвердить удаление, введите слово <strong>{REQUIRED_PHRASE}</strong> в поле ниже.
        </p>
        
        <div className="mb-6">
          <TextInput 
            placeholder="УДАЛИТЬ"
            value={confirmationPhrase}
            onChange={(e) => setConfirmationPhrase(e.target.value.toUpperCase())}
            disabled={isDeleting}
          />
        </div>

        <Button 
          variant="danger" 
          onClick={handleDeleteAccount} 
          disabled={confirmationPhrase !== REQUIRED_PHRASE || isDeleting}
          className="mb-4 bg-[#e05555]/10 hover:bg-[#e05555]/20 font-bold"
        >
          {isDeleting ? 'Удаление...' : 'Навсегда удалить аккаунт'}
        </Button>
      </div>
    </motion.div>
  );
};
