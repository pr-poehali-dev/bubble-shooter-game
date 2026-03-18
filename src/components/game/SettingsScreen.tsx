import type { GameSettings } from '@/game/types';

interface SettingsScreenProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  onBack: () => void;
}

interface ToggleRowProps {
  label: string;
  emoji: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, emoji, value, onChange }: ToggleRowProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all active:scale-98"
      style={{
        background: value ? 'rgba(155,48,255,0.12)' : 'rgba(155,48,255,0.04)',
        borderColor: value ? 'rgba(155,48,255,0.4)' : 'rgba(155,48,255,0.15)',
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <span className="font-russo text-sm" style={{ color: value ? '#e0c8ff' : 'rgba(255,255,255,0.4)' }}>
          {label}
        </span>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-all ${value ? '' : ''}`}
        style={{
          background: value ? 'linear-gradient(135deg, #9b30ff, #ff2d78)' : 'rgba(255,255,255,0.1)',
          boxShadow: value ? '0 0 12px rgba(155,48,255,0.5)' : 'none',
        }}>
        <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: value ? 'calc(100% - 20px)' : '4px' }} />
      </div>
    </button>
  );
}

export default function SettingsScreen({ settings, onChange, onBack }: SettingsScreenProps) {
  return (
    <div className="flex flex-col h-full w-full game-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(155,48,255,0.3)' }}>
        <button onClick={onBack} className="p-2 rounded-xl active:scale-90 transition-all"
          style={{ color: 'rgba(155,48,255,0.7)', background: 'rgba(155,48,255,0.1)' }}>
          ←
        </button>
        <h2 className="text-2xl font-russo neon-text-purple">⚙️ НАСТРОЙКИ</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <ToggleRow label="Звук" emoji="🔊" value={settings.soundEnabled} onChange={v => onChange({ soundEnabled: v })} />
        <ToggleRow label="Музыка" emoji="🎵" value={settings.musicEnabled} onChange={v => onChange({ musicEnabled: v })} />
        <ToggleRow label="Вибрация" emoji="📳" value={settings.vibrationEnabled} onChange={v => onChange({ vibrationEnabled: v })} />
        <ToggleRow label="Показывать траекторию" emoji="🎯" value={settings.showTrajectory} onChange={v => onChange({ showTrajectory: v })} />

        {/* Theme selector */}
        <div className="rounded-2xl border p-4" style={{ background: 'rgba(155,48,255,0.06)', borderColor: 'rgba(155,48,255,0.2)' }}>
          <div className="font-russo text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>ТЕМА</div>
          <div className="flex gap-2">
            {[
              { key: 'neon', label: '🌟 Неон' },
              { key: 'space', label: '🌌 Космос' },
              { key: 'candy', label: '🍭 Конфеты' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onChange({ theme: key as GameSettings['theme'] })}
                className="flex-1 py-2 rounded-xl font-russo text-xs active:scale-95 transition-all border"
                style={{
                  background: settings.theme === key ? 'rgba(155,48,255,0.25)' : 'rgba(155,48,255,0.05)',
                  borderColor: settings.theme === key ? 'rgba(155,48,255,0.6)' : 'rgba(155,48,255,0.15)',
                  color: settings.theme === key ? '#e0c8ff' : 'rgba(255,255,255,0.4)',
                  boxShadow: settings.theme === key ? '0 0 12px rgba(155,48,255,0.3)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => { localStorage.removeItem('neonHighScore'); }}
          className="w-full py-3 rounded-2xl font-russo text-sm active:scale-95 transition-all border mt-2"
          style={{
            background: 'rgba(255,45,85,0.06)',
            borderColor: 'rgba(255,45,85,0.25)',
            color: 'rgba(255,45,85,0.7)',
          }}
        >
          🗑️ Сбросить рекорды
        </button>
      </div>
    </div>
  );
}
