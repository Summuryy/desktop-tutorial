import type { LevelInfo, Achievement } from '@/types';

// ============================================================
// Игровая система: уровни, XP, титулы, достижения
// RPG-механика для геймификации учебного процесса
// ============================================================

// Титулы по уровням (от Trainee до Lead iOS Architect)
export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Trainee', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Junior Developer', minXp: 100, maxXp: 250 },
  { level: 3, title: 'Junior+ Developer', minXp: 250, maxXp: 450 },
  { level: 4, title: 'Middle Developer', minXp: 450, maxXp: 700 },
  { level: 5, title: 'Middle+ Developer', minXp: 700, maxXp: 1000 },
  { level: 6, title: 'Senior Developer', minXp: 1000, maxXp: 1400 },
  { level: 7, title: 'Tech Lead', minXp: 1400, maxXp: 1900 },
  { level: 8, title: 'Staff Engineer', minXp: 1900, maxXp: 2500 },
  { level: 9, title: 'Principal Engineer', minXp: 2500, maxXp: 3200 },
  { level: 10, title: 'Lead iOS Architect', minXp: 3200, maxXp: 999999 },
];

// Получить информацию об уровне по XP
export function getLevelByXp(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

// Прогресс внутри текущего уровня (0-100%)
export function getLevelProgress(xp: number): number {
  const info = getLevelByXp(xp);
  if (info.maxXp === 999999) return 100;
  return Math.round(((xp - info.minXp) / (info.maxXp - info.minXp)) * 100);
}

// XP до следующего уровня
export function getXpToNextLevel(xp: number): number {
  const info = getLevelByXp(xp);
  if (info.maxXp === 999999) return 0;
  return info.maxXp - xp;
}

// Коллекция достижений (бейджей)
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'Первые шаги',
    description: 'Посетить первый модуль обучения',
    icon: 'Footprints',
    xpReward: 10,
    unlocked: false,
  },
  {
    id: 'memory-master',
    name: 'Хозяин памяти',
    description: 'Выделить 5 ячеек памяти в модуле Memory & Types',
    icon: 'Cpu',
    xpReward: 25,
    unlocked: false,
  },
  {
    id: 'access-granted',
    name: 'Доступ разрешён',
    description: 'Получить статус 200 OK в модуле Control Flow',
    icon: 'ShieldCheck',
    xpReward: 20,
    unlocked: false,
  },
  {
    id: 'array-wizard',
    name: 'Мастер массивов',
    description: 'Добавить 5 элементов и отфильтровать список',
    icon: 'ListTree',
    xpReward: 25,
    unlocked: false,
  },
  {
    id: 'async-adept',
    name: 'Асинк-адепт',
    description: 'Успешно выполнить API-запрос и получить ответ',
    icon: 'Network',
    xpReward: 30,
    unlocked: false,
  },
  {
    id: 'code-runner',
    name: 'Код-раннер',
    description: 'Запустить код в песочнице без ошибок',
    icon: 'Play',
    xpReward: 20,
    unlocked: false,
  },
  {
    id: 'sprint-junior',
    name: 'Спринт-стартер',
    description: 'Решить первую задачу в Engineering Sprints',
    icon: 'ClipboardList',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'sprint-master',
    name: 'Спринт-мастер',
    description: 'Решить все 5 задач в Engineering Sprints',
    icon: 'Trophy',
    xpReward: 150,
    unlocked: false,
  },
  {
    id: 'jwt-guru',
    name: 'JWT-гуру',
    description: 'Сгенерировать JWT-токен и отправить запрос',
    icon: 'KeyRound',
    xpReward: 40,
    unlocked: false,
  },
  {
    id: 'merge-resolver',
    name: 'Миротворец',
    description: 'Разрешить merge conflict в Team Integration',
    icon: 'GitMerge',
    xpReward: 35,
    unlocked: false,
  },
  {
    id: 'architect-eye',
    name: 'Архитектор',
    description: 'Запустить симуляцию запроса в Architecture Visualizer',
    icon: 'Workflow',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'cyber-defender',
    name: 'Кибер-защитник',
    description: 'Отразить все атаки в CyberSec Battle Mode',
    icon: 'ShieldAlert',
    xpReward: 100,
    unlocked: false,
  },
  {
    id: 'explorer',
    name: 'Исследователь',
    description: 'Посетить все модули приложения',
    icon: 'Compass',
    xpReward: 50,
    unlocked: false,
  },
  {
    id: 'level-5',
    name: 'Middle-достижение',
    description: 'Достичь 5 уровня (Middle+ Developer)',
    icon: 'Star',
    xpReward: 75,
    unlocked: false,
  },
  {
    id: 'level-10',
    name: 'Легенда',
    description: 'Достичь максимального уровня (Lead iOS Architect)',
    icon: 'Crown',
    xpReward: 200,
    unlocked: false,
  },
];

// XP-награды за разные действия
export const XP_REWARDS = {
  MODULE_VISIT: 5,
  CHALLENGE_SOLVED_JUNIOR: 50,
  CHALLENGE_SOLVED_MIDDLE: 80,
  CHALLENGE_SOLVED_SENIOR: 120,
  SANDBOX_SUCCESS: 15,
  API_REQUEST_SUCCESS: 20,
  MEMORY_CELL_ALLOCATED: 2,
  MERGE_RESOLVED: 35,
  JWT_GENERATED: 25,
  ARCHITECTURE_SIMULATION: 40,
  CYBER_ATTACK_BLOCKED: 30,
  CYBER_ALL_BLOCKED: 100,
} as const;
