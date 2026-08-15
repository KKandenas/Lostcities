import { useCallback, useEffect, useMemo, useState } from "react";
import { canPlayToExpedition, type Color, type RedactedGameState } from "@lostcities/shared";
import { socket } from "./socket.js";
import { totalScore } from "./scoring.js";
import { Landing } from "./components/Landing.js";
import { WaitingRoom } from "./components/WaitingRoom.js";
import { BoardFrame } from "./components/BoardFrame.js";
import { HandBar } from "./components/HandBar.js";
import { ActionBar } from "./components/ActionBar.js";
import { ScoreBar } from "./components/ScoreBar.js";
import { GameOverModal } from "./components/GameOverModal.js";
import { RulesModal } from "./components/RulesModal.js";

const SESSION_KEY = "lostcities-session";

interface Session {
  roomCode: string;
  playerToken: string;
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

type Phase = "landing" | "waiting" | "playing" | "finished";

export default function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [roomCode, setRoomCode] = useState<string>("");
  const [gameState, setGameState] = useState<RedactedGameState | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const onState = (state: RedactedGameState) => {
      setGameState(state);
      setPhase(state.status === "finished" ? "finished" : "playing");
      setSelectedCardId(null);
    };
    const onOpponentStatus = ({ connected }: { connected: boolean; name: string | null }) => {
      setOpponentConnected(connected);
    };
    const onErrorMessage = ({ message }: { message: string }) => setError(message);
    const tryRejoin = () => {
      const session = loadSession();
      if (!session) return;
      socket.emit("rejoin_room", session, (res) => {
        if (!res.ok) {
          clearSession();
          setPhase("landing");
          return;
        }
        setRoomCode(session.roomCode);
        setPhase((prev) => (prev === "landing" ? "waiting" : prev));
      });
    };

    socket.on("state", onState);
    socket.on("opponent_status", onOpponentStatus);
    socket.on("error_message", onErrorMessage);
    socket.on("connect", tryRejoin);
    tryRejoin();

    return () => {
      socket.off("state", onState);
      socket.off("opponent_status", onOpponentStatus);
      socket.off("error_message", onErrorMessage);
      socket.off("connect", tryRejoin);
    };
  }, []);

  const handleCreate = useCallback((name: string) => {
    setError(null);
    socket.emit("create_room", { name }, (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      saveSession({ roomCode: res.roomCode, playerToken: res.playerToken });
      setRoomCode(res.roomCode);
      setPhase("waiting");
    });
  }, []);

  const handleJoin = useCallback((name: string, code: string) => {
    setError(null);
    socket.emit("join_room", { roomCode: code, name }, (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      saveSession({ roomCode: code.toUpperCase(), playerToken: res.playerToken });
      setRoomCode(code.toUpperCase());
      setPhase("waiting");
    });
  }, []);

  const handleLeave = useCallback(() => {
    clearSession();
    setGameState(null);
    setRoomCode("");
    setSelectedCardId(null);
    setPhase("landing");
    // Force a real disconnect so the opponent is correctly notified we left,
    // then reconnect so the socket is ready for a fresh create/join.
    socket.disconnect();
    socket.connect();
  }, []);

  const handleLeaveGame = useCallback(() => {
    if (!window.confirm("Är du säker på att du vill lämna spelet?")) return;
    handleLeave();
  }, [handleLeave]);

  const myIndex = gameState?.viewerIndex ?? 0;
  const opponentIndex = myIndex === 0 ? 1 : 0;
  const me = gameState?.players[myIndex];
  const opponent = gameState?.players[opponentIndex];

  const isMyTurn = gameState?.status === "playing" && gameState.currentPlayerIndex === myIndex;
  const actionPhase = isMyTurn && gameState?.turnPhase === "action";
  const drawPhase = isMyTurn && gameState?.turnPhase === "draw";

  const selectedCard = useMemo(
    () => me?.hand?.find((c) => c.id === selectedCardId) ?? null,
    [me, selectedCardId],
  );

  const canPlaySelected = useMemo(() => {
    if (!selectedCard || !me) return false;
    return canPlayToExpedition(me.expeditions[selectedCard.color], selectedCard);
  }, [selectedCard, me]);

  const selectableDiscardColors = useMemo(() => {
    if (!drawPhase || !gameState) return new Set<Color>();
    return new Set(
      (Object.keys(gameState.discardPiles) as Color[]).filter(
        (c) => gameState.discardPiles[c].length > 0 && c !== gameState.lastDiscardColor,
      ),
    );
  }, [drawPhase, gameState]);

  if (phase === "landing") {
    return (
      <>
        <Landing onCreate={handleCreate} onJoin={handleJoin} error={error} onShowRules={() => setShowRules(true)} />
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </>
    );
  }

  if (phase === "waiting" || !gameState || !me || !opponent) {
    return (
      <>
        <WaitingRoom roomCode={roomCode} />
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </>
    );
  }

  return (
    <div className="board">
      <header className="board-header">
        <span className="room-code-chip">{roomCode}</span>
        <span className="turn-indicator">
          {isMyTurn
            ? actionPhase
              ? "Din tur: spela eller kasta"
              : "Din tur: dra ett kort"
            : `${opponent.name}s tur`}
        </span>
        <button type="button" className="rules-button" onClick={() => setShowRules(true)} aria-label="Regler">
          ?
        </button>
        <button type="button" className="leave-button" onClick={handleLeaveGame} title="Lämna spelet">
          Lämna
        </button>
      </header>

      {!opponentConnected && <div className="banner">{opponent.name} har kopplat från, väntar…</div>}
      {error && <div className="banner banner-error">{error}</div>}

      <div className="player-label player-label-opponent">
        {opponent.name} · {opponent.handCount} kort
      </div>

      <div className="board-center">
        <BoardFrame
          opponentExpeditions={opponent.expeditions}
          myExpeditions={me.expeditions}
          discardPiles={gameState.discardPiles}
          selectableDiscardColors={selectableDiscardColors}
          onDrawDiscard={(color) => socket.emit("move", { move: { type: "draw", source: "discard", color } })}
          deckCount={gameState.deckCount}
          deckSelectable={Boolean(drawPhase && gameState.deckCount > 0)}
          onDrawDeck={() => socket.emit("move", { move: { type: "draw", source: "deck" } })}
        />
      </div>

      <div className="player-label player-label-mine">{me.name} (du)</div>

      <ScoreBar
        myName={me.name}
        myScore={totalScore(me.expeditions)}
        opponentName={opponent.name}
        opponentScore={totalScore(opponent.expeditions)}
      />

      <HandBar
        cards={me.hand ?? []}
        selectedCardId={selectedCardId}
        selectable={Boolean(actionPhase)}
        onSelect={(id) => setSelectedCardId((prev) => (prev === id ? null : id))}
      />

      {selectedCard && (
        <ActionBar
          card={selectedCard}
          canPlay={canPlaySelected}
          onPlay={() => socket.emit("move", { move: { type: "play", cardId: selectedCard.id } })}
          onDiscard={() => socket.emit("move", { move: { type: "discard", cardId: selectedCard.id } })}
          onCancel={() => setSelectedCardId(null)}
        />
      )}

      {phase === "finished" && gameState.winner !== null && (
        <GameOverModal
          winner={gameState.winner}
          viewerIndex={myIndex}
          myName={me.name}
          opponentName={opponent.name}
          myExpeditions={me.expeditions}
          opponentExpeditions={opponent.expeditions}
          onLeave={handleLeave}
        />
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
