import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Brain,
  Heart,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { SectionTag } from "../components/ui/SectionTag";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useBirthDataStore } from "../store/birthDataStore";
import { HDChart } from "../components/ui/HDChart";
import {
  usePsychProfileStore,
  attachmentLabels,
  attachmentDescriptions,
  conflictLabels,
  conflictDescriptions,
  energyLabels,
  valueLabels,
  shadowLabels,
} from "../store/psychProfileStore";

// ──── Big Five radar-style bar component ────
const BigFiveTrait: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}> = ({ label, value, color, icon }) => (
  <div className="flex items-center gap-3 mb-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `${color}20` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-white/80 truncate">
          {label}
        </span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color }}
        >
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="w-full h-[6px] rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  </div>
);

export const HDCard: React.FC = () => {
  const navigate = useNavigate();
  const hdCard = useBirthDataStore((s) => s.hdCard);
  const psychProfile = usePsychProfileStore((s) => s.profile);

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (!hdCard) {
    return (
      <div className="flex items-center justify-center p-10 text-white min-h-screen text-center">
        Нет данных карты. Пожалуйста, вернитесь назад.
      </div>
    );
  }

  // Type descriptions mapping
  const typeDescriptions: Record<string, string> = {
    Генератор:
      "Ты — источник жизненной силы и энергии. Твоя стратегия — ждать отклика Сакрального центра, чтобы вкладывать энергию только в то, что по-настоящему зажигает.",
    "Манифестирующий Генератор":
      "Ты обладаешь мощной энергией, способной не только инициировать процессы, но и доводить их до конца. Важно следовать отклику, прежде чем действовать.",
    Манифестор:
      "Ты рождён(а), чтобы влиять на мир и свободен(на) инициировать процессы. Главное — информировать других о своих решениях до того, как начнёшь действовать.",
    Проектор:
      "Твой дар — видеть глубокую суть других людей и процессов. Твоя стратегия — ждать приглашения, чтобы твоя мудрость и направление были услышаны и приняты.",
    Отражатель:
      "Твоя аура как зеркало: ты отражаешь состояние среды и коллектива. Тебе нужно 28 дней лунного цикла для принятия действительно важных решений.",
  };

  const centerRussianMap: Record<string, string> = {
    Head: "Теменной (Вдохновение)",
    Ajna: "Аджна (Концептуализация)",
    Throat: "Горловой (Выражение)",
    G: "Джи-центр (Идентичность и Направление)",
    Heart: "Эго-центр (Сила воли)",
    Sacral: "Сакральный (Жизненная энергия)",
    Spleen: "Селезёночный (Интуиция и Здоровье)",
    SolarPlexus: "Солнечное Сплетение (Эмоции)",
    Root: "Корневой (Давление и Драйв)",
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-content bg-transparent"
    >
      <AppBackground />

      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
        {/* ════════════════ PASSPORT HEADER ════════════════ */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A9E7F] to-[#c4956a] flex items-center justify-center shadow-lg">
            <Fingerprint size={22} className="text-white" />
          </div>
          <div>
            <SectionTag className="mb-0">ПАСПОРТ СЕБЯ</SectionTag>
          </div>
        </div>
        <h1 className="text-h1 text-white mb-2 tracking-tight">
          Твоя карта личности
        </h1>
        <p className="text-body text-secondary mb-6">
          Human Design + Психологический профиль
        </p>

        {/* ════════════════ SECTION 1: HUMAN DESIGN ════════════════ */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#4A9E7F]" />
            <span className="text-[11px] text-[#4A9E7F] font-bold tracking-wider uppercase">
              HUMAN DESIGN
            </span>
          </div>
        </div>

        {/* Main Info Card */}
        <GlassCard className="p-5 mb-6">
          <h2
            className="text-h2 text-white mb-2 pb-2 border-b border-white/10"
            style={{
              background: "-webkit-linear-gradient(160deg, #Ffffff, #B0BEC5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {hdCard.type}
          </h2>
          <h3 className="text-h3 text-secondary font-medium mb-3 tracking-wide">
            Профиль {hdCard.profile} <br />{" "}
            <span className="opacity-80">Авторитет: {hdCard.authority}</span>
          </h3>
          <p className="text-body text-white leading-relaxed">
            {typeDescriptions[hdCard.type] ||
              "Твой уникальный энергетический рисунок."}
          </p>
        </GlassCard>

        {/* Warning if time unknown */}
        {hdCard.birth_time_accuracy === "unknown" && (
          <GlassCard className="mb-6 p-4 border border-[#e5b079]/30 bg-[#e5b079]/5 flex items-start space-x-3">
            <AlertTriangle
              className="text-[#e5b079] flex-shrink-0"
              size={20}
            />
            <p className="text-caption text-secondary m-0">
              ⚠ Время рождения неизвестно — профиль линий приблизительный
            </p>
          </GlassCard>
        )}

        {/* Pseudo SVG BodyGraph */}
        <div className="w-full py-6 mb-8 relative px-4">
          <HDChart
            definedCenters={hdCard.defined_centers}
            activeChannels={
              hdCard.active_channels as [number, number][]
            }
          />
        </div>

        {/* HD Accordions */}
        <div className="space-y-4 mb-10">
          <Accordion
            title="Определённые центры"
            isOpen={openAccordion === "centers"}
            onToggle={() => toggleAccordion("centers")}
          >
            <div className="flex flex-col space-y-2">
              {hdCard.defined_centers.length === 0 ? (
                <p className="text-body text-secondary italic">
                  У вас нет определённых центров (Отражатель).
                </p>
              ) : (
                hdCard.defined_centers.map((c) => (
                  <div
                    key={c}
                    className="bg-white/5 py-2 px-3 justify-center rounded-lg text-body text-white"
                  >
                    {centerRussianMap[c] || c}
                  </div>
                ))
              )}
            </div>
          </Accordion>

          <Accordion
            title="Активные каналы"
            isOpen={openAccordion === "channels"}
            onToggle={() => toggleAccordion("channels")}
          >
            <div className="flex flex-wrap gap-2 text-white text-body">
              {hdCard.active_channels.length === 0 ? (
                <p className="text-secondary italic">
                  Нет активных каналов.
                </p>
              ) : (
                hdCard.active_channels.map((ch, i) => (
                  <span
                    key={i}
                    className="bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                  >
                    {ch[0]} - {ch[1]}
                  </span>
                ))
              )}
            </div>
          </Accordion>

          <Accordion
            title="Ворота и линии"
            isOpen={openAccordion === "gates"}
            onToggle={() => toggleAccordion("gates")}
          >
            <div className="flex flex-wrap gap-2 text-white text-body">
              {hdCard.active_gates.map((g) => (
                <span
                  key={g}
                  className="bg-[#4A9E7F]/10 text-[#4A9E7F] border border-[#4A9E7F]/20 px-3 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          </Accordion>
        </div>

        {/* ════════════════ SECTION 2: PSYCHOLOGY ════════════════ */}
        {psychProfile && (
          <>
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={16} className="text-[#B0BEC5]" />
                <span className="text-[11px] text-[#B0BEC5] font-bold tracking-wider uppercase">
                  ПСИХОЛОГИЧЕСКИЙ ПРОФИЛЬ
                </span>
              </div>
            </div>

            {/* Big Five Card */}
            <GlassCard className="p-5 mb-4">
              <h3 className="text-h3 text-white mb-1">Большая пятёрка</h3>
              <p className="text-caption text-secondary mb-4">
                Научная модель личности (OCEAN)
              </p>
              <BigFiveTrait
                label="Открытость опыту"
                value={psychProfile.openness}
                color="#7bc4a0"
                icon={<Sparkles size={16} style={{ color: "#7bc4a0" }} />}
              />
              <BigFiveTrait
                label="Сознательность"
                value={psychProfile.conscientiousness}
                color="#4A9E7F"
                icon={<Shield size={16} style={{ color: "#4A9E7F" }} />}
              />
              <BigFiveTrait
                label="Экстраверсия"
                value={psychProfile.extraversion}
                color="#c4956a"
                icon={<Zap size={16} style={{ color: "#c4956a" }} />}
              />
              <BigFiveTrait
                label="Дружелюбие"
                value={psychProfile.agreeableness}
                color="#e8c99a"
                icon={<Heart size={16} style={{ color: "#e8c99a" }} />}
              />
              <BigFiveTrait
                label="Эмоциональность"
                value={psychProfile.neuroticism}
                color="#B0BEC5"
                icon={<Brain size={16} style={{ color: "#B0BEC5" }} />}
              />
            </GlassCard>

            {/* Attachment Style Card */}
            <GlassCard className="p-5 mb-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <Heart size={18} className="text-accent-warm" />
                <h3 className="text-body font-semibold text-white m-0">
                  Стиль привязанности
                </h3>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent-warm/15 text-accent-warm px-3 py-1 rounded-full text-sm font-semibold border border-accent-warm/25">
                  {attachmentLabels[psychProfile.attachment_style] ||
                    psychProfile.attachment_style}
                </span>
              </div>
              <p className="text-body text-secondary leading-relaxed">
                {attachmentDescriptions[psychProfile.attachment_style] || ""}
              </p>
            </GlassCard>

            {/* Conflict Style + Energy */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <GlassCard className="p-4">
                <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase block mb-2">
                  Стиль конфликта
                </span>
                <span className="text-sm font-semibold text-white block mb-1">
                  {conflictLabels[psychProfile.conflict_style] ||
                    psychProfile.conflict_style}
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed m-0">
                  {conflictDescriptions[psychProfile.conflict_style]?.slice(
                    0,
                    80
                  ) || ""}
                  …
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <span className="text-[10px] text-white/40 font-bold tracking-wider uppercase block mb-2">
                  Тип энергии
                </span>
                <span className="text-sm font-semibold text-white block mb-1">
                  {energyLabels[psychProfile.energy_type] ||
                    psychProfile.energy_type}
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed m-0">
                  Определяет ритм жизни и предпочтительный темп сближения
                </p>
              </GlassCard>
            </div>

            {/* Top Values */}
            <GlassCard className="p-5 mb-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <Zap size={18} className="text-[#7bc4a0]" />
                <h3 className="text-body font-semibold text-white m-0">
                  Ключевые ценности
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {psychProfile.top_values.map((v) => (
                  <span
                    key={v}
                    className="bg-[#4A9E7F]/10 text-[#7bc4a0] px-3 py-1.5 rounded-full text-xs font-medium border border-[#4A9E7F]/20"
                  >
                    {valueLabels[v.toLowerCase()] || v}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Shadow Patterns (delicate) */}
            {psychProfile.shadow_patterns.length > 0 && (
              <Accordion
                title="Зоны роста"
                isOpen={openAccordion === "shadows"}
                onToggle={() => toggleAccordion("shadows")}
              >
                <p className="text-caption text-secondary mb-3">
                  Это не недостатки, а зоны, где ты можешь расти и углублять
                  осознанность.
                </p>
                <div className="flex flex-wrap gap-2">
                  {psychProfile.shadow_patterns.map((s) => (
                    <span
                      key={s}
                      className="bg-accent-warning/10 text-accent-warning px-3 py-1 rounded-full text-xs font-medium border border-accent-warning/20"
                    >
                      {shadowLabels[s.toLowerCase()] || s}
                    </span>
                  ))}
                </div>
              </Accordion>
            )}

            {/* Profile Notes from AI */}
            {psychProfile.profile_notes && (
              <GlassCard className="p-5 mb-4 mt-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <Sparkles size={18} className="text-accent-warm" />
                  <h3 className="text-body font-semibold text-white m-0">
                    Резюме от AI-проводника
                  </h3>
                </div>
                <p className="text-body text-secondary leading-relaxed italic">
                  «{psychProfile.profile_notes}»
                </p>
              </GlassCard>
            )}

            {/* Confidence indicator */}
            <div className="flex items-center justify-center gap-2 mb-6 mt-4">
              <div className="h-[3px] w-16 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[#4A9E7F]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${psychProfile.confidence_score * 100}%`,
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
              <span className="text-[10px] text-white/30 font-medium">
                Точность профиля:{" "}
                {Math.round(psychProfile.confidence_score * 100)}%
              </span>
            </div>
          </>
        )}

        {/* When no psych profile yet — placeholder */}
        {!psychProfile && (
          <GlassCard className="p-5 mb-6 text-center">
            <Brain size={32} className="text-white/20 mx-auto mb-3" />
            <h3 className="text-h3 text-white mb-2">
              Психологический профиль
            </h3>
            <p className="text-body text-secondary mb-4">
              После прохождения интервью с AI-проводником здесь появится твой
              детальный психологический портрет: Большая пятёрка, стиль
              привязанности, ценности и зоны роста.
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate("/interview")}
              className="w-full"
            >
              Пройти интервью →
            </Button>
          </GlassCard>
        )}
      </div>

      {/* FOOTER BUTTON */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 z-10"
        style={{
          background: "linear-gradient(to top, #0d1f1a 80%, transparent)",
        }}
      >
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate("/matches")}
        >
          Посмотреть совпадения →
        </Button>
      </div>
    </motion.div>
  );
};

// ──── Subcomponent: Accordion ────
const Accordion = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex justify-between items-center outline-none"
      >
        <span className="text-body font-medium text-white">{title}</span>
        {isOpen ? (
          <ChevronUp size={20} className="text-secondary" />
        ) : (
          <ChevronDown size={20} className="text-secondary" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
