import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Mic, MicOff, Sparkles, Lock, Image as ImageIcon } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { useChatStore } from "../store/chatStore";
import { useMatchStore } from "../store/matchStore";
import { useAuthStore } from "../store/authStore";
import { apiClient } from "../utils/apiClient";

export const Chat: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const {
    messages,
    fetchMessages,
    loadMoreMessages,
    addMessage,
    clearMessages,
    loading,
  } = useChatStore();
  const { selectedMatch, selectMatch } = useMatchStore();
  const userId = useAuthStore((state) => state.userId) || "mock_id"; // Now reads from authStore

  const [inputText, setInputText] = useState("");
  const [showAiHints, setShowAiHints] = useState(false);
  const approach = localStorage.getItem('vpoiske_approach') || 'scientific';

  // Photo Anonymity State
  const [photoUnlocked, setPhotoUnlocked] = useState(false);
  const [photoRequestSent, setPhotoRequestSent] = useState(false);
  const [showPhotoRequest, setShowPhotoRequest] = useState(false);

  useEffect(() => {
    if (messages.length >= 3 && !photoUnlocked && !photoRequestSent) {
      setShowPhotoRequest(true);
    }
  }, [messages.length, photoUnlocked, photoRequestSent]);

  const handleRequestPhoto = () => {
    setPhotoRequestSent(true);
    setShowPhotoRequest(false);
    // Simulate other person accepting after 2 seconds
    setTimeout(() => {
      setPhotoUnlocked(true);
      addMessage({
        id: Date.now().toString() + "_sys_photo",
        sender_id: m.id as any,
        content: "✨ Фотографии открыты! Теперь вы видите друг друга.",
        created_at: new Date().toISOString(),
        read_at: null,
      });
    }, 2500);
  };

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabled = useRef(true);

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
          setInputText((prev) => (prev ? prev + " " + finalTrans : finalTrans));
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

  // Initial Fetch & Match Data Setup
  useEffect(() => {
    if (!matchId) return;

    selectMatch(matchId);
    fetchMessages(matchId);

    return () => clearMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // WebSocket Connection Handling
  useEffect(() => {
    if (!matchId) return;

    let backoff = 1000;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("No token found. Cannot connect to websocket.");
        return;
      }
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:8000';
      const wsProtocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
      const wsHost = baseUrl.replace(/^https?:/, '');
      const wsUrl = `${wsProtocol}${wsHost}/chat/ws/${matchId}?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        backoff = 1000; // reset
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          addMessage({
            id: data.id,
            sender_id: data.sender_id,
            content: data.content,
            created_at: data.created_at,
            read_at: null,
          });

          // Trigger scroll down on incoming if we're near bottom
          if (autoScrollEnabled.current) {
            setTimeout(
              () =>
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
              50,
            );
          }
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, backoff);
        backoff = Math.min(backoff * 2, 8000); // 1s -> 2s -> 4s -> 8s cap
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Auto-Scroll to bottom on first load OR when sending message
  useEffect(() => {
    if (autoScrollEnabled.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length === 0]); // Dependency trick to fire mostly on init

  // Intersection Observer for Infinite Scroll Pagination Upwards
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && messages.length >= 50) {
          // Turn off auto-scrolling when loading history so user view doesn't jump to bottom
          autoScrollEnabled.current = false;
          loadMoreMessages(matchId!);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(target);
    return () => observer.unobserve(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const payload = {
      id: Date.now().toString(),
      sender_id: userId as any,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
      read_at: null,
    };

    // Optimistic update for mock
    addMessage(payload);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "message", content: payload.content }),
      );
    }

    setInputText("");

    // @ts-ignore
    if (window.Telegram?.WebApp?.HapticFeedback) {
      // @ts-ignore
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }

    // Force scroll when user explicitly sends
    autoScrollEnabled.current = true;
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottomOffset =
      e.currentTarget.scrollHeight -
      e.currentTarget.scrollTop -
      e.currentTarget.clientHeight;
    // If user scrolls up by more than 50px, pause autoscrolling to bottom on new messages
    if (bottomOffset > 50) {
      autoScrollEnabled.current = false;
    } else {
      autoScrollEnabled.current = true;
    }
  };

  if (!selectedMatch)
    return <div className="page-content bg-transparent"></div>;
  const m = selectedMatch;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-content bg-transparent flex flex-col"
    >
      <AppBackground />

      {/* HEADER FIXED */}
      <div
        className="flex items-center justify-between p-4 bg-[#0d1f1a]/80 backdrop-blur-xl border-b border-white/10 z-20 sticky top-0"
        style={{ paddingTop: "calc(16px + var(--safe-top))" }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className="relative cursor-pointer"
            onClick={() => navigate(`/matches/${m.id}`)}
          >
            <div className="w-[40px] h-[40px] rounded-full border border-white/20 bg-gradient-to-br from-[#4A9E7F] to-[#142920] flex items-center justify-center overflow-hidden relative">
              {m.photo && photoUnlocked ? (
                <img src={m.photo} className="w-full h-full object-cover" />
              ) : m.photo && !photoUnlocked ? (
                <>
                  <img src={m.photo} className="w-full h-full object-cover blur-md scale-125 opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0d1f1a]/40">
                    <Lock size={14} className="text-white/90 drop-shadow-md" />
                  </div>
                </>
              ) : (
                <span className="text-xl text-white font-serif">
                  {m.name.charAt(0)}
                </span>
              )}
            </div>
            {/* Green dot online placeholder */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d1f1a]"></div>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => navigate(`/matches/${m.id}`)}
          >
            <h3 className="text-body font-medium text-white m-0 leading-tight">
              {m.name}
            </h3>
            <p className="text-[11px] text-white/50 m-0 leading-tight">
              онлайн
            </p>
          </div>
        </div>

        {/* AI HINT BUTTON */}
        <button
          onClick={() => setShowAiHints(!showAiHints)}
          className={`p-2 rounded-full transition-all ${
            showAiHints
              ? "bg-[#4A9E7F]/20 text-[#4A9E7F]"
              : "hover:bg-white/10 text-white/40 hover:text-white/80"
          }`}
        >
          <Sparkles size={20} />
        </button>
      </div>

      {/* PHOTO EXCHANGE BANNER */}
      {showPhotoRequest && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 bg-gradient-to-r from-[#4A9E7F]/20 to-[#4A9E7F]/5 border-b border-[#4A9E7F]/30 flex items-center justify-between z-10"
        >
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-[#7bc4a0]" />
            <span className="text-[12px] text-white/90 font-medium">Обменяться фото?</span>
          </div>
          <button 
            onClick={handleRequestPhoto} 
            className="px-3 py-1.5 bg-[#4A9E7F] text-white text-[11px] font-bold rounded-lg shadow-lg uppercase tracking-wide hover:bg-[#5bb896] transition-colors"
          >
            Предложить
          </button>
        </motion.div>
      )}
      
      {photoRequestSent && !photoUnlocked && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-center z-10"
        >
          <span className="text-[11px] text-white/50 text-center uppercase tracking-widest animate-pulse">
            Ожидаем согласия {m.name}...
          </span>
        </motion.div>
      )}

      {/* MESSAGES AREA */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 pb-32 flex flex-col relative"
        onScroll={handleScroll}
      >
        {/* INFINITE SCROLL OBSERVER TARGET */}
        <div ref={observerTarget} className="h-4 w-full" />

        {loading && messages.length === 0 && (
          <div className="flex-1 flex justify-center items-center text-white/30">
            Загрузка истории...
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => {
            const isMe = String(msg.sender_id) === String(userId);
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex flex-col mb-4 max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
              >
                <div
                  className={`relative px-4 py-3 text-body text-white leading-relaxed whitespace-pre-wrap ${isMe ? "bg-accent-warm rounded-2xl rounded-tr-sm" : "bg-white/10 rounded-2xl rounded-tl-sm backdrop-blur-md border border-white/5"}`}
                >
                  {msg.content}
                </div>
                <span
                  className={`text-[10px] text-white/40 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && <span className="ml-1 opacity-70">✓</span>}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* AI HINTS PANEL */}
      {showAiHints && (
        <div className="absolute bottom-[90px] left-0 w-full px-4 z-30">
          <div className="bg-[#142920]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[#4A9E7F]" />
              <span className="text-[11px] text-[#4A9E7F] font-bold tracking-wider uppercase">
                Подсказки от AI
              </span>
            </div>
            <div className="space-y-2">
              {[
                approach === 'esoteric' 
                  ? `Твоя энергия по дизайну — ${m.hd_type}. Как ты ощущаешь этот поток в жизни?`
                  : `Твой профиль — ${m.hd_type}. Как это описание резонирует с твоим характером?`,
                m.details?.values?.shared_values?.[0]
                  ? `Мы оба ценим «${m.details.values.shared_values[0].toLowerCase()}» — как это качество проявляется в твоей жизни?`
                  : (approach === 'esoteric' ? `Что наполняет твою душу ресурсом в трудные моменты?` : `Какие принципы в отношениях для тебя не подлежат компромиссу?`),
                approach === 'esoteric'
                   ? `С какой своей «теневой» стороной тебе сложнее всего договориться?`
                   : `Как ты обычно реагируешь на острые или конфликтные стрессовые ситуации?`,
              ].map((hint, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(hint);
                    setShowAiHints(false);
                  }}
                  className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 leading-relaxed hover:bg-white/10 transition-colors"
                >
                  <span className="text-[#7bc4a0] font-semibold mr-1">{i + 1}.</span>
                  {hint}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-center">
              Нажми, чтобы вставить в поле ввода
            </p>
          </div>
        </div>
      )}

      {/* INPUT FIXED BOTTOM */}
      <div
        className="fixed bottom-0 left-0 w-full p-4 bg-[#0d1f1a]/90 backdrop-blur-xl border-t border-white/10 z-20"
        style={{ paddingBottom: "calc(16px + var(--safe-bottom))" }}
      >
        <div className="flex items-end bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-white/30 transition-colors pl-3 pr-1 py-1 relative">
          <textarea
            className="flex-1 max-h-[120px] bg-transparent text-white text-body placeholder:text-white/30 py-3 outline-none resize-none scrollbar-hide align-middle pr-[90px]"
            placeholder="Написать..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            style={{ minHeight: "44px" }}
          />
          <div className="absolute right-1 bottom-1 flex items-center space-x-1">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-transparent text-white/40 hover:text-white/80'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl transition-colors ${inputText.trim() ? "bg-accent-warm text-white" : "bg-white/5 text-white/20"}`}
            >
              <Send
                size={20}
                className={inputText.trim() ? "ml-0.5 mt-0.5" : ""}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
