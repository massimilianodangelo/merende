// Server per Vercel
// Questo file è necessario per configurare correttamente Vercel con Express

import express from 'express';
import { storage } from '../server/storage';
import session from 'express-session';
import passport from 'passport';
import * as auth from '../server/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione JSON parsing
app.use(express.json());

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
    store: storage.sessionStore,
  })
);

// Inizializzazione autenticazione
app.use(passport.initialize());
app.use(passport.session());
auth.setupAuth(app);

// Gestione API
app.get('/api/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero degli utenti' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero dei prodotti' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero degli ordini' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Credenziali non valide' });
    
    req.login(user, err => {
      if (err) return next(err);
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Errore durante il logout' });
    res.json({ success: true });
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const user = await storage.createUser(req.body);
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Gestione errori
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Esportazione come serverless function
export default app;
