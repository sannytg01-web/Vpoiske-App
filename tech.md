Ты — senior full-stack разработчик, UI/UX дизайнер и DevOps-инженер.
Создай полноценное production-ready приложение для знакомств
с AI-агентом-интервьюером и матчингом по Human Design.
Название приложения: ВЛЮБВИ (Vlubvi).
Реализуй фронтенд, бэкенд, базу данных, все подключения,
масштабирование, деплой и полную дизайн-систему в одном проекте.

Архитектура выдерживает 10 000–50 000 одновременных пользователей.
Полное соответствие 152-ФЗ РФ.
Платформы: Telegram MiniApp + MAX MiniApp (max.ru).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 1. ДИЗАЙН-СИСТЕМА И ВИЗУАЛЬНЫЙ СТИЛЬ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1.1. Философия дизайна

Стиль: тёплый минимализм + glassmorphism.
Приложение ощущается как тёплое, глубокое, живое пространство —
не холодный технологичный продукт.
Ориентиры: нежные градиенты, матовые стеклянные поверхности,
мягкие тени, лёгкие анимации.
Каждый экран решает одну задачу. Никакой перегруженности.
Интерфейс понятен с первого касания — читаемый, лёгкий,
визуально приятный.

### 1.2. Цветовая палитра (src/styles/tokens.css)

:root {
  /* ── Фоны ── */
  --bg-primary:    #0d1f1a;
  --bg-secondary:  #142920;
  --bg-card:       rgba(255, 255, 255, 0.07);
  --bg-card-hover: rgba(255, 255, 255, 0.11);
  --bg-input:      rgba(255, 255, 255, 0.08);

  /* ── Градиенты ── */
  --gradient-main: linear-gradient(
    160deg,
    #0d1f1a 0%,
    #1a3028 40%,
    #2d3a2e 65%,
    #c4956a 85%,
    #e8c99a 100%
  );
  --gradient-card: linear-gradient(
    135deg,
    rgba(255,255,255,0.10) 0%,
    rgba(255,255,255,0.04) 100%
  );
  --gradient-accent: linear-gradient(90deg, #4a9e7f 0%, #7bc4a0 100%);
  --gradient-warm:   linear-gradient(90deg, #c4956a 0%, #e8c99a 100%);

  /* ── Акцентные цвета ── */
  --accent-primary:   #4a9e7f;
  --accent-secondary: #7bc4a0;
  --accent-warm:      #c4956a;
  --accent-gold:      #d4a843;
  --accent-warning:   #e8a030;
  --accent-error:     #e05555;

  /* ── Текст ── */
  --text-primary:   #f0f4f2;
  --text-secondary: rgba(240, 244, 242, 0.65);
  --text-muted:     rgba(240, 244, 242, 0.40);
  --text-on-accent: #ffffff;

  /* ── Границы ── */
  --border-subtle:  rgba(255, 255, 255, 0.08);
  --border-card:    rgba(255, 255, 255, 0.12);
  --border-active:  rgba(74, 158, 127, 0.50);
  --border-warning: rgba(232, 160, 48, 0.50);
  --border-error:   rgba(224, 85, 85, 0.50);

  /* ── Тени ── */
  --shadow-card:       0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-button:     0 4px 16px rgba(74, 158, 127, 0.30);
  --shadow-bottom-nav: 0 -8px 32px rgba(0, 0, 0, 0.30);

  /* ── Радиусы ── */
  --radius-xs:   8px;
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   28px;
  --radius-pill: 9999px;

  /* ── Переходы ── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── Blur (glassmorphism) ── */
  --blur-card:  blur(16px);
  --blur-nav:   blur(20px);
  --blur-modal: blur(24px);

  /* ── Safe Areas (MiniApp) ── */
  --safe-top:    env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 16px);
}

### 1.3. Типографика (src/styles/typography.css)

Шрифты: Manrope (заголовки) + Inter (текст тела).
Установить через npm — НЕ CDN (оффлайн в MiniApp):
  npm install @fontsource/manrope @fontsource/inter

Импортировать в src/main.tsx:
  import '@fontsource/manrope/400.css'
  import '@fontsource/manrope/600.css'
  import '@fontsource/manrope/700.css'
  import '@fontsource/inter/400.css'
  import '@fontsource/inter/500.css'

.text-h1 {
  font-family: 'Manrope', sans-serif;
  font-size: 28px; font-weight: 700;
  line-height: 1.25; letter-spacing: -0.5px;
  color: var(--text-primary);
}
.text-h2 {
  font-family: 'Manrope', sans-serif;
  font-size: 22px; font-weight: 600;
  line-height: 1.3; color: var(--text-primary);
}
.text-h3 {
  font-family: 'Manrope', sans-serif;
  font-size: 17px; font-weight: 600;
  line-height: 1.4; color: var(--text-primary);
}
.text-body {
  font-family: 'Inter', sans-serif;
  font-size: 15px; font-weight: 400;
  line-height: 1.6; color: var(--text-secondary);
}
.text-caption {
  font-family: 'Inter', sans-serif;
  font-size: 13px; font-weight: 400;
  line-height: 1.5; color: var(--text-muted);
}
.text-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.3px; color: var(--text-muted);
  text-transform: uppercase;
}

### 1.4. Компоненты UI (src/components/ui/)

─── GlassCard ────────────────────────────────────────
.glass-card {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  -webkit-backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 16px;
  transition: background var(--transition-fast);
}
.glass-card:active {
  background: var(--bg-card-hover);
  transform: scale(0.985);
}
.glass-card.warning { border-color: var(--border-warning); }
.glass-card.error   { border-color: var(--border-error); }

─── Button (три варианта) ────────────────────────────
.btn-primary {
  background: var(--gradient-accent);
  color: var(--text-on-accent);
  border: none; border-radius: var(--radius-pill);
  padding: 14px 28px;
  font-family: 'Manrope', sans-serif;
  font-size: 15px; font-weight: 600;
  box-shadow: var(--shadow-button);
  width: 100%; cursor: pointer;
  transition: opacity var(--transition-fast),
              transform var(--transition-fast);
}
.btn-primary:active   { opacity: 0.85; transform: scale(0.97); }
.btn-primary:disabled {
  opacity: 0.4; cursor: not-allowed; transform: none;
}
.btn-secondary {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  color: var(--text-primary);
  border-radius: var(--radius-pill);
  padding: 14px 28px;
  font-size: 15px; font-weight: 500;
  width: 100%; cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-secondary:active { background: var(--bg-card-hover); }
.btn-danger {
  background: transparent;
  border: 1px solid var(--border-error);
  color: var(--accent-error);
  border-radius: var(--radius-pill);
  padding: 14px 28px;
  font-size: 15px; font-weight: 500;
  width: 100%; cursor: pointer;
}
.pill-tab-container {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-pill);
  padding: 4px; display: flex; gap: 4px;
}
.pill-tab {
  flex: 1; border-radius: var(--radius-pill);
  padding: 10px 16px; font-size: 14px; font-weight: 500;
  color: var(--text-muted); border: none;
  background: transparent;
  transition: all var(--transition-normal); cursor: pointer;
}
.pill-tab.active {
  background: var(--gradient-accent);
  color: var(--text-on-accent);
  box-shadow: var(--shadow-button);
}

─── BottomNavigation ─────────────────────────────────
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  padding-bottom: var(--safe-bottom); padding-top: 8px;
  background: rgba(13, 31, 26, 0.85);
  backdrop-filter: var(--blur-nav);
  -webkit-backdrop-filter: var(--blur-nav);
  border-top: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-bottom-nav);
  display: flex; justify-content: space-around;
  align-items: center; z-index: 100;
}
.nav-item {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
  cursor: pointer; position: relative;
}
.nav-item.active {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  padding: 8px 20px;
}
.nav-icon { width: 24px; height: 24px; color: var(--text-muted); }
.nav-item.active .nav-icon { color: var(--accent-primary); }
.nav-label {
  font-size: 10px; font-weight: 500; color: var(--text-muted);
}
.nav-item.active .nav-label { color: var(--accent-primary); }
.nav-badge {
  position: absolute; top: 2px; right: 6px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent-warm);
}

5 вкладок (иконки из lucide-react):
  1. <Home />     → "Главная"
  2. <Timer />    → "Интервью" (скрыта после завершения)
  3. <Sparkles /> → "AI-агент" (центральная)
  4. <Diamond />  → "Мэтчи"
  5. <User />     → "Профиль"

─── ChatBubble ───────────────────────────────────────
.bubble-ai {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg) var(--radius-lg)
                 var(--radius-lg) var(--radius-xs);
  padding: 14px 16px; color: var(--text-primary);
  font-size: 15px; line-height: 1.6;
  max-width: 85%; align-self: flex-start;
}
.bubble-user {
  background: var(--gradient-accent);
  border-radius: var(--radius-lg) var(--radius-lg)
                 var(--radius-xs) var(--radius-lg);
  padding: 14px 16px; color: var(--text-on-accent);
  font-size: 15px; line-height: 1.6;
  max-width: 85%; align-self: flex-end;
}
.bubble-timestamp {
  font-size: 11px; color: rgba(240,244,242,0.45);
  text-align: right; margin-top: 4px;
}

─── TypingIndicator ──────────────────────────────────
.typing-indicator {
  display: flex; align-items: center; gap: 5px;
  padding: 14px 18px;
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg) var(--radius-lg)
                 var(--radius-lg) var(--radius-xs);
  align-self: flex-start; width: fit-content;
}
.typing-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent-secondary);
  animation: typingBounce 1.2s ease-in-out infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30%           { transform: translateY(-6px); opacity: 1; }
}

─── MatchCard ────────────────────────────────────────
.match-card {
  position: relative; border-radius: var(--radius-xl);
  overflow: hidden; background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  aspect-ratio: 3/4; cursor: pointer;
}
.match-card-photo { width: 100%; height: 70%; object-fit: cover; }
.match-card-info {
  padding: 12px 14px;
  background: linear-gradient(
    0deg, rgba(13,31,26,0.95) 0%, transparent 100%
  );
  position: absolute; bottom: 0; left: 0; right: 0;
}
.compatibility-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--gradient-accent);
  border-radius: var(--radius-pill);
  padding: 4px 10px; font-size: 12px;
  font-weight: 600; color: white;
}
.lock-overlay {
  position: absolute; inset: 0;
  background: rgba(13,31,26,0.60);
  display: flex; align-items: center; justify-content: center;
}

─── HDChart (SVG Bodygraph) ──────────────────────────
.hd-chart-container {
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-xl);
  padding: 20px; width: 100%; aspect-ratio: 1;
}
.hd-center-defined {
  fill: var(--accent-primary); opacity: 0.85;
  transition: fill var(--transition-normal);
}
.hd-center-undefined {
  fill: transparent;
  stroke: rgba(255,255,255,0.15); stroke-width: 1.5;
}
.hd-channel-active {
  stroke: var(--accent-primary); stroke-width: 2; opacity: 0.7;
}
.hd-channel-inactive {
  stroke: rgba(255,255,255,0.10); stroke-width: 1;
}

─── ProgressBar (интервью) ───────────────────────────
.progress-container { display: flex; gap: 4px; padding: 0 16px; }
.progress-dot {
  flex: 1; height: 3px; border-radius: 2px;
  background: var(--border-subtle);
  transition: background var(--transition-normal);
}
.progress-dot.completed { background: var(--gradient-accent); }
.progress-dot.current   { background: var(--accent-warm); }

