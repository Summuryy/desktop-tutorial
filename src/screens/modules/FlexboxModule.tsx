import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Rows3,
  Columns3,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignVerticalSpaceBetween,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignVerticalJustifyStart,
  RotateCcw,
} from 'lucide-react';
import TechDoc from '@/components/TechDoc';
import { useGame } from '@/context/GameContext';

// ============================================================
// Модуль 11: Интерфейс смартфона и верстка (Flexbox)
// Расширенная теория, интерактивный визуальный конструктор,
// 5 практических задач на верстку экрана профиля.
// ============================================================

// ── Типы для Flexbox-конструктора ───────────────────────────

type FlexDirection = 'row' | 'column';
type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch';

interface FlexConfig {
  flexDirection: FlexDirection;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  gap: number;
  padding: number;
}

// ── Практические задачи ─────────────────────────────────────

interface LayoutTask {
  id: number;
  level: string;
  title: string;
  description: string;
  hint: string;
  target: FlexConfig;
  validate: (config: FlexConfig) => { ok: boolean; message: string };
}

const LAYOUT_TASKS: LayoutTask[] = [
  {
    id: 1,
    level: 'Junior-0',
    title: 'Расположить элементы в колонку (column)',
    description:
      'Установите flex-direction в column. Элементы выстроятся вертикально сверху вниз — ' +
      'это стандартное расположение для экрана мобильного приложения: аватар, имя, кнопки.',
    hint: 'Нажмите кнопку «Column» в блоке flex-direction.',
    target: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, padding: 16 },
    validate: (c) =>
      c.flexDirection === 'column'
        ? { ok: true, message: 'Элементы выстроены вертикально! Column — основа мобильной верстки.' }
        : { ok: false, message: 'Выберите flex-direction: column.' },
  },
  {
    id: 2,
    level: 'Junior-0',
    title: 'Выровнять элементы по центру (align-items: center)',
    description:
      'При column-направлении align-items управляет горизонтальным выравниванием. ' +
      'Установите align-items в center — все элементы отцентрируются по горизонтали. ' +
      'Это типично для экрана профиля: аватар и имя по центру.',
    hint: 'Сначала выберите column, затем нажмите «Center» в блоке align-items.',
    target: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, padding: 16 },
    validate: (c) =>
      c.flexDirection === 'column' && c.alignItems === 'center'
        ? { ok: true, message: 'Элементы отцентрированы! align-items: center выравнивает по горизонтали.' }
        : { ok: false, message: 'Нужно: column + align-items: center.' },
  },
  {
    id: 3,
    level: 'Junior',
    title: 'Распределить элементы равномерно (justify-content: space-between)',
    description:
      'Установите justify-content в space-between. Элементы распределятся равномерно — ' +
      'первый прижмётся к началу, последний к концу, остальные между. ' +
      'Это паттерн для navbar: логотип слева, меню справа.',
    hint: 'Выберите justify-content: space-between.',
    target: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 16 },
    validate: (c) =>
      c.justifyContent === 'space-between'
        ? { ok: true, message: 'Space-between распределил элементы равномерно! Паттерн navbar.' }
        : { ok: false, message: 'Выберите justify-content: space-between.' },
  },
  {
    id: 4,
    level: 'Junior',
    title: 'Собрать экран профиля: column + center + gap 16',
    description:
      'Соберите полноценный экран профиля: flex-direction: column (вертикально), ' +
      'align-items: center (по центру), gap: 16 (отступы между элементами). ' +
      'Это базовая раскладка экрана профиля пользователя в мобильном приложении.',
    hint: 'Column + align-items: center + gap 16px.',
    target: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 16, padding: 16 },
    validate: (c) =>
      c.flexDirection === 'column' && c.alignItems === 'center' && c.gap === 16
        ? { ok: true, message: 'Экран профиля собран! Column + center + gap 16 — классическая раскладка.' }
        : { ok: false, message: 'Нужно: column + align-items: center + gap 16px.' },
  },
  {
    id: 5,
    level: 'Junior+',
    title: 'Собрать navbar: row + space-between + align center',
    description:
      'Соберите навигационную панель (navbar): flex-direction: row (горизонтально), ' +
      'justify-content: space-between (логотип слева, меню справа), ' +
      'align-items: center (вертикально по центру), gap: 8. ' +
      'Это самый частый паттерн в мобильных и веб-приложениях.',
    hint: 'Row + justify: space-between + align: center + gap 8.',
    target: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 16 },
    validate: (c) =>
      c.flexDirection === 'row' &&
      c.justifyContent === 'space-between' &&
      c.alignItems === 'center' &&
      c.gap === 8
        ? { ok: true, message: 'Navbar готов! Row + space-between + center — классический паттерн навигации.' }
        : { ok: false, message: 'Нужно: row + space-between + align center + gap 8.' },
  },
];

