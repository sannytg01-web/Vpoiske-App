import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, AlertTriangle } from 'lucide-react';

import { AppBackground } from '../components/ui/AppBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { pageTransition } from '../utils/animations';
import { tgAlert } from '../utils/telegram';
import { apiClient } from '../api/client';

export const DataExport: React.FC = () => {
  const navigate = useNavigate();

  const handleExportData = async () => {
    try {
      const response = await apiClient.get('/gdpr/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vlubvi_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      tgAlert('Ваш архив успешно сформирован и скачан.');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Failed to export data:', error);
      tgAlert('Произошла ошибка при экспорте данных.');
    }
  };

  return (
    <motion.div 
      variants={pageTransition} initial="initial" animate="animate" exit="exit"
      className="page-content px-4 py-8 bg-transparent"
    >
      <AppBackground />

      <div className="absolute top-0 left-0 w-full p-4 z-20" style={{ paddingTop: 'calc(16px + var(--safe-top, 0px))' }}>
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <ChevronLeft size={28} />
        </button>
      </div>

      <div className="flex flex-col items-center mt-12 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A9E7F] to-[#255241] flex items-center justify-center shadow-lg mb-4">
          <Download size={32} color="white" />
        </div>
        <h2 className="text-h2 text-white text-center">Экспорт данных</h2>
      </div>
      
      <GlassCard className="p-5 mb-8">
        <p className="text-body text-secondary mb-4 text-center">
          Согласно требованиям <strong>GDPR и 152-ФЗ</strong>, вы имеете право запросить копию всех персональных данных, которые мы храним о вас.
        </p>
        <p className="text-body text-white mb-2 font-medium">Что войдет в архив:</p>
        <ul className="space-y-3 mb-4 text-body text-secondary text-sm">
          <li className="flex items-start space-x-2"><span className="text-accent-secondary mt-1">•</span><span>Информация профиля и дата рождения</span></li>
          <li className="flex items-start space-x-2"><span className="text-accent-secondary mt-1">•</span><span>Расчеты вашей рейв-карты (Human Design)</span></li>
          <li className="flex items-start space-x-2"><span className="text-accent-secondary mt-1">•</span><span>Аналитика вашего психологического профиля</span></li>
          <li className="flex items-start space-x-2"><span className="text-accent-secondary mt-1">•</span><span>История переписок (выгрузка текстовых сообщений)</span></li>
        </ul>
        <div className="bg-accent-warning/10 p-3 rounded-xl border border-accent-warning/20 flex space-x-3 items-start mt-4">
          <AlertTriangle className="text-accent-warning shrink-0" size={18} />
          <span className="text-caption text-secondary">
            Сбор данных может занять до 24 часов. Ссылка на скачивание архива будет отправлена вам в личные сообщения основным ботом.
          </span>
        </div>
      </GlassCard>

      <div className="mt-auto flex flex-col pt-8">
        <Button variant="primary" onClick={handleExportData} className="mb-4">
          Запросить архив
        </Button>
      </div>
    </motion.div>
  );
};