─── StepIndicator (BirthData, 3 шага) ───────────────
.step-indicator {
  display: flex; align-items: center;
  justify-content: center; gap: 8px; padding: 16px;
}
.step-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  transition: all var(--transition-normal);
}
.step-dot.done   { background: var(--gradient-accent); color: white; }
.step-dot.active { background: var(--accent-warm); color: white; }
.step-dot.pending {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  color: var(--text-muted);
}
.step-line {
  flex: 1; height: 2px; border-radius: 1px;
  background: var(--border-subtle); max-width: 40px;
}
.step-line.done { background: var(--gradient-accent); }

─── Toggle ───────────────────────────────────────────
.toggle-track {
  width: 44px; height: 24px; border-radius: 12px;
  background: var(--border-subtle);
  position: relative; cursor: pointer;
  transition: background var(--transition-normal);
}
.toggle-track.on { background: var(--gradient-accent); }
.toggle-thumb {
  width: 20px; height: 20px; border-radius: 50%;
  background: white; position: absolute; top: 2px; left: 2px;
  transition: transform var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.toggle-track.on .toggle-thumb { transform: translateX(20px); }

─── TextInput (форма) ────────────────────────────────
.form-input {
  background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px; color: var(--text-primary);
  font-size: 15px; font-family: 'Inter', sans-serif;
  width: 100%; outline: none;
  transition: border-color var(--transition-fast);
}
.form-input:focus { border-color: var(--border-active); }
.form-input.error { border-color: var(--border-error); }
.form-input::placeholder { color: var(--text-muted); }

─── ChatInput ────────────────────────────────────────
.chat-input-container {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  background: rgba(13, 31, 26, 0.90);
  backdrop-filter: var(--blur-nav);
  border-top: 1px solid var(--border-subtle);
}
.chat-input {
  flex: 1; background: var(--bg-input);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  padding: 12px 18px; color: var(--text-primary);
  font-size: 15px; outline: none;
  transition: border-color var(--transition-fast);
}
.chat-input:focus     { border-color: var(--border-active); }
.chat-input::placeholder { color: var(--text-muted); }
.send-button {
  width: 44px; height: 44px;
  border-radius: var(--radius-pill);
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
  transition: all var(--transition-fast);
}
.send-button.has-text {
  background: var(--gradient-accent);
  border-color: transparent;
  box-shadow: var(--shadow-button);
}
.send-button:active { transform: scale(0.92); opacity: 0.85; }

─── FilterChip ───────────────────────────────────────
.filter-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--bg-card);
  backdrop-filter: var(--blur-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-pill);
  padding: 8px 14px; font-size: 14px;
  color: var(--text-secondary); cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}
.filter-chip.active {
  background: var(--gradient-accent);
  border-color: transparent; color: white;
}

─── SectionTag ───────────────────────────────────────
.section-tag {
  display: inline-block;
  background: rgba(74, 158, 127, 0.15);
  color: var(--accent-secondary);
  border: 1px solid rgba(74, 158, 127, 0.25);
  border-radius: var(--radius-pill);
  padding: 3px 10px; font-size: 11px;
  font-weight: 600; letter-spacing: 0.5px;
  text-transform: uppercase; margin-bottom: 8px;
}

─── AppBackground ────────────────────────────────────
const AppBackground = () => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'var(--gradient-main)',
    zIndex: -1, overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute', bottom: '-20%', right: '-10%',
      width: '60vw', height: '60vw', borderRadius: '50%',
      background:
        'radial-gradient(circle,rgba(196,149,106,0.35) 0%,transparent 70%)',
      filter: 'blur(60px)',
      animation: 'blobPulse 8s ease-in-out infinite alternate'
    }} />
    <div style={{
      position: 'absolute', top: '20%', left: '-15%',
      width: '50vw', height: '50vw', borderRadius: '50%',
      background:
        'radial-gradient(circle,rgba(74,158,127,0.25) 0%,transparent 70%)',
      filter: 'blur(50px)',
      animation: 'blobPulse 10s ease-in-out infinite alternate-reverse'
    }} />
  </div>
)
/*
@keyframes blobPulse {
  0%   { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.15) translate(3%, -3%); }
}
*/

### 1.5. Анимации (src/utils/animations.ts)

import { Variants } from 'framer-motion'

export const pageTransition = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
}
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.25 }
  })
}
export const bubbleVariants: Variants = {
  hidden:  { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
}
export const bottomSheetVariants: Variants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { duration: 0.35,
             ease: [0.4, 0, 0.2, 1] } },
  exit:    { y: '100%', transition: { duration: 0.25 } }
}

Framer Motion использовать ТОЛЬКО для:
- Появление страниц (pageTransition)
- Пузырьки чата (bubbleVariants)
- Карточки мэтчей (cardVariants)
- Bottom sheet Paywall (bottomSheetVariants)
- Раскрытие аккордеона (height animate)

### 1.6. Global CSS (src/styles/global.css)

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}
body {
  margin: 0; padding: 0;
  background: var(--bg-primary);
  overflow: hidden;
  height: 100vh; height: 100dvh;
  font-family: 'Inter', sans-serif;
}
input, textarea { user-select: text; }
#root {
  height: 100dvh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.page-content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding-top: var(--safe-top);
  padding-bottom: calc(72px + var(--safe-bottom));
  -webkit-overflow-scrolling: touch;
}
.page-content::-webkit-scrollbar { display: none; }
.page-content { scrollbar-width: none; }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 2. СТЕК И АРХИТЕКТУРА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

БЭКЕНД:
  Python 3.11
  FastAPI (async, ASGI: Uvicorn + Gunicorn, 3 инстанса)
  SQLAlchemy 2.0 async ORM
  Alembic (миграции)
  asyncpg (PostgreSQL async драйвер)
  PostgreSQL 15 + pgvector + pgcrypto
  PgBouncer (connection pooling, transaction mode)
  Redis 7 (кэш, WebSocket Pub/Sub, LLM очередь)
  Celery + Redis (фоновые задачи, 3 отдельные очереди)
  httpx (async HTTP — YandexGPT, Nominatim, sms.ru)
  python-jose (JWT RS256)
  passlib + bcrypt
  pydantic v2
  slowapi (rate limiting per IP + per user)
  structlog (JSON логирование)
  ephem (позиции планет для Human Design)
  timezonefinder (timezone по lat/lon)

ФРОНТЕНД:
  React 18 + TypeScript
  Vite (сборщик)
  Zustand (глобальный стейт)
  React Router v6
  TailwindCSS + CSS Variables (токены из ч.1)
  @fontsource/manrope + @fontsource/inter (npm, не CDN)
  framer-motion (только анимации из п.1.5)
  lucide-react (иконки)
  axios с interceptors (JWT refresh)
  @twa-dev/sdk (Telegram WebApp SDK, npm)
  max-web-app.js (MAX Bridge, CDN скрипт в index.html)

ИНФРАСТРУКТУРА:
  Docker Compose (dev + prod)
  Nginx (reverse proxy, SSL, балансировка 3 инстансов)
  Let's Encrypt + Certbot (auto-renew)
  PgBouncer (перед PostgreSQL)
  Prometheus + Grafana (мониторинг)
  Sentry self-hosted (трекинг ошибок)

ХОСТИНГ: Timeweb Cloud (серверы РФ, 152-ФЗ)
  Основной VPS:  4 vCPU / 8 GB / 80 GB SSD — ₽1 400/мес
  PostgreSQL:    Managed PostgreSQL 15 — ₽350/мес
  Celery VPS:    2 vCPU / 4 GB — ₽690/мес

ВНЕШНИЕ API:
  YandexGPT Pro    — LLM для AI-агента-интервьюера
  T-Bank Acquiring — приём платежей + рекуррентные
  Nominatim OSM    — геокодинг городов (бесплатно)
  sms.ru           — SMS-коды авторизации

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 3. СТРУКТУРА ПРОЕКТА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

vlubvi/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── hd_card.py
│   │   │   ├── psychological_profile.py
│   │   │   ├── interview.py
│   │   │   ├── match.py
│   │   │   ├── chat.py
│   │   │   ├── payment.py
│   │   │   └── audit_log.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── match.py
│   │   │   ├── interview.py
│   │   │   ├── birth_data.py
│   │   │   ├── payment.py
│   │   │   └── consent.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── interview.py
│   │   │   ├── profile.py
│   │   │   ├── birth_data.py
│   │   │   ├── hd.py
│   │   │   ├── geo.py
│   │   │   ├── matches.py
│   │   │   ├── chat.py
│   │   │   ├── payment.py
│   │   │   ├── consent.py
│   │   │   └── gdpr.py
│   │   ├── services/
│   │   │   ├── ai_agent.py
│   │   │   ├── hd_calculator.py
│   │   │   ├── matching.py
│   │   │   ├── tbank.py
│   │   │   ├── sms.py
│   │   │   ├── notifications.py
│   │   │   ├── encryption.py
│   │   │   └── audit.py
│   │   └── core/
│   │       ├── security.py
│   │       ├── rate_limiter.py
│   │       └── exceptions.py
│   ├── prompts/
│   │   └── agent_interview.md   ← ОТДЕЛЬНЫЙ ФАЙЛ ИНСТРУКЦИЙ
│   ├── alembic/
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_hd_calculator.py
│   │   ├── test_matching.py
│   │   └── test_payment.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── celery_worker.py
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   ├── typography.css
│   │   │   ├── animations.css
│   │   │   └── global.css
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── AppBackground.tsx
│   │   │   │   ├── GlassCard.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   ├── Toggle.tsx
│   │   │   │   ├── TextInput.tsx
│   │   │   │   ├── FilterChip.tsx
│   │   │   │   ├── SectionTag.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── StepIndicator.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatBubble.tsx
│   │   │   │   ├── AgentHeader.tsx
│   │   │   │   ├── UserHeader.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── TypingIndicator.tsx
│   │   │   ├── matches/
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   └── CompatScore.tsx
│   │   │   ├── hd/
│   │   │   │   └── HDChart.tsx
│   │   │   └── payment/
│   │   │       └── SubscribeModal.tsx
│   │   ├── pages/
│   │   │   ├── Onboarding.tsx
│   │   │   ├── ConsentForm.tsx
│   │   │   ├── Interview.tsx
│   │   │   ├── BirthDataForm.tsx
│   │   │   ├── HDCard.tsx
│   │   │   ├── Matches.tsx
│   │   │   ├── MatchDetail.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Paywall.tsx
│   │   │   ├── DataExport.tsx
│   │   │   └── DeleteAccount.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── interviewStore.ts
│   │   │   ├── birthDataStore.ts
│   │   │   └── matchStore.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── utils/
│   │   │   ├── telegram.ts
│   │   │   ├── maxBridge.ts
│   │   │   ├── platform.ts
│   │   │   ├── platformHelper.ts
│   │   │   └── animations.ts
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
├── nginx/nginx.conf
├── pgbouncer/
│   ├── pgbouncer.ini
│   └── userlist.txt
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/dashboards/vlubvi.json
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 4. ФАЙЛ ИНСТРУКЦИЙ AI-АГЕНТА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Файл: backend/prompts/agent_interview.md

Этот файл загружается в ai_agent.py при старте сервиса:

  # services/ai_agent.py
  from pathlib import Path

  PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

  def load_prompt(filename: str) -> str:
      return (PROMPTS_DIR / filename).read_text(encoding="utf-8")

  INTERVIEW_PROMPT = load_prompt("agent_interview.md")

Файл можно редактировать без перезапуска кода —
только перезапуск сервиса (docker-compose restart backend).
Версионировать в git отдельно от кода.

─────────────────────────────────────────────────────────
СОДЕРЖИМОЕ ФАЙЛА backend/prompts/agent_interview.md:
─────────────────────────────────────────────────────────

# Инструкция AI-агента — интервью приложения ВЛЮБВИ

## Роль и характер

