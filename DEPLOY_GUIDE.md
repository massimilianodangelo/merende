# Guida Rapida al Deployment con Vercel CLI

Se preferisci deployare l'applicazione usando la linea di comando invece dell'interfaccia web, ecco una guida rapida.

## Prerequisiti

1. Node.js e npm installati
2. Vercel CLI installato (`npm i -g vercel`)
3. Un account Vercel

## Passaggi per il Deployment

### 1. Login a Vercel

```bash
vercel login
```

Segui le istruzioni per autenticarti con il tuo account Vercel.

### 2. Effettua il Deployment

Dalla directory principale del progetto, esegui:

```bash
vercel
```

Vercel CLI porrà alcune domande di configurazione:

- **Set up and deploy?** - Sì
- **Which scope?** - Scegli il tuo account o team
- **Link to existing project?** - No (per il primo deployment)
- **Project name?** - Inserisci un nome (o accetta quello predefinito)
- **Directory?** - `.` (directory corrente)
- **Override settings?** - No (usa le impostazioni da vercel.json)

### 3. Impostazioni Ambiente

Dopo il deployment, configura le variabili d'ambiente:

```bash
vercel env add SESSION_SECRET production
```

Inserisci un valore sicuro quando richiesto.

### 4. Rideploya con le Nuove Variabili

```bash
vercel --prod
```

## Verifica il Deployment

Visita l'URL fornito da Vercel al termine del deployment e verifica che l'applicazione funzioni correttamente.

## Aggiornamenti Futuri

Per aggiornare l'applicazione, esegui:

```bash
vercel --prod
```

## Note Importanti

- I dati memorizzati localmente verranno persi a ogni deployment
- Per ambienti di produzione, è fortemente consigliato utilizzare un database persistente come PostgreSQL