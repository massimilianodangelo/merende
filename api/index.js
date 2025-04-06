// API Serverless semplificata per Vercel
// Non dipende da nessun altro file del progetto

export default function handler(req, res) {
  // Abilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Gestisce le richieste OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Routing di base
  const path = req.url.split('?')[0];
  
  // Risposta base per la home dell'API
  if (path === '/api' || path === '/api/') {
    return res.status(200).json({
      message: 'API del sistema di gestione utenti scolastico',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  }
  
  // Endpoint di health check
  if (path === '/api/health') {
    return res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString() 
    });
  }
  
  // Risposta mock per utenti
  if (path === '/api/users') {
    return res.status(200).json([
      { 
        id: 1, 
        username: 'admin', 
        firstName: 'Admin', 
        lastName: 'Utente',
        isAdmin: true,
        isUserAdmin: false,
        isRepresentative: false,
        classRoom: 'Admin'
      },
      { 
        id: 2, 
        username: 'rappresentante', 
        firstName: 'Rappresentante', 
        lastName: 'Classe',
        isAdmin: false,
        isUserAdmin: false,
        isRepresentative: true,
        classRoom: '3A'
      },
      { 
        id: 3, 
        username: 'studente', 
        firstName: 'Studente', 
        lastName: 'Esempio',
        isAdmin: false,
        isUserAdmin: false,
        isRepresentative: false,
        classRoom: '4B'
      }
    ]);
  }
  
  // Risposta mock per le classi
  if (path === '/api/admin/classes') {
    return res.status(200).json([
      "1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C", 
      "4A", "4B", "4C", "5A", "5B", "5C"
    ]);
  }
  
  // Risposta per autenticazione (mock)
  if (path === '/api/auth/me' || path === '/api/user') {
    return res.status(401).json({
      authenticated: false,
      message: 'Utente non autenticato'
    });
  }
  
  // Risposta per login (mock)
  if (path === '/api/auth/login' && req.method === 'POST') {
    return res.status(200).json({ 
      id: 1, 
      username: 'admin', 
      firstName: 'Admin', 
      lastName: 'Utente',
      isAdmin: true 
    });
  }
  
  // Risposta generica per altre rotte
  return res.status(404).json({
    error: 'API endpoint non trovato',
    path: path
  });
}