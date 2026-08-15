import type { Card as CardType } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";

interface Props {
  card: CardType;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  faded?: boolean;
  onClick?: () => void;
}

export function CardView({ card, size = "md", selected, faded, onClick }: Props) {
  const meta = COLOR_META[card.color];
  const label = card.kind === "wager" ? "×" : String(card.value);
  return (
    <button
      type="button"
      className={`card card-${size} ${selected ? "card-selected" : ""} ${faded ? "card-faded" : ""} ${onClick ? "card-clickable" : ""}`}
      style={{ background: meta.bg, color: meta.fg, borderColor: meta.accent }}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="card-label">{label}</span>
      <span className="card-color-name">{meta.label}</span>
    </button>
  );
}

export function CardBack({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <div className={`card card-back card-${size}`} aria-hidden />;
}
