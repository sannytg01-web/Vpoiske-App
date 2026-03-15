import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Diamond,
  Brain,
  Heart,
  AlertTriangle,
  Lock,
  ChevronLeft,
} from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";

export const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectMatch, selectedMatch, startChat, skipMatch } = useMatchStore();
  const isPremium = useAuthStore((s) => s.isPremium);

  const [processing, setProcessing] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (id) await selectMatch(id);
      } catch (e: any) {
        if (e.response?.status === 403) setAuthError(true);
      }
    };
    fetchDetails();
    return () => selectMatch(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStartChat = async () => {
    if (!selectedMatch) return;
    setProcessing(true);
    try {
      // Usually this requires real premium, but we mock it. By spec API throws 402 if not premium.
      // But we will navigate to paywall if we know client-side.
      // Allow free users to chat with unlocked profiles (first 3)
      if (!isPremium && selectedMatch.locked) {
        navigate("/paywall");
        return;
      }
      await startChat(selectedMatch.id);
      navigate(`/chat/${selectedMatch.id}`);
    } catch (e: any) {
      if (e.response?.status === 402) {
        navigate("/paywall");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedMatch) return;
    setProcessing(true);
    await skipMatch(selectedMatch.id);
    navigate(-1);
  };

  if (authError || (selectedMatch && selectedMatch.locked && !isPremium)) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-white min-h-screen text-center bg-transparent">
        <Lock size={40} className="mb-4 text-white/30" />
        <h3 className="text-h3 mb-2">Профиль скрыт</h3>
        <p className="text-body text-secondary mb-6">
          Оформите Premium, чтобы смотреть все профили полностью.
        </p>
        <Button variant="primary" onClick={() => navigate("/paywall")}>
          Go Premium
        </Button>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate(-1)}
        >
          Назад
        </Button>
      </div>
    );
  }

  if (!selectedMatch)
    return <div className="min-h-screen bg-transparent"></div>;

  const m = selectedMatch;
  const d = m.details;

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

      <div className="flex-1 overflow-y-auto px-4 pt-16 pb-32">
        {/* HERO: AVATAR ARC */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="flex items-center justify-center space-x-12 w-full mt-4">
            <div className="flex flex-col items-center">
              <div className="w-[70px] h-[70px] rounded-full border-[1.5px] border-white/40 bg-gradient-to-br from-[#4A9E7F] to-[#255241] flex items-center justify-center shadow-[0_0_20px_rgba(74,158,127,0.3)] relative z-10 overflow-hidden">
                <span className="text-2xl text-white font-serif">Я</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-[70px] h-[70px] rounded-full border-2 border-accent-warm/50 bg-gradient-to-br from-accent-warm to-accent-warm/40 flex items-center justify-center shadow-xl shadow-accent-warm/20 relative z-10 overflow-hidden">
                {m.photo ? (
                  <img src={m.photo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-white font-serif">
                    {m.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SVG ARC & SCORE */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[140px] pointer-events-none flex flex-col items-center">
            <svg
              viewBox="0 0 100 50"
              className="w-[80px] h-[40px] absolute -top-8 text-accent-warm opacity-80"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 50 Q 50 -20 100 50"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>
            <h1
              className="text-h1 m-0"
              style={{
                background: "-webkit-linear-gradient(160deg, #Ffffff, #E5B079)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {m.score}%
            </h1>
          </div>

          <p className="text-caption text-secondary mt-2 text-center w-full">
            Мы проанализировали всё: от даты
            <br />
            рождения до глубоких ценностей.
          </p>
        </div>

        {/* HORIZONTAL BREAKDOWN TABS */}
        <div className="w-full relative overflow-hidden mb-6">
          <div
            className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide px-4"
            style={{ margin: "0 -16px" }}
          >
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-3 px-4 flex items-center space-x-3 backdrop-blur-md">
              <div className="bg-[#4A9E7F]/10 p-2 rounded-lg">
                <Diamond className="text-[#4A9E7F]" size={18} />
              </div>
              <div className="pr-4">
                <span className="block text-[10px] text-white/50 font-bold tracking-wider uppercase">
                  HD-Механика
                </span>
                <span className="block text-body text-white font-medium">
                  {d?.hd_score ?? 85}%
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-3 px-4 flex items-center space-x-3 backdrop-blur-md">
              <div className="bg-[#B0BEC5]/10 p-2 rounded-lg">
                <Brain className="text-[#B0BEC5]" size={18} />
              </div>
              <div className="pr-4">
                <span className="block text-[10px] text-white/50 font-bold tracking-wider uppercase">
                  Психология
                </span>
                <span className="block text-body text-white font-medium">
                  {d?.psychology_score ?? 92}%
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl p-3 px-4 flex items-center space-x-3 backdrop-blur-md">
              <div className="bg-accent-warm/10 p-2 rounded-lg">
                <Heart className="text-accent-warm" size={18} />
              </div>
              <div className="pr-4">
                <span className="block text-[10px] text-white/50 font-bold tracking-wider uppercase">
                  Ценности
                </span>
                <span className="block text-body text-white font-medium">
                  {d?.values_score ?? 96}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED CARDS */}
        <div className="space-y-4">
          {/* HD CARD */}
          <GlassCard className="p-5">
            <div className="flex items-center space-x-3 mb-3 border-b border-white/10 pb-3">
              <Diamond className="text-[#4A9E7F]" size={20} />
              <h3 className="text-body font-semibold tracking-wider text-white">
                HUMAN DESIGN
              </h3>
            </div>
            <p className="text-body text-secondary leading-relaxed mb-2">
              Ваши типы ({m.hd_type} и Ваш) создают хорошую синергию.
              {d?.hd?.em_bonus > 0
                ? " У вас есть мощные электромагнитные связи — вас будет тянуть друг к другу как магнит."
                : ""}
            </p>
          </GlassCard>

          {/* PSYCHOLOGY CARD */}
          <GlassCard className="p-5">
            <div className="flex items-center space-x-3 mb-3 border-b border-white/10 pb-3">
              <Brain className="text-[#B0BEC5]" size={20} />
              <h3 className="text-body font-semibold tracking-wider text-white">
                ПСИХОЛОГИЯ
              </h3>
            </div>
            <p className="text-body text-secondary leading-relaxed mb-3">
              Отличная совместимость типов привязанности. Плюс, совпадающие
              уровни экстраверсии помогут легко планировать досуг.
            </p>
            {d?.psych?.attachment < 0 && (
              <div className="bg-accent-warning/10 p-3 rounded-xl border border-accent-warning/20 flex space-x-3 items-start mt-3">
                <AlertTriangle
                  className="text-accent-warning shrink-0"
                  size={18}
                />
                <span className="text-caption text-secondary">
                  Могут быть сложности в сближении из-за разных стилей базового
                  доверия. Потребуется открытость и терпение.
                </span>
              </div>
            )}
          </GlassCard>

          {/* VALUES CARD */}
          <GlassCard className="p-5">
            <div className="flex items-center space-x-3 mb-3 border-b border-white/10 pb-3">
              <Heart className="text-accent-warm" size={20} />
              <h3 className="text-body font-semibold tracking-wider text-white">
                ЦЕННОСТИ И ЖИЗНЬ
              </h3>
            </div>
            <p className="text-body text-secondary mb-3">
              У вас есть важные точки пересечения:
            </p>
            <div className="flex flex-wrap gap-2">
              {d?.values?.shared_values?.map((v: string) => (
                <span
                  key={v}
                  className="bg-accent-warm/10 text-accent-warm px-3 py-1 rounded-full text-caption font-medium border border-accent-warm/20"
                >
                  {v}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* FLOATING ACTION DOCK */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 px-6 z-10 flex space-x-3"
        style={{
          background: "linear-gradient(to top, #0d1f1a 80%, transparent)",
          paddingBottom: "calc(16px + var(--safe-bottom))",
        }}
      >
        <Button
          variant="secondary"
          className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10"
          disabled={processing}
          onClick={handleSkip}
        >
          Не мой человек
        </Button>
        <Button
          variant="primary"
          className="flex-[1.5]"
          disabled={processing}
          onClick={handleStartChat}
        >
          Начать общение →
        </Button>
      </div>
    </motion.div>
  );
};
