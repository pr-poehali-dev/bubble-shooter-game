import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Ball, PowerUpType, BallColor, ShooterBall } from '@/game/types';
import type { BulletState } from '@/game/engine';
import {
  generateField, generateShooterBall, moveBullet, snapBallToGrid,
  findColorGroup, findFloating, applyPowerUp, updateCombo,
  createBurstParticles, updateParticles, createFloatingText, updateFloatingTexts,
  getInitialBonusInventory, getInitialCombo, uid, comboColor,
} from '@/game/engine';
import {
  BALL_RADIUS, SCORE_PER_BALL, SCORE_BOSS_KILL,
  MIN_MATCH, DEFAULT_SETTINGS, SHOP_ITEMS, getDifficultyForLevel, BALL_COLOR_MAP,
} from '@/game/constants';

const CANVAS_WIDTH = 390;
const CANVAS_HEIGHT = 600;
const SHOOTER_Y = CANVAS_HEIGHT - 70;

function makeInitialState(): GameState {
  const level = 1;
  const balls = generateField(level, CANVAS_WIDTH);
  const shooter = generateShooterBall(balls, level);
  const nextBall = generateShooterBall(balls, level);
  return {
    screen: 'menu',
    level,
    score: 0,
    highScore: Number(localStorage.getItem('neonHighScore') ?? 0),
    lives: 3,
    maxLives: 3,
    balls,
    shooter,
    nextBall,
    aimAngle: -Math.PI / 2,
    isAiming: false,
    isShooting: false,
    shootPos: null,
    shootVel: null,
    particles: [],
    floatingTexts: [],
    combo: getInitialCombo(),
    activeBonus: null,
    bonusInventory: getInitialBonusInventory(),
    coins: 100,
    shopItems: SHOP_ITEMS,
    settings: DEFAULT_SETTINGS,
    difficulty: getDifficultyForLevel(level),
    isBossLevel: false,
    bossDefeated: false,
    tutorialStep: 0,
    fieldDropTimer: 0,
    fieldDropInterval: getDifficultyForLevel(level).dropInterval,
    gameTime: 0,
    frozenUntil: 0,
    slowmoUntil: 0,
    shieldActive: false,
    gravityFlipped: false,
    rowsToAdd: 0,
    totalShots: 0,
    totalHits: 0,
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(makeInitialState);
  const bulletRef = useRef<BulletState | null>(null);
  const [bullet, setBullet] = useState<BulletState | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastDropTime = useRef<number>(Date.now());
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goTo = useCallback((screen: GameState['screen']) => {
    setState(s => ({ ...s, screen }));
  }, []);

  // ─── Start / Restart game ─────────────────────────────────────────────────
  const startGame = useCallback((level = 1) => {
    const diff = getDifficultyForLevel(level);
    const isBoss = level % 10 === 0 && level > 0;
    const balls = generateField(level, CANVAS_WIDTH);
    const shooter = generateShooterBall(balls, level);
    const nextBall = generateShooterBall(balls, level);
    bulletRef.current = null;
    setBullet(null);
    lastDropTime.current = Date.now();
    setState(s => ({
      ...s,
      screen: isBoss ? 'boss_intro' : 'game',
      level,
      balls,
      shooter,
      nextBall,
      lives: 3,
      score: level === 1 ? 0 : s.score,
      particles: [],
      floatingTexts: [],
      combo: getInitialCombo(),
      difficulty: diff,
      isBossLevel: isBoss,
      bossDefeated: false,
      fieldDropInterval: diff.dropInterval,
      frozenUntil: 0,
      slowmoUntil: 0,
      shieldActive: false,
      gravityFlipped: false,
      totalShots: 0,
      totalHits: 0,
    }));
  }, []);

  const resumeFromBossIntro = useCallback(() => {
    setState(s => ({ ...s, screen: 'game' }));
  }, []);

  // ─── Aim ──────────────────────────────────────────────────────────────────
  const handleAim = useCallback((angle: number) => {
    setState(s => ({ ...s, aimAngle: angle, isAiming: true }));
  }, []);

  // ─── Shoot ────────────────────────────────────────────────────────────────
  const handleShoot = useCallback((vx: number, vy: number) => {
    setState(s => {
      if (s.isShooting || bulletRef.current) return s;
      if (vy >= 0) return s; // не стрелять вниз
      return { ...s, isShooting: true, isAiming: false, totalShots: s.totalShots + 1 };
    });

    setState(s => {
      if (!s.isShooting || bulletRef.current) return s;
      const newBullet: BulletState = {
        x: CANVAS_WIDTH / 2,
        y: SHOOTER_Y,
        vx, vy,
        color: s.shooter.color,
        isPowerUp: s.shooter.isPowerUp,
        powerUpType: s.shooter.powerUpType,
        trail: [],
      };
      bulletRef.current = newBullet;
      setBullet(newBullet);
      return s;
    });
  }, []);

  // ─── Use bonus from inventory ─────────────────────────────────────────────
  const useBonus = useCallback((type: PowerUpType) => {
    setState(s => {
      if ((s.bonusInventory[type] ?? 0) === 0) return s;
      const newInv = { ...s.bonusInventory, [type]: s.bonusInventory[type] - 1 };

      // Instant effects
      if (type === 'freeze') {
        return { ...s, bonusInventory: newInv, frozenUntil: Date.now() + 10000 };
      }
      if (type === 'slowmo') {
        return { ...s, bonusInventory: newInv, slowmoUntil: Date.now() + 15000 };
      }
      if (type === 'shield') {
        return { ...s, bonusInventory: newInv, shieldActive: true };
      }
      if (type === 'gravity') {
        return { ...s, bonusInventory: newInv, gravityFlipped: true };
      }
      if (type === 'time_bonus') {
        return { ...s, bonusInventory: newInv };
      }
      // Shooter overrides (applied on next shot)
      return { ...s, bonusInventory: newInv, activeBonus: type };
    });
  }, []);

  // ─── Buy in shop ──────────────────────────────────────────────────────────
  const buyItem = useCallback((type: PowerUpType) => {
    setState(s => {
      const item = SHOP_ITEMS.find(i => i.type === type);
      if (!item || s.coins < item.price) return s;
      return {
        ...s,
        coins: s.coins - item.price,
        bonusInventory: { ...s.bonusInventory, [type]: (s.bonusInventory[type] ?? 0) + 1 },
      };
    });
  }, []);

  // ─── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<GameState['settings']>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  // ─── Tutorial step ────────────────────────────────────────────────────────
  const nextTutorialStep = useCallback(() => {
    setState(s => {
      if (s.tutorialStep >= 5) return { ...s, screen: 'menu' };
      return { ...s, tutorialStep: s.tutorialStep + 1 };
    });
  }, []);

  // ─── Main game loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      const b = bulletRef.current;
      if (!b) { animFrameRef.current = requestAnimationFrame(loop); return; }

      setState(s => {
        if (s.screen !== 'game') return s;

        const now = Date.now();
        const isFrozen = now < s.frozenUntil;
        const isSlowmo = now < s.slowmoUntil;

        // Move bullet
        const moved = moveBullet(b, CANVAS_WIDTH);
        bulletRef.current = moved;
        setBullet({ ...moved });

        // Check hit ceiling
        if (moved.y - BALL_RADIUS <= 0) {
          return handleCollision(s, moved, now);
        }

        // Check collision with any ball
        for (const ball of s.balls) {
          const dx = moved.x - ball.x;
          const dy = moved.y - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BALL_RADIUS + ball.radius - 2) {
            return handleCollision(s, moved, now, ball);
          }
        }

        // Drop field timer
        const dropInterval = isFrozen ? Infinity : isSlowmo ? s.fieldDropInterval * 2 : s.fieldDropInterval;
        let newBalls = s.balls;
        let newLastDrop = lastDropTime.current;
        if (now - lastDropTime.current > dropInterval) {
          lastDropTime.current = now;
          newLastDrop = now;
          // add new row
          newBalls = addFieldRow(s.balls, s.level);
          // check if any ball crossed bottom line
          const danger = newBalls.some(b => b.y + b.radius > CANVAS_HEIGHT - 90);
          if (danger) {
            if (s.shieldActive) {
              return { ...s, balls: newBalls, shieldActive: false, floatingTexts: [...s.floatingTexts, createFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '🛡️ ЩИТ!', '#00ff88')] };
            }
            const newLives = s.lives - 1;
            if (newLives <= 0) {
              const hs = Math.max(s.score, s.highScore);
              localStorage.setItem('neonHighScore', String(hs));
              return { ...s, balls: newBalls, lives: 0, screen: 'gameover', highScore: hs };
            }
            return { ...s, balls: newBalls, lives: newLives };
          }
        }

        // Combo expiry
        let newCombo = s.combo;
        if (s.combo.isActive && now > s.combo.expiresAt) {
          newCombo = { ...s.combo, isActive: false, count: 0, multiplier: 1 };
        }

        // Gravity flip expiry (5s)
        const gravityFlipped = s.gravityFlipped && now < (s.frozenUntil + 5000);

        return {
          ...s,
          balls: newBalls,
          particles: updateParticles(s.particles),
          floatingTexts: updateFloatingTexts(s.floatingTexts),
          combo: newCombo,
        };
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ─── Collision resolution ─────────────────────────────────────────────────
  function handleCollision(s: GameState, b: BulletState, now: number, hitBall?: Ball): GameState {
    bulletRef.current = null;
    setBullet(null);

    const snapped = snapBallToGrid(b.x, b.y, s.balls, CANVAS_WIDTH);

    // Determine effective color (rainbow = any)
    const effectiveColor: BallColor = s.activeBonus === 'rainbow'
      ? (s.balls.find(bl => bl.y < snapped.y + BALL_RADIUS * 3)?.color ?? b.color)
      : b.color;

    // Add new ball
    const newBall: Ball = {
      id: uid(),
      x: snapped.x, y: snapped.y,
      color: effectiveColor,
      radius: BALL_RADIUS,
      row: snapped.row, col: snapped.col,
      isPowerUp: b.isPowerUp, powerUpType: b.powerUpType,
    };

    let updatedBalls = [...s.balls, newBall];
    let addedScore = 0;
    const newParticles = [...s.particles];
    const newTexts = [...s.floatingTexts];
    let hitMade = false;
    let coinsEarned = 0;

    // Power-up activation
    if (b.isPowerUp && b.powerUpType && hitBall) {
      const { removedIds } = applyPowerUp(b.powerUpType, hitBall, updatedBalls, CANVAS_WIDTH);
      const removed = updatedBalls.filter(bl => removedIds.has(bl.id));
      for (const rb of removed) {
        const ci = BALL_COLOR_MAP[rb.color];
        newParticles.push(...createBurstParticles(rb.x, rb.y, ci.glow, 10));
      }
      updatedBalls = updatedBalls.filter(bl => !removedIds.has(bl.id));
      addedScore += removed.length * SCORE_PER_BALL * 2;
      hitMade = removed.length > 0;
      coinsEarned += Math.floor(removed.length / 3);
    } else {
      // Normal match
      const group = findColorGroup(newBall, updatedBalls);
      if (group.length >= MIN_MATCH) {
        // Boss ball handling
        const bossInGroup = group.find(g => g.isBoss);
        if (bossInGroup && bossInGroup.bossHp !== undefined) {
          if (bossInGroup.bossHp > 1) {
            updatedBalls = updatedBalls.map(bl =>
              bl.id === bossInGroup.id ? { ...bl, bossHp: bl.bossHp! - 1 } : bl
            );
            newTexts.push(createFloatingText(bossInGroup.x, bossInGroup.y - 20, `💥 -1 HP!`, '#ff2d55'));
          } else {
            // Boss killed
            updatedBalls = updatedBalls.filter(bl => bl.id !== bossInGroup.id);
            addedScore += SCORE_BOSS_KILL;
            newParticles.push(...createBurstParticles(bossInGroup.x, bossInGroup.y, '#9b30ff', 30));
            newTexts.push(createFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60, '👾 БОСС УБИТ!', '#9b30ff'));
            coinsEarned += 20;
          }
          hitMade = true;
        } else {
          // Normal group pop
          const nonBoss = group.filter(g => !g.isBoss);
          for (const gb of nonBoss) {
            const ci = BALL_COLOR_MAP[gb.color];
            newParticles.push(...createBurstParticles(gb.x, gb.y, ci.glow, 8));
          }
          updatedBalls = updatedBalls.filter(bl => !nonBoss.some(g => g.id === bl.id));
          addedScore += nonBoss.length * SCORE_PER_BALL;
          hitMade = nonBoss.length > 0;
          coinsEarned += Math.floor(nonBoss.length / 3);

          // Floating balls
          const floating = findFloating(updatedBalls);
          if (floating.length > 0) {
            for (const fb of floating) {
              const ci = BALL_COLOR_MAP[fb.color];
              newParticles.push(...createBurstParticles(fb.x, fb.y, ci.glow, 6));
              addedScore += SCORE_PER_BALL;
            }
            updatedBalls = updatedBalls.filter(bl => !floating.some(f => f.id === bl.id));
            coinsEarned += Math.floor(floating.length / 5);
          }
        }
      }
    }

    // Update combo
    const newCombo = updateCombo(s.combo, now, hitMade);
    const multiplier = newCombo.multiplier;

    // Apply multiplier to score
    const finalScore = addedScore * multiplier;

    // Floating text for score + combo
    if (finalScore > 0) {
      const cx = b.x, cy = b.y;
      const color = comboColor(multiplier);
      if (multiplier >= 2) {
        newTexts.push(createFloatingText(cx, cy - 30, `×${multiplier} КОМБО!`, color));
        newTexts.push(createFloatingText(cx, cy, `+${finalScore}`, '#ffe600'));
      } else {
        newTexts.push(createFloatingText(cx, cy, `+${finalScore}`, '#ffe600'));
      }
    }

    const newScore = s.score + finalScore;
    const newCoins = s.coins + coinsEarned;

    // Check level complete
    const allBallsGone = updatedBalls.filter(bl => !bl.isBoss).length === 0;
    const bossKilled = s.isBossLevel && !updatedBalls.some(bl => bl.isBoss);
    const levelDone = allBallsGone || bossKilled;

    if (levelDone) {
      const hs = Math.max(newScore, s.highScore);
      localStorage.setItem('neonHighScore', String(hs));
      return {
        ...s,
        balls: updatedBalls,
        score: newScore,
        highScore: hs,
        coins: newCoins,
        particles: newParticles,
        floatingTexts: newTexts,
        combo: newCombo,
        screen: 'levelcomplete',
        bossDefeated: bossKilled,
        isShooting: false,
        activeBonus: null,
      };
    }

    // Check gameover (balls reached bottom)
    const danger = updatedBalls.some(bl => bl.y + bl.radius > CANVAS_HEIGHT - 90);
    if (danger && !s.shieldActive) {
      const newLives = s.lives - 1;
      if (newLives <= 0) {
        const hs = Math.max(newScore, s.highScore);
        localStorage.setItem('neonHighScore', String(hs));
        return { ...s, balls: updatedBalls, score: newScore, highScore: hs, lives: 0, screen: 'gameover', isShooting: false };
      }
      return { ...s, balls: updatedBalls, score: newScore, coins: newCoins, particles: newParticles, floatingTexts: newTexts, combo: newCombo, lives: newLives, isShooting: false };
    }

    // Next shooter ball
    const nextBall = generateShooterBall(updatedBalls, s.level);

    return {
      ...s,
      balls: updatedBalls,
      score: newScore,
      coins: newCoins,
      particles: newParticles,
      floatingTexts: newTexts,
      combo: newCombo,
      shooter: s.nextBall,
      nextBall,
      isShooting: false,
      activeBonus: null,
    };
  }

  function addFieldRow(balls: Ball[], level: number): Ball[] {
    const diff = getDifficultyForLevel(level);
    const colors = ['red','blue','green','yellow','purple','cyan','orange','pink'].slice(0, diff.colors) as BallColor[];
    const cols = Math.floor(CANVAS_WIDTH / (BALL_RADIUS * 2));
    const shifted = balls.map(b => ({ ...b, y: b.y + BALL_RADIUS * 1.85, row: b.row + 1 }));
    const newRow: Ball[] = [];
    for (let col = 0; col < cols; col++) {
      const x = BALL_RADIUS + col * BALL_RADIUS * 2;
      const y = BALL_RADIUS;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newRow.push({ id: uid(), x, y, color, radius: BALL_RADIUS, row: 0, col, isNew: true });
    }
    return [...newRow, ...shifted];
  }

  return {
    state,
    bullet,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    shooterY: SHOOTER_Y,
    goTo,
    startGame,
    resumeFromBossIntro,
    handleAim,
    handleShoot,
    useBonus,
    buyItem,
    updateSettings,
    nextTutorialStep,
  };
}
