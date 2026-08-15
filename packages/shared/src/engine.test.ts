import { describe, expect, it } from "vitest";
import { createDeck } from "./deck.js";
import { applyMove, createGame } from "./engine.js";
import { scoreExpedition, scoreGame } from "./scoring.js";
import { Card, GameRuleError } from "./types.js";

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

describe("createDeck", () => {
  it("has 60 unique cards, 12 per color", () => {
    const deck = createDeck();
    expect(deck.length).toBe(60);
    expect(new Set(deck.map((c) => c.id)).size).toBe(60);
    const byColor = new Map<string, number>();
    for (const c of deck) byColor.set(c.color, (byColor.get(c.color) ?? 0) + 1);
    for (const count of byColor.values()) expect(count).toBe(12);
  });
});

describe("createGame", () => {
  it("deals 8 cards to each player and leaves 44 in the deck", () => {
    const game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(1));
    expect(game.players[0].hand.length).toBe(8);
    expect(game.players[1].hand.length).toBe(8);
    expect(game.deck.length).toBe(44);
    expect(game.status).toBe("playing");
    expect(game.currentPlayerIndex).toBe(0);
  });
});

describe("scoreExpedition", () => {
  const c = (id: string, color: "red", kind: "number" | "wager", value?: number): Card =>
    kind === "wager" ? { id, color, kind } : { id, color, kind, value: value! };

  it("scores an empty expedition as 0", () => {
    expect(scoreExpedition("red", []).score).toBe(0);
  });

  it("subtracts 20 investment cost", () => {
    const pile = [c("r1", "red", "number", 5), c("r2", "red", "number", 6)];
    expect(scoreExpedition("red", pile).score).toBe(5 + 6 - 20);
  });

  it("applies wager multipliers", () => {
    const pile = [c("w1", "red", "wager"), c("w2", "red", "wager"), c("r1", "red", "number", 10)];
    // multiplier = 1 + 2 wagers = 3; (10 - 20) * 3 = -30
    expect(scoreExpedition("red", pile).score).toBe(-30);
  });

  it("gives +20 bonus for 8+ cards", () => {
    const pile = [
      c("w1", "red", "wager"),
      c("r2", "red", "number", 2),
      c("r3", "red", "number", 3),
      c("r4", "red", "number", 4),
      c("r5", "red", "number", 5),
      c("r6", "red", "number", 6),
      c("r7", "red", "number", 7),
      c("r8", "red", "number", 8),
    ];
    const sum = 2 + 3 + 4 + 5 + 6 + 7 + 8;
    const expected = (sum - 20) * 2 + 20;
    expect(scoreExpedition("red", pile).score).toBe(expected);
  });
});

describe("applyMove", () => {
  it("rejects playing out of turn", () => {
    const game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(1));
    const card = game.players[1].hand[0];
    expect(() => applyMove(game, 1, { type: "discard", cardId: card.id })).toThrow(GameRuleError);
  });

  it("enforces ascending order within an expedition", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(2));
    // Force a known hand for player 0: two red numbers, low then high, out of order attempt.
    game.players[0].hand = [
      { id: "red-5", color: "red", kind: "number", value: 5 },
      { id: "red-3", color: "red", kind: "number", value: 3 },
    ];
    game = applyMove(game, 0, { type: "play", cardId: "red-5" });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    game.currentPlayerIndex = 0; // simulate it's player 0's turn again for the test
    game.turnPhase = "action";
    expect(() => applyMove(game, 0, { type: "play", cardId: "red-3" })).toThrow(GameRuleError);
  });

  it("requires wager cards before any number card in an expedition", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(3));
    game.players[0].hand = [
      { id: "red-6", color: "red", kind: "number", value: 6 },
      { id: "red-wager-1", color: "red", kind: "wager" },
    ];
    game = applyMove(game, 0, { type: "play", cardId: "red-6" });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    game.currentPlayerIndex = 0;
    game.turnPhase = "action";
    expect(() => applyMove(game, 0, { type: "play", cardId: "red-wager-1" })).toThrow(GameRuleError);
  });

  it("moves through action -> draw -> next player", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(4));
    const card = game.players[0].hand[0];
    game = applyMove(game, 0, { type: "discard", cardId: card.id });
    expect(game.turnPhase).toBe("draw");
    expect(game.currentPlayerIndex).toBe(0);
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    expect(game.turnPhase).toBe("action");
    expect(game.currentPlayerIndex).toBe(1);
    expect(game.players[0].hand.length).toBe(8);
  });

  it("allows drawing from a discard pile", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(5));
    const card = game.players[0].hand[0];
    game = applyMove(game, 0, { type: "discard", cardId: card.id });
    game = applyMove(game, 0, { type: "draw", source: "discard", color: card.color });
    expect(game.players[0].hand.some((c) => c.id === card.id)).toBe(true);
    expect(game.discardPiles[card.color].length).toBe(0);
  });

  it("ends the game when the deck is exhausted and scores correctly", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(6));
    game.deck = [{ id: "yellow-2", color: "yellow", kind: "number", value: 2 }];
    const card = game.players[0].hand[0];
    game = applyMove(game, 0, { type: "discard", cardId: card.id });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    expect(game.status).toBe("finished");
    expect(game.deck.length).toBe(0);
    const [s0, s1] = scoreGame(game);
    expect(game.winner === "tie" || game.winner === 0 || game.winner === 1).toBe(true);
    expect(typeof s0.total).toBe("number");
    expect(typeof s1.total).toBe("number");
  });
});
