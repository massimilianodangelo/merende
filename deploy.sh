#!/bin/bash

# Installa i pacchetti globali necessari
npm install -g vite esbuild

# Aggiunge il path alle variabili globali
export PATH="$PATH:$(npm bin -g)"

# Installa le dipendenze
npm install

# Esegue la build
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completata con successo!"