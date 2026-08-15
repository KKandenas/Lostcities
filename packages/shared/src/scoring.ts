import { Card, Color, ExpeditionScore, GameState, PlayerScore } from "./types.js";

export function scoreExpedition(color: Color, pile: Card[]): ExpeditionScore {
  if (pile.length === 0) {
    return { color, cardCount: 0, wagerCount: 0, sum: 0, multiplier: 1, bonus: 0, score: 0 };
  }
  const wagerCount = pile.filter((c) => c.kind === "wager").length;
  const sum = pile
    .filter((c): c is Extract<Card, { kind: "number" }> => c.kind === "number")
    .reduce((total, c) => total + c.value, 0);
  const multiplier = 1 + wagerCount;
  const bonus = pile.length >= 8 ? 20 : 0;
  const score = (sum - 20) * multiplier + bonus;
  return { color, cardCount: pile.length, wagerCount, sum, multiplier, bonus, score };
}

export function scorePlayer(state: GameState, playerIndex: 0 | 1): PlayerScore {
  const player = state.players[playerIndex];
  const expeditions = (Object.keys(player.expeditions) as Color[]).map((color) =>
    scoreExpedition(color, player.expeditions[color]),
  );
  const total = expeditions.reduce((sum, e) => sum + e.score, 0);
  return { playerIndex, expeditions, total };
}

export function scoreGame(state: GameState): [PlayerScore, PlayerScore] {
  return [scorePlayer(state, 0), scorePlayer(state, 1)];
}
