import { useRef, useCallback, useState } from 'react';
import type { GameState, PowerUpType } from '@/game/types';
import type { BulletState } from '@/game/engine';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import { BALL_COLOR_MAP } from '@/game/constants';

interface GameScreenProps {
  state: GameState;
  bullet: BulletState | null;
  canvasWidth: number;
  canvasHeight: number;
  shooterY: number;
  onAim: (angle: number) => void;
  onShoot: (vx: number, vy: number) => void;
  onUseBonus: (type: PowerUpType) => void;
  onMenu: () => void;
}

export default function GameScreen({
  state, bullet, canvasWidth, canvasHeight, shooterY,
  onAim, onShoot, onUseBonus, onMenu,
}: GameScreenProps) {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shooterColorInfo = BALL_COLOR_MAP[state.shooter.color] ?? BALL_COLOR_MAP.blue;

  const handlePause = useCallback(() => setPaused(p => !p), []);

  return (
    <div className="flex flex-col h-full w-full game-bg relative overflow-hidden" ref={containerRef}>
      {/* HUD on top */}
      <HUD
        score={state.score}
        level={state.level}
        lives={state.lives}
        maxLives={state.maxLives}
        coins={state.coins}
        combo={state.combo}
        nextBall={state.nextBall}
        bonusInventory={state.bonusInventory}
        activeBonus={state.activeBonus}
        shieldActive={state.shieldActive}
        frozenUntil={state.frozenUntil}
        slowmoUntil={state.slowmoUntil}
        onUseBonus={onUseBonus}
        onPause={handlePause}
      />

      {/* Game canvas */}
      <div className="flex-1 relative overflow-hidden">
        <GameCanvas
          balls={state.balls}
          bullet={bullet}
          shooterX={canvasWidth / 2}
          shooterY={shooterY}
          shooterColor={state.shooter.color}
          shooterIsPowerUp={state.shooter.isPowerUp}
          shooterPowerUpType={state.shooter.powerUpType}
          aimAngle={state.aimAngle}
          isAiming={state.isAiming}
          particles={state.particles}
          floatingTexts={state.floatingTexts}
          combo={state.combo}
          settings={state.settings}
          width={canvasWidth}
          height={canvasHeight - 10}
          onAim={onAim}
          onShoot={onShoot}
          frozenUntil={state.frozenUntil}
          gravityFlipped={state.gravityFlipped}
          activeBonus={state.activeBonus}
        />

        {/* Danger zone line */}
        <div className="absolute left-0 right-0 pointer-events-none"
          style={{
            bottom: 90,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,45,85,0.6), transparent)',
            boxShadow: '0 0 8px rgba(255,45,85,0.4)',
          }} />

        {/* Shooter glow ring */}
        <div className="absolute pointer-events-none"
          style={{
            left: '50%',
            bottom: 62,
            transform: 'translateX(-50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: `2px solid ${shooterColorInfo.glow}`,
            boxShadow: `0 0 20px ${shooterColorInfo.glow}44`,
            opacity: 0.5,
          }} />
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: 'rgba(6,9,18,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col items-center gap-6 px-8 w-full max-w-xs animate-fade-in-up">
            <div className="text-6xl">⏸️</div>
            <h3 className="text-3xl font-russo neon-text-purple">ПАУЗА</h3>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={handlePause}
                className="w-full py-4 rounded-2xl font-russo text-xl active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #9b30ff, #ff2d78)', color: '#fff', boxShadow: '0 0 25px rgba(155,48,255,0.4)' }}>
                ▶ ПРОДОЛЖИТЬ
              </button>
              <button onClick={onMenu}
                className="w-full py-3 rounded-2xl font-russo text-base active:scale-95 transition-all border"
                style={{ background: 'rgba(155,48,255,0.1)', borderColor: 'rgba(155,48,255,0.3)', color: '#e0c8ff' }}>
                🏠 В МЕНЮ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
