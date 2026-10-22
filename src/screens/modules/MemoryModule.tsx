import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  MemoryStick,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Terminal,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import PaginatedTasks from '@/components/PaginatedTasks';
import { useGame, XP_REWARDS } from '@/context/GameContext';
import type { MemoryCell, DataType } from '@/types';

// ============================================================
// Модуль 01: Memory Allocation & Data Types
// Расширенная теория, 5 пошаговых практических задач
// и интерактивная визуализация выделения ячеек памяти.
// ============================================================

// ── Утилиты типа и размера ──────────────────────────────────

const TYPE_SIZE: Record<DataType, number> = {
  String: 24,
  Integer: 8,
  Boolean: 1,
  Array: 16,
  Object: 32,
};

function inferType(value: string): DataType {
  const v = value.trim();
  if (v === 'true' || v === 'false') return 'Boolean';
  if (/^-?\d+$/.test(v)) return 'Integer';
  if (v.startsWith('[') && v.endsWith(']')) return 'Array';
  if (v.startsWith('{') && v.endsWith('}')) return 'Object';
  return 'String';
}

const TYPE_STYLES: Record<DataType, string> = {
  String: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  Integer: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Boolean: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Array: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Object: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

const KEYWORD_STYLES: Record<string, string> = {
  var: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  let: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  const: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

// ── Практические задачи ─────────────────────────────────────

interface PracticeTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  solution: { keyword: 'var' | 'let' | 'const'; name: string; value: string };
  validate: (cells: MemoryCell[]) => { ok: boolean; message: string };
}

const PRACTICE_TASKS: PracticeTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Объявить мутабельную String',
    description:
      'Создайте переменную с ключевым словом var, назовите её greeting и задайте значение "Hello, World!". Это мутабельная строка — её можно будет переопределить позже.',
    hint: 'Выберите var, введите имя greeting и значение Hello, World!',
    solution: { keyword: 'var', name: 'greeting', value: 'Hello, World!' },
    validate: (cells) => {
      const found = cells.find(
        (c) => c.name === 'greeting' && c.keyword === 'var' && c.type === 'String',
      );
      return found
        ? { ok: true, message: 'Отлично! Вы создали мутабельную строку через var.' }
        : { ok: false, message: 'Нужна переменная greeting типа String через var.' };
    },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Создать иммутабельный Integer',
    description:
      'Объявите константу через const с именем age и значением вашего возраста (целое число, например 25). Константу нельзя переопределить — значение фиксируется навсегда.',
    hint: 'Выберите const, введите имя age и числовое значение, например 25',
    solution: { keyword: 'const', name: 'age', value: '25' },
    validate: (cells) => {
      const found = cells.find(
        (c) => c.name === 'age' && c.keyword === 'const' && c.type === 'Integer',
      );
      return found
        ? { ok: true, message: 'Верно! Константа age типа Integer зафиксирована в памяти.' }
        : { ok: false, message: 'Нужна константа age типа Integer через const.' };
    },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Создать массив String из 3 элементов',
    description:
      'Создайте массив из трёх строк. Назовите переменную hobbies, используйте let, а значение введите в квадратных скобках: ["coding", "music", "gaming"]. Массив — ссылочный тип данных.',
    hint: 'Выберите let, имя hobbies, значение ["coding","music","gaming"]',
    solution: { keyword: 'let', name: 'hobbies', value: '["coding","music","gaming"]' },
    validate: (cells) => {
      const found = cells.find(
        (c) => c.name === 'hobbies' && c.type === 'Array',
      );
      return found
        ? { ok: true, message: 'Превосходно! Массив hobbies из трёх элементов создан.' }
        : { ok: false, message: 'Нужна переменная hobbies типа Array.' };
    },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Создать Объект профиля пользователя',
    description:
      'Создайте объект (словарь) с информацией о профиле. Назовите переменную profile через const, значение в фигурных скобках: {"name":"Anna","role":"admin","age":28}. Объекты хранят пары ключ-значение.',
    hint: 'Выберите const, имя profile, значение {"name":"Anna","role":"admin","age":28}',
    solution: { keyword: 'const', name: 'profile', value: '{"name":"Anna","role":"admin","age":28}' },
    validate: (cells) => {
      const found = cells.find(
        (c) => c.name === 'profile' && c.type === 'Object',
      );
      return found
        ? { ok: true, message: 'Идеально! Объект профиля пользователя создан в памяти.' }
        : { ok: false, message: 'Нужна переменная profile типа Object.' };
    },
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Изменить значение в Объекте и обработать ошибку типа',
    description:
      'Объявите var-переменную status со значением {"online":true}. Затем переопределите её, задав новое значение {"online":"yes"}. Обратите внимание: компилятор со строгой типизацией flagged бы это как ошибку — Boolean нельзя заменить на String внутри типизированного объекта. Попробуйте оба варианта и сравните поведение.',
    hint: 'Создайте var status = {"online":true}, затем переопределите status = {"online":"yes"} — это вызовет предупреждение о несовпадении типов',
    solution: { keyword: 'var', name: 'status', value: '{"online":"yes"}' },
    validate: (cells) => {
      const found = cells.find(
        (c) => c.name === 'status' && c.keyword === 'var',
      );
      return found
        ? { ok: true, message: 'Вы переопределили объект! В строгой типизации это вызвало бы ошибку — Boolean заменён на String.' }
        : { ok: false, message: 'Создайте var-переменную status и переопределите её значение.' };
    },
  },
];

