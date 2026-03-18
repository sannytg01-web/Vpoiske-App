import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, ChevronDown } from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/TextInput';
import { pageTransition } from '../utils/animations';

const RUSSIAN_CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
  'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
  'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
  'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск',
  'Барнаул', 'Ульяновск', 'Иркутск', 'Хабаровск', 'Ярославль',
  'Владивосток', 'Махачкала', 'Томск', 'Оренбург', 'Кемерово',
  'Рязань', 'Астрахань', 'Набережные Челны', 'Пенза', 'Липецк',
  'Тула', 'Киров', 'Чебоксары', 'Калининград', 'Брянск',
  'Курск', 'Иваново', 'Магнитогорск', 'Улан-Удэ', 'Тверь',
  'Ставрополь', 'Белгород', 'Сочи', 'Нижний Тагил', 'Сургут',
];

export const CreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [age, setAge] = useState('');

  const filteredCities = useMemo(() => {
    if (!cityQuery) return RUSSIAN_CITIES.slice(0, 10);
    return RUSSIAN_CITIES.filter(c => c.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 8);
  }, [cityQuery]);

  const canContinue = name.trim().length >= 2 && selectedCity && gender;

  const handleSave = () => {
    localStorage.setItem('vpoiske_user_name', name.trim());
    localStorage.setItem('vpoiske_user_city', selectedCity);
    localStorage.setItem('vpoiske_user_gender', gender);
    if (age) localStorage.setItem('vpoiske_user_age', age);
    navigate('/interview');
  };

  return (
    <motion.div
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="page-content px-4 py-8 relative"
    >
      <AppBackground />

      <div className="flex flex-col h-full z-10 relative">
        <h2 className="text-h2 text-white mb-2 mt-6">Давай знакомиться!</h2>
        <p className="text-body text-secondary mb-8">Расскажи немного о себе, чтобы мы могли подобрать тебе идеальные совпадения.</p>

        {/* NAME */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <User size={20} className="text-accent-primary" />
            <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Имя</span>
          </div>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как тебя зовут?"
          />
        </GlassCard>

        {/* GENDER */}
        <GlassCard className="p-5 mb-4">
          <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase block mb-3">Пол</span>
          <div className="flex gap-3">
            <button
              onClick={() => setGender('female')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                gender === 'female'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              Женщина
            </button>
            <button
              onClick={() => setGender('male')}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                gender === 'male'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              Мужчина
            </button>
          </div>
        </GlassCard>

        {/* AGE */}
        <GlassCard className="p-5 mb-4">
          <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase block mb-3">Возраст</span>
          <TextInput
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Сколько тебе лет?"
          />
        </GlassCard>

        {/* CITY */}
        <GlassCard className="p-5 mb-4 relative">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={20} className="text-accent-warm" />
            <span className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Город</span>
          </div>
          <div className="relative">
            <TextInput
              value={selectedCity || cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setSelectedCity('');
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="Начните вводить город..."
            />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          </div>
          
          {showCityDropdown && filteredCities.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 mx-5 max-h-48 overflow-y-auto rounded-xl z-50"
              style={{ background: 'var(--bg-secondary, #142920)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {filteredCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setCityQuery('');
                    setShowCityDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        {/* CONTINUE */}
        <div className="mt-auto pt-4">
          <Button variant="primary" onClick={handleSave} disabled={!canContinue} className="w-full">
            Продолжить к интервью →
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
