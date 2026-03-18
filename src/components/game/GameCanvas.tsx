import { useRef, useEffect, useCallback } from 'react';
import type { Ball, BulletState, Particle, FloatingText, ComboState, PowerUpType, GameSettings } from '@/game/types';
import {
  drawBall, drawBullet, drawTrajectory, drawParticles, drawFloatingTexts,
  calcShootVelocity,
} from '@/game/engine';
import { BALL_COLOR_MAP } from '@/game/constants';

interface GameCanvasProps {
  balls: Ball[];
  bullet: BulletState | null;
  shooterX: number;
  shooterY: number;
  shooterColor: string;
  shooterIsPowerUp?: boolean;
  shooterPowerUpType?: PowerUpType;
  aimAngle: number;
  isAiming: boolean;
  particles: Particle[];
  floatingTexts: FloatingText[];
  combo: ComboState;
  settings: GameSettings;
  width: number;
  height: number;
  onAim: (angle: number) => void;
  onShoot: (vx: number, vy: number) => void;
  frozenUntil: number;
  gravityFlipped: boolean;
  activeBonus: PowerUpType | null;
}

export default function GameCanvas({
  balls, bullet, shooterX, shooterY, shooterColor,
  shooterIsPowerUp, shooterPowerUpType,
  aimAngle, isAiming, particles, floatingTexts, combo,
  settings, width, height, onAim, onShoot, frozenUntil, gravityFlipped, activeBonus,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nowRef = useRef(Date.now());

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const dx = x - shooterX;
    const dy = y - shooterY;
    const angle = Math.atan2(dy, dx);
    onAim(angle);
  }, [shooterX, shooterY, onAim]);

  const handleShoot = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    if (y >= shooterY - 10) return; // нельзя стрелять вниз
    const { vx, vy } = calcShootVelocity(shooterX, shooterY, x, y, 1);
    onShoot(vx, vy);
  }, [shooterX, shooterY, onShoot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const render = () => {
      nowRef.current = Date.now();
      const now = nowRef.current;
      ctx.clearRect(0, 0, width, height);

      // Frozen tint
      const isFrozen = now < frozenUntil;
      if (isFrozen) {
        ctx.save();
        ctx.fillStyle = 'rgba(100, 210, 255, 0.08)';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Gravity flip transform
      if (gravityFlipped) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-width / 2, -height / 2);
      }

      // Draw balls
      for (const ball of balls) {
        drawBall(ctx, ball, now, activeBonus);
      }

      if (gravityFlipped) ctx.restore();

      // Draw particles
      drawParticles(ctx, particles);

      // Draw trajectory
      if (isAiming && settings.showTrajectory && !bullet) {
        const speed = 14;
        const vx = Math.cos(aimAngle) * speed;
        const vy = Math.sin(aimAngle) * speed;
        if (vy < 0) {
          const colorInfo = BALL_COLOR_MAP[shooterColor as keyof typeof BALL_COLOR_MAP] ?? BALL_COLOR_MAP.blue;
          drawTrajectory(ctx, shooterX, shooterY, vx, vy, width, colorInfo.glow);
        }
      }

      // Draw bullet
      if (bullet) {
        drawBullet(ctx, bullet.x, bullet.y, bullet.color, bullet.trail, bullet.isPowerUp, bullet.powerUpType);
      }

      // Draw shooter ball (static)
      if (!bullet) {
        const colorInfo = BALL_COLOR_MAP[shooterColor as keyof typeof BALL_COLOR_MAP] ?? BALL_COLOR_MAP.blue;
        const pulse = 1 + 0.04 * Math.sin(now / 300);
        ctx.save();
        ctx.translate(shooterX, shooterY);
        ctx.scale(pulse, pulse);
        const grad = ctx.createRadialGradient(-6, -6, 2, 0, 0, 22);
        grad.addColorStop(0, colorInfo.stroke);
        grad.addColorStop(1, colorInfo.fill);
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = colorInfo.glow;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.strokeStyle = colorInfo.stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Floating texts
      drawFloatingTexts(ctx, floatingTexts);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [balls, bullet, shooterX, shooterY, shooterColor, shooterIsPowerUp, shooterPowerUpType,
      aimAngle, isAiming, particles, floatingTexts, settings, width, height, frozenUntil, gravityFlipped, activeBonus]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="game-canvas-wrapper w-full h-full"
      onMouseMove={handleMove}
      onMouseDown={handleShoot}
      onTouchMove={handleMove}
      onTouchEnd={handleShoot}
      style={{ touchAction: 'none', cursor: 'crosshair' }}
    />
  );
}
