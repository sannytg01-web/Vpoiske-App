import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface HDChartProps {
  definedCenters: string[];
  activeChannels: [number, number][]; // Not strictly used for exact drawing in this simplified aesthetic version
}

const CENTER_DESCRIPTIONS: Record<string, { title: string, defined: string, undefined: string }> = {
  Head: { title: "Вдохновение (Теменной)", defined: "У вас свой постоянный источник вопросов и вдохновения.", undefined: "Вы открыты к идеям извне и впитываете вдохновение мира." },
  Ajna: { title: "Мышление (Аджна)", defined: "У вас фиксированный способ обработки информации и убеждения.", undefined: "Вы гибко мыслите и легко воспринимаете разные точки зрения." },
  Throat: { title: "Выражение (Горловой)", defined: "Ваш голос уверенный, вы способны стабильно выражать свои мысли.", undefined: "Ваш голос подстраивается под среду, вы отлично озвучиваете чужие идеи." },
  G: { title: "Идентичность (Джи)", defined: "Вы чётко чувствуете свой путь, вектор движения и любовь к себе.", undefined: "Ваш компас гибок, вы познаёте себя и свое направление через мир." },
  Heart: { title: "Сила воли (Эго)", defined: "У вас мощная воля. Сказано — сделано. Важно сдерживать обещания.", undefined: "Вам совершенно не нужно никому (включая себя) ничего доказывать." },
  Sacral: { title: "Энергия (Сакральный)", defined: "У вас встроен неиссякаемый генератор жизненной и рабочей энергии.", undefined: "Ваша энергия работает циклами, вам критически важно вовремя отдыхать." },
  SolarPlexus: { title: "Эмоции (Сплетение)", defined: "Вы излучаете эмоции, переживая их глубокими внутренними волнами.", undefined: "Вы очень эмпатичны и сильно считываете/усиливаете чувства других людей." },
  Spleen: { title: "Интуиция (Селезенка)", defined: "У вас острая интуиция в моменте 'здесь и сейчас' и сильный инстинкт.", undefined: "Вы чувствительны к здоровью, пропускаете через себя страхи окружения." },
  Root: { title: "Драйв (Корневой)", defined: "Вы справляетесь со стрессом, преобразуя давление в мощный драйв к действию.", undefined: "Давление извне может заставлять вас спешить. Важно заземляться." }
};

