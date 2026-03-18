interface TutorialScreenProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    emoji: '🎯',
    title: 'Цель игры',
    desc: 'Стреляй шариками в кучу вверху экрана. Собери 3 шарика одного цвета подряд — они взорвутся!',
    hint: 'Тапни или кликни по экрану, чтобы выстрелить',
  },
  {
    emoji: '🌈',
    title: 'Цвета',
    desc: 'Чем выше уровень — тем больше цветов. Стреляй умно: выбирай цвета, которых много на поле.',
    hint: 'Следующий шар показан сверху справа',
  },
  {
    emoji: '⚡',
    title: 'Комбо-множитель',
    desc: 'Делай попадания быстро одно за другим! Каждое последовательное попадание увеличивает множитель очков: ×2, ×3... до ×8!',
    hint: 'Окно для комбо — 2.5 секунды',
  },
  {
    emoji: '💣',
    title: 'Бонусы',
    desc: 'Подбирай светящиеся шарики-бонусы прямо с поля, или покупай их в магазине на монеты.',
    hint: 'Бонусы активируются из нижней панели',
  },
  {
    emoji: '👾',
    title: 'Боссы',
    desc: 'Каждые 10 уровней появляется босс с несколькими HP и особыми способностями. Атакуй его шарами того же цвета!',
    hint: 'Используй бонусы против боссов',
  },
  {
    emoji: '⬇️',
    title: 'Поле падает',
    desc: 'Со временем поле опускается вниз. Если шарики достигнут зоны стрелка — ты потеряешь жизнь. Не дай полю упасть!',
    hint: 'Заморозка и замедление помогут выиграть время',
  },
];

export default function TutorialScreen({ step, onNext, onSkip }: TutorialScreenProps) {
  const s = STEPS[Math.min(step, STEPS.length - 1)];
  const isLast = step >= STEPS.length - 1;

  return (
    <div className="flex flex-col h-full w-full game-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(155,48,255,0.3)' }}>
        <h2 className="text-2xl font-russo neon-text-purple">📖 ОБУЧЕНИЕ</h2>
        <button onClick={onSkip} className="text-xs font-russo px-3 py-1 rounded-full border active:scale-95 transition-all"
          style={{ color: 'rgba(155,48,255,0.6)', borderColor: 'rgba(155,48,255,0.3)' }}>
          ПРОПУСТИТЬ
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-3">
        {STEPS.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i === step ? 'var(--neon-purple)' : i < step ? 'rgba(155,48,255,0.5)' : 'rgba(155,48,255,0.15)',
              boxShadow: i === step ? '0 0 8px var(--neon-purple)' : 'none',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
            }} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 animate-fade-in-up">
        <div className="text-8xl animate-neon-pulse">{s.emoji}</div>

        <div className="text-center">
          <h3 className="text-2xl font-russo neon-text-cyan mb-3">{s.title}</h3>
          <p className="font-rubik text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {s.desc}
          </p>
        </div>

        <div className="w-full px-4 py-3 rounded-xl border text-sm font-rubik text-center"
          style={{
            background: 'rgba(0,229,255,0.06)',
            borderColor: 'rgba(0,229,255,0.25)',
            color: 'rgba(0,229,255,0.8)',
          }}>
          💡 {s.hint}
        </div>
      </div>

      {/* Next */}
      <div className="px-6 py-6">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl font-russo text-xl active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #9b30ff, #00e5ff)',
            color: '#fff',
            boxShadow: '0 0 25px rgba(155,48,255,0.4)',
          }}
        >
          {isLast ? '🚀 НАЧАТЬ ИГРУ' : `ДАЛЕЕ (${step + 1}/${STEPS.length})`}
        </button>
      </div>
    </div>
  );
}