// ── Компонент задачи ────────────────────────────────────────

function LayoutTaskCard({
  task,
  config,
  onApplyTarget,
}: {
  task: LayoutTask;
  config: FlexConfig;
  onApplyTarget: (task: LayoutTask) => void;
}) {
  const result = useMemo(() => task.validate(config), [task, config]);

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        result.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30'
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
          {result.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          <span>{result.message}</span>
        </div>
      </div>

      {!result.ok && (
        <div className="pl-10 mt-2">
          <button
            onClick={() => onApplyTarget(task)}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Применить целевую конфигурацию
          </button>
        </div>
      )}
    </div>
  );
}

// ── Моковые элементы UI для превью ──────────────────────────

const MOCK_UI_ELEMENTS = [
  { id: 'avatar', label: 'Avatar', height: 64, isCircle: true },
  { id: 'name', label: 'Name', height: 24, isCircle: false },
  { id: 'bio', label: 'Bio', height: 18, isCircle: false },
  { id: 'btn1', label: 'Edit', height: 36, isCircle: false },
  { id: 'btn2', label: 'Share', height: 36, isCircle: false },
];

// ── Кнопки-переключатели ────────────────────────────────────

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Rows3;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-mono font-medium border transition-all duration-200 ${
        active
          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
          : 'bg-slate-900/40 border-slate-800 text-slate-600 hover:border-slate-700'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Основной компонент ──────────────────────────────────────

export default function FlexboxModule() {
  const { addXp } = useGame();

  const [config, setConfig] = useState<FlexConfig>({
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  });

  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const prevCompletedRef = useRef<Set<number>>(new Set());

  const updateConfig = (patch: Partial<FlexConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const resetConfig = () => {
    setConfig({ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, padding: 16 });
  };

  const applyTarget = (task: LayoutTask) => {
    setConfig(task.target);
  };

  // Вычисление результатов задач
  const taskResults = LAYOUT_TASKS.map((task) => task.validate(config).ok);
  const completedSet = new Set(taskResults.map((r, i) => (r ? i + 1 : -1)).filter((n) => n > 0));

  useEffect(() => {
    const diff = completedSet.size - prevCompletedRef.current.size;
    if (diff > 0) {
      addXp(diff * 10, 'Выполнена практическая задача по Flexbox');
    }
    prevCompletedRef.current = completedSet;
    setCompletedTasks(completedSet);
  }, [completedSet.size, addXp]);

  const allDone = completedSet.size === LAYOUT_TASKS.length;

  // CSS-стили для превью
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: config.flexDirection,
    justifyContent: config.justifyContent,
    alignItems: config.alignItems,
    gap: `${config.gap}px`,
    padding: `${config.padding}px`,
    height: '100%',
    width: '100%',
  };

  // Генерация CSS-кода для отображения
  const cssCode = `.container {
  display: flex;
  flex-direction: ${config.flexDirection};
  justify-content: ${config.justifyContent};
  align-items: ${config.alignItems};
  gap: ${config.gap}px;
  padding: ${config.padding}px;
}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Интерфейс смартфона и верстка (Flexbox)</h2>
          <p className="text-[12px] text-slate-500 font-mono">
            flex-direction · justify-content · align-items · gap · padding
          </p>
        </div>
      </div>

      {/* ── Расширенная теория ──────────────────────────────── */}
      <TechDoc
        title="Техническая документация — Полный курс"
        sections={[
          {
            heading: 'Как строится экран мобильного приложения',
            body: (
              <div className="space-y-2">
                <p>
                  Экран мобильного приложения — это дерево вложенных контейнеров. Каждый экран
                  состоит из прямоугольных блоков: statusBar, header, контент, tabBar. Внутри
                  контента — карточки, списки, кнопки. Внутри кнопок — иконка и текст. Всё это
                  вкладывается друг в друга как матрёшка.
                </p>
                <p>
                  Каждый контейнер решает две задачи: <strong>расположить своих детей</strong>{' '}
                  (внутренние элементы) и <strong>занять место</strong> в родителе. Flexbox —
                  самый распространённый способ решения обеих задач. В React Native и Flutter
                  Flexbox — основная система раскладки. В Swift — SwiftUI HStack/VStack работают
                  по тем же принципам.
                </p>
                <p>
                  Главное правило Flexbox: есть <strong>контейнер</strong> (flex container) и
                  есть <strong>дети</strong> (flex items). Контейнер задаёт направление и
                  выравнивание, дети — занимают место согласно правилам. В CSS это{' '}
                  <span className="font-mono text-slate-300">display: flex</span>, в React Native
                  все <span className="font-mono">View</span> по умолчанию flex.
                </p>
                <p>
                  Представьте книжную полку: полка — контейнер, книги — дети. Вы можете поставить
                  книги в ряд (row) или стопкой (column). Выровнять по левому краю, по центру или
                  равномерно. Это и есть Flexbox.
                </p>
              </div>
            ),
          },
          {
            heading: 'flex-direction — главная ось контейнера',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-cyan-400">flex-direction</span> определяет
                  главную ось — направление, вдоль которого выстраиваются дочерние элементы.
                  Две основных значения:
                </p>
                <p>
                  <span className="font-mono text-slate-300">row</span> — элементы выстраиваются
                  в строку слева направо. Используется для горизонтальных раскладок: navbar,
                  список тегов, ряд кнопок. В SwiftUI аналог —{' '}
                  <span className="font-mono text-slate-300">HStack</span>.
                </p>
                <p>
                  <span className="font-mono text-slate-300">column</span> — элементы
                  выстраиваются в колонку сверху вниз. Это направление по умолчанию в мобильной
                  разработке: экраны обычно прокручиваются вертикально. В SwiftUI —{' '}
                  <span className="font-mono text-slate-300">VStack</span>.
                </p>
                <p>
                  Дополнительные значения: <span className="font-mono">row-reverse</span> (справа
                  налево) и <span className="font-mono">column-reverse</span> (снизу вверх) —
                  используются редко, в основном для RTL-языков (арабский, иврит).
                </p>
                <p>
                  Важно: flex-direction определяет <strong>главную ось</strong>. Все остальные
                  свойства (justify-content, align-items) работают относительно этой оси. При
                  row — главная ось горизонтальная, поперечная вертикальная. При column —
                  наоборот.
                </p>
              </div>
            ),
          },
          {
            heading: 'justify-content — распределение по главной оси',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-cyan-400">justify-content</span> распределяет
                  дочерние элементы вдоль <strong>главной оси</strong> (той, что задаёт
                  flex-direction). Пять значений:
                </p>
                <p>
                  <span className="font-mono text-slate-300">flex-start</span> — элементы
                  прижимаются к началу оси (по умолчанию). При column — к верху, при row — к
                  левому краю.
                </p>
                <p>
                  <span className="font-mono text-slate-300">center</span> — элементы
                  группируются по центру оси. Используется для центрирования контента: заголовок
                  по центру, кнопки в ряд по центру.
                </p>
                <p>
                  <span className="font-mono text-slate-300">flex-end</span> — элементы
                  прижимаются к концу оси. При column — к низу, при row — к правому краю.
                </p>
                <p>
                  <span className="font-mono text-slate-300">space-between</span> — первый
                  элемент в начале, последний в конце, остальные равномерно между. Паттерн для
                  navbar: логотип слева, меню справа.
                </p>
                <p>
                  <span className="font-mono text-slate-300">space-around</span> — каждый элемент
                  получает одинаковое пространство вокруг себя (вдвое больше по краям). Менее
                  частый вариант, используется для равномерного распределения иконок.
                </p>
              </div>
            ),
          },
          {
            heading: 'align-items — выравнивание по поперечной оси',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-cyan-400">align-items</span> выравнивает
                  дочерние элементы вдоль <strong>поперечной оси</strong> — перпендикулярной к
                  главной. Если flex-direction: row, то align-items управляет вертикальным
                  выравниванием. Если column — горизонтальным.
                </p>
                <p>
                  <span className="font-mono text-slate-300">flex-start</span> — элементы
                  прижимаются к началу поперечной оси. При column — к левому краю, при row — к
                  верху.
                </p>
                <p>
                  <span className="font-mono text-slate-300">center</span> — элементы
                  центрируются по поперечной оси. Это самое частое значение: центрировать
                  контент по горизонтали (при column) или по вертикали (при row).
                </p>
                <p>
                  <span className="font-mono text-slate-300">flex-end</span> — элементы
                  прижимаются к концу поперечной оси.
                </p>
                <p>
                  <span className="font-mono text-slate-300">stretch</span> — элементы
                  растягиваются на всю длину поперечной оси. Полезно для колонок одинаковой
                  ширины или рядов одинаковой высоты. Например, кнопки на всю ширину экрана.
                </p>
                <p>
                  Лайфхак: <span className="font-mono">justify-content: center</span> +{' '}
                  <span className="font-mono">align-items: center</span> центрирует элемент
                  идеально по обеим осям. Это самый частый паттерн для центрирования модальных
                  окон и сплэш-экранов.
                </p>
              </div>
            ),
          },
          {
            heading: 'gap, padding, margin — отступы и расстояния',
            body: (
              <div className="space-y-2">
                <p>
                  <span className="font-mono text-cyan-400">gap</span> — расстояние между
                  дочерними элементами flex-контейнера. Не нужно задавать margin каждому элементу
                  отдельно — gap делает это автоматически. В React Native:{' '}
                  <span className="font-mono text-slate-300">gap: 12</span> в style контейнера.
                  В SwiftUI: <span className="font-mono text-slate-300">VStack(spacing: 12)</span>.
                </p>
                <p>
                  <span className="font-mono text-cyan-400">padding</span> — внутренний отступ
                  контейнера: расстояние от границы элемента до его содержимого.{' '}
                  <span className="font-mono text-slate-300">padding: 16</span> — 16px со всех
                  сторон. Можно задать асимметрично:{' '}
                  <span className="font-mono text-slate-300">padding: 16px 8px 16px 8px</span>{' '}
                  (верх, право, низ, лево). Padding увеличивает размер элемента.
                </p>
                <p>
                  <span className="font-mono text-cyan-400">margin</span> — внешний отступ:
                  расстояние от границы элемента до соседних элементов. Margin не увеличивает
                  размер элемента, но отталкивает соседей. В flex-контейнере вместо margin между
                  детьми лучше использовать gap — чище и предсказуемее.
                </p>
                <p>
                  Правило 8px: в мобильном дизайне принята сетка отступов кратная 8: 8, 16, 24,
                  32, 40px. Это создаёт ритм и гармонию. Material Design (Android) и Human
                  Interface Guidelines (iOS) обе используют 8px-сетку. Не используйте случайные
                  значения вроде 13px или 7px — они ломают визуальный ритм.
                </p>
              </div>
            ),
          },
          {
            heading: 'Flexbox в разных фреймворках — сравнение',
            body: (
              <div className="space-y-2">
                <p>
                  <strong className="text-slate-300">CSS / Web:</strong>{' '}
                  <span className="font-mono text-slate-300">display: flex; flex-direction: column;
                  justify-content: center; align-items: center; gap: 16px;</span>. Все свойства
                  в одном CSS-правиле.
                </p>
                <p>
                  <strong className="text-slate-300">React Native:</strong> каждый{' '}
                  <span className="font-mono text-slate-300">View</span> — flex-контейнер по
                  умолчанию. <span className="font-mono text-slate-300">flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center'</span>. flexDirection по умолчанию
                  column (а не row, как в CSS) — потому что мобильные экраны вертикальные.
                </p>
                <p>
                  <strong className="text-slate-300">SwiftUI (iOS):</strong>{' '}
                  <span className="font-mono text-slate-300">VStack(spacing: 16) &#123; ... &#125;</span>{' '}
                  — аналог column. <span className="font-mono text-slate-300">HStack(spacing: 8)</span> —
                  аналог row. Выравнивание: <span className="font-mono">.frame(maxWidth: .infinity,
                  alignment: .center)</span>. SwiftUI скрывает Flexbox за декларативным синтаксисом,
                  но концепция та же.
                </p>
                <p>
                  <strong className="text-slate-300">Flutter:</strong>{' '}
                  <span className="font-mono text-slate-300">Column(mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center)</span>. mainAxisAlignment =
                  justify-content, crossAxisAlignment = align-items. Имена другие, механика та же.
                </p>
              </div>
            ),
          },
          {
            heading: 'Типичные ошибки новичков в верстке',
            body: (
              <div className="space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">1. Путают justify-content и align-items.</strong>{' '}
                    justify-content — главная ось, align-items — поперечная. При column: justify =
                    вертикаль, align = горизонталь. При row — наоборот. Запомните: justify всегда
                    вдоль flex-direction.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">2. Margin вместо gap.</strong>{' '}
                    Задают margin каждому элементу, забывая про последний (лишний отступ).
                    gap решает это автоматически — отступ только между элементами.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">3. Не знают, как центрировать.</strong>{' '}
                    Идеальное центрирование: <span className="font-mono">justify-content: center</span> +{' '}
                    <span className="font-mono">align-items: center</span>. Это центрирует по обеим
                    осям. Самый частый паттерн в верстке.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">4. Игнорируют 8px-сетку.</strong>{' '}
                    Случайные отступы (7, 13, 22px) ломают ритм. Держитесь 8/16/24/32 — это
                    стандарт Material Design и Apple HIG.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500/70 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">5. Забывают про responsive.</strong>{' '}
                    Экраны разные: 320px (iPhone SE) и 430px (iPhone 15 Pro Max). Flexbox
                    адаптируется автоматически, но нужно тестировать на разных размерах. Используйте
                    <span className="font-mono"> flex-wrap: wrap</span> для переноса элементов на
                    маленьких экранах.
                  </span>
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
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Практические задачи — 5 шагов
          </h3>
        </div>
        <p className="text-[11px] text-slate-600 mb-4">
          Настраивайте Flexbox-конструктор ниже. Каждая задача проверяет конфигурацию автоматически.
        </p>

        {/* Прогресс */}
        <div className="flex items-center gap-1.5 mb-4">
          {LAYOUT_TASKS.map((task) => {
            const done = taskResults[task.id - 1];
            return (
              <div
                key={task.id}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  done ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
                style={done ? { boxShadow: '0 0 6px rgba(16,185,129,0.4)' } : undefined}
              />
            );
          })}
        </div>

        <div className="space-y-2.5">
          {LAYOUT_TASKS.map((task) => (
            <LayoutTaskCard key={task.id} task={task} config={config} onApplyTarget={applyTarget} />
          ))}
        </div>

        {allDone && (
          <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-[12px] text-emerald-300">
              Все 5 задач выполнены! Вы освоили Flexbox-верстку мобильных интерфейсов.
            </p>
          </div>
        )}
      </div>

      {/* ── Интерактивный конструктор ───────────────────────── */}
      <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Визуальный Flexbox-конструктор
          </h3>
          <button
            onClick={resetConfig}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Сброс
          </button>
        </div>

        {/* Панель управления + превью */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Левая часть — контролы */}
          <div className="space-y-4">
            {/* flex-direction */}
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                flex-direction
              </p>
              <div className="flex gap-2">
                <ToggleButton
                  active={config.flexDirection === 'row'}
                  onClick={() => updateConfig({ flexDirection: 'row' })}
                  icon={Columns3}
                  label="row"
                />
                <ToggleButton
                  active={config.flexDirection === 'column'}
                  onClick={() => updateConfig({ flexDirection: 'column' })}
                  icon={Rows3}
                  label="column"
                />
              </div>
            </div>

            {/* justify-content */}
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                justify-content
              </p>
              <div className="flex flex-wrap gap-2">
                <ToggleButton active={config.justifyContent === 'flex-start'} onClick={() => updateConfig({ justifyContent: 'flex-start' })} icon={AlignStartVertical} label="flex-start" />
                <ToggleButton active={config.justifyContent === 'center'} onClick={() => updateConfig({ justifyContent: 'center' })} icon={AlignCenterVertical} label="center" />
                <ToggleButton active={config.justifyContent === 'flex-end'} onClick={() => updateConfig({ justifyContent: 'flex-end' })} icon={AlignEndVertical} label="flex-end" />
                <ToggleButton active={config.justifyContent === 'space-between'} onClick={() => updateConfig({ justifyContent: 'space-between' })} icon={AlignVerticalSpaceBetween} label="space-between" />
              </div>
            </div>

            {/* align-items */}
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                align-items
              </p>
              <div className="flex flex-wrap gap-2">
                <ToggleButton active={config.alignItems === 'flex-start'} onClick={() => updateConfig({ alignItems: 'flex-start' })} icon={AlignStartHorizontal} label="flex-start" />
                <ToggleButton active={config.alignItems === 'center'} onClick={() => updateConfig({ alignItems: 'center' })} icon={AlignCenterHorizontal} label="center" />
                <ToggleButton active={config.alignItems === 'flex-end'} onClick={() => updateConfig({ alignItems: 'flex-end' })} icon={AlignEndHorizontal} label="flex-end" />
                <ToggleButton active={config.alignItems === 'stretch'} onClick={() => updateConfig({ alignItems: 'stretch' })} icon={AlignVerticalJustifyStart} label="stretch" />
              </div>
            </div>

            {/* gap */}
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                gap: <span className="text-cyan-400">{config.gap}px</span>
              </p>
              <input
                type="range"
                min={0}
                max={32}
                step={4}
                value={config.gap}
                onChange={(e) => updateConfig({ gap: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* padding */}
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                padding: <span className="text-cyan-400">{config.padding}px</span>
              </p>
              <input
                type="range"
                min={0}
                max={32}
                step={4}
                value={config.padding}
                onChange={(e) => updateConfig({ padding: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* CSS-код */}
            <div className="rounded-lg bg-slate-950/80 border border-slate-800 px-4 py-3">
              <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">
                CSS
              </p>
              <pre className="text-[11px] font-mono text-emerald-300/80 leading-relaxed whitespace-pre-wrap">
                {cssCode}
              </pre>
            </div>
          </div>

          {/* Правая часть — превью экрана смартфона */}
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
              Preview
            </p>
            {/* Рамка смартфона */}
            <div className="relative w-[260px] h-[460px] rounded-[2rem] border-4 border-slate-700 bg-[#0B0F19] overflow-hidden shadow-2xl">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-700 rounded-b-xl z-10" />
              {/* Экран */}
              <div className="absolute inset-0 pt-7 pb-2 px-1">
                <div
                  className="w-full h-full rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden transition-all duration-300"
                  style={containerStyle}
                >
                  {MOCK_UI_ELEMENTS.map((el) => (
                    <div
                      key={el.id}
                      className={`bg-slate-800/60 border border-slate-700 flex items-center justify-center transition-all duration-300 ${
                        el.isCircle ? 'rounded-full' : 'rounded-lg'
                      }`}
                      style={{
                        height: el.isCircle ? `${el.height}px` : undefined,
                        width: el.isCircle ? `${el.height}px` : undefined,
                        minHeight: config.alignItems === 'stretch' && !el.isCircle ? undefined : `${el.height}px`,
                        padding: el.isCircle ? '0' : '0 12px',
                      }}
                    >
                      <span className="text-[10px] font-mono text-slate-400 truncate">{el.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Подпись осей */}
            <div className="mt-3 text-center">
              <p className="text-[10px] font-mono text-slate-600">
                main: {config.flexDirection === 'row' ? '→ justify' : '↓ justify'}
              </p>
              <p className="text-[10px] font-mono text-slate-600">
                cross: {config.flexDirection === 'row' ? '↓ align' : '→ align'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
