import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Network,
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  ChevronRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import PaginatedTasks from '@/components/PaginatedTasks';
import { useGame, XP_REWARDS } from '@/context/GameContext';
import type { RequestState, ApiResponse } from '@/types';

// ============================================================
// Модуль 04: Функции, Async/Await и API-архитектура
// Расширенная теория, 5 практических задач,
// интерактивный симулятор HTTP-запросов.
// ============================================================

// ── Моковые данные ──────────────────────────────────────────

const MOCK_SQL_ROWS: ApiResponse['rows'] = [
  { id: 1, username: 'admin', email: 'admin@dev.io', role: 'admin', created_at: '2024-01-15T09:30:00Z' },
  { id: 2, username: 'kmikhailov', email: 'kris@dev.io', role: 'user', created_at: '2024-03-22T14:45:00Z' },
  { id: 3, username: 'guest_user', email: 'guest@dev.io', role: 'guest', created_at: '2024-06-08T11:20:00Z' },
];

function fetchFromApi(): Promise<ApiResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        endpoint: '/api/v1/users',
        method: 'GET',
        timestamp: new Date().toISOString(),
        rows: MOCK_SQL_ROWS,
      });
    }, 1200);
  });
}

// Имитация запроса с ошибкой
function fetchWithError(): Promise<ApiResponse> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network error: 500 Internal Server Error')), 1000);
  });
}

const STATE_CONFIG: Record<RequestState, { label: string; color: string; bg: string }> = {
  idle: { label: 'Idle', color: 'text-slate-500', bg: 'border-slate-800 bg-slate-900/30' },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'border-amber-500/30 bg-amber-500/5' },
  fulfilled: { label: 'Fulfilled', color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/5' },
  rejected: { label: 'Rejected', color: 'text-rose-400', bg: 'border-rose-500/30 bg-rose-500/5' },
};

// ── Практические задачи ─────────────────────────────────────

interface AsyncTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  validate: (state: RequestState, logCount: number, visitedStates: Set<string>) => { ok: boolean; message: string };
}

const ASYNC_TASKS: AsyncTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Выполнить успешный API-запрос (idle → pending → fulfilled)',
    description:
      'Нажмите «Fetch Data From API». Запрос пройдёт три состояния: idle (ожидание) → ' +
      'pending (загрузка, Promise ожидает) → fulfilled (успех, данные получены). ' +
      'Это базовый lifecycle асинхронной операции.',
    hint: 'Нажмите кнопку «Fetch Data From API».',
    validate: (state) =>
      state === 'fulfilled'
        ? { ok: true, message: 'Запрос успешно завершён! Promise перешёл из pending в fulfilled.' }
        : { ok: false, message: 'Нажмите «Fetch Data From API» и дождитесь результата.' },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Сбросить и выполнить запрос повторно',
    description:
      'После первого запроса нажмите «Reset — New Request», затем снова «Fetch». ' +
      'Это показывает, что Promise одноразовый — каждый запрос создаёт новый Promise. ' +
      'Журнал запросов ниже накопит оба результата.',
    hint: 'Нажмите Reset, затем снова Fetch. Журнал должен показать 2+ запроса.',
    validate: (_state, logCount) =>
      logCount >= 2
        ? { ok: true, message: 'Журнал содержит 2+ запроса. Каждый fetch создаёт новый Promise.' }
        : { ok: false, message: 'Нужно 2+ запроса в журнале. Сбросьте и повторите fetch.' },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Перейти в состояние Pending (загрузка)',
    description:
      'Начните новый запрос и наблюдайте состояние pending — это момент, когда Promise ' +
      'выполняется, но ещё не разрешён. UI показывает спиннер (loader). В реальном приложении ' +
      'здесь пользователю показывается индикатор загрузки.',
    hint: 'Начните новый запрос и дождитесь появления спиннера.',
    validate: (state) =>
      state === 'pending'
        ? { ok: true, message: 'Состояние pending активно! Promise выполняется, UI показывает спиннер.' }
        : { ok: false, message: 'Нажмите Fetch и поймайте момент загрузки (pending).' },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Поймать ошибку через try/catch (rejected)',
    description:
      'Нажмите «Simulate Error» — запрос завершится с ошибкой 500. Блок catch перехватит ' +
      'исключение, и состояние перейдёт в rejected. В реальном коде: try { await fetch() } catch(e) { ' +
      'showError(e) }. Ошибка не должна «ронять» приложение.',
    hint: 'Нажмите кнопку «Simulate Error».',
    validate: (state) =>
      state === 'rejected'
        ? { ok: true, message: 'Ошибка перехвачена через catch! Состояние → rejected. Приложение не упало.' }
        : { ok: false, message: 'Нажмите «Simulate Error» для имитации ошибки.' },
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Пройти все 4 состояния Promise',
    description:
      'Пройдите через все 4 состояния: idle (начало), pending (загрузка), fulfilled (успех), ' +
      'rejected (ошибка). Это полная карта lifecycle Promise. Каждое состояние соответствует ' +
      'определённому UI: idle — пустой экран, pending — спиннер, fulfilled — данные, rejected — ' +
      'сообщение об ошибке.',
    hint: 'Получите и fulfilled (через Fetch), и rejected (через Simulate Error). Прогресс ниже.',
    validate: (_state, _log, visited) => {
      const needed = ['idle', 'pending', 'fulfilled', 'rejected'];
      const done = needed.filter((s) => visited.has(s)).length;
      return {
        ok: done === 4,
        message:
          done === 4
            ? 'Все 4 состояния Promise пройдены! Полный lifecycle освоен.'
            : `Пройдено ${done}/4: ${needed.filter((s) => visited.has(s)).join(', ') || 'ни одного'}`,
      };
    },
  },
];

