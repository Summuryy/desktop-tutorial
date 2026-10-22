import { useState } from 'react';
import { Network, Terminal, Loader2, CheckCircle2, XCircle, Database } from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import type { RequestState, ApiResponse } from '@/types';

// ============================================================
// Модуль 04: Functions, Async/Await & API Architecture
// Симуляция асинхронного запроса к REST API.
// Стейт: idle → pending (loader) → fulfilled (JSON-ответ)
// или rejected (ошибка). Имитация выборки из SQL-базы.
// ============================================================

// Имитация данных из SQL-базы (SELECT * FROM users LIMIT 3)
const MOCK_SQL_ROWS: ApiResponse['rows'] = [
  { id: 1, username: 'admin', email: 'admin@dev.io', role: 'admin', created_at: '2024-01-15T09:30:00Z' },
  { id: 2, username: 'kmikhailov', email: 'kris@dev.io', role: 'user', created_at: '2024-03-22T14:45:00Z' },
  { id: 3, username: 'guest_user', email: 'guest@dev.io', role: 'guest', created_at: '2024-06-08T11:20:00Z' },
];

// Имитация Promise — асинхронного запроса к REST API.
// resolve — через setTimeout, как реальный fetch() к серверу.
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

// Конфигурация отображения статусов
const STATE_CONFIG: Record<RequestState, { label: string; color: string; bg: string }> = {
  idle: { label: 'Idle', color: 'text-slate-500', bg: 'border-slate-800 bg-slate-900/30' },
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'border-amber-500/30 bg-amber-500/5' },
  fulfilled: { label: 'Fulfilled', color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/5' },
  rejected: { label: 'Rejected', color: 'text-rose-400', bg: 'border-rose-500/30 bg-rose-500/5' },
};

