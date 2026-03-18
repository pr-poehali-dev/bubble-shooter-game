export type BallColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'orange' | 'pink' | 'boss';

export interface Ball {
  id: string;
  x: number;
  y: number;
  color: BallColor;
  radius: number;
  row: number;
  col: number;
  isBoss?: boolean;
  bossHp?: number;
  bossMaxHp?: number;
  special?: BossSpecial;
  isBlinking?: boolean;
  isPowerUp?: boolean;
  powerUpType?: PowerUpType;
  frozen?: boolean;
  isNew?: boolean;
}

export type BossSpecial = 'shield' | 'split' | 'gravity' | 'mirror';

export type PowerUpType =
  | 'bomb'       // взрыв 3x3
  | 'laser'      // вся колонна
  | 'freeze'     // заморозить шарики
  | 'multiball'  // 3 шарика сразу
  | 'rainbow'    // любой цвет
  | 'magnet'     // притягивает соседей
  | 'shield'     // защита от потери хода
  | 'slowmo'     // замедление движения поля вниз
  | 'fireball'   // огненный шар (5x5)
  | 'electric'   // цепная молния по одному цвету
  | 'gravity'    // перевернуть поле
  | 'time_bonus'; // +10 секунд

export interface ShooterBall {
  color: BallColor;
  isPowerUp?: boolean;
  powerUpType?: PowerUpType;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface ComboState {
  count: number;         // кол-во быстрых попаданий подряд
  multiplier: number;    // текущий множитель x1..x8
  lastHitTime: number;   // timestamp последнего попадания
  windowMs: number;      // окно времени для комбо (мс)
  isActive: boolean;
  expiresAt: number;
}

export interface GameState {
  screen: 'menu' | 'game' | 'records' | 'shop' | 'settings' | 'tutorial' | 'boss_intro' | 'gameover' | 'levelcomplete';
  level: number;
  score: number;
  highScore: number;
  lives: number;
  maxLives: number;
  balls: Ball[];
  shooter: ShooterBall;
  nextBall: ShooterBall;
  aimAngle: number;
  isAiming: boolean;
  isShooting: boolean;
  shootPos: { x: number; y: number } | null;
  shootVel: { vx: number; vy: number } | null;
  particles: Particle[];
  floatingTexts: FloatingText[];
  combo: ComboState;
  activeBonus: PowerUpType | null;
  bonusInventory: Record<PowerUpType, number>;
  coins: number;
  shopItems: ShopItem[];
  settings: GameSettings;
  difficulty: DifficultyConfig;
  isBossLevel: boolean;
  bossDefeated: boolean;
  tutorialStep: number;
  fieldDropTimer: number;
  fieldDropInterval: number;
  gameTime: number;
  frozenUntil: number;
  slowmoUntil: number;
  shieldActive: boolean;
  gravityFlipped: boolean;
  rowsToAdd: number;
  totalShots: number;
  totalHits: number;
}

export interface ShopItem {
  type: PowerUpType;
  name: string;
  desc: string;
  price: number;
  emoji: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  showTrajectory: boolean;
  theme: 'neon' | 'space' | 'candy';
}

export interface DifficultyConfig {
  colors: number;          // кол-во цветов (2-8)
  ballRows: number;        // кол-во рядов шариков (2-12)
  dropInterval: number;    // интервал падения поля (мс)
  bossHp: number;          // HP босса
  powerUpChance: number;   // шанс появления бонуса (0-1)
  speedMultiplier: number; // скорость шарика стрелка
  rowsPerDrop: number;     // рядов добавляется за раз
}
