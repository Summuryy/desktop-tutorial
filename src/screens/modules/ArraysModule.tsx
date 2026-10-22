import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ListTree,
  Plus,
  Trash2,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Ban,
  UserCheck,
  UserX,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import PaginatedTasks from '@/components/PaginatedTasks';
import { useGame } from '@/context/GameContext';
import type { DataItem } from '@/types';

// ============================================================
// Модуль 03: Управление массивами и циклы
// Расширенная теория, 5 практических задач,
// интерактивный список с push/filter/map.
// ============================================================

// ── Данные ──────────────────────────────────────────────────

const LABELS = [
  'auth_token',
  'user_session',
  'cache_entry',
  'api_key',
  'db_connection',
  'queue_job',
  'webhook_payload',
  'config_flag',
  'rate_limit',
  'ws_handle',
];
let idCounter = 0;

function createItem(): DataItem {
  const label = LABELS[idCounter % LABELS.length];
  const value = Math.floor(Math.random() * 1000);
  idCounter++;
  return {
    id: `item-${idCounter}`,
    label: `${label}_${idCounter}`,
    value,
    active: Math.random() > 0.4,
  };
}

// Предустановленный массив пользователей для задач 4 и 5
interface UserRecord {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'banned';
}

const MOCK_USERS: UserRecord[] = [
  { id: 1, name: 'Анна', status: 'active' },
  { id: 2, name: 'Борис', status: 'banned' },
  { id: 3, name: 'Вика', status: 'active' },
  { id: 4, name: 'Глеб', status: 'inactive' },
  { id: 5, name: 'Дина', status: 'banned' },
  { id: 6, name: 'Егор', status: 'active' },
];

// ── Практические задачи ─────────────────────────────────────

interface ArrayTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  validate: (items: DataItem[], filter: string) => { ok: boolean; message: string };
}

const ARRAY_TASKS: ArrayTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Добавить элемент через push()',
    description:
      'Нажмите кнопку items.push() один раз. Метод push() добавляет элемент в конец массива — ' +
      'это базовая операция для динамических списков в UI.',
    hint: 'Нажмите кнопку "items.push()" один раз.',
    validate: (items) =>
      items.length >= 4
        ? { ok: true, message: 'Отлично! Вы добавили элемент через push(). Массив вырос на 1.' }
        : { ok: false, message: 'Нажмите items.push() — массив должен вырасти до 4 элементов.' },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Добавить 5 элементов и применить фильтр active',
    description:
      'Нажмите push() несколько раз, чтобы получить минимум 5 элементов. Затем выберите фильтр ' +
      'item.active — .filter() оставит только активные элементы. Это показывает, как filter ' +
      'работает в UI: скрыть неактивные элементы списка.',
    hint: 'Нужно 5+ элементов и фильтр "item.active".',
    validate: (items, filter) =>
      items.length >= 5 && filter === 'active'
        ? { ok: true, message: 'Превосходно! 5+ элементов с фильтром active — .filter() в действии.' }
        : { ok: false, message: 'Нужно 5+ элементов и фильтр "item.active".' },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Отфильтровать неактивные элементы',
    description:
      'Выберите фильтр !item.active — .filter() вернёт только неактивные элементы (active=false). ' +
      'Это пример predicate-функции с оператором ! (NOT). В реальном приложении так показывают ' +
      '«отключённые» устройства или истекшие сессии.',
    hint: 'Выберите фильтр "!item.active".',
    validate: (_items, filter) =>
      filter === 'inactive'
        ? { ok: true, message: 'Верно! Фильтр !item.active показывает только неактивные элементы.' }
        : { ok: false, message: 'Выберите фильтр "!item.active".' },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Найти всех забаненных пользователей (цикл for)',
    description:
      'В симуляторе ниже — массив из 6 пользователей. Нажмите «Фильтровать забаненных» — ' +
      'это имитирует цикл for, который перебирает каждого пользователя и проверяет ' +
      'if (user.status === "banned"). Результат — подсписок только забаненных.',
    hint: 'Нажмите кнопку "Фильтровать забаненных" в симуляторе пользователей ниже.',
    validate: () =>
      ({ ok: false, message: 'Используйте симулятор пользователей ниже — нажмите кнопку фильтрации.' }),
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Подсчитать активных и забаненных через цикл',
    description:
      'В симуляторе пользователей подсчитайте количество активных и забаненных. ' +
      'Это имитирует цикл for с накоплением счётчиков: for (user of users) { if active → activeCount++, ' +
      'if banned → bannedCount++ }. Нажмите обе кнопки подсчёта.',
    hint: 'Нажмите «Только активные» и «Только забаненные» в симуляторе ниже.',
    validate: () =>
      ({ ok: false, message: 'Используйте симулятор пользователей — нажмите обе кнопки фильтрации.' }),
  },
];

