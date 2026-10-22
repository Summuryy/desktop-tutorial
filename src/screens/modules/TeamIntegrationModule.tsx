import { useState, useEffect, useMemo, useRef } from 'react';
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
  XCircle,
  GitMerge,
  FileCode2,
  Terminal,
  Loader2,
  ShieldAlert,
  Network,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  GitCommit,
  GitPullRequest,
  Upload,
  Download,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import { useGame, XP_REWARDS } from '@/context/GameContext';

// ============================================================
// Модуль 07: Командная интеграция и сетевой workflow
// Расширенная теория (JWT, Git, Offline-first), 5 задач,
// интерактивные симуляторы токенов, Git и merge conflict.
// ============================================================

// ── JWT утилиты ─────────────────────────────────────────────

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

// ── Offline-first ───────────────────────────────────────────

interface LocalTask {
  id: number;
  title: string;
  synced: boolean;
}

// ── Git Merge Conflict ──────────────────────────────────────

const CONFLICT_MINE = `const API_URL = "https://api.v2.dev.io";`;
const CONFLICT_TEAM = `const API_URL = "https://api.staging.dev.io";`;

// ── Git команды для симулятора ──────────────────────────────

interface GitCommand {
  cmd: string;
  description: string;
  output: string;
}

const GIT_COMMANDS: GitCommand[] = [
  { cmd: 'git status', description: 'Показать состояние рабочей области', output: 'On branch main\nChanges to be committed:\n  modified: config.ts' },
  { cmd: 'git add .', description: 'Добавить все изменения в staging area', output: 'Files staged: config.ts, utils.ts' },
  { cmd: 'git commit -m "fix: update API URL"', description: 'Зафиксировать изменения с сообщением', output: '[main 8f3a2b1] fix: update API URL\n 2 files changed, 5 insertions(+)' },
  { cmd: 'git push origin main', description: 'Отправить коммиты на удалённый репозиторий', output: 'Enumerating objects: 8, done.\nTo github.com:team/project.git\n   7d9e1c0..8f3a2b1  main -> main' },
  { cmd: 'git pull origin main', description: 'Получить изменения с удалённого репозитория', output: 'Updating 8f3a2b1..9a4c5d3\nFast-forward\n config.ts | 4 +-' },
];

// ── Практические задачи ─────────────────────────────────────

interface TeamTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  validate: (jwt: string | null, requestCount: number, resolution: string, gitCommandsRun: string[], onlineState: boolean, unsyncedCount: number) => { ok: boolean; message: string };
}

