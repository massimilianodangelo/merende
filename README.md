# ScuolaMerenda - Piattaforma di ordinazione merende scolastiche

## Deployment su Render

### Opzione 1: Deploy manuale

1. Registrati o accedi a [Render](https://render.com/)
2. Clicca su "New" e seleziona "Web Service"
3. Collega il tuo repository Git o carica i file dal tuo computer
4. Configura il servizio con i seguenti parametri:
   - **Name**: scuolamerenda (o il nome che preferisci)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Aggiungi le seguenti variabili d'ambiente:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: (genera un valore casuale per la sicurezza)
6. Clicca su "Create Web Service"

### Opzione 2: Deploy tramite Dashboard con Blueprint (render.yaml)

1. Crea un file `render.yaml` nella root del tuo progetto con questo contenuto:
```yaml
services:
  - type: web
    name: scuolamerenda
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        generateValue: true
    healthCheckPath: /api/health
```
2. Vai su [Render Dashboard](https://dashboard.render.com/)
3. Clicca su "New" e poi "Blueprint"
4. Collega il tuo repository Git
5. Segui le istruzioni per completare il deployment

## Note importanti

- I dati sono memorizzati in memoria in questa versione per semplicità
- Per una versione più robusta, potrebbe essere necessario aggiungere un database persistente
- Le sessioni utente sono memorizzate in memoria e saranno perse dopo un riavvio

## Ottimizzazioni per Render

- Il servizio è configurato per utilizzare la porta assegnata da Render tramite la variabile d'ambiente `PORT`
- È stato aggiunto un endpoint di health check a `/api/health` per consentire a Render di verificare lo stato del servizio
- Le impostazioni dei cookie sono configurate per essere sicure in produzione