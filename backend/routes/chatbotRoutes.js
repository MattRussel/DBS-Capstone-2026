// backend/routes/chatbot.js
import express from 'express';
// 1. Pastikan meng-import fungsi controller yang benar
import { processChatbotRequest } from '../controllers/chatbotController.js';

const router = express.Router();

// Jalur satu pintu untuk chat biasa dan request kuis dinamis AI
router.post('/message', processChatbotRequest);

export default router;