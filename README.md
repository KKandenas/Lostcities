# Lost Cities – multiplayer

En webbapp för att spela kortspelet **Lost Cities** (Reiner Knizia) mellan två spelare, varsin telefon/iPad, över internet i realtid.

## Struktur

Monorepo med npm workspaces:

- `packages/shared` – speldata, regler, poängräkning och socket-event-typer. Ren TypeScript, delas mellan server och klient.
- `packages/server` – Node.js + Express + Socket.IO. Håller den auktoritativa speltillståndet, validerar alla drag, hanterar rum (4-teckens kod) och återanslutning.
- `packages/client` – React + Vite. Mobilanpassat gränssnitt (touch), ansluter via WebSocket.

## Spelregler som implementerats

Klassiska tvåspelarreglerna, en runda:

- 5 expeditioner (färger): Röd, Grön, Vit, Blå, Gul.
- 60 kort: varje färg har talkort 2–10 samt 3 "insatskort" (×2/×3/×4-multiplikator).
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

### Deploy-förslag

Enklast är en tjänst som Render, Fly.io eller Railway:

1. Bygg hela repot (`npm install && npm run build`).
2. Starta med `node packages/server/dist/index.js`.
3. Sätt miljövariabeln `PORT` om värden kräver det (annars körs den på 3001).

Client och server kan även hostas separat (t.ex. klient på Vercel/Netlify, server på Render) – sätt då `VITE_SERVER_URL` till serverns URL vid bygget av klienten, och `CLIENT_ORIGIN` på servern till klientens URL (för CORS).

## Så spelar man

1. Spelare 1 öppnar appen, skriver sitt namn och trycker **Skapa nytt rum**. En 4-teckens rumskod visas.
2. Spelare 1 delar koden (SMS, muntligt, etc.) med spelare 2.
3. Spelare 2 öppnar appen på sin egen enhet, skriver sitt namn, trycker **Gå med i rum** och matar in koden.
4. Partiet startar automatiskt så fort båda är med. Turordning, giltiga drag och poäng hanteras av servern – ingen kan fuska.
5. Om nätet försvinner eller sidan laddas om återansluts man automatiskt till samma parti (rumskod + spelartoken sparas i webbläsaren).

## Vidareutveckling

- Kort- och spelplansbilderna är just nu enkla, färgkodade CSS-kort. Skicka gärna referensbilderna så kan de visuella korten göras mer lika det fysiska spelet.
- Möjliga tillägg: 3-rundors match med totalpoäng, ljud/animationer, "spela igen"-knapp i samma rum, spelarklocka.