export const HDChart: React.FC<HDChartProps> = ({ definedCenters }) => {
  const [activeCenter, setActiveCenter] = useState<string | null>(null);

  const isDefined = (key: string) => definedCenters.includes(key);

  const centerClass = (key: string) =>
    isDefined(key)
      ? "fill-[#4A9E7F] opacity-90 transition-all duration-300 stroke-[#7bc4a0] stroke-[2px] cursor-pointer hover:opacity-100 drop-shadow-md"
      : "fill-[#142920] stroke-white/20 stroke-[1.5px] transition-all duration-300 cursor-pointer hover:stroke-white/50";

  const handleCenterClick = (key: string) => {
    setActiveCenter(activeCenter === key ? null : key);
  };

  // True logical centers for perfectly straight beautiful lines
  const centers = {
    Head: { x: 150, y: 35 },
    Ajna: { x: 150, y: 95 },
    Throat: { x: 150, y: 155 },
    Heart: { x: 210, y: 175 },
    G: { x: 150, y: 220 },
    Sacral: { x: 150, y: 290 },
    Spleen: { x: 80, y: 290 },
    SolarPlexus: { x: 220, y: 290 },
    Root: { x: 150, y: 360 },
  };

  const genericConnections = [
    { id: "Head-Ajna", c1: "Head", c2: "Ajna" },
    { id: "Ajna-Throat", c1: "Ajna", c2: "Throat" },
    { id: "Throat-G", c1: "Throat", c2: "G" },
    { id: "Throat-Heart", c1: "Throat", c2: "Heart" },
    { id: "Heart-G", c1: "Heart", c2: "G" },
    { id: "G-Sacral", c1: "G", c2: "Sacral" },
    { id: "Sacral-Root", c1: "Sacral", c2: "Root" },
    { id: "Sacral-Spleen", c1: "Sacral", c2: "Spleen" },
    { id: "Sacral-SPlexus", c1: "Sacral", c2: "SolarPlexus" },
    { id: "Heart-SPlexus", c1: "Heart", c2: "SolarPlexus" },
    { id: "G-Spleen", c1: "G", c2: "Spleen" },
    { id: "Root-Spleen", c1: "Root", c2: "Spleen" },
    { id: "Root-SPlexus", c1: "Root", c2: "SolarPlexus" },
    { id: "Spleen-Throat", c1: "Spleen", c2: "Throat" },
  ];

  const getLineClass = (c1: string, c2: string) => {
    if (isDefined(c1) && isDefined(c2)) {
      return "stroke-[#c4956a] stroke-[4px] opacity-80";
    } else if (isDefined(c1) || isDefined(c2)) {
      return "stroke-[#c4956a] stroke-[2px] opacity-40 stroke-dasharray-[4,4]";
    }
    return "stroke-white/10 stroke-[2px]";
  };

  return (
    <div className="w-full aspect-square bg-[#142920]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 relative overflow-hidden flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* Background glow behind chart */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[200px] h-[200px] rounded-full bg-[#4A9E7F]/30 blur-[60px]"
        />
      </div>

      <svg
        viewBox="0 0 300 400"
        className="w-full h-full drop-shadow-[0_0_10px_rgba(74,158,127,0.3)] z-10 overflow-visible"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines */}
        {genericConnections.map((conn) => {
          const p1 = centers[conn.c1 as keyof typeof centers];
          const p2 = centers[conn.c2 as keyof typeof centers];
          return (
            <line
              key={conn.id}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className={getLineClass(conn.c1, conn.c2)}
              style={
                isDefined(conn.c1) && isDefined(conn.c2)
                  ? { filter: "url(#glow)" }
                  : undefined
              }
            />
          );
        })}

        {/* Centers */}
        {/* Head: Triangle Up */}
        <g onClick={() => handleCenterClick("Head")}>
          <polygon className={centerClass("Head")} points="150,15 174,45 126,45" />
          <text x="150" y="38" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Теменной</text>
        </g>

        {/* Ajna: Triangle Down */}
        <g onClick={() => handleCenterClick("Ajna")}>
          <polygon className={centerClass("Ajna")} points="126,85 174,85 150,115" />
          <text x="150" y="95" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Аджна</text>
        </g>

        {/* Throat: Square */}
        <g onClick={() => handleCenterClick("Throat")}>
          <rect className={centerClass("Throat")} x="135" y="140" width="30" height="30" rx="6" />
          <text x="150" y="157" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Горловой</text>
        </g>

        {/* G-Center: Diamond */}
        <g onClick={() => handleCenterClick("G")}>
          <polygon className={centerClass("G")} points="150,195 175,220 150,245 125,220" />
          <text x="150" y="222" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Джи</text>
        </g>

        {/* Heart: Triangle Down */}
        <g onClick={() => handleCenterClick("Heart")}>
          <polygon className={centerClass("Heart")} points="190,165 230,165 210,195" />
          <text x="210" y="180" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Эго</text>
        </g>

        {/* Sacral: Square */}
        <g onClick={() => handleCenterClick("Sacral")}>
          <rect className={centerClass("Sacral")} x="135" y="275" width="30" height="30" rx="6" />
          <text x="150" y="292" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Сакрал</text>
        </g>

        {/* Solar Plexus: Triangle Left */}
        <g onClick={() => handleCenterClick("SolarPlexus")}>
          <polygon className={centerClass("SolarPlexus")} points="235,265 235,315 190,290" />
          <text x="215" y="292" fontSize="6.5" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Эмоции</text>
        </g>

        {/* Spleen: Triangle Right */}
        <g onClick={() => handleCenterClick("Spleen")}>
          <polygon className={centerClass("Spleen")} points="65,265 65,315 110,290" />
          <text x="85" y="292" fontSize="7" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Селезенка</text>
        </g>

        {/* Root: Square */}
        <g onClick={() => handleCenterClick("Root")}>
          <rect className={centerClass("Root")} x="135" y="345" width="30" height="30" rx="6" />
          <text x="150" y="362" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.8)" textAnchor="middle" className="pointer-events-none">Корень</text>
        </g>
      </svg>
      
      {/* Popover Description */}
      <AnimatePresence>
        {activeCenter && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 bg-[#0d1f1a]/90 backdrop-blur-xl border border-[#4A9E7F]/30 p-4 rounded-2xl z-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer"
            onClick={() => setActiveCenter(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-bold text-white m-0 uppercase tracking-widest">
                {CENTER_DESCRIPTIONS[activeCenter].title}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase ${isDefined(activeCenter) ? "bg-[#4A9E7F]/20 text-[#7bc4a0] border border-[#4A9E7F]/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                 {isDefined(activeCenter) ? "Определён" : "Открыт"}
              </span>
            </div>
            <p className="text-sm text-white/80 leading-snug m-0">
               {isDefined(activeCenter) ? CENTER_DESCRIPTIONS[activeCenter].defined : CENTER_DESCRIPTIONS[activeCenter].undefined}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
