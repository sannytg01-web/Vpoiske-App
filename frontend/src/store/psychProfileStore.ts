import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PsychProfile {
  // Big Five (OCEAN)
  openness: number;          // 0-1
  conscientiousness: number; // 0-1
  extraversion: number;      // 0-1
  agreeableness: number;     // 0-1
  neuroticism: number;       // 0-1

  // Deep patterns
  attachment_style: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  energy_type: 'fast' | 'slow' | 'variable';
  conflict_style: 'avoidance' | 'merger' | 'healthy_boundary';

  // Values & shadows
  top_values: string[];
  shadow_patterns: string[];
  refused_questions: number[];

  // Meta
  confidence_score: number;
  profile_notes: string;

  // AI-generated bio variants
  bio_variants?: {
    light: string;   // Юморной
    deep: string;    // Глубокий
    warm: string;    // Тёплый
  };
}

interface PsychProfileState {
  profile: PsychProfile | null;
  isLoaded: boolean;
  setProfile: (p: PsychProfile) => void;
  reset: () => void;
}

// Human-readable labels for Russian UI
export const attachmentLabels: Record<string, string> = {
  secure: 'Надёжный',
  anxious: 'Тревожный',
  avoidant: 'Избегающий',
  disorganized: 'Дезорганизованный',
};

export const attachmentDescriptions: Record<string, string> = {
  secure: 'Ты комфортно чувствуешь себя и в близости, и в самостоятельности. Способен(а) доверять и выстраивать здоровые отношения.',
  anxious: 'Тебе важно чувствовать подтверждение чувств. Иногда тревога заставляет чаще проверять, всё ли в порядке в отношениях.',
  avoidant: 'Тебе нужно больше автономии и пространства. Близость иногда ощущается как давление, поэтому важно знать свои границы.',
  disorganized: 'Ты можешь переключаться между желанием близости и потребностью в дистанции. Это сложный, но понимаемый паттерн.',
};

export const conflictLabels: Record<string, string> = {
  avoidance: 'Избегание конфликта',
  merger: 'Слияние',
  healthy_boundary: 'Здоровые границы',
};

export const conflictDescriptions: Record<string, string> = {
  avoidance: 'Ты склонен(а) уходить от прямого столкновения, предпочитая переждать или сменить тему. Важно учиться мягко, но чётко обозначать позицию.',
  merger: 'Ты стремишься к единству с партнёром, иногда растворяясь в его потребностях. Важно помнить о собственных границах.',
  healthy_boundary: 'Ты умеешь держать баланс: отстаивать свою позицию, оставаясь в контакте. Это сильная сторона.',
};

export const energyLabels: Record<string, string> = {
  fast: 'Быстрая энергия',
  slow: 'Глубокая энергия',
  variable: 'Волнообразная энергия',
};

export const valueLabels: Record<string, string> = {
  'свобода': '🦅 Свобода',
  'безопасность': '🛡 Безопасность',
  'развитие': '📈 Развитие',
  'стабильность': '⚓ Стабильность',
  'честность': '💎 Честность',
  'юмор': '😄 Юмор',
  'глубина': '🌊 Глубина',
  'лёгкость': '☁️ Лёгкость',
  'верность': '🤝 Верность',
  'независимость': '🗽 Независимость',
  'принятие': '💚 Принятие',
  'страсть': '🔥 Страсть',
  'покой': '🧘 Покой',
  'приключения': '🎒 Приключения',
  'семья': '🏠 Семья',
  'карьера': '🚀 Карьера',
  'творчество': '🎨 Творчество',
  'духовность': '✨ Духовность',
  'дружба': '🫂 Дружба',
  'интеллект': '🧠 Интеллект',
};

export const shadowLabels: Record<string, string> = {
  'самопожертвование': 'Самопожертвование',
  'гиперконтроль': 'Гиперконтроль',
  'избегание близости': 'Избегание близости',
  'страх быть брошенным': 'Страх быть покинутым',
  'нужда в одобрении': 'Нужда в одобрении',
  'перфекционизм': 'Перфекционизм',
  'пассивная агрессия': 'Пассивная агрессия',
  'эмоциональное закрытие': 'Эмоциональное закрытие',
  'зависимость от отношений': 'Зависимость от отношений',
  'страх конфликта': 'Страх конфликта',
  'нарциссические черты': 'Нарциссические черты',
};

export const usePsychProfileStore = create<PsychProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isLoaded: false,
      setProfile: (p) => set({ profile: p, isLoaded: true }),
      reset: () => set({ profile: null, isLoaded: false }),
    }),
    {
      name: 'vpoiske-psych-profile',
    }
  )
);
