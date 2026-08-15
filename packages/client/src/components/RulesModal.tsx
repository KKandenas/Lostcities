import { COLORS } from "@lostcities/shared";
import { COLOR_META } from "../colors.js";

interface Props {
  onClose: () => void;
}

export function RulesModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal rules-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Regler – Lost Cities</h2>

        <section>
          <h3>Innehåll</h3>
          <div className="rules-cities">
            {COLORS.map((c) => (
              <img key={c} src={COLOR_META[c].labelImage} alt={COLOR_META[c].label} />
            ))}
          </div>
          <p>
            60 kort fördelat på 5 expeditioner: Petra, Chichén Itzá, Atlantis, Shangri-La och Angkor Wat. Varje
            expedition har talkort 2–10 (9 st) och 3 identiska insatskort (handslag) – totalt 12 kort per expedition.
          </p>
        </section>

        <section>
          <h3>Mål</h3>
          <p>
            Bygg upp så värdefulla expeditioner som möjligt. Att starta en expedition kostar 20 poäng i "insats", så
            det lönar sig bara om du spelar tillräckligt många höga kort i den färgen.
          </p>
        </section>

        <section>
          <h3>Ditt drag</h3>
          <ol>
            <li>
              <strong>Spela eller kasta ett kort.</strong> Spela det på din egen expedition (måste vara stigande
              ordning – insatskort måste läggas innan några talkort i samma färg), eller kasta det på kasthögen för
              dess färg.
            </li>
            <li>
              <strong>Dra ett nytt kort.</strong> Antingen från draghögen eller toppen av valfri kasthög (även din
              motståndares) – förutom den hög du precis kastade till, den kan du inte ta tillbaka direkt. De högar
              du kan välja mellan lyser upp med en guldram.
            </li>
          </ol>
        </section>

        <section>
          <h3>Poäng</h3>
          <p>Räknas per expedition du har spelat minst ett kort i (en ospelad färg ger 0 poäng, aldrig minus):</p>
          <ul>
            <li>Summera värdet på talkorten i den färgen.</li>
            <li>Dra bort 20 poäng (insatsen).</li>
            <li>Multiplicera med (1 + antal insatskort du spelat i den färgen) – alltså ×2, ×3 eller ×4.</li>
            <li>Har du spelat minst 8 kort i expeditionen får du dessutom +20 bonuspoäng.</li>
          </ul>
          <p>Summan över alla fem expeditionerna är din totalpoäng.</p>
        </section>

        <section>
          <h3>Spelslut</h3>
          <p>Partiet slutar när draghögen tar slut. Den som har högst totalpoäng vinner.</p>
        </section>

        <button type="button" className="btn btn-primary" onClick={onClose}>
          Stäng
        </button>
      </div>
    </div>
  );
}
