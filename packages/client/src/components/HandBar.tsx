import { COLORS, type Card as CardType } from "@lostcities/shared";
import { CardView } from "./Card.js";

interface Props {
  cards: CardType[];
  selectedCardId: string | null;
  selectable: boolean;
  onSelect: (cardId: string) => void;
}

function sortHand(cards: CardType[]): CardType[] {
  return [...cards].sort((a, b) => {
    const colorDiff = COLORS.indexOf(a.color) - COLORS.indexOf(b.color);
    if (colorDiff !== 0) return colorDiff;
    const aVal = a.kind === "wager" ? 0 : a.value;
    const bVal = b.kind === "wager" ? 0 : b.value;
    return aVal - bVal;
  });
}

export function HandBar({ cards, selectedCardId, selectable, onSelect }: Props) {
  const sorted = sortHand(cards);
  return (
    <div className="hand-bar">
      {sorted.map((card) => (
        <CardView
          key={card.id}
          card={card}
          size="lg"
          selected={card.id === selectedCardId}
          onClick={selectable ? () => onSelect(card.id) : undefined}
        />
      ))}
    </div>
  );
}
