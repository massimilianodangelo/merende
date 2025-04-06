# Guida al Deployment su Vercel

Questa guida spiega come deployare l'applicazione su Vercel per renderla disponibile a tutta la scuola.

## Step 1: Configurazione dell'Account e del Repository

1. Crea un account su [Vercel](https://vercel.com/) (puoi usare il tuo account GitHub)
2. Crea un repository GitHub con tutti i file del progetto
3. Assicurati che il file `vercel.json` sia nella root del progetto

## Step 2: Database PostgreSQL

Per questa applicazione ti consiglio di usare [Neon](https://neon.tech/):

1. Crea un account gratuito su Neon
2. Crea un nuovo progetto
3. Copia la stringa di connessione (nella forma `postgresql://user:password@endpoint/dbname`)

## Step 3: Deploy su Vercel

1. Nel dashboard Vercel, clicca su "New Project"
2. Importa il repository GitHub
3. Configura le variabili d'ambiente:
   - `DATABASE_URL`: La stringa di connessione Neon
   - `SESSION_SECRET`: Una stringa casuale sicura

4. Clicca su "Deploy"

Dopo pochi minuti il tuo sito sarà online! Vercel ti fornirà un URL del tipo `tuo-progetto.vercel.app` che potrai condividere con la scuola.

Se hai domande o problemi durante il deployment, non esitare a chiedere. Il file `vercel.json` è già configurato per gestire correttamente sia il frontend che le API.
