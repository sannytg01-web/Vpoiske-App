import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

import { AppBackground } from "../components/ui/AppBackground";
import { useInterviewStore } from "../store/interviewStore";
import { apiClient } from "../utils/apiClient";
import { tgHaptic } from "../utils/telegram";
import { maxHaptic } from "../utils/maxBridge";
import { detectPlatform } from "../utils/platform";
import { AgentHeader } from "../components/chat/AgentHeader";
import { ChatBubble } from "../components/chat/ChatBubble";
import { ChatInput } from "../components/chat/ChatInput";
import { TypingIndicator } from "../components/chat/TypingIndicator";

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
          startSession(Date.now().toString(), "Привет! Рад знакомству. Расскажи немного о себе: как тебя зовут и чем ты занимаешься?");
        } finally {
          setTyping(false);
        }
      };
      initSession();
    }
  }, [sessionId, startSession, setTyping]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        navigate("/birth-data"); // Proceed to next part
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, navigate]);

  const progressPercentage = Math.min((currentQuestionIndex / 18) * 100, 100);

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

      {/* MESSAGES */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-6 pb-28 flex flex-col relative"
        style={{ scrollBehavior: "smooth" }}
      >
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
              setInputValue(text);
              // ChatInput clear itself, we just need to adapt our handleSend logic
              // Since handleSend depends on inputValue, we pass text directly
              if (!text.trim() || isTyping) return;
              
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
                  completeInterview();
                }
              }).catch((e) => {
                console.error(e);
                const mockReplies = [
                  "Понятно. Звучит очень интересно! А какие у тебя главные ценности в жизни?",
                  "Супер! А как ты обычно проводишь свободное время?",
                  "Здорово. Что для тебя важнее всего в отношениях?",
                  "Спасибо за искренность! Думаю, я узнал достаточно для начала."
                ];
                const replyText = mockReplies[Math.min(currentQuestionIndex, mockReplies.length - 1)];
                addMessage({
                  id: Date.now().toString(),
                  role: "ai",
                  text: replyText,
                });
                if (currentQuestionIndex >= 3) {
                  completeInterview();
                } else {
                  setQuestionIndex(currentQuestionIndex + 1);
                }
              }).finally(() => {
                setTyping(false);
              });
            }} 
            placeholder="Ответить..." 
            disabled={isTyping}
          />
          {/* VOICE INPUT BUTTON (Overlaid) */}
          <button
            onClick={toggleListening}
            className={`absolute right-16 top-1/2 -translate-y-[8px] w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-transparent text-white/50 hover:text-white/80'}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