const TEAM_TASKS: TeamTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Сгенерировать JWT-токен',
    description:
      'Нажмите «Сгенерировать JWT-токен». Токен состоит из трёх base64-частей: header.payload.signature. ' +
      'Он имитирует то, что сервер выдаёт при логине. Без токена запросы вернут 401.',
    hint: 'Нажмите кнопку «Сгенерировать JWT-токен» в симуляторе ниже.',
    validate: (jwt) =>
      jwt
        ? { ok: true, message: 'JWT создан! Три части: header (алгоритм), payload (claims), signature (подпись).' }
        : { ok: false, message: 'Нажмите «Сгенерировать JWT-токен».' },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Отправить запрос с Bearer-токеном',
    description:
      'С сгенерированным токеном нажмите «Send Request». Запрос уйдёт с заголовком ' +
      'Authorization: Bearer <token>. Сервер проверит подпись и вернёт 200 OK. ' +
      'Это имитирует инъекцию токена в HTTP-заголовок.',
    hint: 'Сначала сгенерируйте токен, затем нажмите «Send Request».',
    validate: (jwt, requestCount) =>
      jwt && requestCount >= 1
        ? { ok: true, message: 'Запрос отправлен с Bearer-токеном! Сервер вернул 200 OK.' }
        : { ok: false, message: 'Сгенерируйте токен и нажмите «Send Request».' },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Выполнить git commit и git push',
    description:
      'В симуляторе Git ниже выполните последовательно: git add . → git commit → git push. ' +
      'Это базовый workflow: добавить изменения, зафиксировать с сообщением, отправить на сервер. ' +
      'Каждая команда выводит результат как настоящий терминал.',
    hint: 'В Git-терминале ниже выполните: git add ., затем git commit, затем git push.',
    validate: (_jwt, _rc, _res, gitRun) => {
      const hasCommit = gitRun.includes('git commit');
      const hasPush = gitRun.includes('git push');
      if (hasCommit && hasPush) return { ok: true, message: 'Коммит создан и отправлен на сервер! Базовый Git workflow пройден.' };
      if (hasCommit) return { ok: false, message: 'Коммит есть, но не выполнен git push. Отправьте на сервер.' };
      return { ok: false, message: 'Выполните git add, git commit и git push в терминале ниже.' };
    },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Разрешить merge conflict вручную',
    description:
      'В редакторе Merge Conflict ниже выберите одну из версий — «мои изменения» (HEAD) или ' +
      '«изменения команды» (feature branch). Это имитирует ручное разрешение конфликта: ' +
      'вы выбираете, какой код оставить, удаляете маркеры <<<<<<< ======= >>>>>>> и делаете commit.',
    hint: 'Нажмите «Принять мои изменения» или «Принять изменения команды».',
    validate: (_jwt, _rc, resolution) =>
      resolution !== 'none'
        ? { ok: true, message: 'Конфликт разрешён! Выбрана версия и маркеры удалены. Осталось: git add + git merge --continue.' }
        : { ok: false, message: 'Выберите одну из версий в редакторе merge conflict.' },
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Перейти в Offline, добавить задачу и синхронизировать',
    description:
      'Выключите сеть (Offline), добавьте задачу в локальный кэш (она пометится как unsynced), ' +
      'затем включите сеть (Online) — запустится автоматическая синхронизация с SQL-БД. ' +
      'Это демонстрирует offline-first паттерн: приложение работает без сети и синхронизируется при подключении.',
    hint: 'Offline → добавьте задачу → Online (авто-синхронизация).',
    validate: (_jwt, _rc, _res, _git, _online, unsynced) => {
      // Условие: был offline, добавили задачу, потом online с sync
      // Проверяем что есть задачи и unsynced=0 (синхронизированы)
      if (unsynced === 0 && _online) {
        return { ok: true, message: 'Offline-first цикл пройден! Задача добавлена без сети и синхронизирована при подключении.' };
      }
      return { ok: false, message: 'Выключите сеть, добавьте задачу, затем включите сеть для синхронизации.' };
    },
  },
];

// ── Компонент задачи ────────────────────────────────────────