Ты — внимательный, тёплый собеседник внутри приложения
для знакомств ВЛЮБВИ. Твоя задача — через живой разговор
глубоко понять человека: его ритм жизни, ценности,
паттерны в отношениях, теневые стороны.

Ты не психолог с протоколом и не анкета с галочками.
Ты — умный, чуткий друг, который умеет слушать
и задавать точные вопросы.

Результат твоей работы — психологический профиль,
который ляжет в основу алгоритма матчинга.

---

## Жёсткие правила поведения

1. ОДИН вопрос за раз — никогда не задавай два вопроса
   в одном сообщении
2. После каждого ответа — короткое отражение
   (1–2 предложения), затем следующий вопрос
3. Следующий вопрос строй на основе того, что сказал
   человек — не по скрипту механически
4. Никогда не оценивай, не критикуй, не советуй
5. Никогда не говори "отличный ответ", "здорово",
   "интересно" — это звучит фальшиво
6. Язык — живой, тёплый, без психологического жаргона
7. Если ответ слишком короткий или уклончивый —
   мягко попроси раскрыть: "Расскажи чуть подробнее?"
8. Если человек отвечает вопросом на вопрос —
   сначала коротко ответь, потом верни свой вопрос
9. Никогда не раскрывай что именно ты измеряешь
   и какие параметры выводишь
10. Не торопи человека, не пиши "поехали дальше"
11. Общий тон: как будто вы сидите за чашкой чая
    поздно вечером и впервые по-настоящему разговариваете

---

## Структура интервью (18 обменов)

Интервью состоит из 18 вопросов, разбитых на 3 уровня.
Каждый уровень идёт глубже предыдущего.
Переход между уровнями — плавный, без объявлений.

### УРОВЕНЬ 1 — Разогрев и ритм жизни (вопросы 1–5)
Цель: снять тревогу, установить доверие, понять
базовый ритм человека и его отношение к пространству.

ВОПРОС 1 (всегда первый, неизменный):
  "Привет! Я здесь, чтобы лучше понять тебя —
   не оценить, а услышать. Начнём с простого:
   как выглядит твой идеальный выходной?"

  Что измеряем: extraversion, energy_type
  На что обращать внимание:
    — упоминание людей vs одиночества
    — активность vs покой
    — структура vs спонтанность

ВОПРОС 2 (адаптировать по ответу на вопрос 1):
  Базовый вариант:
  "А если этот выходной — с близким человеком,
   как это выглядит? Чем он отличается от того,
   что ты описал(а)?"

  Что измеряем: attachment_style, energy_type
  Если человек уже включил партнёра в вопрос 1 —
  спросить вместо этого:
  "Ты описал(а) это вместе. А бывает ли тебе
   нужно время только для себя, и как часто?"

ВОПРОС 3:
  "Что тебя быстрее выматывает: долго быть
   с людьми или долго быть одному?"

  Что измеряем: extraversion (точнее)
  Если ответ неопределённый — уточнить:
  "А после большой вечеринки — ты заряжаешься
   или тебе нужно восстановиться?"

ВОПРОС 4:
  "Опиши момент из своей жизни, когда ты
   чувствовал(а) себя по-настоящему в своей тарелке.
   Что происходило вокруг?"

  Что измеряем: values (косвенно), energy_type,
                conscientiousness
  На что обращать внимание:
    — место и окружение (люди / природа / город / дом)
    — деятельность (создание / общение / покой / движение)
    — ощущение контроля или свободы

ВОПРОС 5:
  "Как ты обычно принимаешь важные решения —
   долго думаешь и взвешиваешь, или действуешь
   по ощущению?"

  Что измеряем: conscientiousness, energy_type
  Уточнение если ответ "по-разному":
  "А в отношениях — ты скорее осторожен(на)
   или быстро сближаешься?"

---

### УРОВЕНЬ 2 — Ценности и паттерны в отношениях
### (вопросы 6–13)
Цель: понять как человек выстраивает близость,
что для него важно в паре, как реагирует на конфликт.

ВОПРОС 6:
  "Представь: ты помог(ла) близкому человеку,
   потратил(а) время и силы. А внутри что-то сжалось.
   Что именно там было?"

  Что измеряем: agreeableness, attachment_style,
                conflict_style
  На что обращать внимание:
    — обида / усталость / страх не оценят
    — привычка давать больше чем получать
    — граница между заботой и самопожертвованием

ВОПРОС 7:
  "Партнёр отменил общие планы в последний момент.
   Что ты чувствуешь через час после этого?"

  Что измеряем: attachment_style (тревожный / избегающий)
  Варианты ответов и что за ними:
    Обида/тревога — тревожный стиль
    Облегчение/нейтралитет — избегающий стиль
    "Зависит от причины" — просить уточнить

ВОПРОС 8:
  "Вспомни момент, когда тебе было по-настоящему
   хорошо рядом с кем-то — без слов, просто рядом.
   Что это был за момент?"

  Что измеряем: attachment_style (secure),
                values, intimacy_style
  Если человек говорит что такого не было —
  не давить, спросить: "А как тебе лучше всего
  чувствуется близость с человеком?"

ВОПРОС 9:
  "Что для тебя важнее в паре: когда тебя
   понимают, или когда дают пространство?"

  Что измеряем: attachment_style, conflict_style
  Уточнение: "А ты замечаешь за собой, что иногда
  хочешь и того и другого одновременно?"

ВОПРОС 10:
  "Расскажи о человеке, с которым тебе было
   по-настоящему легко. Что в нём было такого?"

  Что измеряем: values, compatibility_patterns
  Это свободный вопрос — не перебивать,
  дать человеку говорить столько сколько хочет.
  Отражение должно подхватить конкретную деталь.

ВОПРОС 11:
  "А что тебя в людях раздражает быстрее всего?
   Такое, что сразу чувствуешь — нет, не моё."

  Что измеряем: shadow_patterns (проекция),
                top_values (обратная сторона),
                openness
  Важно: раздражение часто указывает на собственные
  вытесненные качества — фиксировать тщательно.

ВОПРОС 12:
  "Когда в отношениях становится трудно —
   ты скорее идёшь навстречу, отступаешь,
   или держишь свою позицию?"

  Что измеряем: conflict_style
  Уточнение если "зависит":
  "А если тебе важна тема — что тогда?"

ВОПРОС 13:
  "Что ты обычно скрываешь от партнёра дольше
   всего — то, что узнают позже всего?"

  Что измеряем: openness, shadow_patterns,
                attachment_style
  Это деликатный вопрос. Если человек уклоняется —
  не давить: "Может что-то о себе, о чём
  не говоришь сразу?"

---

### УРОВЕНЬ 3 — Теневые паттерны и самопознание
### (вопросы 14–18)
Цель: выйти на глубинные паттерны, которые человек
часто не осознаёт. Вопросы этого уровня — самые
личные. Тон должен стать мягче и медленнее.

Перед вопросом 14 добавить переходное сообщение:
  "Ты хорошо отвечаешь. Хочу спросить кое-что
   поглубже — если что-то будет некомфортно,
   просто скажи."

ВОПРОС 14:
  "Заверши фразу: в отношениях я всегда
   в итоге..."

  Что измеряем: attachment_style, shadow_patterns,
                conflict_style
  Это проективный вопрос — человек часто сам
  удивляется своему ответу. Не интерпретировать
  вслух, просто принять.

ВОПРОС 15:
  "Если бы партнёр, который хорошо тебя знает,
   описал тебя одной честной фразой —
   что бы он сказал?"

  Что измеряем: self-awareness, openness,
                agreeableness
  Уточнение: "А если бы это был тот, у кого
  с тобой не получилось — что бы сказал он?"

ВОПРОС 16:
  "Есть ли что-то, что ты несёшь в себе —
   о чём мало кто знает, но что сильно
   на тебя влияет?"

  Что измеряем: shadow_patterns, openness,
                neuroticism
  Это самый глубокий вопрос интервью.
  Если человек открывается — принять без оценки.
  Если не хочет — уважить: "Хорошо, не нужно."

ВОПРОС 17:
  "Что для тебя означает — быть по-настоящему
   любимым? Не на словах, а в действиях?"

  Что измеряем: love_language (косвенно),
                attachment_style, values
  На что обращать внимание:
    — слова / поступки / время / прикосновения / помощь
    — ожидание vs принятие

ВОПРОС 18 (завершающий, всегда последний):
  "И последнее. Зачем ты здесь — чего ты
   на самом деле ищешь? Не то что принято
   говорить, а то что внутри."

  Что измеряем: top_values, relationship_goal,
                self_awareness
  После ответа — завершающее сообщение агента:
  "Спасибо, что доверился(лась) мне. Ты говорил(а)
   честно — это редкость. Составляю твой профиль..."

---

## Правила адаптации вопросов

Вопросы 2–17 — ориентировочные формулировки.
Адаптируй их под то, что уже сказал человек:

  — Если в вопросе 4 человек упомянул конкретную
    ситуацию — используй её в вопросе 10
  — Если в вопросе 7 всплыла обида — вернись к ней
    в вопросе 14 через другой угол
  — Если человек называет конкретного человека —
    можно мягко спросить о нём подробнее
    (не уходя от темы вопроса)

Запрещено:
  — Менять вопросы 1 и 18 (они якорные)
  — Пропускать уровни
  — Задавать вопрос не по очереди (нумерация строгая)
  — Возвращаться к предыдущим вопросам
    (только через отражение в новом вопросе)

---

## Обработка нестандартных ситуаций

ЕСЛИ человек отвечает одним словом или "не знаю":
  "Понимаю. А если попробовать угадать — что бы
   пришло в голову первым?"

ЕСЛИ человек пишет очень длинный ответ:
  Выбери ОДНУ деталь из его ответа для отражения.
  Не пытайся прокомментировать всё.

ЕСЛИ человек начинает расспрашивать тебя:
  Коротко ответь (1 предложение) и мягко верни
  разговор: "Но сейчас мне интереснее ты. ..."

ЕСЛИ человек пишет что ему грустно или тяжело:
  Прими это: "Слышу тебя."
  Спроси: "Хочешь продолжить или сделать паузу?"
  Если хочет паузу — сохранить сессию, не закрывать.

ЕСЛИ человек отказывается отвечать на вопрос:
  "Хорошо, пропустим это."
  Перейти к следующему вопросу.
  Зафиксировать отказ как сигнал для профиля
  (параметр refused_questions: [14]).

ЕСЛИ человек агрессивен или груб:
  Не отражать агрессию. Спокойно:
  "Слышу, что что-то задело. Можем поговорить
   об этом или просто двигаться дальше."

---

## Формат финального JSON-профиля

После 18-го обмена сформировать JSON.
НЕ показывать его пользователю.
Вернуть ТОЛЬКО в поле profile_json ответа API.

{
  "openness":          0.0–1.0,
  "conscientiousness": 0.0–1.0,
  "extraversion":      0.0–1.0,
  "agreeableness":     0.0–1.0,
  "neuroticism":       0.0–1.0,
  "attachment_style":  "secure|anxious|avoidant|disorganized",
  "energy_type":       "fast|slow|variable",
  "conflict_style":    "avoidance|merger|healthy_boundary",
  "top_values":        ["value1", "value2", "value3",
                        "value4", "value5"],
  "shadow_patterns":   ["pattern1", "pattern2"],
  "refused_questions": [14],
  "confidence_score":  0.0–1.0,
  "profile_notes":     "Краткое текстовое резюме для
                        внутреннего использования"
}

Описание полей:

openness (0–1):
  0.1–0.3 — консервативный, предпочитает знакомое
  0.4–0.6 — умеренно открытый
  0.7–0.9 — высокая открытость новому опыту

conscientiousness (0–1):
  Насколько человек структурированный, пунктуальный,
  планирующий (vs спонтанный)

