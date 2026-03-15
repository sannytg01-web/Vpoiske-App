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
  <button
    onClick={onClick}
    className={`filter-chip ${active ? "active" : ""}`}
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
          <div>
            <SectionTag className="mb-2">ДЛЯ ТЕБЯ</SectionTag>
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
        <div className="pill-tab-container mb-6">
          <button
            onClick={() => setTab("all")}
            className={`pill-tab ${activeTab === "all" ? "active" : ""}`}
          >
            Все
          </button>
          <button
            onClick={() => setTab("mutual")}
            className={`pill-tab ${activeTab === "mutual" ? "active" : ""}`}
          >
            Взаимные
          </button>
          <button
            onClick={() => setTab("new")}
            className={`pill-tab ${activeTab === "new" ? "active" : ""}`}
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-2 gap-3 pb-[80px] mt-6"
          >
            <AnimatePresence>
              {displayMatches.map((m) => (
                <motion.div
                  key={m.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  onClick={() => navigate(`/matches/${m.id}`)}
                  className="match-card relative"
                >
                  {/* PHOTO OR PLACEHOLDER */}
                  {m.photo ? (
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="match-card-photo"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a382f] to-[#0f241d]">
                      <span
                        className="text-5xl font-light text-white/30 tracking-tighter uppercase"
                        style={{ fontFamily: "Manrope" }}
                      >
                        {m.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* INFO */}
                  <div className="match-card-info">
                    <div className="flex flex-col mb-1">
                      <h3 className="text-white text-body font-medium leading-none m-0 mb-2">
                        {m.name}, {m.age}
                      </h3>
                      <div>
                        {/* BADGE */}
                        <div className="compatibility-badge">
                          {m.score}% <Heart size={12} fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCK LAYER */}
                  {m.locked && (
                    <div className="lock-overlay z-10">
                      <div className="flex flex-col items-center justify-center">
                        <Lock size={24} className="text-white/70 mb-2" />
                        <span className="text-[10px] font-bold tracking-widest text-white/50">
                          PREMIUM
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
