// Simplified Serverless Function for Vercel
export default function handler(req, res) {
  const path = req.url.split('?')[0];
  
  // Basic health check endpoint
  if (path === '/api' || path === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is running'
    });
  }
  
  // Example users endpoint
  if (path === '/api/users') {
    return res.status(200).json([
      { id: 1, name: 'Admin User', role: 'admin' },
      { id: 2, name: 'Test User', role: 'user' }
    ]);
  }
  
  // Default response for other routes
  return res.status(404).json({
    error: 'Not found',
    message: `The requested path "${path}" was not found`
  });
}