extraversion (0–1):
  0.1–0.3 — интроверт, заряжается в одиночестве
  0.4–0.6 — амбиверт
  0.7–0.9 — экстраверт, заряжается от людей

agreeableness (0–1):
  Склонность к кооперации, сочувствию, миролюбию

neuroticism (0–1):
  0.1–0.3 — эмоционально стабильный
  0.6–0.9 — высокая эмоциональная чувствительность

attachment_style:
  secure      — доверяет, не цепляется, не избегает
  anxious     — боится потерять, нуждается в подтверждении
  avoidant    — ценит независимость, дистанцируется при угрозе
  disorganized — непредсказуемые реакции, страх и притяжение

energy_type:
  fast     — высокий темп, много инициативы
  slow     — медленный, вдумчивый, не торопится
  variable — зависит от состояния и контекста

conflict_style:
  avoidance       — избегает конфликта любой ценой
  merger          — растворяется в партнёре, теряет себя
  healthy_boundary — умеет держать позицию и слышать другого

top_values — 5 главных ценностей из списка:
  [свобода, безопасность, развитие, стабильность,
   честность, юмор, глубина, лёгкость, верность,
   независимость, принятие, страсть, покой,
   приключения, семья, карьера, творчество,
   духовность, дружба, интеллект]

shadow_patterns — повторяющиеся паттерны из списка:
  [самопожертвование, гиперконтроль, избегание близости,
   страх быть брошенным, нужда в одобрении,
   перфекционизм, пассивная агрессия, эмоциональное
   закрытие, зависимость от отношений,
   страх конфликта, нарциссические черты]

confidence_score (0–1):
  Насколько агент уверен в точности профиля.
  Снижается при: многих коротких ответах,
  отказах, противоречивых сигналах.
  < 0.5 — пометить профиль как требующий уточнения.

profile_notes:
  Краткое резюме на русском языке для внутреннего
  использования командой (не показывать пользователю).
  Пример: "Тревожный стиль привязанности с элементами
  избегания. Высокая чувствительность. Ценит глубину
  и честность. Паттерн самопожертвования."

---

## Как загружается этот файл

В services/ai_agent.py:

  INTERVIEW_PROMPT = load_prompt("agent_interview.md")

  async def get_next_message(
    self, session_id, user_message,
    question_index, redis
  ) -> dict:
    """
    1. Загрузить историю из Redis (ключ: interview:{session_id})
    2. Если история пуста — создать системное сообщение
       из INTERVIEW_PROMPT
    3. Добавить user_message в историю
    4. Redis semaphore: ждать слота (макс LLM_MAX_CONCURRENT=50)
    5. Запрос к YandexGPT Pro:
       URL: https://llm.api.cloud.yandex.net/
            foundationModels/v1/completion
       Headers: Authorization: Api-Key {YANDEX_API_KEY}
       Body: {
         modelUri: "gpt://{FOLDER_ID}/yandexgpt-pro",
         completionOptions: {
           stream: false,
           temperature: 0.72,
           maxTokens: 500
         },
         messages: history
       }
    6. Retry при 429: backoff 1s→2s→4s (макс 3)
    7. Добавить ответ агента в историю
    8. Сохранить историю в Redis (TTL 72h)
    9. При question_index == 18:
       — Извлечь JSON из ответа (между ```json ... ```)
       — Вернуть в поле profile_json
    10. Вернуть:
        {
          message: str,
          is_complete: bool,
          question_index: int,
          profile_json: dict | null
        }
    """

Для редактирования инструкций:
  Открыть backend/prompts/agent_interview.md
  Изменить нужный раздел
  docker-compose restart backend
  Изменения применятся без правки кода

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 5. ПЛАТФОРМЫ — TELEGRAM И MAX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 5.1. index.html

<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0,
                 viewport-fit=cover" />
  <title>Влюбви</title>
  <!--
    MAX Bridge: CDN скрипт от max.ru
    НЕ устанавливать через npm
    НЕ использовать @vkontakte/vk-bridge — другой продукт
  -->
  <script>
    (function() {
      var isMax =
        window.location.search.indexOf('max_app') !== -1 ||
        document.referrer.indexOf('max.ru') !== -1;
      if (isMax) {
        var s = document.createElement('script');
        s.src = 'https://st.max.ru/js/max-web-app.js';
        s.async = false;
        document.head.appendChild(s);
      }
    })();
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>

### 5.2. src/utils/platform.ts

export type Platform = 'telegram' | 'max' | 'web'

export const detectPlatform = (): Platform => {
  if (
    typeof window !== 'undefined' &&
    window.Telegram?.WebApp?.initData &&
    window.Telegram.WebApp.initData.length > 0
  ) return 'telegram'

  if (
    typeof window !== 'undefined' &&
    (window.WebApp !== undefined ||
     window.location.search.includes('max_app'))
  ) return 'max'

  return 'web'
}

export const getPlatformUserId = (): number | null => {
  const p = detectPlatform()
  if (p === 'telegram')
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? null
  if (p === 'max')
    return window.WebApp?.initDataUnsafe?.user?.id ?? null
  return null
}

### 5.3. src/utils/telegram.ts

import WebApp from '@twa-dev/sdk'

export const initTelegram = () => {
  WebApp.ready()
  WebApp.expand()
  WebApp.setHeaderColor('#0d1f1a')
  WebApp.setBackgroundColor('#0d1f1a')
  return {
    userId:   WebApp.initDataUnsafe?.user?.id,
    initData: WebApp.initData,
    platform: 'telegram' as const
  }
}
export const tgShowBackButton = (cb: () => void) => {
  WebApp.BackButton.show(); WebApp.BackButton.onClick(cb)
}
export const tgHideBackButton  = () => WebApp.BackButton.hide()
export const tgShowMainButton  = (text: string, cb: () => void) => {
  WebApp.MainButton.setText(text)
  WebApp.MainButton.setParams({ color: '#4a9e7f' })
  WebApp.MainButton.show()
  WebApp.MainButton.onClick(cb)
}
export const tgHideMainButton = () => WebApp.MainButton.hide()
export const tgHaptic = (t: 'light'|'medium'|'success') => {
  t === 'success'
    ? WebApp.HapticFeedback.notificationOccurred('success')
    : WebApp.HapticFeedback.impactOccurred(t)
}

### 5.4. src/utils/maxBridge.ts

/*
  MAX Bridge — собственный SDK max.ru
  Подключается ТОЛЬКО через CDN (не npm)
  window.WebApp готов после загрузки скрипта
  НЕ требует асинхронной инициализации
  НЕ совместим с @vkontakte/vk-bridge
*/

declare global {
  interface Window {
    WebApp?: {
      initData: string
      initDataUnsafe: {
        query_id: string; auth_date: number; hash: string
        user: {
          id: number; first_name: string; last_name: string
          username: string; language_code: string; photo_url: string
        }
        chat?: { id: number; type: string }
        start_param?: object
      }
      platform: 'ios'|'android'|'desktop'|'web'
      version: string
      ready:    () => void
      close:    () => void
      requestContact:             () => void
      openLink:                   (url: string) => void
      openMaxLink:                (url: string) => void
      shareContent:               (text: string, link: string) => void
      enableClosingConfirmation:  () => void
      disableClosingConfirmation: () => void
      onEvent:  (event: string, cb: (data: unknown) => void) => void
      offEvent: (event: string, cb: (data: unknown) => void) => void
      BackButton: {
        isVisible: boolean
        show: () => void; hide: () => void
        onClick: (cb: () => void) => void
        offClick: (cb: () => void) => void
      }
      HapticFeedback: {
        impactOccurred: (
          style: 'soft'|'light'|'medium'|'heavy'|'rigid',
          disableVibrationFallback?: boolean
        ) => void
        notificationOccurred: (
          type: 'success'|'error'|'warning',
          disableVibrationFallback?: boolean
        ) => void
        selectionChanged: (disableVibrationFallback?: boolean) => void
      }
      ScreenCapture: {
        isScreenCaptureEnabled: boolean
        enableScreenCapture: () => void
        disableScreenCapture: () => void
      }
    }
  }
}

export const initMax = () => {
  if (!window.WebApp) {
    console.warn('MAX WebApp SDK не загружен'); return null
  }
  window.WebApp.ready()
  return {
    userId:   window.WebApp.initDataUnsafe?.user?.id,
    initData: window.WebApp.initData,
    platform: 'max' as const,
    user:     window.WebApp.initDataUnsafe?.user
  }
}
export const maxShowBackButton = (cb: () => void) => {
  window.WebApp?.BackButton.show()
  window.WebApp?.BackButton.onClick(cb)
}
export const maxHideBackButton = () => window.WebApp?.BackButton.hide()
export const maxHaptic = (t: 'light'|'medium'|'success') => {
  if (!window.WebApp) return
  t === 'success'
    ? window.WebApp.HapticFeedback.notificationOccurred('success')
    : window.WebApp.HapticFeedback.impactOccurred(t)
}
export const maxRequestPhone = (onResult: (phone: string) => void) => {
  if (!window.WebApp) return
  window.WebApp.onEvent('WebAppRequestPhone', (data: any) => {
    if (data?.phone_number) onResult(data.phone_number)
  })
  window.WebApp.requestContact()
}

### 5.5. src/utils/platformHelper.ts

import { detectPlatform } from './platform'
import { tgShowBackButton, tgHideBackButton, tgHaptic } from './telegram'
import { maxShowBackButton, maxHideBackButton, maxHaptic } from './maxBridge'

export const showBackButton = (cb: () => void) => {
  const p = detectPlatform()
  if (p === 'telegram') tgShowBackButton(cb)
  if (p === 'max')      maxShowBackButton(cb)
}
export const hideBackButton = () => {
  const p = detectPlatform()
  if (p === 'telegram') tgHideBackButton()
  if (p === 'max')      maxHideBackButton()
}
export const haptic = (t: 'light'|'medium'|'success') => {
  const p = detectPlatform()
  if (p === 'telegram') tgHaptic(t)
  if (p === 'max')      maxHaptic(t)
}

### 5.6. src/App.tsx

import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { detectPlatform } from './utils/platform'
import { initTelegram } from './utils/telegram'
import { initMax } from './utils/maxBridge'
import { useAuthStore } from './store/authStore'

