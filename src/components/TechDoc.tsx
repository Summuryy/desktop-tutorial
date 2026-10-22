import type { ReactNode } from 'react';
import { FileText } from 'lucide-react';

// ============================================================
// Переиспользуемый блок "Техническая документация"
// Сухое, технически точное описание стандартов программирования
// ============================================================

interface TechDocProps {
  title: string;
  sections: { heading: string; body: ReactNode }[];
}

export default function TechDoc({ title, sections }: TechDocProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
      {/* Заголовок блока документации */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <FileText className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      {/* Секции документации */}
      <div className="px-4 py-4 space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            <h4 className="text-[13px] font-bold text-slate-200 mb-1.5">
              {section.heading}
            </h4>
            <div className="text-[12px] text-slate-400 leading-relaxed">
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
