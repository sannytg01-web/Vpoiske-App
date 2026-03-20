import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Check } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { useInterviewStore } from "../store/interviewStore";
import { usePsychProfileStore } from "../store/psychProfileStore";
import { apiClient } from "../utils/apiClient";
import { tgHaptic } from "../utils/telegram";
import { maxHaptic } from "../utils/maxBridge";
import { detectPlatform } from "../utils/platform";
import { AgentHeader } from "../components/chat/AgentHeader";
import { ChatBubble } from "../components/chat/ChatBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { useAuthStore } from "../store/authStore";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

const MOTIVATIONAL_PHRASES = [
  "Рассказывай, я внимательно слушаю...",
  "Отличное начало! Чем больше честности, тем точнее мэтч.",
  "Твои ответы помогают алгоритму настроиться на твою волну.",
  "Именно такие детали делают твой профиль уникальным.",
  "Глубоко. Мы уже начинаем вырисовывать твой энергетический портрет.",
  "Продолжай в том же духе. Алгоритм изучает твою механику.",
  "Каждый ответ — это шаг к твоему идеальному совпадению.",
  "Очень интересно! Мы на экваторе нашего интервью.",
  "Твои ценности выстраиваются в красивый узор.",
  "Мы погружаемся глубже. Твоя искренность бесценна.",
  "Почти готово! Я уже вижу твои активные центры.",
  "Осталось совсем чуть-чуть. Твоя откровенность вдохновляет.",
  "Финальные штрихи к твоему энергетическому паспорту.",
  "Твой профиль получается невероятно объемным!",
  "Спасибо за доверие. Мы уже на финишной прямой."
];

const HD_CENTERS = [
  { top: "15%", left: "50%", color: "#ffffff" },
  { top: "28%", left: "50%", color: "#00FF88" },
  { top: "42%", left: "50%", color: "#4A9E7F" },
  { top: "58%", left: "50%", color: "#E57373" },
  { top: "72%", left: "50%", color: "#D4AF37" },
  { top: "85%", left: "50%", color: "#F0E68C" },
  { top: "78%", left: "30%", color: "#A0522D" },
  { top: "78%", left: "70%", color: "#E57373" },
  { top: "95%", left: "50%", color: "#8B4513" },
];

