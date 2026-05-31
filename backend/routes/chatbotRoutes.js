// backend/routes/chatbotRoutes.js
import express from 'express';
import { processChatbotRequest } from '../controllers/chatbotController.js';

const router = express.Router();

// 🟢 JALUR UTAMA: Wajib menggunakan '/' karena base path-nya sudah ditentukan di server.js
router.post('/', processChatbotRequest);

export default router;