import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  LEVELS,
  ACHIEVEMENTS,
  getLevelByXp,
  getLevelProgress,
  getXpToNextLevel,
  XP_REWARDS,
} from '@/data/game';
import type { Achievement } from '@/types';

// ============================================================
// Глобальный игровой контекст
// Управляет XP, уровнями, достижениями и модалкой повышения уровня
// ============================================================

export interface GameContextValue {
  playerName: string;
  xp: number;
  level: number;
  title: string;
  levelProgress: number;
  xpToNext: number;
  achievements: Achievement[];
  totalAchievements: number;
  unlockedAchievements: number;
  levelUpData: LevelUpData | null;
  dismissLevelUp: () => void;
  addXp: (amount: number, reason?: string) => void;
  unlockAchievement: (id: string) => void;
  isAchievementUnlocked: (id: string) => boolean;
}

interface LevelUpData {
  newLevel: number;
  newTitle: string;
  xpGained: number;
}

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEY = 'dev-arch-game-state';

interface StoredState {
  xp: number;
  unlockedAchievements: string[];
}

function loadStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // ignore
  }
  return null;
}

function saveState(xp: number, unlockedIds: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp, unlockedAchievements: unlockedIds }));
  } catch {
    // ignore
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const stored = loadStoredState();

  const [xp, setXp] = useState<number>(stored?.xp ?? 0);
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const unlockedSet = new Set(stored?.unlockedAchievements ?? []);
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlockedSet.has(a.id),
    }));
  });
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [prevLevel, setPrevLevel] = useState<number>(() => getLevelByXp(stored?.xp ?? 0).level);

  // Сохранение в localStorage при изменении состояния
  useEffect(() => {
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);
    saveState(xp, unlockedIds);
  }, [xp, achievements]);

  // Проверка повышения уровня
  useEffect(() => {
    const currentLevel = getLevelByXp(xp);
    if (currentLevel.level > prevLevel) {
      setLevelUpData({
        newLevel: currentLevel.level,
        newTitle: currentLevel.title,
        xpGained: 0, // устанавливается в addXp
      });
    }
    setPrevLevel(currentLevel.level);
  }, [xp, prevLevel]);

  const currentLevelInfo = getLevelByXp(xp);
  const levelProgress = getLevelProgress(xp);
  const xpToNext = getXpToNextLevel(xp);
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  const addXp = useCallback((amount: number, reason?: string) => {
    setXp((prev) => {
      const newXp = prev + amount;
      const oldLevel = getLevelByXp(prev).level;
      const newLevel = getLevelByXp(newXp).level;

      if (newLevel > oldLevel) {
        const levelInfo = LEVELS[newLevel - 1];
        setLevelUpData({
          newLevel: newLevel,
          newTitle: levelInfo.title,
          xpGained: amount,
        });
      }

      // Проверка достижений за уровень
      if (newLevel >= 5) {
        setAchievements((prevAch) => {
          const updated = [...prevAch];
          const idx = updated.findIndex((a) => a.id === 'level-5');
          if (idx >= 0 && !updated[idx].unlocked) {
            updated[idx] = { ...updated[idx], unlocked: true, unlockedAt: Date.now() };
          }
          return updated;
        });
      }
      if (newLevel >= 10) {
        setAchievements((prevAch) => {
          const updated = [...prevAch];
          const idx = updated.findIndex((a) => a.id === 'level-10');
          if (idx >= 0 && !updated[idx].unlocked) {
            updated[idx] = { ...updated[idx], unlocked: true, unlockedAt: Date.now() };
          }
          return updated;
        });
      }

      return newXp;
    });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const idx = prev.findIndex((a) => a.id === id);
      if (idx < 0 || prev[idx].unlocked) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], unlocked: true, unlockedAt: Date.now() };
      const reward = updated[idx].xpReward;
      // Начисляем XP за достижение
      setTimeout(() => addXp(reward, `Достижение: ${updated[idx].name}`), 300);
      return updated;
    });
  }, [addXp]);

  const isAchievementUnlocked = useCallback(
    (id: string) => achievements.some((a) => a.id === id && a.unlocked),
    [achievements],
  );

  const dismissLevelUp = useCallback(() => setLevelUpData(null), []);

  const value: GameContextValue = {
    playerName: 'Криштиан Михайлович',
    xp,
    level: currentLevelInfo.level,
    title: currentLevelInfo.title,
    levelProgress,
    xpToNext,
    achievements,
    totalAchievements: ACHIEVEMENTS.length,
    unlockedAchievements,
    levelUpData,
    dismissLevelUp,
    addXp,
    unlockAchievement,
    isAchievementUnlocked,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { XP_REWARDS };
