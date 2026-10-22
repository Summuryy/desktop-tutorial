import { useGame } from '@/context/GameContext';
import { LEVELS } from '@/data/game';
import {
  Footprints, Cpu, ShieldCheck, ListTree, Network, Play,
  ClipboardList, Trophy, KeyRound, GitMerge, Workflow,
  ShieldAlert, Compass, Star, Crown, Lock, Award,
} from 'lucide-react';
import type { Achievement } from '@/types';

// ============================================================
// Модуль: Мои Достижения — коллекция бейджей
// Показывает заблокированные/разблокированные достижения
// и прогресс по уровням
// ============================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints, Cpu, ShieldCheck, ListTree, Network, Play,
  ClipboardList, Trophy, KeyRound, GitMerge, Workflow,
  ShieldAlert, Compass, Star, Crown,
};

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: 'border-slate-600/40', bg: 'bg-slate-700/20', text: 'text-slate-300', glow: '' },
  rare: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-300', glow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]' },
  epic: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-300', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]' },
  legendary: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-300', glow: 'shadow-[0_0_16px_rgba(244,63,94,0.3)]' },
};

function getRarity(achievement: Achievement): keyof typeof RARITY_COLORS {
  if (achievement.xpReward >= 150) return 'legendary';
  if (achievement.xpReward >= 75) return 'epic';
  if (achievement.xpReward >= 40) return 'rare';
  return 'common';
}

function getRarityLabel(rarity: keyof typeof RARITY_COLORS): string {
  switch (rarity) {
    case 'legendary': return 'Легендарное';
    case 'epic': return 'Эпическое';
    case 'rare': return 'Редкое';
    default: return 'Обычное';
  }
}

export default function AchievementsModule() {
  const {
    achievements,
    unlockedAchievements,
    totalAchievements,
    xp,
    level,
    title,
  } = useGame();

  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return b.xpReward - a.xpReward;
  });

  const completionPercent = Math.round((unlockedAchievements / totalAchievements) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Мои Достижения</h2>
          <p className="text-[12px] text-slate-500 font-mono">
            {unlockedAchievements} / {totalAchievements} разблокировано · {completionPercent}% завершено
          </p>
        </div>
      </div>

      {/* Сводка профиля */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Уровень</p>
          <p className="text-2xl font-bold text-cyan-300 font-mono">{level}</p>
          <p className="text-[11px] text-slate-500">{title}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Всего XP</p>
          <p className="text-2xl font-bold text-cyan-300 font-mono">{xp.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Заработано опыта</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Достижения</p>
          <p className="text-2xl font-bold text-amber-300 font-mono">{unlockedAchievements}</p>
          <p className="text-[11px] text-slate-500">из {totalAchievements} бейджей</p>
        </div>
      </div>

      {/* Прогресс-бар достижений */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Коллекция бейджей
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-300">{completionPercent}%</span>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700"
            style={{
              width: `${completionPercent}%`,
              boxShadow: completionPercent > 0 ? '0 0 8px rgba(245,158,11,0.4), 0 0 16px rgba(244,63,94,0.2)' : 'none',
            }}
          />
        </div>
      </div>

      {/* Карточки достижений */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedAchievements.map((ach) => {
          const Icon = ICON_MAP[ach.icon] ?? Trophy;
          const rarity = getRarity(ach);
          const colors = RARITY_COLORS[rarity];

          return (
            <div
              key={ach.id}
              className={`relative rounded-xl border p-4 transition-all duration-300 ${
                ach.unlocked
                  ? `${colors.border} ${colors.bg} ${colors.glow}`
                  : 'border-slate-800 bg-slate-900/20'
              }`}
            >
              {/* Иконка */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.unlocked
                      ? `${colors.bg} ${colors.border} border`
                      : 'bg-slate-800/40 border border-slate-800'
                  }`}
                >
                  {ach.unlocked ? (
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold leading-tight ${
                    ach.unlocked ? 'text-slate-100' : 'text-slate-600'
                  }`}>
                    {ach.name}
                  </p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border mt-1 inline-block ${
                    ach.unlocked
                      ? `${colors.border} ${colors.text}`
                      : 'border-slate-800 text-slate-700'
                  }`}>
                    {getRarityLabel(rarity)}
                  </span>
                </div>
              </div>

              {/* Описание */}
              <p className={`text-[11px] leading-relaxed mb-3 ${
                ach.unlocked ? 'text-slate-400' : 'text-slate-700'
              }`}>
                {ach.description}
              </p>

              {/* Награда XP */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono ${
                  ach.unlocked ? 'text-cyan-400' : 'text-slate-700'
                }`}>
                  +{ach.xpReward} XP
                </span>
                {ach.unlocked && ach.unlockedAt && (
                  <span className="text-[9px] font-mono text-slate-600">
                    {new Date(ach.unlockedAt).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>

              {/* Эффект разблокировки */}
              {ach.unlocked && (
                <div
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Дорожка уровней (титулы) */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Дорожка титулов
          </h3>
        </div>
        <div className="space-y-2">
          {LEVELS.map((lv) => {
            const isUnlocked = xp >= lv.minXp;
            const isCurrent = level === lv.level;
            return (
              <div
                key={lv.level}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'border-cyan-500/40 bg-cyan-500/10'
                    : isUnlocked
                      ? 'border-slate-700/40 bg-slate-800/20'
                      : 'border-slate-800/50 bg-slate-900/10 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[12px] ${
                  isUnlocked ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-600 border border-slate-800'
                }`}>
                  {lv.level}
                </div>
                <span className={`text-[13px] font-semibold flex-1 ${
                  isUnlocked ? 'text-slate-200' : 'text-slate-600'
                }`}>
                  {lv.title}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
                    Вы здесь
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-600">
                  {lv.minXp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
