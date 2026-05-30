// backend/routes/checkin.js
import express from 'express';
import { handleCheckIn, getStatusCheckIn } from '../controllers/checkinController.js';

const router = express.Router();

// Jalur URL: POST http://localhost:5000/api/checkin/daily
// Tugas rute ini hanya menerima ketukan dari React, lalu melemparnya ke Controller
router.post('/daily', handleCheckIn);
router.get('/status', getStatusCheckIn);

export default router;