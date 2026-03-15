import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { SectionTag } from "../components/ui/SectionTag";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useBirthDataStore } from "../store/birthDataStore";
import { HDChart } from "../components/ui/HDChart";

export const HDCard: React.FC = () => {
  const navigate = useNavigate();
  const hdCard = useBirthDataStore((s) => s.hdCard);

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
        <SectionTag className="mb-4">ТВОЯ КАРТА</SectionTag>
        <h1 className="text-h1 text-white mb-6 tracking-tight">Human Design</h1>

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
            <AlertTriangle className="text-[#e5b079] flex-shrink-0" size={20} />
            <p className="text-caption text-secondary m-0">
              ⚠ Время рождения неизвестно — профиль линий приблизительный
            </p>
          </GlassCard>
        )}

        {/* Pseudo SVG BodyGraph placeholder */}
        <div className="w-full py-6 mb-8 relative px-4">
          <HDChart definedCenters={hdCard.defined_centers} activeChannels={hdCard.active_channels as [number, number][]} />
        </div>

        {/* Accordions */}
        <div className="space-y-4">
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
                <p className="text-secondary italic">Нет активных каналов.</p>
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

// Subcomponent: Accordion
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
