# Guida al Deployment dell'Applicazione per la Scuola

Questa guida spiega come deployare l'applicazione di ordinazione snack su Vercel, una piattaforma di hosting che offre un piano gratuito ideale per progetti scolastici.

## Prerequisiti

- Un account GitHub
- Un account Vercel (puoi registrarti con il tuo account GitHub)
- Un account Neon Database per il database PostgreSQL (piano gratuito disponibile)

## Passaggio 1: Preparazione del Database

1. Vai su [neon.tech](https://neon.tech) e registrati o accedi con il tuo account
2. Crea un nuovo progetto
3. Una volta creato il progetto, vai nella sezione "Connection Details"
4. Copia la stringa di connessione che appare nel formato `postgresql://user:password@endpoint/database`
5. Salva questa stringa perché la utilizzerai successivamente

## Passaggio 2: Prepara l'Applicazione per il Deployment

1. Assicurati che i seguenti file siano presenti nel progetto:
   - `vercel.json`
   - `server/index.js`
   - `server/database.ts`

2. Se stai copiando il progetto da Replit a GitHub:
   - Crea un nuovo repository su GitHub
   - Clona il repository localmente
   - Copia tutti i file da Replit al repository locale
   - Committa e pusha i cambiamenti a GitHub

## Passaggio 3: Deploy su Vercel

### Opzione 1: Deploy tramite interfaccia web

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca su "Add New..." e seleziona "Project"
3. Importa il repository GitHub dove hai caricato il progetto
4. Nella sezione "Configure Project", aggiungi le seguenti variabili d'ambiente:
   - `DATABASE_URL`: La stringa di connessione al database che hai salvato in precedenza
   - `SESSION_SECRET`: Una stringa casuale e sicura per cifrare le sessioni (puoi generarla con `openssl rand -hex 32`)
5. Clicca su "Deploy"

### Opzione 2: Deploy tramite CLI

1. Installa la CLI di Vercel con il comando: `npm install -g vercel`
2. Accedi con il comando: `vercel login`
3. Vai nella directory del progetto
4. Esegui il comando: `vercel`
5. Segui le istruzioni a schermo
6. Quando ti viene chiesto di impostare le variabili d'ambiente, aggiungi:
   - `DATABASE_URL`: La stringa di connessione al database
   - `SESSION_SECRET`: Una stringa casuale per le sessioni

## Passaggio 4: Configurazione Post-Deployment

1. Una volta completato il deployment, Vercel ti fornirà un URL per accedere all'applicazione
2. Accedi all'applicazione usando le credenziali di default:
   - Username: `prova@amministratore.it`
   - Password: `Prova2025!`
3. Cambia immediatamente le password predefinite degli account amministratore

## Utilizzo di un Dominio Personalizzato (Opzionale)

Se desideri utilizzare un dominio personalizzato per la tua scuola:

1. Vai al dashboard di Vercel e seleziona il tuo progetto
2. Vai alla sezione "Domains"
3. Clicca su "Add" e inserisci il dominio desiderato
4. Segui le istruzioni per configurare i record DNS

## Manutenzione dell'Applicazione

- **Aggiornamenti**: Per aggiornare l'applicazione, modifica il codice nel repository GitHub e Vercel effettuerà automaticamente un nuovo deployment
- **Monitoraggio**: Vercel fornisce automaticamente logs e monitoraggio per la tua applicazione
- **Backup dei Dati**: Neon Database offre backup automatici del database

## Risoluzione Problemi

Se incontri problemi durante il deployment o l'utilizzo dell'applicazione:

1. Controlla i log di build su Vercel
2. Verifica che le variabili d'ambiente siano configurate correttamente
3. Assicurati che il database sia accessibile