interface MenuScreenProps {
  highScore: number;
  onPlay: () => void;
  onTutorial: () => void;
  onRecords: () => void;
  onShop: () => void;
  onSettings: () => void;
}

export default function MenuScreen({ highScore, onPlay, onTutorial, onRecords, onShop, onSettings }: MenuScreenProps) {
  return (
    <div className="flex flex-col items-center justify-between h-full w-full px-6 py-8 game-bg relative overflow-hidden">
      {/* Decorative neon orbs */}
      <div className="absolute top-16 left-8 w-32 h-32 rounded-full opacity-20 animate-neon-pulse"
        style={{ background: 'radial-gradient(circle, #9b30ff, transparent)' }} />
      <div className="absolute top-32 right-6 w-24 h-24 rounded-full opacity-15 animate-neon-pulse"
        style={{ background: 'radial-gradient(circle, #00e5ff, transparent)', animationDelay: '0.5s' }} />
      <div className="absolute bottom-40 left-4 w-20 h-20 rounded-full opacity-15 animate-neon-pulse"
        style={{ background: 'radial-gradient(circle, #ff2d78, transparent)', animationDelay: '1s' }} />

      {/* Header */}
      <div className="flex flex-col items-center pt-4 animate-fade-in-up">
        <div className="flex gap-2 mb-2">
          {['🔴','🟡','🟢','🔵','🟣'].map((e, i) => (
            <span key={i} className="text-2xl animate-neon-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
          ))}
        </div>
        <h1 className="font-russo text-5xl tracking-wider neon-text-purple leading-tight text-center">
          НЕОНО<br/>СФЕРА
        </h1>
        <p className="text-sm mt-2 font-rubik" style={{ color: 'var(--neon-cyan)' }}>
          Аркадный шутер по шарикам
        </p>
        {highScore > 0 && (
          <div className="mt-3 px-4 py-1 rounded-full border neon-border-cyan text-xs font-russo neon-text-cyan">
            🏆 РЕКОРД: {highScore.toLocaleString()}
          </div>
        )}
      </div>

      {/* Main button */}
      <div className="flex flex-col gap-4 w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={onPlay}
          className="w-full py-5 rounded-2xl font-russo text-2xl text-black transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #9b30ff, #ff2d78)',
            boxShadow: '0 0 30px rgba(155,48,255,0.6), 0 0 60px rgba(255,45,120,0.3)',
          }}
        >
          🚀 ИГРАТЬ
        </button>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '📖 Обучение', fn: onTutorial },
            { label: '🏆 Рекорды', fn: onRecords },
            { label: '🛍️ Магазин', fn: onShop },
            { label: '⚙️ Настройки', fn: onSettings },
          ].map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="py-3 rounded-xl font-russo text-sm transition-all active:scale-95 border"
              style={{
                background: 'rgba(155,48,255,0.12)',
                borderColor: 'rgba(155,48,255,0.4)',
                color: '#e0c8ff',
                boxShadow: '0 0 12px rgba(155,48,255,0.2)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-center animate-fade-in-up" style={{ color: 'rgba(155,48,255,0.5)', animationDelay: '0.4s' }}>
        Сделано с ❤️ на Поехали!
      </div>
    </div>
  );
}
