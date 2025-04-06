#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

# Installa le dipendenze
echo "Installazione delle dipendenze..."
npm install

# Crea un package.json temporaneo per isolare vite e esbuild
echo "Configurazione ambiente di build..."
mkdir -p .build-tools
cd .build-tools
echo '{
  "name": "build-tools",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "vite": "^5.0.0",
    "esbuild": "^0.19.8"
  }
}' > package.json
npm install

# Crea un vite.config.js temporaneo se necessario
echo "module.exports = require('../vite.config.ts');" > vite.config.js

# Torna alla directory principale
cd ..

# Disabilita i warning di Node.js 
export NODE_OPTIONS="--no-warnings"

echo "Compilazione con vite..."
# Usa vite dalla directory locale e passa il file di configurazione esplicitamente
./.build-tools/node_modules/.bin/vite build --config vite.config.ts

echo "Compilazione del server..."
# Compila il server 
./.build-tools/node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completata con successo!"