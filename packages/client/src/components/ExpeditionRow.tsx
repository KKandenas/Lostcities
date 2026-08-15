import { COLORS, type Card as CardType, type Color } from "@lostcities/shared";
import { ExpeditionPile } from "./ExpeditionPile.js";

interface Props {
  expeditions: Record<Color, CardType[]>;
  compact?: boolean;
}

export function ExpeditionRow({ expeditions, compact }: Props) {
  return (
    <div className="expedition-row">
      {COLORS.map((color) => (
        <ExpeditionPile key={color} color={color} cards={expeditions[color]} compact={compact} />
      ))}
    </div>
  );
}
