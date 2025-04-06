# Deployment su Vercel

Questa guida spiega come effettuare il deployment dell'applicazione sul servizio di hosting Vercel.

## Configurazione iniziale

1. **Crea un account Vercel**
   - Registrati su [Vercel](https://vercel.com)
   - Collega il tuo account GitHub a Vercel

2. **Configura il tuo database Neon**
   - Accedi al dashboard di [Neon Database](https://neon.tech)
   - Crea un nuovo progetto e database
   - Copia la stringa di connessione

## File di configurazione

Abbiamo preparato i seguenti file essenziali per il deployment su Vercel:

- `vercel.json`: Contiene le configurazioni per il deployment 
- `api/index.js`: Punto di ingresso per le funzioni serverless
- `server.js`: File di supporto per l'ambiente serverless

## Variabili d'ambiente

Queste variabili devono essere configurate nel dashboard di Vercel:

1. `DATABASE_URL`: La stringa di connessione al database Neon
2. `SESSION_SECRET`: Una stringa casuale per la sicurezza delle sessioni

## Processo di deployment

1. **Invia il codice a GitHub**
   - Assicurati che tutti i file siano nel repository

2. **Importa il progetto su Vercel**
   - Vai a "Import Project" nel dashboard di Vercel
   - Seleziona il repository dal tuo account GitHub

3. **Configura il deployment**
   - **Framework Preset**: Seleziona "Vite"
   - **Build Command**: Inserisci `npm run vercel-build`
   - **Output Directory**: Inserisci `client/dist`
   - **Root Directory**: Lascia vuoto (usa la root del repository)

4. **Configura le variabili d'ambiente**
   - Vai alla sezione "Environment Variables"
   - Aggiungi le variabili menzionate sopra

5. **Avvia il deployment**
   - Fai clic su "Deploy"

## Problemi comuni e soluzioni

### Errore 404
Se ricevi un errore 404 dopo il deployment, verifica:
- Il file `vercel.json` ha i reindirizzamenti corretti
- Il contenuto della cartella `api` è configurato correttamente

### Errore di connessione al database
Se l'applicazione non si connette al database:
- Verifica la stringa di connessione DATABASE_URL
- Controlla che il database Neon sia accessibile da internet

### Errore di build
Se il processo di build fallisce:
- Controlla i log di build su Vercel
- Verifica che tutte le dipendenze siano elencate in package.json

## Manutenzione

Per aggiornare l'applicazione:
1. Invia le modifiche a GitHub
2. Vercel avvierà automaticamente un nuovo deployment

Per tornare a una versione precedente:
1. Vai alla sezione "Deployments" nel dashboard Vercel
2. Trova la versione desiderata e clicca su "..." 
3. Seleziona "Promote to Production"
