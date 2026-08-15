import { createDeck, shuffle } from "./deck.js";
import { scoreGame } from "./scoring.js";
import { Card, COLORS, Color, GameRuleError, GameState, Move, PlayerState } from "./types.js";

const HAND_SIZE = 8;

function emptyExpeditions(): Record<Color, Card[]> {
  return { petra: [], jungle: [], dome: [], mountain: [], angkor: [] };
}

export function createGame(
  player0: { id: string; name: string },
  player1: { id: string; name: string },
  rng: () => number = Math.random,
): GameState {
  const deck = shuffle(createDeck(), rng);
  const hand0 = deck.splice(0, HAND_SIZE);
  const hand1 = deck.splice(0, HAND_SIZE);

  const players: [PlayerState, PlayerState] = [
    { id: player0.id, name: player0.name, hand: hand0, expeditions: emptyExpeditions() },
    { id: player1.id, name: player1.name, hand: hand1, expeditions: emptyExpeditions() },
  ];

  return {
    status: "playing",
    players,
    currentPlayerIndex: 0,
    turnPhase: "action",
    deck,
    discardPiles: { petra: [], jungle: [], dome: [], mountain: [], angkor: [] },
    winner: null,
    lastDiscardColor: null,
  };
}

export function canPlayToExpedition(pile: Card[], card: Card): boolean {
  if (card.kind === "wager") {
    return pile.every((c) => c.kind === "wager");
  }
  const lastNumber = [...pile].reverse().find((c): c is Extract<Card, { kind: "number" }> => c.kind === "number");
  return !lastNumber || card.value > lastNumber.value;
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: [
      { ...state.players[0], hand: [...state.players[0].hand], expeditions: cloneExpeditions(state.players[0].expeditions) },
      { ...state.players[1], hand: [...state.players[1].hand], expeditions: cloneExpeditions(state.players[1].expeditions) },
    ],
    deck: [...state.deck],
    discardPiles: cloneExpeditions(state.discardPiles),
  };
}

function cloneExpeditions(exp: Record<Color, Card[]>): Record<Color, Card[]> {
  const out = {} as Record<Color, Card[]>;
  for (const color of COLORS) out[color] = [...exp[color]];
  return out;
}

function removeFromHand(hand: Card[], cardId: string): Card {
  const idx = hand.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new GameRuleError(`Card ${cardId} not in hand`);
  return hand.splice(idx, 1)[0];
}

export function applyMove(state: GameState, playerIndex: 0 | 1, move: Move): GameState {
  if (state.status !== "playing") {
    throw new GameRuleError("Game is not in progress");
  }
  if (state.currentPlayerIndex !== playerIndex) {
    throw new GameRuleError("Not your turn");
  }

  const next = cloneState(state);
  const player = next.players[playerIndex];

  if (move.type === "play" || move.type === "discard") {
    if (next.turnPhase !== "action") {
      throw new GameRuleError("You must draw a card before playing again");
    }
    const card = removeFromHand(player.hand, move.cardId);

    if (move.type === "play") {
      if (!canPlayToExpedition(player.expeditions[card.color], card)) {
        throw new GameRuleError("Illegal expedition move");
      }
      player.expeditions[card.color].push(card);
      next.lastDiscardColor = null;
    } else {
      next.discardPiles[card.color].push(card);
      next.lastDiscardColor = card.color;
    }
    next.turnPhase = "draw";
    return next;
  }

  if (move.type === "draw") {
    if (next.turnPhase !== "draw") {
      throw new GameRuleError("You must play or discard a card first");
    }
    let drawn: Card | undefined;
    if (move.source === "deck") {
      drawn = next.deck.pop();
      if (!drawn) throw new GameRuleError("Deck is empty");
    } else {
      if (move.color === next.lastDiscardColor) {
        throw new GameRuleError("You can't draw the card you just discarded");
      }
      const pile = next.discardPiles[move.color];
      drawn = pile.pop();
      if (!drawn) throw new GameRuleError("Discard pile is empty");
    }
    player.hand.push(drawn);
    next.lastDiscardColor = null;

    if (next.deck.length === 0) {
      next.status = "finished";
      const [s0, s1] = scoreGame(next);
      next.winner = s0.total === s1.total ? "tie" : s0.total > s1.total ? 0 : 1;
    } else {
      next.currentPlayerIndex = playerIndex === 0 ? 1 : 0;
      next.turnPhase = "action";
    }
    return next;
  }

  throw new GameRuleError("Unknown move");
}

export function legalDrawSources(state: GameState): { deck: boolean; discard: Partial<Record<Color, boolean>> } {
  const discard: Partial<Record<Color, boolean>> = {};
  for (const color of COLORS) {
    discard[color] = state.discardPiles[color].length > 0;
  }
  return { deck: state.deck.length > 0, discard };
}
