interface RecordsScreenProps {
  highScore: number;
  onBack: () => void;
}

// Fake leaderboard for atmosphere
const FAKE_LEADERS = [
  { name: 'КосмоСтрелок', score: 48200, level: 32 },
  { name: 'ШарОлог', score: 37500, level: 28 },
  { name: 'НеонМастер', score: 29100, level: 22 },
  { name: 'ГалактикаX', score: 21300, level: 18 },
  { name: 'БосоНога', score: 16700, level: 14 },
  { name: 'ТурбоШар', score: 12400, level: 11 },
  { name: 'Снайпер99', score: 9800, level: 9 },
  { name: 'АркадаQueen', score: 7200, level: 7 },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RecordsScreen({ highScore, onBack }: RecordsScreenProps) {
  const allLeaders = [...FAKE_LEADERS];
  if (highScore > 0) {
    allLeaders.push({ name: '👤 Ты', score: highScore, level: 0 });
    allLeaders.sort((a, b) => b.score - a.score);
  }
  const myRank = highScore > 0 ? allLeaders.findIndex(l => l.name === '👤 Ты') + 1 : null;

  return (
    <div className="flex flex-col h-full w-full game-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'rgba(155,48,255,0.3)' }}>
        <button onClick={onBack} className="p-2 rounded-xl active:scale-90 transition-all"
          style={{ color: 'rgba(155,48,255,0.7)', background: 'rgba(155,48,255,0.1)' }}>
          ←
        </button>
        <h2 className="text-2xl font-russo neon-text-purple">🏆 РЕКОРДЫ</h2>
      </div>

      {/* My score */}
      {highScore > 0 && (
        <div className="mx-4 mt-4 p-4 rounded-2xl border animate-neon-pulse"
          style={{ background: 'rgba(255,230,0,0.08)', borderColor: 'rgba(255,230,0,0.4)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-rubik" style={{ color: 'rgba(255,230,0,0.6)' }}>МОЙ РЕКОРД</div>
              <div className="text-3xl font-russo neon-text-yellow">{highScore.toLocaleString()}</div>
            </div>
            {myRank && (
              <div className="text-right">
                <div className="text-xs font-rubik" style={{ color: 'rgba(255,230,0,0.6)' }}>МЕСТО</div>
                <div className="text-3xl font-russo neon-text-yellow">#{myRank}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {allLeaders.map((leader, i) => {
          const isMe = leader.name === '👤 Ты';
          return (
            <div key={i}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
              style={{
                background: isMe ? 'rgba(255,230,0,0.1)' : 'rgba(155,48,255,0.06)',
                borderColor: isMe ? 'rgba(255,230,0,0.4)' : 'rgba(155,48,255,0.2)',
              }}>
              <div className="text-xl w-8 text-center font-russo"
                style={{ color: i < 3 ? '#ffe600' : 'rgba(255,255,255,0.4)' }}>
                {i < 3 ? MEDALS[i] : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <div className="font-russo text-sm" style={{ color: isMe ? '#ffe600' : '#e0c8ff' }}>
                  {leader.name}
                </div>
                {leader.level > 0 && (
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Уровень {leader.level}
                  </div>
                )}
              </div>
              <div className="font-russo text-base" style={{ color: isMe ? '#ffe600' : '#00e5ff' }}>
                {leader.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
