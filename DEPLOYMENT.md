# Guida al Deployment su Vercel

Questa guida descrive come fare il deploy dell'applicazione su Vercel.

## Architettura del Deployment

Questa applicazione utilizza un approccio ibrido per il deployment su Vercel:

1. **Frontend**: Build con Vite, servito staticamente da Vercel
2. **Backend**: Funzioni serverless JavaScript nella cartella `/api`

## Struttura dei File di Deployment

- `/api/index.js`: Funzione serverless principale che gestisce tutte le richieste API
- `/api/_health.js`: Endpoint di health check
- `/api/build.js`: Script di supporto per il processo di build
- `/vercel.json`: Configurazione del deployment Vercel
- `/.vercelignore`: File che specifica quali file/cartelle escludere dal deployment

## Come Funziona

1. **Frontend**: Il codice React viene compilato in file statici tramite Vite
2. **Backend**: Invece di compilare il codice TypeScript del server Express originale, utilizziamo funzioni serverless JavaScript pure nella cartella `/api`
3. **Routing**: Le richieste all'API vengono instradate alla funzione serverless corrispondente

## Procedura di Deployment

### Prima del Deployment

1. Assicurati che la build del frontend funzioni correttamente:
   ```
   npm run build
   ```

2. Verifica che le funzioni serverless in `/api` siano aggiornate

### Deployment su Vercel

1. **Dashboard Vercel**:
   - Accedi al dashboard Vercel
   - Crea un nuovo progetto e collega il repository
   - Configura le variabili d'ambiente necessarie

2. **Verifica del Deployment**:
   - Controlla l'endpoint di health check: `https://tua-app.vercel.app/api/health`
   - Verifica che il frontend si carichi correttamente
   - Verifica che le API funzionino come previsto

## Variabili d'Ambiente

Se necessario, configura le seguenti variabili d'ambiente nel progetto Vercel:

- `DATABASE_URL`: URL del database (se applicabile)
- `NODE_ENV`: Impostato automaticamente da Vercel

## Troubleshooting

### Errore 404 sulle API

Se riscontri errori 404 sulle chiamate API:
- Verifica che le rotte nel file `vercel.json` siano configurate correttamente
- Controlla i log del deployment per errori
- Verifica che le funzioni serverless in `/api` siano state deployate correttamente

### Problemi di Compilazione

- Vercel potrebbe avere difficoltà con il codice TypeScript: usa l'approccio serverless JavaScript puro
- I percorsi di import devono essere relativi e corretti nel contesto del deployment

## Riferimenti

- [Documentazione Vercel](https://vercel.com/docs)
- [Guida alle Funzioni Serverless](https://vercel.com/docs/serverless-functions/introduction)
