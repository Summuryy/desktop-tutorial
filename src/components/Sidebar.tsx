import {
  Cpu,
  GitBranch,
  ListTree,
  Network,
  Code2,
  ClipboardList,
  Users,
  Zap,
  Swords,
  Award,
  Smartphone,
} from 'lucide-react';
import type { ModuleId, ModuleInfo } from '@/types';

// ============================================================
// Конфигурация модулей — порядок и метаданные навигации
// ============================================================

export const MODULES: ModuleInfo[] = [
  {
    id: 'memory',
    index: '01',
    title: 'Memory & Types',
    subtitle: 'var, let, const, String, Int, Bool',
    icon: 'Cpu',
  },
  {
    id: 'control-flow',
    index: '02',
    title: 'Control Flow',
    subtitle: 'if, else, switch, &&, ||, !',
    icon: 'GitBranch',
  },
  {
    id: 'arrays',
    index: '03',
    title: 'Arrays & Iteration',
    subtitle: 'for, .map(), .filter()',
    icon: 'ListTree',
  },
  {
    id: 'async-api',
    index: '04',
    title: 'Async & API',
    subtitle: 'Promises, Async/Await, HTTP',
    icon: 'Network',
  },
  {
    id: 'sandbox',
    index: '05',
    title: 'Code Sandbox',
    subtitle: 'Live editor, AI Mentor',
    icon: 'Code2',
  },
  {
    id: 'sprints',
    index: '06',
    title: 'Eng. Sprints',
    subtitle: '5 задач, автопроверка, XP',
    icon: 'ClipboardList',
  },
  {
    id: 'team-integration',
    index: '07',
    title: 'Team Integration',
    subtitle: 'JWT, Offline sync, Git merge',
    icon: 'Users',
  },
  {
    id: 'architecture',
    index: '08',
    title: 'Architecture Map',
    subtitle: 'Путь данных: UI → Сеть → Сервер → БД',
    icon: 'Zap',
  },
  {
    id: 'cyber-battle',
    index: '09',
    title: 'CyberSec Battle',
    subtitle: 'Мини-игра: отрази хакерские атаки',
    icon: 'Swords',
  },
  {
    id: 'achievements',
    index: '10',
    title: 'Мои Достижения',
    subtitle: 'Бейджи, уровни, титулы, XP',
    icon: 'Award',
  },
  {
    id: 'flexbox-ui',
    index: '11',
    title: 'Flexbox UI',
    subtitle: 'Flexbox, верстка, экран смартфона',
    icon: 'Smartphone',
  },
];

// Карта иконок: ключ из ModuleInfo.icon → компонент lucide-react
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  GitBranch,
  ListTree,
  Network,
  Code2,
  ClipboardList,
  Users,
  Zap,
  Swords,
  Award,
  Smartphone,
};

interface SidebarProps {
  activeModule: ModuleId;
  onSelect: (id: ModuleId) => void;
  visited: Set<ModuleId>;
  progress: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// Разделение модулей на секции для навигации
const LEARNING_MODULES = MODULES.slice(0, 7).concat(MODULES[10] ? [MODULES[10]] : []);
const GAME_MODULES = MODULES.slice(7, 10);

export default function Sidebar({
  activeModule,
  onSelect,
  visited,
  progress,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const renderModuleButton = (mod: ModuleInfo) => {
    const Icon = ICONS[mod.icon];
    const isActive = activeModule === mod.id;
    const isVisited = visited.has(mod.id);

    return (
      <button
        key={mod.id}
        onClick={() => onSelect(mod.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
          isActive
            ? 'bg-slate-800/80 border border-slate-700'
            : 'border border-transparent hover:bg-slate-800/40'
        }`}
      >
        {/* Индекс модуля / иконка */}
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
            isActive
              ? 'bg-slate-700 border border-slate-600'
              : isVisited
                ? 'bg-slate-800/60 border border-slate-700/50'
                : 'bg-slate-900/40 border border-slate-800'
          }`}
        >
          <Icon className={`w-4 h-4 ${isActive ? 'text-slate-200' : 'text-slate-500'}`} />
        </div>

        {/* Текст */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-600">{mod.index}</span>
            <p className={`text-[13px] font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
              {mod.title}
            </p>
          </div>
          <p className="text-[10px] text-slate-600 truncate font-mono">{mod.subtitle}</p>
        </div>

        {/* Индикатор статуса */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isActive
              ? 'bg-cyan-400 animate-pulse-soft'
              : isVisited
                ? 'bg-slate-500'
                : 'bg-slate-700'
          }`}
        />
      </button>
    );
  };

  return (
    <>
      {/* Затемнение на мобильных устройствах */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0D1117] border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Заголовок приложения */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/40 flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-200">Dev Architecture</h1>
              <p className="text-[10px] text-cyan-500/60 font-mono">Interactive Game</p>
            </div>
          </div>
        </div>

        {/* Прогресс-бар прохождения модулей */}
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-300">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 6px rgba(34,211,238,0.4)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Список модулей */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* Учебные модули */}
          <div className="px-1 py-1">
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">
              Обучение
            </span>
          </div>
          {LEARNING_MODULES.map(renderModuleButton)}

          {/* Игровые модули */}
          <div className="px-1 py-1 pt-3">
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">
              Игра & Достижения
            </span>
          </div>
          {GAME_MODULES.map(renderModuleButton)}
        </nav>

        {/* Подвал */}
        <div className="px-5 py-3 border-t border-slate-800">
          <p className="text-[9px] text-slate-600 font-mono leading-relaxed">
            TypeScript / Swift / Dart
            <br />
            RPG Learning System
          </p>
        </div>
      </aside>
    </>
  );
}
