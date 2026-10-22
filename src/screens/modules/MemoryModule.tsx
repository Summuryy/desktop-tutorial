import { useState } from 'react';
import { Cpu, Plus, Trash2, MemoryStick } from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import type { MemoryCell, DataType } from '@/types';

// ============================================================
// Модуль 01: Memory Allocation & Data Types
// Визуализация выделения ячеек памяти при инициализации
// переменных различных типов в реальном времени.
// ============================================================

// Условный размер типа данных в байтах (для визуализации)
const TYPE_SIZE: Record<DataType, number> = {
  String: 24,
  Integer: 8,
  Boolean: 1,
  Array: 16,
  Object: 32,
};

// Выведение типа данных из строкового значения (type inference)
function inferType(value: string): DataType {
  const v = value.trim();
  if (v === 'true' || v === 'false') return 'Boolean';
  if (/^-?\d+$/.test(v)) return 'Integer';
  if (v.startsWith('[') && v.endsWith(']')) return 'Array';
  if (v.startsWith('{') && v.endsWith('}')) return 'Object';
  return 'String';
}

// Цветовая схема для бейджей типов
const TYPE_STYLES: Record<DataType, string> = {
  String: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Integer: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Boolean: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Array: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Object: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

// Цветовая схема для ключевых слов объявления
const KEYWORD_STYLES: Record<string, string> = {
  var: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  let: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  const: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function MemoryModule() {
  // Поля ввода формы
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [keyword, setKeyword] = useState<'var' | 'let' | 'const'>('let');
  // Массив ячеек памяти
  const [cells, setCells] = useState<MemoryCell[]>([]);

  // Выделение памяти: создание новой ячейки
  const allocate = () => {
    if (!name.trim() || !value.trim()) return;
    const type = inferType(value);
    const cell: MemoryCell = {
      id: `mem-${Date.now()}`,
      keyword,
      name: name.trim(),
      type,
      value: value.trim(),
      size: TYPE_SIZE[type],
      mutable: keyword === 'var',
    };
    // Если переменная с таким именем существует — перезаписываем (reassign)
    setCells((prev) => {
      const filtered = prev.filter((c) => c.name !== cell.name);
      return [...filtered, cell];
    });
    setName('');
    setValue('');
  };

  // Освобождение памяти: удаление одной ячейки
  const deallocate = (id: string) => {
    setCells((prev) => prev.filter((c) => c.id !== id));
  };

  // Очистка всей памяти
  const clearAll = () => setCells([]);

  // Подсчёт суммарного "выделенного" объёма
  const totalSize = cells.reduce((sum, c) => sum + c.size, 0);

  // Предпросмотр выводимого типа
  const previewType = value.trim() ? inferType(value) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Memory Allocation & Data Types</h2>
          <p className="text-[12px] text-slate-500 font-mono">var · let · const · String · Integer · Boolean · Array · Object</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation"
        sections={[
          {
            heading: 'Мутабельность и иммутабельность',
            body: (
              <p>
                <span className="font-mono text-indigo-400">var</span> — мутабельная переменная,
                допускает реассигн (присваивание нового значения после инициализации).
                <span className="font-mono text-emerald-400"> let</span> (Swift) и
                <span className="font-mono text-amber-400"> const</span> (TS/JS) — иммутабельные
                привязки: значение фиксируется один раз, повторное присваивание вызывает
                ошибку компиляции. В Swift предпочтителен <span className="font-mono">let</span>,
                <span className="font-mono"> var</span> — только при необходимости мутации состояния.
              </p>
            ),
          },
          {
            heading: 'Строгая типизация',
            body: (
              <p>
                Swift и TypeScript используют строгую статическую типизацию: тип переменной
                определяется на этапе компиляции (или транспиляции). Несовпадение типов
                блокирует сборку. Type inference (выведение типа) позволяет не указывать тип
                явно — компилятор выводит его из литерала значения.
              </p>
            ),
          },
          {
            heading: 'Примитивы и ссылочные типы',
            body: (
              <p>
                <span className="font-mono text-sky-400">String</span>,
                <span className="font-mono text-emerald-400"> Integer (Int)</span>,
                <span className="font-mono text-pink-400"> Boolean (Bool)</span> — примитивы,
                хранятся по значению (value type).
                <span className="font-mono text-amber-400"> Array</span> и
                <span className="font-mono text-purple-400"> Object / Dictionary</span> —
                ссылочные (reference type) в JS/TS; в Swift Array и Dictionary — value type
                (структуры с copy-on-write семантикой).
              </p>
            ),
          },
        ]}
      />

      {/* Форма инициализации переменной */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Variable Declaration
        </h3>

        {/* Выбор ключевого слова */}
        <div className="flex gap-2 mb-3">
          {(['let', 'var', 'const'] as const).map((kw) => (
            <button
              key={kw}
              onClick={() => setKeyword(kw)}
              className={`flex-1 py-2 rounded-lg font-mono text-[13px] font-bold border transition-colors ${
                keyword === kw
                  ? KEYWORD_STYLES[kw]
                  : 'bg-slate-900/40 border-slate-800 text-slate-600'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Поля ввода */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && allocate()}
            placeholder="identifier"
            className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && allocate()}
            placeholder='value (e.g. "hello", 42, true)'
            className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
          />
        </div>

        {/* Предпросмотр выведенного типа */}
        {previewType && (
          <p className="text-[11px] text-slate-600 font-mono mb-3">
            Inferred type: <span className={`font-bold border px-1.5 py-0.5 rounded ${TYPE_STYLES[previewType]}`}>
              {previewType}
            </span>{' '}
            · allocated size: {TYPE_SIZE[previewType]} bytes
          </p>
        )}

        {/* Кнопка аллокации */}
        <button
          onClick={allocate}
          disabled={!name.trim() || !value.trim()}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-2.5 text-[13px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Allocate Memory
        </button>
      </div>

      {/* Визуализация памяти — ячейки */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Memory Heap
            </h3>
          </div>
          {cells.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                {cells.length} cells · {totalSize}B
              </span>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-rose-500/70 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Deallocate All
              </button>
            </div>
          )}
        </div>

        {cells.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-8 text-center">
            <p className="text-[12px] text-slate-700 font-mono">Heap is empty — allocate a variable above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cells.map((cell) => (
              <div
                key={cell.id}
                className="animate-cell-in rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 group hover:border-slate-700 transition-colors"
              >
                {/* Строка объявления */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${KEYWORD_STYLES[cell.keyword]}`}>
                    {cell.keyword}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${TYPE_STYLES[cell.type]}`}>
                    {cell.type}
                  </span>
                  {cell.mutable && (
                    <span className="text-[9px] font-mono text-indigo-500/70 ml-auto">mutable</span>
                  )}
                </div>

                {/* Значение */}
                <p className="font-mono text-[13px] text-slate-200 truncate">
                  <span className="text-slate-500">{cell.name}</span>
                  <span className="text-slate-700"> = </span>
                  <span className="text-amber-300/90">{cell.value}</span>
                </p>

                {/* Адрес / размер */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-700">
                    0x{cell.id.slice(-6).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-700">{cell.size}B</span>
                    <button
                      onClick={() => deallocate(cell.id)}
                      className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
