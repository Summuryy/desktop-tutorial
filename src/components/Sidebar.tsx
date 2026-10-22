import {
  Cpu,
  GitBranch,
  ListTree,
  Network,
  Code2,
  ClipboardList,
  Users,
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
    subtitle: 'var, let, const, String, Int, Bool, Array, Object',
    icon: 'Cpu',
  },
  {
    id: 'control-flow',
    index: '02',
    title: 'Control Flow',
    subtitle: 'if, else if, switch, &&, ||, !',
    icon: 'GitBranch',
  },
  {
    id: 'arrays',
    index: '03',
    title: 'Arrays & Iteration',
    subtitle: 'for, while, .map(), .filter()',
    icon: 'ListTree',
  },
  {
    id: 'async-api',
    index: '04',
    title: 'Async & API',
    subtitle: 'Functions, Promises, Async/Await, HTTP states',
    icon: 'Network',
  },
  {
    id: 'sandbox',
    index: '05',
    title: 'Code Sandbox',
    subtitle: 'Live editor, code execution, error output',
    icon: 'Code2',
  },
  {
    id: 'sprints',
    index: '06',
    title: 'Eng. Sprints',
    subtitle: '5 challenges, auto-grading, unit tests',
    icon: 'ClipboardList',
  },
  {
    id: 'team-integration',
    index: '07',
    title: 'Team Integration',
    subtitle: 'JWT, Offline/SQL sync, Git merge conflicts',
    icon: 'Users',
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
};

interface SidebarProps {
  activeModule: ModuleId;
  onSelect: (id: ModuleId) => void;
  visited: Set<ModuleId>;
  progress: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  activeModule,
  onSelect,
  visited,
  progress,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
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
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-slate-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-200">Dev Architecture</h1>
              <p className="text-[10px] text-slate-500 font-mono">Interactive Reference</p>
            </div>
          </div>
        </div>

        {/* Прогресс-бар прохождения модулей */}
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-300">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Список модулей */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {MODULES.map((mod) => {
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
                      ? 'bg-slate-300 animate-pulse-soft'
                      : isVisited
                        ? 'bg-slate-500'
                        : 'bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Подвал */}
        <div className="px-5 py-3 border-t border-slate-800">
          <p className="text-[9px] text-slate-600 font-mono leading-relaxed">
            TypeScript / Swift / Dart
            <br />
            Reference implementation
          </p>
        </div>
      </aside>
    </>
  );
}
