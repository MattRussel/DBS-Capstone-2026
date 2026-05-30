// backend/routes/auth.js
import express from 'express';
import { handleRegister, handleLogin } from '../controllers/userController.js';

const router = express.Router();

// Sekarang jalurnya sangat pendek karena semua logika sudah dipindahkan ke Controller
router.post('/register', handleRegister);
router.post('/login', handleLogin);

export default router;