import Icon from '@/components/ui/icon';
import type { ComboState, PowerUpType, ShooterBall } from '@/game/types';
import { BALL_COLOR_MAP, POWERUP_EMOJI, SHOP_ITEMS } from '@/game/constants';
import { comboLabel, comboColor } from '@/game/engine';

interface HUDProps {
  score: number;
  level: number;
  lives: number;
  maxLives: number;
  coins: number;
  combo: ComboState;
  nextBall: ShooterBall;
  bonusInventory: Record<PowerUpType, number>;
  activeBonus: PowerUpType | null;
  shieldActive: boolean;
  frozenUntil: number;
  slowmoUntil: number;
  onUseBonus: (type: PowerUpType) => void;
  onPause: () => void;
}

const POWERUP_TYPES: PowerUpType[] = ['bomb','laser','freeze','multiball','rainbow','magnet','fireball','electric'];

export default function HUD({
  score, level, lives, maxLives, coins, combo,
  nextBall, bonusInventory, activeBonus, shieldActive,
  frozenUntil, slowmoUntil, onUseBonus, onPause,
}: HUDProps) {
  const now = Date.now();
  const isFrozen = now < frozenUntil;
  const isSlowmo = now < slowmoUntil;
  const comboActive = combo.isActive && combo.multiplier >= 2;

  const nextColorInfo = BALL_COLOR_MAP[nextBall.color];

  return (
    <div className="flex flex-col w-full select-none" style={{ fontFamily: "'Russo One', sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(6,9,18,0.95)', borderBottom: '1px solid rgba(155,48,255,0.3)' }}>
        <button onClick={onPause} className="p-1 rounded-lg active:scale-90 transition-all"
          style={{ color: 'rgba(155,48,255,0.7)' }}>
          <Icon name="Pause" size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="text-xs" style={{ color: 'rgba(155,48,255,0.6)' }}>СЧЁТ</div>
          <div className="text-xl neon-text-cyan">{score.toLocaleString()}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs" style={{ color: 'rgba(155,48,255,0.6)' }}>УРОВЕНЬ</div>
          <div className="text-xl neon-text-purple">{level}</div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: maxLives }).map((_, i) => (
            <span key={i} className={`text-lg transition-all ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
              {i < lives ? '❤️' : '🖤'}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-sm neon-text-yellow">
          <span>🪙</span>
          <span>{coins}</span>
        </div>
      </div>

      {/* Combo bar */}
      {comboActive && (
        <div className="flex items-center justify-center py-1 animate-combo-flash"
          style={{ background: `rgba(0,0,0,0.8)`, borderBottom: `1px solid ${comboColor(combo.multiplier)}33` }}>
          <span className="text-base font-russo animate-neon-pulse" style={{ color: comboColor(combo.multiplier) }}>
            {comboLabel(combo.multiplier)} ×{combo.multiplier}
          </span>
          {/* Timer bar */}
          <div className="ml-3 w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, ((combo.expiresAt - now) / combo.windowMs) * 100)}%`,
                background: comboColor(combo.multiplier),
                boxShadow: `0 0 6px ${comboColor(combo.multiplier)}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status effects */}
      {(isFrozen || isSlowmo || shieldActive) && (
        <div className="flex gap-2 justify-center py-1 text-xs" style={{ background: 'rgba(0,0,0,0.6)' }}>
          {isFrozen && <span className="neon-text-cyan animate-neon-pulse">❄️ ЗАМОРОЗКА</span>}
          {isSlowmo && <span className="animate-neon-pulse" style={{ color: '#0a84ff' }}>⏳ ЗАМЕДЛЕНИЕ</span>}
          {shieldActive && <span className="neon-text-green animate-neon-pulse">🛡️ ЩИТ</span>}
        </div>
      )}

      {/* Next ball preview */}
      <div className="flex items-center justify-end px-4 py-1 gap-2"
        style={{ background: 'rgba(6,9,18,0.7)' }}>
        <span className="text-xs" style={{ color: 'rgba(155,48,255,0.5)' }}>СЛЕД:</span>
        <div className="w-7 h-7 rounded-full border-2 relative"
          style={{
            background: nextColorInfo.fill,
            borderColor: nextColorInfo.stroke,
            boxShadow: `0 0 10px ${nextColorInfo.glow}`,
          }}>
          {nextBall.isPowerUp && (
            <span className="absolute -top-1 -right-1 text-xs">{POWERUP_EMOJI[nextBall.powerUpType!]}</span>
          )}
        </div>
      </div>

      {/* Bonus bar */}
      <div className="flex gap-2 px-3 py-2 overflow-x-auto"
        style={{ background: 'rgba(6,9,18,0.85)', borderTop: '1px solid rgba(155,48,255,0.15)' }}>
        {POWERUP_TYPES.map(type => {
          const count = bonusInventory[type] ?? 0;
          const isActive = activeBonus === type;
          const item = SHOP_ITEMS.find(i => i.type === type);
          return (
            <button
              key={type}
              onClick={() => count > 0 && onUseBonus(type)}
              disabled={count === 0}
              className={`flex-shrink-0 relative flex flex-col items-center justify-center rounded-xl w-12 h-12 border transition-all active:scale-90 ${count === 0 ? 'opacity-30' : 'opacity-100'}`}
              style={{
                background: isActive ? 'rgba(155,48,255,0.3)' : 'rgba(155,48,255,0.08)',
                borderColor: isActive ? 'var(--neon-purple)' : 'rgba(155,48,255,0.25)',
                boxShadow: isActive ? '0 0 12px rgba(155,48,255,0.5)' : 'none',
              }}
              title={item?.name}
            >
              <span className="text-xl">{POWERUP_EMOJI[type]}</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-russo"
                  style={{ background: 'var(--neon-purple)', color: '#fff', fontSize: '10px' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
