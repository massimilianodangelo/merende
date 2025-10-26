import { Request, Response, NextFunction } from 'express';

/**
 * Middleware per impostare header di caching appropriati in produzione
 * Utilizzato solo in ambiente di produzione (Render)
 */
export function setCacheHeaders(req: Request, res: Response, next: NextFunction) {
  // Salta in ambiente di sviluppo
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Per file statici con hash (generati da build)
  if (req.path.match(/\.[0-9a-f]{8}\.(js|css|jpg|png|svg|webp)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); // 30 giorni
  } 
  // Per altri asset statici
  else if (req.path.match(/\.(js|css|jpg|png|svg|webp|ico|ttf|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 giorno
  }
  // Per l'API
  else if (req.path.startsWith('/api/')) {
    // Le API non dovrebbero essere cache dal browser
    res.setHeader('Cache-Control', 'no-store');
  }
  // Per le altre pagine (come index.html)
  else {
    res.setHeader('Cache-Control', 'public, max-age=900'); // 15 minuti
  }

  next();
}