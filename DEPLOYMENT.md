# Guida al Deployment dell'Applicazione

Questa guida spiega come deployare l'applicazione di gestione ordini per la scuola utilizzando Vercel.

## Prerequisiti

1. Un account Vercel (gratuito o a pagamento)
2. Git installato sul tuo computer
3. Node.js e npm installati sul tuo computer

## Preparazione al Deployment

L'applicazione è già configurata per il deployment su Vercel con i seguenti file:

- `vercel.json` - Configurazione per Vercel
- `api/index.js` - Endpoint API per la versione serverless
- `.env.production` - Variabili d'ambiente per la produzione

## Deployment via CLI (Linea di Comando)

Se preferisci deployare l'applicazione usando la linea di comando invece dell'interfaccia web, ecco i passaggi principali:

### 1. Installa Vercel CLI

```bash
npm i -g vercel
```

### 2. Login a Vercel

```bash
vercel login
```

### 3. Effettua il Deployment

```bash
vercel
```

### 4. Aggiungi Variabili d'Ambiente

```bash
vercel env add SESSION_SECRET production
```

### 5. Rideploya in Produzione

```bash
vercel --prod
```

## Passaggi per il Deployment

### 1. Prepara il Repository

Assicurati che tutte le modifiche siano state salvate e committate nel repository Git.

### 2. Collegati a Vercel

1. Accedi al tuo account Vercel: [https://vercel.com/login](https://vercel.com/login)
2. Dalla dashboard, clicca su "Import Project"
3. Scegli "Import Git Repository" e fornisci l'URL del tuo repository Git
4. Segui le istruzioni per connettere il tuo account GitHub/GitLab/Bitbucket se non l'hai già fatto

### 3. Configura il Progetto

Durante la fase di importazione, Vercel rileverà automaticamente la configurazione Vite.

Nella schermata di configurazione:

1. **Nome Progetto**: Inserisci un nome a tua scelta
2. **Framework Preset**: Dovrebbe essere rilevato come "Vite"
3. **Root Directory**: Mantieni il valore predefinito (di solito "./" o "/")
4. **Build Command**: `npm run build` (dovrebbe essere preimpostato)
5. **Output Directory**: `client/dist` (dovrebbe essere preimpostato)

### 4. Configura le Variabili d'Ambiente

Nella sezione Environment Variables, aggiungi le seguenti variabili:

- `NODE_ENV`: `production`
- `SESSION_SECRET`: [Inserisci un valore segreto sicuro]

### 5. Deploy

Clicca sul pulsante "Deploy" per iniziare il deployment. Vercel compilerà e distribuirà automaticamente la tua applicazione.

## Dopo il Deployment

Una volta completato il deployment, Vercel fornirà un URL per accedere all'applicazione (ad esempio, `https://nome-progetto.vercel.app`).

### Verifica il Deployment

1. Visita l'URL fornito da Vercel
2. Verifica che tutte le funzionalità dell'applicazione funzionino correttamente:
   - Login e registrazione
   - Visualizzazione e gestione degli utenti
   - Visualizzazione e gestione degli ordini
   - Funzionalità di amministrazione

### Risoluzione dei Problemi

Se riscontri problemi dopo il deployment:

1. **Errori 404**: Assicurati che le rotte in `vercel.json` siano configurate correttamente
2. **Problemi API**: Controlla i log di Vercel nella dashboard
3. **Problemi di Autenticazione**: Verifica che `SESSION_SECRET` sia impostato correttamente

## Aggiornamenti Futuri

Per aggiornare l'applicazione dopo il deployment:

1. Effettua le modifiche necessarie al codice
2. Committa e pusha le modifiche al repository Git
3. Vercel rileverà automaticamente le modifiche e avvierà un nuovo deployment

## Migrazione al Database

L'applicazione attualmente utilizza la memoria locale per archiviare i dati. Per una soluzione più robusta in produzione, considera la migrazione a un database come PostgreSQL. Vercel si integra bene con:

- Vercel Postgres
- Neon Database
- Supabase
- PlanetScale

Il file `server/database.ts` è già predisposto per l'integrazione con un database PostgreSQL.

## Note Importanti

- I dati memorizzati localmente verranno persi al riavvio dell'applicazione
- Per un'applicazione di produzione, è fortemente consigliato migrare a un database persistente
- Configura un dominio personalizzato in Vercel se necessario per la tua scuola
