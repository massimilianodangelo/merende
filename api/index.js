// API entry point for Vercel
// Nota: Questo file esporta l'app Express per Vercel
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { setupAuth } from '../server/auth';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';
import { migrate } from '../server/database';
import { serveStatic } from '../server/vite';

// Creazione dell'app Express
const app = express();

// Middleware per il parsing JSON
app.use(bodyParser.json());

// Configurazione delle sessioni
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 giorno
    },
  })
);

// Configurazione dell'autenticazione
setupAuth(app);
app.use(passport.initialize());
app.use(passport.session());

// Inizializzazione del database
migrate().catch(console.error);

// Registrazione delle rotte API
registerRoutes(app);

// Se in produzione, servi i file statici
if (process.env.NODE_ENV === 'production') {
  serveStatic(app);
}

// Middleware per gestire gli errori
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Esportazione dell'app per Vercel
export default app;