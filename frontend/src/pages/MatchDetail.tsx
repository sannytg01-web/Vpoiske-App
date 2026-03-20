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
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Zap,
  EyeOff,
} from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";
import { HDChart } from "../components/ui/HDChart";

// ──── Helper: generate match insights based on scores ────
const generateWhyMatched = (d: any) => {
  const reasons: string[] = [];

  if (d?.hd_score >= 85)
    reasons.push(
      `Ваши энергетические типы создают мощную синергию — вы дополняете друг друга на глубинном уровне.`
    );
  else if (d?.hd_score >= 70)
    reasons.push(
      `По Human Design ваши типы хорошо совместимы — есть потенциал для гармоничного взаимодействия.`
    );

  if (d?.hd?.em_bonus > 0)
    reasons.push(
      `У вас есть электромагнитные связи — вас будет тянуть друг к другу как магнит. Это редкое совпадение.`
    );

  if (d?.psychology_score >= 85)
    reasons.push(
      `Ваши психологические профили очень близки — вы будете интуитивно понимать друг друга.`
    );
  else if (d?.psychology_score >= 70)
    reasons.push(
      `Хорошая психологическая совместимость — схожие модели поведения в отношениях.`
    );

  if (d?.values_score >= 90)
    reasons.push(
      `Почти полное совпадение ключевых ценностей — это фундамент для долгосрочных отношений.`
    );
  else if (d?.values_score >= 70)
    reasons.push(
      `У вас есть важные общие ценности, на которых можно строить взаимопонимание.`
    );

  if (reasons.length === 0)
    reasons.push(
      `Наш алгоритм нашёл точки пересечения в энергетике, психологии и ценностях.`
    );

  return reasons;
};

const generateGrowthAreas = (d: any) => {
  const areas: { text: string; severity: "info" | "warn" }[] = [];

  if (d?.psych?.attachment < 0)
    areas.push({
      text: "Разные стили привязанности — важно давать друг другу время и не торопить сближение.",
      severity: "warn",
    });

  if (d?.psych?.neuro_diff && Math.abs(d.psych.neuro_diff) > 5)
    areas.push({
      text: "Разный уровень эмоциональности — один из вас может быть спокойнее, другой — интенсивнее. Ключ: терпение.",
      severity: "info",
    });

  if (d?.hd?.em_bonus === 0 && d?.hd_score < 80)
    areas.push({
      text: "Нет электромагнитных связей — первичная «искра» может быть не мгновенной, но глубина придёт с общением.",
      severity: "info",
    });

  if (d?.psych?.conflict && d.psych.conflict < 0)
    areas.push({
      text: "Разные стили конфликта — обсудите заранее, как вы хотите решать разногласия.",
      severity: "warn",
    });

  if (areas.length === 0)
    areas.push({
      text: "Серьёзных зон напряжения не обнаружено — отличная база для знакомства!",
      severity: "info",
    });

  return areas;
};

const generateIcebreakers = (hdType: string, sharedValues: string[]) => {
  const approach = localStorage.getItem('vpoiske_approach') || 'scientific';
  const icebreakers = [];

  // 1. HD
  if (approach === 'esoteric') {
    icebreakers.push(`Твоя энергия по дизайну — ${hdType}. Как ты ощущаешь этот поток в теле и жизни?`);
  } else {
    icebreakers.push(`Твой профиль — ${hdType}. Как это описание резонирует с твоим характером?`);
  }

  // 2. Values
  if (sharedValues.length > 0) {
     icebreakers.push(`Мы оба ценим «${sharedValues[0].toLowerCase()}» — как это ключевое качество проявляется в твоей жизни?`);
  } else {
     if (approach === 'esoteric') icebreakers.push(`Что наполняет твою душу ресурсом в трудные моменты?`);
     else icebreakers.push(`Какие принципы в отношениях для тебя абсолютно не подлежат компромиссу?`);
  }

  // 3. Psychology
  if (approach === 'esoteric') {
    icebreakers.push(`С какой своей «теневой» стороной тебе сложнее всего договориться?`);
  } else {
    icebreakers.push(`Как ты обычно реагируешь на острые или конфликтные стрессовые ситуации?`);
  }

  // 4. Interests
  icebreakers.push(`Расскажи о хобби или увлечении, за которым ты можешь потерять счёт времени?`);

  return icebreakers;
};

