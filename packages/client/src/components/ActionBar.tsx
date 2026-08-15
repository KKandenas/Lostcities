import type { Card as CardType } from "@lostcities/shared";
import { CardView } from "./Card.js";

interface Props {
  card: CardType;
  canPlay: boolean;
  onPlay: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function ActionBar({ card, canPlay, onPlay, onDiscard, onCancel }: Props) {
  return (
    <div className="action-bar">
      <CardView card={card} size="md" />
      <div className="action-buttons">
        <button type="button" className="btn btn-primary" onClick={onPlay} disabled={!canPlay}>
          Spela på expedition
        </button>
        <button type="button" className="btn" onClick={onDiscard}>
          Kasta
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Avbryt
        </button>
      </div>
      {!canPlay && <p className="action-hint">Kan inte spelas på expeditionen (fel ordning).</p>}
    </div>
  );
}
