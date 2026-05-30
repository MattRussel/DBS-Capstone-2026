// backend/routes/quizRoutes.js
import express from 'express';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// 🎯 Endpoint untuk mengambil paket soal kuis (Dibidik saat tombol Mulai Kuis di-klik)
router.post('/fetch-questions', quizController.getNewQuizQuestions);

// 🎯 Endpoint untuk mencatat skor akhir (Dibidik saat tombol Selesaikan Misi di-klik)
router.post('/score', quizController.saveQuizScoreResult);

export default router;