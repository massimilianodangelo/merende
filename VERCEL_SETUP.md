# Impostazioni per il Deployment su Vercel

Per risolvere l'errore 404 su Vercel, sono necessarie alcune modifiche. Ecco cosa ho già fatto e cosa dovresti fare in più:

## 1. File vercel.json (Già aggiornato)
Ho aggiornato il file vercel.json con una configurazione più adatta a un'applicazione Vite + Express.

## 2. Cartella api (Già creata)
Ho creato la cartella `api` con il file `index.js` come punto di ingresso per Vercel.

## 3. Modifica a package.json (Da fare)
Prima del deployment, dovrai modificare il file `package.json` sul repository GitHub aggiungendo uno script per Vercel:

```json
"scripts": {
  "dev": "tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push",
  "vercel-build": "vite build"
},
```

## 4. Aggiungere server.js (Da fare)
Crea un file `server.js` nella cartella principale con questo contenuto:

```javascript
// server.js
import express from 'express';
import { handler } from './server/index.ts';

const app = express();
app.use(handler);

export default app;
```

## 5. Controllo variabili d'ambiente
Assicurati di aver configurato queste variabili d'ambiente nel dashboard di Vercel:
- `DATABASE_URL`: La tua stringa di connessione a Neon Database
- `SESSION_SECRET`: Una stringa casuale sicura

## 6. Deploy su Vercel
Dopo aver fatto queste modifiche, puoi fare il deploy su Vercel con queste opzioni:
- Framework Preset: Vite
- Build Command: npm run vercel-build
- Output Directory: client/dist
- Posizione API: api

Ricorda di selezionare "Override" quando Vercel rileva automaticamente le impostazioni.
