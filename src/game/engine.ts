import type { Ball, BallColor, ShooterBall, Particle, FloatingText, ComboState, PowerUpType } from './types';
import {
  BALL_RADIUS, BALL_COLORS, BALL_COLOR_MAP, POWERUP_COLORS,
  MIN_MATCH, COMBO_WINDOW_MS, COMBO_MAX, SHOOT_SPEED,
  SCORE_PER_BALL, SCORE_BOSS_KILL, getDifficultyForLevel, DEFAULT_SETTINGS, SHOP_ITEMS
} from './constants';

let idCounter = 0;
export const uid = () => `b${++idCounter}`;

// ─── Генерация поля ──────────────────────────────────────────────────────────
export function generateField(level: number, canvasWidth: number): Ball[] {
  const diff = getDifficultyForLevel(level);
  const colors = BALL_COLORS.slice(0, diff.colors) as BallColor[];
  const balls: Ball[] = [];
  const cols = Math.floor(canvasWidth / (BALL_RADIUS * 2));
  const isBoss = diff.isBossLevel;
  const rows = diff.ballRows;

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : BALL_RADIUS;
    const colsInRow = row % 2 === 0 ? cols : cols - 1;
    for (let col = 0; col < colsInRow; col++) {
      const x = offset + BALL_RADIUS + col * BALL_RADIUS * 2;
      const y = BALL_RADIUS + row * BALL_RADIUS * 1.85;

      // Boss ball in center of last row on boss level
      if (isBoss && row === rows - 1 && col === Math.floor(colsInRow / 2)) {
        balls.push({
          id: uid(), x, y, color: 'boss', radius: BALL_RADIUS * 1.6,
          row, col, isBoss: true,
          bossHp: diff.bossHp, bossMaxHp: diff.bossHp,
          special: (['shield', 'split', 'gravity', 'mirror'] as const)[Math.floor(Math.random() * 4)],
          isNew: true,
        });
        continue;
      }

      // Power-up ball
      const isPowerUp = Math.random() < diff.powerUpChance;
      const powerUpTypes: PowerUpType[] = ['bomb','laser','freeze','multiball','rainbow','magnet','shield','slowmo','fireball','electric','gravity','time_bonus'];
      const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

      const color = colors[Math.floor(Math.random() * colors.length)];
      balls.push({
        id: uid(), x, y, color, radius: BALL_RADIUS,
        row, col, isPowerUp, powerUpType: isPowerUp ? powerUpType : undefined,
        isNew: true,
      });
    }
  }
  return balls;
}

// ─── Добавить новый ряд ──────────────────────────────────────────────────────
export function addNewRow(balls: Ball[], level: number, canvasWidth: number): Ball[] {
  const diff = getDifficultyForLevel(level);
  const colors = BALL_COLORS.slice(0, diff.colors) as BallColor[];
  const cols = Math.floor(canvasWidth / (BALL_RADIUS * 2));

  // сдвинуть все вниз
  const shifted = balls.map(b => ({ ...b, y: b.y + BALL_RADIUS * 1.85, row: b.row + 1 }));

  // новый ряд сверху (row=0)
  const offset = 0;
  const newRow: Ball[] = [];
  for (let col = 0; col < cols; col++) {
    const x = offset + BALL_RADIUS + col * BALL_RADIUS * 2;
    const y = BALL_RADIUS;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isPowerUp = Math.random() < diff.powerUpChance;
    const powerUpTypes: PowerUpType[] = ['bomb','laser','freeze','multiball','rainbow','magnet','shield','slowmo','fireball','electric','gravity','time_bonus'];
    newRow.push({
      id: uid(), x, y, color, radius: BALL_RADIUS, row: 0, col,
      isPowerUp, powerUpType: isPowerUp ? (powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]) : undefined,
      isNew: true,
    });
  }
  return [...newRow, ...shifted];
}

// ─── Генерация шарика стрелка ─────────────────────────────────────────────────
export function generateShooterBall(balls: Ball[], level: number): ShooterBall {
  const diff = getDifficultyForLevel(level);
  const colors = BALL_COLORS.slice(0, diff.colors) as BallColor[];
  // Bias toward colors that exist on the field
  const fieldColors = [...new Set(balls.filter(b => !b.isBoss).map(b => b.color))];
  const pool = fieldColors.length > 0
    ? [...fieldColors, ...fieldColors, ...colors]
    : colors;
  const color = pool[Math.floor(Math.random() * pool.length)] as BallColor;

  const isPowerUp = Math.random() < 0.04;
  const powerUpTypes: PowerUpType[] = ['bomb','laser','freeze','multiball','rainbow','magnet','shield','slowmo','fireball','electric','gravity','time_bonus'];
  return {
    color,
    isPowerUp,
    powerUpType: isPowerUp ? powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)] : undefined,
  };
}

