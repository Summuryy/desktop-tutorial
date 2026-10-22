import { useState, useEffect, useMemo, useRef } from 'react';
import {
  GitBranch,
  ShieldCheck,
  ShieldX,
  Lock,
  User,
  UserCog,
  Eye,
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
import { useGame } from '@/context/GameContext';
import type { UserRole, AuthResult } from '@/types';

// ============================================================
// Модуль 02: Условные операторы и булева логика
// Расширенная теория control flow, 5 практических задач,
// интерактивный симулятор авторизации.
// ============================================================

// ── Валидация доступа ───────────────────────────────────────

function validateAccess(authenticated: boolean, role: UserRole): AuthResult {
  if (!authenticated) {
    return {
      status: 'unauthorized',
      httpCode: 401,
      message: 'Токен авторизации отсутствует или истёк',
      redirect: '/login',
    };
  }
  switch (role) {
    case 'admin':
      return {
        status: 'granted',
        httpCode: 200,
        message: 'Администратор — полный доступ к ресурсам',
        redirect: '/admin/dashboard',
      };
    case 'user':
      return {
        status: 'granted',
        httpCode: 200,
        message: 'Пользователь — ограниченный доступ',
        redirect: '/dashboard',
      };
    case 'guest':
      return {
        status: 'forbidden',
        httpCode: 403,
        message: 'Гостю запрещён доступ к этому ресурсу',
        redirect: '/403',
      };
    default:
      return {
        status: 'forbidden',
        httpCode: 403,
        message: 'Роль не распознана — доступ запрещён',
        redirect: '/403',
      };
  }
}

const ROLE_ICONS: Record<UserRole, typeof User> = {
  guest: Eye,
  user: User,
  admin: UserCog,
};

// ── Практические задачи ─────────────────────────────────────

interface CFTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  // Параметры, которые нужно выставить в симуляторе
  target: { authenticated: boolean; role: UserRole };
  validate: (authenticated: boolean, role: UserRole) => { ok: boolean; message: string };
}

const CF_TASKS: CFTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Получить 401 — неавторизованный запрос',
    description:
      'Выключите тумблер Is Authenticated (false). Это симулирует запрос без токена. ' +
      'Убедитесь, что сервер возвращает 401 Unauthorized — именно так работает if (!authenticated).',
    hint: 'Оставьте тумблер в положении false (выключен). Роль не имеет значения.',
    target: { authenticated: false, role: 'guest' },
    validate: (auth) =>
      !auth
        ? { ok: true, message: 'Верно! Без токена сервер возвращает 401 — если токена нет, доступ закрыт.' }
        : { ok: false, message: 'Выключите тумблер Is Authenticated.' },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Получить 200 как обычный пользователь',
    description:
      'Включите тумблер Is Authenticated и выберите роль user. Сервер проверит: ' +
      'if (authenticated) → switch(role) → case "user" → 200 OK. Это базовая авторизация.',
    hint: 'Включите тумблер, выберите роль user.',
    target: { authenticated: true, role: 'user' },
    validate: (auth, role) =>
      auth && role === 'user'
        ? { ok: true, message: 'Отлично! Авторизованный пользователь получает 200 OK.' }
        : { ok: false, message: 'Нужно: authenticated=true, role=user.' },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Получить 200 как администратор',
    description:
      'Включите аутентификацию и выберите роль admin. Та же ветка switch, но case "admin" ' +
      'ведёт на /admin/dashboard — это показывает, как switch-case направляет по разным маршрутам.',
    hint: 'Включите тумблер, выберите роль admin.',
    target: { authenticated: true, role: 'admin' },
    validate: (auth, role) =>
      auth && role === 'admin'
        ? { ok: true, message: 'Превосходно! Админ получает 200 OK и доступ к /admin/dashboard.' }
        : { ok: false, message: 'Нужно: authenticated=true, role=admin.' },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Получить 403 — аутентифицирован, но недостаточно прав',
    description:
      'Включите аутентификацию, но выберите роль guest. Сервер проверит токен (true), ' +
      'но switch(role) → case "guest" → 403 Forbidden. Это показывает разницу между 401 и 403.',
    hint: 'Включите тумблер, выберите роль guest.',
    target: { authenticated: true, role: 'guest' },
    validate: (auth, role) =>
      auth && role === 'guest'
        ? { ok: true, message: 'Верно! Токен есть, но роль guest → 403 Forbidden. Разница: 401 = нет токена, 403 = токен есть, но прав мало.' }
        : { ok: false, message: 'Нужно: authenticated=true, role=guest.' },
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Пройти все 4 ветки control flow',
    description:
      'Поочерёдно получите все 4 результата: 401 (без токена), 200 user, 200 admin, 403 guest. ' +
      'Это показывает полную карту ветвления: if → switch → 4 разных исхода. ' +
      'Переключайте тумблер и роли, чтобы пройти каждую ветку.',
    hint: 'Получите по очереди: 401 → 200 user → 200 admin → 403 guest. Прогресс отслеживается автоматически.',
    target: { authenticated: false, role: 'guest' },
    validate: () =>
      ({ ok: false, message: 'Получите все 4 результата по очереди. Прогресс отслеживается ниже.' }),
  },
];

