import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, AlertCircle, Loader2 } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { pageTransition } from "../utils/animations";
import { useBirthDataStore } from "../store/birthDataStore";
import { apiClient } from "../utils/apiClient";

export const BirthDataForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.fromProfile || false;
  const {
    birthTimeAccuracy,
    birthCity,
    birthLat,
    birthLon,
    birthTimezone,
    setBirthData,
    setHdCard,
  } = useBirthDataStore();

  const [dateParts, setDateParts] = useState(["", "", ""]); // DD, MM, YYYY
  const [timeParts, setTimeParts] = useState(["", ""]); // HH, MM
  const [query, setQuery] = useState(birthCity);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);

  // Validate Date Function
  const isValidDate = (d: string, m: string, y: string) => {
    const day = parseInt(d);
    const month = parseInt(m);
    const year = parseInt(y);
    const currYear = new Date().getFullYear();

    if (!day || !month || !year || y.length < 4) return false;
    if (year < 1940 || year > currYear - 18) return false;

    // Check real date existance
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const isDateValid = isValidDate(dateParts[0], dateParts[1], dateParts[2]);

  // Debounced City Suggestion
  useEffect(() => {
    const fetchGeo = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await apiClient.get("/geo/suggest", {
          params: { q: query },
        });
        setSuggestions(res.data);
      } catch (e) {
        console.warn("Geo search backend error, using mock data for demo", e);
        // Fallback for frontend design testing when local server is down
        if (query.toLowerCase().includes("моск")) {
          setSuggestions([
            {
              name: "Москва, Россия",
              lat: 55.751244,
              lon: 37.618423,
              timezone: "Europe/Moscow",
            },
          ]);
        } else if (query.toLowerCase().includes("тюмен")) {
          setSuggestions([
            {
              name: "Тюмень, Россия",
              lat: 57.15222,
              lon: 65.52722,
              timezone: "Asia/Yekaterinburg",
            },
          ]);
        } else if (
          query.toLowerCase().includes("спб") ||
          query.toLowerCase().includes("петербург") ||
          query.toLowerCase().includes("питер")
        ) {
          setSuggestions([
            {
              name: "Санкт-Петербург, Россия",
              lat: 59.9386,
              lon: 30.3141,
              timezone: "Europe/Moscow",
            },
          ]);
        } else {
          setSuggestions([
            {
              name: query + " (Пользовательский ввод)",
              lat: 0,
              lon: 0,
              timezone: "UTC",
            },
          ]);
        }
      }
    };
    const timeoutId = setTimeout(fetchGeo, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleCitySelect = (city: any) => {
    setQuery(city.name);
    setBirthData({
      birthCity: city.name,
      birthLat: city.lat,
      birthLon: city.lon,
      birthTimezone: city.timezone,
    });
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`;
    const formattedTime =
      birthTimeAccuracy === "unknown"
        ? null
        : `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`;

    setBirthData({ birthDate: formattedDate, birthTime: formattedTime || "" });
    setIsLoading(true);
    setErrorMsg("");

    try {
      // API call to real backend or mock for pure frontend presentation
      const payload = {
        birth_date: formattedDate,
        birth_time: formattedTime,
        birth_time_accuracy: birthTimeAccuracy,
        birth_city: birthCity,
        birth_lat: birthLat,
        birth_lon: birthLon,
        birth_timezone: birthTimezone,
      };

      let hdRes;
      try {
        const response = await apiClient.post("/hd/calculate", payload);
        hdRes = response.data;
      } catch (err) {
        // Fallback mocked response if backend is offline
        console.warn("Backend unavailable, using mock HD data");
        await new Promise((r) => setTimeout(r, 800));
        hdRes = {
          type: "Манифестирующий Генератор",
          profile: "4/6",
          authority: "Эмоциональный",
          defined_centers: ["Sacral", "Throat", "SolarPlexus"],
          active_channels: [
            [34, 20],
            [59, 6],
          ],
          active_gates: [34, 20, 59, 6, 43],
          birth_time_accuracy: birthTimeAccuracy,
        };
      }

      setHdCard(hdRes);
      setIsCalculated(true);

      setTimeout(() => {
        if (fromProfile) {
          navigate(-1);
        } else {
          navigate("/hd-card");
        }
      }, 1000);
    } catch (e) {
      setErrorMsg("Ошибка расчёта. Пожалуйста, попробуй позже.");
    } finally {
      setIsLoading(false);
    }
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

      {/* Celebration Overlay */}
      <AnimatePresence>
        {isCalculated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-[#E5B079]"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 pt-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center relative shadow-lg mb-3"
            style={{ background: "var(--gradient-warm)" }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <h3 className="m-0 text-body text-white font-medium">
            {fromProfile ? "Изменение данных" : "AI-агент"}
          </h3>
          <span className="text-caption text-secondary">
            {fromProfile ? "Уточните время и место" : "Последний шаг"}
          </span>
        </div>

        {/* Explanation Card */}
        <GlassCard className="p-5 mb-6 flex flex-col items-start">
          <Star className="text-accent-warm mb-3" size={24} />
          <h3 className="text-h3 text-white mb-2">
            Зачем нужны данные рождения?
          </h3>
          <p className="text-body text-secondary leading-relaxed">
            Human Design — система самопознания на основе точного времени и
            места рождения. Она помогает нам подобрать тебе действительно
            совместимых людей.
          </p>
        </GlassCard>

        {/* Form elements */}
        <div className="space-y-6">
          {/* DATE */}
          <div>
            <label className="text-caption font-semibold text-secondary tracking-wider block mb-2">
              ДАТА РОЖДЕНИЯ
            </label>
            <div className="flex space-x-4">
              <input
                type="number"
                placeholder="ДД"
                value={dateParts[0]}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 2);
                  setDateParts((p) => [val, p[1], p[2]]);
                  if (val.length === 2)
                    document.getElementById("monthInput")?.focus();
                }}
                className="w-16 bg-white/10 border-white/10 border text-center text-white py-3 rounded-xl outline-none focus:border-white/30"
              />

              <input
                type="number"
                id="monthInput"
                placeholder="ММ"
                value={dateParts[1]}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 2);
                  setDateParts((p) => [p[0], val, p[2]]);
                  if (val.length === 2)
                    document.getElementById("yearInput")?.focus();
                }}
                className="w-16 bg-white/10 border-white/10 border text-center text-white py-3 rounded-xl outline-none focus:border-white/30"
              />

              <input
                type="number"
                id="yearInput"
                placeholder="ГГГГ"
                value={dateParts[2]}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 4);
                  setDateParts((p) => [p[0], p[1], val]);
                  if (val.length === 4)
                    document.getElementById("hourInput")?.focus();
                }}
                className="flex-1 bg-white/10 border-white/10 border text-center text-white py-3 rounded-xl outline-none focus:border-white/30"
              />
            </div>
            {dateParts[0] &&
              dateParts[1] &&
              dateParts[2].length === 4 &&
              !isDateValid && (
                <span className="text-accent-warning text-xs mt-2 block">
                  Введите корректную дату старше 18 лет.
                </span>
              )}
          </div>

          {/* TIME */}
          <div>
            <label className="text-caption font-semibold text-secondary tracking-wider block mb-2">
              ВРЕМЯ РОЖДЕНИЯ
            </label>
            <div className="flex bg-white/5 p-1 rounded-xl mb-4 text-sm font-medium">
              {["exact", "approx", "unknown"].map((acc) => (
                <button
                  key={acc}
                  onClick={() =>
                    setBirthData({ birthTimeAccuracy: acc as any })
                  }
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${birthTimeAccuracy === acc ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}
                >
                  {acc === "exact"
                    ? "Знаю точно"
                    : acc === "approx"
                      ? "Примерно ±1ч"
                      : "Не знаю"}
                </button>
              ))}
            </div>

            <div
              className={`flex space-x-4 ${birthTimeAccuracy === "unknown" ? "opacity-40 pointer-events-none" : ""}`}
            >
              <input
                type="number"
                id="hourInput"
                placeholder="ЧЧ"
                value={timeParts[0]}
                onChange={(e) => {
                  let val = e.target.value.slice(0, 2);
                  if (parseInt(val) > 23) val = "23";
                  setTimeParts((p) => [val, p[1]]);
                  if (val.length === 2)
                    document.getElementById("minInput")?.focus();
                }}
                className="w-16 bg-white/10 border-white/10 border text-center text-white py-3 rounded-xl outline-none focus:border-white/30"
              />
              <span className="text-white text-xl self-center">:</span>
              <input
                type="number"
                id="minInput"
                placeholder="ММ"
                value={timeParts[1]}
                onChange={(e) => {
                  let val = e.target.value.slice(0, 2);
                  if (parseInt(val) > 59) val = "59";
                  setTimeParts((p) => [p[0], val]);
                }}
                className="w-16 bg-white/10 border-white/10 border text-center text-white py-3 rounded-xl outline-none focus:border-white/30"
              />
            </div>

            {birthTimeAccuracy === "unknown" && (
              <GlassCard className="mt-4 p-4 border border-[#e5b079]/30 bg-[#e5b079]/5 flex items-start space-x-3">
                <AlertCircle
                  className="text-[#e5b079] flex-shrink-0"
                  size={20}
                />
                <p className="text-caption text-secondary m-0">
                  Без точного времени тип HD сохранится, но профиль линий может
                  быть неточным. Уточни в свидетельстве о рождении.
                </p>
              </GlassCard>
            )}
          </div>

          {/* CITY */}
          <div className="relative">
            <label className="text-caption font-semibold text-secondary tracking-wider block mb-2">
              ГОРОД РОЖДЕНИЯ
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setBirthData({ birthLat: null, birthLon: null }); // Invalidate location
              }}
              placeholder="Начни вводить город..."
              className={`w-full bg-white/10 border text-white px-4 py-3 rounded-xl outline-none transition-colors ${birthLat ? "border-primary" : "border-white/10 focus:border-white/30"}`}
            />

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute w-full mt-2 bg-[#142920] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl"
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => handleCitySelect(s)}
                      className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer text-white text-body"
                    >
                      {s.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-caption text-muted mt-2">
              Нет в списке? Выбери ближайший крупный город в том же часовом
              поясе.
            </p>
          </div>

          {errorMsg && (
            <GlassCard className="p-3 border-accent-warning">
              <p className="text-caption text-accent-warning text-center m-0">
                {errorMsg}
              </p>
            </GlassCard>
          )}
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
          disabled={
            !isDateValid ||
            !birthLat ||
            (birthTimeAccuracy !== "unknown" && timeParts[1].length < 2) ||
            isLoading
          }
          onClick={handleSubmit}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2 mb-0.5" size={18} /> Считаю
              карту...
            </span>
          ) : fromProfile ? (
            "Сохранить изменения"
          ) : (
            "Рассчитать мою карту →"
          )}
        </Button>
      </div>
    </motion.div>
  );
};
