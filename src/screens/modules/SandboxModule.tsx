import { useState, useRef } from 'react';
import { Code2, Play, Trash2, FileCode2, AlertTriangle, Terminal, ChevronRight } from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import type { ConsoleLine, TemplateId } from '@/types';

// ============================================================
// Модуль 05: Code Sandbox — Практическая лаборатория
// Раздельный layout: слева — редактор кода, справа — консоль.
// Безопасное исполнение JavaScript через перехват console.log
// и конвертацию пользовательского кода в Function constructor.
// ============================================================

// --- Шаблоны кода для быстрой загрузки в редактор ---

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

export default function SandboxModule() {
  // Текущий код в редакторе
  const [code, setCode] = useState(TEMPLATES.variables.code);
  // Активный шаблон (для подсветки кнопки)
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('variables');
  // Строки вывода консоли
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  // Флаг: был ли запуск хотя бы один раз
  const [hasExecuted, setHasExecuted] = useState(false);
  // Ссылка на textarea для управления tabindex
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Загрузка шаблона в редактор
  const loadTemplate = (id: TemplateId) => {
    setCode(TEMPLATES[id].code);
    setActiveTemplate(id);
    // Фокус на редактор после загрузки
    textareaRef.current?.focus();
  };

  // Безопасное исполнение пользовательского JS-кода.
  // Стратегия: перехватываем console.log через обёртку,
  // выполняем код через new Function() (изолированный scope),
  // перехватываем синтаксические ошибки через try/catch.
  const execute = () => {
    const output: ConsoleLine[] = [];

    // Создаём перехватчик console.log
    // Каждое значение конвертируется в строку для вывода
    const captureLog = (...args: unknown[]) => {
      const formatted = args
        .map((arg) => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');
      output.push({ text: formatted, type: 'log' as const });
    };

    try {
      // new Function() создаёт функцию с изолированным scope.
      // Пользовательский код не имеет доступа к локальным переменным
      // этого модуля. console.log подменяется на перехватчик.
      const fn = new Function('console', `"use strict";\n${code}`);
      fn({ log: captureLog, error: captureLog, warn: captureLog, info: captureLog });
    } catch (err) {
      // Перехват ошибок: SyntaxError, ReferenceError, TypeError и др.
      // Формируем технически точное сообщение об ошибке
      let errorMsg = '';
      if (err instanceof SyntaxError) {
        errorMsg = `SyntaxError: ${err.message}`;
      } else if (err instanceof ReferenceError) {
        errorMsg = `ReferenceError: ${err.message}`;
      } else if (err instanceof TypeError) {
        errorMsg = `TypeError: ${err.message}`;
      } else if (err instanceof RangeError) {
        errorMsg = `RangeError: ${err.message}`;
      } else if (err instanceof Error) {
        errorMsg = `${err.name}: ${err.message}`;
      } else {
        errorMsg = `Error: ${String(err)}`;
      }
      output.push({ text: errorMsg, type: 'error' as const });
    }

    // Если вывод пустой — добавляем системное сообщение
    if (output.length === 0) {
      output.push({ text: 'Code executed successfully (no output)', type: 'log' as const });
    }

    setConsoleLines(output);
    setHasExecuted(true);
  };

  // Очистка консоли
  const clearConsole = () => {
    setConsoleLines([]);
    setHasExecuted(false);
  };

  // Проверка: есть ли ошибки в выводе (для стилизации консоли)
  const hasError = consoleLines.some((line) => line.type === 'error');

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Code Sandbox — Практическая лаборатория</h2>
          <p className="text-[12px] text-slate-500 font-mono">Live JS/TS editor · sandboxed execution · error diagnostics</p>
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
                Учитывайте block scope — переменная из блока
                <span className="font-mono"> {'{}'}</span> недоступна снаружи.
              </p>
            ),
          },
          {
            heading: 'TypeError',
            body: (
              <p>
                Операция применена к значению несоответствующего типа. Пример:
                вызов не-функции
                <span className="font-mono text-rose-400"> TypeError: x is not a function</span>,
                обращение к свойству
                <span className="font-mono text-rose-400"> null</span> или
                <span className="font-mono text-rose-400"> undefined</span>.
                Действие: проверьте тип переменной через
                <span className="font-mono text-slate-300"> console.log(typeof x)</span> перед операцией.
              </p>
            ),
          },
        ]}
      />

      {/* Кнопки быстрого переключения шаблонов */}
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

      {/* Раздельный layout: редактор | консоль */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Левая панель — редактор кода */}
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden flex flex-col">
          {/* Заголовок редактора */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-400">editor.js</span>
            </div>
            {/* Транспорт светофора (IDE-style) */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            </div>
          </div>

          {/* Область редактирования — textarea стилизована под IDE */}
          <div className="relative flex-1">
            {/* Номера строк (визуальный оверлей) */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-900/30 border-r border-slate-800 flex flex-col items-end py-3 px-2 select-none pointer-events-none">
              {code.split('\n').map((_, i) => (
                <span key={i} className="text-[11px] font-mono text-slate-700 leading-[1.6]">
                  {i + 1}
                </span>
              ))}
            </div>
            {/* Textarea — редактор кода */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-80 bg-transparent text-[13px] font-mono text-slate-200 leading-[1.6] pl-12 pr-4 py-3 resize-none focus:outline-none placeholder:text-slate-700"
              placeholder="// Write your code here..."
            />
          </div>

          {/* Панель действий редактора */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900/30">
            <button
              onClick={execute}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              Запустить код (Execute)
            </button>
            <span className="text-[10px] font-mono text-slate-600 ml-2">
              {code.split('\n').length} lines
            </span>
          </div>
        </div>

        {/* Правая панель — консоль вывода */}
        <div className={`rounded-xl border bg-[#0D1117] overflow-hidden flex flex-col transition-colors duration-300 ${
          hasError ? 'border-rose-500/30' : 'border-slate-800'
        }`}>
          {/* Заголовок консоли */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-400">console</span>
              {/* Индикатор статуса */}
              {hasExecuted && (
                <span className={`ml-1.5 flex items-center gap-1 text-[10px] font-mono ${
                  hasError ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                  {hasError ? 'ERRORS' : 'OK'}
                </span>
              )}
            </div>
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

          {/* Область вывода консоли */}
          <div className="flex-1 h-80 overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed">
            {!hasExecuted ? (
              // Начальное состояние — пустая консоль
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Terminal className="w-8 h-8 text-slate-800 mb-2" />
                <p className="text-slate-700 text-[12px]">
                  Console is empty
                </p>
                <p className="text-slate-800 text-[11px] mt-1">
                  Press "Execute" to run code
                </p>
              </div>
            ) : (
              // Строки вывода
              <div className="space-y-1">
                {consoleLines.map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 animate-fade-in ${
                      line.type === 'error' ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {/* Префикс строки: > для log, ! для error */}
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
      </div>
    </div>
  );
}