const App = () => {
  const {
    setPlatform, setInitData, isAuthenticated,
    hasCompletedInterview, hasCompletedBirthData
  } = useAuthStore()

  useEffect(() => {
    const platform = detectPlatform()
    setPlatform(platform)
    if (platform === 'telegram') {
      const d = initTelegram(); setInitData(d.initData)
    } else if (platform === 'max') {
      const d = initMax(); if (d) setInitData(d.initData)
    }
  }, [])

  return (
    <>
      <AppBackground />
      <Routes>
        <Route path="/onboarding"     element={<Onboarding />} />
        <Route path="/consent"        element={<ConsentForm />} />
        <Route path="/interview"      element={<Interview />} />
        <Route path="/birth-data"     element={<BirthDataForm />} />
        <Route path="/hd-card"        element={<HDCard />} />
        <Route path="/matches"        element={<Matches />} />
        <Route path="/matches/:id"    element={<MatchDetail />} />
        <Route path="/chat/:matchId"  element={<Chat />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/paywall"        element={<Paywall />} />
        <Route path="/data-export"    element={<DataExport />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="*" element={
          <Navigate to={
            !isAuthenticated       ? '/onboarding' :
            !hasCompletedInterview ? '/interview'  :
            !hasCompletedBirthData ? '/birth-data' :
                                     '/matches'
          } />
        } />
      </Routes>
      {isAuthenticated && hasCompletedBirthData && <BottomNav />}
    </>
  )
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 6. ЭКРАНЫ — ДЕТАЛЬНАЯ РЕАЛИЗАЦИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ПОЛНЫЙ ПОТОК ПОЛЬЗОВАТЕЛЯ:
  Onboarding → ConsentForm → Interview
  → BirthDataForm → HDCard → Matches

### 6.1. Onboarding.tsx

AppBackground + вертикальный scroll-контейнер.

[ЛОГОТИП — верх, margin-top 15vh]
  SVG логотип "Влюбви", 80px, по центру

[HERO БЛОК]
  GlassCard:
    .text-h2: "Найди человека, с которым совпадаешь
               на уровне души"
    .text-body: "Психологическое интервью · Human Design
                 · AI-матчинг"

[КНОПКИ ВХОДА — gap 10px]
  btn-primary + <Send/>:
    "Войти через Telegram"
    onClick → POST /auth/telegram
  btn-secondary + <MessageCircle/>:
    "Войти через MAX"
    Видна только если detectPlatform() === 'max'
  btn-secondary + <Phone/>:
    "По номеру телефона"
    onClick → PhoneAuthModal (bottom sheet)

[PhoneAuthModal]
  Шаг 1: TextInput type="tel"
    btn-primary: "Получить код"
    → POST /auth/phone/send-code
  Шаг 2: 6 отдельных input[1] для кода
    Автофокус между полями
    Таймер 60с "Отправить снова"
    → POST /auth/phone

[FOOTER]
  .text-caption: "Нажимая «Войти», вы соглашаетесь с"
  Ссылка → ConsentForm

Анимация: pageTransition

### 6.2. ConsentForm.tsx (152-ФЗ, 3 шага)

ШАГ 1:
  SectionTag: "ПРЕЖДЕ ЧЕМ НАЧАТЬ"
  .text-h2: "Твои данные защищены"
  GlassCard: список что храним
  Кастомный чекбокс:
    "Соглашаюсь с обработкой персональных данных"
  Ссылка: "Политика конфиденциальности →"
  btn-primary (disabled без чекбокса): "Продолжить"

ШАГ 2 (спецкатегория ПДн, ст.10 152-ФЗ):
  <ShieldCheck/> 40px, accent-warm
  .text-h2: "Психологический профиль"
  GlassCard: объяснение
  GlassCard: права пользователя (4 строки <CheckCircle/>)
  btn-primary: "Даю согласие"
  btn-secondary: "Не соглашаюсь"

ШАГ 3:
  .text-h3: "Ещё пара вопросов"
  GlassCard: два Toggle
    [Toggle] "Помочь улучшить алгоритм (обезличенно)"
    [Toggle] "Получать новости и предложения"
  btn-primary: "Начать →"
  → navigate('/interview')

### 6.3. Interview.tsx

[ФИКСИРОВАННЫЙ ВЕРХ — AgentHeader]
  Avatar-круг 44px: градиент + <Sparkles/>
  Название: "AI-агент"
  Подпись: "Твой проводник"
  Справа: ProgressBar 18 точек

[ПРОГРЕСС-ПОЛОСА под header]
  3px линия, ширина: (currentQ/18)*100%
  transition: width 400ms ease

[ПРОКРУЧИВАЕМЫЕ СООБЩЕНИЯ]
  flex column, gap 12px, padding 16px
  overflow-y auto, padding-bottom 80px
  Auto-scroll вниз при новом сообщении
  bubbleVariants анимация каждого пузырька
  TypingIndicator пока ждём YandexGPT

Первое сообщение (из agent_interview.md, вопрос 1):
  "Привет! Я здесь, чтобы лучше понять тебя —
   не оценить, а услышать. Начнём с простого:
   как выглядит твой идеальный выходной?"

[ФИКСИРОВАННЫЙ НИЗ — ChatInput]
  placeholder: "Ответить..."
  SendButton: <ArrowUpRight/>, активна при наличии текста
  haptic('light') при отправке

  Логика отправки:
  1. Мгновенно bubble-user + очистить поле
  2. TypingIndicator
  3. POST /interview/answer
  4. Скрыть TypingIndicator
  5. bubble-ai с анимацией
  При is_complete: показать финал → пауза 2с
  → navigate('/birth-data')

### 6.4. BirthDataForm.tsx

[AgentHeader — тот же агент]
  Подпись: "Последний шаг"

[ОБЪЯСНЕНИЕ — GlassCard]
  <Star/> 24px, accent-warm
  .text-h3: "Зачем нужны данные рождения?"
  .text-body: объяснение про Human Design

[StepIndicator]
  [✓ Интервью] ── [● Данные] ── [○ Карта


### 6.4. BirthDataForm.tsx (продолжение)

[ФОРМА — GlassCard]

  ── ПОЛЕ 1: Дата рождения ──────────────────────────
  .text-label: "ДАТА РОЖДЕНИЯ"
  Три поля в ряд (flex, gap 8px):
    [ДД  ] [ММ  ] [ГГГГ    ]
    type="number", inputMode="numeric"
    placeholder: "15" / "06" / "1990"
    Автофокус:
      После 2 цифр в ДД → фокус на ММ
      После 2 цифр в ММ → фокус на ГГГГ
      После 4 цифр в ГГГГ → фокус на поле времени

  Валидация (real-time):
    Год: 1940 – (currentYear - 18)
    День: 1–31 с учётом месяца
    Месяц: 1–12
    Защита от несуществующих дат:
      new Date(y, m-1, d).getDate() === d
      (ловит 30 февраля, 31 апреля и т.д.)
    Красная рамка (.form-input.error)
    Текст ошибки под полем (.text-caption, accent-error)

  ── ПОЛЕ 2: Время рождения ─────────────────────────
  .text-label: "ВРЕМЯ РОЖДЕНИЯ"
  Два поля в ряд:
    [ЧЧ  ] [ММ  ]
    type="number", min=0, max=23/59
    placeholder: "14" / "35"

  Под полями — pill-tab точности:
    [Знаю точно] [Примерно ±1ч] [Не знаю]

  Если выбрано "Не знаю":
    ЧЧ/ММ → disabled, opacity 0.4
    GlassCard.warning:
      <AlertCircle/> accent-warning
      "Без точного времени тип HD сохранится,
       но профиль линий может быть неточным.
       Уточни в свидетельстве о рождении."
    birth_time = null
    birth_time_accuracy = 'unknown'
    Fallback в калькуляторе: 12:00

  ── ПОЛЕ 3: Город рождения ─────────────────────────
  .text-label: "ГОРОД РОЖДЕНИЯ"
  TextInput с автодополнением:
    placeholder: "Начни вводить город..."
    Дебаунс 400мс → GET /geo/suggest?q={query}
    Минимум 2 символа для запроса

  Выпадающий список (GlassCard, z-index 50):
    Максимум 5 результатов
    Каждый: "Москва, Россия"
    При tap → заполнить поле, сохранить lat/lon/timezone
    border-color: var(--border-active) после выбора

  Кнопка активна ТОЛЬКО если выбран город из списка
  (есть lat/lon), не просто введён текст вручную

  .text-caption под полем:
    "Нет в списке? Выбери ближайший крупный город
     в том же часовом поясе."

[КНОПКА]
  btn-primary:
    Обычно: "Рассчитать мою карту →"
    Disabled: дата невалидна ИЛИ город не выбран
    Loading: <Loader2/> spin + "Считаю карту..."

[ПОВЕДЕНИЕ ПОСЛЕ НАЖАТИЯ]
  1. POST /hd/calculate:
     {
       birth_date:          "YYYY-MM-DD",
       birth_time:          "HH:MM" | null,
       birth_time_accuracy: "exact"|"approximate"|"unknown",
       birth_city:          "Москва",
       birth_lat:            55.7558,
       birth_lon:            37.6173,
       birth_timezone:       "Europe/Moscow"
     }
  2. Loading state в кнопке
  3. Успех → celebration: 10–12 CSS-кружков
     разлетаются из центра (чистый CSS, без библиотек)
     Длительность 0.8с
  4. pageTransition → navigate('/hd-card')
  5. Celery: find_matches_for_profile запускается

[EDGE CASES]
  Ошибка геокодинга:
    GlassCard.warning: "Город не найден. Попробуй
    написать на английском или выбери ближайший."
  Ошибка API:
    GlassCard.error: "Ошибка расчёта. Попробуй снова."
    Кнопка снова активна

[ПЕРЕСЧЁТ ИЗ ПРОФИЛЯ]
  Profile.tsx → секция "Human Design" →
  "Изменить данные рождения" → BirthDataForm
  с pre-filled значениями → POST /hd/calculate
  → Celery перезапускает матчинг

### 6.5. HDCard.tsx

[ЗАГОЛОВОК]
  SectionTag: "ТВОЯ КАРТА"
  .text-h1: "Human Design"

[КАРТОЧКА ТИПА — GlassCard]
  .text-h2: тип ("Генератор")
  .text-h3: "Профиль 4/6 · Авторитет: Сакральный"
  .text-body: краткое описание (2 предложения)
  Если birth_time_accuracy === 'unknown':
    GlassCard.warning:
      "⚠ Время рождения неизвестно —
       профиль линий приблизительный"

[SVG BODYGRAPH — HDChart компонент]
  9 центров в виде геометрических фигур:
    Голова        → △ вверх,    top-center
    Аджна         → △ вниз,     под Головой
    Горло         → □ квадрат,  центр-верх
    G-центр       → ◇ ромб,     центр
    Сердце (Эго)  → △ вниз,     справа от G
    Сакральный    → □ квадрат,  центр-низ
    Сол. Сплетение→ △ вниз,     справа-низ
    Селезёнка     → △ вверх,    слева
    Корень        → □ квадрат,  bottom-center
  Каналы: линии SVG между центрами
  Определённые: hd-center-defined
  Неопределённые: hd-center-undefined
  Активные каналы: hd-channel-active
  Tap на центр → tooltip 300ms

[АККОРДЕОН — 3 GlassCard]
  "Определённые центры" → список с описаниями
  "Активные каналы" → список
  "Ворота и линии" → теги-пилюли
  Анимация:
    initial: { height: 0, overflow: 'hidden' }
    animate: { height: 'auto' }
    transition: { duration: 0.3 }

[КНОПКА]
  btn-primary: "Посмотреть совпадения →"
  → navigate('/matches')

### 6.6. Matches.tsx

[ЗАГОЛОВОК]
  SectionTag: "ДЛЯ ТЕБЯ"
  .text-h2: "Совпадения"
  Бейдж справа: кол-во новых (accent-warm)

[PILL-TAB]
  "Все" / "Взаимные" / "Новые"

[ФИЛЬТРЫ — горизонтальный скролл]
  FilterChip: "HD-тип" / "Возраст" / "Город"

[СЕТКА — 2 колонки, gap 12px]
  MatchCard:
    Фото / градиент-плейсхолдер с буквой имени
    Имя + возраст
    compatibility-badge: "87% ❤"
    Для non-premium (>3 карточки): lock-overlay + <Lock/>
  cardVariants stagger 0.08
  Tap → MatchDetail

[ПУСТОЕ СОСТОЯНИЕ]
  GlassCard:
    <Heart/> 40px, text-muted
    .text-h3: "Ищем твои совпадения"
    .text-body: "Пришлём уведомление когда найдём"

### 6.7. MatchDetail.tsx

[HERO]
  Аватар A ← анимированная дуга → Аватар B
  Крупный % совместимости (.text-h1)
  Имена под аватарами (.text-caption)

[BREAKDOWN — горизонтальный скролл]
  3 мини-GlassCard:
    HD: XX%
    Психология: XX%
    Ценности: XX%

[ПОДРОБНОЕ ОБЪЯСНЕНИЕ — 3 GlassCard]
  Иконка + заголовок + текст:
    "Human Design"    — совместимость типов и каналов
    "Психология"      — OCEAN + стиль привязанности
    "Ценности"        — общие ценности
  GlassCard.warning при предупреждении
  (напр. оба с тревожным стилем привязанности)

[КНОПКИ]
  btn-primary: "Начать общение"
    non-premium → navigate('/paywall')
    premium → POST /matches/{id}/start → navigate('/chat/:id')
  btn-secondary: "Не мой человек"
    → POST /matches/{id}/skip

### 6.8. Chat.tsx

[ВЕРХ — UserHeader]
  <ChevronLeft/> → navigate(-1)
  Фото 40px + зелёная точка онлайн
  Имя (.text-h3)
  "онлайн" | "был(а) N мин назад"

[СООБЩЕНИЯ — WebSocket + Redis Pub/Sub]
  При открытии: GET /chat/{match_id}/messages (50 шт)
  Далее: WS /ws/chat/{match_id}
  bubble-ai (партнёр, слева) + bubble-user (я, справа)
  Timestamp под каждым сообщением

[ChatInput]
  placeholder: "Написать..."
  haptic('light') при отправке

### 6.9. Profile.tsx

[ШАПКА]
  Фото 90px circle + кнопка редактирования
  .text-h2: имя
  .text-body: возраст · город

[СЕКЦИИ — GlassCard]
  "Обо мне" — bio + редактирование
  "Human Design":
    тип + профиль
    btn-secondary: "Изменить данные рождения"
    → BirthDataForm (pre-filled)
  "Мой психологический профиль":
    Краткое текстовое описание (без цифр)
    btn-secondary: "Посмотреть подробнее →"
  "Подписка":
    Статус: Premium / Базовый
    Дата окончания
    "Управление подпиской"

[НАСТРОЙКИ — GlassCard]
  Уведомления [Toggle]
  Конфиденциальность →
  Скачать мои данные → navigate('/data-export')
  Удалить аккаунт → navigate('/delete-account')
  О приложении → WebView версии

### 6.10. Paywall.tsx

Анимация: bottomSheetVariants
Overlay с backdrop blur

[ХЭНДЛ] — 40×4px, border-radius 2px

<Diamond/> 36px, accent-warm
.text-h2: "Влюбви Premium"
.text-body: "Открой всех, с кем ты совпадаешь"

[4 ФИЧИ]
  <CheckCircle/> accent-primary:
    Все мэтчи без ограничений
    Подробная психологическая совместимость
    Начать общение с любым мэтчем
    Первым видеть новые совпадения

[ТАРИФ — GlassCard]
  .text-h1: "490 ₽"
  .text-body: "в месяц · Отмена в любой момент"

[КНОПКА]
  btn-primary: "Оформить подписку"
  → POST /payment/subscribe → T-Bank PaymentURL

.text-caption: "Оплата через T-Bank · Данные защищены"

### 6.11. DataExport.tsx (152-ФЗ)

SectionTag: "GDPR / 152-ФЗ"
.text-h2: "Мои данные"
GlassCard: список что войдёт в выгрузку
btn-secondary: "Скачать мои данные (ZIP)"
→ GET /gdpr/export

### 6.12. DeleteAccount.tsx (152-ФЗ)

[ПРОВЕРКА ПОДПИСКИ — перед формой удаления]
  Если is_premium === true И premium_until > NOW():
    GlassCard.warning:
      <AlertTriangle/> 36px, accent-warning
      "У тебя активна подписка до {premium_until}"
      .text-body:
        "После удаления аккаунта деньги за
         оставшийся период не возвращаются.
         Рекуррентные списания будут отменены."

    Два кастомных чекбокса (оба обязательны):
      ☐ "Понимаю, что подписка не компенсируется"
      ☐ "Хочу удалить аккаунт несмотря на это"

[ОСНОВНАЯ ФОРМА — активна только после чекбоксов]
  GlassCard.warning:
    <AlertTriangle/> 36px, accent-warning
    .text-h3: "Это действие необратимо"
    Список что будет удалено:
      Профиль и фотографии
      Карта Human Design
      Психологический профиль
      Все совпадения и переписки

  TextInput: "Введи УДАЛИТЬ для подтверждения"
    disabled пока не пройдены чекбоксы (если подписка есть)

  btn-danger (disabled без "УДАЛИТЬ"):
    "Удалить аккаунт навсегда"
  → DELETE /gdpr/delete
  → Выход из приложения


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 7. БАЗА ДАННЫХ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Пользователи ─────────────────────────────────
CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id          BIGINT UNIQUE,
  max_id               BIGINT UNIQUE,
  phone_encrypted      BYTEA,
  phone_hash           VARCHAR(64),
  created_at           TIMESTAMP DEFAULT NOW(),
  last_active_at       TIMESTAMP DEFAULT NOW(),
  is_active            BOOLEAN DEFAULT TRUE,
  is_premium           BOOLEAN DEFAULT FALSE,
  premium_until        TIMESTAMP,
  data_retention_until TIMESTAMP
                       DEFAULT (NOW() + INTERVAL '3 years'),
  deleted_at           TIMESTAMP,
  deletion_reason      VARCHAR(100)
);

-- ─── Согласия (152-ФЗ) ───────────────────────────
CREATE TABLE consents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_type   VARCHAR(50) NOT NULL,
  -- 'basic_processing' | 'special_category' |
  -- 'matching_algorithm' | 'ai_training' | 'marketing'
  is_granted     BOOLEAN NOT NULL,
  granted_at     TIMESTAMP,
  revoked_at     TIMESTAMP,
  policy_version VARCHAR(20) NOT NULL,
  ip_address     INET,
  user_agent     TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_consents_user
  ON consents(user_id, consent_type);

-- ─── Профили ──────────────────────────────────────
CREATE TABLE profiles (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES users(id)
                           ON DELETE CASCADE UNIQUE,
  name_encrypted           BYTEA,
  city_encrypted           BYTEA,
  bio_encrypted            BYTEA,
  age                      INT,
  gender                   VARCHAR(20),
  looking_for              VARCHAR(20),
  photos                   JSONB DEFAULT '[]',
  birth_date_encrypted     BYTEA,
  birth_time_encrypted     BYTEA,
  birth_time_accuracy      VARCHAR(15),
  -- exact | approximate | unknown
  birth_city_encrypted     BYTEA,
  birth_lat_encrypted      BYTEA,
  birth_lon_encrypted      BYTEA,
  birth_timezone_encrypted BYTEA,
  interview_completed      BOOLEAN DEFAULT FALSE,
  birth_data_completed     BOOLEAN DEFAULT FALSE,
  profile_vector           vector(384),
  updated_at               TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_profiles_vector
  ON profiles USING ivfflat (profile_vector vector_cosine_ops)
  WITH (lists = 100);

-- ─── Human Design карты ───────────────────────────
CREATE TABLE hd_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES profiles(id)
                  ON DELETE CASCADE UNIQUE,
  hd_type         VARCHAR(50),
  -- Генератор | Манифестирующий Генератор |
  -- Проектор | Манифестор | Рефлектор
  hd_profile      VARCHAR(10),   -- "4/6"
  authority       VARCHAR(50),
  -- Сакральный | Эмоциональный | Селезёночный |
  -- Эго | Я-Центр | Лунный | Нет (Рефлектор)
  defined_centers JSONB,         -- ["Throat","G","Sacral"]
  undefined_centers JSONB,
  active_channels JSONB,         -- [{"id":"34-20","name":"..."}]
  active_gates    JSONB,
  incarnation_cross VARCHAR(100),
  hd_vector       vector(64),
  calculated_at   TIMESTAMP DEFAULT NOW(),
  time_accuracy   VARCHAR(15)
);
CREATE INDEX idx_hd_vector
  ON hd_cards USING ivfflat (hd_vector vector_cosine_ops)
  WITH (lists = 50);

-- ─── Психологические профили ──────────────────────
CREATE TABLE psychological_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id)
                      ON DELETE CASCADE UNIQUE,
  -- OCEAN (0.0 – 1.0)
  openness            FLOAT,
  conscientiousness   FLOAT,
  extraversion        FLOAT,
  agreeableness       FLOAT,
  neuroticism         FLOAT,
  -- Доп. параметры
  attachment_style    VARCHAR(20),
  energy_type         VARCHAR(10),
  conflict_style      VARCHAR(20),
  top_values          JSONB,        -- ["свобода","честность",...]
  shadow_patterns     JSONB,        -- ["самопожертвование",...]
  refused_questions   JSONB,        -- [14, 16]
  confidence_score    FLOAT,
  profile_notes       TEXT,         -- внутренние заметки агента
  psych_vector        vector(128),
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_psych_vector
  ON psychological_profiles
  USING ivfflat (psych_vector vector_cosine_ops)
  WITH (lists = 100);

-- ─── Сессии интервью ──────────────────────────────
CREATE TABLE interview_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  question_index   INT DEFAULT 0,     -- 0..18
  is_complete      BOOLEAN DEFAULT FALSE,
  started_at       TIMESTAMP DEFAULT NOW(),
  completed_at     TIMESTAMP,
  messages_count   INT DEFAULT 0,
  -- Сообщения хранятся в Redis до завершения,
  -- после завершения сохраняются зашифрованными
  messages_encrypted BYTEA
);

-- ─── Мэтчи ────────────────────────────────────────
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  user_b_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  -- Итоговый скор и компоненты
  total_score     FLOAT,
  hd_score        FLOAT,
  psych_score     FLOAT,
  values_score    FLOAT,
  -- Метаданные
  is_mutual       BOOLEAN DEFAULT FALSE,
  user_a_liked    BOOLEAN DEFAULT FALSE,
  user_b_liked    BOOLEAN DEFAULT FALSE,
  user_a_skipped  BOOLEAN DEFAULT FALSE,
  user_b_skipped  BOOLEAN DEFAULT FALSE,
  explanation     JSONB,     -- детальное объяснение для UI
  warnings        JSONB,     -- предупреждения о паттернах
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)  -- нормализация пары
);
CREATE INDEX idx_matches_user_a ON matches(user_a_id, total_score DESC);
CREATE INDEX idx_matches_user_b ON matches(user_b_id, total_score DESC);

