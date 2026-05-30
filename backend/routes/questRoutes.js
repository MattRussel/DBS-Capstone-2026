// backend/routes/quest.js
import express from 'express';
import { getMisiDashboard } from '../controllers/questController.js';

const router = express.Router();

// Menangani ketukan pintu GET ke /api/quests/dashboard
router.get('/dashboard', getMisiDashboard);

export default router;