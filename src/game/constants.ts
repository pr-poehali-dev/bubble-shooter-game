import type { BallColor, PowerUpType, ShopItem, GameSettings } from './types';

export const BALL_RADIUS = 22;
export const BALL_DIAMETER = BALL_RADIUS * 2;
export const SHOOTER_Y_OFFSET = 80; // px from bottom

export const BALL_COLORS: BallColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange', 'pink'];

export const BALL_COLOR_MAP: Record<BallColor, { fill: string; glow: string; stroke: string }> = {
  red:    { fill: '#ff2d55', glow: '#ff2d55', stroke: '#ff6b8a' },
  blue:   { fill: '#0a84ff', glow: '#0a84ff', stroke: '#5ac8fa' },
  green:  { fill: '#00ff88', glow: '#00ff88', stroke: '#34c759' },
  yellow: { fill: '#ffe600', glow: '#ffe600', stroke: '#ffd60a' },
  purple: { fill: '#9b30ff', glow: '#9b30ff', stroke: '#bf5af2' },
  cyan:   { fill: '#00e5ff', glow: '#00e5ff', stroke: '#64d2ff' },
  orange: { fill: '#ff7700', glow: '#ff7700', stroke: '#ff9f0a' },
  pink:   { fill: '#ff2d78', glow: '#ff2d78', stroke: '#ff6ec7' },
  boss:   { fill: '#1a0030', glow: '#9b30ff', stroke: '#bf5af2' },
};

export const POWERUP_COLORS: Record<PowerUpType, string> = {
  bomb:        '#ff7700',
  laser:       '#00e5ff',
  freeze:      '#64d2ff',
  multiball:   '#ffe600',
  rainbow:     '#ff2d78',
  magnet:      '#9b30ff',
  shield:      '#00ff88',
  slowmo:      '#0a84ff',
  fireball:    '#ff2d55',
  electric:    '#ffe600',
  gravity:     '#bf5af2',
  time_bonus:  '#00e5ff',
};

export const POWERUP_EMOJI: Record<PowerUpType, string> = {
  bomb:        '💣',
  laser:       '⚡',
  freeze:      '❄️',
  multiball:   '🎯',
  rainbow:     '🌈',
  magnet:      '🧲',
  shield:      '🛡️',
  slowmo:      '⏳',
  fireball:    '🔥',
  electric:    '⚡',
  gravity:     '🔄',
  time_bonus:  '⏱️',
};

export const SHOP_ITEMS: ShopItem[] = [
  { type: 'bomb',       name: 'Бомба',        desc: 'Взрыв 3×3 шарика вокруг цели',   price: 50,  emoji: '💣' },
  { type: 'laser',      name: 'Лазер',        desc: 'Уничтожает всю колонну',           price: 80,  emoji: '⚡' },
  { type: 'freeze',     name: 'Заморозка',    desc: 'Поле не двигается 10 секунд',      price: 60,  emoji: '❄️' },
  { type: 'multiball',  name: 'Мульти-шар',   desc: '3 шарика одновременно',            price: 90,  emoji: '🎯' },
  { type: 'rainbow',    name: 'Радуга',       desc: 'Следующий шар — любой цвет',       price: 70,  emoji: '🌈' },
  { type: 'magnet',     name: 'Магнит',       desc: 'Притягивает соседей того же цвета',price: 65,  emoji: '🧲' },
  { type: 'shield',     name: 'Щит',          desc: 'Защита от одного промаха',         price: 40,  emoji: '🛡️' },
  { type: 'slowmo',     name: 'Замедление',   desc: 'Поле замедляется на 15 секунд',    price: 55,  emoji: '⏳' },
  { type: 'fireball',   name: 'Огненный шар', desc: 'Взрыв 5×5 шариков',               price: 120, emoji: '🔥' },
  { type: 'electric',   name: 'Молния',       desc: 'Цепная реакция по всем одного цвета', price: 100, emoji: '⚡' },
  { type: 'gravity',    name: 'Гравитация',   desc: 'Переворачивает поле на 5 секунд',  price: 110, emoji: '🔄' },
  { type: 'time_bonus', name: 'Время+',       desc: '+10 секунд к таймеру',             price: 45,  emoji: '⏱️' },
];

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  showTrajectory: true,
  theme: 'neon',
};

export const MIN_MATCH = 3; // минимум шаров для взрыва
export const COMBO_WINDOW_MS = 2500; // 2.5 секунды для комбо
export const COMBO_MAX = 8; // максимальный множитель x8
export const SHOOT_SPEED = 14; // px per frame base

export const SCORE_PER_BALL = 10;
export const SCORE_BOSS_KILL = 500;

// Конфигурация сложности по уровням
export function getDifficultyForLevel(level: number) {
  const isBossLevel = level % 10 === 0 && level > 0;
  // Базовые параметры
  const colors = Math.min(2 + Math.floor(level / 3), 8);
  const ballRows = Math.min(3 + Math.floor(level / 4), 10);
  const dropInterval = Math.max(12000 - level * 300, 3000);
  const bossHp = 3 + Math.floor(level / 10) * 2;
  const powerUpChance = Math.min(0.05 + level * 0.005, 0.2);
  const speedMultiplier = 1 + level * 0.02;
  const rowsPerDrop = level >= 20 ? 2 : 1;

  return {
    colors,
    ballRows,
    dropInterval,
    bossHp,
    powerUpChance,
    speedMultiplier,
    rowsPerDrop,
    isBossLevel,
  };
}

// Усложнения по уровням (10+)
export const LEVEL_MODIFIERS = [
  { level: 3,  label: '🌀 Больше цветов',         desc: 'Добавлен новый цвет шариков' },
  { level: 5,  label: '⬇️ Поле опускается',        desc: 'Шарики начинают двигаться вниз' },
  { level: 7,  label: '🧊 Замороженные шары',      desc: 'Появляются шары, которые не взрываются с первого раза' },
  { level: 10, label: '👾 БОСС!',                  desc: 'Каждые 10 уровней — мегабосс' },
  { level: 12, label: '💨 Ускорение поля',         desc: 'Поле опускается быстрее' },
  { level: 15, label: '🔀 Перетасовка',            desc: 'Поле перетасовывается каждые 30 секунд' },
  { level: 18, label: '🌑 Тёмные шары',            desc: 'Появляются невидимые шары' },
  { level: 20, label: '💥 Двойное падение',        desc: 'Поле добавляет 2 ряда за раз' },
  { level: 25, label: '🔮 Порталы',                desc: 'Шарики могут телепортироваться' },
  { level: 30, label: '🪞 Зеркало',               desc: 'Отражение траектории меняется случайно' },
  { level: 35, label: '💣 Мины',                   desc: 'Случайные шарики — мины, взрывающие соседей' },
  { level: 40, label: '⏱️ Таймер',                desc: 'Добавлен жёсткий таймер на ход' },
];