function TeamTaskCard({
  task,
  jwt,
  requestCount,
  resolution,
  gitCommandsRun,
  isOnline,
  unsyncedCount,
  taskSyncedCount,
}: {
  task: TeamTask;
  jwt: string | null;
  requestCount: number;
  resolution: string;
  gitCommandsRun: string[];
  isOnline: boolean;
  unsyncedCount: number;
  taskSyncedCount: number;
}) {
  const result = useMemo(() => {
    if (task.id === 5) {
      // Проверяем: был ли sync (unsynced=0, online, и есть задачи)
      if (isOnline && unsyncedCount === 0 && taskSyncedCount > 0) {
        return { ok: true, message: 'Offline-first цикл пройден! Задача синхронизирована.' };
      }
      return { ok: false, message: 'Offline → добавьте задачу → Online (синхронизация).' };
    }
    return task.validate(jwt, requestCount, resolution, gitCommandsRun, isOnline, unsyncedCount);
  }, [task, jwt, requestCount, resolution, gitCommandsRun, isOnline, unsyncedCount, taskSyncedCount]);

  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${result.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30'}`}>
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono text-[12px] font-bold ${result.ok ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
          {task.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 uppercase tracking-wider">{task.level}</span>
            {result.ok && <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400"><CheckCircle2 className="w-3 h-3" />Выполнено</span>}
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

export default function TeamIntegrationModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();

  // JWT
  const [jwt, setJwt] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const requestCount = requestLog.length;

  // Offline-first
  const [isOnline, setIsOnline] = useState(true);
  const [tasks, setTasks] = useState<LocalTask[]>([
    { id: 1, title: 'Setup CI/CD pipeline', synced: true },
    { id: 2, title: 'Write unit tests for auth', synced: true },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState<string[]>([]);

  // Git merge conflict
  const [resolution, setResolution] = useState<'none' | 'mine' | 'team'>('none');

  // Git терминал
  const [gitCommandsRun, setGitCommandsRun] = useState<string[]>([]);
  const [gitOutput, setGitOutput] = useState<string>('');

  // Tasks tracking
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const prevCompletedRef = useRef<Set<number>>(new Set());

  // ── JWT handlers ──────────────────────────────────────────

  const generateToken = () => {
    setJwt(generateMockJWT());
    setRequestLog([]);
    addXp(XP_REWARDS.JWT_GENERATED, 'Генерация JWT-токена');
  };

  const sendRequest = () => {
    if (!jwt) return;
    const ts = new Date().toLocaleTimeString('en-GB');
    setRequestLog((prev) => [...prev, ts]);
    if (!isAchievementUnlocked('jwt-guru')) {
      unlockAchievement('jwt-guru');
    }
  };

  const clearToken = () => {
    setJwt(null);
    setRequestLog([]);
  };

  // ── Offline handlers ──────────────────────────────────────

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const id = Date.now();
    setTasks((prev) => [...prev, { id, title: newTaskTitle.trim(), synced: isOnline }]);
    setNewTaskTitle('');
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleNetwork = () => {
    setIsOnline((prev) => {
      const next = !prev;
      if (next && tasks.some((t) => !t.synced)) {
        runSync();
      }
      return next;
    });
  };

  const runSync = () => {
    setIsSyncing(true);
    setSyncLog((prev) => [...prev, '[SYNC] Отправка пакета данных...']);
    setTimeout(() => {
      setTasks((prev) => prev.map((t) => ({ ...t, synced: true })));
      setIsSyncing(false);
      const ts = new Date().toLocaleTimeString('en-GB');
      setSyncLog((prev) => [`[${ts}] [SYNC] Удаленная база SQL успешно обновлена`, ...prev]);
    }, 1200);
  };

  const unsyncedCount = tasks.filter((t) => !t.synced).length;
  const syncedCount = tasks.filter((t) => t.synced).length;

  // ── Git merge handler ─────────────────────────────────────

  const resolveConflict = (choice: 'mine' | 'team') => {
    setResolution(choice);
    addXp(XP_REWARDS.MERGE_RESOLVED, 'Разрешение merge conflict');
    if (!isAchievementUnlocked('merge-resolver')) {
      unlockAchievement('merge-resolver');
    }
  };

  const resolvedCode = resolution === 'mine' ? CONFLICT_MINE : resolution === 'team' ? CONFLICT_TEAM : '';

  // ── Git terminal handler ──────────────────────────────────

  const runGitCommand = (cmd: GitCommand) => {
    setGitCommandsRun((prev) => [...prev, cmd.cmd]);
    setGitOutput(`$ ${cmd.cmd}\n${cmd.output}`);
  };

  // ── Task completion tracking ──────────────────────────────

  const taskResults = TEAM_TASKS.map((task) => {
    if (task.id === 5) {
      return isOnline && unsyncedCount === 0 && syncedCount > 2;
    }
    return task.validate(jwt, requestCount, resolution, gitCommandsRun, isOnline, unsyncedCount).ok;
  });

  const completedSet = new Set(taskResults.map((r, i) => (r ? i + 1 : -1)).filter((n) => n > 0));

  useEffect(() => {
    const diff = completedSet.size - prevCompletedRef.current.size;
    if (diff > 0) {
      addXp(diff * 10, 'Выполнена практическая задача по командной интеграции');
    }
    prevCompletedRef.current = completedSet;
    setCompletedTasks(completedSet);
  }, [completedSet.size, addXp]);

  const allDone = completedSet.size === TEAM_TASKS.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Users className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Командная интеграция и сетевой workflow</h2>
          <p className="text-[12px] text-slate-500 font-mono">JWT · Git · Offline/SQL Sync · Merge Conflicts</p>
        </div>
      </div>

      {/* ── Расширенная теория: JWT и Bearer Tokens ────────── */}
      <TechDoc
        title="Техническая документация — JWT, токены, заголовки"
        sections={[
          {
            heading: 'JWT (JSON Web Token) — структура и назначение',
            body: (
              <div className="space-y-2">
                <p>
                  JSON Web Token — компактный, URL-safe токен для передачи утверждений (claims)
                  между клиентом и сервером. Состоит из трёх base64-кодированных частей,
                  разделённых точками: <span className="font-mono text-sky-400">header</span>.{' '}
                  <span className="font-mono text-emerald-400">payload</span>.{' '}
                  <span className="font-mono text-amber-400">signature</span>.
                </p>
                <p>
                  <strong className="text-sky-400">Header</strong> — алгоритм подписи (HS256, RS256)
                  и тип токена (JWT). <strong className="text-emerald-400">Payload</strong> — claims:
                  sub (идентификатор пользователя), role (роль), iat (время выдачи), exp (срок
                  истечения). <strong className="text-amber-400">Signature</strong> — HMAC-подпись
                  от header+payload с секретным ключом сервера.
                </p>
                <p>
                  JWT передаётся в HTTP-заголовке{' '}
                  <span className="font-mono text-slate-300">Authorization: Bearer &lt;token&gt;</span>.
                  Сервер валидирует подпись и срок действия (exp) без обращения к БД — это
                  stateless-аутентификация. Каждый запрос самодостаточен: сервер не хранит сессию.
                </p>
                <p>
                  Преимущества: нет нагрузки на БД для проверки сессии, легко масштабировать,
                  работает между разными сервисами (микросервисы). Недостатки: нельзя отозвать
                  токен до истечения exp (решение — short-lived токены + refresh token), токен
                  виден в заголовке (нужен HTTPS).
                </p>
              </div>
            ),
          },
          {
            heading: 'Инъекция Bearer-токена в HTTP-заголовки',
            body: (
              <div className="space-y-2">
                <p>
                  Каждый HTTP-запрос к защищённому endpoint должен содержать заголовок{' '}
                  <span className="font-mono text-slate-300">Authorization</span> со схемой Bearer
                  и токеном. Без токена сервер вернёт{' '}
                  <span className="font-mono text-amber-400">401 Unauthorized</span>. С токеном,
                  но недостаточными правами —{' '}
                  <span className="font-mono text-rose-400">403 Forbidden</span>.
                </p>
                <p>
                  В коде: <span className="font-mono text-slate-300">fetch(url, &#123; headers: &#123;
                  Authorization: `Bearer $&#123;token&#125;` &#125; &#125;)</span>. В Swift с
                  URLSession: <span className="font-mono text-slate-300">request.setValue("Bearer
                  \(token)", forHTTPHeaderField: "Authorization")</span>.
                </p>
                <p>
                  Interceptor (Axios, URLSession delegate) — middleware, который автоматически
                  прикрепляет токен к каждому запросу. При 401 — перехватывает, пытается обновить
                  токен через refresh endpoint, и повторяет запрос. Это избавляет от дублирования
                  кода в каждом запросе.
                </p>
              </div>
            ),
          },
          {
            heading: 'Защита токенов на клиенте — где хранить',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">sessionStorage</span> — токен живёт
                  до закрытия вкладки. Безопасно, но неудобно: при перезагрузке нужно логиниться
                  заново. <span className="font-mono text-slate-300">localStorage</span> — токен
                  живёт до очистки или logout. Удобно, но уязвим к XSS: вредоносный скрипт может
                  прочитать токен.
                </p>
                <p>
                  <span className="font-mono text-slate-300">HttpOnly + Secure cookie</span> —
                  недоступен из JavaScript (защита от XSS), передаётся только по HTTPS. Но уязвим
                  к CSRF (решение: SameSite=Lax/Strict + CSRF-токен).
                </p>
                <p>
                  В iOS: <span className="font-mono text-slate-300">Keychain</span> — безопасное
                  хранилище ОС, зашифрованное аппаратным ключом. Лучший вариант для мобильных
                  приложений. <span className="font-mono text-slate-300">UserDefaults</span> —
                  небезопасно, не храните там токены.
                </p>
                <p>
                  Шифрование на клиенте через Web Crypto API (AES-GCM) добавляет слой защиты:
                  даже если XSS прочитает localStorage, токен зашифрован. При logout — очистка
                  хранилища + вызов <span className="font-mono text-slate-300">/auth/logout</span>{' '}
                  для аннулирования на сервере.
                </p>
              </div>
            ),
          },
        ]}
      />

      {/* ── Расширенная теория: Git ─────────────────────────── */}
      <TechDoc
        title="Техническая документация — Git: commit, push, pull, merge"
        sections={[
          {
            heading: 'Git — система контроля версий: зачем нужна',
            body: (
              <div className="space-y-2">
                <p>
                  Git — распределённая система контроля версий. Она отслеживает каждое изменение
                  в коде: кто, когда и что изменил. Можно вернуться к любой версии, видеть
                  историю файла, создавать ветки для параллельной работы. Без Git командная
                  разработка превратилась бы в хаос перезаписи файлов друг друга.
                </p>
                <p>
                  Репозиторий — папка с кодом + скрытая папка .git, где хранится вся история.
                  Локальный репозиторий — на вашем компьютере. Удалённый (remote) — на GitHub,
                  GitLab, Bitbucket. Синхронизация между ними — через push и pull.
                </p>
                <p>
                  Ветка (branch) — параллельная линия разработки. main/master — главная ветка
                  (продакшен). feature/* — ветки для новых функций. Каждый разработчик работает
                  в своей ветке, не мешая другим. Когда работа готова — ветка вливается обратно
                  в main через merge или Pull Request.
                </p>
              </div>
            ),
          },
          {
            heading: 'Базовый Git workflow: add → commit → push',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">git status</span> — показывает, какие
                  файлы изменены, добавлены в staging area или закоммичены. Первая команда, которую
                  нужно выполнить перед любым действием — понять текущее состояние.
                </p>
                <p>
                  <span className="font-mono text-slate-300">git add .</span> — добавляет все
                  изменённые файлы в staging area (индекс). Это «зона подготовки»: изменения
                  помечены как готовые к коммиту, но ещё не зафиксированы. Можно добавить
                  отдельный файл: <span className="font-mono">git add config.ts</span>.
                </p>
                <p>
                  <span className="font-mono text-slate-300">git commit -m "сообщение"</span> —
                  фиксирует изменения из staging area в историю. Создаёт снимок (snapshot) кода
                  с уникальным хешем. Сообщение коммита должно описывать, ЧТО изменено и ЗАЧЕМ.
                  Хороший формат: <span className="font-mono">type: description</span> (feat:,
                  fix:, refactor:, docs:).
                </p>
                <p>
                  <span className="font-mono text-slate-300">git push origin main</span> —
                  отправляет локальные коммиты на удалённый репозиторий (origin) в ветку main.
                  После push изменения видны всей команде. Без push коммиты существуют только
                  на вашем компьютере.
                </p>
              </div>
            ),
          },
          {
            heading: 'git pull и merge — получение изменений от команды',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">git pull origin main</span> —
                  получает изменения с удалённого репозитория и вливает их в вашу локальную
                  ветку. Это комбинация <span className="font-mono">git fetch</span> (скачать) +
                  <span className="font-mono"> git merge</span> (влить). Делайте pull перед
                  началом работы, чтобы получить свежий код от коллег.
                </p>
                <p>
                  <span className="font-mono text-slate-300">git merge feature-branch</span> —
                  вливает другую ветку в текущую. Если обе ветки изменили разные файлы — merge
                  проходит автоматически. Если изменили одну и ту же строку — возникает{' '}
                  <strong className="text-rose-400">merge conflict</strong>.
                </p>
                <p>
                  Pull Request (PR) / Merge Request (MR) — запрос на вливание вашей ветки в main
                  через GitHub/GitLab. Команда ревьюит код, оставляет комментарии, одобряет или
                  просит правки. Только после одобрения — merge. Это качество кода + защита main.
                </p>
              </div>
            ),
          },
          {
            heading: 'Merge conflicts — как читать и разрешать',
            body: (
              <div className="space-y-2">
                <p>
                  Merge conflict возникает, когда две ветки изменяют одну и ту же строку файла.
                  Git не может автоматически определить, какую версию сохранить. Конфликтные
                  блоки помечаются маркерами:
                </p>
                <p>
                  <span className="font-mono text-amber-400">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>{' '}
                  — начало ваших изменений (текущая ветка).{' '}
                  <span className="font-mono text-slate-300">=======</span> — разделитель.{' '}
                  <span className="font-mono text-sky-400">&gt;&gt;&gt;&gt;&gt;&gt;&gt; branch-name</span>{' '}
                  — конец изменений входящей ветки.
                </p>
                <p>
                  Стратегии разрешения: <strong>accept current</strong> (оставить ваши
                  изменения), <strong>accept incoming</strong> (взять версию команды),{' '}
                  <strong>merge manually</strong> (объединить оба варианта руками). После
                  разрешения — удалить маркеры, <span className="font-mono text-slate-300">git add
                  file</span> и <span className="font-mono text-slate-300">git merge --continue</span>.
                </p>
                <p>
                  Совет: чем чаще делаете pull/merge, тем меньше конфликтов. Длинная ветка
                  (неделя без merge) = большие конфликты. Короткие ветки (1-2 дня) = минимальные
                  конфликты. Общайтесь с командой: если два человека правят один файл —
                  координируйте.
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков с Git',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">1. Коммит без сообщения или с непонятным.</strong> "fix" или "asdf" — бесполезно. Пишите что и зачем: "fix: handle null user in auth middleware".</span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">2. Забыли git push.</strong> Коммит без push живёт только локально. Если компьютер сломается — работа потеряна. Push после каждого коммита.</span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">3. Коммит больших файлов.</strong> Бинарники, .env, node_modules — не должны попадать в Git. Используйте .gitignore.</span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">4. Работа в main напрямую.</strong> Коммитьте в feature-ветку, затем PR. Прямые коммиты в main ломают продакшен.</span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">5. Игнорирование конфликтов.</strong> Не оставляйте маркеры &lt;&lt;&lt;&lt;&lt;&lt;&lt; в коде — компиляция упадёт. Всегда разрешайте полностью.</span>
                </p>
              </div>
            ),
          },
        ]}
      />

      {/* ── Практические задачи ─────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Практические задачи — 5 шагов</h3>
        </div>
        <p className="text-[11px] text-slate-600 mb-4">Задачи охватывают JWT (1–2), Git (3), merge conflict (4) и offline-first (5).</p>
        <div className="flex items-center gap-1.5 mb-4">
          {TEAM_TASKS.map((task) => {
            const done = taskResults[task.id - 1];
            return <div key={task.id} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${done ? 'bg-emerald-500' : 'bg-slate-800'}`} style={done ? { boxShadow: '0 0 6px rgba(16,185,129,0.4)' } : undefined} />;
          })}
        </div>
        <div className="space-y-2.5">
          {TEAM_TASKS.map((task) => (
            <TeamTaskCard key={task.id} task={task} jwt={jwt} requestCount={requestCount} resolution={resolution} gitCommandsRun={gitCommandsRun} isOnline={isOnline} unsyncedCount={unsyncedCount} taskSyncedCount={syncedCount} />
          ))}
        </div>
        {allDone && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[12px] text-emerald-300">Все 5 задач выполнены! Вы освоили JWT, Git и командный workflow.</p>
          </div>
        )}
      </div>

      {/* ── Симулятор JWT ───────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Симулятор: Инъекция JWT-токена</h3>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={generateToken} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors active:scale-[0.98]">
            <KeyRound className="w-4 h-4" />Сгенерировать JWT
          </button>
          {jwt && <button onClick={sendRequest} className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-slate-700 transition-colors"><Network className="w-4 h-4" />Send Request</button>}
          {jwt && <button onClick={clearToken} className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 text-slate-500 rounded-lg px-3 py-2 text-[12px] hover:text-rose-400 hover:border-rose-500/30 transition-colors"><Lock className="w-3.5 h-3.5" />Revoke</button>}
        </div>
        {jwt ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Encrypted Storage</span>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-emerald-400"><ShieldCheck className="w-3 h-3" />AES-256</span>
              </div>
              <p className="font-mono text-[11px] text-slate-500 break-all leading-relaxed">
                {jwt.split('.').map((part, i) => (<span key={i} className={i === 0 ? 'text-sky-400' : i === 1 ? 'text-emerald-400' : 'text-amber-400'}>{part}{i < 2 ? '.' : ''}</span>))}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 block">JWT Payload (decoded)</span>
              <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">{decodeJWTPayload(jwt)}</pre>
            </div>
            {requestLog.length > 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800"><Terminal className="w-3.5 h-3.5 text-slate-500" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Network Requests ({requestLog.length})</span></div>
                <div className="px-4 py-3 space-y-2">
                  {requestLog.map((ts, i) => (
                    <pre key={i} className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap animate-fade-in">
                      <span className="text-slate-600">[{ts}]</span>{' '}
                      <span className="text-sky-400">GET</span> /api/v1/users{'\n  '}
                      <span className="text-amber-400">Authorization: Bearer {jwt.slice(0, 20)}...</span>{'\n  '}
                      <span className="text-emerald-400">→ 200 OK</span>
                    </pre>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-lg px-4 py-6 text-center">
            <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-[12px] text-slate-600 font-mono">Нет токена — запросы вернут 401 Unauthorized</p>
          </div>
        )}
      </div>

      {/* ── Git терминал ────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Симулятор: Git терминал</h3>
        </div>
        {/* Кнопки команд */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {GIT_COMMANDS.map((gc) => {
            const isRun = gitCommandsRun.includes(gc.cmd);
            const Icon = gc.cmd.includes('commit') ? GitCommit : gc.cmd.includes('push') ? Upload : gc.cmd.includes('pull') ? Download : gc.cmd.includes('add') ? GitPullRequest : Terminal;
            return (
              <button key={gc.cmd} onClick={() => runGitCommand(gc)} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-mono border transition-colors text-left ${isRun ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 min-w-0 truncate">{gc.cmd}</span>
                {isRun && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
        {/* Вывод терминала */}
        {gitOutput && (
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 overflow-hidden animate-fade-in">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Terminal Output</span>
            </div>
            <pre className="px-4 py-3 text-[11px] font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">{gitOutput}</pre>
          </div>
        )}
      </div>

      {/* ── Merge Conflict Resolver ─────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitMerge className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Редактор: Merge Conflict Resolver</h3>
        </div>
        <div className="rounded-lg border border-slate-800 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2"><FileCode2 className="w-3.5 h-3.5 text-slate-500" /><span className="text-[11px] font-mono text-slate-400">config.ts</span></div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${resolution === 'none' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>{resolution === 'none' ? 'CONFLICT' : 'RESOLVED'}</span>
          </div>
          <div className="px-4 py-3 font-mono text-[13px] leading-relaxed">
            {resolution === 'none' ? (
              <>
                <p className="text-amber-400/70">{'<<<<<<< HEAD (ваши изменения)'}</p>
                <p className="text-amber-300 pl-3 py-1 bg-amber-500/5 rounded">{CONFLICT_MINE}</p>
                <p className="text-slate-600">{'======='}</p>
                <p className="text-sky-300 pl-3 py-1 bg-sky-500/5 rounded">{CONFLICT_TEAM}</p>
                <p className="text-sky-400/70">{'>>>>>>> feature/api-endpoints (команда)'}</p>
              </>
            ) : (
              <p className="text-emerald-300 animate-fade-in pl-3 py-1 bg-emerald-500/5 rounded">{resolvedCode}</p>
            )}
          </div>
        </div>
        {resolution === 'none' ? (
          <div className="flex gap-2">
            <button onClick={() => resolveConflict('mine')} className="flex items-center gap-2 bg-slate-800 border border-amber-500/30 text-amber-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-amber-500/10 transition-colors active:scale-[0.98]"><CheckCircle2 className="w-4 h-4" />Принять мои</button>
            <button onClick={() => resolveConflict('team')} className="flex items-center gap-2 bg-slate-800 border border-sky-500/30 text-sky-200 rounded-lg px-4 py-2.5 text-[13px] font-semibold hover:bg-sky-500/10 transition-colors active:scale-[0.98]"><CheckCircle2 className="w-4 h-4" />Принять команды</button>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><p className="text-emerald-400 font-bold text-[13px]">Конфликт разрешён — код компилируется без ошибок</p></div>
              <p className="text-emerald-400/60 text-[11px] font-mono ml-6">Selected: {resolution === 'mine' ? 'HEAD (your branch)' : 'feature/api-endpoints (team)'} → git add config.ts && git merge --continue</p>
            </div>
            <button onClick={() => setResolution('none')} className="text-[12px] font-mono text-slate-500 hover:text-slate-300 transition-colors">← Сбросить конфликт</button>
          </div>
        )}
      </div>

      {/* ── Offline-first симулятор ─────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Симулятор: Offline-first синхронизация</h3>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-slate-900/40 border border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            {isOnline ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-amber-400" />}
            <div><p className="text-[13px] font-medium text-slate-200">Сеть: {isOnline ? 'Online' : 'Offline'}</p><p className="text-[11px] font-mono text-slate-600">{isOnline ? 'Подключено — изменения синхронизируются' : 'Отключено — изменения в локальном кэше'}</p></div>
          </div>
          <button onClick={toggleNetwork} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isOnline ? 'bg-emerald-600/60' : 'bg-slate-700'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-slate-200 transition-transform duration-200 ${isOnline ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {unsyncedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-amber-500/5 border border-amber-500/20 mb-3 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
            <p className="text-[11px] font-mono text-amber-400">{unsyncedCount} несинхронизированных задач — включите Online для sync</p>
          </div>
        )}
        <div className="flex gap-2 mb-3">
          <input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Новая задача..." disabled={isSyncing} className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-[13px] font-mono text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors disabled:opacity-50" />
          <button onClick={addTask} disabled={!newTaskTitle.trim() || isSyncing} className="bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold disabled:opacity-30 transition-colors">Add</button>
        </div>
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/30"><Database className="w-3.5 h-3.5 text-slate-500" /><span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Локальный кэш ({tasks.length})</span></div>
          <div className="divide-y divide-slate-800">
            {tasks.length === 0 ? (<p className="px-4 py-4 text-[12px] text-slate-700 font-mono text-center">Кэш пуст — добавьте задачу</p>) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 px-4 py-2.5 animate-cell-in hover:bg-slate-900/30 transition-colors group">
                  {task.synced ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-amber-500/40 flex items-center justify-center shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /></span>}
                  <span className="text-[13px] font-mono text-slate-300 flex-1 min-w-0 truncate">{task.title}</span>
                  <span className={`text-[10px] font-mono ${task.synced ? 'text-emerald-400/60' : 'text-amber-400/70'}`}>{task.synced ? 'synced' : 'pending'}</span>
                  <button onClick={() => removeTask(task.id)} className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"><span className="text-[14px]">×</span></button>
                </div>
              ))
            )}
          </div>
        </div>
        {(isSyncing || syncLog.length > 0) && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">{isSyncing ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}<span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sync Log</span></div>
            <div className="px-4 py-3 space-y-1">
              {isSyncing && <p className="text-[11px] font-mono text-amber-400 animate-pulse-soft">[SYNC] Отправка данных на SQL-сервер...</p>}
              {syncLog.map((entry, i) => (<p key={i} className={`text-[11px] font-mono animate-fade-in ${entry.includes('успешно') ? 'text-emerald-400' : 'text-slate-500'}`}>{entry}</p>))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
