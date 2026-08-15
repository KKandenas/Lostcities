export const COLORS = ["petra", "jungle", "dome", "mountain", "angkor"] as const;
export type Color = (typeof COLORS)[number];

export interface NumberCard {
  id: string;
  color: Color;
  kind: "number";
  value: number; // 2..10
}

export interface WagerCard {
  id: string;
  color: Color;
  kind: "wager";
}

export type Card = NumberCard | WagerCard;

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  expeditions: Record<Color, Card[]>;
}

export type TurnPhase = "action" | "draw";

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
  status: GameStatus;
  players: [PlayerState, PlayerState];
  currentPlayerIndex: 0 | 1;
  turnPhase: TurnPhase;
  deck: Card[]; // top of deck = last element
  discardPiles: Record<Color, Card[]>; // top of pile = last element
  winner: 0 | 1 | "tie" | null;
  // Color just discarded to this turn, if any. You can't draw it straight
  // back on the same turn, so this blocks that one pile until the turn ends.
  lastDiscardColor: Color | null;
}

export type Move =
  | { type: "play"; cardId: string }
  | { type: "discard"; cardId: string }
  | { type: "draw"; source: "deck" }
  | { type: "draw"; source: "discard"; color: Color };

export class GameRuleError extends Error {}

export interface ExpeditionScore {
  color: Color;
  cardCount: number;
  wagerCount: number;
  sum: number;
  multiplier: number;
  bonus: number;
  score: number;
}

export interface PlayerScore {
  playerIndex: 0 | 1;
  expeditions: ExpeditionScore[];
  total: number;
}
