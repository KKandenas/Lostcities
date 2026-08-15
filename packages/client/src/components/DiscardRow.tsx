import { COLORS, type Card as CardType, type Color } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";
import { CardView } from "./Card.js";

interface Props {
  piles: Record<Color, CardType[]>;
  selectableColors: Set<Color>;
  onDraw: (color: Color) => void;
}

export function DiscardRow({ piles, selectableColors, onDraw }: Props) {
  return (
    <div className="discard-row">
      {COLORS.map((color) => {
        const pile = piles[color];
        const top = pile[pile.length - 1];
        const selectable = selectableColors.has(color);
        return (
          <div key={color} className="discard-pile">
            {top ? (
              <CardView card={top} size="sm" onClick={selectable ? () => onDraw(color) : undefined} />
            ) : (
              <div
                className="discard-empty"
                style={{ borderColor: COLOR_META[color].bg, color: COLOR_META[color].bg }}
              >
                {COLOR_META[color].label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
