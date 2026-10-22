import type { Challenge } from '@/types';

// ============================================================
// Конфигурация инженерных спринтов: 5 задач, ранжированных
// по сложности (Junior → Senior). Каждая задача содержит
// стартовый код и скрытые тест-кейсы для автопроверки.
// ============================================================

export const CHALLENGES: Challenge[] = [
  // ──────────────────────────────────────────────────────────
  // Задача 1 (Junior): Валидация возраста
  // Тип: Int -> Bool. Возвращает true, если возраст >= 18.
  // ──────────────────────────────────────────────────────────
  {
    id: 1,
    title: 'Валидация возраста',
    difficulty: 'Junior',
    description:
      'Напиши функцию isAgeValid(age), которая принимает целое число (возраст) и возвращает true, если пользователю 18 лет или больше. Иначе — false.',
    signature: 'function isAgeValid(age: number): boolean',
    fnName: 'isAgeValid',
    starterCode: `// Функция валидации возраста для входа в приложение
// Вход: age (number) — возраст пользователя
// Выход: boolean — true если >= 18, иначе false
function isAgeValid(age) {
  // Напиши код здесь
  return false;
}`,
    tests: [
      { description: 'Возраст 25 — совершеннолетний', args: [25], expected: true },
      { description: 'Возраст 18 — пограничное значение (включительно)', args: [18], expected: true },
      { description: 'Возраст 17 — несовершеннолетний (должен быть заблокирован)', args: [17], expected: false },
      { description: 'Возраст 0 — младенец', args: [0], expected: false },
      { description: 'Возраст 65 — пенсионер', args: [65], expected: true },
      { description: 'Возраст 100 — долгожитель', args: [100], expected: true },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Задача 2 (Junior): Фильтрация забаненных пользователей
  // Тип: Array -> Array. Возвращает массив без banned-юзеров.
  // ──────────────────────────────────────────────────────────
  {
    id: 2,
    title: 'Фильтрация забаненных',
    difficulty: 'Junior',
    description:
      'Напиши функцию filterBanned(users), которая принимает массив объектов пользователей [{status: "active"|"banned"}] и возвращает новый массив, содержащий только пользователей со status === "active" (исключая "banned").',
    signature: 'function filterBanned(users: Array<{status: string}>): Array<{status: string}>',
    fnName: 'filterBanned',
    starterCode: `// Фильтрация массива пользователей: убираем забаненных
// Вход: users — массив объектов со свойством status
// Выход: отфильтрованный массив (только active)
function filterBanned(users) {
  // Напиши код здесь
  return [];
}`,
    tests: [
      {
        description: 'Микс active и banned — должны остаться только active',
        args: [[{ status: 'active' }, { status: 'banned' }, { status: 'active' }]],
        expected: [{ status: 'active' }, { status: 'active' }],
      },
      {
        description: 'Все забанены — пустой массив',
        args: [[{ status: 'banned' }, { status: 'banned' }]],
        expected: [],
      },
      {
        description: 'Все активны — массив без изменений',
        args: [[{ status: 'active' }, { status: 'active' }]],
        expected: [{ status: 'active' }, { status: 'active' }],
      },
      {
        description: 'Пустой массив — пустой массив',
        args: [[]],
        expected: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Задача 3 (Middle): Inline-стили кнопки по Props
  // Тип: Object -> String. Возвращает CSS-строку в зависимости
  // от флага isDisabled.
  // ──────────────────────────────────────────────────────────
  {
    id: 3,
    title: 'Inline-стили кнопки',
    difficulty: 'Middle',
    description:
      'Напиши функцию getButtonStyle(props), которая принимает объект { isDisabled: boolean } и возвращает строку inline-стилей. Если isDisabled === true — вернуть "opacity: 0.5; cursor: not-allowed;". Иначе — "opacity: 1; cursor: pointer;".',
    signature: 'function getButtonStyle(props: { isDisabled: boolean }): string',
    fnName: 'getButtonStyle',
    starterCode: `// Генерация inline-стилей для кнопки на основе Props
// Вход: props — объект с флагом isDisabled
// Выход: строка CSS-стилей
function getButtonStyle(props) {
  // Напиши код здесь
  return "";
}`,
    tests: [
      {
        description: 'isDisabled = true — полупрозрачная кнопка',
        args: [{ isDisabled: true }],
        expected: 'opacity: 0.5; cursor: not-allowed;',
      },
      {
        description: 'isDisabled = false — активная кнопка',
        args: [{ isDisabled: false }],
        expected: 'opacity: 1; cursor: pointer;',
      },
      {
        description: 'isDisabled не передан (undefined) — трактуем как активную',
        args: [{}],
        expected: 'opacity: 1; cursor: pointer;',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Задача 4 (Middle): Redux-редюсер корзины
  // Тип: (state, action) -> state. Добавляет ID товара в корзину.
  // ──────────────────────────────────────────────────────────
  {
    id: 4,
    title: 'Redux-редюсер корзины',
    difficulty: 'Middle',
    description:
      'Напиши функцию cartReducer(state, action), которая управляет стейтом корзины товаров. state — массив ID товаров (числа). action — объект { type: "ADD_ITEM", payload: number }. Если type === "ADD_ITEM", вернуть новый массив с добавленным payload. Для неизвестного type — вернуть state без изменений.',
    signature: 'function cartReducer(state: number[], action: { type: string; payload?: number }): number[]',
    fnName: 'cartReducer',
    starterCode: `// Симуляция Redux-редюсера для корзины товаров
// state — массив ID (числа)
// action — { type: "ADD_ITEM", payload: <id> }
function cartReducer(state, action) {
  // Напиши код здесь
  return state;
}`,
    tests: [
      {
        description: 'ADD_ITEM 42 в пустую корзину → [42]',
        args: [[], { type: 'ADD_ITEM', payload: 42 }],
        expected: [42],
      },
      {
        description: 'ADD_ITEM 7 в корзину [1, 2] → [1, 2, 7]',
        args: [[1, 2], { type: 'ADD_ITEM', payload: 7 }],
        expected: [1, 2, 7],
      },
      {
        description: 'Неизвестный action type → state без изменений',
        args: [[1, 2, 3], { type: 'UNKNOWN' }],
        expected: [1, 2, 3],
      },
      {
        description: 'ADD_ITEM в корзину с 3 элементами → 4 элемента',
        args: [[10, 20, 30], { type: 'ADD_ITEM', payload: 40 }],
        expected: [10, 20, 30, 40],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // Задача 5 (Senior): Асинхронная функция с try/catch
  // Имитация fetchUserData() с обработкой 401.
  // ──────────────────────────────────────────────────────────
  {
    id: 5,
    title: 'Async fetchUserData с 401',
    difficulty: 'Senior',
    description:
      'Напиши асинхронную функцию fetchUserData(token), которая принимает строку-токен. Если token === "valid" — вернуть объект { status: 200, data: "user_data" }. Если token !== "valid" — выбросить ошибку с сообщением "401 Unauthorized". Функция должна быть объявлена через async function и возвращать Promise.',
    signature: 'async function fetchUserData(token: string): Promise<{status: number; data: string}>',
    fnName: 'fetchUserData',
    starterCode: `// Асинхронная функция запроса данных пользователя
// token === "valid" → { status: 200, data: "user_data" }
// иначе → throw new Error("401 Unauthorized")
async function fetchUserData(token) {
  // Напиши код здесь
  return { status: 200, data: "user_data" };
}`,
    tests: [
      {
        description: 'Валидный токен → 200 OK с user_data',
        args: ['valid'],
        expected: { status: 200, data: 'user_data' },
      },
      {
        description: 'Невалидный токен → 401 Unauthorized (throw)',
        args: ['invalid'],
        expected: '401 Unauthorized',
      },
      {
        description: 'Пустой токен → 401 Unauthorized (throw)',
        args: [''],
        expected: '401 Unauthorized',
      },
      {
        description: 'Токен "expired" → 401 Unauthorized (throw)',
        args: ['expired'],
        expected: '401 Unauthorized',
      },
    ],
  },
];
