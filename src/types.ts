// ============================================================
// Общие типы — техническая модель данных приложения
// ============================================================

// Идентификаторы модулей дашборда
export type ModuleId = 'memory' | 'control-flow' | 'arrays' | 'async-api' | 'sandbox' | 'sprints' | 'team-integration';

// Метаданные модуля для навигации
export interface ModuleInfo {
  id: ModuleId;
  index: string;      // порядковый номер ("01" … "04")
  title: string;      // краткое название
  subtitle: string;   // термины, covered модулем
  icon: string;       // ключ карты иконок lucide-react
}

// --- Модуль 1: Memory Allocation & Data Types ---

// Типы данных, поддерживаемые визуализатором памяти
export type DataType = 'String' | 'Integer' | 'Boolean' | 'Array' | 'Object';

// Модель одной ячейки памяти
export interface MemoryCell {
  id: string;
  keyword: 'var' | 'let' | 'const';  // ключевое слово объявления
  name: string;                       // идентификатор переменной
  type: DataType;                     // выведенный тип данных
  value: string;                      // строковое представление значения
  size: number;                       // условный размер в байтах (для визуализации)
  mutable: boolean;                   // мутабельность: true для var, false для let/const
}

// --- Модуль 2: Conditional Statements & Control Flow ---

// Роль пользователя — определяет ветвление control flow
export type UserRole = 'guest' | 'user' | 'admin';

// Результат валидации доступа
export interface AuthResult {
  status: 'granted' | 'forbidden' | 'unauthorized';
  httpCode: number;      // 200 / 401 / 403
  message: string;
  redirect: string;     // целевой "экран" для рендеринга
}

// --- Модуль 3: Array Methods & Iteration ---

// Элемент динамического списка
export interface DataItem {
  id: string;
  label: string;
  value: number;
  active: boolean;
}

// --- Модуль 5: Code Sandbox (Практическая лаборатория) ---

// --- Модуль 6: Engineering Sprints (Задания с автопроверкой) ---

// Уровень сложности задачи
export type Difficulty = 'Junior' | 'Middle' | 'Senior';

// Один тест-кейс: входные аргументы + ожидаемый результат
export interface TestCase {
  description: string;
  args: unknown[];
  expected: unknown;
}

// Модель инженерной задачи
export interface Challenge {
  id: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  signature: string;
  starterCode: string;
  fnName: string;
  tests: TestCase[];
}

// Результат одного тест-кейса
export interface TestResult {
  passed: boolean;
  description: string;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

// Идентификатор шаблона кода
export type TemplateId = 'variables' | 'conditions' | 'functions';

// Одна строка вывода консоли
export interface ConsoleLine {
  text: string;       // текст вывода
  type: 'log' | 'error'; // log — обычный, error — ошибка (красный)
}

// Стейт HTTP-запроса (Promise states)
export type RequestState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Имитированный JSON-ответ от REST API
export interface ApiResponse {
  status: number;
  endpoint: string;
  method: string;
  timestamp: string;
  rows: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
  }>;
}