// ─── Физика полёта шара ───────────────────────────────────────────────────────
export interface BulletState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BallColor;
  isPowerUp?: boolean;
  powerUpType?: PowerUpType;
  trail: { x: number; y: number }[];
}

export function moveBullet(bullet: BulletState, canvasWidth: number): BulletState {
  let { x, vx } = bullet;
  const { y: rawY, vy } = bullet;
  const y = rawY + vy;
  x += vx;
  // wall bounce
  if (x - BALL_RADIUS < 0) { x = BALL_RADIUS; vx = Math.abs(vx); }
  if (x + BALL_RADIUS > canvasWidth) { x = canvasWidth - BALL_RADIUS; vx = -Math.abs(vx); }
  const trail = [...bullet.trail.slice(-8), { x, y }];
  return { ...bullet, x, y, vx, vy, trail };
}

// ─── Поиск соседей (гексагональная сетка) ────────────────────────────────────
export function getNeighbors(ball: Ball, balls: Ball[]): Ball[] {
  return balls.filter(b => {
    if (b.id === ball.id) return false;
    const dx = b.x - ball.x;
    const dy = b.y - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < BALL_RADIUS * 2.3;
  });
}

// ─── BFS: найти группу одного цвета ──────────────────────────────────────────
export function findColorGroup(start: Ball, balls: Ball[]): Ball[] {
  const visited = new Set<string>();
  const queue = [start];
  visited.add(start.id);
  const group: Ball[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    group.push(current);
    const neighbors = getNeighbors(current, balls);
    for (const n of neighbors) {
      if (!visited.has(n.id) && n.color === start.color && !n.isBoss) {
        visited.add(n.id);
        queue.push(n);
      }
    }
  }
  return group;
}

// ─── BFS: найти шары, висящие в воздухе ──────────────────────────────────────
export function findFloating(balls: Ball[]): Ball[] {
  const attached = new Set<string>();
  const topBalls = balls.filter(b => b.y <= BALL_RADIUS * 2.5);
  const queue = [...topBalls];
  for (const b of queue) attached.add(b.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current, balls);
    for (const n of neighbors) {
      if (!attached.has(n.id)) {
        attached.add(n.id);
        queue.push(n);
      }
    }
  }
  return balls.filter(b => !attached.has(b.id));
}

// ─── Приклеить шар к полю ─────────────────────────────────────────────────────
export function snapBallToGrid(
  x: number, y: number, balls: Ball[], canvasWidth: number
): { x: number; y: number; row: number; col: number } {
  const cols = Math.floor(canvasWidth / (BALL_RADIUS * 2));

  // найти ближайшую строку
  const approxRow = Math.round((y - BALL_RADIUS) / (BALL_RADIUS * 1.85));
  const row = Math.max(0, approxRow);
  const offset = row % 2 === 0 ? 0 : BALL_RADIUS;
  const colsInRow = row % 2 === 0 ? cols : cols - 1;
  const col = Math.round((x - offset - BALL_RADIUS) / (BALL_RADIUS * 2));
  const clampedCol = Math.max(0, Math.min(colsInRow - 1, col));
  const snappedX = offset + BALL_RADIUS + clampedCol * BALL_RADIUS * 2;
  const snappedY = BALL_RADIUS + row * BALL_RADIUS * 1.85;

  // проверить занятость
  const occupied = balls.some(b => Math.abs(b.x - snappedX) < 5 && Math.abs(b.y - snappedY) < 5);
  if (occupied) {
    // сдвинуть в соседнюю свободную ячейку
    for (let dc = 1; dc <= 3; dc++) {
      for (const sign of [-1, 1]) {
        const nc = clampedCol + dc * sign;
        if (nc < 0 || nc >= colsInRow) continue;
        const nx = offset + BALL_RADIUS + nc * BALL_RADIUS * 2;
        if (!balls.some(b => Math.abs(b.x - nx) < 5 && Math.abs(b.y - snappedY) < 5)) {
          return { x: nx, y: snappedY, row, col: nc };
        }
      }
    }
  }
  return { x: snappedX, y: snappedY, row, col: clampedCol };
}