-- ─── Чаты ─────────────────────────────────────────
CREATE TABLE chat_rooms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id        UUID REFERENCES users(id),
  content_encrypted BYTEA NOT NULL,
  sent_at          TIMESTAMP DEFAULT NOW(),
  read_at          TIMESTAMP,
  is_deleted       BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_messages_room
  ON messages(room_id, sent_at DESC);

-- ─── Платежи ──────────────────────────────────────
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  amount          INT NOT NULL,          -- в копейках
  currency        VARCHAR(3) DEFAULT 'RUB',
  status          VARCHAR(20),
  -- pending | paid | failed | refunded | cancelled
  tbank_payment_id VARCHAR(100),
  tbank_order_id   VARCHAR(100),
  rebill_id        VARCHAR(100),         -- для рекуррентных
  subscription_months INT DEFAULT 1,
  paid_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);

-- ─── Аудит-лог (152-ФЗ) ──────────────────────────
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID,
  action      VARCHAR(100) NOT NULL,
  -- 'data_access' | 'data_export' | 'data_delete' |
  -- 'consent_change' | 'payment' | 'login' | ...
  entity_type VARCHAR(50),
  entity_id   UUID,
  details     JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 8. API — ПОЛНЫЙ СПИСОК ЭНДПОИНТОВ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Все эндпоинты (кроме /auth/*) требуют:
  Authorization: Bearer {access_token}
Rate limit: 60 req/min per user (slowapi)
Формат: JSON, UTF-8

── AUTH ──────────────────────────────────────────────
POST /auth/telegram
  Body: { init_data: string }
  → валидация HMAC подписи Telegram
  → возвращает access_token + refresh_token

POST /auth/max
  Body: { init_data: string }
  → валидация HMAC подписи MAX
  → возвращает access_token + refresh_token

POST /auth/phone/send-code
  Body: { phone: string }
  → отправить SMS через sms.ru
  → сохранить OTP в Redis (TTL 5 мин)

POST /auth/phone
  Body: { phone: string, code: string }
  → проверить OTP
  → возвращает access_token + refresh_token

POST /auth/refresh
  Body: { refresh_token: string }
  → возвращает новый access_token

POST /auth/logout
  → инвалидировать refresh_token в Redis

── CONSENT ───────────────────────────────────────────
POST /consent
  Body: {
    consents: [{
      type: string,
      is_granted: bool,
      policy_version: string
    }]
  }
  → сохранить с IP + user_agent + timestamp

GET /consent
  → вернуть все согласия пользователя

POST /consent/{type}/revoke
  → зафиксировать отзыв согласия

── INTERVIEW ─────────────────────────────────────────
GET /interview/status
  → { question_index, is_complete, messages_count }

POST /interview/answer
  Body: { message: string }
  → вызов ai_agent.get_next_message()
  → вернуть {
       message: string,
       is_complete: bool,
       question_index: int
     }

POST /interview/reset (admin only)
  → сбросить сессию (только для тестирования)

── PROFILE ───────────────────────────────────────────
GET  /profile/me
  → все поля профиля (расшифрованные)

PATCH /profile/me
  Body: { name?, city?, bio?, age?,
          gender?, looking_for?, photos? }

POST /profile/photo
  Content-Type: multipart/form-data
  → загрузить фото, вернуть URL

DELETE /profile/photo/{index}
  → удалить фото по индексу

── BIRTH DATA & HD ───────────────────────────────────
POST /hd/calculate
  Body: {
    birth_date:          "YYYY-MM-DD",
    birth_time:          "HH:MM" | null,
    birth_time_accuracy: "exact"|"approximate"|"unknown",
    birth_city:          string,
    birth_lat:            float,
    birth_lon:            float,
    birth_timezone:       string
  }
  → расчёт HD через hd_calculator.py
  → сохранить в hd_cards
  → Celery: find_matches_for_profile
  → вернуть полную HD-карту

GET /hd/me
  → текущая HD-карта пользователя

── GEO ───────────────────────────────────────────────
GET /geo/suggest?q={query}
  → Nominatim OSM: список городов
  → вернуть [{
       city, country, lat, lon,
       timezone, display_name
     }]
  Кэш в Redis: 24h

── MATCHES ───────────────────────────────────────────
GET /matches?tab=all|mutual|new&page=1&limit=20
  → список мэтчей с пагинацией

GET /matches/{match_id}
  → детальный мэтч с breakdown

POST /matches/{match_id}/start
  Body: {}
  → создать chat_room если нет
  → вернуть { chat_room_id }

POST /matches/{match_id}/skip
  → скрыть мэтч для пользователя

── CHAT ──────────────────────────────────────────────
GET /chat/{match_id}/messages?before={timestamp}&limit=50
  → 50 последних сообщений (расшифрованные)

WS /ws/chat/{match_id}
  Headers: Authorization: Bearer {token}
  Входящее: { type: "message", content: string }
  Исходящее: { type: "message", sender_id, content,
               sent_at, temp_id }
  Ping/pong: каждые 30с

── PAYMENT ───────────────────────────────────────────
POST /payment/subscribe
  Body: { months: 1|3|12 }
  → создать платёж в T-Bank Acquiring
  → вернуть { payment_url: string }

POST /payment/webhook (T-Bank → наш сервер)
  → проверить подпись T-Bank
  → активировать premium при success
  → сохранить rebill_id

POST /payment/cancel
  → отменить рекуррентный платёж

GET /payment/history
  → список платежей пользователя

── GDPR ──────────────────────────────────────────────
GET /gdpr/export
  → ZIP с: profile.json, interview.json,
           matches.json, messages.json
  → аудит: 'data_export'

DELETE /gdpr/delete
  Body: { confirmation: "УДАЛИТЬ" }
  → мягкое удаление (deleted_at = NOW())
  → Celery: hard_delete через 30 дней
  → аудит: 'data_delete'

POST /gdpr/portable-data
  → экспорт в машиночитаемом формате (JSON)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 9. СЕРВИСЫ — ДЕТАЛЬНАЯ РЕАЛИЗАЦИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 9.1. services/hd_calculator.py

Использует библиотеку ephem для астрологических
расчётов положения планет.

Метод calculate(birth_date, birth_time,
               birth_lat, birth_lon, birth_timezone):

Шаг 1. Определить UTC datetime
  Если birth_time = null → использовать 12:00
  Перевести local → UTC через pytz + birth_timezone

Шаг 2. Рассчитать солнечные ворота (Design + Personality)
  Personality: положение Солнца на момент рождения
  Design: положение Солнца за 88 градусов до рождения
    (≈ 88 дней)
  Планеты (10 объектов):
    Солнце, Земля, Луна, Сев.узел, Юж.узел,
    Меркурий, Венера, Марс, Юпитер, Сатурн,
    Уран, Нептун, Плутон

Шаг 3. Определить активные ворота по градусу эклиптики
  64 ворот × 6 линий = 384 деления
  Градус → ворота: round(degree / (360/64)) + 1

Шаг 4. Определить активные каналы
  Канал = пара ворот (из таблицы HD_CHANNELS)
  Активен если ОБА ворота определены (Design ИЛИ Personality)

Шаг 5. Определить определённые центры
  Центр определён если есть хотя бы один
  активный канал, проходящий через него

Шаг 6. Определить тип
  Манифестор: определён Горло + мотор (Сердце/СС/Корень)
              НЕ связаны с Сакральным
  Генератор: определён Сакральный (без связи к Горлу)
  Манифестирующий Генератор: Сакральный + Горло
  Проектор: нет Сакрального, нет связи мотор-Горло
  Рефлектор: все центры неопределены

Шаг 7. Определить профиль
  Линия = (gate_number - 1) % 6 + 1
  Профиль Personality / Профиль Design → "4/6"

Шаг 8. Определить авторитет
  Иерархия: Эмоциональный > Сакральный >
  Селезёночный > Эго > Я-Центр > Ментальный >
  Лунный (только Рефлекторы)

Шаг 9. Создать hd_vector (64-мерный)
  [0.0 или 1.0] × 64 позиции ворот

### 9.2. services/matching.py

Алгоритм матчинга:
  total_score = hd * 0.40 + psych * 0.35 + values * 0.25

HD-совместимость (0–100):
  Электромагнитные каналы (одно ворото у каждого):
    +15 баллов за каждый (макс 45)
  Совместимость типов:
    Генератор + Проектор: +20
    Манифестирующий Генератор + Проектор: +18
    Генератор + Генератор: +12
    Рефлектор + любой: +10
    Манифестор + любой: +8
  Совместимость профилей (таблица 11×11): +0..+15
  Совместимость авторитетов:
    Эмоциональный + Сакральный: +10
    Сакральный + Сакральный: +8
    другие: +5

Психологическая совместимость (0–100):
  Стиль привязанности:
    secure + любой: +25
    secure + secure: +30
    anxious + avoidant: -20 (штраф)
    anxious + anxious: -25 (штраф)
    avoidant + avoidant: -15 (штраф)
  OCEAN proximity:
    cos_similarity(psych_vector_A, psych_vector_B)
    * 50 баллов
  Конфликт-стили:
    healthy_boundary + любой: +15
    оба avoidance: -10 (штраф)
    оба merger: -15 (штраф)

Совместимость ценностей (0–100):
  len(intersection(values_A, values_B)) / 5 * 100
  (из 5 ключевых ценностей)

Warnings (предупреждения):
  Если оба anxious → добавить в matches.warnings:
    "Оба партнёра с тревожным стилем привязанности.
     Может потребоваться особое внимание к коммуникации."
  Если оба merger → аналогично

Celery задача find_matches_for_profile:
  Очередь: "matching"
  1. Получить профиль пользователя
  2. Найти кандидатов через pgvector ANN-поиск
     (top 200 по profile_vector косинусной близости)
  3. Для каждого кандидата рассчитать все скоры
  4. Отфильтровать: total_score >= 0.45
  5. Сохранить top-50 в таблицу matches
  6. Отправить push-уведомление если найдены новые мэтчи

### 9.3. services/encryption.py

from cryptography.fernet import Fernet
import os

KEY = os.environ['ENCRYPTION_KEY']  # 32 bytes, base64
fernet = Fernet(KEY)

def encrypt(data: str) -> bytes:
    return fernet.encrypt(data.encode('utf-8'))

def decrypt(data: bytes) -> str:
    return fernet.decrypt(data).decode('utf-8')

Что шифруется (Fernet AES-128):
  phone, name, city, bio,
  birth_date, birth_time, birth_city,
  birth_lat, birth_lon, birth_timezone,
  messages.content, interview_sessions.messages

Что НЕ шифруется (нужно для запросов):
  age, gender, looking_for, hd_type, hd_profile,
  все векторы, scores, timestamps, is_* флаги

### 9.4. services/tbank.py

T-Bank Acquiring API:
  URL: https://securepay.tbank.ru/v2/
  Аутентификация: HMAC-SHA256 подпись всех параметров

Создание платежа:
  POST /Init
  Params: TerminalKey, Amount (в копейках),
          OrderId, Description, SuccessURL, FailURL,
          DATA: { Phone, Email }
  → вернуть PaymentURL

Рекуррентный платёж:
  POST /Charge
  Params: TerminalKey, PaymentId, RebillId

Вебхук подтверждения:
  Проверить Token = SHA256(отсортированные params + Password)
  При Status=CONFIRMED → активировать premium
  Сохранить RebillId для следующего списания

Celery задача renew_subscriptions:
  schedule: ежедневно в 09:00 MSK
  Найти пользователей с premium_until < NOW() + 3 дня
  Выставить рекуррентный платёж через /Charge

### 9.5. services/ai_agent.py (структура)

class AIAgent:
    PROMPT: str = load_prompt("agent_interview.md")

    async def get_next_message(
        self,
        session_id: str,
        user_message: str,
        question_index: int,
        redis: Redis
    ) -> dict:
        """
        Полная реализация по алгоритму из Части 4.
        Работа с историей, Redis, YandexGPT.
        Парсинг profile_json при завершении.
        Retry-логика при 429.
        """

    async def _call_yandexgpt(
        self,
        messages: list[dict]
    ) -> str:
        """
        POST https://llm.api.cloud.yandex.net/
             foundationModels/v1/completion
        Headers: Authorization: Api-Key {YANDEX_API_KEY}
        """

    def _extract_profile_json(
        self,
        last_message: str
    ) -> dict | None:
        """
        Извлечь JSON между ```json ... ```
        Вернуть None если не найден или невалидный
        """

    def _save_history(
        self,
        session_id: str,
        history: list,
        redis: Redis
    ):
        """ Сохранить в Redis, TTL 72h """

### 9.6. Логика DELETE /gdpr/delete

async def delete_account(user_id):

  # 1. Проверить активную подписку
  if user.is_premium and user.premium_until > datetime.now():

    # Отменить рекуррентный платёж в T-Bank
    # POST /CancelSubscription с RebillId
    await tbank.cancel_recurring(user_id)

  # 2. Мягкое удаление — физически данные остаются 30 дней
  user.deleted_at  = datetime.now()
  user.is_active   = False
  user.is_premium  = False  # сразу снять premium-доступ

  # 3. Инвалидировать все токены в Redis
  await redis.delete(f"refresh:{user_id}:*")

  # 4. Поставить в очередь hard delete через 30 дней
  hard_delete_account.apply_async(
    args=[user_id],
    countdown=30 * 24 * 3600
  )

  # 5. Аудит
  await audit.log(user_id, 'account_deletion_requested')


Celery задача hard_delete_account:
  Очередь: "notifications" (или отдельная "gdpr")
  1. Проверить что deleted_at установлен
     (защита от случайного вызова)
  2. CASCADE DELETE через SQLAlchemy:
     DELETE FROM users WHERE id = user_id
     (каскадно удалит: profiles, hd_cards,
      psychological_profiles, interview_sessions,
      matches, messages, consents, payments)
  3. Удалить фото из хранилища
  4. Очистить Redis ключи пользователя
  5. Аудит: 'account_hard_deleted'
  6. Сохранить запись в audit_log на 5 лет
     (только факт удаления, без ПДн)


Что происходит в 30-дневном окне:
  Пользователь НЕ может войти (is_active = false)
  Данные физически существуют (для юридических запросов)
  Рекуррентные платежи уже отменены
  Возврат денег за остаток — бизнес-решение,
  НЕ реализуется технически, но должен быть
  прописан в Политике конфиденциальности


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 10. БЕЗОПАСНОСТЬ И 152-ФЗ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 10.1. Аутентификация

JWT RS256:
  access_token:  TTL 15 минут
  refresh_token: TTL 30 дней, однократный (rotated)
  Хранение на фронте: memory (access) + localStorage (refresh)
  Refresh: автоматически при 401 через axios interceptor

Верификация Telegram initData:
  HMAC-SHA256(data_check_string, SHA256("WebAppData" + bot_token))
  Проверить auth_date < 24h

Верификация MAX initData:
  Аналогичная HMAC-SHA256 схема по документации max.ru

### 10.2. Rate Limiting

slowapi (per IP + per user):
  /auth/*:           5 req/min
  /interview/answer: 30 req/min
  /geo/suggest:      60 req/min
  Остальные:         60 req/min

При превышении: 429 Too Many Requests
  Retry-After header: секунды до следующего слота

### 10.3. Соответствие 152-ФЗ

Локализация данных:
  ВСЕ данные хранятся на серверах РФ (Timeweb Cloud)
  Никаких внешних API, обрабатывающих ПДн
  YandexGPT: российский провайдер ✓
  T-Bank: российский провайдер ✓

Специальная категория ПДн (ст.10):
  Психологические данные → отдельное согласие ШАГ 2
  Шифрование Fernet AES-128 в покое
  TLS 1.3 в транзите

Права субъекта:
  GET /gdpr/export → право на доступ и переносимость
  DELETE /gdpr/delete → право на удаление
  POST /consent/{type}/revoke → право на отзыв
  Срок хранения: 3 года с последней активности

Аудит-лог:
  Все операции с ПДн → audit_log
  Хранение: 5 лет
  Не шифруется (нужен для проверок)

Политика конфиденциальности:
  Версионирование: policy_version в consents
  При изменении → запросить новое согласие

### 10.4. Защита API

CORS: только домены приложения + t.me + max.ru
HTTPS: только TLS 1.3 (Nginx)
Headers (Nginx):
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Content-Security-Policy: строгий
  Strict-Transport-Security: max-age=31536000

SQL-инъекции: SQLAlchemy ORM (параметризованные запросы)
XSS: React (экранирование по умолчанию)
CSRF: нет сессий (JWT stateless)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 11. ИНФРАСТРУКТУРА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 11.1. docker-compose.prod.yml (ключевые сервисы)

services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports: ["80:80", "443:443"]
    depends_on: [backend1, backend2, backend3]

  backend1: &backend
    build: ./backend
    command: >
      gunicorn app.main:app -w 3 -k uvicorn.workers.UvicornWorker
      --bind 0.0.0.0:8000 --timeout 60
    environment:
      - DATABASE_URL=postgresql+asyncpg://...@pgbouncer/vlubvi
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - YANDEX_API_KEY=${YANDEX_API_KEY}
      - YANDEX_FOLDER_ID=${YANDEX_FOLDER_ID}
      - TBANK_TERMINAL_KEY=${TBANK_TERMINAL_KEY}
      - TBANK_PASSWORD=${TBANK_PASSWORD}
      - JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY}
      - BOT_TOKEN=${BOT_TOKEN}
      - MAX_SECRET_KEY=${MAX_SECRET_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
    restart: unless-stopped

  backend2: *backend
  backend3: *backend

  pgbouncer:
    image: pgbouncer/pgbouncer
    volumes:
      - ./pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini
      - ./pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 1gb
             --maxmemory-policy allkeys-lru
    volumes: [redis_data:/data]

  celery_worker:
    build: ./backend
    command: celery -A celery_worker worker
             -Q matching,notifications,payments
             --concurrency=4 --loglevel=info

  celery_beat:
    build: ./backend
    command: celery -A celery_worker beat --loglevel=info

  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=false

### 11.2. nginx.conf (ключевые блоки)

upstream backend {
  least_conn;
  server backend1:8000;
  server backend2:8000;
  server backend3:8000;
}

server {
  listen 443 ssl http2;
  ssl_protocols TLSv1.3;
  ssl_certificate /etc/letsencrypt/live/vlubvi.ru/fullchain.pem;

  # Frontend SPA
  location / {
    root /var/www/vlubvi;
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
  }

  # API
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 60s;
  }

  # WebSocket
  location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400s;
  }
}

### 11.3. .env.example

# База данных
DATABASE_URL=postgresql+asyncpg://vlubvi:password@pgbouncer/vlubvi
POSTGRES_PASSWORD=

# Redis
REDIS_URL=redis://redis:6379

# Безопасность
ENCRYPTION_KEY=           # Fernet 32-byte base64
JWT_PRIVATE_KEY=          # RSA 2048 PEM
JWT_PUBLIC_KEY=           # RSA 2048 PEM

# Платформы
BOT_TOKEN=                # Telegram Bot Token
MAX_SECRET_KEY=           # MAX App Secret

# LLM
YANDEX_API_KEY=           # YandexGPT API Key
YANDEX_FOLDER_ID=         # Yandex Cloud Folder ID

# Платежи
TBANK_TERMINAL_KEY=
TBANK_PASSWORD=

# SMS
SMS_RU_API_KEY=

# Мониторинг
SENTRY_DSN=
PROMETHEUS_PORT=9090

# Настройки интервью
LLM_MAX_CONCURRENT=50     # Redis semaphore
LLM_TEMPERATURE=0.72
LLM_MAX_TOKENS=500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 12. ТЕСТЫ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tests/test_hd_calculator.py:
  test_generator_type()         — расчёт типа Генератор
  test_projector_type()         — расчёт типа Проектор
  test_reflector_type()         — все центры неопределены
  test_profile_4_6()            — правильный профиль
  test_unknown_birth_time()     — fallback 12:00
  test_channel_activation()     — активация канала по воротам
  test_defined_centers()        — определённые центры

tests/test_matching.py:
  test_score_calculation()      — итоговый скор
  test_em_channel_bonus()       — электромагнитный бонус
  test_anxious_anxious_penalty()— штраф за паттерн
  test_secure_bonus()           — бонус secure стиля
  test_values_intersection()    — совместимость ценностей
  test_vector_similarity()      — cosine similarity

tests/test_auth.py:
  test_telegram_initdata_valid()
  test_telegram_initdata_expired()
  test_telegram_initdata_tampered()
  test_max_initdata_valid()
  test_phone_otp_flow()
  test_jwt_refresh()

tests/test_payment.py:
  test_tbank_webhook_valid()
  test_tbank_webhook_tampered()
  test_subscription_activation()
  test_recurring_charge()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 13. ПОРЯДОК РЕАЛИЗАЦИИ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Реализовывать строго в этом порядке:

ФАЗА 1 — Фундамент (не менять порядок):
  1.  docker-compose.yml + .env
  2.  PostgreSQL схема + Alembic миграции
  3.  Redis конфигурация
  4.  services/encryption.py
  5.  core/security.py (JWT)
  6.  routers/auth.py (Telegram + MAX + Phone)
  7.  Базовые тесты auth

ФАЗА 2 — Дизайн-система:
  8.  src/styles/* (все CSS токены)
  9.  Все UI компоненты (src/components/ui/*)
  10. AppBackground + анимации

ФАЗА 3 — Онбординг и согласия:
  11. Onboarding.tsx + ConsentForm.tsx
  12. routers/consent.py
  13. authStore.ts + client.ts

ФАЗА 4 — AI-агент и интервью:
  14. backend/prompts/agent_interview.md
  15. services/ai_agent.py (YandexGPT интеграция)
  16. routers/interview.py
  17. Interview.tsx
  18. interviewStore.ts

ФАЗА 5 — Human Design:
  19. services/hd_calculator.py
  20. routers/birth_data.py + routers/geo.py + routers/hd.py
  21. BirthDataForm.tsx
  22. HDCard.tsx + компонент HDChart.tsx
  23. birthDataStore.ts
  24. Тесты HD калькулятора

ФАЗА 6 — Матчинг:
  25. services/matching.py
  26. Celery задача find_matches_for_profile
  27. routers/matches.py
  28. Matches.tsx + MatchDetail.tsx + MatchCard.tsx
  29. matchStore.ts
  30. Тесты матчинга

ФАЗА 7 — Чат:
  31. WebSocket менеджер (Redis Pub/Sub)
  32. routers/chat.py
  33. Chat.tsx

ФАЗА 8 — Монетизация:
  34. services/tbank.py
  35. routers/payment.py
  36. Paywall.tsx
  37. Profile.tsx + настройки подписки
  38. Тесты платежей

ФАЗА 9 — GDPR и профиль:
  39. routers/gdpr.py
  40. DataExport.tsx + DeleteAccount.tsx
  41. services/audit.py
  42. Profile.tsx (полный)

ФАЗА 10 — DevOps и деплой:
  43. docker-compose.prod.yml
  44. nginx.conf (SSL + WebSocket + балансировка)
  45. PgBouncer конфигурация
  46. Prometheus + Grafana дашборды
  47. Celery Beat расписание
  48. Let's Encrypt Certbot автообновление
  49. Финальные интеграционные тесты

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ВАЖНЫЕ ТЕХНИЧЕСКИЕ ОГРАНИЧЕНИЯ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MAX Bridge: ТОЛЬКО CDN (https://st.max.ru/js/max-web-app.js)
   НЕ npm, НЕ @vkontakte/vk-bridge — это разные продукты

2. Шрифты: ТОЛЬКО npm (@fontsource/*)
   НЕ Google Fonts CDN — MiniApp должен работать оффлайн

3. Framer Motion: ТОЛЬКО для анимаций из п.1.5
   НЕ использовать для layout, form, drag

4. Все ПДн: ТОЛЬКО серверы РФ
   НЕ Vercel, НЕ AWS, НЕ Cloudflare Workers

5. Промпт агента: backend/prompts/agent_interview.md
   НЕ хардкодить в Python — всегда читать из файла

6. pgvector индексы: создать ПОСЛЕ вставки данных
   (DROP INDEX → bulk insert → CREATE INDEX CONCURRENTLY)

7. WebSocket: Redis Pub/Sub для масштабирования
   (3 инстанса бэкенда должны видеть сообщения друг друга)

8. T-Bank вебхук: проверять подпись ДО любой бизнес-логики

9. Удаление аккаунта: мягкое (deleted_at) → hard delete
   через 30 дней Celery задачей (дать время на отзыв)

10. Интервью: вопросы 1 и 18 — неизменные якорные точки,
    вопросы 2–17 — адаптировать на основе ответов