// ── Компонент задачи ────────────────────────────────────────

function AsyncTaskCard({
  task,
  state,
  logCount,
  visitedStates,
}: {
  task: AsyncTask;
  state: RequestState;
  logCount: number;
  visitedStates: Set<string>;
}) {
  const result = useMemo(
    () => task.validate(state, logCount, visitedStates),
    [task, state, logCount, visitedStates],
  );

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        result.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30'
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
        <div className={`flex items-center gap-1.5 text-[11px] font-mono ${result.ok ? 'text-emerald-400' : 'text-slate-600'}`}>
          {result.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{result.message}</span>
        </div>
      </div>
    </div>
  );
}

// ── Основной компонент ──────────────────────────────────────

export default function AsyncApiModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  const [state, setState] = useState<RequestState>('idle');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [visitedStates, setVisitedStates] = useState<Set<string>>(new Set(['idle']));
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const prevCompletedRef = useRef<Set<number>>(new Set());

  // Отслеживание посещённых состояний
  useEffect(() => {
    setVisitedStates((prev) => {
      if (prev.has(state)) return prev;
      const next = new Set(prev);
      next.add(state);
      return next;
    });
  }, [state]);

  const handleFetch = async () => {
    setState('pending');
    setError(null);
    try {
      const data = await fetchFromApi();
      setResponse(data);
      setState('fulfilled');
      const ts = new Date().toLocaleTimeString('en-GB');
      setLog((prev) => [`[${ts}] GET /api/v1/users → ${data.status} OK · ${data.rows.length} rows`, ...prev].slice(0, 8));
      addXp(XP_REWARDS.API_REQUEST_SUCCESS, 'Успешный API-запрос');
      if (!isAchievementUnlocked('async-adept')) {
        unlockAchievement('async-adept');
      }
    } catch (err) {
      setState('rejected');
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  const handleSimulateError = async () => {
    setState('pending');
    setError(null);
    try {
      await fetchWithError();
    } catch (err) {
      setState('rejected');
      setError(err instanceof Error ? err.message : 'Network error');
      const ts = new Date().toLocaleTimeString('en-GB');
      setLog((prev) => [`[${ts}] GET /api/v1/users → 500 ERROR · catch block executed`, ...prev].slice(0, 8));
    }
  };

  const reset = () => {
    setState('idle');
    setResponse(null);
    setError(null);
  };

  // Вычисление результатов задач
  const taskResults = ASYNC_TASKS.map((task) => task.validate(state, log.length, visitedStates).ok);
  const completedSet = new Set(taskResults.map((r, i) => (r ? i + 1 : -1)).filter((n) => n > 0));

  useEffect(() => {
    const diff = completedSet.size - prevCompletedRef.current.size;
    if (diff > 0) {
      addXp(diff * 10, 'Выполнена практическая задача по async/await');
    }
    prevCompletedRef.current = completedSet;
    setCompletedTasks(completedSet);
  }, [completedSet.size, addXp]);

  const allDone = completedSet.size === ASYNC_TASKS.length;
  const config = STATE_CONFIG[state];

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Network className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Функции, Async/Await и API</h2>
          <p className="text-[12px] text-slate-500 font-mono">signature · scope · Promise · async/await · HTTP states</p>
        </div>
      </div>

      {/* ── Расширенная теория ──────────────────────────────── */}
      <TechDoc
        title="Техническая документация — Полный курс"
        sections={[
          {
            heading: 'Функции — сигнатура, параметры, область видимости',
            body: (
              <div className="space-y-2">
                <p>
                  Функция — именованный блок кода, который можно вызвать (выполнить) из любого
                  места программы. Сигнатура функции определяет её контракт: имя, список
                  параметров (типизированных аргументов) и тип возвращаемого значения.
                </p>
                <p>
                  В Swift: <span className="font-mono text-slate-300">func fetchData(url: String) async -&gt; Response</span>.
                  В TypeScript: <span className="font-mono text-slate-300">async function fetchData(url: string): Promise&lt;Response&gt;</span>.
                  Параметры — это входные данные функции. Возвращаемое значение — результат.
                </p>
                <p>
                  Scope (область видимости) определяет, где переменная доступна. Переменные,
                  объявленные внутри функции через <span className="font-mono">let/const</span>,
                  не видны снаружи — это block scope. Переменные через <span className="font-mono">var</span>{' '}
                  в JS имеют function scope — видны во всей функции, даже за пределами блока.
                  Параметры функции видны только внутри неё.
                </p>
                <p>
                  Функции могут быть: именованными (<span className="font-mono">function foo()</span>),
                  анонимными (<span className="font-mono">const foo = () =&gt; {}</span>), стрелочными
                  (<span className="font-mono">(x) =&gt; x * 2</span>). Стрелочные функции не имеют
                  своего <span className="font-mono">this</span> — они берут его из внешнего контекста.
                </p>
              </div>
            ),
          },
          {
            heading: 'Синхронный vs асинхронный код — зачем нужен async',
            body: (
              <div className="space-y-2">
                <p>
                  Синхронный код выполняется последовательно: каждая строка ждёт завершения
                  предыдущей. Если запрос к серверу занимает 2 секунды — весь интерфейс
                  замирает на 2 секунды. Пользователь не может ни нажать кнопку, ни скроллить.
                  Это плохо.
                </p>
                <p>
                  Асинхронный код не блокирует основной поток. Запрос к серверу отправляется,
                  и код продолжает выполняться дальше. Когда ответ приходит — выполняется
                  callback (функция-обработчик). Пользователь может продолжать работать с UI.
                </p>
                <p>
                  В JavaScript основной поток один (single-threaded). Если бы fetch() был
                  синхронным, браузер зависал бы на каждый запрос. Поэтому все сетевые операции
                  в JS — асинхронные: через callbacks, Promises или async/await.
                </p>
                <p>
                  В Swift异步 выполнляется через <span className="font-mono text-slate-300">async/await</span>{' '}
                  и <span className="font-mono text-slate-300">Task</span>. <span className="font-mono">
                  DispatchQueue.global().async</span> — для тяжёлых вычислений в фоновом потоке,
                  <span className="font-mono"> DispatchQueue.main.async</span> — для обновления UI
                  в главном потоке.
                </p>
              </div>
            ),
          },
          {
            heading: 'Promise — объект-обёртка над будущим результатом',
            body: (
              <div className="space-y-2">
                <p>
                  Promise — это объект, представляющий результат асинхронной операции, который
                  будет доступен в будущем. У Promise три состояния:
                </p>
                <p>
                  <span className="font-mono text-amber-400">pending</span> — операция выполняется,
                  результат ещё неизвестен. <span className="font-mono text-emerald-400">fulfilled</span>{' '}
                  (resolved) — операция завершена успешно, результат доступен.{' '}
                  <span className="font-mono text-rose-400">rejected</span> — операция завершилась
                  с ошибкой, доступна причина ошибки.
                </p>
                <p>
                  Переход между состояниями односторонний: pending → fulfilled или pending → rejected.
                  Нельзя «переиспользовать» Promise — после разрешения он навсегда остаётся в
                  своём состоянии. Каждый новый fetch() создаёт новый Promise.
                </p>
                <p>
                  Создание Promise: <span className="font-mono text-slate-300">new Promise((resolve, reject) =&gt; &#123; ... &#125;)</span>.
                  Внутри выполняется асинхронная операция, затем вызывается{' '}
                  <span className="font-mono">resolve(data)</span> при успехе или{' '}
                  <span className="font-mono">reject(error)</span> при неудаче.
                </p>
              </div>
            ),
          },
          {
            heading: 'async/await — линейный асинхронный код',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">async/await</span> — синтаксический
                  сахар над Promises, который делает асинхронный код похожим на синхронный.
                  Ключевое слово <span className="font-mono">async</span> перед функцией означает,
                  что она возвращает Promise. <span className="font-mono">await</span> перед
                  выражением приостанавливает выполнение функции до разрешения Promise.
                </p>
                <p>
                  Без async/await (chain): <span className="font-mono text-slate-300">
                  fetch(url).then(r =&gt; r.json()).then(data =&gt; render(data)).catch(e =&gt; showError(e))</span>.
                  С async/await: <span className="font-mono text-slate-300">
                  const r = await fetch(url); const data = await r.json(); render(data)</span>.
                  Второй вариант читается как обычный синхронный код — это его главное преимущество.
                </p>
                <p>
                  <span className="font-mono">await</span> можно использовать только внутри{' '}
                  <span className="font-mono">async</span> функции. Приостановка не блокирует
                  основной поток — другие обработчики продолжают работать. Это похоже на то,
                  как вы заказываете кофе: делаете заказ (await), ждёте (pending), получаете
                  кофе (fulfilled) — и можете meanwhile читать новости.
                </p>
                <p>
                  В Swift: <span className="font-mono text-slate-300">let data = try await fetchData()</span>.
                  Тот же паттерн, <span className="font-mono">try</span> обрабатывает ошибки как
                  в синхронном коде. <span className="font-mono">Task &#123; await ... &#125;</span>{' '}
                  запускает асинхронный блок.
                </p>
              </div>
            ),
          },
          {
            heading: 'try/catch — обработка ошибок в async/await',
            body: (
              <div className="space-y-2">
                <p>
                  Блок <span className="font-mono text-slate-300">try/catch</span> перехватывает
                  ошибки из <span className="font-mono">await</span>-выражений. Если Promise
                  был rejected, <span className="font-mono">await</span> выбрасывает исключение,
                  которое попадает в блок <span className="font-mono">catch</span>.
                </p>
                <p>
                  <span className="font-mono text-slate-300">try &#123; const data = await fetch() &#125; catch (error) &#123; showError(error) &#125;</span>.
                  Без try/catch ошибка «провалится» выше по стеку вызовов и может «уронить»
                  приложение. Всегда оборачивайте await в try/catch — особенно сетевые запросы,
                  которые могут завершиться с ошибкой (нет сети, 500, timeout).
                </p>
                <p>
                  Хороший паттерн: показать сообщение об ошибке пользователю, залогировать
                  ошибку для разработчика, и восстановить UI в безопасное состояние (убрать
                  спиннер, показать кнопку «повторить»).
                </p>
              </div>
            ),
          },
          {
            heading: 'HTTP-статусы и REST API — что значит каждый код',
            body: (
              <div className="space-y-2">
                <p>
                  REST API возвращает HTTP-статусы — трёхзначные коды, описывающие результат
                  запроса. Они разделены на 5 классов:
                </p>
                <p>
                  <span className="font-mono text-emerald-400">2xx</span> — успех: 200 OK (данные
                  получены), 201 Created (ресурс создан), 204 No Content (успех, без тела ответа).
                </p>
                <p>
                  <span className="font-mono text-amber-400">4xx</span> — ошибка клиента:
                  400 Bad Request (неверный формат), 401 Unauthorized (нет токена), 403 Forbidden
                  (прав недостаточно), 404 Not Found (ресурс не найден), 429 Too Many Requests
                  (rate limit).
                </p>
                <p>
                  <span className="font-mono text-rose-400">5xx</span> — ошибка сервера:
                  500 Internal Server Error (краш сервера), 502 Bad Gateway, 503 Service
                  Unavailable (сервер перегружен).
                </p>
                <p>
                  Клиент обрабатывает ответ на основе статуса: 2xx → рендеринг данных (JSON),
                  4xx → действие пользователя (войти заново при 401), 5xx → сообщение «сервер
                  недоступен, попробуйте позже». JSON-ответ — сериализованная выборка из SQL-базы
                  (<span className="font-mono">SELECT * FROM table</span>).
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков с async/await',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">1. Забытый await.</strong>{' '}
                    <span className="font-mono text-slate-300">const data = fetch()</span> без await
                    вернёт Promise, а не данные. data.rows будет undefined → crash. Всегда пишите await.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">2. Нет try/catch.</strong>{' '}
                    Без обработки ошибок rejected Promise «уронит» приложение. Всегда оборачивайте
                    await в try/catch, особенно сетевые запросы.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">3. Последовательные await вместо параллельных.</strong>{' '}
                    <span className="font-mono">await a(); await b()</span> — выполняются по очереди.
                    Если запросы независимы: <span className="font-mono">Promise.all([a(), b()])</span> —
                    параллельно, в 2 раза быстрее.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">4. await в обычной (не async) функции.</strong>{' '}
                    Вызовет синтаксическую ошибку. async обязателен. Для top-level await нужен
                    ES module или <span className="font-mono">.mjs</span> файл.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">5. Не обновляется UI после ошибки.</strong>{' '}
                    При rejected нужно скрыть спиннер и показать кнопку «повторить». Иначе
                    пользователь видит вечную загрузку.
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
        intro="Управляйте симулятором запросов ниже. Пройдите все состояния Promise и обработайте ошибку."
        tasks={ASYNC_TASKS.map((task) => ({
          id: task.id,
          title: task.title,
          content: (
            <AsyncTaskCard task={task} state={state} logCount={log.length} visitedStates={visitedStates} />
          ),
        }))}
        progressBars={taskResults}
        allDone={allDone}
        doneMessage="Все 5 задач выполнены! Вы освоили async/await и HTTP-запросы."
      />

      {/* ── Симулятор запроса ───────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Симулятор API-запроса</h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${config.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state === 'pending' ? 'bg-amber-400 animate-pulse-soft' : state === 'fulfilled' ? 'bg-emerald-400' : state === 'rejected' ? 'bg-rose-400' : 'bg-slate-600'}`} />
            <span className={`text-[11px] font-mono font-bold ${config.color}`}>{config.label}</span>
          </div>
        </div>

        <div className={`rounded-lg border p-5 mb-4 transition-colors duration-300 ${config.bg}`}>
          {state === 'idle' && (
            <>
              <Database className="w-9 h-9 text-slate-600 mx-auto mb-2" />
              <p className="text-center text-[13px] text-slate-500 font-mono">Нет активного запроса</p>
              <p className="text-center text-[11px] text-slate-700 font-mono mt-1">state: "idle" — ожидание fetch()</p>
            </>
          )}
          {state === 'pending' && (
            <div className="animate-fade-in">
              <Loader2 className="w-9 h-9 text-amber-400 mx-auto mb-2 animate-spin" />
              <p className="text-center text-[13px] text-amber-400 font-mono">Ожидание разрешения Promise...</p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">state: "pending" — асинхронная операция выполняется</p>
            </div>
          )}
          {state === 'fulfilled' && response && (
            <div className="animate-fade-in">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
              <p className="text-center text-[13px] text-emerald-400 font-mono">Promise resolved — {response.rows.length} строк получено</p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">state: "fulfilled" · HTTP {response.status} · {response.method} {response.endpoint}</p>
            </div>
          )}
          {state === 'rejected' && (
            <div className="animate-fade-in">
              <XCircle className="w-9 h-9 text-rose-400 mx-auto mb-2" />
              <p className="text-center text-[13px] text-rose-400 font-mono">Promise rejected — {error}</p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">state: "rejected" — выполнен блок catch</p>
            </div>
          )}
        </div>

        {/* Кнопки */}
        {state === 'fulfilled' || state === 'rejected' ? (
          <button
            onClick={reset}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2.5 text-[13px] font-semibold hover:bg-slate-700 hover:border-slate-600 transition-colors"
          >
            Reset — Новый запрос
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleFetch}
              disabled={state === 'pending'}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-2.5 text-[13px] font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {state === 'pending' ? (<><Loader2 className="w-4 h-4 animate-spin" />Загрузка...</>) : (<><Network className="w-4 h-4" />Fetch Data From API</>)}
            </button>
            <button
              onClick={handleSimulateError}
              disabled={state === 'pending'}
              className="bg-slate-800 border border-rose-500/30 text-rose-400 rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Simulate Error
            </button>
          </div>
        )}
      </div>

      {/* ── JSON-ответ ──────────────────────────────────────── */}
      {state === 'fulfilled' && response && (
        <div className="animate-fade-in rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">JSON-ответ (SQL SELECT)</h3>
          </div>
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex flex-wrap gap-3 text-[11px] font-mono">
              <span className="text-slate-500">status: <span className="text-emerald-400">{response.status}</span></span>
              <span className="text-slate-500">method: <span className="text-slate-300">{response.method}</span></span>
              <span className="text-slate-500">endpoint: <span className="text-sky-400">{response.endpoint}</span></span>
              <span className="text-slate-500">timestamp: <span className="text-slate-400">{response.timestamp}</span></span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left px-4 py-2 font-normal">id</th>
                  <th className="text-left px-4 py-2 font-normal">username</th>
                  <th className="text-left px-4 py-2 font-normal">email</th>
                  <th className="text-left px-4 py-2 font-normal">role</th>
                  <th className="text-left px-4 py-2 font-normal">created_at</th>
                </tr>
              </thead>
              <tbody>
                {response.rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-900/50 text-slate-400">
                    <td className="px-4 py-2 text-slate-600">{row.id}</td>
                    <td className="px-4 py-2 text-sky-300">{row.username}</td>
                    <td className="px-4 py-2 text-slate-300">{row.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : row.role === 'user' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/40 text-slate-400'}`}>{row.role}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 text-[11px]">{row.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Журнал запросов ─────────────────────────────────── */}
      {log.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Журнал запросов ({log.length})</h3>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {log.map((entry, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] font-mono ${entry.includes('ERROR') ? 'text-rose-400' : 'text-slate-500'}`}>
                {entry.includes('ERROR') ? <XCircle className="w-3 h-3 text-rose-500/70 shrink-0" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500/70 shrink-0" />}
                <span>{entry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lifecycle Promise ───────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Жизненный цикл Promise</h3>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'pending' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : visitedStates.has('pending') ? 'border-slate-700 bg-slate-900/30 text-slate-500' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Pending
          </div>
          <span className="text-slate-700">→</span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'fulfilled' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : visitedStates.has('fulfilled') ? 'border-slate-700 bg-slate-900/30 text-slate-500' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Fulfilled
          </div>
          <span className="text-slate-700">|</span>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'rejected' ? 'border-rose-500/40 bg-rose-500/10 text-rose-400' : visitedStates.has('rejected') ? 'border-slate-700 bg-slate-900/30 text-slate-500' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />Rejected
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`async function handleFetch(): Promise<void> {
  setState("pending")  // UI: спиннер

  try {
    const data = await fetchFromApi()  // ожидание Promise
    setResponse(data)
    setState("fulfilled")  // UI: рендер JSON
  } catch (error) {
    setError(error.message)
    setState("rejected")  // UI: сообщение об ошибке
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
