import type { Card as CardType, Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";
import { CardView } from "./Card.js";

interface Props {
  color: Color;
  cards: CardType[];
  compact?: boolean;
}

export function ExpeditionPile({ color, cards, compact }: Props) {
  const meta = COLOR_META[color];
  return (
    <div className={`expedition-pile ${compact ? "expedition-compact" : ""}`}>
      <div className="expedition-header" style={{ color: meta.bg }}>
        {meta.label}
      </div>
      {cards.length === 0 ? (
        <div className="expedition-empty">—</div>
      ) : (
        <div className="expedition-stack">
          {cards.map((c, i) => (
            <div key={c.id} className="expedition-stack-item" style={{ top: i * (compact ? 10 : 16) }}>
              <CardView card={c} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
