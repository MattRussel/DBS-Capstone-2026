// backend/routes/checkin.js
import express from 'express';
// 🟢 SINKRONISASI: Impor fungsi getCheckInHistory yang baru kita buat di controller
import { handleCheckIn, getStatusCheckIn, getCheckInHistory } from '../controllers/checkinController.js';

const router = express.Router();

// Jalur URL: POST http://localhost:5000/api/checkin/daily
// Tugas rute ini hanya menerima ketukan dari React, lalu melemparnya ke Controller
router.post('/daily', handleCheckIn);
router.get('/status', getStatusCheckIn);

// 🟢 REGISTER ENDPOINT BARU: Jalur penarik list riwayat check-in untuk halaman Ruang Pantau
// URL Akhir: GET http://localhost:5000/api/checkin/history/:studentId
router.get('/history/:studentId', getCheckInHistory);

export default router;