// ─── Применить бонус ──────────────────────────────────────────────────────────
export function applyPowerUp(
  type: PowerUpType,
  hitBall: Ball,
  balls: Ball[],
  canvasWidth: number,
): { removedIds: Set<string>; specialEffect?: string } {
  const removedIds = new Set<string>();

  switch (type) {
    case 'bomb': {
      // взрыв 3x3 (все соседи соседей)
      const neighbors = getNeighbors(hitBall, balls);
      removedIds.add(hitBall.id);
      for (const n of neighbors) {
        removedIds.add(n.id);
        for (const nn of getNeighbors(n, balls)) removedIds.add(nn.id);
      }
      break;
    }
    case 'fireball': {
      // взрыв 5x5
      const visited = new Set<string>([hitBall.id]);
      const queue = [hitBall];
      removedIds.add(hitBall.id);
      for (let depth = 0; depth < 3; depth++) {
        const next: Ball[] = [];
        for (const b of queue) {
          for (const n of getNeighbors(b, balls)) {
            if (!visited.has(n.id)) { visited.add(n.id); removedIds.add(n.id); next.push(n); }
          }
        }
        queue.length = 0;
        queue.push(...next);
      }
      break;
    }
    case 'laser': {
      // вся вертикальная колонна (ближайшие по X)
      removedIds.add(hitBall.id);
      for (const b of balls) {
        if (Math.abs(b.x - hitBall.x) < BALL_RADIUS * 1.5) removedIds.add(b.id);
      }
      break;
    }
    case 'electric': {
      // все шары того же цвета
      removedIds.add(hitBall.id);
      for (const b of balls) {
        if (b.color === hitBall.color) removedIds.add(b.id);
      }
      break;
    }
    case 'magnet': {
      // все соседи одного цвета (BFS)
      const group = findColorGroup(hitBall, balls);
      for (const b of group) removedIds.add(b.id);
      break;
    }
    default:
      removedIds.add(hitBall.id);
      break;
  }

  return { removedIds };
}

// ─── Комбо-система ────────────────────────────────────────────────────────────
export function updateCombo(combo: ComboState, now: number, scored: boolean): ComboState {
  if (!scored) {
    // промах — сброс комбо
    return { ...combo, count: 0, multiplier: 1, isActive: false, expiresAt: 0 };
  }
  const timeSinceLast = now - combo.lastHitTime;
  const inWindow = timeSinceLast < combo.windowMs;

  if (inWindow) {
    const newCount = combo.count + 1;
    const multiplier = Math.min(newCount, COMBO_MAX);
    return {
      ...combo,
      count: newCount,
      multiplier,
      lastHitTime: now,
      isActive: multiplier >= 2,
      expiresAt: now + combo.windowMs,
    };
  } else {
    return {
      ...combo,
      count: 1,
      multiplier: 1,
      lastHitTime: now,
      isActive: false,
      expiresAt: now + combo.windowMs,
    };
  }
}

// ─── Партиклы ─────────────────────────────────────────────────────────────────
export function createBurstParticles(x: number, y: number, color: string, count = 12): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    return {
      id: uid(),
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      alpha: 1,
      radius: 3 + Math.random() * 4,
      life: 1,
      maxLife: 1,
    };
  });
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15,
      vx: p.vx * 0.97,
      life: p.life - 0.03,
      alpha: p.life,
      radius: p.radius * 0.97,
    }))
    .filter(p => p.life > 0);
}

// ─── Плавающий текст ──────────────────────────────────────────────────────────
export function createFloatingText(x: number, y: number, text: string, color: string): FloatingText {
  return { id: uid(), x, y, text, color, life: 1, maxLife: 1 };
}

export function updateFloatingTexts(texts: FloatingText[]): FloatingText[] {
  return texts
    .map(t => ({ ...t, y: t.y - 1.2, life: t.life - 0.02 }))
    .filter(t => t.life > 0);
}

