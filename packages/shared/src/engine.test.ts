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
  const c = (id: string, color: "petra", kind: "number" | "wager", value?: number): Card =>
    kind === "wager" ? { id, color, kind } : { id, color, kind, value: value! };

  it("scores an empty expedition as 0", () => {
    expect(scoreExpedition("petra", []).score).toBe(0);
  });

  it("subtracts 20 investment cost", () => {
    const pile = [c("r1", "petra", "number", 5), c("r2", "petra", "number", 6)];
    expect(scoreExpedition("petra", pile).score).toBe(5 + 6 - 20);
  });

  it("applies wager multipliers", () => {
    const pile = [c("w1", "petra", "wager"), c("w2", "petra", "wager"), c("r1", "petra", "number", 10)];
    // multiplier = 1 + 2 wagers = 3; (10 - 20) * 3 = -30
    expect(scoreExpedition("petra", pile).score).toBe(-30);
  });

  it("gives +20 bonus for 8+ cards", () => {
    const pile = [
      c("w1", "petra", "wager"),
      c("r2", "petra", "number", 2),
      c("r3", "petra", "number", 3),
      c("r4", "petra", "number", 4),
      c("r5", "petra", "number", 5),
      c("r6", "petra", "number", 6),
      c("r7", "petra", "number", 7),
      c("r8", "petra", "number", 8),
    ];
    const sum = 2 + 3 + 4 + 5 + 6 + 7 + 8;
    const expected = (sum - 20) * 2 + 20;
    expect(scoreExpedition("petra", pile).score).toBe(expected);
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
    // Force a known hand for player 0: two petra numbers, low then high, out of order attempt.
    game.players[0].hand = [
      { id: "petra-5", color: "petra", kind: "number", value: 5 },
      { id: "petra-3", color: "petra", kind: "number", value: 3 },
    ];
    game = applyMove(game, 0, { type: "play", cardId: "petra-5" });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    game.currentPlayerIndex = 0; // simulate it's player 0's turn again for the test
    game.turnPhase = "action";
    expect(() => applyMove(game, 0, { type: "play", cardId: "petra-3" })).toThrow(GameRuleError);
  });

  it("requires wager cards before any number card in an expedition", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(3));
    game.players[0].hand = [
      { id: "petra-6", color: "petra", kind: "number", value: 6 },
      { id: "petra-wager-1", color: "petra", kind: "wager" },
    ];
    game = applyMove(game, 0, { type: "play", cardId: "petra-6" });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    game.currentPlayerIndex = 0;
    game.turnPhase = "action";
    expect(() => applyMove(game, 0, { type: "play", cardId: "petra-wager-1" })).toThrow(GameRuleError);
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

  it("allows drawing from a discard pile that isn't the one just discarded to", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(5));
    game.discardPiles.dome = [{ id: "dome-9", color: "dome", kind: "number", value: 9 }];
    game.players[0].hand[0] = { id: "petra-4", color: "petra", kind: "number", value: 4 };
    game = applyMove(game, 0, { type: "discard", cardId: "petra-4" });
    game = applyMove(game, 0, { type: "draw", source: "discard", color: "dome" });
    expect(game.players[0].hand.some((c) => c.id === "dome-9")).toBe(true);
    expect(game.discardPiles.dome.length).toBe(0);
  });

  it("blocks drawing back the card you just discarded, on the same turn", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(5));
    const card = game.players[0].hand[0];
    game = applyMove(game, 0, { type: "discard", cardId: card.id });
    expect(game.lastDiscardColor).toBe(card.color);
    expect(() => applyMove(game, 0, { type: "draw", source: "discard", color: card.color })).toThrow(GameRuleError);
  });

  it("clears the just-discarded restriction once the draw completes", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(5));
    const card = game.players[0].hand[0];
    game = applyMove(game, 0, { type: "discard", cardId: card.id });
    game = applyMove(game, 0, { type: "draw", source: "deck" });
    expect(game.lastDiscardColor).toBeNull();
  });

  it("ends the game when the deck is exhausted and scores correctly", () => {
    let game = createGame({ id: "a", name: "Alice" }, { id: "b", name: "Bob" }, seededRng(6));
    game.deck = [{ id: "angkor-2", color: "angkor", kind: "number", value: 2 }];
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
