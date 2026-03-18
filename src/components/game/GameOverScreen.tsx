interface GameOverProps {
  score: number;
  highScore: number;
  level: number;
  totalShots: number;
  totalHits: number;
  onRestart: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ score, highScore, level, totalShots, totalHits, onRestart, onMenu }: GameOverProps) {
  const isNewRecord = score >= highScore && score > 0;
  const accuracy = totalShots > 0 ? Math.round((totalHits / totalShots) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full game-bg relative overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,45,85,0.1), transparent 70%)' }} />

      <div className="flex flex-col items-center gap-5 px-8 text-center z-10 w-full max-w-xs animate-fade-in-up">
        <div className="text-6xl">💥</div>

        <div>
          <h2 className="text-4xl font-russo" style={{ color: '#ff2d55', textShadow: '0 0 20px #ff2d55' }}>
            ИГРА ОКОНЧЕНА
          </h2>
          <p className="text-sm mt-1 font-rubik" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Уровень {level}
          </p>
        </div>

        {isNewRecord && (
          <div className="px-5 py-2 rounded-full font-russo text-sm animate-neon-pulse"
            style={{ background: 'rgba(255,230,0,0.15)', border: '1px solid rgba(255,230,0,0.5)', color: '#ffe600' }}>
            🏆 НОВЫЙ РЕКОРД!
          </div>
        )}

        {/* Stats */}
        <div className="w-full rounded-2xl p-4 border"
          style={{ background: 'rgba(155,48,255,0.08)', borderColor: 'rgba(155,48,255,0.25)' }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'СЧЁТ', value: score.toLocaleString(), color: '#00e5ff' },
              { label: 'РЕКОРД', value: highScore.toLocaleString(), color: '#ffe600' },
              { label: 'ВЫСТРЕЛОВ', value: totalShots, color: '#9b30ff' },
              { label: 'ТОЧНОСТЬ', value: `${accuracy}%`, color: '#00ff88' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-xs font-rubik" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                <div className="text-xl font-russo" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onRestart}
            className="w-full py-4 rounded-2xl font-russo text-xl active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #9b30ff, #ff2d78)',
              boxShadow: '0 0 25px rgba(155,48,255,0.5)',
              color: '#fff',
            }}
          >
            🔄 СНАЧАЛА
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 rounded-2xl font-russo text-base active:scale-95 transition-all border"
            style={{
              background: 'rgba(155,48,255,0.1)',
              borderColor: 'rgba(155,48,255,0.3)',
              color: '#e0c8ff',
            }}
          >
            🏠 МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
}
