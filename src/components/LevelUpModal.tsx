import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, X, ChevronUp } from 'lucide-react';

// ============================================================
// Модалка повышения уровня — поздравление с конфетти
// ============================================================

const CONFETTI_COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#ef4444'];

export function LevelUpModal() {
  const { levelUpData, dismissLevelUp } = useGame();
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string; duration: number }>>([]);

  useEffect(() => {
    if (!levelUpData) return;
    // Генерация конфетти
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2 + Math.random() * 1.5,
    }));
    setConfetti(pieces);
  }, [levelUpData]);

  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Конфетти */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              backgroundColor: piece.color,
              animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s forwards`,
              boxShadow: `0 0 6px ${piece.color}80`,
            }}
          />
        ))}
      </div>

      {/* Модалка */}
      <div className="relative animate-modal-pop rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#0D1117] to-[#0B0F19] px-8 py-8 max-w-md w-full mx-4 overflow-hidden">
        {/* Свечение фона */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.3), transparent 70%)',
          }}
        />

        {/* Кнопка закрытия */}
        <button
          onClick={dismissLevelUp}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Контент */}
        <div className="relative text-center">
          {/* Иконка уровня */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 mb-4 animate-level-up">
            <span className="text-3xl font-black text-cyan-300 font-mono">
              {levelUpData.newLevel}
            </span>
          </div>

          {/* Заголовок */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-cyan-300">
              Новый уровень!
            </h2>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>

          {/* Имя и новый титул */}
          <p className="text-slate-400 text-[13px] mb-1">
            Поздравляем, Криштиан Михайлович!
          </p>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mb-4">
            <ChevronUp className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-200">
              Новый титул: {levelUpData.newTitle}
            </span>
          </div>

          {/* Информация о награде */}
          <p className="text-slate-500 text-[12px] font-mono mb-4">
            +{levelUpData.xpGained} XP начислено
          </p>

          {/* Мотивирующее сообщение */}
          <p className="text-slate-300 text-[13px] leading-relaxed mb-6">
            {levelUpData.newLevel >= 10
              ? 'Вы достигли максимального уровня! Вы — Lead iOS Architect. Абсолютная легенда разработки!'
              : levelUpData.newLevel >= 7
                ? 'Вы в Senior-лиге! Осталось совсем немного до вершины карьеры.'
                : levelUpData.newLevel >= 5
                  ? 'Поздравляем с переходом в Middle+! Теперь задачи стали серьёзнее, и вы готовы к ним.'
                  : 'Отличный прогресс! Продолжайте решать задачи и открывать новые модули, чтобы получать больше опыта.'}
          </p>

          {/* Кнопка продолжить */}
          <button
            onClick={dismissLevelUp}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-[14px] hover:from-cyan-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 0 12px rgba(34,211,238,0.3)' }}
          >
            Продолжить обучение
          </button>
        </div>
      </div>
    </div>
  );
}
