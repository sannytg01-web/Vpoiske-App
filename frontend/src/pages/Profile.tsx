import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2,
  Diamond,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
import { tgAlert } from "../utils/telegram";

import { AppBackground } from "../components/ui/AppBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import {
  usePsychProfileStore,
  attachmentLabels,
  valueLabels,
} from "../store/psychProfileStore";

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, premiumUntil, logout } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(
    profile?.bio || "Анализирую данные и люблю походы. Ищу того, с кем можно помолчать.",
  );
  const [showPsych, setShowPsych] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const psychProfile = usePsychProfileStore((s) => s.profile);

  // Dynamic user based on phone number and locally stored name
  const savedPhone = localStorage.getItem('vpoiske_phone') || '+7***';
  const savedName = localStorage.getItem('vpoiske_user_name');
  const lastFour = savedPhone.replace(/\D/g, '').slice(-4);

  const user = {
    name: profile?.name || savedName || `Пользователь ${lastFour}`,
    age: profile?.birth_year ? new Date().getFullYear() - profile.birth_year : null,
    city: profile?.city || localStorage.getItem('vpoiske_user_city') || null,
    photo: profile?.photo_url || null as string | null,
    hdType: "Генератор",
    hdProfile: "4/6",
    hdAuthority: "Сакральный",
    psychNotes: psychProfile
      ? `${attachmentLabels[psychProfile.attachment_style] || psychProfile.attachment_style} тип привязанности. ${psychProfile.profile_notes || ''}`
      : "Пройдите интервью, чтобы получить психологический портрет.",
    values: psychProfile?.top_values?.map(v => valueLabels[v.toLowerCase()] || v) || ["Пройдите интервью"],
  };

  const handleSaveBio = async () => {
    setIsEditingBio(false);
    await updateProfile({ bio: bioText });
  };

  // Strict admin check: verify actual phone number
  const ADMIN_PHONES = ['+79012206302', '+79506307630', '+79933290720'];
  const userPhone = localStorage.getItem('vpoiske_phone') || '';
  const isAdminLocal = ADMIN_PHONES.includes(userPhone);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-content bg-transparent"
    >
      <AppBackground />

      {/* TOP HEADER WITH BACK BUTTON */}
      <div
        className="absolute top-0 left-0 w-full p-4 z-20"
        style={{ paddingTop: "calc(16px + var(--safe-top, 0px))" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-10 pb-32 mt-8">
        {/* HEAD */}
        <div className="flex flex-col items-center mt-2 mb-8 relative">
          <div className="relative">
            <div className="w-[90px] h-[90px] rounded-full border-2 border-white/20 bg-gradient-to-br from-[#4A9E7F] to-[#142920] flex items-center justify-center shadow-lg overflow-hidden">
              {user.photo ? (
                <img src={user.photo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-white font-serif">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Edit2 size={14} />
            </button>
          </div>
          <h2 className="text-h2 mt-4 text-white mb-1">{user.name}</h2>
          <p className="text-body text-secondary m-0">
            {user.age ? `${user.age} лет` : ''}{user.age && user.city ? ' · ' : ''}{user.city || ''}
            {!user.age && !user.city && <span className="text-white/30 italic">Заполните профиль</span>}
          </p>

          {/* Anonymous badge */}
          <div className="flex items-center gap-1.5 mt-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <ShieldCheck size={12} className="text-[#4A9E7F]" />
            <span className="text-[10px] text-white/50 font-medium">Ваше фото анонимно до взаимного обмена</span>
          </div>
          
          {(profile?.is_admin || isAdminLocal) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Button
                variant="primary"
                onClick={() => navigate('/admin')}
                className="w-auto px-6 py-2 bg-gradient-to-r from-red-500 to-purple-600 border-none shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                Панель Администратора
              </Button>
            </motion.div>
          )}
        </div>

        {/* BIO */}
        <GlassCard className="p-5 mb-4">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
            <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase m-0">
              Обо мне
            </span>
            {!isEditingBio && (
              <button
                onClick={() => setIsEditingBio(true)}
                className="text-accent-primary text-caption font-medium hover:underline focus:outline-none"
              >
                Редактировать
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {isEditingBio ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-body min-h-[80px] focus:outline-none focus:border-accent-primary transition-colors"
                />
                <Button
                  variant="primary"
                  onClick={handleSaveBio}
                  className="w-full py-2"
                >
                  Сохранить
                </Button>
              </motion.div>
            ) : (
              <motion.p
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-body text-white leading-relaxed m-0"
              >
                {bioText}
              </motion.p>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* HUMAN DESIGN */}
        <GlassCard className="p-5 mb-4">
          <div className="mb-3 border-b border-white/10 pb-3">
            <span className="text-[10px] text-[#4A9E7F] font-bold tracking-wider uppercase inline-block border border-[#4A9E7F]/30 bg-[#4A9E7F]/10 rounded-md px-2 py-0.5">
              HUMAN DESIGN
            </span>
          </div>
          <h3 className="text-h3 text-white mb-2">
            {user.hdType} · {user.hdProfile}
          </h3>
          <p className="text-caption text-secondary mb-5">
            Авторитет: {user.hdAuthority}
          </p>
          <Button
            variant="secondary"
            className="w-full py-2.5 text-sm bg-white/5"
            onClick={() =>
              navigate("/birth-data", { state: { fromProfile: true } })
            }
          >
            Изменить данные рождения
          </Button>
        </GlassCard>

        {/* SELF PASSPORT LINK */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
            <Fingerprint size={20} className="text-[#4A9E7F]" />
            <h3 className="text-body font-semibold tracking-wider text-white m-0">
              ПАСПОРТ СЕБЯ
            </h3>
          </div>
          <p className="text-caption text-secondary mb-3">
            Твой полный профиль: Human Design + Психология + Ценности
          </p>
          <Button
            variant="secondary"
            className="w-full py-2.5 text-sm bg-white/5"
            onClick={() => navigate('/hd-card')}
          >
            Открыть паспорт →
          </Button>
        </GlassCard>

        {/* PSYCHOLOGY */}
        <GlassCard className="p-5 mb-4 overflow-hidden">
          <div className="mb-3 border-b border-white/10 pb-3">
            <span className="text-[10px] text-[#B0BEC5] font-bold tracking-wider uppercase inline-block border border-[#B0BEC5]/30 bg-[#B0BEC5]/10 rounded-md px-2 py-0.5">
              ПСИХОЛОГИЯ
            </span>
          </div>
          <p className="text-body text-white leading-relaxed mb-4">
            {user.psychNotes}
          </p>

          <button
            onClick={() => setShowPsych(!showPsych)}
            className="w-full flex justify-between items-center py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors focus:outline-none"
          >
            <span className="text-body font-medium">Посмотреть подробнее</span>
            {showPsych ? (
              <ChevronUp size={16} className="text-white/50" />
            ) : (
              <ChevronDown size={16} className="text-white/50" />
            )}
          </button>

          <AnimatePresence>
            {showPsych && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-3 border-t border-white/5">
                  <p className="text-caption text-secondary mb-3 uppercase tracking-wider font-semibold text-[10px]">
                    Топ-5 ценностей
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.values.map((v) => (
                      <span
                        key={v}
                        className="bg-white/5 text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* SUBSCRIPTION */}
        <GlassCard className="p-5 mb-6">
          {isPremium ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <Diamond
                  size={20}
                  className="text-accent-warm"
                  fill="currentColor"
                />
                <h3 className="text-body font-semibold text-accent-warm m-0 tracking-wide text-lg">
                  Premium активна
                </h3>
              </div>
              <p className="text-sm text-secondary mb-5 m-0 font-medium">
                До{" "}
                {premiumUntil
                  ? new Date(premiumUntil).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </p>
              <Button
                variant="secondary"
                className="w-full py-2.5 text-sm bg-white/5 border border-white/10"
                onClick={() =>
                  tgAlert("Управление подпиской в разработке")
                }
              >
                Управление подпиской
              </Button>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-accent-warm/10 flex items-center justify-center mx-auto mb-3 border border-accent-warm/20 shadow-[0_0_15px_rgba(229,176,121,0.2)]">
                <Diamond
                  size={24}
                  className="text-accent-warm"
                  fill="currentColor"
                />
              </div>
              <h3 className="text-[17px] font-semibold tracking-wide text-white mb-2 m-0">
                Базовый доступ
              </h3>
              <p className="text-caption text-secondary mb-5 m-0 tracking-wide">
                Максимум возможностей алгоритма скрыты.
              </p>
              <Button
                variant="primary"
                className="w-full text-[15px] shadow-[0_0_15px_rgba(229,176,121,0.2)]"
                onClick={() => navigate("/paywall")}
              >
                Перейти на Premium
              </Button>
            </div>
          )}
        </GlassCard>

        {/* SETTINGS MENU */}
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest pl-2 mb-3 mt-4">
          Настройки
        </h3>
        <GlassCard className="p-0 overflow-hidden mb-8 border-white/10 divide-y divide-white/10">
          <div className="p-4 px-5 flex justify-between items-center bg-white/[0.02]">
            <span className="text-body font-medium text-white m-0">
              Уведомления о мэтчах
            </span>
            {/* Custom Toggle switch */}
            <div
              className={`w-11 h-6 rounded-full relative cursor-pointer px-1 transition-colors flex items-center ${notifications ? "bg-[#4A9E7F]" : "bg-white/20"}`}
              onClick={() => setNotifications(!notifications)}
            >
              <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-sm"
                animate={{ x: notifications ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
          <div
            onClick={() =>
              tgAlert(
                "В этом разделе вы сможете настроить видимость профиля (в разработке)",
              )
            }
            className="p-4 px-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors bg-white/[0.02]"
          >
            <span className="text-body font-medium text-white m-0">
              Конфиденциальность
            </span>
            <ChevronLeft size={18} className="text-white/30 rotate-180" />
          </div>
          <div
            onClick={() => navigate('/data-export')}
            className="p-4 px-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors bg-white/[0.02]"
          >
            <span className="text-body font-medium text-white m-0">
              Скачать мои данные
            </span>
            <ChevronLeft size={18} className="text-white/30 rotate-180" />
          </div>
          <div
            onClick={() => navigate('/delete-account')}
            className="p-4 px-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors bg-white/[0.02]"
          >
            <span className="text-body font-medium text-accent-warning m-0">
              Удалить аккаунт
            </span>
          </div>
          <div
            onClick={() => {
              logout();
              navigate("/onboarding", { replace: true });
            }}
            className="p-4 px-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors bg-white/[0.02]"
          >
            <span className="text-body font-medium text-accent-warning m-0">
              Выйти из аккаунта
            </span>
          </div>
          <div className="p-4 px-5 flex justify-between items-center bg-white/[0.01]">
            <span className="text-body font-medium text-secondary m-0">
              О приложении
            </span>
            <span className="text-xs font-semibold tracking-wider text-white/30 m-0">
              v1.0.0
            </span>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};
