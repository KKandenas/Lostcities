import { GameState } from "./types.js";

export interface RedactedPlayerState {
  id: string;
  name: string;
  hand: import("./types.js").Card[] | null; // null when this is the opponent's view
  handCount: number;
  expeditions: Record<import("./types.js").Color, import("./types.js").Card[]>;
}

export interface RedactedGameState {
  status: GameState["status"];
  players: [RedactedPlayerState, RedactedPlayerState];
  currentPlayerIndex: 0 | 1;
  turnPhase: GameState["turnPhase"];
  deckCount: number;
  discardPiles: GameState["discardPiles"];
  winner: GameState["winner"];
  viewerIndex: 0 | 1;
  lastDiscardColor: GameState["lastDiscardColor"];
}

export function redactStateFor(state: GameState, viewerIndex: 0 | 1): RedactedGameState {
  return {
    status: state.status,
    currentPlayerIndex: state.currentPlayerIndex,
    turnPhase: state.turnPhase,
    deckCount: state.deck.length,
    discardPiles: state.discardPiles,
    winner: state.winner,
    viewerIndex,
    lastDiscardColor: state.lastDiscardColor,
    players: [0, 1].map((i) => {
      const p = state.players[i as 0 | 1];
      const isViewer = i === viewerIndex;
      return {
        id: p.id,
        name: p.name,
        hand: isViewer ? p.hand : null,
        handCount: p.hand.length,
        expeditions: p.expeditions,
      };
    }) as [RedactedPlayerState, RedactedPlayerState],
  };
}
