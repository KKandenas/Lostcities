import type { Card as CardType, Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";
import { CardView } from "./Card.js";

interface Props {
  color: Color;
  cards: CardType[];
  hideLabel?: boolean;
  flip?: boolean;
}

const CARD_HEIGHT_REM = 3.4;
const STACK_PEEK_REM = 1.15;

export function ExpeditionPile({ color, cards, hideLabel, flip }: Props) {
  const meta = COLOR_META[color];
  return (
    <div className="expedition-pile">
      {!hideLabel && (
        <div className="expedition-header" style={{ color: meta.accent }}>
          {meta.label}
        </div>
      )}
      {cards.length === 0 ? (
        <div className="expedition-empty">—</div>
      ) : (
        <div
          className={`expedition-stack ${flip ? "expedition-stack-flipped" : ""}`}
          style={{ height: `${CARD_HEIGHT_REM + (cards.length - 1) * STACK_PEEK_REM}rem` }}
        >
          {cards.map((c, i) => (
            <div key={c.id} className="expedition-stack-item" style={{ top: `${i * STACK_PEEK_REM}rem` }}>
              <CardView card={c} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
