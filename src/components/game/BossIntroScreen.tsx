interface BossIntroProps {
  level: number;
  onContinue: () => void;
}

const BOSS_QUOTES = [
  'Думал, что можешь справиться с этим?',
  'Твои шарики меня не остановят!',
  'Я — босс этого уровня. Бойся.',
  'Сколько раз ни стреляй — я выживу!',
  'Пора показать тебе настоящую силу!',
];

export default function BossIntroScreen({ level, onContinue }: BossIntroProps) {
  const quote = BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full game-bg relative overflow-hidden">
      {/* Warning pulses */}
      <div className="absolute inset-0 animate-neon-pulse"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,45,85,0.15), transparent 70%)' }} />

      <div className="flex flex-col items-center gap-6 px-8 text-center z-10 animate-fade-in-up">
        <div className="text-8xl animate-boss-appear">👾</div>

        <div>
          <div className="text-xs font-russo mb-1" style={{ color: 'rgba(255,45,85,0.7)', letterSpacing: '0.3em' }}>
            УРОВЕНЬ {level}
          </div>
          <h2 className="text-4xl font-russo animate-neon-pulse" style={{
            color: '#ff2d55',
            textShadow: '0 0 20px #ff2d55, 0 0 60px #ff2d55',
          }}>
            ЯВИЛСЯ БОСС!
          </h2>
        </div>

        <div className="px-5 py-3 rounded-xl border text-sm font-rubik italic"
          style={{
            background: 'rgba(255,45,85,0.1)',
            borderColor: 'rgba(255,45,85,0.4)',
            color: '#ffb3c1',
          }}>
          «{quote}»
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { icon: '🛡️', label: 'Особый щит' },
            { icon: '💀', label: 'Несколько HP' },
            { icon: '⚡', label: 'Спецспособность' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border"
              style={{ background: 'rgba(255,45,85,0.08)', borderColor: 'rgba(255,45,85,0.2)', color: '#ffb3c1' }}>
              <span className="text-2xl">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl font-russo text-xl active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #ff2d55, #9b30ff)',
            boxShadow: '0 0 30px rgba(255,45,85,0.5)',
            color: '#fff',
          }}
        >
          ⚔️ В БОЙ!
        </button>
      </div>
    </div>
  );
}
