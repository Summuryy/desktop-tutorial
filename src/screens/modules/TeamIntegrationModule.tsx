import { useState, useRef } from 'react';
import {
  Users,
  KeyRound,
  ShieldCheck,
  Lock,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle2,
  GitMerge,
  FileCode2,
  Terminal,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';

// ============================================================
// Модуль 07: Team Integration & Network Workflow
// Три блока:
//  1. CyberSec — Bearer Tokens, HTTP-заголовки, Encryption
//  2. Local Storage & SQL Sync — Offline-first, синхронизация
//  3. Git Merge Conflicts — чтение и разрешение конфликтов
// ============================================================

// ─────────────────────────────────────────────────────────
// Блок 1: JWT / Bearer Token
// ─────────────────────────────────────────────────────────

// Имитация генерации JWT (3 части: header.payload.signature)
function generateMockJWT(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'user_42',
    role: 'developer',
    iat: Date.now(),
    exp: Date.now() + 3600000,
  }));
  const signature = btoa('hs256_signature_' + Math.random().toString(36).slice(2));
  return `${header}.${payload}.${signature}`;
}

// Декодирование payload JWT для отображения содержимого
function decodeJWTPayload(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 'Invalid token format';
    const payload = JSON.parse(atob(parts[1]));
    return JSON.stringify(payload, null, 2);
  } catch {
    return 'Failed to decode payload';
  }
}

// ─────────────────────────────────────────────────────────
// Блок 2: Offline-first sync
// ─────────────────────────────────────────────────────────

// Строка локальной задачи (Local Storage)
interface LocalTask {
  id: number;
  title: string;
  synced: boolean; // false — есть несинхронизированные изменения
}

// ─────────────────────────────────────────────────────────
// Блок 3: Git Merge Conflict
// ─────────────────────────────────────────────────────────

// Две конфликтующие версии одной строки кода
const CONFLICT_MINE = `const API_URL = "https://api.v2.dev.io";`;
const CONFLICT_TEAM = `const API_URL = "https://api.staging.dev.io";`;

// Имя иконки для лого модуля
const HEADER_ICON = Users;

