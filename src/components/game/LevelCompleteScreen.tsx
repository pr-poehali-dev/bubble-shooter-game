interface LevelCompleteProps {
  level: number;
  score: number;
  bossDefeated: boolean;
  coinsEarned: number;
  onNext: () => void;
  onMenu: () => void;
}

export default function LevelCompleteScreen({ level, score, bossDefeated, coinsEarned, onNext, onMenu }: LevelCompleteProps) {
  const stars = bossDefeated ? 3 : score > 1000 ? 3 : score > 500 ? 2 : 1;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full game-bg relative overflow-hidden">
      <div className="absolute inset-0 animate-neon-pulse"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.12), transparent 70%)' }} />

      <div className="flex flex-col items-center gap-5 px-8 text-center z-10 w-full max-w-xs animate-fade-in-up">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-4xl transition-all ${i < stars ? 'animate-neon-pulse' : 'opacity-20'}`}
              style={{ animationDelay: `${i * 0.2}s` }}>
              ⭐
            </span>
          ))}
        </div>

        <div>
          {bossDefeated && (
            <div className="text-sm font-russo mb-1" style={{ color: '#9b30ff' }}>👾 БОСС ПОВЕРЖЕН!</div>
          )}
          <h2 className="text-4xl font-russo neon-text-green">УРОВЕНЬ<br/>ПРОЙДЕН!</h2>
          <p className="text-sm mt-1 font-rubik" style={{ color: 'rgba(255,255,255,0.5)' }}>Уровень {level}</p>
        </div>

        <div className="w-full rounded-2xl p-4 border"
          style={{ background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.25)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center">
              <div className="text-xs font-rubik" style={{ color: 'rgba(255,255,255,0.4)' }}>СЧЁТ</div>
              <div className="text-2xl font-russo neon-text-cyan">{score.toLocaleString()}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs font-rubik" style={{ color: 'rgba(255,255,255,0.4)' }}>МОНЕТЫ</div>
              <div className="text-2xl font-russo neon-text-yellow">+{coinsEarned} 🪙</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl font-russo text-xl active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
              color: '#060912',
              boxShadow: '0 0 25px rgba(0,255,136,0.5)',
            }}
          >
            ▶ УРОВЕНЬ {level + 1}
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 rounded-2xl font-russo text-base active:scale-95 transition-all border"
            style={{
              background: 'rgba(0,255,136,0.08)',
              borderColor: 'rgba(0,255,136,0.25)',
              color: '#b3ffe0',
            }}
          >
            🏠 МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
}