// ── Компонент задачи ────────────────────────────────────────

function CFTaskCard({
  task,
  auth,
  role,
  visitedStatuses,
  onApplyTarget,
}: {
  task: CFTask;
  auth: boolean;
  role: UserRole;
  visitedStatuses: Set<string>;
  onApplyTarget: (task: CFTask) => void;
}) {
  const result = useMemo(() => {
    if (task.id === 5) {
      const needed = ['unauthorized', 'granted_user', 'granted_admin', 'forbidden'];
      const done = needed.filter((s) => visitedStatuses.has(s)).length;
      return {
        ok: done === 4,
        message:
          done === 4
            ? 'Все 4 ветки пройдены! Полная карта control flow освоена.'
            : `Пройдено ${done} из 4 веток: ${needed.filter((s) => visitedStatuses.has(s)).join(', ') || 'пока ни одной'}`,
      };
    }
    return task.validate(auth, role);
  }, [task, auth, role, visitedStatuses]);

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

      {!result.ok && task.id !== 5 && (
        <div className="pl-10 mt-2">
          <button
            onClick={() => onApplyTarget(task)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
            Настроить симулятор
          </button>
        </div>
      )}
    </div>
  );
}

// ── Основной компонент ──────────────────────────────────────

export default function ControlFlowModule() {
  const { unlockAchievement, isAchievementUnlocked, addXp } = useGame();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');
  const [visitedStatuses, setVisitedStatuses] = useState<Set<string>>(new Set());
  const prevVisitedRef = useRef<Set<string>>(new Set());

  const result = validateAccess(isAuthenticated, role);

  // Достижение при получении 200 OK
  useEffect(() => {
    if (result.status === 'granted' && !isAchievementUnlocked('access-granted')) {
      unlockAchievement('access-granted');
    }
  }, [result.status, isAchievementUnlocked, unlockAchievement]);

  // Отслеживание посещённых веток control flow
  useEffect(() => {
    const statusKey =
      result.status === 'unauthorized'
        ? 'unauthorized'
        : result.status === 'granted' && role === 'admin'
          ? 'granted_admin'
          : result.status === 'granted' && role === 'user'
            ? 'granted_user'
            : result.status === 'forbidden'
              ? 'forbidden'
              : '';
    if (statusKey) {
      setVisitedStatuses((prev) => {
        if (prev.has(statusKey)) return prev;
        const next = new Set(prev);
        next.add(statusKey);
        return next;
      });
    }
  }, [result.status, role]);

  // XP за новые ветки
  useEffect(() => {
    const diff = visitedStatuses.size - prevVisitedRef.current.size;
    if (diff > 0) {
      addXp(diff * 10, 'Изучена новая ветка control flow');
    }
    prevVisitedRef.current = visitedStatuses;
  }, [visitedStatuses, addXp]);

  const applyTarget = (task: CFTask) => {
    setIsAuthenticated(task.target.authenticated);
    setRole(task.target.role);
  };

  const statusStyles: Record<AuthResult['status'], string> = {
    granted: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    forbidden: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
    unauthorized: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  };

  const taskResults = CF_TASKS.map((task) => {
    if (task.id === 5) {
      const needed = ['unauthorized', 'granted_user', 'granted_admin', 'forbidden'];
      const done = needed.filter((s) => visitedStatuses.has(s)).length;
      return done === 4;
    }
    return task.validate(isAuthenticated, role).ok;
  });
  const completedCount = taskResults.filter(Boolean).length;
  const allDone = completedCount === CF_TASKS.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Условные операторы и булева логика</h2>
          <p className="text-[12px] text-slate-500 font-mono">
            if · else if · else · switch-case · && · || · !
          </p>
        </div>
      </div>

      {/* ── Расширенная теория ──────────────────────────────── */}
      <TechDoc
        title="Техническая документация — Полный курс"
        sections={[
          {
            heading: 'Что такое Control Flow — поток выполнения программы',
            body: (
              <div className="space-y-2">
                <p>
                  Control Flow (поток управления) — это порядок, в котором компьютер выполняет
                  инструкции в вашем коде. По умолчанию программа выполняется сверху вниз,
                  строка за строкой. Но реальные приложения почти никогда не бывают линейными:
                  нужно проверять условия, повторять действия, выбирать ветки выполнения.
                  Именно для этого существуют операторы ветвления и циклы.
                </p>
                <p>
                  Представьте турникет в метро: если у вас есть действующая карта — проход
                  открыт, если нет — закрыт. Это и есть <span className="font-mono text-slate-300">if</span>:
                  одно условие, два исхода. Теперь представьте лифт с кнопками этажей:
                  нажатие different кнопки отправляет лифт на different этаж. Это{' '}
                  <span className="font-mono text-slate-300">switch-case</span>: одно значение
                  (номер этажа), много веток.
                </p>
                <p>
                  В мобильных приложениях control flow используется на каждом шагу: показывать
                  ли экран входа или главный экран (if/else), какой таб открыть (switch),
                  можно ли показать кнопку «Оплатить» (&&). Без ветвления приложение было бы
                  одной статичной страницей, которая ведёт себя одинаково для всех.
                </p>
              </div>
            ),
          },
          {
            heading: 'Оператор if / else if / else — детальный разбор',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">if</span> проверяет булево условие
                  (выражение, которое равно <span className="font-mono text-emerald-400">true</span>{' '}
                  или <span className="font-mono text-rose-400">false</span>). При{' '}
                  <span className="font-mono text-emerald-400">true</span> выполняется блок кода
                  в фигурных скобках. При <span className="font-mono text-rose-400">false</span>{' '}
                  блок пропускается.
                </p>
                <p>
                  <span className="font-mono text-slate-300">else if</span> — цепочка
                  дополнительных проверок. Они вычисляются по порядку: как только одно условие
                  окажется true, выполняется его блок, а остальные пропускаются. Это эффективнее,
                  чем несколько независимых if, потому что компьютер не тратит время на
                  ненужные проверки.
                </p>
                <p>
                  <span className="font-mono text-slate-300">else</span> — блок по умолчанию
                  (fallback). Выполняется только если все условия выше оказались false.
                  else не обязательно, но хорошая практика — всегда его добавлять, чтобы
                  обработать неожиданные ситуации.
                </p>
                <p>
                  Пример из реального приложения: проверка возраста пользователя при регистрации.
                  Если возраст меньше 13 — показать ошибку. Иначе если 13–17 — нужен родительский
                  доступ. Иначе (18+) — полная регистрация. Три ветки, три разных экрана.
                </p>
              </div>
            ),
          },
          {
            heading: 'switch-case — табличный dispatch',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-slate-300">switch</span> принимает одно
                  значение и сравнивает его с набором{' '}
                  <span className="font-mono text-slate-300">case</span>-веток. Найдя совпадение,
                  выполняет код этой ветки. <span className="font-mono text-slate-300">default</span>{' '}
                  — fallback, если ни один case не совпал.
                </p>
                <p>
                  switch эффективнее цепочки if/else if, когда вы сравниваете одну переменную
                  с многими конкретными значениями (например, роль пользователя: admin, user,
                  guest, moderator). Компилятор может оптимизировать switch в таблицу переходов
                  (jump table) — O(1) вместо O(n) у цепочки if.
                </p>
                <p>
                  В Swift switch обязан быть исчерпывающим (exhaustive): все возможные значения
                  должны быть покрыты case-ветками или default. Это защищает от пропуска новых
                  случаев при добавлении значений в enum. В TypeScript такой проверки нет, но
                  хорошая практика — всегда писать default.
                </p>
                <p>
                  Важно: в C/JS/TS после case нужно писать{' '}
                  <span className="font-mono text-slate-300">break</span>, иначе выполнение
                  «провалится» в следующую ветку (fall-through). В Swift break не нужен —
                  компилятор автоматически останавливает выполнение после ветки.
                </p>
              </div>
            ),
          },
          {
            heading: 'Логические операторы &&, ||, ! — булева алгебра',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-sky-400">&&</span> (AND, логическое И) —
                  возвращает true только если оба операнда true. «И пользователь авторизован,
                  И у него есть права админа». Используется когда нужно, чтобы совпали все
                  условия одновременно.
                </p>
                <p>
                  <span className="font-mono text-emerald-400">||</span> (OR, логическое ИЛИ) —
                  возвращает true если хотя бы один операнд true. «ИЛИ есть токен, ИЛИ есть
                  сессия». Используется когда достаточно одного из условий.
                </p>
                <p>
                  <span className="font-mono text-pink-400">!</span> (NOT, логическое НЕ) —
                  инвертирует булево значение. true становится false и наоборот.{' '}
                  <span className="font-mono text-slate-300">!isAuthenticated</span> означает
                  «пользователь НЕ авторизован».
                </p>
                <p>
                  <strong className="text-slate-300">Short-circuit evaluation</strong> —
                  ключевая оптимизация. <span className="font-mono">&&</span> прекращает
                  проверку при первом false (второй операнд не вычисляется — он уже не
                  изменит результат). <span className="font-mono">||</span> прекращает при
                  первом true. Это не только быстро, но и безопасно:{' '}
                  <span className="font-mono text-slate-300">user != null && user.isActive</span> —
                  если user равен null, проверка user.isActive не выполнится и не вызовет
                  crash.
                </p>
                <p>
                  Можно комбинировать: <span className="font-mono text-slate-300">
                  if (isAdmin || isModerator) && !isBanned</span> — пускаем админов и
                  модераторов, но не забаненных. Скобки задают приоритет, как в математике.
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков в условиях',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">1. = вместо == или ===.</strong>{' '}
                    <span className="font-mono text-slate-300">if (x = 5)</span> — это присваивание,
                    не сравнение! В JS оно всегда true (5 → truthy). Правильно:{' '}
                    <span className="font-mono text-slate-300">if (x === 5)</span>. В Swift
                    эта ошибка невозможна — компилятор её ловит.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">2. == vs ===.</strong> В JS{' '}
                    <span className="font-mono">==</span> приводит типы (5 == "5" → true), а{' '}
                    <span className="font-mono">===</span> проверяет строго (5 === "5" → false).
                    Всегда используйте === в TypeScript/JS.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">3. Забытый break в switch (JS/TS).</strong>{' '}
                    Без break выполнение «проваливается» в следующий case. Это частая причина
                    неожиданного поведения. В Swift этой проблемы нет.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">4. Слишком сложные условия в одной строке.</strong>{' '}
                    <span className="font-mono text-slate-300">if (a && b || c && !d || e)</span> —
                    трудно читать и легко ошибиться. Разбейте на промежуточные переменные с
                    понятными именами: <span className="font-mono">const hasAccess = a && b</span>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">5. Проверка на пустоту через ==.</strong>{' '}
                    <span className="font-mono">if (str == "")</span> работает, но{' '}
                    <span className="font-mono">if (str.length === 0)</span> или{' '}
                    <span className="font-mono">if (!str)</span> — надёжнее. Аналог в Swift:{' '}
                    <span className="font-mono">if str.isEmpty</span>.
                  </span>
                </p>
              </div>
            ),
          },
          {
            heading: 'Control flow в архитектуре клиент-сервер',
            body: (
              <div className="space-y-2">
                <p>
                  В клиент-серверной архитектуре control flow используется в middleware-слое
                  для валидации токенов и проверки ролей. Результат ветвления определяет
                  HTTP-статус ответа: <span className="font-mono text-emerald-400">200 OK</span>{' '}
                  (доступ разрешён), <span className="font-mono text-amber-400">401 Unauthorized</span>{' '}
                  (токен отсутствует или истёк), <span className="font-mono text-rose-400">
                  403 Forbidden</span> (роль недостаточна).
                </p>
                <p>
                  На клиенте control flow определяет, какой экран рендерится: redirect to
                  /login (нет токена), /dashboard (обычный пользователь), /admin (админ),
                  /403 (доступ запрещён). Каждый экран — отдельная ветка if/switch в
                  роутере приложения.
                </p>
                <p>
                  В мобильных приложениях (iOS/Swift) аналогичная логика: AppDelegate проверяет
                  состояние авторизации при запуске и решает — показать LoginViewController
                  или MainTabBarController. Это первая if-проверка, которую встречает
                  каждый пользователь.
                </p>
              </div>
            ),
          },
        ]}
      />

      {/* ── Практические задачи (постранично) ───────────────── */}
      <PaginatedTasks
        title="Практические задачи — 5 шагов"
        intro="Управляйте симулятором ниже — включайте аутентификацию и выбирайте роли, чтобы пройти все ветки control flow."
        tasks={CF_TASKS.map((task) => ({
          id: task.id,
          title: task.title,
          content: (
            <CFTaskCard
              task={task}
              auth={isAuthenticated}
              role={role}
              visitedStatuses={visitedStatuses}
              onApplyTarget={applyTarget}
            />
          ),
        }))}
        progressBars={taskResults}
        allDone={allDone}
        doneMessage="Все 5 задач выполнены! Вы освоили условные операторы и булеву логику."
      />

      {/* ── Панель управления — симулятор ───────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Симулятор авторизации
        </h3>

        {/* Тумблер Is Authenticated */}
        <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-slate-900/40 border border-slate-800 mb-3">
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            ) : (
              <ShieldX className="w-4.5 h-4.5 text-rose-400" />
            )}
            <div>
              <p className="text-[13px] font-medium text-slate-200">Is Authenticated</p>
              <p className="text-[11px] text-slate-600 font-mono">
                token.present == {String(isAuthenticated)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(!isAuthenticated)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isAuthenticated ? 'bg-emerald-600/60' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-slate-200 transition-transform duration-200 ${
                isAuthenticated ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Селектор роли */}
        <div className="rounded-lg px-4 py-3 bg-slate-900/40 border border-slate-800">
          <p className="text-[13px] font-medium text-slate-200 mb-3">Роль пользователя</p>
          <div className="flex gap-2">
            {(['guest', 'user', 'admin'] as UserRole[]).map((r) => {
              const Icon = ROLE_ICONS[r];
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-colors ${
                    role === r
                      ? 'bg-slate-800 border-slate-600 text-slate-200'
                      : 'bg-slate-900/30 border-slate-800 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-mono">{r}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Результат валидации ─────────────────────────────── */}
      <div
        className={`rounded-xl border p-5 transition-colors duration-300 ${statusStyles[result.status]}`}
      >
        <div className="flex items-center gap-2 mb-3">
          {result.status === 'granted' ? (
            <ShieldCheck className="w-5 h-5" />
          ) : result.status === 'forbidden' ? (
            <Lock className="w-5 h-5" />
          ) : (
            <ShieldX className="w-5 h-5" />
          )}
          <h3 className="text-sm font-bold">
            {result.status === 'granted'
              ? 'Доступ разрешён'
              : result.status === 'forbidden'
                ? '403 Forbidden'
                : '401 Unauthorized'}
          </h3>
          <span className="ml-auto font-mono text-[13px] font-bold">{result.httpCode}</span>
        </div>

        <p className="text-[12px] text-slate-400 mb-4">{result.message}</p>

        <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3 mb-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-1">
            Маршрут (Redirect)
          </p>
          <p className="font-mono text-[13px] text-slate-300">{result.redirect}</p>
        </div>

        <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
            Структура ветвления
          </p>
          <pre className="text-[11px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
{`if (!isAuthenticated) {
  → 401 redirect("/login")
} else {
  switch (role) {
    case "admin":  → 200 redirect("/admin/dashboard")
    case "user":   → 200 redirect("/dashboard")
    case "guest":  → 403 redirect("/403")
  }
}`}
          </pre>
        </div>
      </div>

      {/* ── Таблица истинности ──────────────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Таблица истинности — Логические операторы
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="text-left py-2 pr-4 font-normal">A</th>
                <th className="text-left py-2 pr-4 font-normal">B</th>
                <th className="text-left py-2 pr-4 font-normal text-sky-400">A && B</th>
                <th className="text-left py-2 pr-4 font-normal text-emerald-400">A || B</th>
                <th className="text-left py-2 font-normal text-pink-400">!A</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              {[
                [true, true, true, true, false],
                [true, false, false, true, false],
                [false, true, false, true, true],
                [false, false, false, false, true],
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-900/50">
                  <td className="py-2 pr-4">{String(row[0])}</td>
                  <td className="py-2 pr-4">{String(row[1])}</td>
                  <td className="py-2 pr-4 text-sky-400/80">{String(row[2])}</td>
                  <td className="py-2 pr-4 text-emerald-400/80">{String(row[3])}</td>
                  <td className="py-2 text-pink-400/80">{String(row[4])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
