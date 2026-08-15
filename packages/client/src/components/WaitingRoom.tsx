interface Props {
  roomCode: string;
}

export function WaitingRoom({ roomCode }: Props) {
  return (
    <div className="waiting-room">
      <h2>Väntar på motståndare…</h2>
      <p>Dela den här koden med din motspelare:</p>
      <div className="room-code">{roomCode}</div>
      <p className="landing-subtitle">De skriver in koden på sin telefon under &quot;Gå med i rum&quot;.</p>
    </div>
  );
}