export default function AsyncApiModule() {
  // Текущий стейт запроса
  const [state, setState] = useState<RequestState>('idle');
  // Полученный ответ от API
  const [response, setResponse] = useState<ApiResponse | null>(null);
  // Сообщение об ошибке (при rejected)
  const [error, setError] = useState<string | null>(null);
  // Журнал запросов
  const [log, setLog] = useState<string[]>([]);

  // Асинхронная функция — обёртка над Promise через async/await
  const handleFetch = async () => {
    setState('pending');
    setError(null);

    try {
      // await приостанавливает выполнение до разрешения Promise
      const data = await fetchFromApi();
      setResponse(data);
      setState('fulfilled');
      const ts = new Date().toLocaleTimeString('en-GB');
      setLog((prev) => [`[${ts}] GET /api/v1/users → ${data.status} OK · ${data.rows.length} rows`, ...prev].slice(0, 6));
    } catch (err) {
      // Блок catch — обработка rejected Promise
      setState('rejected');
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  // Сброс к начальному состоянию
  const reset = () => {
    setState('idle');
    setResponse(null);
    setError(null);
  };

  const config = STATE_CONFIG[state];

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Network className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Functions, Async/Await & API</h2>
          <p className="text-[12px] text-slate-500 font-mono">signature · scope · callback · Promise · async/await · HTTP states</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation"
        sections={[
          {
            heading: 'Сигнатура функции, параметры, scope',
            body: (
              <p>
                Сигнатура функции определяет её контракт: имя, список параметров (типизированных
                аргументов) и тип возвращаемого значения. <span className="font-mono text-slate-300">
                func fetchData(url: String) async -&gt; Response</span> (Swift) или
                <span className="font-mono text-slate-300"> async function fetchData(url: string): Promise&lt;Response&gt;</span> (TS).
                Scope (область видимости) определяет доступность переменных: block scope
                (<span className="font-mono">let/const</span>), function scope
                (<span className="font-mono">var</span> в JS). Переменные, объявленные внутри
                функции, недоступны снаружи.
              </p>
            ),
          },
          {
            heading: 'Callback, Promises, Async/Await',
            body: (
              <p>
                <span className="font-mono text-slate-300">Callback</span> — функция, переданная
                как аргумент для выполнения после завершения операции. Приводит к callback hell
                при вложенности. <span className="font-mono text-slate-300">Promise</span> —
                объект-обёртка над асинхронным результатом с тремя состояниями: pending,
                fulfilled, rejected.
                <span className="font-mono text-slate-300"> async/await</span> — синтаксический
                сахар над Promises: <span className="font-mono">await</span> приостанавливает
                выполнение функции до разрешения Promise, делает асинхронный код
                линейным и читаемым. Блок <span className="font-mono">try/catch</span> —
                обработка rejected состояния.
              </p>
            ),
          },
          {
            heading: 'HTTP-стейты и REST API',
            body: (
              <p>
                REST API возвращает HTTP-статусы: <span className="font-mono text-emerald-400">200</span> OK
                (успех), <span className="font-mono text-amber-400">401</span> Unauthorized
                (нет токена), <span className="font-mono text-rose-400">403</span> Forbidden
                (недостаточно прав), <span className="font-mono text-rose-400">500</span> Internal
                Server Error. Клиент обрабатывает ответ на основе статуса: 2xx → рендеринг
                данных, 4xx/5xx → отображение ошибки. JSON-ответ — сериализованная выборка
                из SQL-базы (<span className="font-mono">SELECT * FROM table</span>).
              </p>
            ),
          },
        ]}
      />

      {/* Симулятор запроса */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            API Request Simulator
          </h3>
          {/* Индикатор текущего стейта */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${config.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state === 'pending' ? 'bg-amber-400 animate-pulse-soft' : state === 'fulfilled' ? 'bg-emerald-400' : state === 'rejected' ? 'bg-rose-400' : 'bg-slate-600'}`} />
            <span className={`text-[11px] font-mono font-bold ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Область результата */}
        <div className={`rounded-lg border p-5 mb-4 transition-colors duration-300 ${config.bg}`}>
          {state === 'idle' && (
            <>
              <Database className="w-9 h-9 text-slate-600 mx-auto mb-2" />
              <p className="text-center text-[13px] text-slate-500 font-mono">
                No active request
              </p>
              <p className="text-center text-[11px] text-slate-700 font-mono mt-1">
                state: "idle" — awaiting fetch()
              </p>
            </>
          )}

          {state === 'pending' && (
            <div className="animate-fade-in">
              <Loader2 className="w-9 h-9 text-amber-400 mx-auto mb-2 animate-spin" />
              <p className="text-center text-[13px] text-amber-400 font-mono">
                Awaiting Promise resolution...
              </p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">
                state: "pending" — async operation in progress
              </p>
            </div>
          )}

          {state === 'fulfilled' && response && (
            <div className="animate-fade-in">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
              <p className="text-center text-[13px] text-emerald-400 font-mono">
                Promise resolved — {response.rows.length} rows fetched
              </p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">
                state: "fulfilled" · HTTP {response.status} · {response.method} {response.endpoint}
              </p>
            </div>
          )}

          {state === 'rejected' && (
            <div className="animate-fade-in">
              <XCircle className="w-9 h-9 text-rose-400 mx-auto mb-2" />
              <p className="text-center text-[13px] text-rose-400 font-mono">
                Promise rejected — {error}
              </p>
              <p className="text-center text-[11px] text-slate-600 font-mono mt-1">
                state: "rejected" — catch block executed
              </p>
            </div>
          )}
        </div>

        {/* Кнопка запроса */}
        {state === 'fulfilled' || state === 'rejected' ? (
          <button
            onClick={reset}
            className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-lg py-2.5 text-[13px] font-semibold hover:bg-slate-700 hover:border-slate-600 transition-colors"
          >
            Reset — New Request
          </button>
        ) : (
          <button
            onClick={handleFetch}
            disabled={state === 'pending'}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-3 text-[13px] font-semibold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {state === 'pending' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Network className="w-4 h-4" />
                Fetch Data From API
              </>
            )}
          </button>
        )}
      </div>

      {/* JSON-ответ от API */}
      {state === 'fulfilled' && response && (
        <div className="animate-fade-in rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Response Body — JSON (SQL SELECT result)
            </h3>
          </div>

          {/* Заголовок ответа */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex flex-wrap gap-3 text-[11px] font-mono">
              <span className="text-slate-500">status: <span className="text-emerald-400">{response.status}</span></span>
              <span className="text-slate-500">method: <span className="text-slate-300">{response.method}</span></span>
              <span className="text-slate-500">endpoint: <span className="text-sky-400">{response.endpoint}</span></span>
              <span className="text-slate-500">timestamp: <span className="text-slate-400">{response.timestamp}</span></span>
            </div>
          </div>

          {/* Таблица с данными (имитация SQL-выборки) */}
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
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        row.role === 'admin' ? 'bg-amber-500/15 text-amber-400' :
                        row.role === 'user' ? 'bg-emerald-500/15 text-emerald-400' :
                        'bg-slate-700/40 text-slate-400'
                      }`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 text-[11px]">{row.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Журнал запросов */}
      {log.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Request Log
            </h3>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {log.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <CheckCircle2 className="w-3 h-3 text-emerald-500/70 shrink-0" />
                <span>{entry}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Визуализация жизненного цикла Promise */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Promise Lifecycle
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          {/* Pending */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'pending' ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </div>
          <span className="text-slate-700">→</span>
          {/* Fulfilled */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'fulfilled' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Fulfilled
          </div>
          <span className="text-slate-700">|</span>
          {/* Rejected */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border ${state === 'rejected' ? 'border-rose-500/40 bg-rose-500/10 text-rose-400' : 'border-slate-800 bg-slate-900/30 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </div>
        </div>

        {/* Псевдокод async/await */}
        <div className="mt-4 rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`async function handleFetch(): Promise<void> {
  setState("pending")  // UI: loader

  try {
    const data = await fetchFromApi()  // suspend until resolved
    setResponse(data)
    setState("fulfilled")  // UI: render JSON
  } catch (error) {
    setError(error.message)
    setState("rejected")  // UI: error message
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
