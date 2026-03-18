import { useGame } from '@/hooks/useGame';
import MenuScreen from '@/components/game/MenuScreen';
import GameScreen from '@/components/game/GameScreen';
import BossIntroScreen from '@/components/game/BossIntroScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import LevelCompleteScreen from '@/components/game/LevelCompleteScreen';
import RecordsScreen from '@/components/game/RecordsScreen';
import ShopScreen from '@/components/game/ShopScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import TutorialScreen from '@/components/game/TutorialScreen';

export default function Index() {
  const game = useGame();
  const { state, bullet, canvasWidth, canvasHeight, shooterY } = game;

  const W = Math.min(canvasWidth, window.innerWidth);
  const H = Math.min(window.innerHeight, 900);

  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#060912' }}>
      <div className="relative overflow-hidden" style={{ width: W, height: H }}>
        {state.screen === 'menu' && (
          <MenuScreen
            highScore={state.highScore}
            onPlay={() => game.startGame(1)}
            onTutorial={() => game.goTo('tutorial')}
            onRecords={() => game.goTo('records')}
            onShop={() => game.goTo('shop')}
            onSettings={() => game.goTo('settings')}
          />
        )}
        {state.screen === 'tutorial' && (
          <TutorialScreen
            step={state.tutorialStep}
            onNext={game.nextTutorialStep}
            onSkip={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'records' && (
          <RecordsScreen
            highScore={state.highScore}
            onBack={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'shop' && (
          <ShopScreen
            coins={state.coins}
            bonusInventory={state.bonusInventory}
            onBuy={game.buyItem}
            onBack={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'settings' && (
          <SettingsScreen
            settings={state.settings}
            onChange={game.updateSettings}
            onBack={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'boss_intro' && (
          <BossIntroScreen
            level={state.level}
            onContinue={game.resumeFromBossIntro}
          />
        )}
        {state.screen === 'game' && (
          <GameScreen
            state={state}
            bullet={bullet}
            canvasWidth={W}
            canvasHeight={H}
            shooterY={H - 70}
            onAim={game.handleAim}
            onShoot={game.handleShoot}
            onUseBonus={game.useBonus}
            onMenu={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'gameover' && (
          <GameOverScreen
            score={state.score}
            highScore={state.highScore}
            level={state.level}
            totalShots={state.totalShots}
            totalHits={state.totalHits}
            onRestart={() => game.startGame(1)}
            onMenu={() => game.goTo('menu')}
          />
        )}
        {state.screen === 'levelcomplete' && (
          <LevelCompleteScreen
            level={state.level}
            score={state.score}
            bossDefeated={state.bossDefeated}
            coinsEarned={Math.floor(state.score / 50)}
            onNext={() => game.startGame(state.level + 1)}
            onMenu={() => game.goTo('menu')}
          />
        )}
      </div>
    </div>
  );
}
