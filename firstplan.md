
Ты — senior full-stack разработчик и DevOps-инженер.

Создай фундамент production-ready приложения ВЛЮБВИ (Vlubvi) — приложения для знакомств с AI-агентом и матчингом по Human Design.

Платформы: Telegram MiniApp + MAX MiniApp (max.ru).
Хостинг: Timeweb Cloud (серверы РФ, 152-ФЗ).
Архитектура рассчитана на 10 000–50 000 одновременных пользователей.

Реализуй строго в этом порядке:

1. docker-compose.yml (dev) со следующими сервисами:
   - postgres (PostgreSQL 15 + pgvector + pgcrypto)
   - redis (Redis 7, appendonly, maxmemory 1gb, allkeys-lru)
   - backend (FastAPI, Uvicorn)
   - pgbouncer (transaction mode, перед postgres)
   
2. .env.example с переменными:
   DATABASE_URL, POSTGRES_PASSWORD, REDIS_URL,
   ENCRYPTION_KEY (Fernet 32-byte base64),
   JWT_PRIVATE_KEY, JWT_PUBLIC_KEY (RSA 2048 PEM),
   BOT_TOKEN, MAX_SECRET_KEY,
   YANDEX_API_KEY, YANDEX_FOLDER_ID,
   TBANK_TERMINAL_KEY, TBANK_PASSWORD,
   SMS_RU_API_KEY, SENTRY_DSN,
   LLM_MAX_CONCURRENT=50, LLM_TEMPERATURE=0.72, LLM_MAX_TOKENS=500

3. backend/app/database.py — async SQLAlchemy 2.0 + asyncpg

4. backend/app/config.py — Pydantic v2 Settings, читает из .env

5. PostgreSQL схема (Alembic миграции) — следующие таблицы:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

users: id UUID PK, telegram_id BIGINT UNIQUE, max_id BIGINT UNIQUE,
phone_encrypted BYTEA, phone_hash VARCHAR(64),
created_at TIMESTAMP, last_active_at TIMESTAMP,
is_active BOOL DEFAULT TRUE, is_premium BOOL DEFAULT FALSE,
premium_until TIMESTAMP, deleted_at TIMESTAMP

profiles: id UUID PK, user_id UUID FK users,
name VARCHAR(50), birth_year SMALLINT, gender VARCHAR(10),
city VARCHAR(100), bio TEXT, photo_url TEXT,
is_visible BOOL DEFAULT TRUE

hd_cards: id UUID PK, user_id UUID FK users,
hd_type VARCHAR(20), profile_line VARCHAR(10),
authority VARCHAR(30), defined_centers JSONB,
active_channels JSONB, gates JSONB,
birth_date DATE, birth_time TIME, birth_time_accuracy VARCHAR(20),
birth_city VARCHAR(100), birth_lat FLOAT, birth_lon FLOAT,
birth_timezone VARCHAR(50), calculated_at TIMESTAMP

psychological_profiles: id UUID PK, user_id UUID FK users,
openness FLOAT, conscientiousness FLOAT, extraversion FLOAT,
agreeableness FLOAT, neuroticism FLOAT,
attachment_style VARCHAR(20), energy_type VARCHAR(10),
conflict_style VARCHAR(20), top_values JSONB,
shadow_patterns JSONB, refused_questions JSONB,
confidence_score FLOAT, profile_notes TEXT,
embedding vector(384), completed_at TIMESTAMP

interview_sessions: id UUID PK, user_id UUID FK users,
status VARCHAR(20), current_question_index INT DEFAULT 0,
started_at TIMESTAMP, completed_at TIMESTAMP

matches: id UUID PK, user_a UUID FK users, user_b UUID FK users,
compatibility_score FLOAT, hd_score FLOAT,
psychology_score FLOAT, values_score FLOAT,
breakdown JSONB, status VARCHAR(20) DEFAULT 'pending',
created_at TIMESTAMP

messages: id UUID PK, match_id UUID FK matches,
sender_id UUID FK users, content_encrypted BYTEA,
created_at TIMESTAMP, read_at TIMESTAMP

payments: id UUID PK, user_id UUID FK users,
tbank_payment_id VARCHAR(100), rebill_id VARCHAR(100),
amount INT, status VARCHAR(20), created_at TIMESTAMP

consents: id UUID PK, user_id UUID FK users,
consent_type VARCHAR(50), granted BOOL,
policy_version VARCHAR(10), granted_at TIMESTAMP, revoked_at TIMESTAMP

audit_log: id UUID PK, user_id UUID,
action VARCHAR(100), meta JSONB, created_at TIMESTAMP

6. backend/app/core/security.py — JWT RS256:
   - access_token TTL 15 минут
   - refresh_token TTL 30 дней, однократный (rotated)
   - Верификация Telegram initData через HMAC-SHA256
   - Верификация MAX initData по аналогичной схеме

7. backend/app/services/encryption.py — Fernet AES шифрование:
   encrypt(data: str) → bytes
   decrypt(data: bytes) → str
   hash_phone(phone: str) → str (SHA-256)

8. backend/app/routers/auth.py — эндпоинты:
   POST /auth/telegram — принять initData, проверить подпись, создать/найти юзера, вернуть JWT
   POST /auth/max — аналогично для MAX
   POST /auth/phone/send-code — отправить SMS через sms.ru API
   POST /auth/phone — проверить код, вернуть JWT
   POST /auth/refresh — обновить access_token
   POST /auth/logout

