# Guida al Deployment su Vercel

Questa guida ti aiuterà a risolvere l'errore 404 e a configurare correttamente la tua applicazione su Vercel.

## Prerequisiti

1. Un account Vercel collegato al tuo account GitHub
2. Un database Neon PostgreSQL attivo 
3. Repository GitHub del progetto

## Passo 1: Prepara l'applicazione per Vercel

Assicurati che il tuo repository contenga:

- ✅ Il file `vercel.json` aggiornato (già fatto)
- ✅ La cartella `api` con `index.js` come punto di ingresso (già fatto)
- ✅ Il file `server.js` nella root (già fatto)

## Passo 2: Modifica package.json

Modifica `package.json` nel repository GitHub per aggiungere lo script Vercel:

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

## Passo 3: Configura le variabili d'ambiente su Vercel

1. Accedi al dashboard di Vercel
2. Vai al tuo progetto
3. Vai a "Settings" > "Environment Variables"
4. Aggiungi le seguenti variabili:
   - `DATABASE_URL`: La tua stringa di connessione a Neon Database
   - `SESSION_SECRET`: Una stringa casuale e sicura per le sessioni

## Passo 4: Deploy su Vercel

1. Assicurati che le modifiche siano state inviate su GitHub
2. Vai al dashboard di Vercel
3. Fai clic su "New Project"
4. Seleziona il tuo repository e fai clic su "Import"
5. Nella schermata di configurazione:
   - Framework Preset: Seleziona "Vite"
   - Build Command: Inserisci `npm run vercel-build`
   - Output Directory: Inserisci `client/dist`
   - Fai clic su "Override" se Vercel rileva automaticamente le impostazioni
6. Fai clic su "Deploy"

## Passo 5: Verifica il deployment

1. Dopo il deployment, Vercel ti fornirà un URL
2. Visita l'URL per verificare che l'applicazione funzioni correttamente
3. Se ricevi ancora errori 404, controlla i log del deployment su Vercel

## Risoluzione dei problemi

### Errore 404 sulle rotte API

Se le tue rotte API restituiscono 404:

1. Verifica che il file `api/index.js` importi correttamente il tuo server Express
2. Controlla i reindirizzamenti in `vercel.json` 
3. Assicurati che le variabili d'ambiente siano configurate correttamente

### Errore di connessione al database

Se l'applicazione non riesce a connettersi al database:

1. Verifica la stringa di connessione a Neon Database
2. Assicurati che il database sia accessibile da Vercel (IP consentito)
3. Controlla che la struttura del database sia corretta

### Altri errori

1. Controlla i log di deployment e di runtime su Vercel
2. Verifica che tutte le dipendenze siano elencate in `package.json`
3. Assicurati che il frontend sia costruito correttamente

## Nota importante

Vercel funziona meglio con applicazioni Jamstack o serverless. Se la tua applicazione richiede un server Express completo, considera l'uso di Railway, Render o altri servizi che supportano applicazioni Node.js di tipo server.
