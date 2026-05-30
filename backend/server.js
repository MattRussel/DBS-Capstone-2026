// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// 🔌 1. Import Client Koneksi Supabase yang baru
import supabase from './config/db.js';

// 📋 Import Modul Rute API Resmi Kelompokmu
import userRoutes from './routes/userRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js'; 
import questRouter from './routes/questRoutes.js';
import chatbotRouter from './routes/chatbotRoutes.js';
import quizRoutes from './routes/quizRoutes.js';

const app = express();

// 🛡️ Middleware Utama Express
app.use(cors());
app.use(express.json()); // Supaya server bisa membaca kiriman data format JSON dari frontend

// 🔗 Registrasi Jalur Rute RESTful API Kelompokmu
app.use('/api/user', userRoutes);       // Autentikasi (Registrasi & Login)
app.use('/api/checkin', checkinRoutes); // Absensi Harian (Streak Check-in)
app.use('/api/quests', questRouter);    // Papan Misi Utama
app.use('/api/chatbot', chatbotRouter);  // Obrolan Teman Belajar RAG AI
app.use('/api/quiz', quizRoutes);       // Kuis Mandiri 15 Topik Sains

// 🧪 Jalur Tes Kesehatan API & Database Supabase
app.get('/', async (req, res) => {
  try {
    // Mengetuk pintu database Supabase dengan membaca tabel users secara minimalis (limit 1)
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) throw error;
    
    res.status(200).send('🚀 API SainsCerdas (Supabase PostgreSQL) berjalan lancar & sukses terhubung dengan aman!');
  } catch (err) {
    res.status(500).send(`⚠️ API Running, but Database connection error: ${err.message}`);
  }
});

// 🏃‍♂️ Konfigurasi Port Menyalakan Mesin Server (Mode Lokal)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 SainsCerdas berjalan di http://localhost:${PORT}`);
  });
}

// 📦 WAJIB: Diekspor agar Vercel Serverless Functions bisa membaca seluruh rute Express ini
export default app;