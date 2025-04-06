# Guida per risolvere l'errore JSON di Vercel

Quando Vercel mostra l'errore `Can't parse json file /vercel/path0/package.json`, potrebbe essere un problema con caratteri non visibili nel file package.json. Ecco come risolverlo:

## Soluzione immediata

1. **Crea un nuovo file package.json sul tuo computer locale**:
   - Copia il contenuto del tuo package.json attuale
   - Incollalo in un editor di testo come Visual Studio Code o Notepad++
   - Salvalo come nuovo file 
   - **Importante**: Assicurati che il file sia salvato con codifica UTF-8 senza BOM

2. **Sostituisci il file package.json nel tuo repository**:
   - Elimina il file attuale su GitHub
   - Carica il nuovo file che hai creato
   - Committi le modifiche

3. **Assicurati che non ci siano caratteri non ASCII** (come emoji) all'interno del file.

4. **Verifica che non ci siano commenti nel file JSON** (JSON non supporta i commenti).

## Configurazione alternativa

Se l'errore persiste, puoi provare un approccio più semplice:

1. **Usa un package.json minimo**:
```json
{
  "name": "rest-express",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "vite build",
    "start": "node dist/index.js"
  }
}
```

2. **Semplifica vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/client/dist/$1" }
  ]
}
```

## Soluzione definitiva: Deployment statico

Se gli approcci precedenti non funzionano, considera di fare un deployment solo della parte frontend:

1. **Costruisci l'app localmente**:
   ```
   npm run build
   ```

2. **Carica la cartella "client/dist" su Vercel** come progetto statico.

3. **Configura un API separato** su un altro provider (Render, Railway, ecc.) per il backend Express.

Questo approccio è utile se continui ad avere problemi con la configurazione combinata di frontend + backend su Vercel.