export const Interview: React.FC = () => {
  const navigate = useNavigate();
  const {
    sessionId,
    messages,
    currentQuestionIndex,
    isComplete,
    isTyping,
    startSession,
    sendMessage,
    addMessage,
    setTyping,
    setQuestionIndex,
    completeInterview,
  } = useInterviewStore();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile: psychProfile, setProfile: setPsychProfile } = usePsychProfileStore();
  const setBio = useAuthStore((s) => s.setBio);
  
  const [showBioSelection, setShowBioSelection] = useState(false);
  const [selectedBioIndex, setSelectedBioIndex] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ru-RU";
      
      recognition.onresult = (event: any) => {
        let finalTrans = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setInputValue((prev) => (prev ? prev + " " + finalTrans : finalTrans));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Голосовой ввод не поддерживается в этом браузере.");
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    // Start session on mount if empty
    if (!sessionId) {
      const initSession = async () => {
        setTyping(true);
        try {
          const res = await apiClient.post("/interview/start");
          startSession(res.data.session_id, res.data.message);
        } catch (e) {
          console.error(e);
          const name = localStorage.getItem('vpoiske_user_name') || '';
          startSession(Date.now().toString(), `Привет${name ? ', ' + name : ''}! Рад знакомству. Расскажи о себе: чем ты увлекаешься и что тебя драйвит?`);
        } finally {
          setTyping(false);
        }
      };
      initSession();
    }
  }, [sessionId, startSession, setTyping]);

  useEffect(() => {
    if (isComplete && !showBioSelection) {
      if (psychProfile && psychProfile.bio_variants) {
        setShowBioSelection(true);
      } else {
        const timer = setTimeout(() => {
          navigate("/birth-data");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isComplete, navigate, showBioSelection, psychProfile]);

  const progressPercentage = Math.min((currentQuestionIndex / 18) * 100, 100);

  const handleBioConfirm = () => {
    if (selectedBioIndex && psychProfile?.bio_variants) {
      const bioText = (psychProfile.bio_variants as any)[selectedBioIndex];
      setBio(bioText);
      // In a real app we would call apiClient.put('/profile/bio') here
    }
    setShowBioSelection(false);
    navigate("/birth-data");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden relative page-content">
      <AppBackground />

      {/* HEADER */}
      <div className="flex-shrink-0 z-10 w-full relative">
        <AgentHeader onBack={() => navigate(-1)} />
        {/* PROGRESS LINE */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/20 overflow-hidden">
          <motion.div
            className="h-full absolute left-0 top-0"
            style={{ background: "var(--gradient-accent)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* QUESTION COUNTER & MOTIVATION */}
      <div className="flex-shrink-0 z-10 w-full flex flex-col items-center justify-center py-3 bg-black/40 backdrop-blur-md border-b border-white/5 relative shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold text-white/40 tracking-widest uppercase">Вопрос</span>
          <span className="bg-white/10 border border-white/20 rounded-full px-4 py-0.5 text-sm font-black text-white tabular-nums shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            {Math.max(1, Math.min(currentQuestionIndex, 18))}
          </span>
          <span className="text-xs font-extrabold text-white/40 tracking-widest uppercase">из 18</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.p
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] text-[#4A9E7F] italic text-center px-4"
          >
            «{MOTIVATIONAL_PHRASES[Math.min(currentQuestionIndex, MOTIVATIONAL_PHRASES.length) - 1] || MOTIVATIONAL_PHRASES[0]}»
          </motion.p>
        </AnimatePresence>
      </div>

      {/* BACKGROUND HUMAN FIGURE SILHOUETTE (BODIGRAPH PROGRESS) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen flex items-center justify-center opacity-30">
         <div className="relative w-[300px] h-[600px] top-10">
            {HD_CENTERS.map((center, idx) => {
              // Calculate if this center should be active based on progress
              const centerThreshold = (idx / HD_CENTERS.length) * 100;
              const isActive = progressPercentage >= centerThreshold;
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                  animate={{ 
                    x: "-50%", y: "-50%",
                    opacity: isActive ? 0.6 : 0.05, 
                    scale: isActive ? 1.5 : 0.8,
                    filter: isActive ? "blur(30px)" : "blur(10px)"
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute rounded-full"
                  style={{
                    top: center.top,
                    left: center.left,
                    width: "80px",
                    height: "80px",
                    background: `radial-gradient(circle, ${center.color} 0%, transparent 70%)`
                  }}
                />
              )
            })}
            
            {/* Connecting lines logic (simplified glowing spine) */}
            <motion.div 
              className="absolute left-1/2 top-[15%] w-[4px] bg-gradient-to-b from-white/40 to-transparent transform -translate-x-1/2"
              initial={{ height: 0 }}
              animate={{ height: `${progressPercentage * 0.8}%` }}
              transition={{ duration: 1.2 }}
            />
         </div>
      </div>

      {/* MESSAGES */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-6 pb-28 flex flex-col relative scrollbar-hide z-10"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="mb-4 text-center">
          <div className="inline-block bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-xl px-4 py-3 text-xs text-[#00FF88] shadow-lg">
            <span className="block font-bold mb-1">🔒 Полная анонимность</span>
            <span className="opacity-80">Отвечайте максимально честно и открыто.<br/>Это ключ к поиску вашей идеальной пары. Ваши ответы строго конфиденциальны.</span>
          </div>
        </div>
        
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              type={msg.role === "ai" ? "agent" : "user"}
              message={msg.text}
              time={new Date(parseInt(msg.id) || Date.now()).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            />
          ))}

          {isTyping && (
            <div className="mb-4">
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* INPUT */}
      <div
        className="absolute bottom-0 w-full z-10"
        style={{
          background: "linear-gradient(to top, rgba(13, 31, 26, 0.95) 70%, transparent)",
          paddingBottom: "calc(var(--safe-bottom, 16px))",
        }}
      >
        <div className="relative">
          <ChatInput 
            value={inputValue}
            onChange={setInputValue}
            onSend={(text) => {
              if (!text.trim() || isTyping) return;
              setInputValue(''); // Clear input after send
              
              sendMessage(text.trim());

              const platform = detectPlatform();
              if (platform === "telegram") tgHaptic("light");
              if (platform === "max") maxHaptic("light");

              setTyping(true);
              apiClient.post("/interview/answer", {
                session_id: sessionId,
                message: text.trim(),
              }).then((res) => {
                setQuestionIndex(res.data.question_index);
                addMessage({
                  id: Date.now().toString(),
                  role: "ai",
                  text: res.data.message,
                });

                if (res.data.is_complete) {
                  // Save psychological profile if returned by API
                  if (res.data.profile_json) {
                    setPsychProfile(res.data.profile_json);
                  }
                  completeInterview();
                }
              }).catch((e) => {
                console.error("API unavailable, using offline interview:", e);
                const approach = localStorage.getItem('vpoiske_approach') || 'scientific';
                let offlineQuestions = [];

                if (approach === 'scientific') {
                  offlineQuestions = [
                    "Интересно! Расскажи, как выглядит твой идеальный выходной день — если бы не было вообще никаких ограничений?",
                    "Как ты относишься к планированию? Строгий график или полная спонтанность?",
                    "Что тебя быстрее выматывает: долго быть среди людей или долго быть в одиночестве?",
                    "Опиши момент в жизни, когда ты чувствовал(а) себя максимально продуктивно и «в потоке».",
                    "Какие три качества ты больше всего ценишь в рабочем или жизненном партнёре?",
                    "Как ты обычно реагируешь на стресс или конфликты?",
                    "Вспомни ситуацию, где тебе было очень сложно принять решение. Из чего оно состояло?",
                    "Что для тебя значит «личное пространство»?",
                    "Какие эмоции тебе сложнее всего контролировать или выражать?",
                    "Были ли в твоей жизни моменты, когда ты полностью менял(а) свои убеждения?",
                    "Что для тебя важнее: проверенная стабильность или новые вызовы? Почему?",
                    "Как ты обычно проявляешь признательность близким людям?",
                    "Какие ценности для тебя не подлежат торгу?",
                    "Как ты видишь свое развитие через 5 лет?",
                    "Что тебе важнее услышать: «Ты молодец, я горжусь» или «Я принимаю твои ошибки»?",
                    "Спасибо за такие подробные логичные ответы! Я собрал достаточно данных для создания психологического профиля. Для расчёта карты личности сейчас перейдет к дате рождения. 🌟"
                  ];
                } else if (approach === 'esoteric') {
                  offlineQuestions = [
                    "Интересно! Расскажи, как ты чувствуешь энергию пространства и людей вокруг?",
                    "Насколько часто ты полагаешься на интуицию при принятии важных решений?",
                    "Что тебя быстрее лишает сил: пустые разговоры или долгое одиночество?",
                    "Опиши момент, когда ты почувствовал(а) полное единение с собой или миром.",
                    "Какие энергетические качества ты ищешь в партнере?",
                    "Как ты проживаешь периоды эмоционального спада и внутреннего сопротивления?",
                    "Что для тебя значит духовный рост и самопознание?",
                    "Как ты относишься к знакам судьбы и синхроничностям?",
                    "Какие свои теневые стороны (недостатки) тебе сложнее всего принять?",
                    "Готов(а) ли ты к кармическим урокам в отношениях?",
                    "Что помогает тебе возвращаться в ресурсное состояние?",
                    "Как ты проявляешь безусловную любовь?",
                    "В чем ты чувствуешь свое истинное предназначение (даже если еще не нашел(ла) его)?",
                    "Что для тебя значит свобода проявления Себя?",
                    "Тебе важнее духовная близость или материальная стабильность?",
                    "Благодарю за твою искренность и глубину! Я сформировал слепок твоего профиля. Сейчас мы перейдём к расчёту твоей натальной и Human Design карты. 🌟"
                  ];
                } else {
                   offlineQuestions = [
                    "Интересно! Расскажи, как выглядит твой идеальный выходной день — если бы не было вообще никаких ограничений?",
                    "А если этот идеальный день — с близким человеком, как он выглядит?",
                    "Что тебя быстрее выматывает: долго быть среди людей или долго быть в одиночестве?",
                    "Опиши момент в жизни, когда ты чувствовал(а) себя по-настоящему «в своей тарелке».",
                    "Какие три качества ты больше всего ценишь в людях?",
                    "Как ты обычно реагируешь на конфликт? Уходишь, обсуждаешь сразу, или что-то другое?",
                    "Вспомни ситуацию, где тебе было очень сложно принять решение. Как ты справился(ась)?",
                    "Что для тебя значит «личное пространство» в отношениях?",
                    "Как ты относишься к спонтанности? Любишь сюрпризы или предпочитаешь планировать?",
                    "Какие эмоции тебе сложнее всего прожить и выразить?",
                    "Были ли в твоей жизни моменты, когда ты понимал(а), что нужно кардинально поменять что-то в себе?",
                    "Что для тебя важнее: стабильность или новизна? Почему?",
                    "Как ты обычно проявляешь любовь и заботу к близким людям?",
                    "Какие ценности для тебя абсолютно не подлежат компромиссу?",
                    "Представь себе отношения мечты через 5 лет. Как они выглядят?",
                    "Спасибо за такое глубокое интервью! Я собрал достаточно данных для создания твоего психологического профиля. Сейчас мы перейдём к последнему шагу — дате рождения для Human Design карты. 🌟"
                  ];
                }
                const qIdx = Math.max(0, Math.min(currentQuestionIndex - 1, offlineQuestions.length - 1));
                const replyText = offlineQuestions[qIdx];
                
                // Simulate typing delay for realistic feel
                setTimeout(() => {
                  addMessage({
                    id: Date.now().toString(),
                    role: "ai",
                    text: replyText,
                  });
                  if (currentQuestionIndex >= 17) {
                    // Generate demo psych profile for offline mode
                    setPsychProfile({
                      openness: 0.72,
                      conscientiousness: 0.65,
                      extraversion: 0.58,
                      agreeableness: 0.81,
                      neuroticism: 0.35,
                      attachment_style: 'secure',
                      energy_type: 'variable',
                      conflict_style: 'healthy_boundary',
                      top_values: ['свобода', 'честность', 'глубина', 'развитие', 'принятие'],
                      shadow_patterns: ['перфекционизм', 'страх конфликта'],
                      refused_questions: [],
                      confidence_score: 0.78,
                      profile_notes: 'Ты человек, который ценит глубину и подлинность в отношениях. Тебе важно чувствовать себя свободно, но при этом ты готов(а) вкладываться в того, кому доверяешь. Ты умеешь слышать и держать баланс между близостью и личным пространством.',
                      bio_variants: {
                        light: 'Люблю походы, глубокие разговоры и неожиданные путешествия. Ищу человека, с которым можно молчать и смеяться.',
                        deep: 'Ценю подлинность и глубину. Верю, что настоящая близость рождается из честности и готовности быть уязвимым.',
                        warm: 'Человек, который умеет слушать тишину. Ищу не идеального, а настоящего.',
                      },
                    });
                    completeInterview();
                  } else {
                    setQuestionIndex(currentQuestionIndex + 1);
                  }
                  setTyping(false);
                }, 1500);
                return; // don't call finally() for typing
              }).finally(() => {
                setTyping(false);
              });
            }} 
            placeholder="Ответить..." 
            disabled={isTyping}
            rightAddon={
              <button
                onClick={toggleListening}
                className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-transparent text-white/50 hover:text-white/80'}`}
                style={{ transform: "translateY(-2px)" }}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            }
          />
        </div>
      </div>

      {/* BIO SELECTION MODAL */}
      <AnimatePresence>
        {showBioSelection && psychProfile?.bio_variants && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col pt-16 px-4 bg-[#0d1f1a]/95 backdrop-blur-md overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex-1 overflow-y-auto pb-32"
            >
              <div className="w-14 h-14 rounded-[18px] bg-white/10 flex items-center justify-center shadow-lg mb-6 mx-auto">
                <Sparkles size={28} className="text-[#7bc4a0]" />
              </div>

              <h1 className="text-h1 text-white text-center mb-3">Твоё AI-Био</h1>
              <p className="text-body text-white/50 text-center mb-8 px-4">
                На основе интервью я написал для тебя три варианта описания профиля. Выбери тот, который откликается больше всего:
              </p>

              <div className="space-y-4">
                {Object.entries(psychProfile.bio_variants).map(([key, text]) => {
                  const isSelected = selectedBioIndex === key;
                  const titles: Record<string, string> = { light: 'Лёгкий', deep: 'Глубокий', warm: 'Тёплый' };
                  return (
                    <GlassCard
                      key={key}
                      onClick={() => setSelectedBioIndex(key)}
                      className={`p-5 cursor-pointer transition-all border ${isSelected ? 'border-[#4A9E7F] bg-[#4A9E7F]/10' : 'border-white/10 hover:bg-white/5'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold tracking-widest uppercase text-[#7bc4a0]">
                          {titles[key] || key}
                        </span>
                        {isSelected && <Check size={18} className="text-[#4A9E7F]" />}
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed italic m-0">
                        "{String(text)}"
                      </p>
                    </GlassCard>
                  );
                })}
              </div>
            </motion.div>

            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0d1f1a] via-[#0d1f1a]/90 to-transparent pb-safe">
              <Button
                variant="primary"
                onClick={handleBioConfirm}
                disabled={!selectedBioIndex}
                className="w-full relative py-4"
              >
                Сохранить и продолжить
              </Button>
              <button
                onClick={() => {
                  setShowBioSelection(false);
                  navigate("/birth-data");
                }}
                className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors uppercase font-bold tracking-wider"
              >
                Пропустить пока
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
