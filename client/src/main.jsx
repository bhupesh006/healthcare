import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import { API_BASE_URL } from './config';

// Automatic API URL rewrites for seamless local and Vercel cloud deployment
axios.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', API_BASE_URL);
    } else if (config.url.startsWith('/api') && API_BASE_URL) {
      config.url = `${API_BASE_URL}${config.url}`;
    }
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