export const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectMatch, selectedMatch, startChat, skipMatch } = useMatchStore();
  const isPremium = useAuthStore((s) => s.isPremium);

  const [processing, setProcessing] = useState(false);
  const [signSent, setSignSent] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);

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

  const handleSendAnonymousSign = () => {
    setSignSent(true);
    // In actual implementation, an API call would queue a generic push notification to user_b.
    // e.g. apiClient.post(`/matches/${id}/anonymous-ping`)
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

  const whyMatched = generateWhyMatched(d);
  const growthAreas = generateGrowthAreas(d);
  const icebreakers = generateIcebreakers(
    m.hd_type,
    d?.values?.shared_values || []
  );

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
                  <img
                    src={m.photo}
                    className="w-full h-full object-cover"
                  />
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
                background:
                  "-webkit-linear-gradient(160deg, #Ffffff, #E5B079)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {m.score}%
            </h1>
          </div>

          {/* Anonymous notice */}
          <div className="flex items-center gap-1.5 mt-3 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <ShieldCheck size={12} className="text-[#4A9E7F]" />
            <span className="text-[10px] text-white/50 font-medium">
              Фото скрыто до взаимного обмена
            </span>
          </div>

          <p className="text-caption text-secondary mt-2 text-center w-full">
            Мы проанализировали энергетику,
            <br />
            психологию и ценности.
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

        {/* ═══════ WHY YOU MATCHED ═══════ */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <Sparkles size={18} className="text-[#4A9E7F]" />
            <h3 className="text-body font-semibold tracking-wider text-white m-0">
              ПОЧЕМУ ВЫ СОВПАЛИ
            </h3>
          </div>
          <div className="space-y-3">
            {whyMatched.map((reason, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4A9E7F]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={12} className="text-[#4A9E7F]" />
                </div>
                <p className="text-body text-secondary leading-relaxed m-0">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

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
            
            <div className="w-full flex justify-center mb-6">
               <div className="w-4/5 max-w-[280px]">
                  <HDChart 
                    definedCenters={m.hd_profile?.definedCenters || ["Sacral", "Ajna"]} 
                    activeChannels={m.hd_profile?.activeChannels || []} 
                  />
               </div>
            </div>

            <p className="text-body text-secondary leading-relaxed mb-2">
              {m.name} — {m.hd_type}.{" "}
              {d?.hd_score >= 85
                ? "Ваши типы создают мощную энергетическую синергию."
                : d?.hd_score >= 70
                ? "Хорошая совместимость типов с потенциалом для роста."
                : "Разные типы — но именно непохожесть создаёт притяжение."}
              {d?.hd?.em_bonus > 0
                ? " Электромагнитные связи усиливают взаимное притяжение."
                : ""}
              {d?.hd?.channel_bonus > 0
                ? ` Совпадение ${d.hd.channel_bonus / 5} активных каналов — редкое явление.`
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
              {d?.psychology_score >= 85
                ? "Отличная совместимость психологических профилей. Вы интуитивно понимаете мотивы друг друга."
                : d?.psychology_score >= 70
                ? "Хорошая психологическая совместимость. Есть основа для глубокого взаимопонимания."
                : "Разные психологические стили — но это создаёт возможности для роста обоих."}
            </p>
            {d?.psych?.attachment < 0 && (
              <div className="bg-accent-warning/10 p-3 rounded-xl border border-accent-warning/20 flex space-x-3 items-start mt-3">
                <AlertTriangle
                  className="text-accent-warning shrink-0"
                  size={18}
                />
                <span className="text-caption text-secondary">
                  Разные стили привязанности — важно давать друг другу
                  время и обсуждать потребности открыто.
                </span>
              </div>
            )}
          </GlassCard>

          {/* VALUES CARD */}
          <GlassCard className="p-5">
            <div className="flex items-center space-x-3 mb-3 border-b border-white/10 pb-3">
              <Heart className="text-accent-warm" size={20} />
              <h3 className="text-body font-semibold tracking-wider text-white">
                ОБЩИЕ ЦЕННОСТИ
              </h3>
            </div>
            <p className="text-body text-secondary mb-3">
              {d?.values?.shared_values?.length >= 3
                ? "У вас сильный фундамент общих ценностей:"
                : "У вас есть важные точки пересечения:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {d?.values?.shared_values?.map((v: string) => (
                <span
                  key={v}
                  className="bg-accent-warm/10 text-accent-warm px-3 py-1.5 rounded-full text-xs font-medium border border-accent-warm/20"
                >
                  {v}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ═══════ GROWTH AREAS ═══════ */}
        <GlassCard className="p-5 mt-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <AlertTriangle size={18} className="text-accent-warning" />
            <h3 className="text-body font-semibold tracking-wider text-white m-0">
              НА ЧТО ОБРАТИТЬ ВНИМАНИЕ
            </h3>
          </div>
          <div className="space-y-3">
            {growthAreas.map((area, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    area.severity === "warn"
                      ? "bg-accent-warning/15"
                      : "bg-[#4A9E7F]/15"
                  }`}
                >
                  {area.severity === "warn" ? (
                    <AlertTriangle
                      size={12}
                      className="text-accent-warning"
                    />
                  ) : (
                    <Sparkles size={12} className="text-[#4A9E7F]" />
                  )}
                </div>
                <p className="text-body text-secondary leading-relaxed m-0">
                  {area.text}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* ═══════ ICEBREAKER QUESTIONS ═══════ */}
        <GlassCard className="p-5 mt-4 mb-4">
          <button
            onClick={() => setShowIcebreakers(!showIcebreakers)}
            className="w-full flex items-center justify-between outline-none"
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-[#7bc4a0]" />
              <h3 className="text-body font-semibold tracking-wider text-white m-0">
                ШПАРГАЛКА ДЛЯ ПЕРВОГО СООБЩЕНИЯ
              </h3>
            </div>
            <Sparkles size={16} className="text-white/30" />
          </button>

          {showIcebreakers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-caption text-secondary mt-3 mb-3">
                AI подобрал вопросы специально для вашей пары:
              </p>
              <div className="space-y-2">
                {icebreakers.map((q, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 text-body text-white/80 leading-relaxed cursor-pointer hover:bg-white/8 transition-colors"
                    onClick={() => {
                      navigator.clipboard?.writeText(q);
                    }}
                  >
                    <span className="text-[#7bc4a0] font-semibold mr-2">
                      {i + 1}.
                    </span>
                    {q}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-2 text-center">
                Нажми на вопрос, чтобы скопировать
              </p>
            </motion.div>
          )}
        </GlassCard>
      </div>

      {/* FLOATING ACTION DOCK */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 px-6 z-10 flex flex-col space-y-3"
        style={{
          background: "linear-gradient(to top, #0d1f1a 80%, rgba(13,31,26,0.9) 20%, transparent)",
          paddingBottom: "calc(16px + var(--safe-bottom))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)"
        }}
      >
        <button
          onClick={handleSendAnonymousSign}
          disabled={signSent}
          className={`w-full py-3.5 rounded-[18px] flex items-center justify-center space-x-2 text-[13px] font-bold tracking-wider uppercase border transition-all ${
            signSent 
              ? "bg-[#4A9E7F]/20 text-[#4A9E7F] border-[#4A9E7F]/30 shadow-[0_0_15px_rgba(74,158,127,0.2)]" 
              : "bg-white/5 border-white/10 text-white/90 hover:bg-white/10 shadow-lg"
          }`}
        >
          {signSent ? <Sparkles size={16} /> : <EyeOff size={16} />}
          <span>{signSent ? "Вы дали анонимный знак!" : "Дать знак анонимно"}</span>
        </button>

        <div className="flex space-x-3 w-full">
          <Button
            variant="secondary"
            className="flex-1 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[13px]"
            disabled={processing}
            onClick={handleSkip}
          >
            Скрыть
          </Button>
          <Button
            variant="primary"
            className="flex-[1.5] text-[13px]"
            disabled={processing}
            onClick={handleStartChat}
          >
            Написать первым →
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
