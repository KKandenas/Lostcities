import { COLORS, scoreExpedition, type Card, type Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";

interface Props {
  winner: 0 | 1 | "tie";
  viewerIndex: 0 | 1;
  myName: string;
  opponentName: string;
  myExpeditions: Record<Color, Card[]>;
  opponentExpeditions: Record<Color, Card[]>;
  onLeave: () => void;
}

export function GameOverModal({ winner, viewerIndex, myName, opponentName, myExpeditions, opponentExpeditions, onLeave }: Props) {
  const myScores = COLORS.map((c) => scoreExpedition(c, myExpeditions[c]));
  const oppScores = COLORS.map((c) => scoreExpedition(c, opponentExpeditions[c]));
  const myTotal = myScores.reduce((s, e) => s + e.score, 0);
  const oppTotal = oppScores.reduce((s, e) => s + e.score, 0);

  const resultText =
    winner === "tie" ? "Oavgjort!" : winner === viewerIndex ? "Du vann! 🎉" : `${opponentName} vann`;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{resultText}</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th></th>
              {COLORS.map((c) => (
                <th key={c} style={{ color: COLOR_META[c].accent }}>
                  {COLOR_META[c].label}
                </th>
              ))}
              <th>Totalt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{myName}</td>
              {myScores.map((s) => (
                <td key={s.color}>{s.score}</td>
              ))}
              <td>
                <strong>{myTotal}</strong>
              </td>
            </tr>
            <tr>
              <td>{opponentName}</td>
              {oppScores.map((s) => (
                <td key={s.color}>{s.score}</td>
              ))}
              <td>
                <strong>{oppTotal}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="button" className="btn btn-primary" onClick={onLeave}>
          Till startsidan
        </button>
      </div>
    </div>
  );
}
