import { useState, useRef } from 'react';
import { Code2, Play, Trash2, FileCode2, AlertTriangle, Terminal, ChevronRight, Lightbulb, Sparkles, X, BookOpen } from 'lucide-react';
import { useGame, XP_REWARDS } from '@/context/GameContext';
import TechDoc from '@/components/TechDoc';
import type { ConsoleLine, TemplateId } from '@/types';

// ============================================================
// Модуль 05: Code Sandbox — Практическая лаборатория
// + ИИ-помощник "Помощь Ментора" для разбора ошибок
// ============================================================

const TEMPLATES: Record<TemplateId, { label: string; code: string }> = {
  variables: {
    label: 'Переменные',
    code: `// Объявление переменных: let (иммутабельная) и var (мутабельная)
let username: string = "kmikhailov";
const PI = 3.14159;
var isActive: boolean = true;

console.log("Username:", username);
console.log("PI:", PI);
console.log("isActive:", isActive);

// Переназначение
isActive = false;
console.log("Updated isActive:", isActive);`,
  },
  conditions: {
    label: 'Условия',
    code: `// Условные операторы и булева логика
let role: string = "admin";
let isAuthenticated: boolean = true;

if (!isAuthenticated) {
  console.log("401 Unauthorized");
} else if (role === "admin") {
  console.log("200 OK — Admin access granted");
} else if (role === "user" && isAuthenticated) {
  console.log("200 OK — User access granted");
} else {
  console.log("403 Forbidden");
}

// Switch-case
switch (role) {
  case "admin":
    console.log("Redirect: /admin/dashboard");
    break;
  case "user":
    console.log("Redirect: /dashboard");
    break;
  default:
    console.log("Redirect: /login");
}`,
  },
  functions: {
    label: 'Функции',
    code: `// Сигнатура функции, параметры, return
function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string): string {
  return "Hello, " + name + "!";
}

// Вызов функций
console.log(greet("Kris"));
console.log("5 + 3 =", add(5, 3));

// Arrow function (ES6+)
const multiply = (a: number, b: number) => a * b;
console.log("4 * 7 =", multiply(4, 7));

// Методы массивов
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
console.log("Doubled:", doubled);
console.log("Evens:", evens);`,
  },
};

// ── ИИ-помощник: разбор ошибок ──

interface MentorTip {
  errorType: string;
  explanation: string;
  steps: string[];
  highlightHint: string;
}

