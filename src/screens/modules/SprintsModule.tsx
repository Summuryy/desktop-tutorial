import { useState, useRef } from 'react';
import { CheckCircle2, XCircle, Play, ClipboardList, Trophy, RotateCcw, Zap } from 'lucide-react';
import { CHALLENGES } from '@/data/challenges';
import { useGame, XP_REWARDS } from '@/context/GameContext';
import type { Challenge, TestResult, Difficulty } from '@/types';

// ============================================================
// Модуль 06: Engineering Sprints — Задания с автопроверкой
// Список из 5 задач (Junior → Senior). Пользователь пишет код
// в редакторе, нажимает "Проверить решение" — система прогоняет
// код через скрытые тест-кейсы и выводит детальный отчёт.
// ============================================================

// Цветовая схема для уровней сложности
const DIFFICULTY_STYLES: Record<string, string> = {
  Junior: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Middle: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Senior: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

// Конвертация значения в строку для отображения (в т.ч. объекты/массивы)
function valueToString(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

// Глубокое сравнение ожидаемого и фактического результата
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  Junior: XP_REWARDS.CHALLENGE_SOLVED_JUNIOR,
  Middle: XP_REWARDS.CHALLENGE_SOLVED_MIDDLE,
  Senior: XP_REWARDS.CHALLENGE_SOLVED_SENIOR,
};

export default function SprintsModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  // ID выбранной задачи
  const [activeId, setActiveId] = useState(1);
  // Код в редакторе (привязан к выбранной задаче)
  const [codeMap, setCodeMap] = useState<Record<number, string>>(() => {
    // Инициализируем стартовым кодом для каждой задачи
    const map: Record<number, string> = {};
    CHALLENGES.forEach((c) => { map[c.id] = c.starterCode; });
    return map;
  });
  // Результаты автопроверки (null = не запускалась)
  const [results, setResults] = useState<TestResult[] | null>(null);
  // Множество решённых задач
  const [solved, setSolved] = useState<Set<number>>(new Set());
  // Флаг: идёт ли проверка (для анимации кнопки)
  const [isRunning, setIsRunning] = useState(false);
  // Ссылка на textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Текущая активная задача
  const activeChallenge = CHALLENGES.find((c) => c.id === activeId)!;
  // Код в редакторе для текущей задачи
  const code = codeMap[activeId] ?? activeChallenge.starterCode;

  // Обновление кода в редакторе
  const handleCodeChange = (value: string) => {
    setCodeMap((prev) => ({ ...prev, [activeId]: value }));
  };

  // Выбор задачи — переключение редактора
  const selectChallenge = (id: number) => {
    setActiveId(id);
    setResults(null);
    textareaRef.current?.focus();
  };

  // Сброс кода к стартовому шаблону
  const resetCode = () => {
    setCodeMap((prev) => ({ ...prev, [activeId]: activeChallenge.starterCode }));
    setResults(null);
  };

  // ─────────────────────────────────────────────────────
  // Автопроверка: компиляция и прогон тестов
  // Async-функция — поддерживает Promise-based тесты (задача 5)
  // ─────────────────────────────────────────────────────
  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    const testResults: TestResult[] = [];
    const challenge = activeChallenge;

    try {
      // Компиляция пользовательского кода через new Function()
      // Изолированный scope: пользовательский код не имеет доступа
      // к переменным этого модуля
      const userCode = codeMap[challenge.id] ?? challenge.starterCode;
      const fn = new Function('console', `"use strict";\n${userCode}\n; return typeof ${challenge.fnName} !== 'undefined' ? ${challenge.fnName} : null;`);

      // Перехватчик console для логирования
      const consoleBuffer: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => consoleBuffer.push(args.map(valueToString).join(' ')),
        error: (...args: unknown[]) => consoleBuffer.push(args.map(valueToString).join(' ')),
        warn: (...args: unknown[]) => consoleBuffer.push(args.map(valueToString).join(' ')),
      };

      // Получаем функцию пользователя из замыкания
      const userFn = fn(mockConsole);

      // Проверка: функция объявлена
      if (typeof userFn !== 'function') {
        challenge.tests.forEach((tc) => {
          testResults.push({
            passed: false,
            description: tc.description,
            input: tc.args.map(valueToString).join(', '),
            expected: valueToString(tc.expected),
            actual: '—',
            error: `Function "${challenge.fnName}" is not defined. Declare it with this exact name.`,
          });
        });
      } else {
        // Прогон каждого тест-кейса
        for (const tc of challenge.tests) {
          try {
            // Вызов пользовательской функции с аргументами из тест-кейса
            const rawResult = userFn(...tc.args);

            // Если функция async (вернула Promise) — ждём разрешения
            const result = rawResult instanceof Promise
              ? await rawResult
              : rawResult;

            // Проверка результата
            if (deepEqual(result, tc.expected)) {
              testResults.push({
                passed: true,
                description: tc.description,
                input: tc.args.map(valueToString).join(', '),
                expected: valueToString(tc.expected),
                actual: valueToString(result),
              });
            } else {
              testResults.push({
                passed: false,
                description: tc.description,
                input: tc.args.map(valueToString).join(', '),
                expected: valueToString(tc.expected),
                actual: valueToString(result),
                error: `Провален тест: ${tc.description}. Получено: ${valueToString(result)}, ожидалось: ${valueToString(tc.expected)}`,
              });
            }
          } catch (err) {
            // Функция бросила ошибку — проверяем, совпадает ли с ожидаемой
            const errMsg = err instanceof Error ? err.message : String(err);

            // Если тест ожидает throw с конкретным сообщением (задача 5: 401)
            if (typeof tc.expected === 'string' && tc.expected.includes('401')) {
              if (errMsg.includes(tc.expected)) {
                testResults.push({
                  passed: true,
                  description: tc.description,
                  input: tc.args.map(valueToString).join(', '),
                  expected: `throw Error("${tc.expected}")`,
                  actual: `throw Error("${errMsg}")`,
                });
              } else {
                testResults.push({
                  passed: false,
                  description: tc.description,
                  input: tc.args.map(valueToString).join(', '),
                  expected: `throw Error("${tc.expected}")`,
                  actual: `throw Error("${errMsg}")`,
                  error: `Ошибка выброшена, но с неверным сообщением. Ожидалось: "${tc.expected}", получено: "${errMsg}".`,
                });
              }
            } else {
              // Неожиданный throw для теста, который не ожидает ошибку
              testResults.push({
                passed: false,
                description: tc.description,
                input: tc.args.map(valueToString).join(', '),
                expected: valueToString(tc.expected),
                actual: `throw: ${errMsg}`,
                error: `Провален тест: ${tc.description}. Функция выбросила ошибку: ${errMsg}`,
              });
            }
          }
        }
      }
    } catch (err) {
      // Ошибка компиляции пользовательского кода (SyntaxError)
      const errMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      challenge.tests.forEach((tc) => {
        testResults.push({
          passed: false,
          description: tc.description,
          input: tc.args.map(valueToString).join(', '),
          expected: valueToString(tc.expected),
          actual: '—',
          error: `Compilation error — ${errMsg}`,
        });
      });
    }

    setResults(testResults);
    setIsRunning(false);

    // Все тесты пройдены → отмечаем задачу решённой + начисляем XP
    const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
    if (allPassed) {
      setSolved((prev) => {
        if (prev.has(activeId)) return prev;
        const next = new Set(prev);
        next.add(activeId);
        // XP за новое решение
        const xpReward = XP_BY_DIFFICULTY[challenge.difficulty];
        addXp(xpReward, `Задача #${challenge.id} решена`);
        // Достижение за первую задачу
        if (!isAchievementUnlocked('sprint-junior')) {
          unlockAchievement('sprint-junior');
        }
        // Достижение за все 5 задач
        if (next.size === CHALLENGES.length && !isAchievementUnlocked('sprint-master')) {
          unlockAchievement('sprint-master');
        }
        return next;
      });
    }
  };

  // Подсчёт статистики
  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalCount = results ? results.length : 0;
  const allPassed = results !== null && passedCount === totalCount && totalCount > 0;
  const hasErrors = results !== null && !allPassed;
  const overallProgress = Math.round((solved.size / CHALLENGES.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок + неоновая шкала прогресса */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-slate-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-100">Engineering Sprints</h2>
          <p className="text-[12px] text-slate-500 font-mono">5 задач · автопроверка через unit-тесты</p>
        </div>
        {/* Индикатор прогресса — неоновая шкала */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Solved</p>
            <p className="text-sm font-bold text-slate-200 font-mono">{solved.size} / {CHALLENGES.length}</p>
          </div>
          {/* Неоновая шкала прогресса */}
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${overallProgress}%`,
                boxShadow: overallProgress > 0 ? '0 0 8px rgba(99,102,241,0.5), 0 0 16px rgba(52,211,153,0.3)' : 'none',
              }}
            />
          </div>
          <span className="text-[12px] font-mono font-bold text-slate-300 w-8 text-right">{overallProgress}%</span>
        </div>
      </div>

      {/* Список задач — горизонтальные карточки выбора */}
      <div className="flex gap-2 flex-wrap">
        {CHALLENGES.map((ch) => {
          const isActive = ch.id === activeId;
          const isSolved = solved.has(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => selectChallenge(ch.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border transition-colors ${
                isActive
                  ? 'bg-slate-800 border-slate-600'
                  : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Номер + статус (галочка / пустой кружок) */}
              {isSolved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center">
                  <span className="text-[9px] font-mono text-slate-600">{ch.id}</span>
                </span>
              )}
              <div className="text-left">
                <p className={`text-[12px] font-semibold ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                  #{ch.id} {ch.title}
                </p>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[ch.difficulty]}`}>
                  {ch.difficulty}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Условие задачи */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-600">TASK #{activeChallenge.id}</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_STYLES[activeChallenge.difficulty]}`}>
              {activeChallenge.difficulty}
            </span>
          </div>
          {solved.has(activeId) && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-100 mb-1.5">{activeChallenge.title}</h3>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-3">{activeChallenge.description}</p>
        <p className="text-[12px] font-mono text-slate-500 bg-slate-900/50 border border-slate-800 rounded-md px-3 py-2">
          {activeChallenge.signature}
        </p>
      </div>

      {/* Layout: редактор + результаты тестов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Левая панель — редактор кода */}
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden flex flex-col">
          {/* Заголовок редактора */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <span className="text-[11px] font-mono text-slate-400">
              solution_{activeChallenge.id}.js
            </span>
            <button
              onClick={resetCode}
              className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Редактор — textarea с номерами строк */}
          <div className="relative flex-1">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/30 border-r border-slate-800 flex flex-col items-end py-3 px-2 select-none pointer-events-none overflow-hidden">
              {code.split('\n').map((_, i) => (
                <span key={i} className="text-[11px] font-mono text-slate-700 leading-[1.6]">
                  {i + 1}
                </span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full h-72 bg-transparent text-[13px] font-mono text-slate-200 leading-[1.6] pl-12 pr-4 py-3 resize-none focus:outline-none"
            />
          </div>

          {/* Кнопка проверки */}
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/30">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg py-2.5 text-[13px] font-semibold disabled:opacity-50 transition-colors active:scale-[0.98]"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Running tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Проверить решение
                </>
              )}
            </button>
          </div>
        </div>

        {/* Правая панель — результаты автопроверки */}
        <div className={`rounded-xl border bg-[#0D1117] overflow-hidden flex flex-col transition-colors duration-300 ${
          allPassed ? 'border-emerald-500/30' : hasErrors ? 'border-rose-500/30' : 'border-slate-800'
        }`}>
          {/* Заголовок панели результатов */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <span className="text-[11px] font-mono text-slate-400">test results</span>
            {results && (
              <span className={`text-[11px] font-mono font-bold ${
                allPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {passedCount} / {totalCount} passed
              </span>
            )}
          </div>

          <div className="flex-1 h-72 overflow-y-auto">
            {/* Нет результатов — начальное состояние */}
            {!results && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ClipboardList className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-slate-700 text-[12px]">No tests run yet</p>
                <p className="text-slate-800 text-[11px] mt-1">Press "Проверить решение" to run unit tests</p>
              </div>
            )}

            {/* Все тесты пройдены — зелёный баннер */}
            {allPassed && (
              <div className="p-4 space-y-3">
                <div className="animate-fade-in rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 font-bold text-sm">
                    Тесты пройдены успешно! Ошибка 0%. Код готов к продакшену
                  </p>
                  <p className="text-emerald-400/60 text-[11px] font-mono mt-1">
                    {passedCount}/{totalCount} test cases passed
                  </p>
                </div>
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] font-mono text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-500">{r.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Есть ошибки — детальный лог провалов */}
            {hasErrors && (
              <div className="p-4 space-y-2">
                {/* Баннер с количеством ошибок */}
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <p className="text-rose-400 font-bold text-[13px]">
                      {totalCount - passedCount} из {totalCount} тестов провалены
                    </p>
                  </div>
                  <p className="text-rose-400/60 text-[11px] font-mono">
                    Исправь код и попробуй снова
                  </p>
                </div>

                {/* Детальный лог каждого теста */}
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2.5 ${
                      r.passed
                        ? 'border-slate-800 bg-slate-900/30'
                        : 'border-rose-500/20 bg-rose-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {r.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span className={`text-[12px] font-mono ${r.passed ? 'text-slate-500' : 'text-slate-200'}`}>
                        {r.passed ? 'PASS' : 'FAIL'} — {r.description}
                      </span>
                    </div>
                    {!r.passed && (
                      <div className="ml-5 text-[11px] font-mono space-y-0.5">
                        <p className="text-slate-500">Input: <span className="text-slate-300">{r.input}</span></p>
                        <p className="text-slate-500">Expected: <span className="text-emerald-400">{r.expected}</span></p>
                        <p className="text-slate-500">Got: <span className="text-rose-400">{r.actual}</span></p>
                        {r.error && (
                          <p className="text-rose-400/80 mt-1 leading-relaxed">{r.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Достижение — все 5 задач решены */}
      {solved.size === CHALLENGES.length && (
        <div className="animate-fade-in rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-5 text-center">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <p className="text-amber-400 font-bold text-base">
            Все 5 спринтов пройдены! 100% completion.
          </p>
          <p className="text-amber-400/60 text-[12px] font-mono mt-1">
            You are ready for production-level development.
          </p>
        </div>
      )}
    </div>
  );
}