// ── Компонент задачи ────────────────────────────────────────

function TaskCard({
  task,
  cells,
  onApplySolution,
}: {
  task: PracticeTask;
  cells: MemoryCell[];
  onApplySolution: (task: PracticeTask) => void;
}) {
  const result = useMemo(() => task.validate(cells), [task, cells]);

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        result.ok
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-slate-800 bg-slate-900/30'
      }`}
    >
      {/* Заголовок задачи */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-[12px] font-bold ${
            result.ok
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-500 border border-slate-700'
          }`}
        >
          {task.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 uppercase tracking-wider">
              {task.level}
            </span>
            {result.ok && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Выполнено
              </span>
            )}
          </div>
          <h4 className="text-[13px] font-bold text-slate-200 leading-tight">
            {task.title}
          </h4>
        </div>
      </div>

      {/* Описание */}
      <p className="text-[12px] text-slate-400 leading-relaxed mb-2 pl-10">
        {task.description}
      </p>

      {/* Подсказка */}
      <div className="flex items-start gap-1.5 pl-10 mb-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500/60 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">{task.hint}</p>
      </div>

      {/* Результат валидации */}
      <div className="pl-10">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-mono ${
            result.ok ? 'text-emerald-400' : 'text-slate-600'
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          <span>{result.message}</span>
        </div>
      </div>

      {/* Кнопка автозаполнения */}
      {!result.ok && (
        <div className="pl-10 mt-2">
          <button
            onClick={() => onApplySolution(task)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
            Подставить решение в форму
          </button>
        </div>
      )}
    </div>
  );
}

// ── Основной компонент ──────────────────────────────────────

