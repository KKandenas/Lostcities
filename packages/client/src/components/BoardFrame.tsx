import { COLORS, type Card as CardType, type Color } from "@lostcities/shared";
import { CardView } from "./Card.js";
import { DeckPile } from "./DeckPile.js";
import { ExpeditionPile } from "./ExpeditionPile.js";

interface Props {
  opponentExpeditions: Record<Color, CardType[]>;
  myExpeditions: Record<Color, CardType[]>;
  discardPiles: Record<Color, CardType[]>;
  selectableDiscardColors: Set<Color>;
  onDrawDiscard: (color: Color) => void;
  deckCount: number;
  deckSelectable: boolean;
  onDrawDeck: () => void;
}

// Measured from the board banner artwork: each of the 5 name tiles is an
// equal 1/5 slice, and the framed illustration box inside a tile spans
// roughly x:[0.1105, 0.8840] and y:[0.4110, 0.8904] of that tile.
const TILE_FRAME = { left: 0.1105, width: 0.884 - 0.1105, top: 0.411, height: 0.8904 - 0.411 };

export function BoardFrame({
  opponentExpeditions,
  myExpeditions,
  discardPiles,
  selectableDiscardColors,
  onDrawDiscard,
  deckCount,
  deckSelectable,
  onDrawDeck,
}: Props) {
  return (
    <div className="board-frame">
      <div className="board-deck-corner">
        <DeckPile count={deckCount} selectable={deckSelectable} onDraw={onDrawDeck} />
      </div>

      {COLORS.map((color, i) => (
        <div key={`opp-${color}`} className="board-slot" style={{ gridColumn: i + 1, gridRow: 1 }}>
          <ExpeditionPile color={color} cards={opponentExpeditions[color]} hideLabel flip />
        </div>
      ))}

      <div className="board-banner-strip" style={{ gridColumn: "1 / 6", gridRow: 2 }}>
        <img className="board-banner-image" src="/cards/board-banner.jpg" alt="Spelbräde" />
        {COLORS.map((color, i) => {
          const pile = discardPiles[color];
          const top = pile[pile.length - 1];
          const selectable = selectableDiscardColors.has(color);
          const leftPct = ((i + TILE_FRAME.left) / 5) * 100;
          const widthPct = (TILE_FRAME.width / 5) * 100;
          return (
            <div
              key={`slot-${color}`}
              className="board-banner-slot"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                top: `${TILE_FRAME.top * 100}%`,
                height: `${TILE_FRAME.height * 100}%`,
              }}
            >
              {top && (
                <>
                  <CardView card={top} size="sm" onClick={selectable ? () => onDrawDiscard(color) : undefined} />
                  <span className="board-banner-count">{pile.length}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {COLORS.map((color, i) => (
        <div key={`mine-${color}`} className="board-slot" style={{ gridColumn: i + 1, gridRow: 3 }}>
          <ExpeditionPile color={color} cards={myExpeditions[color]} hideLabel />
        </div>
      ))}
    </div>
  );
}
