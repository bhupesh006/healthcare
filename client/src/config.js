// Centralized API configuration
// In local development: defaults to http://localhost:5000
// In Vercel deployment: reads VITE_API_URL from Vercel environment variables
export const API_BASE_URL = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '')
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : 'http://localhost:5000';
