// backend/routes/chatbot.js
import express from 'express';
import { processChatbotRequest } from '../controllers/chatbotController.js';

const router = express.Router();

// Jalur satu pintu untuk chat biasa dan request kuis dinamis AI
router.post('/tanya', processChatbotRequest);

export default router;