export default function MemoryModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();

  // Поля ввода формы
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [keyword, setKeyword] = useState<'var' | 'let' | 'const'>('let');

  // Массив ячеек памяти
  const [cells, setCells] = useState<MemoryCell[]>([]);

  // Выполненные задачи
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const prevCompletedRef = useRef<Set<number>>(new Set());

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

    setCells((prev) => {
      const filtered = prev.filter((c) => c.name !== cell.name);
      addXp(XP_REWARDS.MEMORY_CELL_ALLOCATED, 'Выделена ячейка памяти');
      if (filtered.length + 1 >= 5 && !isAchievementUnlocked('memory-master')) {
        unlockAchievement('memory-master');
      }
      return [...filtered, cell];
    });
    setName('');
    setValue('');
  };

  // Освобождение памяти
  const deallocate = (id: string) => {
    setCells((prev) => prev.filter((c) => c.id !== id));
  };

  // Очистка всей памяти
  const clearAll = () => setCells([]);

  // Подстановка решения задачи в форму
  const applySolution = (task: PracticeTask) => {
    setKeyword(task.solution.keyword);
    setName(task.solution.name);
    setValue(task.solution.value);
  };

  // Проверка выполнения задач при изменении cells
  const taskResults = PRACTICE_TASKS.map((task) => task.validate(cells));
  const newlyCompleted = new Set(
    taskResults.map((r, i) => (r.ok ? i + 1 : -1)).filter((n) => n > 0),
  );

  // Обновление выполненных задач + XP за новые
  useEffect(() => {
    const newOnes = newlyCompleted.size - prevCompletedRef.current.size;
    if (newOnes > 0) {
      addXp(newOnes * 10, 'Выполнена практическая задача');
    }
    prevCompletedRef.current = newlyCompleted;
    setCompletedTasks(newlyCompleted);
  }, [newlyCompleted, addXp]);

  const totalSize = cells.reduce((sum, c) => sum + c.size, 0);
  const previewType = value.trim() ? inferType(value) : null;
  const allTasksDone = newlyCompleted.size === PRACTICE_TASKS.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Выделение памяти и типизация</h2>
          <p className="text-[12px] text-slate-500 font-mono">
            var · let · const · String · Integer · Boolean · Array · Object
          </p>
        </div>
      </div>

      {/* ── Расширенная теория ──────────────────────────────── */}
      <TechDoc
        title="Техническая документация — Полный курс"
        sections={[
          {
            heading: 'Как процессор выделяет ячейки памяти',
            body: (
              <div className="space-y-2">
                <p>
                  Память компьютера — это длинная лента пронумерованных ячеек, каждая размером
                  в 1 байт. Когда вы объявляете переменную, компилятор запрашивает у
                  операционной системы свободный участок памяти (allocation). ОС возвращает
                  начальный адрес — например <span className="font-mono text-slate-300">0x7FF4A0</span>,
                  по которому переменная будет хранить своё значение.
                </p>
                <p>
                  Размер выделяемого блока зависит от типа данных.
                  <span className="font-mono text-pink-400"> Boolean</span> занимает 1 байт
                  (один бит для true/false + выравнивание).
                  <span className="font-mono text-emerald-400"> Integer</span> — 8 байт
                  (64-битное целое). <span className="font-mono text-sky-400">String</span> —
                  24+ байта (зависит от длины, хранит указатель на массив символов в куче).
                  <span className="font-mono text-amber-400"> Array</span> и
                  <span className="font-mono text-cyan-400"> Object</span> — ссылочные типы:
                  переменная хранит не сами данные, а адрес (pointer) на них в куче (heap).
                </p>
                <p>
                  В языках с ручным управлением памятью (C/C++) программист сам освобождает
                  ячейки через <span className="font-mono text-slate-300">free()</span> или
                  <span className="font-mono text-slate-300"> delete</span>. В Swift/JS/TS
                  этим занимается сборщик мусора (ARC в Swift, GC в V8) — он автоматически
                  освобождает память, когда на объект больше нет ссылок.
                </p>
              </div>
            ),
          },
          {
            heading: 'Строгая статическая типизация — что это и зачем',
            body: (
              <div className="space-y-2">
                <p>
                  Строгая типизация означает: каждая переменная имеет конкретный тип, и
                  компилятор не позволяет смешивать несовместимые типы. Нельзя сложить
                  число со строкой или присвоить Boolean в Integer без явного преобразования.
                  Это защищает от целого класса ошибок на этапе компиляции — до запуска программы.
                </p>
                <p>
                  Статическая типизация означает, что тип определяется при объявлении и
                  не меняется. В Swift: <span className="font-mono text-slate-300">let age: Int = 25</span>.
                  В TypeScript: <span className="font-mono text-slate-300">const age: number = 25</span>.
                  Если попытаться записать строку в числовую переменную — компилятор выдаст
                  ошибку и сборка прервётся.
                </p>
                <p>
                  Type inference (выведение типа) — компилятор сам определяет тип из
                  литерала, без явной аннотации. <span className="font-mono text-slate-300">let name = "Anna"</span> —
                  компилятор выводит <span className="font-mono text-sky-400">String</span>.
                  <span className="font-mono text-slate-300">let count = 42</span> — выводит
                  <span className="font-mono text-emerald-400"> Int</span>. Это делает код
                  лаконичным без потери безопасности типов.
                </p>
                <p>
                  Динамическая типизация (Python, JavaScript без TS) проверяет типы
                  во время выполнения. Это гибче, но опаснее: ошибка обнаружится только
                  когда пользователь наткнётся на неё в продакшене. TypeScript добавляет
                  статическую типизацию поверх JavaScript, давая лучшее из обоих миров.
                </p>
              </div>
            ),
          },
          {
            heading: 'Мутабельность и иммутабельность',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-indigo-400">var</span> — мутабельная
                  переменная. После инициализации можно присвоить новое значение (reassign):
                  <span className="font-mono text-slate-300"> var score = 10; score = 20</span>.
                  Используется когда состояние должно меняться — счётчик, флаг, буфер.
                </p>
                <p>
                  <span className="font-mono text-emerald-400">let</span> (Swift) и
                  <span className="font-mono text-amber-400"> const</span> (TS/JS) —
                  иммутабельные привязки. Значение фиксируется один раз при объявлении,
                  повторное присваивание вызывает ошибку компиляции:
                  <span className="font-mono text-rose-400"> Cannot assign to immutable value</span>.
                </p>
                <p>
                  Важно: <span className="font-mono">const</span> делает иммутабельной
                  привязку (binding), а не содержимое. Для объектов и массивов это означает:
                  нельзя переопределить саму переменную, но можно изменять поля внутри
                  объекта или элементы массива.
                  <span className="font-mono text-slate-300"> const obj = &#123;a: 1&#125;;
                  obj.a = 2</span> — допустимо, т.к. меняется содержимое, а не ссылка.
                </p>
                <p>
                  Правило: используйте <span className="font-mono">let/const</span> по
                  умолчанию. <span className="font-mono">var</span> — только когда
                 необходима мутация. Иммутабельность уменьшает количество багов, упрощает
                  отладку и делает код безопасным для параллельного выполнения.
                </p>
              </div>
            ),
          },
          {
            heading: 'Примитивы и ссылочные типы',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-sky-400">String</span>,
                  <span className="font-mono text-emerald-400"> Integer (Int)</span>,
                  <span className="font-mono text-pink-400"> Boolean (Bool)</span> —
                  примитивы, хранятся по значению (value type). При присваивании
                  <span className="font-mono text-slate-300"> let b = a</span> значение
                  копируется: изменение <span className="font-mono">b</span> не влияет
                  на <span className="font-mono">a</span>.
                </p>
                <p>
                  <span className="font-mono text-amber-400">Array</span> и
                  <span className="font-mono text-cyan-400">Object / Dictionary</span> —
                  ссылочные (reference type) в JS/TS: при присваивании копируется указатель,
                  а не данные. Две переменные могут указывать на один объект, и изменение
                  через одну отразится на другой.
                </p>
                <p>
                  В Swift Array и Dictionary — value type (структуры с copy-on-write).
                  При копировании создаётся независимая копия, но реальное дублирование
                  данных происходит только при попытке модификации. Это безопаснее, но
                  требует внимания к производительности при больших коллекциях.
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков в типах данных',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">1. Смешивание типов в операциях.</strong>{' '}
                    <span className="font-mono text-slate-300">"5" + 3</span> в JS даёт
                    <span className="font-mono text-amber-400"> "53"</span> (строка!), а не
                    <span className="font-mono text-amber-400"> 8</span>. В строгих языках
                    это ошибка компиляции. Всегда явно преобразуйте тип:
                    <span className="font-mono text-slate-300"> Number("5") + 3</span>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">2. Использование var вместо let/const.</strong>{' '}
                    <span className="font-mono text-slate-300">var</span> имеет function scope
                    и поднимается (hoisting), что приводит к неочевидным багам. В современном
                    коде var практически не используется — предпочитайте let и const.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">3. Забыли, что const не замораживает объект.</strong>{' '}
                    <span className="font-mono text-slate-300">const obj = &#123;a:1&#125;;
                    obj.a = 2</span> — работает! Для полной иммутабельности используйте
                    <span className="font-mono text-slate-300"> Object.freeze(obj)</span> в JS
                    или <span className="font-mono text-slate-300">let</span> со структурами в Swift.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">4. Float вместо Int при делении.</strong>{' '}
                    <span className="font-mono text-slate-300">5 / 2</span> в Python даёт
                    <span className="font-mono text-amber-400"> 2.5</span>, а в Swift/TS —
                    <span className="font-mono text-amber-400"> 2.5</span>. Для целочисленного
                    деления: <span className="font-mono text-slate-300">Math.floor(5 / 2)</span> (JS)
                    или <span className="font-mono text-slate-300">5 / 2</span> где оба операнда Int (Swift).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">5. null / undefined / nil — разные понятия.</strong>{' '}
                    В JS <span className="font-mono">undefined</span> — переменная не
                    инициализирована, <span className="font-mono">null</span> — намеренная
                    пустота. В Swift <span className="font-mono">nil</span> — отсутствие
                    значения, но только для Optional типов. Путаница приводит к crash'ам
                    и неожиданному поведению.
                  </span>
                </p>
              </div>
            ),
          },
        ]}
      />

      {/* ── Практические задачи (постранично) ───────────────── */}
      <PaginatedTasks
        title="Практические задачи — 5 шагов"
        intro="Выполняйте задачи по порядку, используя форму ниже. Каждая задача проверяется автоматически — заполните ячейки памяти правильными переменными."
        tasks={PRACTICE_TASKS.map((task) => ({
          id: task.id,
          title: task.title,
          content: (
            <TaskCard
              task={task}
              cells={cells}
              onApplySolution={applySolution}
            />
          ),
        }))}
        progressBars={taskResults.map((r) => r?.ok ?? false)}
        allDone={allTasksDone}
        doneMessage="Все 5 задач выполнены! Вы освоили основы выделения памяти и типизации."
      />

      {/* ── Форма инициализации переменной ─────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Объявление переменной
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
            placeholder="имя переменной"
            className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && allocate()}
            placeholder='значение ("hello", 42, true, [...], {...})'
            className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2.5 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
          />
        </div>

        {/* Предпросмотр выведенного типа */}
        {previewType && (
          <p className="text-[11px] text-slate-600 font-mono mb-3">
            Выведенный тип:{' '}
            <span
              className={`font-bold border px-1.5 py-0.5 rounded ${TYPE_STYLES[previewType]}`}
            >
              {previewType}
            </span>{' '}
            · размер: {TYPE_SIZE[previewType]} байт
          </p>
        )}

        {/* Кнопка аллокации */}
        <button
          onClick={allocate}
          disabled={!name.trim() || !value.trim()}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-2.5 text-[13px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Выделить память
        </button>
      </div>

      {/* ── Визуализация памяти ─────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Куча памяти (Memory Heap)
            </h3>
          </div>
          {cells.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                {cells.length} ячеек · {totalSize}B
              </span>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] text-rose-500/70 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Очистить всё
              </button>
            </div>
          )}
        </div>

        {cells.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-8 text-center">
            <Terminal className="w-8 h-8 text-slate-800 mx-auto mb-2" />
            <p className="text-[12px] text-slate-700 font-mono">
              Память пуста — объявите переменную выше
            </p>
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
                  <span
                    className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${KEYWORD_STYLES[cell.keyword]}`}
                  >
                    {cell.keyword}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${TYPE_STYLES[cell.type]}`}
                  >
                    {cell.type}
                  </span>
                  {cell.mutable && (
                    <span className="text-[9px] font-mono text-indigo-500/70 ml-auto">
                      мутабельная
                    </span>
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
