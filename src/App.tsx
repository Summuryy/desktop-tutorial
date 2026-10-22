import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MemoryModule from '@/screens/modules/MemoryModule';
import ControlFlowModule from '@/screens/modules/ControlFlowModule';
import ArraysModule from '@/screens/modules/ArraysModule';
import AsyncApiModule from '@/screens/modules/AsyncApiModule';
import SandboxModule from '@/screens/modules/SandboxModule';
import SprintsModule from '@/screens/modules/SprintsModule';
import TeamIntegrationModule from '@/screens/modules/TeamIntegrationModule';
import type { ModuleId } from '@/types';

// ============================================================
// Корневой компонент: оболочка дашборда.
// Управляет переключением модулей и состоянием прогресса.
// Архитектура: sidebar (navigation) + main (content area).
// Контент рендерится через key-based remount для анимации.
// ============================================================

export default function App() {
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
      next.add(id);
      return next;
    });
    setMobileOpen(false);
    // Инкремент ключа → React размонтирует и смонтирует контент заново
    setContentKey((k) => k + 1);
  };

  // Подсчёт прогресса: 4 модуля → процент посещённых
  const totalModules = 7;
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
      default:
        return <MemoryModule />;
    }
  };

  // Отметка первого модуля как посещённого при монтировании
  useEffect(() => {
    setVisited((prev) => new Set(prev).add('memory'));
  }, []);

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
        {/* Мобильный хедер */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#0D1117] border-b border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center"
          >
            <Menu className="w-4.5 h-4.5 text-slate-400" />
          </button>
          <span className="text-sm font-bold text-slate-300 font-mono">Dev Architecture</span>
        </header>

        {/* Прокручиваемый контент модуля */}
        <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-10 lg:py-8">
          {/* key={contentKey} → перезапуск mount-анимации при смене модуля */}
          <div key={contentKey} className="max-w-5xl mx-auto animate-fade-in">
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
}
