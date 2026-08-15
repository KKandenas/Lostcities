interface Props {
  roomCode: string;
  onCancel: () => void;
}

export function WaitingRoom({ roomCode, onCancel }: Props) {
  return (
    <div className="waiting-room">
      <h2>Väntar på motståndare…</h2>
      <p>Dela den här koden med din motspelare:</p>
      <div className="room-code">{roomCode}</div>
      <p className="landing-subtitle">De skriver in koden på sin telefon under &quot;Gå med i rum&quot;.</p>
      <button type="button" className="btn btn-ghost" onClick={onCancel}>
        Avbryt
      </button>
    </div>
  );
}
