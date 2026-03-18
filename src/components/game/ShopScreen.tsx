import type { PowerUpType } from '@/game/types';
import { SHOP_ITEMS } from '@/game/constants';

interface ShopScreenProps {
  coins: number;
  bonusInventory: Record<PowerUpType, number>;
  onBuy: (type: PowerUpType) => void;
  onBack: () => void;
}

export default function ShopScreen({ coins, bonusInventory, onBuy, onBack }: ShopScreenProps) {
  return (
    <div className="flex flex-col h-full w-full game-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(155,48,255,0.3)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl active:scale-90 transition-all"
            style={{ color: 'rgba(155,48,255,0.7)', background: 'rgba(155,48,255,0.1)' }}>
            ←
          </button>
          <h2 className="text-2xl font-russo neon-text-purple">🛍️ МАГАЗИН</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
          style={{ background: 'rgba(255,230,0,0.1)', borderColor: 'rgba(255,230,0,0.4)' }}>
          <span className="text-lg">🪙</span>
          <span className="font-russo neon-text-yellow">{coins}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-2 text-xs font-rubik" style={{ color: 'rgba(155,48,255,0.6)' }}>
        Монеты зарабатываются при уничтожении шариков в игре
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map(item => {
            const canBuy = coins >= item.price;
            const owned = bonusInventory[item.type] ?? 0;
            return (
              <div key={item.type}
                className="flex flex-col rounded-2xl border p-3 gap-2"
                style={{
                  background: canBuy ? 'rgba(155,48,255,0.08)' : 'rgba(155,48,255,0.03)',
                  borderColor: canBuy ? 'rgba(155,48,255,0.35)' : 'rgba(155,48,255,0.15)',
                }}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{item.emoji}</span>
                  {owned > 0 && (
                    <span className="text-xs font-russo px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,136,0.2)', color: '#00ff88' }}>
                      ×{owned}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-russo text-sm" style={{ color: '#e0c8ff' }}>{item.name}</div>
                  <div className="text-xs font-rubik mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => canBuy && onBuy(item.type)}
                  disabled={!canBuy}
                  className="w-full py-2 rounded-xl font-russo text-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                  style={{
                    background: canBuy
                      ? 'linear-gradient(135deg, #9b30ff, #ff2d78)'
                      : 'rgba(255,255,255,0.05)',
                    color: canBuy ? '#fff' : 'rgba(255,255,255,0.3)',
                    boxShadow: canBuy ? '0 0 15px rgba(155,48,255,0.4)' : 'none',
                  }}
                >
                  <span>🪙</span>
                  <span>{item.price}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
