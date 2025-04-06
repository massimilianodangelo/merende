// Server per Vercel
// Questo file è necessario per configurare correttamente Vercel con Express

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import MemoryStore from 'memorystore';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione JSON parsing
app.use(express.json());

// Set up memory store for session
const MemorySessionStore = MemoryStore(session);
const sessionStore = new MemorySessionStore({
  checkPeriod: 86400000 // 24 ore
});

// Configurazione sessione
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 ore
    },
    store: sessionStore,
  })
);

// Inizializzazione autenticazione
app.use(passport.initialize());
app.use(passport.session());

// Definizione delle rotte API di base
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Esempio di API per utenti
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, username: 'admin', role: 'admin', firstName: 'Admin', lastName: 'User' },
    { id: 2, username: 'user1', role: 'user', firstName: 'Sample', lastName: 'User' }
  ]);
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Per Vercel, dobbiamo esportare l'app in modo che possa essere utilizzata come funzione serverless
export default app;

// Se non siamo in ambiente Vercel, avvia il server normalmente
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API server in esecuzione sulla porta ${PORT}`);
  });
}