// ─── Рисование на Canvas ──────────────────────────────────────────────────────
export function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  now: number,
  selectedBonus?: PowerUpType | null,
): void {
  const { x, y, radius, color, isBoss, bossHp, bossMaxHp, isPowerUp, powerUpType, frozen } = ball;
  const colorInfo = BALL_COLOR_MAP[color];

  ctx.save();

  // Boss special scale pulsing
  const scale = isBoss
    ? 1 + 0.04 * Math.sin(now / 300)
    : 1;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Frozen overlay
  if (frozen) {
    ctx.globalAlpha = 0.5;
  }

  // Outer glow
  const glowSize = isBoss ? radius * 2.5 : radius * 1.8;
  const gradient = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, glowSize);
  gradient.addColorStop(0, colorInfo.glow + '88');
  gradient.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Ball body
  const bodyGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius);
  bodyGrad.addColorStop(0, colorInfo.stroke);
  bodyGrad.addColorStop(0.6, colorInfo.fill);
  bodyGrad.addColorStop(1, colorInfo.fill + 'cc');
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = colorInfo.stroke;
  ctx.lineWidth = isBoss ? 3 : 2;
  ctx.shadowColor = colorInfo.glow;
  ctx.shadowBlur = isBoss ? 20 : 10;
  ctx.stroke();

  // Shine
  ctx.beginPath();
  ctx.arc(-radius * 0.28, -radius * 0.3, radius * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Boss HP bar
  if (isBoss && bossHp !== undefined && bossMaxHp !== undefined) {
    const barW = radius * 2;
    const barH = 6;
    ctx.fillStyle = '#1a0030';
    ctx.fillRect(-barW / 2, radius + 6, barW, barH);
    const hpRatio = bossHp / bossMaxHp;
    const hpColor = hpRatio > 0.5 ? '#00ff88' : hpRatio > 0.25 ? '#ffe600' : '#ff2d55';
    ctx.fillStyle = hpColor;
    ctx.shadowColor = hpColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(-barW / 2, radius + 6, barW * hpRatio, barH);
    ctx.shadowBlur = 0;
    // Boss emoji
    ctx.font = `${radius * 0.9}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👾', 0, 0);
  }

  // Power-up icon
  if (isPowerUp && powerUpType) {
    const pwColor = POWERUP_COLORS[powerUpType];
    // ring
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = pwColor;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = pwColor;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Frozen ice overlay
  if (frozen) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#64d2ff';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export function drawBullet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: BallColor,
  trail: { x: number; y: number }[],
  isPowerUp?: boolean,
  powerUpType?: PowerUpType,
): void {
  const colorInfo = BALL_COLOR_MAP[color];

  // Trail
  for (let i = 0; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.5;
    const r = BALL_RADIUS * (i / trail.length) * 0.8;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
    ctx.fillStyle = colorInfo.fill + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fill();
  }

  // Bullet
  const grad = ctx.createRadialGradient(x - 6, y - 6, 2, x, y, BALL_RADIUS);
  grad.addColorStop(0, colorInfo.stroke);
  grad.addColorStop(1, colorInfo.fill);
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.shadowColor = colorInfo.glow;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.strokeStyle = colorInfo.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (isPowerUp && powerUpType) {
    const pwColor = POWERUP_COLORS[powerUpType];
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS + 5, 0, Math.PI * 2);
    ctx.strokeStyle = pwColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = pwColor;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

export function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  startX: number, startY: number,
  vx: number, vy: number,
  canvasWidth: number,
  color: string,
): void {
  ctx.save();
  ctx.setLineDash([6, 10]);
  ctx.strokeStyle = color + '60';
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  let x = startX, y = startY, dvx = vx;
  const dvy = vy;
  for (let i = 0; i < 40; i++) {
    x += dvx; y += dvy;
    if (x - BALL_RADIUS < 0) { x = BALL_RADIUS; dvx = Math.abs(dvx); }
    if (x + BALL_RADIUS > canvasWidth) { x = canvasWidth - BALL_RADIUS; dvx = -Math.abs(dvx); }
    if (y < 0) break;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]): void {
  for (const t of texts) {
    ctx.save();
    ctx.globalAlpha = t.life;
    ctx.font = `bold ${18 + (1 - t.life) * 8}px 'Russo One', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = t.color;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

export function calcShootVelocity(
  fromX: number, fromY: number,
  toX: number, toY: number,
  speedMultiplier: number,
): { vx: number; vy: number } {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { vx: 0, vy: -SHOOT_SPEED };
  const speed = SHOOT_SPEED * speedMultiplier;
  return { vx: (dx / len) * speed, vy: (dy / len) * speed };
}

export function getInitialBonusInventory(): Record<PowerUpType, number> {
  return {
    bomb: 0, laser: 0, freeze: 0, multiball: 0, rainbow: 0,
    magnet: 0, shield: 0, slowmo: 0, fireball: 0, electric: 0,
    gravity: 0, time_bonus: 0,
  };
}

export function getInitialCombo(): ComboState {
  return {
    count: 0, multiplier: 1, lastHitTime: 0,
    windowMs: COMBO_WINDOW_MS, isActive: false, expiresAt: 0,
  };
}

// Multiplier label helper
export function comboLabel(multiplier: number): string {
  if (multiplier < 2) return '';
  const labels = ['', '', '2× КОМБО!', '3× ОГОНЬ!', '4× МЕГА!', '5× УЛЬТРА!', '6× БЕШЕНЫЙ!', '7× НЕУДЕРЖИМ!', '8× МАКСИМУМ!'];
  return labels[Math.min(multiplier, 8)] ?? `${multiplier}× МАКС!`;
}

export function comboColor(multiplier: number): string {
  const colors = ['', '', '#ffe600', '#ff7700', '#ff2d55', '#9b30ff', '#00e5ff', '#00ff88', '#ff2d78'];
  return colors[Math.min(multiplier, 8)] ?? '#ff2d78';
}