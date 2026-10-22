import { useState } from 'react';
import { GitBranch, ShieldCheck, ShieldX, Lock, User, UserCog, Eye } from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import type { UserRole, AuthResult } from '@/types';

// ============================================================
// Модуль 02: Conditional Statements & Control Flow
// Симуляция валидации токена авторизации.
// Тумблеры Is Authenticated и User Role изменяют ветвление
// control flow → рендерят разные "экраны" (guest / user / admin).
// ============================================================

// Валидация доступа на основе состояния аутентификации и роли.
// Имитирует middleware-проверку токена на сервере.
function validateAccess(authenticated: boolean, role: UserRole): AuthResult {
  // Ветвление 1: if not authenticated → 401 Unauthorized
  if (!authenticated) {
    return {
      status: 'unauthorized',
      httpCode: 401,
      message: 'Authentication token missing or expired',
      redirect: '/login',
    };
  }

  // Ветвление 2: switch по ролям — определяет уровень доступа
  switch (role) {
    case 'admin':
      return {
        status: 'granted',
        httpCode: 200,
        message: 'Admin access granted — full resource control',
        redirect: '/admin/dashboard',
      };
    case 'user':
      return {
        status: 'granted',
        httpCode: 200,
        message: 'User access granted — limited resource scope',
        redirect: '/dashboard',
      };
    case 'guest':
      // Гость аутентифицирован, но не имеет прав на ресурс → 403
      return {
        status: 'forbidden',
        httpCode: 403,
        message: 'Forbidden — insufficient permissions for this resource',
        redirect: '/403',
      };
    default:
      return {
        status: 'forbidden',
        httpCode: 403,
        message: 'Forbidden — role not recognized',
        redirect: '/403',
      };
  }
}

// Конфигурация иконок ролей
const ROLE_ICONS: Record<UserRole, typeof User> = {
  guest: Eye,
  user: User,
  admin: UserCog,
};

export default function ControlFlowModule() {
  // Состояние аутентификации (тумблер)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Текущая роль пользователя
  const [role, setRole] = useState<UserRole>('guest');

  // Результат валидации (вычисляется на каждом рендере — derived state)
  const result = validateAccess(isAuthenticated, role);

  // Цветовые схемы для статусов HTTP
  const statusStyles: Record<AuthResult['status'], string> = {
    granted: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    forbidden: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
    unauthorized: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <GitBranch className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Conditional Statements & Control Flow</h2>
          <p className="text-[12px] text-slate-500 font-mono">if · else if · else · switch-case · && · || · !</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation"
        sections={[
          {
            heading: 'Операторы ветвления',
            body: (
              <p>
                <span className="font-mono text-slate-300">if</span> проверяет булево условие;
                при <span className="font-mono text-emerald-400">true</span> выполняется блок
                кода в фигурных скобках. <span className="font-mono text-slate-300">else if</span> —
                цепочка дополнительных проверок. <span className="font-mono text-slate-300">else</span> —
                fallback-блок, выполняется если все условия выше —
                <span className="font-mono text-rose-400"> false</span>.
                <span className="font-mono text-slate-300"> switch-case</span> — табличный
                dispatch: сравнивает значение с набором case-веток, default — fallback.
              </p>
            ),
          },
          {
            heading: 'Логические операторы',
            body: (
              <p>
                <span className="font-mono text-slate-300">&&</span> (AND) — true, только если
                оба операнда true. <span className="font-mono text-slate-300">||</span> (OR) —
                true, если хотя бы один true. <span className="font-mono text-slate-300">!</span> (NOT) —
                инвертирует булево значение. Операторы поддерживают short-circuit evaluation:
                <span className="font-mono"> &&</span> прекращает проверку при первом
                <span className="font-mono text-rose-400"> false</span>,
                <span className="font-mono"> ||</span> — при первом
                <span className="font-mono text-emerald-400"> true</span>.
              </p>
            ),
          },
          {
            heading: 'Control flow в архитектуре',
            body: (
              <p>
                В клиент-серверной архитектуре control flow используется в middleware-слое
                для валидации токенов и проверки ролей. Результат ветвления определяет HTTP-статус
                ответа: 200 OK (доступ разрешён), 401 Unauthorized (токен отсутствует),
                403 Forbidden (роль недостаточна). На клиенте — определяет, какой экран
                рендерится (redirect to /login, /dashboard, /admin).
              </p>
            ),
          },
        ]}
      />

      {/* Панель управления — тумблеры */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Auth State Configuration
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
          <p className="text-[13px] font-medium text-slate-200 mb-3">User Role</p>
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

      {/* Результат валидации — симуляция control flow routing */}
      <div className={`rounded-xl border p-5 transition-colors duration-300 ${statusStyles[result.status]}`}>
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
              ? 'Access Granted'
              : result.status === 'forbidden'
                ? '403 Forbidden'
                : '401 Unauthorized'}
          </h3>
          <span className="ml-auto font-mono text-[13px] font-bold">
            {result.httpCode}
          </span>
        </div>

        <p className="text-[12px] text-slate-400 mb-4">{result.message}</p>

        {/* Визуализация "экрана" для рендеринга */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3 mb-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-1">
            Routed Screen
          </p>
          <p className="font-mono text-[13px] text-slate-300">{result.redirect}</p>
        </div>

        {/* Псевдокод: структура ветвления */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
            Control Flow
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

      {/* Таблица истинности логических операторов */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Truth Table — Logical Operators
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
