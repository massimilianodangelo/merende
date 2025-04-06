// server.js - Entry point for Vercel
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Get our Express server code
import './server/index.ts';

// Export the Express app for serverless environment
export default app;