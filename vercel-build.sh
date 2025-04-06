#!/bin/bash

# Script di build semplificato per Vercel
echo "🏗️ Esecuzione build personalizzato per Vercel..."

# Verifica la presenza di npm
if ! command -v npm &> /dev/null
then
    echo "npm non è installato. Installazione in corso..."
    apt-get update && apt-get install -y nodejs npm
fi

# Installa le dipendenze solo per il frontend
echo "Installazione delle dipendenze..."
npm install

# Build solo del frontend con Vite
echo "📦 Building frontend con Vite..."
npm run build

# Non compiliamo il backend, usiamo le funzioni serverless in api/
echo "🚀 Utilizzando funzioni serverless pure in JavaScript..."
node api/build.js