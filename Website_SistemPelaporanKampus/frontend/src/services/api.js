import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // URL default server FastAPI kamu
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;