function getMentorTip(errorMsg: string): MentorTip | null {
  if (errorMsg.includes('SyntaxError')) {
    const isUnexpectedToken = errorMsg.includes('Unexpected token');
    const isUnexpectedEnd = errorMsg.includes('Unexpected end');
    return {
      errorType: 'SyntaxError — Синтаксическая ошибка',
      explanation: isUnexpectedToken
        ? 'Компилятор встретил символ, которого не ожидал в этом месте. Чаще всего это пропущенная скобка, запятая или точка с запятой перед этим токеном.'
        : isUnexpectedEnd
          ? 'Код закончился раньше, чем компилятор ожидал. Скорее всего, вы не закрыли какую-то скобку — фигурную {}, круглую () или квадратную [].'
          : 'Нарушена грамматика языка JavaScript. Компилятор не может построить дерево разбора (AST).',
      steps: [
        'Посмотрите на позицию ошибки в сообщении — там указана строка и столбец',
        'Проверьте баланс скобок: (), {}, [] — каждая открывающая должна иметь закрывающую',
        'Проверьте, что все строки закрыты кавычками ("..." или \'...\')',
        'Убедитесь, что после объявлений стоит точка с запятой или перенос строки',
        'Попробуйте закомментировать часть кода, чтобы локализовать проблему',
      ],
      highlightHint: 'Ищите проблему на строке, указанной в сообщении об ошибке, или на строке выше',
    };
  }
  if (errorMsg.includes('ReferenceError')) {
    const varName = errorMsg.match(/(\w+) is not defined/)?.[1] ?? 'переменная';
    return {
      errorType: `ReferenceError — "${varName}" не определена`,
      explanation: `Вы обращаетесь к переменной или функции "${varName}", но она не объявлена в текущей области видимости. Возможно, она объявлена в другом блоке кода, или вы опечатались в имени.`,
      steps: [
        `Проверьте, что переменная "${varName}" объявлена через let, const или var до её использования`,
        'Убедитесь, что переменная объявлена в той же области видимости (scope), где вы её используете',
        `Проверьте написание имени — возможно, есть опечатка (например, "${varName}" vs "${varName.charAt(0).toUpperCase() + varName.slice(1)}")`,
        'Если переменная из другого блока {} — она недоступна снаружи (block scope для let/const)',
        'Если это функция — убедитесь, что она объявлена через function name() {} до вызова',
      ],
      highlightHint: `Найдите строку, где используется "${varName}", и добавьте объявление выше`,
    };
  }
  if (errorMsg.includes('TypeError')) {
    const isNotFunction = errorMsg.includes('is not a function');
    return {
      errorType: 'TypeError — Ошибка типа данных',
      explanation: isNotFunction
        ? 'Вы пытаетесь вызвать как функцию то, что функцией не является. Возможно, переменная содержит undefined, null или число/строку вместо функции.'
        : 'Операция применена к значению несоответствующего типа. Например, обращение к свойству null/undefined или арифметическая операция со строкой.',
      steps: [
        'Перед операцией добавьте console.log(typeof вашаПеременная) чтобы проверить её тип',
        isNotFunction
          ? 'Убедитесь, что переменная действительно содержит функцию перед вызовом через ()'
          : 'Проверьте, что объект не равен null или undefined перед обращением к его свойствам',
        'Используйте опциональную цепочку: obj?.property вместо obj.property',
        'Добавьте проверку: if (typeof x === "function") x() перед вызовом',
      ],
      highlightHint: 'Проверьте тип данных переменной на строке, указанной в ошибке',
    };
  }
  if (errorMsg.includes('RangeError')) {
    return {
      errorType: 'RangeError — Выход за пределы диапазона',
      explanation: 'Значение выходит за допустимый диапазон. Часто это бесконечная рекурсия (stack overflow) или неверный размер массива.',
      steps: [
        'Если есть рекурсия — проверьте базовый случай (условие выхода)',
        'Убедитесь, что рекурсивный вызов приближает к базовому случаю',
        'Проверьте, что длина массива не отрицательная и не превышает максимум',
      ],
      highlightHint: 'Ищите рекурсивный вызов функции без условия остановки',
    };
  }
  return null;
}

