# Guida al Deployment dell'Applicazione su Vercel

Questa guida aggiornata spiega come risolvere i problemi comuni e deployare l'applicazione su Vercel.

## Prerequisiti

1. Un account Vercel (gratuito o a pagamento)
2. Git installato sul tuo computer
3. Node.js e npm installati sul tuo computer

## Preparazione al Deployment

L'applicazione è ora configurata in modo semplificato per il deployment su Vercel con i seguenti file:

- `vercel.json` - Configurazione minimalista per Vercel
- `api/index.js` - Endpoint API semplificato per la versione serverless
- `.env.production` - Variabili d'ambiente per la produzione

## Risoluzione dell'errore 404: NOT_FOUND

Se riscontri questo errore durante il deployment, segui questi passaggi:

1. **Assicurati che il file `api/index.js` sia corretto**
   - Il file deve esportare un'app Express e non dipendere da altri moduli del progetto
   - Deve contenere le rotte API di base

2. **Verifica la configurazione in `vercel.json`**
   - Utilizza la configurazione semplificata che abbiamo fornito
   - Non usare configurazioni complesse con framework specifici
   - Imposta correttamente l'output directory a "dist"

3. **Prova a forzare il deployment**
   ```bash
   vercel --force
   ```

4. **Pulisci la cache di Vercel**
   ```bash
   vercel --prod --force
   ```

## Deployment via CLI (Linea di Comando)

Il metodo più diretto per deployare l'applicazione è tramite CLI:

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

Quando richiesto, utilizza queste opzioni:
- **Output Directory**: `dist`
- **Development Command**: `npm run dev`
- **Build Command**: `npm run build`

### 4. Aggiungi Variabili d'Ambiente

```bash
vercel env add SESSION_SECRET production
```

### 5. Rideploya in Produzione

```bash
vercel --prod
```

## Passaggi per il Deployment via Dashboard

### 1. Prepara il Repository

Assicurati che tutte le modifiche siano state salvate e committate nel repository Git.

### 2. Collegati a Vercel

1. Accedi al tuo account Vercel: [https://vercel.com/login](https://vercel.com/login)
2. Dalla dashboard, clicca su "Add New..." e poi "Project"
3. Importa il repository dalla tua fonte Git

### 3. Configura il Progetto

Nella schermata di configurazione:

1. **Nome Progetto**: Inserisci un nome a tua scelta
2. **Framework Preset**: Seleziona "Other" (non Vite)
3. **Root Directory**: Mantieni il valore predefinito "./"
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`
7. **Development Command**: `npm run dev`

### 4. Override della Configurazione Framework

Nel pannello di configurazione avanzata:
1. Imposta **Framework** su "null" o deseleziona il rilevamento automatico
2. Verifica che le configurazioni in vercel.json vengano utilizzate

### 5. Configura le Variabili d'Ambiente

Aggiungi le seguenti variabili:
- `NODE_ENV`: `production`
- `SESSION_SECRET`: [Inserisci un valore segreto sicuro]

### 6. Deploy

Clicca sul pulsante "Deploy" per iniziare il deployment.

## Test del Deployment

Dopo il deployment, verifica:

1. L'endpoint API di base: `https://tuo-progetto.vercel.app/api`
2. L'endpoint health: `https://tuo-progetto.vercel.app/api/health`
3. La pagina principale dell'applicazione

## Limitazioni Note

1. **Serverless Function**: Le API in modalità serverless hanno alcune limitazioni:
   - Timeout massimo di 10 secondi per risposta
   - Dimensione massima del payload di 4.5MB
   - Stato non persistente tra le chiamate

2. **Persistenza dei Dati**: 
   - I dati in memoria verranno persi tra i deployment
   - Considera l'integrazione con un database remoto (Neon, PlanetScale)

## Configurazione Alternativa

Se questa configurazione non funziona, puoi provare:

1. **Separare Frontend e Backend**:
   - Deployare solo il frontend su Vercel
   - Deployare il backend su Render.com o Railway

2. **Utilizzare Next.js**:
   - Migrare l'applicazione a Next.js per una migliore integrazione con Vercel
   - Next.js offre supporto nativo per API Routes che funzionano bene su Vercel

## Note Finali

- Verifica sempre i log in caso di problemi (`vercel logs`)
- Per problemi persistenti, contatta il supporto Vercel
- Considera l'utilizzo di un database esterno per dati persistenti
- Monitoraggio: `vercel inspect [deployment]` per analizzare le performance
