# Guida al Deployment su Vercel

Questa guida spiega come deployare l'applicazione su Vercel.

## Passaggi per il Deployment

1. **Assicurati di avere un account Vercel**
   - Registrati su [vercel.com](https://vercel.com) se non hai ancora un account.

2. **Collega il tuo repository**
   - Puoi importare il progetto direttamente da GitHub, GitLab o Bitbucket.
   - In alternativa, puoi usare il CLI di Vercel per deployare dalla tua macchina locale.

3. **Configura le variabili d'ambiente**
   - Copia le variabili dal file `.env.example` e aggiungile al tuo progetto Vercel.
   - Assicurati di impostare `NODE_ENV=production`.

4. **Avvia il deployment**
   - Se usi la dashboard di Vercel, clicca su "Deploy".
   - Se usi il CLI, esegui `vercel` nella directory del progetto.

5. **Verifica il deployment**
   - Dopo il completamento, verifica che l'applicazione funzioni correttamente.
   - Controlla che le API rispondano correttamente visitando `/api/health`.

## Risoluzione dei problemi comuni

### Errore 404: NOT_FOUND

Se ricevi questo errore, verifica:

1. **File vercel.json**: Controlla che il file di configurazione sia corretto.
2. **File api/index.js**: Assicurati che sia accessibile e configurato per funzionare come un'API serverless.
3. **Routing**: Verifica che le rotte nel file `vercel.json` corrispondano alla struttura dell'applicazione.
4. **Build**: Prova a forzare il deployment con `vercel --force`.

### Errore durante il build

Se il processo di build fallisce:

1. **Log di build**: Controlla i log per identificare l'errore specifico.
2. **Dipendenze**: Verifica che tutte le dipendenze necessarie siano incluse nel package.json.
3. **Script di build**: Assicurati che lo script di build in package.json funzioni localmente.
4. **Node.js**: Verifica che la versione di Node.js usata da Vercel sia compatibile con il tuo progetto.

## Ottimizzare il deployment

Per migliorare le performance:

1. **Comprimi le risorse statiche** per ridurre il tempo di caricamento.
2. **Utilizza la cache** per migliorare i tempi di risposta.
3. **Implementa il lazy loading** per le risorse non critiche.
4. **Configura correttamente i CORS** per garantire la sicurezza delle API.

## Supporto

Se hai problemi con il deployment, puoi:

1. **Consultare la documentazione ufficiale di Vercel**: [vercel.com/docs](https://vercel.com/docs)
2. **Aprire un issue** nel repository del progetto per chiedere aiuto.