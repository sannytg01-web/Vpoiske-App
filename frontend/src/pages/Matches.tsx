import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, User } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { SectionTag } from "../components/ui/SectionTag";
import { GlassCard } from "../components/ui/GlassCard";
import { useMatchStore } from "../store/matchStore";

const FilterChip = ({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${active ? "bg-white text-[#0d1f1a]" : "bg-white/10 text-white/70 border border-white/5 hover:bg-white/20"}`}
  >
    {label}
  </div>
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
        <div className="flex justify-between items-start mb-6 mt-2">
          <div>
            <SectionTag className="mb-2">ДЛЯ ТЕБЯ</SectionTag>
            <h2 className="text-h2 text-white m-0 tracking-tight">
              Совпадения
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={() => navigate("/profile")}
              className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors mb-2 shadow-lg"
            >
              <User size={18} />
            </button>
            <div className="bg-accent-warm text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(229,176,121,0.5)] tracking-wide uppercase">
              +2 новых
            </div>
          </div>
        </div>

        {/* PILL TABS */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === "all" ? "bg-white/10 text-white shadow-sm" : "text-white/40"}`}
          >
            Все
          </button>
          <button
            onClick={() => setTab("mutual")}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === "mutual" ? "bg-white/10 text-white shadow-sm" : "text-white/40"}`}
          >
            Взаимные
          </button>
          <button
            onClick={() => setTab("new")}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === "new" ? "bg-white/10 text-white shadow-sm" : "text-white/40"}`}
          >
            Новые
          </button>
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
          <div className="grid grid-cols-2 gap-3 pb-[80px] mt-6">
            <AnimatePresence>
              {displayMatches.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => navigate(`/matches/${m.id}`)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
                >
                  {/* PHOTO OR PLACEHOLDER */}
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a382f] to-[#0f241d]">
                      <span
                        className="text-4xl font-light text-white/30 tracking-tighter"
                        style={{ fontFamily: "Instrument Serif" }}
                      >
                        {m.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* OVERLAY GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* INFO */}
                  <div className="absolute bottom-0 left-0 w-full p-3">
                    <div className="flex items-end justify-between mb-1">
                      <h3 className="text-white font-medium text-lg leading-none m-0">
                        {m.name}, {m.age}
                      </h3>
                    </div>
                    {/* BADGE */}
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md border border-white/10">
                      <span className="text-xs font-medium text-white">
                        {m.score}%
                      </span>
                      <Heart
                        size={10}
                        className="text-accent-warm fill-accent-warm"
                      />
                    </div>
                  </div>

                  {/* LOCK LAYER */}
                  {m.locked && (
                    <div className="absolute inset-0 backdrop-blur-[8px] bg-[#0d1f1a]/60 flex flex-col items-center justify-center transition-all z-10">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/10">
                        <Lock size={18} className="text-white" />
                      </div>
                      <span className="text-caption font-semibold tracking-wider text-white">
                        PREMIUM
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