export default function SandboxModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  const [code, setCode] = useState(TEMPLATES.variables.code);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('variables');
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [mentorTip, setMentorTip] = useState<MentorTip | null>(null);
  const [showMentor, setShowMentor] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadTemplate = (id: TemplateId) => {
    setCode(TEMPLATES[id].code);
    setActiveTemplate(id);
    setMentorTip(null);
    setShowMentor(false);
    textareaRef.current?.focus();
  };

  const execute = () => {
    const output: ConsoleLine[] = [];
    let errorMsg = '';

    const captureLog = (...args: unknown[]) => {
      const formatted = args
        .map((arg) => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch { return String(arg); }
          }
          return String(arg);
        })
        .join(' ');
      output.push({ text: formatted, type: 'log' as const });
    };

    try {
      const fn = new Function('console', `"use strict";\n${code}`);
      fn({ log: captureLog, error: captureLog, warn: captureLog, info: captureLog });
    } catch (err) {
      if (err instanceof SyntaxError) errorMsg = `SyntaxError: ${err.message}`;
      else if (err instanceof ReferenceError) errorMsg = `ReferenceError: ${err.message}`;
      else if (err instanceof TypeError) errorMsg = `TypeError: ${err.message}`;
      else if (err instanceof RangeError) errorMsg = `RangeError: ${err.message}`;
      else if (err instanceof Error) errorMsg = `${err.name}: ${err.message}`;
      else errorMsg = `Error: ${String(err)}`;

      output.push({ text: errorMsg, type: 'error' as const });

      // Получаем подсказку от ИИ-ментора
      const tip = getMentorTip(errorMsg);
      if (tip) {
        setMentorTip(tip);
      }
    }

    if (output.length === 0) {
      output.push({ text: 'Code executed successfully (no output)', type: 'log' as const });
    }

    setConsoleLines(output);
    setHasExecuted(true);

    // XP за успешный запуск без ошибок
    const hasErrorInOutput = output.some((l) => l.type === 'error');
    if (!hasErrorInOutput) {
      addXp(XP_REWARDS.SANDBOX_SUCCESS, 'Успешный запуск кода');
      if (!isAchievementUnlocked('code-runner')) {
        unlockAchievement('code-runner');
      }
    }
  };

  const clearConsole = () => {
    setConsoleLines([]);
    setHasExecuted(false);
    setMentorTip(null);
    setShowMentor(false);
  };

  const hasError = consoleLines.some((line) => line.type === 'error');

  // Подсветка строки с ошибкой
  const errorLineMatch = consoleLines.find((l) => l.type === 'error')?.text.match(/line (\d+)/i);
  const errorLineNum = errorLineMatch ? parseInt(errorLineMatch[1]) : null;
  const codeLines = code.split('\n');

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Code Sandbox — Практическая лаборатория</h2>
          <p className="text-[12px] text-slate-500 font-mono">Live JS/TS editor · sandboxed execution · AI Mentor</p>
        </div>
      </div>

      {/* Техническая документация */}
      <TechDoc
        title="Technical Documentation — Reading Compiler Errors"
        sections={[
          {
            heading: 'SyntaxError',
            body: (
              <p>
                Нарушение грамматики языка: пропущенная скобка, незакрытая строка,
                лишняя запятая. Компилятор не может построить AST (Abstract Syntax Tree)
                и указывает позицию ошибки. Пример:
                <span className="font-mono text-rose-400"> SyntaxError: Unexpected token</span>.
                Действие: найдите строку из ошибки, проверьте баланс скобок
                <span className="font-mono"> ()</span>,
                <span className="font-mono"> {}</span>,
                <span className="font-mono"> []</span> и закрытие строк
                <span className="font-mono"> ""</span>.
              </p>
            ),
          },
          {
            heading: 'ReferenceError',
            body: (
              <p>
                Обращение к переменной или функции, не объявлённой в текущей области
                видимости (scope). Пример:
                <span className="font-mono text-rose-400"> ReferenceError: x is not defined</span>.
                Действие: проверьте, что переменная объявлена через
                <span className="font-mono text-slate-300"> let</span>,
                <span className="font-mono text-slate-300"> const</span> или
                <span className="font-mono text-slate-300"> var</span> до использования.
              </p>
            ),
          },
          {
            heading: 'TypeError',
            body: (
              <p>
                Операция применена к значению несоответствующего типа. Пример:
                вызов не-функции
                <span className="font-mono text-rose-400"> TypeError: x is not a function</span>.
                Действие: проверьте тип переменной через
                <span className="font-mono text-slate-300"> console.log(typeof x)</span> перед операцией.
              </p>
            ),
          },
        ]}
      />

      {/* Кнопки шаблонов */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mr-1">
          Templates:
        </span>
        {(['variables', 'conditions', 'functions'] as TemplateId[]).map((id) => (
          <button
            key={id}
            onClick={() => loadTemplate(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium border transition-colors ${
              activeTemplate === id
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900/30 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            {TEMPLATES[id].label}
          </button>
        ))}
      </div>

      {/* Layout: редактор | консоль + ментор */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Левая панель — редактор кода */}
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-400">editor.js</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            </div>
          </div>

          <div className="relative flex-1">
            {/* Номера строк с подсветкой ошибки */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/30 border-r border-slate-800 flex flex-col items-end py-3 px-2 select-none pointer-events-none">
              {codeLines.map((_, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-mono leading-[1.6] ${
                    errorLineNum === i + 1 ? 'text-rose-400 font-bold' : 'text-slate-700'
                  }`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            {/* Подсветка строки с ошибкой */}
            {errorLineNum && errorLineNum <= codeLines.length && (
              <div
                className="absolute left-10 right-0 bg-rose-500/10 border-l-2 border-rose-500/60 pointer-events-none"
                style={{ top: `${(errorLineNum - 1) * 1.6 * 13 + 12}px`, height: `${1.6 * 13}px` }}
              />
            )}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-80 bg-transparent text-[13px] font-mono text-slate-200 leading-[1.6] pl-12 pr-4 py-3 resize-none focus:outline-none placeholder:text-slate-700"
              placeholder="// Write your code here..."
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900/30">
            <button
              onClick={execute}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              Запустить код (Execute)
            </button>
            <span className="text-[10px] font-mono text-slate-600 ml-2">
              {codeLines.length} lines
            </span>
          </div>
        </div>

        {/* Правая панель — консоль + ментор */}
        <div className="flex flex-col gap-3">
          {/* Консоль вывода */}
          <div className={`rounded-xl border bg-[#0D1117] overflow-hidden flex flex-col transition-colors duration-300 ${
            hasError ? 'border-rose-500/30' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-mono text-slate-400">console</span>
                {hasExecuted && (
                  <span className={`ml-1.5 flex items-center gap-1 text-[10px] font-mono ${
                    hasError ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    {hasError ? 'ERRORS' : 'OK'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Кнопка "Помощь Ментора" — появляется при ошибке */}
                {hasError && (
                  <button
                    onClick={() => setShowMentor(!showMentor)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all active:scale-[0.98] ${
                      showMentor
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                        : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                    }`}
                    style={{ boxShadow: '0 0 8px rgba(34,211,238,0.2)' }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Помощь Ментора
                  </button>
                )}
                {consoleLines.length > 0 && (
                  <button
                    onClick={clearConsole}
                    className="flex items-center gap-1 text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 h-56 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed">
              {!hasExecuted ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Terminal className="w-8 h-8 text-slate-800 mb-2" />
                  <p className="text-slate-700 text-[12px]">Console is empty</p>
                  <p className="text-slate-800 text-[11px] mt-1">Press "Execute" to run code</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {consoleLines.map((line, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 animate-fade-in ${
                        line.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {line.type === 'error' ? (
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-700" />
                      )}
                      <span className={`whitespace-pre-wrap break-all ${line.type === 'error' ? 'font-medium' : ''}`}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ИИ-панель ментора */}
          {showMentor && mentorTip && (
            <div className="animate-fade-in rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent overflow-hidden flex flex-col">
              {/* Заголовок */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/20 bg-cyan-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                    ИИ-Ментор: Разбор ошибки
                  </span>
                </div>
                <button
                  onClick={() => setShowMentor(false)}
                  className="w-6 h-6 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Контент */}
              <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                {/* Тип ошибки */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-[12px] font-bold text-rose-300">{mentorTip.errorType}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    {mentorTip.explanation}
                  </p>
                </div>

                {/* Подсказка о месте ошибки */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      Где искать
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    {mentorTip.highlightHint}
                  </p>
                </div>

                {/* Пошаговое руководство */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      Пошаговое руководство
                    </span>
                  </div>
                  <div className="space-y-2">
                    {mentorTip.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 animate-fade-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-cyan-300">
                          {i + 1}
                        </span>
                        <p className="text-[12px] text-slate-300 leading-relaxed pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Подсказка: нажмите для помощи */}
          {hasError && !showMentor && (
            <div className="animate-fade-in rounded-xl border border-dashed border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
              <Lightbulb className="w-5 h-5 text-cyan-400/60 mx-auto mb-1.5" />
              <p className="text-[11px] text-cyan-400/70 font-mono">
                Нажмите "Помощь Ментора" выше, чтобы получить пошаговое руководство по исправлению ошибки
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
