import type { Card as CardType, Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";
import { CardView } from "./Card.js";

interface Props {
  color: Color;
  cards: CardType[];
  hideLabel?: boolean;
}

export function ExpeditionPile({ color, cards, hideLabel }: Props) {
  const meta = COLOR_META[color];
  const top = cards[cards.length - 1];
  return (
    <div className="expedition-pile">
      {!hideLabel && (
        <div className="expedition-header" style={{ color: meta.accent }}>
          {meta.label}
        </div>
      )}
      {top ? (
        <div className="expedition-top">
          <CardView card={top} size="sm" />
          {cards.length > 1 && <span className="expedition-count">{cards.length}</span>}
        </div>
      ) : (
        <div className="expedition-empty">—</div>
      )}
    </div>
  );
}
