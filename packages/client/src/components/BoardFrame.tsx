import { COLORS, type Card as CardType, type Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";
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
      {COLORS.map((color) => (
        <div key={`opp-${color}`} className="board-slot board-slot-opponent">
          <ExpeditionPile color={color} cards={opponentExpeditions[color]} hideLabel />
        </div>
      ))}
      <div className="board-slot board-slot-spacer" aria-hidden />

      {COLORS.map((color) => {
        const pile = discardPiles[color];
        const top = pile[pile.length - 1];
        const selectable = selectableDiscardColors.has(color);
        const meta = COLOR_META[color];
        return (
          <div key={`city-${color}`} className="board-slot board-slot-city" style={{ borderColor: meta.accent }}>
            <img className="board-slot-banner" src={meta.labelImage} alt={meta.label} />
            <div className="board-slot-rect">
              {top ? (
                <CardView card={top} size="sm" onClick={selectable ? () => onDrawDiscard(color) : undefined} />
              ) : (
                <div className="board-slot-empty" />
              )}
            </div>
          </div>
        );
      })}
      <div className="board-slot board-slot-deck">
        <DeckPile count={deckCount} selectable={deckSelectable} onDraw={onDrawDeck} />
      </div>

      {COLORS.map((color) => (
        <div key={`mine-${color}`} className="board-slot board-slot-mine">
          <ExpeditionPile color={color} cards={myExpeditions[color]} hideLabel />
        </div>
      ))}
      <div className="board-slot board-slot-spacer" aria-hidden />
    </div>
  );
}