9. backend/app/core/rate_limiter.py — slowapi:
   /auth/*: 5 req/min per IP
   /interview/answer: 30 req/min per user
   /geo/suggest: 60 req/min per IP
   Остальные: 60 req/min per user

10. backend/app/main.py — FastAPI app:
    CORS: только t.me, max.ru, localhost
    Подключить все роутеры
    Prometheus метрики (/metrics)
    Sentry интеграция
    structlog JSON логирование

11. backend/tests/test_auth.py:
    test_telegram_initdata_valid()
    test_telegram_initdata_expired()
    test_telegram_initdata_tampered()
    test_max_initdata_valid()
    test_phone_otp_flow()
    test_jwt_refresh()

Стек бэкенда: Python 3.11, FastAPI async, SQLAlchemy 2.0 async ORM,
asyncpg, Alembic, Redis 7, python-jose RS256, passlib+bcrypt,
pydantic v2, slowapi, structlog, httpx, Fernet.

🎨 КУСОК 2 — Фаза 2: Дизайн-система

Ты — senior frontend разработчик и UI/UX дизайнер.

Реализуй полную дизайн-систему для приложения ВЛЮБВИ (Vlubvi).
Стиль: тёплый минимализм + glassmorphism.

Стек: React 18 + TypeScript, Vite, TailwindCSS + CSS Variables,
@fontsource/manrope + @fontsource/inter (npm, НЕ CDN),
framer-motion (только для анимаций), lucide-react.

Создай следующие файлы:

--- src/styles/tokens.css ---
:root {
  --bg-primary: #0d1f1a;
  --bg-secondary: #142920;
  --bg-card: rgba(255, 255, 255, 0.07);
  --bg-card-hover: rgba(255, 255, 255, 0.11);
  --bg-input: rgba(255, 255, 255, 0.08);
  --gradient-main: linear-gradient(160deg, #0d1f1a 0%, #1a3028 40%, #2d3a2e 65%, #c4956a 85%, #e8c99a 100%);
  --gradient-card: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
  --gradient-accent: linear-gradient(90deg, #4a9e7f 0%, #7bc4a0 100%);
  --gradient-warm: linear-gradient(90deg, #c4956a 0%, #e8c99a 100%);
  --accent-primary: #4a9e7f;
  --accent-secondary: #7bc4a0;
  --accent-warm: #c4956a;
  --accent-gold: #d4a843;
  --accent-warning: #e8a030;
  --accent-error: #e05555;
  --text-primary: #f0f4f2;
  --text-secondary: rgba(240, 244, 242, 0.65);
  --text-muted: rgba(240, 244, 242, 0.40);
  --text-on-accent: #ffffff;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-card: rgba(255, 255, 255, 0.12);
  --border-active: rgba(74, 158, 127, 0.50);
  --border-warning: rgba(232, 160, 48, 0.50);
  --border-error: rgba(224, 85, 85, 0.50);
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.25);
  --shadow-button: 0 4px 16px rgba(74, 158, 127, 0.30);
  --shadow-bottom-nav: 0 -8px 32px rgba(0, 0, 0, 0.30);
  --radius-xs: 8px; --radius-sm: 12px; --radius-md: 16px;
  --radius-lg: 20px; --radius-xl: 28px; --radius-pill: 9999px;
  --transition-fast: 150ms ease; --transition-normal: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --blur-card: blur(16px); --blur-nav: blur(20px); --blur-modal: blur(24px);
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 16px);
}

--- src/styles/typography.css ---
Шрифты через npm: @fontsource/manrope (400,600,700) + @fontsource/inter (400,500)
Импорт в src/main.tsx (НЕ CDN).
Классы: .text-h1 (28px/700/Manrope), .text-h2 (22px/600/Manrope),
.text-h3 (17px/600/Manrope), .text-body (15px/400/Inter),
.text-caption (13px/400/Inter), .text-label (12px/500/Inter, uppercase)

--- src/styles/global.css ---
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
body { margin: 0; background: var(--bg-primary); overflow: hidden; height: 100dvh; }
input, textarea { user-select: text; }
#root { height: 100dvh; display: flex; flex-direction: column; overflow: hidden; }
.page-content { flex: 1; overflow-y: auto; overflow-x: hidden;
  padding-top: var(--safe-top); padding-bottom: calc(72px + var(--safe-bottom));
  -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.page-content::-webkit-scrollbar { display: none; }

--- src/utils/animations.ts ---
Экспортировать framer-motion Variants:
pageTransition: initial {opacity:0, y:16} → animate {opacity:1, y:0}, duration 0.28
cardVariants: hidden {opacity:0, y:20} → visible с stagger delay i*0.08
bubbleVariants: hidden {opacity:0, y:10, scale:0.95} → visible duration 0.2
bottomSheetVariants: hidden {y:'100%'} → visible {y:0} duration 0.35

--- src/components/ui/ --- (создать все компоненты):

AppBackground.tsx — два анимированных blob-кружка с @keyframes blobPulse,
фон var(--gradient-main), position fixed, zIndex -1

GlassCard.tsx — background var(--bg-card), backdrop-filter var(--blur-card),
border 1px solid var(--border-card), border-radius var(--radius-lg),
box-shadow var(--shadow-card). Варианты: default | warning | error.
:active → scale(0.985)

Button.tsx — три варианта: btn-primary (gradient-accent, pill, shadow-button),
btn-secondary (glass), btn-danger (border-error). Все 100% ширины.
:active → scale(0.97). disabled → opacity 0.4.

BottomNav.tsx — 5 вкладок: Home/"Главная", Timer/"Интервью" (скрыта после завершения),
Sparkles/"AI-агент" (центральная), Diamond/"Мэтчи", User/"Профиль".
position fixed bottom-0, backdrop-filter blur-nav, z-index 100.
Активная вкладка: GlassCard + accent-primary цвет иконки и текста.
.nav-badge (dot accent-warm) для непрочитанных.

Toggle.tsx — 44×24px трек, 20×20px thumb. Off: border-subtle. On: gradient-accent.
Transition: translateX(20px) за --transition-normal.

TextInput.tsx — bg-input, border-subtle → border-active при focus.
border-error при error. Placeholder: text-muted.

FilterChip.tsx — glass + pill, .active → gradient-accent, border transparent.

SectionTag.tsx — rgba(74,158,127,0.15) фон, accent-secondary текст,
border rgba(74,158,127,0.25), pill, uppercase, 11px.

ProgressBar.tsx — flex row, N точек-линий (height 3px).
Состояния: completed (gradient-accent), current (accent-warm), pending (border-subtle).

StepIndicator.tsx — 3 кружка 32×32px + линии между ними.
done: gradient-accent, active: accent-warm, pending: bg-card + border-card.

--- src/components/chat/ ---

ChatBubble.tsx — bubble-ai (стекло, слева, radius lg lg lg xs) и
bubble-user (gradient-accent, справа, radius lg lg xs lg). max-width 85%.
Timestamp под сообщением, 11px, rgba(240,244,242,0.45).

TypingIndicator.tsx — 3 точки 6px с анимацией typingBounce (translateY -6px),
delays 0s/0.2s/0.4s. Стиль bubble-ai.

ChatInput.tsx — flex row, textarea pill bg-input. SendButton 44×44px,
при hasText → gradient-accent + shadow-button. :active scale(0.92).

AgentHeader.tsx — Avatar 44px gradient + Sparkles иконка. "AI-агент" + "Твой проводник".

UserHeader.tsx — ChevronLeft, фото 40px + зелёная точка онлайн, имя, статус.

--- src/components/matches/ ---

MatchCard.tsx — aspect-ratio 3/4, фото 70% высоты. Градиент-оверлей снизу.
compatibility-badge (gradient-accent, pill, 12px). lock-overlay для non-premium.

CompatScore.tsx — отображение процента с иконкой и лейблом.

--- src/components/hd/ ---

HDChart.tsx — SVG Bodygraph, 9 центров (геометрические фигуры по позициям):
Голова △вверх, Аджна △вниз, Горло □, G-центр ◇, Сердце △вниз,
Сакральный □, Сол.Сплетение △вниз, Селезёнка △вверх, Корень □.
hd-center-defined: fill accent-primary opacity 0.85.
hd-center-undefined: fill transparent, stroke rgba(255,255,255,0.15).
Каналы: hd-channel-active (accent-primary, stroke-width 2) /
hd-channel-inactive (rgba(255,255,255,0.10)).
Tap на центр → tooltip.

--- src/components/payment/ ---
SubscribeModal.tsx — bottom sheet с bottomSheetVariants, backdrop blur overlay.


🚀 КУСОК 3 — Фаза 3: Онбординг и согласия
Ты — senior full-stack разработчик.

Реализуй онбординг, авторизацию и форму согласий (152-ФЗ) для приложения ВЛЮБВИ.

Дизайн-система уже реализована (GlassCard, Button, Toggle, SectionTag, TextInput и т.д.).
Стек фронтенда: React 18, TypeScript, Vite, Zustand, React Router v6.
Стек бэкенда: FastAPI, SQLAlchemy 2.0 async, Redis, JWT RS256.

--- src/utils/platform.ts ---
type Platform = 'telegram' | 'max' | 'web'
detectPlatform(): проверить window.Telegram?.WebApp?.initData → 'telegram',
window.WebApp !== undefined || URL содержит 'max_app' → 'max', иначе 'web'
getPlatformUserId(): вернуть userId из соответствующего SDK

--- src/utils/telegram.ts ---
import WebApp from '@twa-dev/sdk'
initTelegram(): WebApp.ready(), expand(), setHeaderColor('#0d1f1a'), setBackgroundColor('#0d1f1a')
tgShowBackButton(cb), tgHideBackButton()
tgShowMainButton(text, cb), tgHideMainButton()
tgHaptic(type: 'light'|'medium'|'success')

--- src/utils/maxBridge.ts ---
ВАЖНО: MAX Bridge подключается ТОЛЬКО через CDN (НЕ npm, НЕ @vkontakte/vk-bridge)
CDN скрипт: https://st.max.ru/js/max-web-app.js — добавить в index.html только если платформа MAX.
Полная TypeScript декларация window.WebApp с методами:
ready, close, requestContact, openLink, openMaxLink, shareContent,
enableClosingConfirmation, BackButton (show/hide/onClick/offClick),
HapticFeedback (impactOccurred/notificationOccurred/selectionChanged),
ScreenCapture (enable/disable), onEvent, offEvent.
initMax(), maxShowBackButton(cb), maxHideBackButton(), maxHaptic(type), maxRequestPhone(onResult)

--- src/utils/platformHelper.ts ---
showBackButton(cb), hideBackButton(), haptic(type) — роутят на telegram или max по detectPlatform()

--- index.html ---
<!DOCTYPE html><html lang="ru"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Влюбви</title>
<!-- MAX Bridge: CDN только если платформа MAX, НЕ npm -->
<script>
(function() {
  var isMax = window.location.search.indexOf('max_app') !== -1 ||
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
<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>

--- src/store/authStore.ts (Zustand) ---
Поля: userId, platform, initData, isAuthenticated,
hasCompletedInterview, hasCompletedBirthData, isPremium, premiumUntil
Actions: setPlatform, setInitData, setAuthenticated, setInterviewComplete,
setBirthDataComplete, setPremium, logout

--- src/api/client.ts ---
axios instance с baseURL /api
Interceptor: при 401 → POST /auth/refresh с refresh token из localStorage
При успехе → повторить запрос. При ошибке → logout + navigate('/onboarding')

--- src/pages/Onboarding.tsx ---
AppBackground + вертикальный scroll.
[ЛОГОТИП] SVG "Влюбви" 80px по центру, margin-top 15vh
[HERO] GlassCard: .text-h2 "Найди человека, с которым совпадаешь на уровне души"
.text-body "Психологическое интервью · Human Design · AI-матчинг"
[КНОПКИ]:
btn-primary + Send иконка: "Войти через Telegram" → POST /auth/telegram с initData
btn-secondary + MessageCircle: "Войти через MAX" (только если detectPlatform()==='max')
btn-secondary + Phone: "По номеру телефона" → открыть PhoneAuthModal (bottom sheet)
[PhoneAuthModal]:
  Шаг 1: TextInput type="tel" + btn-primary "Получить код" → POST /auth/phone/send-code
  Шаг 2: 6 отдельных input[maxLength=1], автофокус между полями, таймер 60с "Отправить снова"
  → POST /auth/phone → при успехе navigate('/consent')
[FOOTER] .text-caption "Нажимая «Войти», вы соглашаетесь с" + ссылка на ConsentForm
Анимация: pageTransition

--- src/pages/ConsentForm.tsx --- (152-ФЗ, 3 шага)
ШАГ 1: SectionTag "ПРЕЖДЕ ЧЕМ НАЧАТЬ", .text-h2 "Твои данные защищены"
GlassCard список что храним (имя, дата рождения, психологический профиль, переписки)
Кастомный чекбокс: "Соглашаюсь с обработкой персональных данных"
Ссылка "Политика конфиденциальности →"
btn-primary (disabled без чекбокса): "Продолжить" → POST /consent/pdp

ШАГ 2 (ст.10 152-ФЗ, спецкатегория):
ShieldCheck иконка 40px accent-warm
.text-h2 "Психологический профиль"
GlassCard: объяснение что анализируем через интервью
GlassCard: права: удалить в любой момент, скачать свои данные,
отозвать согласие, данные не продаются
btn-primary "Даю согласие" → POST /consent/psychological
btn-secondary "Не соглашаюсь" → объяснить что без этого матчинг невозможен

ШАГ 3:
.text-h3 "Ещё пара вопросов"
GlassCard: два Toggle:
  "Помочь улучшить алгоритм (обезличенно)" — POST /consent/analytics
  "Получать новости и предложения" — POST /consent/marketing
btn-primary "Начать →" → navigate('/interview')

--- backend/app/routers/consent.py ---
POST /consent/{type} — типы: pdp, psychological, analytics, marketing
  Сохранить в consents с policy_version, granted=true, granted_at
POST /consent/{type}/revoke
  Обновить consents: granted=false, revoked_at=NOW()
  Аудит: action='consent_revoked'
GET /consent/status — вернуть текущие согласия пользователя

🤖 КУСОК 4 — Фаза 4: AI-агент и интервью

Ты — senior full-stack разработчик.

Реализуй AI-агента-интервьюера и экран интервью для приложения ВЛЮБВИ.
LLM: YandexGPT Pro. Инструкции агента загружаются из файла, не хардкодятся.

--- backend/prompts/agent_interview.md ---
Создай ОТДЕЛЬНЫЙ файл с полными инструкциями AI-агента.

Роль: тёплый, внимательный собеседник. НЕ психолог с протоколом.
Тон: как будто сидите за чашкой чая поздно вечером.

Жёсткие правила:
1. ОДИН вопрос за раз — никогда два в одном сообщении
2. После каждого ответа — короткое отражение (1-2 предложения), затем вопрос
3. Следующий вопрос строить на основе ответа, НЕ по скрипту механически
4. Никогда не оценивать, не критиковать, не советовать
5. Никогда не говорить "отличный ответ", "здорово", "интересно" — фальшиво
6. Язык живой, тёплый, без психологического жаргона
7. Короткий ответ → "Расскажи чуть подробнее?"
8. Вопрос в ответ → коротко ответить, вернуть свой вопрос
9. Никогда не раскрывать что именно измеряешь
10. Тон: чай поздно вечером, первый настоящий разговор

Структура: 18 вопросов, 3 уровня глубины.

УРОВЕНЬ 1 — Разогрев (вопросы 1-5):
ВОПРОС 1 (неизменный): "Привет! Я здесь, чтобы лучше понять тебя — не оценить, а услышать. Начнём с простого: как выглядит твой идеальный выходной?"
Измеряем: extraversion, energy_type
ВОПРОС 2: "А если этот выходной — с близким человеком, как это выглядит?"
Если партнёр уже упомянут в вопросе 1 → "Тебе бывает нужно время только для себя, как часто?"
Измеряем: attachment_style, energy_type
ВОПРОС 3: "Что тебя быстрее выматывает: долго быть с людьми или долго быть одному?"
Уточнение при неопределённом ответе: "А после большой вечеринки — заряжаешься или нужно восстановиться?"
Измеряем: extraversion
ВОПРОС 4: "Опиши момент, когда ты чувствовал(а) себя по-настоящему в своей тарелке. Что происходило вокруг?"
Измеряем: values, energy_type, conscientiousness
ВОПРОС 5: "Как ты обычно принимаешь важные решения — долго взвешиваешь или действуешь по ощущению?"
Уточнение: "А в отношениях — ты скорее осторожен(на) или быстро сближаешься?"
Измеряем: conscientiousness, energy_type

УРОВЕНЬ 2 — Ценности и паттерны (вопросы 6-13):
ВОПРОС 6: "Представь: ты помог(ла) близкому, потратил(а) время и силы. А внутри что-то сжалось. Что именно там было?"
Измеряем: agreeableness, attachment_style, conflict_style
ВОПРОС 7: "Партнёр отменил общие планы в последний момент. Что ты чувствуешь через час после этого?"
Обида/тревога → тревожный; Облегчение → избегающий. Измеряем: attachment_style
ВОПРОС 8: "Вспомни момент, когда тебе было по-настоящему хорошо рядом с кем-то — без слов, просто рядом."
Если такого не было → "Как тебе лучше всего чувствуется близость?"
Измеряем: attachment_style (secure), values
ВОПРОС 9: "Что важнее в паре: когда тебя понимают, или когда дают пространство?"
Уточнение: "Замечаешь, что иногда хочется и того и другого?"
Измеряем: attachment_style, conflict_style
ВОПРОС 10: "Расскажи о человеке, с которым было по-настоящему легко. Что в нём было такого?"
Свободный вопрос — не перебивать. Измеряем: values, compatibility_patterns
ВОПРОС 11: "Что в людях раздражает тебя быстрее всего? Такое — сразу нет, не моё."
Измеряем: shadow_patterns (проекция), top_values (обратная сторона)
ВОПРОС 12: "Когда в отношениях трудно — идёшь навстречу, отступаешь или держишь позицию?"
Уточнение при "зависит": "А если тема важна — что тогда?"
Измеряем: conflict_style
ВОПРОС 13: "Что ты обычно скрываешь от партнёра дольше всего?"
Деликатный. При уклонении: "Может что-то о себе, о чём не говоришь сразу?"
Измеряем: openness, shadow_patterns

УРОВЕНЬ 3 — Теневые паттерны (вопросы 14-18):
Перед вопросом 14 добавить: "Ты хорошо отвечаешь. Хочу спросить кое-что поглубже — если что-то некомфортно, просто скажи."
ВОПРОС 14 (проективный): "Заверши фразу: в отношениях я всегда в итоге..."
Измеряем: attachment_style, shadow_patterns, conflict_style
ВОПРОС 15: "Если бы партнёр, который хорошо тебя знает, описал тебя одной честной фразой — что бы он сказал?"
Уточнение: "А тот, у кого не получилось — что бы сказал он?"
Измеряем: self-awareness, openness
ВОПРОС 16: "Есть ли что-то, что ты несёшь в себе — о чём мало кто знает, но что сильно на тебя влияет?"
При уклонении: "Хорошо, не нужно."
Измеряем: shadow_patterns, openness, neuroticism
ВОПРОС 17: "Что для тебя означает быть по-настоящему любимым? Не на словах, а в действиях?"
Измеряем: love_language, attachment_style, values
ВОПРОС 18 (неизменный, завершающий): "И последнее. Зачем ты здесь — чего ты на самом деле ищешь? Не то что принято говорить, а то что внутри."
После ответа: "Спасибо, что доверился(лась) мне. Ты говорил(а) честно — это редкость. Составляю твой профиль..."
Измеряем: top_values, relationship_goal, self_awareness

Обработка нестандартных ситуаций:
- Одно слово / "не знаю": "А если попробовать угадать — что бы пришло первым?"
- Очень длинный ответ: выбрать ОДНУ деталь для отражения
- Расспрашивает тебя: 1 предложение + "Но сейчас мне интереснее ты..."
- Грустно/тяжело: "Слышу тебя. Хочешь продолжить или сделать паузу?"
- Отказ отвечать: "Хорошо, пропустим." Зафиксировать в refused_questions.
- Агрессия: "Слышу, что что-то задело. Можем поговорить об этом или двигаться дальше."

Финальный JSON (НЕ показывать пользователю, вернуть в profile_json):
{
  "openness": 0.0-1.0,
  "conscientiousness": 0.0-1.0,
  "extraversion": 0.0-1.0,
  "agreeableness": 0.0-1.0,
  "neuroticism": 0.0-1.0,
  "attachment_style": "secure|anxious|avoidant|disorganized",
  "energy_type": "fast|slow|variable",
  "conflict_style": "avoidance|merger|healthy_boundary",
  "top_values": ["value1","value2","value3","value4","value5"],
  "shadow_patterns": ["pattern1","pattern2"],
  "refused_questions": [14],
  "confidence_score": 0.0-1.0,
  "profile_notes": "Краткое резюме на русском"
}

top_values выбирать из: свобода, безопасность, развитие, стабильность, честность, юмор, глубина, лёгкость, верность, независимость, принятие, страсть, покой, приключения, семья, карьера, творчество, духовность, дружба, интеллект
shadow_patterns выбирать из: самопожертвование, гиперконтроль, избегание близости, страх быть брошенным, нужда в одобрении, перфекционизм, пассивная агрессия, эмоциональное закрытие, зависимость от отношений, страх конфликта, нарциссические черты

--- backend/app/services/ai_agent.py ---
from pathlib import Path
PROMPTS_DIR = Path(__file__).parent.parent / "prompts"
def load_prompt(filename: str) -> str: return (PROMPTS_DIR / filename).read_text(encoding="utf-8")
INTERVIEW_PROMPT = load_prompt("agent_interview.md")

class AIAgent:
  async def get_next_message(self, session_id, user_message, question_index, redis) -> dict:
    """
    1. Загрузить историю из Redis (ключ: interview:{session_id})
    2. Если история пуста → создать системное сообщение из INTERVIEW_PROMPT
    3. Добавить user_message в историю
    4. Redis semaphore (makс LLM_MAX_CONCURRENT=50)
    5. POST https://llm.api.cloud.yandex.net/foundationModels/v1/completion
       Headers: Authorization: Api-Key {YANDEX_API_KEY}
       Body: {
         modelUri: "gpt://{FOLDER_ID}/yandexgpt-pro",
         completionOptions: {stream: false, temperature: 0.72, maxTokens: 500},
         messages: history
       }
    6. Retry при 429: backoff 1s→2s→4s (макс 3 попытки)
    7. Добавить ответ агента в историю
    8. Сохранить историю в Redis (TTL 72h)
    9. При question_index == 18 → извлечь JSON между ```json ... ``` → вернуть в profile_json
    10. Вернуть: {message: str, is_complete: bool, question_index: int, profile_json: dict|null}
    """
  
  async def _call_yandexgpt(self, messages: list[dict]) -> str: ...
  def _extract_profile_json(self, last_message: str) -> dict | None: ...
  def _save_history(self, session_id, history, redis): ...

--- backend/app/routers/interview.py ---
POST /interview/start — создать interview_session, вернуть первое сообщение агента
POST /interview/answer — {session_id, message} → ai_agent.get_next_message()
  При is_complete=True → сохранить profile_json в psychological_profiles
  Создать embedding (all-MiniLM-L6-v2 или аналог) для вектора матчинга
  Запустить Celery задачу find_matches_for_profile
GET /interview/session/{session_id} — статус сессии

--- src/store/interviewStore.ts ---
Поля: sessionId, messages (ChatMessage[]), currentQuestionIndex, isComplete, isTyping
Actions: startSession, sendMessage, addMessage, setTyping, completeInterview

--- src/pages/Interview.tsx ---
[AgentHeader фиксированный]:
  Avatar 44px gradient + Sparkles иконка
  "AI-агент" + "Твой проводник"
  Справа: ProgressBar 18 точек (текущий — accent-warm, пройденные — gradient-accent)

[ПРОГРЕСС-ЛИНИЯ под header]:
  3px высота, width = (currentQuestion/18)*100%, transition width 400ms

[ПРОКРУЧИВАЕМЫЕ СООБЩЕНИЯ]:
  flex column, gap 12px, padding 16px, overflow-y auto, padding-bottom 80px
  Auto-scroll вниз при новом сообщении (useEffect на messages)
  bubbleVariants анимация для каждого ChatBubble
  TypingIndicator пока isTyping=true
  Первое сообщение агента — из сервиса (вопрос 1 из промпта)

[ChatInput фиксированный снизу]:
  placeholder "Ответить..."
  SendButton с ArrowUpRight иконкой, активна при len > 0
  haptic('light') при отправке

Логика отправки:
  1. Мгновенно показать bubble-user + очистить input
  2. setTyping(true)
  3. POST /interview/answer
  4. setTyping(false)
  5. bubble-ai с bubbleVariants анимацией
  При is_complete=true → задержка 2с → navigate('/birth-data')



🔮 КУСОК 5 — Фаза 5: Human Design
Ты — senior full-stack разработчик.

Реализуй расчёт Human Design карты и связанные экраны для приложения ВЛЮБВИ.

--- backend/app/services/hd_calculator.py ---
Использовать библиотеку ephem (позиции планет) и timezonefinder.

Алгоритм расчёта:
1. Конвертировать дату/время/координаты в UTC через timezonefinder
2. Если birth_time = null → использовать fallback 12:00
3. Рассчитать позиции Солнца/Луны/Северного узла/Юпитера/Сатурна/Урана/Нептуна/Плутона
   для даты рождения (Design → сознательные ворота)
   и для даты на 88 дней раньше (Personality → бессознательные ворота)
4. Конвертировать градусы планет в гексаграммы И-Цзин (64 гексаграммы)
   Каждые 360/64 ≈ 5.625° = одна гексаграмма
5. Определить активные ворота (1-64) для каждой из 8 планет × 2 = 16 воротных пар
6. Определить активные каналы (пары ворот, соединяющих центры) — список всех 36 каналов HD
7. Определить определённые центры: центр определён если хотя бы один его канал активен
8. Определить тип по логике:
   Манифестор: Горло определено, не связано с Сакральным, есть связь через мотор
   Генератор: Сакральный определён, Горло НЕ связано напрямую с мотором
   Манифестирующий Генератор: Сакральный + Горло связаны через активный канал
   Проектор: Сакральный НЕ определён, нет активного мотора на Горло
   Отражатель: ВСЕ центры не определены
9. Авторитет (иерархия): Сакральный > Эмоциональный > Селезёнка > Эго > G-центр > Ментальный
10. Профиль: из линий воротных пар Солнца (1-6, определяют роль в жизни)
11. Вернуть HDCard объект со всеми полями

def calculate_hd_card(birth_date, birth_time, birth_time_accuracy,
                       birth_city, birth_lat, birth_lon, birth_timezone) -> dict

Тесты в backend/tests/test_hd_calculator.py:
test_generator_type(), test_projector_type(), test_reflector_type()
test_profile_4_6(), test_unknown_birth_time() — fallback 12:00
test_channel_activation(), test_defined_centers()

--- backend/app/routers/birth_data.py ---
POST /hd/calculate:
  Body: {birth_date, birth_time|null, birth_time_accuracy, birth_city, birth_lat, birth_lon, birth_timezone}
  → hd_calculator.calculate_hd_card()
  → Сохранить в hd_cards
  → Вернуть HDCard
  → Запустить Celery: find_matches_for_profile.delay(user_id)

--- backend/app/routers/geo.py ---
GET /geo/suggest?q={query}
  → httpx.get Nominatim OSM: https://nominatim.openstreetmap.org/search
    params: q=query, format=json, limit=5, accept-language=ru
    User-Agent: "vlubvi-app/1.0 (contact@vlubvi.ru)"
  → вернуть [{name: "Москва, Россия", lat, lon, timezone}]
    timezone через timezonefinder.timezone_at(lat, lon)

--- src/store/birthDataStore.ts ---
Поля: birthDate, birthTime, birthTimeAccuracy, birthCity, birthLat, birthLon, birthTimezone, hdCard
Actions: setBirthData, setHdCard, reset

--- src/pages/BirthDataForm.tsx ---
[AgentHeader]: Avatar + "AI-агент" + подпись "Последний шаг"

[ОБЪЯСНЕНИЕ — GlassCard]:
  Star иконка 24px accent-warm
  .text-h3 "Зачем нужны данные рождения?"
  .text-body "Human Design — система самопознания на основе точного времени и места рождения. Она помогает нам подобрать тебе действительно совместимых людей."

[StepIndicator]: ✓ Интервью ── ● Данные ── ○ Карта

[ФОРМА — GlassCard]:

ПОЛЕ 1 — Дата рождения:
  .text-label "ДАТА РОЖДЕНИЯ"
  Три поля flex gap-8: [ДД] [ММ] [ГГГГ]
  type="number", inputMode="numeric"
  Автофокус: 2 цифры → след. поле, 4 цифры ГГГГ → поле времени
  Валидация: год 1940 – (currentYear-18), день 1-31 с учётом месяца
  Защита от несуществующих дат: new Date(y, m-1, d).getDate() === d
  .form-input.error + текст ошибки при невалидной дате

ПОЛЕ 2 — Время рождения:
  .text-label "ВРЕМЯ РОЖДЕНИЯ"
  [ЧЧ] [ММ] — type="number", min/max
  pill-tab точности: [Знаю точно] [Примерно ±1ч] [Не знаю]
  При "Не знаю": поля disabled opacity 0.4
  GlassCard.warning: AlertCircle accent-warning
    "Без точного времени тип HD сохранится, но профиль линий может быть неточным.
     Уточни в свидетельстве о рождении."
  birth_time = null, birth_time_accuracy = 'unknown'

ПОЛЕ 3 — Город рождения:
  .text-label "ГОРОД РОЖДЕНИЯ"
  TextInput с автодополнением, placeholder "Начни вводить город..."
  Дебаунс 400мс → GET /geo/suggest?q={query} (мин. 2 символа)
  Выпадающий список GlassCard z-50: макс 5 результатов
  При выборе → сохранить city/lat/lon/timezone, border-active
  .text-caption "Нет в списке? Выбери ближайший крупный город в том же часовом поясе."
  Кнопка активна ТОЛЬКО если выбран город из списка (есть lat/lon)

[КНОПКА]:
  btn-primary "Рассчитать мою карту →"
  disabled: невалидная дата ИЛИ город не выбран
  loading: Loader2 spin + "Считаю карту..."

[ПОСЛЕ НАЖАТИЯ]:
  POST /hd/calculate → loading state
  Успех → celebration: 10-12 CSS-кружков разлетаются из центра (чистый CSS, без библиотек, 0.8с)
  pageTransition → navigate('/hd-card')

[EDGE CASES]:
  Ошибка геокодинга: GlassCard.warning "Город не найден. Попробуй на английском."
  Ошибка API: GlassCard.error "Ошибка расчёта. Попробуй снова." + кнопка активна

--- src/pages/HDCard.tsx ---
[ЗАГОЛОВОК]:
  SectionTag "ТВОЯ КАРТА"
  .text-h1 "Human Design"

[КАРТОЧКА ТИПА — GlassCard]:
  .text-h2: тип ("Генератор")
  .text-h3: "Профиль 4/6 · Авторитет: Сакральный"
  .text-body: 2 предложения описания типа
  Если birth_time_accuracy === 'unknown': GlassCard.warning "⚠ Время рождения неизвестно — профиль линий приблизительный"

[SVG BODYGRAPH — HDChart компонент]:
  Передать props: definedCenters[], activeChannels[], gates[]
  Tap на центр → tooltip с названием и кратким описанием

[АККОРДЕОН — 3 GlassCard]:
  "Определённые центры" → список с описаниями
  "Активные каналы" → список
  "Ворота и линии" → теги-пилюли
  Анимация height: initial {height:0, overflow:'hidden'} → animate {height:'auto'} duration 0.3

[КНОПКА]:
  btn-primary "Посмотреть совпадения →" → navigate('/matches')



💘 КУСОК 6 — Фаза 6: Матчинг
Ты — senior full-stack разработчик.

Реализуй алгоритм матчинга и экраны для приложения ВЛЮБВИ.

--- backend/app/services/matching.py ---

Алгоритм подсчёта совместимости (итоговый score 0-100):

1. HD Score (вес 40%):
   Совместимость типов: Генератор+Проектор=90, Генератор+Манифестор=75,
   Проектор+Манифестор=80, Генератор+Генератор=70, Отражатель+любой=60
   Электромагнитные каналы: если ворота одного закрывают канал другого → +15 к HD score
   Совпадение >2 активных каналов → +10
   Каждый общий активный канал → +5 (макс +20)

2. Psychology Score (вес 40%):
   Cosine similarity векторов OCEAN embedding (pgvector)
   Стиль привязанности: secure+secure=+20, secure+anxious=+10, secure+avoidant=+10,
   anxious+anxious=-15, avoidant+avoidant=-10, anxious+avoidant=-20
   Конфликт: healthy_boundary+любой=+10, avoidance+merger=-15
   Нейротизм: |a.neuroticism - b.neuroticism| < 0.3 → +5, > 0.6 → -10
   Экстраверсия: |diff| < 0.2 → +5

3. Values Score (вес 20%):
   len(intersection(top_values_a, top_values_b)) / 5 * 100
   ≥3 общих ценности → +15 бонус

4. Итог: score = hd_score*0.4 + psych_score*0.4 + values_score*0.2
   Округлить до целого, ограничить 0-100

5. Breakdown: {hd_score, psychology_score, values_score, details: {...}}

Celery задача find_matches_for_profile:
  Очередь: "matching"
  Найти пользователей: is_active=True, is_visible=True, не текущий пользователь,
  psychological_profile существует, hd_card существует
  Для каждого рассчитать score
  Сохранить в matches (только score >= 50)
  Сортировка по score DESC
  Limit: 50 потенциальных мэтчей за раз

Тесты в backend/tests/test_matching.py:
test_score_calculation(), test_em_channel_bonus(), test_anxious_anxious_penalty()
test_secure_bonus(), test_values_intersection(), test_vector_similarity()

--- backend/app/routers/matches.py ---
GET /matches — список мэтчей с пагинацией
  Фильтры: tab (all|mutual|new), hd_type, age_range, city
  Для non-premium: вернуть первые 3 полностью + остальные с locked=true
GET /matches/{id} — детальная совместимость с breakdown
POST /matches/{id}/start — начать чат (только premium)
  → создать или найти chat session → вернуть match с chat_id
POST /matches/{id}/skip → обновить status='skipped'

--- src/store/matchStore.ts ---
Поля: matches (Match[]), selectedMatch, activeTab, filters, loading
Actions: fetchMatches, setTab, setFilters, selectMatch, startChat, skipMatch

--- src/pages/Matches.tsx ---
[ЗАГОЛОВОК]:
  SectionTag "ДЛЯ ТЕБЯ"
  .text-h2 "Совпадения"
  Бейдж справа с кол-вом новых (accent-warm)

[PILL-TAB]: "Все" / "Взаимные" / "Новые"

[ФИЛЬТРЫ — горизонтальный скролл]:
  FilterChip: "HD-тип" / "Возраст" / "Город"

[СЕТКА — 2 колонки, gap 12px]:
  MatchCard (cardVariants stagger delay i*0.08):
    Фото ИЛИ градиент-плейсхолдер с первой буквой имени
    Имя + возраст
    compatibility-badge "87% ❤"
    Для non-premium (4+ карточка): lock-overlay + Lock иконка + "Premium"
  Tap → navigate('/matches/:id')

[ПУСТОЕ СОСТОЯНИЕ]:
  GlassCard: Heart иконка 40px text-muted
  .text-h3 "Ищем твои совпадения"
  .text-body "Пришлём уведомление когда найдём"

--- src/pages/MatchDetail.tsx ---
[HERO]:
  Аватар A ← SVG анимированная дуга → Аватар B (два кружка по 60px)
  .text-h1 крупный % совместимости по центру
  Имена под аватарами .text-caption

[BREAKDOWN — горизонтальный скролл, 3 мини-GlassCard]:
  "HD: XX%" + Diamond иконка
  "Психология: XX%" + Brain иконка
  "Ценности: XX%" + Heart иконка

[ПОДРОБНОЕ ОБЪЯСНЕНИЕ — 3 GlassCard]:
  Diamond + "Human Design": объяснение совместимости типов и каналов
  Brain + "Психология": OCEAN + стиль привязанности
  Heart + "Ценности": общие ценности список
  GlassCard.warning если есть предупреждение (напр. оба тревожный стиль)

[КНОПКИ]:
  btn-primary "Начать общение":
    non-premium → navigate('/paywall')
    premium → POST /matches/{id}/start → navigate('/chat/:matchId')
  btn-secondary "Не мой человек" → POST /matches/{id}/skip → navigate(-1)



💬 КУСОК 7 — Фаза 7: Чат

Ты — senior full-stack разработчик.

Реализуй real-time чат между мэтчами для приложения ВЛЮБВИ.
WebSocket + Redis Pub/Sub для масштабирования на 3 инстансах бэкенда.

--- backend/app/routers/chat.py ---

WebSocket Manager с Redis Pub/Sub:
class ConnectionManager:
  active_connections: dict[str, list[WebSocket]]  # match_id → список сокетов
  
  async def connect(websocket, match_id, user_id): 
    Добавить в active_connections[match_id]
    Подписаться на Redis канал: chat:{match_id}
  
  async def disconnect(websocket, match_id):
    Убрать из active_connections[match_id]
  
  async def broadcast(match_id, message: dict):
    Опубликовать в Redis: PUBLISH chat:{match_id} json(message)
  
  async def redis_listener(match_id):
    Слушать Redis канал
    При получении сообщения → разослать всем WebSocket в active_connections[match_id]

Эндпоинты:
GET /chat/{match_id}/messages?limit=50&before={cursor}
  Получить последние сообщения, расшифровать content_encrypted
  Вернуть [{id, sender_id, content, created_at, read_at}]
  
WS /ws/chat/{match_id}:
  Аутентификация: JWT токен в query параметре ?token=...
  При подключении: join ConnectionManager, отправить {type: "connected"}
  При входящем сообщении:
    {type: "message", content: str}
    1. Зашифровать content через encryption.encrypt()
    2. Сохранить в messages
    3. ConnectionManager.broadcast(match_id, {type:"message", sender_id, content, created_at})
    4. Push-уведомление партнёру через notifications service
  При {type: "read"}: обновить read_at для всех сообщений этого match

--- backend/app/services/notifications.py ---
async def send_push(user_id, title, body):
  Определить платформу пользователя (telegram/max)
  Для Telegram: POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
    chat_id = user.telegram_id
    text = f"💌 {title}: {body}"
    inline_keyboard: [["Ответить", "открыть_приложение"]]

--- src/pages/Chat.tsx ---
[UserHeader фиксированный]:
  ChevronLeft → navigate(-1)
  Фото партнёра 40px круглое + зелёная точка онлайн (если online)
  .text-h3 имя партнёра
  "онлайн" | "был(а) N мин назад"

[СООБЩЕНИЯ]:
  При маунте: GET /chat/{match_id}/messages → заполнить историю
  WebSocket: const ws = new WebSocket(`/ws/chat/${matchId}?token=${accessToken}`)
  
  ws.onmessage: при type="message" → добавить в список + auto-scroll вниз
  
  bubble-ai (партнёр, слева) с bubbleVariants анимацией
  bubble-user (я, справа) с bubbleVariants анимацией
  Timestamp под каждым (11px, 45% opacity)
  
  Бесконечная прокрутка вверх: IntersectionObserver на первом сообщении
  → GET /chat/{match_id}/messages?before={oldest_id} → prepend

[ChatInput фиксированный снизу]:
  placeholder "Написать..."
  haptic('light') при отправке
  ws.send(JSON.stringify({type:"message", content}))
  Мгновенно показать своё сообщение (optimistic update)
  
  При потере соединения: GlassCard.warning "Нет соединения, переподключаемся..."
  Автопереподключение: exponential backoff 1s→2s→4s→8s


💳 КУСОК 8 — Фаза 8: Монетизация

Ты — senior full-stack разработчик.

Реализуй систему оплаты через T-Bank и экраны монетизации для приложения ВЛЮБВИ.

--- backend/app/services/tbank.py ---
Base URL: https://securepay.tbank.ru/v2/
Аутентификация: HMAC-SHA256 подпись всех параметров.

Подпись Token: SHA256(конкатенация значений параметров,
отсортированных по ключу + Password).
НЕ включать Token и Receipt в строку для подписи.

async def create_payment(user_id, amount_kopecks, order_id, phone=None, email=None) -> str:
  POST /Init
  Params: TerminalKey, Amount (в копейках), OrderId,
  Description="Влюбви Premium — подписка на 1 месяц",
  SuccessURL="https://vlubvi.ru/payment/success",
  FailURL="https://vlubvi.ru/payment/fail",
  Recurrent="Y"  ← обязательно для рекуррентных платежей
  DATA: {Phone, Email} если переданы
  Token = sign(params)
  → вернуть PaymentURL из ответа

async def charge_recurring(payment_id, rebill_id) -> bool:
  POST /Charge
  Params: TerminalKey, PaymentId, RebillId, Token
  → True если Status=CONFIRMED

async def cancel_recurring(user_id):
  Найти последний активный RebillId пользователя в таблице payments
  POST /CancelSubscription: TerminalKey, RebillId, Token
  → вернуть bool успеха

def verify_webhook(data: dict) -> bool:
  Извлечь Token из data
  Собрать остальные параметры (кроме Token и Receipt)
  Отсортировать по ключу, конкатенировать значения + Password
  SHA256 → сравнить с Token
  Вернуть True если совпадает — ПРОВЕРЯТЬ ДО ЛЮБОЙ БИЗНЕС-ЛОГИКИ

--- backend/app/routers/payment.py ---

POST /payment/subscribe:
  1. Сгенерировать order_id = str(uuid4())
  2. tbank.create_payment(user_id, amount=49000, order_id) ← 490 руб = 49000 копеек
  3. Сохранить payments запись со status='pending'
  4. Вернуть {payment_url: str, order_id: str}
  Фронтенд открывает payment_url через WebApp.openLink()

POST /payment/webhook (публичный, без JWT!):
  СНАЧАЛА verify_webhook(data) → если False → вернуть 400
  При Status=CONFIRMED:
    Обновить payments: status='confirmed', rebill_id=data['RebillId']
    user.is_premium = True
    user.premium_until = NOW() + 30 дней
    Аудит: 'payment_confirmed'
  При Status=REJECTED/CANCELED:
    payments: status='failed'
    Аудит: 'payment_failed'
  Всегда вернуть {"Success": true} — T-Bank требует этот ответ

GET /payment/status/{order_id}:
  Вернуть {status, is_premium, premium_until}
  Фронтенд поллит этот эндпоинт после редиректа с payment_url

--- backend/celery_worker.py ---
Celery Beat задача renew_subscriptions:
  Schedule: ежедневно в 09:00 MSK (crontab hour=6, minute=0 по UTC)
  Найти пользователей: is_premium=True, premium_until < NOW() + 3 дня
  Для каждого:
    Создать новый платёж через POST /Init (Recurrent="Y")
    tbank.charge_recurring(payment_id, rebill_id)
    При успехе: premium_until += 30 дней
    При ошибке: отправить уведомление пользователю, попробовать завтра (макс 3 попытки)

Тесты в backend/tests/test_payment.py:
  test_tbank_webhook_valid() — корректная подпись → 200, premium активирован
  test_tbank_webhook_tampered() — неверная подпись → 400
  test_subscription_activation() — после CONFIRMED user.is_premium=True
  test_recurring_charge() — charge_recurring возвращает True при успехе

--- src/pages/Paywall.tsx ---
Анимация bottomSheetVariants при маунте.
Overlay: position fixed, inset 0, rgba(13,31,26,0.7), backdrop-filter blur(8px).
При tap на overlay → закрыть (navigate(-1)).

[ХЭНДЛ]: 40×4px, border-radius 2px, bg border-subtle, margin auto сверху

Diamond иконка 36px accent-warm, margin-top 24px
.text-h2 "Влюбви Premium"
.text-body "Открой всех, с кем ты совпадаешь"

[4 ФИЧИ — список]:
  CheckCircle иконка accent-primary (16px) + текст:
  "Все мэтчи без ограничений"
  "Подробная психологическая совместимость"
  "Начать общение с любым мэтчем"
  "Первым видеть новые совпадения"

[ТАРИФ — GlassCard]:
  .text-h1 "490 ₽"
  .text-body "в месяц · Отмена в любой момент"

[КНОПКА]:
  btn-primary "Оформить подписку"
  onClick:
    1. POST /payment/subscribe → получить payment_url
    2. haptic('medium')
    3. Открыть payment_url:
       Telegram: WebApp.openLink(payment_url)
       MAX: window.WebApp.openLink(payment_url)
    4. Начать поллинг GET /payment/status/{order_id} каждые 2с
    5. При status=confirmed → setIsPremium(true) → navigate('/matches') + haptic('success')
    6. Таймаут поллинга: 5 минут → показать GlassCard.warning "Оплата не подтверждена"

.text-caption "Оплата через T-Bank · Данные защищены · 152-ФЗ"

--- src/pages/Profile.tsx ---
[ШАПКА]:
  Фото 90px circle + кнопка Edit (карандаш, abs. position)
  .text-h2 имя
  .text-body "возраст · город"

[СЕКЦИЯ "Обо мне" — GlassCard]:
  bio текст + btn-secondary "Редактировать"
  При редактировании → inline TextInput + "Сохранить"

[СЕКЦИЯ "Human Design" — GlassCard]:
  SectionTag "HUMAN DESIGN"
  .text-h3 тип + профиль ("Генератор · 4/6")
  .text-caption авторитет
  btn-secondary "Изменить данные рождения" → navigate('/birth-data')

[СЕКЦИЯ "Мой профиль" — GlassCard]:
  SectionTag "ПСИХОЛОГИЯ"
  Краткое текстовое описание (из profile_notes, без цифр)
  btn-secondary "Посмотреть подробнее →"
  → раскрыть аккордеон с топ-5 ценностей + стиль привязанности (текстом, без цифр)

[СЕКЦИЯ "Подписка" — GlassCard]:
  Если premium:
    Diamond иконка accent-warm
    "Premium активна до {premium_until, формат DD MMM YYYY}"
    btn-secondary "Управление подпиской" → openLink T-Bank личный кабинет
  Если free:
    "Базовый доступ"
    btn-primary "Перейти на Premium" → navigate('/paywall')

[НАСТРОЙКИ — GlassCard]:
  Toggle "Уведомления о мэтчах" — PATCH /profile/notifications
  "Конфиденциальность" →
  "Скачать мои данные" → navigate('/data-export')
  "Удалить аккаунт" → navigate('/delete-account')
  "О приложении" → bottom sheet с версией



🗑️ КУСОК 9 — Фаза 9: GDPR и профиль
Ты — senior full-stack разработчик.

Реализуй GDPR / 152-ФЗ экраны и аудит для приложения ВЛЮБВИ.

--- backend/app/services/audit.py ---
async def log(user_id, action: str, meta: dict = None):
  INSERT INTO audit_log (user_id, action, meta, created_at)
  Хранить 5 лет. Не шифровать (нужен для проверок регулятора).
  Действия для аудита:
    consent_granted, consent_revoked,
    data_export_requested, data_export_completed,
    account_deletion_requested, account_hard_deleted,
    payment_confirmed, payment_failed,
    login_telegram, login_max, login_phone,
    profile_updated, birth_data_updated

--- backend/app/routers/gdpr.py ---

GET /gdpr/export:
  1. Собрать все данные пользователя:
     - Профиль (name, bio, birth_date, city)
     - HD карта (type, profile, centers, channels, gates)
     - Психологический профиль (openness, conscientiousness, extraversion,
       agreeableness, neuroticism, attachment_style, energy_type,
       conflict_style, top_values, shadow_patterns)
       НЕ включать embedding вектор
     - История согласий (consent_type, granted, granted_at, revoked_at)
     - Список мэтчей (без личных данных партнёров — только compatibility_score)
     - Статус подписки
  2. НЕ включать: переписки (отдельный запрос), audit_log,
     зашифрованные данные партнёров
  3. Сформировать JSON файл
  4. Упаковать в ZIP (если несколько файлов)
  5. Аудит: 'data_export_requested' + 'data_export_completed'
  6. Вернуть StreamingResponse с Content-Disposition: attachment; filename="vlubvi-data.zip"

DELETE /gdpr/delete:
  Body: {confirmation: "УДАЛИТЬ"}
  1. Проверить confirmation === "УДАЛИТЬ"
  2. Если is_premium И premium_until > NOW():
     tbank.cancel_recurring(user_id) ← отменить рекуррентный платёж
  3. user.deleted_at = NOW()
     user.is_active = False
     user.is_premium = False ← немедленно снять доступ
  4. Инвалидировать ВСЕ токены: redis.delete(f"refresh:{user_id}:*")
  5. Запустить Celery: hard_delete_account.apply_async(args=[user_id], countdown=30*24*3600)
  6. Аудит: 'account_deletion_requested'
  7. Вернуть {success: True, message: "Аккаунт будет удалён через 30 дней"}

Celery задача hard_delete_account (очередь "gdpr"):
  1. Проверить user.deleted_at IS NOT NULL (защита от случайного вызова)
  2. Удалить фото из хранилища
  3. Очистить все Redis ключи пользователя: interview:*, refresh:*
  4. CASCADE DELETE: DELETE FROM users WHERE id = user_id
     Каскадно удалит: profiles, hd_cards, psychological_profiles,
     interview_sessions, matches, messages, consents, payments
  5. Аудит: 'account_hard_deleted' (только факт, без ПДн, хранить 5 лет)

--- src/pages/DataExport.tsx ---
SectionTag "GDPR / 152-ФЗ"
.text-h2 "Мои данные"

GlassCard: что войдёт в выгрузку:
  CheckCircle accent-primary (16px) + текст для каждого пункта:
  "Профиль и фотографии"
  "Карта Human Design"
  "Психологический профиль (ценности, паттерны)"
  "История согласий"
  "Статус подписки"

GlassCard.warning:
  "Переписки не включены в выгрузку по умолчанию.
   Если нужна история чатов — напиши в поддержку."

btn-secondary "Скачать мои данные (ZIP)":
  onClick:
    1. GET /gdpr/export → Blob
    2. Создать URL.createObjectURL(blob)
    3. Programmatic click на <a download="vlubvi-data.zip">
    4. Показать GlassCard success: "Файл скачан"

--- src/pages/DeleteAccount.tsx ---

[ПРОВЕРКА ПОДПИСКИ]:
  GET /payment/status при маунте → проверить is_premium
  Если is_premium === true AND premium_until > NOW():
    GlassCard.warning:
      AlertTriangle 36px accent-warning
      "У тебя активна подписка до {premium_until}"
      .text-body "После удаления аккаунта деньги за оставшийся период
      не возвращаются. Рекуррентные списания будут отменены."
    Два обязательных чекбокса (оба нужны для продолжения):
      ☐ "Понимаю, что подписка не компенсируется"
      ☐ "Хочу удалить аккаунт несмотря на это"

[ОСНОВНАЯ ФОРМА — активна только после чекбоксов (если подписка) или сразу (если нет)]:
  GlassCard.warning:
    AlertTriangle 36px accent-warning
    .text-h3 "Это действие необратимо"
    Список что будет удалено (Shield иконки):
      "Профиль и фотографии"
      "Карта Human Design"
      "Психологический профиль"
      "Все совпадения и переписки"
    .text-caption "Аккаунт удаляется через 30 дней после подтверждения"

  .text-label "ВВЕДИ СЛОВО ДЛЯ ПОДТВЕРЖДЕНИЯ"
  TextInput placeholder "УДАЛИТЬ"
    .form-input.error если введено но не "УДАЛИТЬ"
    disabled если подписка есть и чекбоксы не отмечены

  btn-danger "Удалить аккаунт навсегда":
    disabled если TextInput !== "УДАЛИТЬ"
    onClick:
      1. DELETE /gdpr/delete {confirmation: "УДАЛИТЬ"}
      2. При успехе: authStore.logout()
      3. navigate('/onboarding')
      4. Показать toast "Аккаунт будет удалён через 30 дней"



⚙️ КУСОК 10 — Фаза 10: DevOps и деплой

Ты — senior DevOps-инженер.

Реализуй production-инфраструктуру для приложения ВЛЮБВИ.
Хостинг: Timeweb Cloud (серверы РФ, 152-ФЗ).
Основной VPS: 4 vCPU / 8 GB / 80 GB SSD.
PostgreSQL: Managed PostgreSQL 15.
Celery VPS: 2 vCPU / 4 GB.

--- docker-compose.prod.yml ---

services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/vlubvi:/var/www/vlubvi:ro
    ports: ["80:80", "443:443"]
    depends_on: [backend1, backend2, backend3]
    restart: always

  backend1: &backend
    build: ./backend
    command: gunicorn app.main:app -w 3 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 60
    environment:
      - DATABASE_URL=postgresql+asyncpg://vlubvi:${POSTGRES_PASSWORD}@pgbouncer/vlubvi
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - YANDEX_API_KEY=${YANDEX_API_KEY}
      - YANDEX_FOLDER_ID=${YANDEX_FOLDER_ID}
      - TBANK_TERMINAL_KEY=${TBANK_TERMINAL_KEY}
      - TBANK_PASSWORD=${TBANK_PASSWORD}
      - JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY}
      - JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
      - BOT_TOKEN=${BOT_TOKEN}
      - MAX_SECRET_KEY=${MAX_SECRET_KEY}
      - SENTRY_DSN=${SENTRY_DSN}
      - LLM_MAX_CONCURRENT=50
    restart: unless-stopped

  backend2: *backend
  backend3: *backend

  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    volumes:
      - ./pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini
      - ./pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes: [redis_data:/data]
    restart: unless-stopped

  celery_worker:
    build: ./backend
    command: celery -A celery_worker worker -Q matching,notifications,payments,gdpr --concurrency=4 --loglevel=info
    environment: *backend_env
    restart: unless-stopped

  celery_beat:
    build: ./backend
    command: celery -A celery_worker beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    environment: *backend_env
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports: ["9090:9090"]
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=false
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes: [grafana_data:/var/lib/grafana]
    ports: ["3000:3000"]
    restart: unless-stopped

volumes:
  redis_data:
  grafana_data:

--- nginx/nginx.conf ---

upstream backend {
  least_conn;
  server backend1:8000;
  server backend2:8000;
  server backend3:8000;
  keepalive 32;
}

server {
  listen 80;
  server_name vlubvi.ru www.vlubvi.ru;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name vlubvi.ru www.vlubvi.ru;

  ssl_certificate /etc/letsencrypt/live/vlubvi.ru/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/vlubvi.ru/privkey.pem;
  ssl_protocols TLSv1.3;
  ssl_prefer_server_ciphers off;

  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Frame-Options DENY always;
  add_header X-Content-Type-Options nosniff always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://st.max.ru; connect-src 'self' wss://vlubvi.ru https://vlubvi.ru;" always;

  # Frontend SPA
  location / {
    root /var/www/vlubvi;
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
    gzip on;
    gzip_types text/css application/javascript application/json;
  }

  # Статика с кешированием
  location /assets/ {
    root /var/www/vlubvi;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # API
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;
  }

  # WebSocket
  location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
  }

  # T-Bank webhook — без rate limiting
  location /api/payment/webhook {
    proxy_pass http://backend;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

--- pgbouncer/pgbouncer.ini ---
[databases]
vlubvi = host=managed-postgres.timeweb.cloud port=5432 dbname=vlubvi

[pgbouncer]
pool_mode = transaction
listen_addr = 0.0.0.0
listen_port = 5432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
server_idle_timeout = 600
log_connections = 0
log_disconnections = 0

--- monitoring/prometheus.yml ---
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vlubvi-backend'
    static_configs:
      - targets: ['backend1:8000', 'backend2:8000', 'backend3:8000']
    metrics_path: /metrics

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'pgbouncer'
    static_configs:
      - targets: ['pgbouncer:9127']

--- Скрипт деплоя deploy.sh ---
#!/bin/bash
set -e

echo "=== Влюбви Deploy ==="

# 1. Сборка фронтенда
cd frontend
npm ci
npm run build
rsync -av dist/ /var/www/vlubvi/

# 2. Запуск prod контейнеров
cd ..
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Миграции БД (после старта бэкенда)
sleep 5
docker-compose -f docker-compose.prod.yml exec backend1 alembic upgrade head

# 4. Создать pgvector индексы (ПОСЛЕ загрузки данных)
# Выполнять только при первом деплое или после bulk insert:
# docker-compose exec backend1 python -c "
#   from app.database import engine
#   import asyncio
#   async def create_idx():
#       async with engine.begin() as conn:
#           await conn.execute(text('CREATE INDEX CONCURRENTLY IF NOT EXISTS
#             idx_psych_embedding ON psychological_profiles
#             USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)'))
#   asyncio.run(create_idx())"

echo "=== Deploy завершён ==="
docker-compose -f docker-compose.prod.yml ps

--- Let's Encrypt (выполнить один раз на сервере) ---
# Установить certbot:
apt install certbot python3-certbot-nginx

# Получить сертификат:
certbot --nginx -d vlubvi.ru -d www.vlubvi.ru

# Автообновление (уже добавлено certbot автоматически):
# 0 12 * * * /usr/bin/certbot renew --quiet
# Проверить: crontab -l

--- Важные технические ограничения (повторить разработчику) ---

1. MAX Bridge: ТОЛЬКО CDN https://st.max.ru/js/max-web-app.js
   НЕ npm, НЕ @vkontakte/vk-bridge — это разные продукты

2. Шрифты: ТОЛЬКО npm (@fontsource/*)
   НЕ Google Fonts CDN — MiniApp должен работать оффлайн

3. Framer Motion: ТОЛЬКО анимации pageTransition, bubbleVariants,
   cardVariants, bottomSheetVariants
   НЕ использовать для layout, form, drag

4. Все ПДн: ТОЛЬКО серверы РФ (Timeweb Cloud)
   НЕ Vercel, НЕ AWS, НЕ Cloudflare Workers

5. Промпт агента: backend/prompts/agent_interview.md
   НЕ хардкодить в Python — всегда читать из файла при старте

6. pgvector индексы: создавать ПОСЛЕ вставки данных
   DROP INDEX → bulk insert → CREATE INDEX CONCURRENTLY

7. WebSocket: Redis Pub/Sub обязателен
   3 инстанса бэкенда должны видеть сообщения друг друга

8. T-Bank вебхук: verify_webhook() — ДО любой бизнес-логики

9. Удаление аккаунта: мягкое (deleted_at) → hard delete через 30 дней

10. Интервью: вопросы 1 и 18 неизменные,
    вопросы 2–17 адаптировать по ответам