export default function TeamIntegrationModule() {
  // ── Состояние блока 1: JWT ──
  const [jwt, setJwt] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<string[]>([]);

  // Генерация JWT и сохранение в "зашифрованное локальное хранилище"
  const generateToken = () => {
    const token = generateMockJWT();
    setJwt(token);
    setRequestLog([]);
  };

  // Имитация сетевого запроса с прикреплённым Bearer-токеном
  const sendRequest = () => {
    if (!jwt) return;
    const ts = new Date().toLocaleTimeString('en-GB');
    const entry = `[${ts}] GET /api/v1/users\n  Authorization: Bearer ${jwt.slice(0, 20)}...\n  → 200 OK`;
    setRequestLog((prev) => [...prev, entry]);
  };

  // Очистка токена (logout)
  const clearToken = () => {
    setJwt(null);
    setRequestLog([]);
  };

  // ── Состояние блока 2: Offline-first ──
  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState<LocalTask[]>([
    { id: 1, title: 'Setup CI/CD pipeline', synced: true },
    { id: 2, title: 'Write unit tests for auth', synced: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  // Добавление задачи в локальный кэш
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const id = Date.now();
    // В Offline-режиме задача помечается как unsynced
    setTasks((prev) => [...prev, { id, title: newTaskTitle.trim(), synced: isOnline }]);
    setNewTaskTitle('');
  };

  // Удаление задачи
  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Переключение Online/Offline
  const toggleNetwork = () => {
    setIsOnline((prev) => {
      const next = !prev;
      // При переходе в Online — запускаем синхронизацию
      if (next && tasks.some((t) => !t.synced)) {
        runSync();
      }
      return next;
    });
  };

  // Асинхронная синхронизация локального кэша с удалённой SQL-БД
  const runSync = () => {
    setIsSyncing(true);
    setSyncLog((prev) => [...prev, '[SYNC] Отправка пакета данных...']);

    // Имитация задержки сетевого запроса (1.2 секунды)
    setTimeout(() => {
      // Помечаем все задачи как синхронизированные
      setTasks((prev) => prev.map((t) => ({ ...t, synced: true })));
      setIsSyncing(false);
      const ts = new Date().toLocaleTimeString('en-GB');
      setSyncLog((prev) => [
        `[${ts}] [SYNC] Удаленная база SQL успешно обновлена`,
        ...prev,
      ]);
    }, 1200);
  };

  // Подсчёт несинхронизированных задач
  const unsyncedCount = tasks.filter((t) => !t.synced).length;

  // ── Состояние блока 3: Git Merge Conflict ──
  const [resolution, setResolution] = useState<'none' | 'mine' | 'team'>('none');

  // Разрешение конфликта: выбор версии
  const resolveConflict = (choice: 'mine' | 'team') => {
    setResolution(choice);
  };

  // Текущий резолвнутый код
  const resolvedCode = resolution === 'mine'
    ? CONFLICT_MINE
    : resolution === 'team'
      ? CONFLICT_TEAM
      : '';

  // Редактор для блока 3 (имитация IDE)
  const mergeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок модуля */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Users className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Team Integration & Network Workflow</h2>
          <p className="text-[12px] text-slate-500 font-mono">JWT · Offline/SQL Sync · Git Merge Conflicts</p>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* БЛОК 1: CyberSec — Bearer Tokens & HTTP Headers        */}
      {/* ═════════════════════════════════════════════════════ */}

      {/* Тех. документация блока 1 */}
      <TechDoc
        title="Technical Documentation — Session Validation & Security Headers"
        sections={[
          {
            heading: 'Bearer Token (JWT)',
            body: (
              <p>
                JSON Web Token (JWT) — компактный, URL-safe токен, содержащий три
                base64-кодированные части: header (алгоритм подписи),
                payload (claims: sub, role, exp), signature (HMAC).
                Передаётся в HTTP-заголовке
                <span className="font-mono text-slate-300"> Authorization: Bearer &lt;token&gt;</span>.
                Сервер валидирует подпись и срок действия (exp) без обращения к БД —
                stateless-аутентификация.
              </p>
            ),
          },
          {
            heading: 'Защита данных на клиенте (Encryption)',
            body: (
              <p>
                Токены и чувствительные данные хранятся в
                <span className="font-mono text-slate-300"> sessionStorage</span> или
                <span className="font-mono text-slate-300"> encrypted localStorage</span>
                (не в cookie — риск CSRF). Шифрование на клиенте через
                Web Crypto API (AES-GCM) защищает от XSS-экстракции. Для HTTPS-only
                полей используется флаг
                <span className="font-mono text-slate-300"> HttpOnly + Secure + SameSite</span>.
                Токен аннулируется при logout через clearing хранилища и
                <span className="font-mono text-slate-300"> /auth/logout</span> endpoint.
              </p>
            ),
          },
          {
            heading: 'Авторизационные заголовки',
            body: (
              <p>
                Каждый HTTP-запрос к защищённому endpoint должен содержать
                заголовок <span className="font-mono text-slate-300">Authorization</span> с
                Bearer-схемой. При отсутствии или истечении токена сервер возвращает
                <span className="font-mono text-amber-400"> 401 Unauthorized</span>.
                При недостаточности прав —
                <span className="font-mono text-rose-400"> 403 Forbidden</span>.
                Клиент перехватывает эти статусы в interceptor'е и перенаправляет
                на /login.
              </p>
            ),
          },
        ]}
      />

      {/* Интерактив: Симулятор инъекции токена */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Интерактив: Инъекция токена (Token Injection)
          </h3>
        </div>

        {/* Кнопки управления */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={generateToken}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors active:scale-[0.98]"
          >
            <KeyRound className="w-4 h-4" />
            Сгенерировать JWT-токен
          </button>
          {jwt && (
            <button
              onClick={sendRequest}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-slate-700 transition-colors"
            >
              <Network className="w-4 h-4" />
              Send Request
            </button>
          )}
          {jwt && (
            <button
              onClick={clearToken}
              className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-lg px-3 py-2 text-[12px] hover:text-rose-400 hover:border-rose-500/30 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Revoke
            </button>
          )}
        </div>

        {/* Хранилище токена — зашифрованное локальное хранилище */}
        {jwt ? (
          <div className="space-y-3">
            {/* Токен в "зашифрованном хранилище" */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Encrypted Local Storage
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  AES-256
                </span>
              </div>
              {/* Токен с подсветкой трёх частей */}
              <p className="font-mono text-[11px] text-slate-500 break-all leading-relaxed">
                {jwt.split('.').map((part, i) => (
                  <span key={i} className={
                    i === 0 ? 'text-sky-400' : i === 1 ? 'text-emerald-400' : 'text-amber-400'
                  }>
                    {part}{i < 2 ? '.' : ''}
                  </span>
                ))}
              </p>
            </div>

            {/* Декодированный payload */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 block">
                JWT Payload (decoded)
              </span>
              <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                {decodeJWTPayload(jwt)}
              </pre>
            </div>

            {/* Лог сетевых запросов с Bearer-заголовком */}
            {requestLog.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Network Requests (with Bearer header)
                  </span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {requestLog.map((entry, i) => (
                    <pre key={i} className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap animate-fade-in">
                      {entry.split('\n').map((line, j) => (
                        <span key={j} className={
                          line.includes('Authorization')
                            ? 'text-amber-400'
                            : line.includes('200')
                              ? 'text-emerald-400'
                              : ''
                        }>
                          {line}
                          {'\n'}
                        </span>
                      ))}
                    </pre>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Нет токена — начальное состояние
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-6 text-center">
            <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-[12px] text-slate-600 font-mono">
              No token in storage — requests will return 401 Unauthorized
            </p>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* БЛОК 2: Local Storage & SQL Sync                       */}
      {/* ═════════════════════════════════════════════════════ */}

      <TechDoc
        title="Technical Documentation — Offline-First & SQL Synchronization"
        sections={[
          {
            heading: 'Offline-first паттерн',
            body: (
              <p>
                Offline-first — архитектурный паттерн, при котором приложение
                работает с локальным кэшем (localStorage, IndexedDB, SQLite) как
                с основным источником данных. Сетевые запросы к удалённой БД
                ставятся в очередь (write-behind) и выполняются при восстановлении
                соединения. Пользователь не блокируется ожиданием ответа сервера —
                UI рендерится из локального кэша мгновенно.
              </p>
            ),
          },
          {
            heading: 'Синхронизация с реляционной БД',
            body: (
              <p>
                При переходе в Online клиент отправляет batch несинхронизированных
                записей на сервер через
                <span className="font-mono text-slate-300"> POST /api/v1/sync</span>.
                Сервер применяет изменения в SQL-БД (UPSERT / INSERT ON CONFLICT).
                Каждый локальный элемент имеет флаг
                <span className="font-mono text-slate-300"> synced: boolean</span> —
                false означает наличие unsynced-изменений. При успешном ответе
                (200 OK) флаг устанавливается в true. Конфликты версий
                разрешаются через timestamp-based merge (last-write-wins) или
                vector clocks.
              </p>
            ),
          },
        ]}
      />

      {/* Интерактив: Offline-first синхронизация */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Интерактив: Local Cache ↔ SQL Sync
          </h3>
        </div>

        {/* Индикатор состояния сети */}
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-slate-900/40 border border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-[13px] font-medium text-slate-200">
                Network: {isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-[11px] font-mono text-slate-600">
                {isOnline
                  ? 'Connected — changes sync immediately'
                  : 'Disconnected — changes queued locally'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleNetwork}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isOnline ? 'bg-emerald-600/60' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-slate-200 transition-transform duration-200 ${
                isOnline ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Индикатор несинхронизированных данных */}
        {unsyncedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-amber-500/5 border border-amber-500/20 mb-3 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
            <p className="text-[11px] font-mono text-amber-400">
              {unsyncedCount} unsynced task(s) in local cache — switch to Online to sync
            </p>
          </div>
        )}

        {/* Форма добавления задачи */}
        <div className="flex gap-2 mb-3">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="New task title..."
            disabled={isSyncing}
            className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50"
          />
          <button
            onClick={addTask}
            disabled={!newTaskTitle.trim() || isSyncing}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold disabled:opacity-30 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Список задач (Local Cache) */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/30">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Local Cache ({tasks.length} items)
            </span>
          </div>
          <div className="divide-y divide-slate-800">
            {tasks.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-slate-700 font-mono text-center">
                Cache is empty — add a task above
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 px-4 py-2.5 animate-cell-in hover:bg-slate-900/30 transition-colors group"
                >
                  {/* Индикатор статуса синхронизации */}
                  {task.synced ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-amber-500/40 flex items-center justify-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </span>
                  )}
                  <span className="text-[13px] font-mono text-slate-300 flex-1 min-w-0 truncate">
                    {task.title}
                  </span>
                  <span className={`text-[10px] font-mono ${task.synced ? 'text-emerald-400/60' : 'text-amber-400/70'}`}>
                    {task.synced ? 'synced' : 'pending'}
                  </span>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <span className="text-[14px]">×</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Лог синхронизации */}
        {(isSyncing || syncLog.length > 0) && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
              {isSyncing ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Sync Log
              </span>
            </div>
            <div className="px-4 py-3 space-y-1">
              {isSyncing && (
                <p className="text-[11px] font-mono text-amber-400 animate-pulse-soft">
                  [SYNC] Sending data batch to remote SQL database...
                </p>
              )}
              {syncLog.map((entry, i) => (
                <p
                  key={i}
                  className={`text-[11px] font-mono animate-fade-in ${
                    entry.includes('успешно') ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* БЛОК 3: Git Merge Conflicts                            */}
      {/* ═════════════════════════════════════════════════════ */}

      <TechDoc
        title="Technical Documentation — Git Merge Conflicts"
        sections={[
          {
            heading: 'Что такое конфликт слияния',
            body: (
              <p>
                Merge conflict возникает, когда две ветки (git branches) изменяют
                одну и ту же строку файла. Git не может автоматически определить,
                какую версию сохранить. Конфликтные блоки помечаются маркерами:
                <span className="font-mono text-amber-400"> {'<<<<<<< HEAD'}</span>
                (текущая ветка), <span className="font-mono text-slate-300"> {'======='}</span>
                (разделитель) и
                <span className="font-mono text-sky-400"> {'>>>>>>> branch-name'}</span>
                (входящая ветка). Разрешение: вручную выбрать одну версию или
                объединить обе, удалить маркеры, затем
                <span className="font-mono text-slate-300"> git add</span> +
                <span className="font-mono text-slate-300"> git commit</span>.
              </p>
            ),
          },
          {
            heading: 'Чтение конфликта',
            body: (
              <p>
                Блок между
                <span className="font-mono text-amber-400"> {'<<<<<<<'}</span> и
                <span className="font-mono text-slate-300"> {'======='}</span> —
                ваши изменения (HEAD). Блок между
                <span className="font-mono text-slate-300"> {'======='}</span> и
                <span className="font-mono text-sky-400"> {'>>>>>>>'}</span> —
                изменения входящей ветки (обычно teammate's branch или PR).
                Стратегии разрешения: accept current (your), accept incoming (team),
                merge manually. После разрешения —
                <span className="font-mono text-slate-300"> git merge --continue</span>.
              </p>
            ),
          },
        ]}
      />

      {/* Интерактив: Симулятор разрешения merge conflict */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitMerge className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Интерактив: Merge Conflict Resolver
          </h3>
        </div>

        {/* Окно конфликта (IDE-style) */}
        <div className="rounded-lg border border-slate-800 overflow-hidden mb-4" ref={mergeRef}>
          {/* Заголовок редактора */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-400">config.ts</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              resolution === 'none'
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {resolution === 'none' ? 'CONFLICT' : 'RESOLVED'}
            </span>
          </div>

          {/* Тело конфликта */}
          <div className="px-4 py-3 font-mono text-[13px] leading-relaxed">
            {/* Маркер начала конфликта */}
            {resolution === 'none' ? (
              <>
                <p className="text-amber-400/70">{'<<<<<<< HEAD (your changes)'}</p>
                <p className="text-amber-300 pl-3 py-1 bg-amber-500/5 rounded">
                  {CONFLICT_MINE}
                </p>
                <p className="text-slate-600">{'======='}</p>
                <p className="text-sky-300 pl-3 py-1 bg-sky-500/5 rounded">
                  {CONFLICT_TEAM}
                </p>
                <p className="text-sky-400/70">{'>>>>>>> feature/api-endpoints (team)'}</p>
              </>
            ) : (
              /* Резолвнутый код — без маркеров */
              <p className="text-emerald-300 animate-fade-in pl-3 py-1 bg-emerald-500/5 rounded">
                {resolvedCode}
              </p>
            )}
          </div>
        </div>

        {/* Кнопки разрешения */}
        {resolution === 'none' ? (
          <div className="flex gap-2">
            <button
              onClick={() => resolveConflict('mine')}
              className="flex items-center gap-2 bg-slate-800 border border-amber-500/30 text-amber-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-amber-500/10 transition-colors active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Принять мои изменения
            </button>
            <button
              onClick={() => resolveConflict('team')}
              className="flex items-center gap-2 bg-slate-800 border border-sky-500/30 text-sky-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-sky-500/10 transition-colors active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Принять изменения команды
            </button>
          </div>
        ) : (
          /* Результат разрешения — код скомпилирован */
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-emerald-400 font-bold text-[13px]">
                  Конфликт разрешён — код успешно компилируется без ошибок
                </p>
              </div>
              <p className="text-emerald-400/60 text-[11px] font-mono ml-6">
                Selected: {resolution === 'mine' ? 'HEAD (your branch)' : 'feature/api-endpoints (team)'} → git add config.ts && git merge --continue
              </p>
            </div>
            {/* Кнопка сброса для повторного прохода */}
            <button
              onClick={() => setResolution('none')}
              className="text-[12px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Reset conflict
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
