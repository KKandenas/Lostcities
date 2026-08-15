import type { Card as CardType } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";

interface Props {
  card: CardType;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  faded?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

export function CardView({ card, size = "md", selected, faded, highlight, onClick }: Props) {
  const meta = COLOR_META[card.color];
  const image = card.kind === "wager" ? meta.wagerImage : meta.image;
  return (
    <button
      type="button"
      className={`card card-${size} ${selected ? "card-selected" : ""} ${faded ? "card-faded" : ""} ${highlight ? "card-highlight" : ""} ${onClick ? "card-clickable" : ""}`}
      style={{ backgroundImage: `url(${image})`, borderColor: meta.accent }}
      onClick={onClick}
      disabled={!onClick}
    >
      {card.kind === "number" && (
        <span className="card-value-badge" style={{ background: meta.accent, color: meta.labelFg }}>
          {card.value}
        </span>
      )}
    </button>
  );
}

export function CardBack({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <div className={`card card-back card-${size}`} aria-hidden />;
}
