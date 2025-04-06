#!/bin/bash

# Verifica la presenza di npm
if ! command -v npm &> /dev/null
then
    echo "npm non è installato. Installazione in corso..."
    apt-get update && apt-get install -y nodejs npm
fi

# Installa le dipendenze
echo "Installazione delle dipendenze..."
npm install

# Esegui il build
echo "Esecuzione del build..."
npm run build

# Converti i file .ts in .js per Vercel
echo "Conversione dei file del server..."
npx tsc --project tsconfig.json