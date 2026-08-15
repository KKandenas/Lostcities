interface Props {
  myName: string;
  myScore: number;
  opponentName: string;
  opponentScore: number;
}

export function ScoreBar({ myName, myScore, opponentName, opponentScore }: Props) {
  return (
    <div className="score-bar">
      <span>
        {opponentName}: <strong>{opponentScore}</strong>
      </span>
      <span className="score-hint">preliminärt</span>
      <span>
        {myName}: <strong>{myScore}</strong>
      </span>
    </div>
  );
}
