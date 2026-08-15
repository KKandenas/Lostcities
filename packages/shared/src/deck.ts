import { Card, COLORS } from "./types.js";

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const color of COLORS) {
    for (let i = 1; i <= 3; i++) {
      deck.push({ id: `${color}-wager-${i}`, color, kind: "wager" });
    }
    for (let value = 2; value <= 10; value++) {
      deck.push({ id: `${color}-${value}`, color, kind: "number", value });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
