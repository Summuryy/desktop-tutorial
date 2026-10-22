import { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Network,
  Server,
  Database,
  Play,
  RotateCcw,
  Lock,
  ArrowRight,
  CheckCircle2,
  Zap,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import { useGame, XP_REWARDS } from '@/context/GameContext';
import TechDoc from '@/components/TechDoc';

// ============================================================
// Модуль: Architecture Visualizer — интерактивная карта данных
// 4 блока: [UI] <-> [Сетевой слой] <-> [Бэкенд] <-> [SQL]
// Анимация импульсов между блоками при симуляции запроса
// ============================================================

type Phase = 'idle' | 'ui-to-net' | 'net-to-server' | 'server-to-db' | 'db-to-server' | 'server-to-net' | 'net-to-ui' | 'done';

interface BlockInfo {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const BLOCKS: BlockInfo[] = [
  {
    id: 'ui',
    label: 'Мобильный UI',
    icon: Smartphone,
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'net',
    label: 'Сетевой слой / Токены',
    icon: Network,
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 'server',
    label: 'Бэкенд-сервер',
    icon: Server,
    color: 'text-violet-300',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/40',
  },
  {
    id: 'db',
    label: 'База данных SQL',
    icon: Database,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
  },
];

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Ожидание запроса',
  'ui-to-net': 'UI отправляет запрос в сетевой слой',
  'net-to-server': 'Сетевой слой добавляет Bearer-токен и шифрует запрос',
  'server-to-db': 'Сервер формирует SQL-запрос к базе данных',
  'db-to-server': 'База данных возвращает результат выборки',
  'server-to-net': 'Сервер сериализует данные в JSON и отправляет обратно',
  'net-to-ui': 'Сетевой слой расшифровывает ответ и передаёт в UI',
  done: 'Запрос успешно завершён!',
};

const PHASE_DETAILS: Record<Phase, string> = {
  idle: 'Нажмите "Запустить симуляцию" чтобы увидеть, как данные проходят через все слои архитектуры.',
  'ui-to-net': 'Пользователь нажимает кнопку "Обновить" в интерфейсе. UI формирует запрос: GET /api/v1/users',
  'net-to-server': 'Сетевой слой добавляет заголовок Authorization: Bearer <JWT> и шифрует тело запроса через TLS/SSL.',
  'server-to-db': 'Бэкенд проверяет токен, извлекает user_id из JWT payload и формирует SQL: SELECT * FROM users WHERE id = $1',
  'db-to-server': 'PostgreSQL выполняет запрос за 2.4ms. Возвращены 3 строки: id, username, email, role, created_at',
  'server-to-net': 'Сервер конвертирует SQL-rows в JSON: { status: 200, data: [...3 rows...] }. Отправляет HTTP 200 OK.',
  'net-to-ui': 'Сетевой слой проверяет Content-Type, парсит JSON, передаёт готовый объект в React-state обновления UI.',
  done: 'UI перерисовывается с новыми данными. Полный цикл: UI → Сеть → Сервер → БД → Сервер → Сеть → UI.',
};

const FLOW_SEQUENCE: Phase[] = [
  'ui-to-net',
  'net-to-server',
  'server-to-db',
  'db-to-server',
  'server-to-net',
  'net-to-ui',
];

export default function ArchitectureModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  const [phase, setPhase] = useState<Phase>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(-1);
  const [pulseDirection, setPulseDirection] = useState<'forward' | 'backward'>('forward');
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLog([]);
    setPhase('ui-to-net');
    setPulseDirection('forward');
    setActiveBlockIndex(0);

    const stepDuration = 1200;
    const newLog: string[] = [];

    FLOW_SEQUENCE.forEach((p, i) => {
      const timer = setTimeout(() => {
        setPhase(p);
        setActiveBlockIndex(i < 3 ? i : 5 - i);
        setPulseDirection(i < 3 ? 'forward' : 'backward');
        newLog.push(`[${new Date().toLocaleTimeString('en-GB')}] ${PHASE_LABELS[p]}`);
        setLog([...newLog]);

        if (i === FLOW_SEQUENCE.length - 1) {
          const finalTimer = setTimeout(() => {
            setPhase('done');
            setIsRunning(false);
            newLog.push(`[${new Date().toLocaleTimeString('en-GB')}] ✓ Запрос завершён за 385ms`);
            setLog([...newLog]);

            // Начисление XP
            addXp(XP_REWARDS.ARCHITECTURE_SIMULATION, 'Симуляция архитектуры');
            if (!isAchievementUnlocked('architect-eye')) {
              unlockAchievement('architect-eye');
            }
          }, stepDuration);
          timersRef.current.push(finalTimer);
        }
      }, i * stepDuration);
      timersRef.current.push(timer);
    });
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase('idle');
    setIsRunning(false);
    setLog([]);
    setActiveBlockIndex(-1);
  };

  // Определение активной линии (между какими блоками идёт импульс)
  const getActiveLine = (): { from: number; to: number } | null => {
    if (phase === 'idle' || phase === 'done') return null;
    switch (phase) {
      case 'ui-to-net': return { from: 0, to: 1 };
      case 'net-to-server': return { from: 1, to: 2 };
      case 'server-to-db': return { from: 2, to: 3 };
      case 'db-to-server': return { from: 3, to: 2 };
      case 'server-to-net': return { from: 2, to: 1 };
      case 'net-to-ui': return { from: 1, to: 0 };
      default: return null;
    }
  };

  const activeLine = getActiveLine();

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-cyan-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Architecture Visualizer</h2>
          <p className="text-[12px] text-slate-500 font-mono">Под капоном: путь данных через слои приложения</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation — Архитектура клиент-серверного запроса"
        sections={[
          {
            heading: 'Слои архитектуры',
            body: (
              <p>
                Современное приложение состоит из четырёх ключевых слоёв:
                <span className="font-mono text-cyan-400"> UI</span> (пользовательский интерфейс),
                <span className="font-mono text-blue-400"> Network Layer</span> (сетевой слой с токенами),
                <span className="font-mono text-violet-400"> Backend</span> (серверная логика) и
                <span className="font-mono text-emerald-400"> Database</span> (SQL-хранилище).
                Каждый слой имеет свою зону ответственности: UI — отображение, сеть — транспорт и безопасность,
                сервер — бизнес-логика, БД — персистентность данных.
              </p>
            ),
          },
          {
            heading: 'Безопасность на transport-уровне',
            body: (
              <p>
                Сетевой слой добавляет
                <span className="font-mono text-slate-300"> Authorization: Bearer &lt;JWT&gt;</span> к каждому
                запросу и использует
                <span className="font-mono text-slate-300"> TLS/SSL</span> для шифрования.
                Сервер валидирует подпись JWT, извлекает
                <span className="font-mono text-slate-300"> user_id</span> из payload и использует
                parameterized queries для защиты от SQL-инъекций.
              </p>
            ),
          },
          {
            heading: 'Сериализация данных',
            body: (
              <p>
                База данных возвращает строки в табличном формате. Сервер конвертирует их в
                <span className="font-mono text-slate-300"> JSON</span> — текстовый формат обмена данными.
                Сетевой слой парсит JSON в JavaScript-объекты, которые UI рендерит через React.
                Преобразование: SQL rows → JSON string → JS object → React state → DOM.
              </p>
            ),
          },
        ]}
      />

      {/* Карта архитектуры — 4 блока с линиями */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Схема: Путь данных
          </h3>
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 text-[13px] font-semibold disabled:opacity-50 transition-colors active:scale-[0.98]"
              style={{ boxShadow: isRunning ? 'none' : '0 0 10px rgba(34,211,238,0.3)' }}
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Симуляция...' : 'Запустить симуляцию'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg px-3 py-2 text-[12px] hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </button>
          </div>
        </div>

        {/* Блоки и линии */}
        <div className="flex items-center justify-between gap-2 lg:gap-4 mb-6 overflow-x-auto pb-2">
          {BLOCKS.map((block, i) => {
            const Icon = block.icon;
            const isActive = activeLine?.from === i || activeLine?.to === i;
            return (
              <div key={block.id} className="flex items-center shrink-0">
                {/* Блок */}
                <div
                  className={`relative w-28 lg:w-36 rounded-xl border p-3 lg:p-4 transition-all duration-500 ${
                    isActive
                      ? `${block.borderColor} ${block.bgColor} scale-105`
                      : 'border-slate-800 bg-slate-900/20'
                  }`}
                  style={isActive ? { boxShadow: '0 0 16px rgba(34,211,238,0.15)' } : {}}
                >
                  {/* Номер блока */}
                  <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">
                    {i + 1}
                  </span>
                  <div className="flex flex-col items-center text-center gap-2">
                    <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${isActive ? block.color : 'text-slate-600'} transition-colors`} />
                    <span className={`text-[10px] lg:text-[11px] font-semibold leading-tight ${
                      isActive ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {block.label}
                    </span>
                  </div>
                  {/* Индикатор активности */}
                  {isActive && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse-soft"
                      style={{ boxShadow: '0 0 8px rgba(34,211,238,0.6)' }}
                    />
                  )}
                </div>

                {/* Линия между блоками */}
                {i < BLOCKS.length - 1 && (
                  <div className="relative w-8 lg:w-14 h-0.5 mx-1 lg:mx-2 shrink-0">
                    {/* Базовая линия */}
                    <div className="absolute inset-0 bg-slate-800 rounded-full" />
                    {/* Активная линия с импульсом */}
                    {activeLine && (
                      ((activeLine.from === i && activeLine.to === i + 1) ||
                       (activeLine.from === i + 1 && activeLine.to === i)) && (
                        <>
                          <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-opacity`}
                            style={{ boxShadow: '0 0 6px rgba(34,211,238,0.5)' }}
                          />
                          {/* Бегущий импульс */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-300"
                            style={{
                              animation: 'pulse-travel 1.2s linear infinite',
                              boxShadow: '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)',
                              animationDirection: activeLine.from > activeLine.to ? 'reverse' : 'normal',
                            }}
                          />
                          {/* Стрелка направления */}
                          <ArrowRight
                            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-300 ${
                              activeLine.from > activeLine.to ? 'rotate-180 -left-1' : '-right-1'
                            }`}
                          />
                        </>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Статус текущей фазы */}
        <div className={`rounded-lg border p-4 transition-all duration-300 ${
          phase === 'done'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : isRunning
              ? 'border-cyan-500/30 bg-cyan-500/5'
              : 'border-slate-800 bg-slate-900/20'
        }`}>
          <div className="flex items-start gap-3">
            {phase === 'done' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : isRunning ? (
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-[13px] font-bold mb-1 ${
                phase === 'done' ? 'text-emerald-300' : isRunning ? 'text-cyan-300' : 'text-slate-400'
              }`}>
                {PHASE_LABELS[phase]}
              </p>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {PHASE_DETAILS[phase]}
              </p>
            </div>
          </div>
        </div>

        {/* Лог симуляции */}
        {log.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Лог симуляции
              </span>
            </div>
            <div className="px-4 py-3 space-y-1 max-h-40 overflow-y-auto">
              {log.map((entry, i) => (
                <p
                  key={i}
                  className={`text-[11px] font-mono animate-fade-in ${
                    entry.includes('✓') ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Визуализация JSON-преобразования */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Преобразование данных: SQL → JSON → UI State
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* SQL Row */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">SQL Row</span>
            </div>
            <pre className="text-[10px] font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">
{`id  | username | email       | role
----|----------|-------------|------
 1  | kmikhail | kris@dev.io | admin`}
            </pre>
          </div>

          {/* JSON */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">JSON String</span>
            </div>
            <pre className="text-[10px] font-mono text-blue-300/80 leading-relaxed whitespace-pre-wrap">
{`{
  "status": 200,
  "data": [{
    "id": 1,
    "username": "kmikhail"
  }]
}`}
            </pre>
          </div>

          {/* UI State */}
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">React State</span>
            </div>
            <pre className="text-[10px] font-mono text-cyan-300/80 leading-relaxed whitespace-pre-wrap">
{`const [users, setUsers] =
  useState([
    { id: 1,
      username: "kmikhail" }
  ]);`}
            </pre>
          </div>
        </div>

        {/* Безопасность */}
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Безопасность: шифрование токена
            </span>
          </div>
          <pre className="text-[10px] font-mono text-amber-300/70 leading-relaxed whitespace-pre-wrap">
{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzQyIiwicm9sZSI6ImFkbWluIn0.signature
                                  ↑ JWT payload зашифрован (HS256)
TLS/SSL: данные шифруются на transport-уровне (HTTPS)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
