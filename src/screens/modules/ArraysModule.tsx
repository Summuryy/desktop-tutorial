import { useState } from 'react';
import { ListTree, Plus, Trash2, Filter, RotateCcw } from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import type { DataItem } from '@/types';

// ============================================================
// Модуль 03: Array Methods & Iteration
// Динамический список: push() в стек и автоматическая отрисовка
// через .map(). Фильтрация списка по условию через .filter().
// ============================================================

// Набор слов для генерации элементов
const LABELS = ['auth_token', 'user_session', 'cache_entry', 'api_key', 'db_connection', 'queue_job', 'webhook_payload', 'config_flag', 'rate_limit', 'ws_handle'];
let idCounter = 0;

// Генерация нового элемента массива
function createItem(): DataItem {
  const label = LABELS[idCounter % LABELS.length];
  const value = Math.floor(Math.random() * 1000);
  idCounter++;
  return {
    id: `item-${idCounter}`,
    label: `${label}_${idCounter}`,
    value,
    active: Math.random() > 0.4, // ~60% элементов активны
  };
}

export default function ArraysModule() {
  // Исходный массив элементов (stack)
  const [items, setItems] = useState<DataItem[]>(() =>
    Array.from({ length: 3 }, createItem)
  );
  // Активный фильтр: 'all' | 'active' | 'inactive'
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // push() — добавление элемента в конец массива (стек)
  const push = () => {
    setItems((prev) => [...prev, createItem()]);
  };

  // Удаление элемента по id — иммутабельная фильтрация
  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Очистка массива
  const clear = () => {
    setItems([]);
  };

  // Применение .filter() — иммутабельная выборка по условию
  // Это фундаментальный паттерн для рендеринга списков в UI
  const filteredItems = items.filter((item) => {
    if (filter === 'active') return item.active;
    if (filter === 'inactive') return !item.active;
    return true;
  });

  // Подсчёт статистики
  const activeCount = items.filter((i) => i.active).length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <ListTree className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Array Methods & Iteration</h2>
          <p className="text-[12px] text-slate-500 font-mono">for · while · .map() · .filter() — iterable processing</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation"
        sections={[
          {
            heading: 'Итерируемые объекты и циклы',
            body: (
              <p>
                Массив (Array) — упорядоченная коллекция с индексным доступом от 0 до
                <span className="font-mono text-slate-300"> count - 1</span>. Итерация —
                последовательный обход всех элементов.
                <span className="font-mono text-slate-300"> for</span> — цикл со счётчиком
                (index-based). <span className="font-mono text-slate-300"> while</span> —
                цикл с предусловием, выполняется пока выражение true. В Swift:
                <span className="font-mono text-slate-300"> for item in collection</span> —
                for-in синтаксис без явного индекса.
              </p>
            ),
          },
          {
            heading: '.map() — трансформация коллекции',
            body: (
              <p>
                <span className="font-mono text-slate-300">.map(callback)</span> — создаёт
                новый массив, применяя callback-функцию к каждому элементу исходного.
                Возвращает массив той же длины. Фундаментальный метод для рендеринга
                списков в React/Flutter: <span className="font-mono text-slate-300">
                items.map(item =&gt; &lt;Row key={"{item.id}"} /&gt;)</span>.
                Key — обязательный prop для reconciliation (diffing algorithm).
              </p>
            ),
          },
          {
            heading: '.filter() — условная выборка',
            body: (
              <p>
                <span className="font-mono text-slate-300">.filter(predicate)</span> —
                возвращает новый массив, содержащий только элементы, для которых
                predicate вернул <span className="font-mono text-emerald-400">true</span>.
                Не мутирует исходный массив (pure function). Используется для условного
                рендеринга подсписков, поиска, пагинации.
              </p>
            ),
          },
        ]}
      />

      {/* Панель управления */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Stack Operations
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>items.length = <span className="text-slate-300">{items.length}</span></span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400">{activeCount} active</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">{inactiveCount} inactive</span>
          </div>
        </div>

        {/* Кнопки операций */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={push}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-2.5 text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-mono">items.push()</span>
          </button>
          <button
            onClick={clear}
            className="bg-slate-800 border border-slate-700 text-slate-400 rounded-lg px-3.5 py-2.5 text-[13px] hover:text-rose-400 hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Фильтр */}
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-mono text-slate-500">
            .filter(item =&gt; ...)
          </span>
        </div>
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-mono font-medium border transition-colors ${
                filter === f
                  ? 'bg-slate-800 border-slate-600 text-slate-200'
                  : 'bg-slate-900/30 border-slate-800 text-slate-600'
              }`}
            >
              {f === 'all' ? 'item.*' : f === 'active' ? 'item.active' : '!item.active'}
            </button>
          ))}
        </div>

        {/* Результат .filter() — выводит количество после фильтрации */}
        <p className="text-[11px] font-mono text-slate-600 mb-3">
          filtered = items.filter(predicate) → {filteredItems.length} results
        </p>
      </div>

      {/* Рендеринг списка через .map() */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Rendered List — .map() output
        </h3>

        {filteredItems.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-8 text-center">
            <p className="text-[12px] text-slate-700 font-mono">
              {items.length === 0
                ? 'Array is empty — call push() to add elements'
                : 'No items match the current filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-cell-in flex items-center gap-3 rounded-lg px-4 py-2.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                {/* Индекс элемента */}
                <span className="text-[11px] font-mono text-slate-700 w-6 text-right">
                  {index}
                </span>
                {/* Статус-индикатор */}
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.active ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                />
                {/* Лейбл */}
                <span className="font-mono text-[13px] text-slate-300 flex-1 min-w-0 truncate">
                  {item.label}
                </span>
                {/* Значение */}
                <span className="font-mono text-[12px] text-slate-600">
                  = {item.value}
                </span>
                {/* Кнопка удаления */}
                <button
                  onClick={() => remove(item.id)}
                  className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Псевдокод рендеринга */}
        <div className="mt-4 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
            Rendering Pipeline
          </p>
          <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`const filtered = items.filter(item => {
  switch (filter) {
    case "active":   return item.active
    case "inactive": return !item.active
    default:         return true
  }
})

filtered.map((item, index) => (
  <Row key={item.id} data={item} />
))`}
          </pre>
        </div>
      </div>
    </div>
  );
}
