import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';

// ============================================================
// PaginatedTasks — постраничный вывод практических задач.
// Одна задача = один экран. Переключение по кнопкам
// "Вперед" и "Назад".
// ============================================================

interface PaginatedTasksProps {
  title: string;
  intro?: string;
  tasks: { id: number; title: string; content: ReactNode }[];
  progressBars?: boolean[];
  allDone?: boolean;
  doneMessage?: string;
}

export default function PaginatedTasks({
  title,
  intro,
  tasks,
  progressBars,
  allDone,
  doneMessage,
}: PaginatedTasksProps) {
  const [current, setCurrent] = useState(0);
  const total = tasks.length;
  const task = tasks[current];
  const progress = Math.round(((current + 1) / total) * 100);

  const goNext = () => setCurrent((p) => Math.min(p + 1, total - 1));
  const goPrev = () => setCurrent((p) => Math.max(p - 1, 0));

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5 flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-1 shrink-0">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        <span className="ml-auto text-[10px] font-mono text-slate-600 shrink-0">
          {current + 1} / {total}
        </span>
      </div>

      {intro && <p className="text-[11px] text-slate-600 mb-3 shrink-0">{intro}</p>}

      {/* Прогресс-бар задач */}
      <div className="flex items-center gap-1.5 mb-4 shrink-0">
        {(progressBars ?? tasks.map(() => false)).map((done, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i === current
                ? 'bg-cyan-400'
                : done
                  ? 'bg-emerald-500'
                  : i < current
                    ? 'bg-cyan-600/40'
                    : 'bg-slate-800'
            }`}
            style={
              i === current
                ? { boxShadow: '0 0 5px rgba(34,211,238,0.4)' }
                : done
                  ? { boxShadow: '0 0 6px rgba(16,185,129,0.4)' }
                  : undefined
            }
          />
        ))}
      </div>

      {/* Контент текущей задачи */}
      <div className="flex-1 min-h-0">
        {tasks.map((t, i) => (
          <div key={t.id} className={i === current ? 'block animate-fade-in' : 'hidden'}>
            {t.content}
          </div>
        ))}
      </div>

      {/* Все задачи выполнены */}
      {allDone && doneMessage && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2 animate-fade-in shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[12px] text-emerald-300">{doneMessage}</p>
        </div>
      )}

      {/* Навигация */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 shrink-0">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-[12px] font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Назад
        </button>

        <span className="text-[10px] font-mono text-slate-600 truncate max-w-[45%] text-center">
          {progress}% · Задача {task.id}
        </span>

        {current < total - 1 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-[12px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all"
          >
            Вперед
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[12px] font-semibold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Готово
          </div>
        )}
      </div>
    </div>
  );
}
