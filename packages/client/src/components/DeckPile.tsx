import { CardBack } from "./Card.js";

interface Props {
  count: number;
  selectable: boolean;
  onDraw: () => void;
}

export function DeckPile({ count, selectable, onDraw }: Props) {
  return (
    <div className="deck-pile">
      <button
        type="button"
        className={`deck-button ${selectable ? "deck-selectable" : ""}`}
        onClick={selectable ? onDraw : undefined}
        disabled={!selectable}
        aria-label="Dra kort från draghögen"
      >
        <CardBack size="sm" />
        <span className="deck-count">{count}</span>
      </button>
    </div>
  );
}
