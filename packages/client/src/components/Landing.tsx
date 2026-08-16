import { useState } from "react";
import { COLORS } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";

const NAME_KEY = "lostcities-name";

interface Props {
  onCreate: (name: string) => void;
  onJoin: (name: string, roomCode: string) => void;
  error: string | null;
  onShowRules: () => void;
}

export function Landing({ onCreate, onJoin, error, onShowRules }: Props) {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? "");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"choose" | "join">("choose");

  const updateName = (value: string) => {
    setName(value);
    localStorage.setItem(NAME_KEY, value);
  };

  return (
    <div className="landing">
      <div className="landing-hero">
        {COLORS.map((color) => (
          <img key={color} src={COLOR_META[color].labelImage} alt={COLOR_META[color].label} />
        ))}
      </div>
      <h1>Lost Cities</h1>
      <p className="landing-subtitle">Spela mot en vän, varsin telefon eller iPad.</p>

      <label className="field">
        Ditt namn
        <input
          value={name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="T.ex. Kristian"
          maxLength={24}
        />
      </label>

      {mode === "choose" && (
        <div className="landing-actions">
          <button type="button" className="btn btn-primary" onClick={() => onCreate(name)}>
            Skapa nytt rum
          </button>
          <button type="button" className="btn" onClick={() => setMode("join")}>
            Gå med i rum
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="landing-actions">
          <label className="field">
            Rumskod
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={4}
              autoCapitalize="characters"
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onJoin(name, roomCode)}
            disabled={roomCode.trim().length !== 4}
          >
            Gå med
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setMode("choose")}>
            Tillbaka
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      <button type="button" className="btn btn-ghost rules-link" onClick={onShowRules}>
        Regler
      </button>
    </div>
  );
}