// ── Компонент задачи ────────────────────────────────────────

function ArrayTaskCard({
  task,
  items,
  filter,
  userFilterMode,
  onApplyHint,
}: {
  task: ArrayTask;
  items: DataItem[];
  filter: string;
  userFilterMode: string;
  onApplyHint: () => void;
}) {
  const result = useMemo(() => {
    if (task.id === 4) {
      return userFilterMode === 'banned'
        ? { ok: true, message: 'Цикл for отфильтровал забаненных пользователей!' }
        : { ok: false, message: 'Нажмите «Фильтровать забаненных» в симуляторе ниже.' };
    }
    if (task.id === 5) {
      return userFilterMode === 'active' || userFilterMode === 'banned'
        ? { ok: true, message: 'Вы использовали цикл для подсчёта пользователей по статусу!' }
        : { ok: false, message: 'Нажмите кнопки фильтрации в симуляторе пользователей ниже.' };
    }
    return task.validate(items, filter);
  }, [task, items, filter, userFilterMode]);

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        result.ok
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-slate-800 bg-slate-900/30'
      }`}
    >
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
          <h4 className="text-[13px] font-bold text-slate-200 leading-tight">{task.title}</h4>
        </div>
      </div>

      <p className="text-[12px] text-slate-400 leading-relaxed mb-2 pl-10">{task.description}</p>

      <div className="flex items-start gap-1.5 pl-10 mb-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500/60 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">{task.hint}</p>
      </div>

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

      {!result.ok && task.id <= 3 && (
        <div className="pl-10 mt-2">
          <button
            onClick={onApplyHint}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
            Применить подсказку
          </button>
        </div>
      )}
    </div>
  );
}

// ── Основной компонент ──────────────────────────────────────

export default function ArraysModule() {
  const { unlockAchievement, isAchievementUnlocked, addXp } = useGame();

  // Массив элементов (stack)
  const [items, setItems] = useState<DataItem[]>(() =>
    Array.from({ length: 3 }, createItem),
  );
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Симулятор пользователей для задач 4 и 5
  const [userFilterMode, setUserFilterMode] = useState<'all' | 'active' | 'banned'>('all');
  const prevUserFilterRef = useRef<'all' | 'active' | 'banned'>('all');

  // Отслеживание выполнения задач
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const prevCompletedRef = useRef<Set<number>>(new Set());

  // push() — добавление элемента
  const push = () => {
    setItems((prev) => {
      const next = [...prev, createItem()];
      if (next.length >= 5 && filter !== 'all' && !isAchievementUnlocked('array-wizard')) {
        unlockAchievement('array-wizard');
      }
      return next;
    });
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clear = () => {
    setItems([]);
  };

  const setFilterWithCheck = (f: 'all' | 'active' | 'inactive') => {
    setFilter(f);
    if (items.length >= 5 && f !== 'all' && !isAchievementUnlocked('array-wizard')) {
      unlockAchievement('array-wizard');
    }
  };

  // Фильтрация элементов
  const filteredItems = items.filter((item) => {
    if (filter === 'active') return item.active;
    if (filter === 'inactive') return !item.active;
    return true;
  });

  const activeCount = items.filter((i) => i.active).length;
  const inactiveCount = items.length - activeCount;

  // Фильтрация пользователей (для задач 4 и 5)
  const filteredUsers = MOCK_USERS.filter((u) => {
    if (userFilterMode === 'active') return u.status === 'active';
    if (userFilterMode === 'banned') return u.status === 'banned';
    return true;
  });

  // XP за переключение фильтра пользователей
  useEffect(() => {
    if (userFilterMode !== 'all' && prevUserFilterRef.current !== userFilterMode) {
      addXp(10, 'Фильтрация массива пользователей');
    }
    prevUserFilterRef.current = userFilterMode;
  }, [userFilterMode, addXp]);

  // Вычисление результатов задач
  const taskResults = ARRAY_TASKS.map((task) => {
    if (task.id === 4) return userFilterMode === 'banned';
    if (task.id === 5) return userFilterMode === 'active' || userFilterMode === 'banned';
    return task.validate(items, filter).ok;
  });

  const completedSet = new Set(taskResults.map((r, i) => (r ? i + 1 : -1)).filter((n) => n > 0));

  useEffect(() => {
    const diff = completedSet.size - prevCompletedRef.current.size;
    if (diff > 0) {
      addXp(diff * 10, 'Выполнена практическая задача по массивам');
    }
    prevCompletedRef.current = completedSet;
    setCompletedTasks(completedSet);
  }, [completedSet.size, addXp]);

  const allDone = completedSet.size === ARRAY_TASKS.length;

  const applyHint = () => {
    // Для задач 1-3: добавляем элементы если нужно и ставим нужный фильтр
    while (items.length < 5) {
      setItems((prev) => [...prev, createItem()]);
    }
    setFilter('active');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <ListTree className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Управление массивами и циклы</h2>
          <p className="text-[12px] text-slate-500 font-mono">
            for · while · .map() · .filter() — итерация коллекций
          </p>
        </div>
      </div>

      {/* ── Расширенная теория ──────────────────────────────── */}
      <TechDoc
        title="Техническая документация — Полный курс"
        sections={[
          {
            heading: 'Что такое массив — структура данных для списков',
            body: (
              <div className="space-y-2">
                <p>
                  Массив (Array) — упорядоченная коллекция элементов с индексным доступом.
                  Первый элемент — индекс 0, второй — 1, последний —{' '}
                  <span className="font-mono text-slate-300">length - 1</span>. Массив —
                  самая частая структура данных в разработке UI: списки друзей, лента постов,
                  корзина товаров, вкладки навигации — всё это массивы.
                </p>
                <p>
                  В JavaScript/TypeScript массивы динамические — они автоматически растут при
                  добавлении элементов и сжимаются при удалении. В Swift массивы тоже
                  динамические, но имеют тип элементов: <span className="font-mono text-slate-300">
                  [String]</span> — массив только строк, <span className="font-mono text-slate-300">
                  [User]</span> — массив только объектов User.
                </p>
                <p>
                  Массивы хранятся в памяти как непрерывный блок: элемент 0 по адресу A,
                  элемент 1 по адресу A + size, элемент 2 по адресу A + 2*size. Это даёт
                  мгновенный доступ к любому элементу по индексу — O(1). Но вставка в начало
                  требует сдвига всех элементов — O(n).
                </p>
              </div>
            ),
          },
          {
            heading: 'Цикл for — классическая итерация со счётчиком',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">for</span> — цикл со счётчиком.
                  Три части: инициализация, условие продолжения, шаг.{' '}
                  <span className="font-mono text-slate-300">for (let i = 0; i &lt; array.length; i++)</span>{' '}
                  — перебирает все элементы от 0 до последнего. Внутри цикла обращение к
                  элементу через <span className="font-mono text-slate-300">array[i]</span>.
                </p>
                <p>
                  В Swift синтаксис проще: <span className="font-mono text-slate-300">
                  for user in users</span> — перебирает элементы напрямую, без индекса. Если
                  нужен индекс: <span className="font-mono text-slate-300">
                  for (index, user) in users.enumerated()</span>.
                </p>
                <p>
                  Цикл for идеален когда: нужно знать индекс элемента, нужно пропустить
                  часть элементов (начать с 5-го), нужно идти в обратном порядке. Для
                  простого перебора всех элементов в Swift предпочитайте for-in.
                </p>
                <p>
                  Пример: подсчёт забаненных пользователей.{' '}
                  <span className="font-mono text-slate-300">
                  var bannedCount = 0; for (let u of users) &#123; if (u.status === "banned") bannedCount++ &#125;</span>.
                  Цикл проходит по каждому элементу и проверяет условие — это базовый паттерн
                  фильтрации.
                </p>
              </div>
            ),
          },
          {
            heading: 'Цикл while — повторение до условия',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">while</span> — цикл с предусловием.
                  Выполняется пока выражение true. В отличие от for, количество итераций
                  заранее неизвестно.{' '}
                  <span className="font-mono text-slate-300">while (queue.length &gt; 0)</span> —
                  обрабатываем задачи, пока очередь не пуста.
                </p>
                <p>
                  <span className="font-mono text-slate-300">do-while</span> — цикл с постусловием.
                  Тело выполняется минимум один раз, затем проверяется условие. Полезно для
                  меню: показать опции, получить ввод, проверить — продолжать ли.
                </p>
                <p>
                  <strong className="text-rose-400">Внимание:</strong> бесконечный цикл —
                  частая ошибка. Если условие while никогда не станет false, программа
                  зависнет. Всегда убеждайтесь, что внутри цикла что-то меняется, что
                  приблизит завершение.
                </p>
              </div>
            ),
          },
          {
            heading: '.map() — трансформация каждого элемента',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">.map(callback)</span> — создаёт
                  новый массив, применяя функцию к каждому элементу. Возвращает массив той же
                  длины, но с преобразованными значениями. Это чистая функция (pure function) —
                  она не мутирует исходный массив.
                </p>
                <p>
                  Пример: <span className="font-mono text-slate-300">
                  users.map(u =&gt; u.name)</span> — из массива объектов User получаем массив
                  строк-имён. <span className="font-mono text-slate-300">
                  prices.map(p =&gt; p * 1.2)</span> — добавляем НДС к каждой цене.
                </p>
                <p>
                  <strong className="text-slate-300">Фундамент React:</strong> в React/React Native
                  .map() используется для рендеринга списков:{' '}
                  <span className="font-mono text-slate-300">
                  users.map(u =&gt; &lt;UserRow key=&#123;u.id&#125; user=&#123;u&#125; /&gt;)</span>.
                  Каждый элемент получает уникальный key — React использует его для оптимизации
                  перерисовки (reconciliation). Без key React перерисовывает весь список при
                  любом изменении — это медленно.
                </p>
                <p>
                  В Swift аналог: <span className="font-mono text-slate-300">
                  users.map &#123; $0.name &#125;</span> — тот же паттерн, компактный синтаксис.
                </p>
              </div>
            ),
          },
          {
            heading: '.filter() — условная выборка элементов',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">.filter(predicate)</span> —
                  возвращает новый массив, содержащий только элементы, для которых predicate
                  вернул <span className="font-mono text-emerald-400">true</span>. Исходный
                  массив не изменяется (pure function).
                </p>
                <p>
                  Пример: <span className="font-mono text-slate-300">
                  users.filter(u =&gt; u.status === "banned")</span> — получить только
                  забаненных. <span className="font-mono text-slate-300">
                  products.filter(p =&gt; p.price &lt; 1000)</span> — товары дешевле 1000.
                </p>
                <p>
                  В UI мобильного приложения .filter() используется повсеместно: показать
                  только непрочитанные сообщения, только онлайн-друзей, только товары в
                  наличии. Поисковая строка — это фильтр:{' '}
                  <span className="font-mono text-slate-300">
                  items.filter(i =&gt; i.name.includes(query))</span>.
                </p>
                <p>
                  В Swift: <span className="font-mono text-slate-300">
                  users.filter &#123; $0.status == .banned &#125;</span>. Можно объединять:{' '}
                  <span className="font-mono text-slate-300">
                  users.filter(&#123; $0.isActive &#125;).map(&#123; $0.name &#125;)</span> —
                  сначала фильтруем, потом трансформируем. Это цепочка методов (method chaining).
                </p>
              </div>
            ),
          },
          {
            heading: 'Итерация массивов в UI мобильных приложений',
            body: (
              <div className="space-y-2">
                <p>
                  В мобильной разработке списки — это 80% интерфейса. Лента Instagram, список
                  чатов WhatsApp, вкладки в Spotify — всё это массивы, отрисованные через
                  итерацию. Каждый элемент массива → один видимый ряд (row) на экране.
                </p>
                <p>
                  <strong className="text-slate-300">React / React Native:</strong>{' '}
                  <span className="font-mono text-slate-300">
                  data.map(item =&gt; &lt;Row key=&#123;item.id&#125; /&gt;)</span>.
                  FlatList оптимизирует рендеринг длинных списков — виртуализирует элементы,
                  которые вне экрана, и рендерит только видимые.
                </p>
                <p>
                  <strong className="text-slate-300">SwiftUI (iOS):</strong>{' '}
                  <span className="font-mono text-slate-300">
                  ForEach(users) &#123; user in UserRow(user: user) &#125;</span>.
                  List автоматически предоставляет скролл, разделители и swipe-to-delete.
                </p>
                <p>
                  <strong className="text-slate-300">Flutter:</strong>{' '}
                  <span className="font-mono text-slate-300">
                  ListView.builder(itemBuilder: (ctx, i) =&gt; UserRow(user: users[i]))</span>.
                  builder-конструктор рендерит только видимые элементы — эффективно для
                  тысяч строк.
                </p>
                <p>
                  Производительность: при фильтрации массива на 10 000 элементов UI не
                  должен тормозить. Выносите тяжёлые вычисления в фоновый поток (DispatchQueue
                  в Swift, Web Worker в JS) и используйте виртуализацию для длинных списков.
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков с массивами',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">1. Мутация массива вместо иммутабельного обновления.</strong>{' '}
                    <span className="font-mono text-slate-300">items.push(x)</span> мутирует
                    исходный массив — React не увидит изменение. Правильно:{' '}
                    <span className="font-mono text-slate-300">setItems([...items, x])</span>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">2. Забытый key в .map().</strong>{' '}
                    Без key React не может отследить перемещения элементов — анимации ломаются,
                    данные перепутываются. key должен быть уникальным и стабильным (не индекс!).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">3. Off-by-one ошибка в цикле for.</strong>{' '}
                    <span className="font-mono text-slate-300">i &lt;= array.length</span> —
                    лишняя итерация (undefined на последнем шаге). Правильно:{' '}
                    <span className="font-mono text-slate-300">i &lt; array.length</span>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">4. .map() вместо .forEach().</strong>{' '}
                    .map() создаёт новый массив. Если он не нужен — используйте .forEach()
                    или for-of, чтобы не расходовать память на ненужный массив.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">5. Использование индекса как key.</strong>{' '}
                    <span className="font-mono text-slate-300">key=&#123;index&#125;</span> —
                    работает пока список не меняется. При удалении/перемещении элементов
                    индексы сдвигаются, React путает элементы. Используйте уникальный id.
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
        intro="Задачи 1–3 выполняются в списке ниже. Задачи 4–5 — в симуляторе пользователей."
        tasks={ARRAY_TASKS.map((task) => ({
          id: task.id,
          title: task.title,
          content: (
            <ArrayTaskCard
              task={task}
              items={items}
              filter={filter}
              userFilterMode={userFilterMode}
              onApplyHint={applyHint}
            />
          ),
        }))}
        progressBars={taskResults}
        allDone={allDone}
        doneMessage="Все 5 задач выполнены! Вы освоили массивы, циклы и методы итерации."
      />

      {/* ── Панель управления списком ───────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Операции со списком (Stack)
          </h3>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>
              length = <span className="text-slate-300">{items.length}</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400">{activeCount} active</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">{inactiveCount} inactive</span>
          </div>
        </div>

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
          <span className="text-[11px] font-mono text-slate-500">.filter(item =&gt; ...)</span>
        </div>
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterWithCheck(f)}
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

        <p className="text-[11px] font-mono text-slate-600 mb-3">
          filtered = items.filter(predicate) → {filteredItems.length} results
        </p>
      </div>

      {/* ── Рендеринг списка через .map() ───────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Список — вывод через .map()
        </h3>

        {filteredItems.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-8 text-center">
            <p className="text-[12px] text-slate-700 font-mono">
              {items.length === 0
                ? 'Массив пуст — нажмите push()'
                : 'Нет элементов, соответствующих фильтру'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-cell-in flex items-center gap-3 rounded-lg px-4 py-2.5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <span className="text-[11px] font-mono text-slate-700 w-6 text-right">
                  {index}
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    item.active ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                />
                <span className="font-mono text-[13px] text-slate-300 flex-1 min-w-0 truncate">
                  {item.label}
                </span>
                <span className="font-mono text-[12px] text-slate-600">= {item.value}</span>
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

        <div className="mt-4 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
            Конвейер рендеринга
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

      {/* ── Симулятор пользователей (задачи 4 и 5) ──────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Симулятор пользователей — цикл for + .filter()
          </h3>
        </div>
        <p className="text-[11px] text-slate-600 mb-4">
          Массив из 6 пользователей с разными статусами. Нажмите кнопки ниже, чтобы
          отфильтровать через цикл for — как в реальном приложении модерации.
        </p>

        {/* Кнопки фильтрации */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setUserFilterMode('all')}
            className={`flex-1 py-2.5 rounded-lg text-[12px] font-mono font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              userFilterMode === 'all'
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900/30 border-slate-800 text-slate-600'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            Все ({MOCK_USERS.length})
          </button>
          <button
            onClick={() => setUserFilterMode('active')}
            className={`flex-1 py-2.5 rounded-lg text-[12px] font-mono font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              userFilterMode === 'active'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900/30 border-slate-800 text-slate-600'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Только активные ({MOCK_USERS.filter((u) => u.status === 'active').length})
          </button>
          <button
            onClick={() => setUserFilterMode('banned')}
            className={`flex-1 py-2.5 rounded-lg text-[12px] font-mono font-medium border transition-colors flex items-center justify-center gap-1.5 ${
              userFilterMode === 'banned'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-slate-900/30 border-slate-800 text-slate-600'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            Забаненные ({MOCK_USERS.filter((u) => u.status === 'banned').length})
          </button>
        </div>

        {/* Список пользователей */}
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="animate-cell-in flex items-center gap-3 rounded-lg px-4 py-2.5 bg-slate-900/40 border border-slate-800"
            >
              <span className="text-[11px] font-mono text-slate-700 w-6 text-right">
                {user.id}
              </span>
              {user.status === 'active' ? (
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : user.status === 'banned' ? (
                <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <UserX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
              <span className="font-mono text-[13px] text-slate-300 flex-1">{user.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  user.status === 'active'
                    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                    : user.status === 'banned'
                      ? 'text-rose-400 border-rose-500/20 bg-rose-500/10'
                      : 'text-slate-500 border-slate-700 bg-slate-800/40'
                }`}
              >
                {user.status}
              </span>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-center text-[12px] text-slate-700 font-mono py-4">
            Нет пользователей с этим статусом
          </p>
        )}

        {/* Псевдокод */}
        <div className="mt-4 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
            Цикл for — фильтрация забаненных
          </p>
          <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`// Вариант 1: цикл for
var banned = []
for (let i = 0; i < users.length; i++) {
  if (users[i].status === "banned") {
    banned.push(users[i])
  }
}

// Вариант 2: .filter() (короче)
const banned = users.filter(u => u.status === "banned")`}
          </pre>
        </div>
      </div>
    </div>
  );
}
