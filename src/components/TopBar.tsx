import { useGame } from '@/context/GameContext';
import { LevelUpModal } from '@/components/LevelUpModal';
import { Trophy, Zap, Star } from 'lucide-react';

// ============================================================
// Верхний бар: профиль игрока, уровень, неоновая шкала XP
// ============================================================

export default function TopBar() {
  const {
    playerName,
    xp,
    level,
    title,
    levelProgress,
    xpToNext,
    unlockedAchievements,
    totalAchievements,
  } = useGame();

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-3 lg:px-6 bg-[#0D1117] border-b border-slate-800/80">
        {/* Аватар игрока */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-cyan-300 font-mono">
              {playerName.charAt(0)}
            </span>
            {/* Бейдж уровня */}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 border-2 border-[#0D1117] flex items-center justify-center text-[9px] font-bold text-[#0B0F19] font-mono">
              {level}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-slate-100 leading-tight">
              {playerName}
            </p>
            <p className="text-[10px] font-mono text-cyan-400/80 leading-tight">
              {title}
            </p>
          </div>
        </div>

        {/* Неоновая шкала опыта */}
        <div className="flex-1 max-w-md mx-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                XP
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {xp} / {xp + xpToNext} <span className="text-cyan-400">(+{xpToNext} до уровня {level + 1})</span>
            </span>
          </div>
          <div className="relative h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
              style={{
                width: `${levelProgress}%`,
                boxShadow: '0 0 8px rgba(34,211,238,0.5), 0 0 16px rgba(59,130,246,0.3)',
              }}
            />
            {/* Блик-анимация на шкале */}
            {levelProgress > 0 && (
              <div
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: 'data-flow 2s linear infinite' }}
              />
            )}
          </div>
        </div>

        {/* Достижения — счётчик */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {unlockedAchievements}/{totalAchievements}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <Star className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-slate-300">
              Lv.{level}
            </span>
          </div>
        </div>
      </div>

      {/* Модалка повышения уровня */}
      <LevelUpModal />
    </>
  );
}
