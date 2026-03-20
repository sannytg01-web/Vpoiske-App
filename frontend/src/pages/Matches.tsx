import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, ChevronLeft } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { SectionTag } from "../components/ui/SectionTag";
import { GlassCard } from "../components/ui/GlassCard";
import { useMatchStore } from "../store/matchStore";
import { MatchCard } from "../components/matches/MatchCard";

const FilterChip = ({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all flex items-center shadow-sm ${
      active 
        ? "bg-gradient-to-r from-accent-primary to-[#2a6d54] text-white border border-[#4A9E7F]/30 shadow-[0_4px_16px_rgba(74,158,127,0.3)]"
        : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
    }`}
  >
    {label}
  </button>
);

export const Matches: React.FC = () => {
  const navigate = useNavigate();
  const { matches, activeTab, setTab, fetchMatches, loading } = useMatchStore();
  const [activeFilters, setActiveFilters] = React.useState<string[]>([
    "HD-тип",
  ]);

  useEffect(() => {
    // Automatically fetch matches on mount
    fetchMatches(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label],
    );
  };

  // Initial dummy data for visual testing if api doesn't respond instantly
  const displayMatches = matches.length > 0 ? matches : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-content bg-transparent"
    >
      <AppBackground />

      <div className="flex-1 overflow-y-auto px-4 py-8 pb-24">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6 pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <SectionTag className="m-0">ДЛЯ ТЕБЯ</SectionTag>
            </div>
            <h2 className="text-h2 text-white m-0 tracking-tight flex items-center">
              Совпадения
              <span className="ml-3 bg-accent-warm text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(229,176,121,0.5)]">
                +2 новых
              </span>
            </h2>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors shadow-lg"
          >
            <User size={18} />
          </button>
        </div>

        {/* PILL TABS */}
        <div className="flex bg-white/5 p-1 rounded-[20px] mb-6 backdrop-blur-md border border-white/10 relative shadow-inner">
          {["all", "mutual", "new"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab as any)}
              className={`flex-1 py-2.5 text-[15px] font-medium rounded-2xl transition-all relative z-10 ${
                activeTab === tab ? "text-white shadow-lg" : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "all" ? "Все" : tab === "mutual" ? "Взаимные" : "Новые"}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-white/15 rounded-2xl border border-white/20 -z-10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <div
          className="flex overflow-x-auto space-x-2 pb-2 mb-4 scrollbar-hide"
          style={{ margin: "0 -16px", padding: "0 16px" }}
        >
          {["HD-тип", "Возраст", "Город", "Цель"].map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilters.includes(filter)}
              onClick={() => toggleFilter(filter)}
            />
          ))}
        </div>

        {/* GRID */}
        {loading && matches.length === 0 ? (
          <div className="flex items-center justify-center p-10">
            <Heart className="animate-pulse text-white/30" size={32} />
          </div>
        ) : displayMatches.length === 0 ? (
          <GlassCard className="mt-8 py-10 flex flex-col items-center justify-center text-center">
            <Heart size={40} className="text-white/20 mb-4" />
            <h3 className="text-h3 text-white mb-2">Ищем твои совпадения</h3>
            <p className="text-body text-secondary max-w-[200px]">
              Пришлём уведомление когда найдём
            </p>
          </GlassCard>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-col gap-4 pb-[80px] mt-6"
          >
            <AnimatePresence>
              {displayMatches.map((m, idx) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  delayIndex={idx}
                  onClick={() => navigate(`/matches/${m.id}`)}
                  onUnlockClick={() => navigate("/paywall")}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
