# Lost Cities – multiplayer

En webbapp för att spela kortspelet **Lost Cities** (Reiner Knizia) mellan två spelare, varsin telefon/iPad, över internet i realtid.

## Struktur

Monorepo med npm workspaces:

- `packages/shared` – speldata, regler, poängräkning och socket-event-typer. Ren TypeScript, delas mellan server och klient.
- `packages/server` – Node.js + Express + Socket.IO. Håller den auktoritativa speltillståndet, validerar alla drag, hanterar rum (4-teckens kod) och återanslutning.
- `packages/client` – React + Vite. Mobilanpassat gränssnitt (touch), ansluter via WebSocket.

## Spelregler som implementerats

Klassiska tvåspelarreglerna, en runda:

- 5 expeditioner: Petra, Chichén Itzá, Atlantis, Shangri-La och Angkor Wat.
- 60 kort: varje expedition har talkort 2–10 samt 3 identiska insatskort (handslag). Insatskorten har ingen egen tryckt siffra – multiplikatorn (×2/×3/×4) bestäms av hur många man spelat och räknas ut automatiskt.
- Varje drag: spela ett kort på egen expedition (stigande ordning, insatskort måste spelas innan talkort i samma färg) **eller** kasta det på högen för dess färg. Därefter dra ett kort – antingen från draghögen eller toppen av valfri kasthög.
- En expedition kostar 20 poäng i "insats"; poäng = (summan av talkort − 20) × (1 + antal insatskort), plus 20 bonuspoäng om expeditionen har minst 8 kort. Ospelad färg ger 0 poäng.
- Spelet slutar när draghögen tar slut. Högst totalpoäng vinner.

## Köra lokalt

```bash
npm install

# Terminal 1 – server (port 3001)
npm run dev:server

# Terminal 2 – klient (port 5173)
npm run dev:client
```

Öppna `http://localhost:5173` i två flikar/enheter på samma nätverk (byt `localhost` mot datorns IP-adress för att testa från en telefon på samma WiFi).

Köra testerna för spellogiken:

```bash
npm run test
```

## Bygga för produktion

```bash
npm run build
```

Detta bygger klienten (`packages/client/dist`) och kompilerar servern (`packages/server/dist`). Servern serverar automatiskt klientens byggda filer om `packages/client/dist` finns, så **en enda Node-process kan hosta hela appen**:

```bash
node packages/server/dist/index.js
```

### Deploy till Render (rekommenderat för att testa)

Repot har en färdig `render.yaml` som beskriver en enda gratis webbtjänst (bygger med `npm install && npm run build`, startar med `node packages/server/dist/index.js`, hälsokontroll på `/healthz`).

1. Gå till [render.com](https://render.com) och skapa ett konto (går bra med GitHub-inloggning).
2. **New +** → **Blueprint** → välj `KKandenas/Lostcities`-repot. Render hittar `render.yaml` automatiskt och föreslår tjänsten `lost-cities`.
   - Om Blueprint inte dyker upp: välj **New +** → **Web Service** istället, peka på repot, branch `claude/lost-cities-multiplayer-iagss6`, Build command `npm install && npm run build`, Start command `node packages/server/dist/index.js`.
3. Klicka **Deploy**. Första bygget tar ett par minuter.
4. När den är klar får du en URL, typ `https://lost-cities.onrender.com` – öppna den på båda telefonerna/iPaden.

Gratisnivån på Render "somnar" efter en stund utan trafik och tar ~30–60 sekunder att vakna vid nästa besök – helt okej för att testa, men märks om ni inte spelat på ett tag.

Varje `git push` till branchen bygger om och deployar automatiskt.

### Alternativ

Fly.io eller Railway fungerar likadant (samma build-/start-kommandon). Client och server kan även hostas separat (t.ex. klient på Vercel/Netlify, server på Render) – sätt då `VITE_SERVER_URL` till serverns URL vid bygget av klienten, och `CLIENT_ORIGIN` på servern till klientens URL (för CORS).

## Så spelar man

1. Spelare 1 öppnar appen, skriver sitt namn och trycker **Skapa nytt rum**. En 4-teckens rumskod visas.
2. Spelare 1 delar koden (SMS, muntligt, etc.) med spelare 2.
3. Spelare 2 öppnar appen på sin egen enhet, skriver sitt namn, trycker **Gå med i rum** och matar in koden.
4. Partiet startar automatiskt så fort båda är med. Turordning, giltiga drag och poäng hanteras av servern – ingen kan fuska.
5. Om nätet försvinner eller sidan laddas om återansluts man automatiskt till samma parti (rumskod + spelartoken sparas i webbläsaren).

## Vidareutveckling

Möjliga tillägg: 3-rundors match med totalpoäng, ljud/animationer, "spela igen"-knapp i samma rum, spelarklocka.
