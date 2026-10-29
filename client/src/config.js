// Centralized API configuration
// In local development: defaults to http://localhost:5000
// In Vercel deployment:
// - If VITE_API_URL is provided, it uses that backend URL
// - If deployed together on Vercel (same domain), it uses relative '' path
// - In local browser dev: defaults to http://localhost:5000
export const API_BASE_URL = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '')
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? ''
    : 'http://localhost:5000';
