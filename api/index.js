// API entry point for Vercel
const express = require('express');

// Serverless function handler
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "API server is running",
    time: new Date().toISOString()
  });
}