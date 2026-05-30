// frontend/src/services/api.js
import axios from 'axios';

// Membuat instance Axios global agar kita tidak perlu mengetik ulang "http://localhost:5000" di setiap komponen
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Menyasar langsung gerbang /api/ backend kamu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Otomatis menyelipkan token login (jika ada di localStorage) ke setiap tembakan API
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;