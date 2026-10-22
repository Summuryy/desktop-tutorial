import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { GameProvider, useGame, XP_REWARDS } from '@/context/GameContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MemoryModule from '@/screens/modules/MemoryModule';
import ControlFlowModule from '@/screens/modules/ControlFlowModule';
import ArraysModule from '@/screens/modules/ArraysModule';
import AsyncApiModule from '@/screens/modules/AsyncApiModule';
import SandboxModule from '@/screens/modules/SandboxModule';
import SprintsModule from '@/screens/modules/SprintsModule';
import TeamIntegrationModule from '@/screens/modules/TeamIntegrationModule';
import ArchitectureModule from '@/screens/modules/ArchitectureModule';
import CyberBattleModule from '@/screens/modules/CyberBattleModule';
import AchievementsModule from '@/screens/modules/AchievementsModule';
import FlexboxModule from '@/screens/modules/FlexboxModule';
import type { ModuleId } from '@/types';

// ============================================================
// Корневой компонент: оболочка игрового дашборда.
// Управляет переключением модулей и состоянием прогресса.
// Архитектура: sidebar (navigation) + topbar (player profile) + main (content).
// ============================================================

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

function AppContent() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  // Активный модуль (по умолчанию — первый)
  const [activeModule, setActiveModule] = useState<ModuleId>('memory');
  // Множество посещённых модулей (для прогресс-бара)
  const [visited, setVisited] = useState<Set<ModuleId>>(new Set(['memory']));
  // Флаг мобильного меню
  const [mobileOpen, setMobileOpen] = useState(false);
  // Ключ для перезапуска анимации контента при смене модуля
  const [contentKey, setContentKey] = useState(0);

  // Обработчик выбора модуля
  const handleSelect = (id: ModuleId) => {
    setActiveModule(id);
    // Отмечаем модуль как посещённый (иммутабельное обновление Set)
    setVisited((prev) => {
      const next = new Set(prev);
      const isNew = !next.has(id);
      next.add(id);
      // XP за посещение нового модуля
      if (isNew) {
        addXp(XP_REWARDS.MODULE_VISIT, 'Посещение модуля');
        // Достижение "Первые шаги"
        if (!isAchievementUnlocked('first-steps')) {
          unlockAchievement('first-steps');
        }
      }
      // Достижение "Исследователь" — все модули посещены
      if (next.size === totalModules && !isAchievementUnlocked('explorer')) {
        unlockAchievement('explorer');
      }
      return next;
    });
    setMobileOpen(false);
    // Инкремент ключа → React размонтирует и смонтирует контент заново
    setContentKey((k) => k + 1);
  };

  // Подсчёт прогресса: 10 модулей → процент посещённых
  const totalModules = 11;
  const progress = Math.round((visited.size / totalModules) * 100);

  // Маппинг идентификаторов на компоненты модулей
  const renderModule = () => {
    switch (activeModule) {
      case 'memory':
        return <MemoryModule />;
      case 'control-flow':
        return <ControlFlowModule />;
      case 'arrays':
        return <ArraysModule />;
      case 'async-api':
        return <AsyncApiModule />;
      case 'sandbox':
        return <SandboxModule />;
      case 'sprints':
        return <SprintsModule />;
      case 'team-integration':
        return <TeamIntegrationModule />;
      case 'architecture':
        return <ArchitectureModule />;
      case 'cyber-battle':
        return <CyberBattleModule />;
      case 'achievements':
        return <AchievementsModule />;
      case 'flexbox-ui':
        return <FlexboxModule />;
      default:
        return <MemoryModule />;
    }
  };

  // Отметка первого модуля как посещённого при монтировании
  useEffect(() => {
    setVisited((prev) => new Set(prev).add('memory'));
    if (!isAchievementUnlocked('first-steps')) {
      unlockAchievement('first-steps');
    }
  }, [isAchievementUnlocked, unlockAchievement]);

  return (
      <div className="flex h-screen bg-[#0B0F19] text-slate-200 font-sans overflow-hidden">
          {/* Навигация — боковая панель */}
        <Sidebar
          activeModule={activeModule}
          onSelect={handleSelect}
          visited={visited}
          progress={progress}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Основная область */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Верхний бар с профилем игрока и XP */}
          <TopBar />

          {/* Мобильный хедер */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-2.5 bg-[#0D1117] border-b border-slate-800">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center"
            >
              <Menu className="w-4.5 h-4.5 text-slate-400" />
            </button>
            <span className="text-sm font-bold text-slate-300 font-mono">Dev Architecture</span>
          </header>

          {/* Контент модуля */}
          <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
            <div key={contentKey} className="max-w-4xl mx-auto animate-fade-in">
              {renderModule()}
            </div>
          </div>
        </main>
      </div>
  );
}
