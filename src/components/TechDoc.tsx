import { useState, type ReactNode } from 'react';
import { FileText, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// ============================================================
// TechDoc — постраничная техническая документация.
// Каждая секция = один экран. Переключение по кнопкам
// "Вперед" и "Назад". Никакого длинного скроллинга.
// ============================================================

interface TechDocProps {
  title: string;
  sections: { heading: string; body: ReactNode }[];
}

export default function TechDoc({ title, sections }: TechDocProps) {
  const [current, setCurrent] = useState(0);
  const total = sections.length;
  const section = sections[current];
  const progress = Math.round(((current + 1) / total) * 100);

  const goNext = () => setCurrent((p) => Math.min(p + 1, total - 1));
  const goPrev = () => setCurrent((p) => Math.max(p - 1, 0));

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden flex flex-col">
      {/* Заголовок блока документации */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
          {title}
        </h3>
        <span className="ml-auto text-[10px] font-mono text-slate-600 shrink-0">
          {current + 1} / {total}
        </span>
      </div>

      {/* Прогресс-бар секций */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-1">
          {sections.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-cyan-400'
                  : i < current
                    ? 'bg-cyan-600/40'
                    : 'bg-slate-800'
              }`}
              style={i === current ? { boxShadow: '0 0 5px rgba(34,211,238,0.4)' } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Контент текущей секции */}
      <div className="px-4 py-3 flex-1 min-h-0 overflow-y-auto">
        {sections.map((s, i) => (
          <div key={i} className={i === current ? 'block animate-fade-in' : 'hidden'}>
            <h4 className="text-[13px] font-bold text-slate-200 mb-1.5">
              {s.heading}
            </h4>
            <div className="text-[12px] text-slate-400 leading-relaxed">
              {s.body}
            </div>
          </div>
        ))}
      </div>

      {/* Навигация — кнопки Вперед / Назад */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-800 shrink-0">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-[12px] font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Назад
        </button>

        <span className="text-[10px] font-mono text-slate-600 truncate max-w-[45%] text-center">
          {progress}% · {section.heading}
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
