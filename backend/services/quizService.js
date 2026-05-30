// backend/services/quizService.js
import * as quizRepository from '../repositories/quizRepository.js';

// 🔗 URL API Publik milik Tim AI Engineer kelompokmu via Ngrok
const AI_ENGINEER_API_URL = 'https://groin-multitude-earphone.ngrok-free.dev';

/**
 * 📡 Mengambil data soal kuis dari model Flask AI kelompok via Ngrok
 * @param {string} topik - Topik sains yang ingin digenerate soalnya
 * @returns {Object} Objek data berisi array pertanyaan kuis
 */
export const generateQuizSOAL = async (topik) => {
  try {
    console.log(`📡 [Quiz Service] Menembak API Ngrok Tim AI untuk kuis topik: ${topik}`);

    const aiResponse = await fetch(`${AI_ENGINEER_API_URL}/generate-quiz`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ topik: topik, jumlah_soal: 3 })
    });

    if (!aiResponse.ok) {
      throw new Error(`API Tim AI merespons dengan status: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();

    return {
      type: "QUIZ_DATA",
      content: aiData.quiz_questions // Key JSON sesuai kesepakatan bersama Tim AI
    };

  } catch (error) {
    console.error("❌ [Quiz Service] Gagal mengambil kuis dari API Tim AI:", error.message);
    
    // 🛡️ Fallback Darurat: Jika terowongan Ngrok putus/mati, berikan kuis cetakan standar agar aplikasi tidak crash
    return {
      type: "QUIZ_DATA",
      content: [
        {
          soal: `Materi kuis untuk topik '${topik}' sedang dipersiapkan oleh Tim AI kami! ✨`,
          opsi: ["A. Semangat", "B. Pantang Menyerah", "C. Sukses Capstone", "D. Kerja Bagus"],
          jawaban_benar: "A"
        }
      ]
    };
  }
};

/**
 * 💾 Meneruskan data penyimpanan skor kuis mandiri anak ke database melalui Repository
 * @param {number|string} userId - ID unik anak yang mengerjakan kuis
 * @param {string} topikIpa - Topik kuis yang dikerjakan
 * @param {number} skorTotal - Total nilai akhir kuis
 * @param {number} jawabanBenar - Jumlah soal yang dijawab dengan benar
 * @returns {Object} Data hasil insert yang dikembalikan oleh Supabase
 */
export const storeUserScore = async (userId, topikIpa, skorTotal, jawabanBenar) => {
  try {
    return await quizRepository.saveScoreToDb(userId, topikIpa, skorTotal, jawabanBenar);
  } catch (error) {
    console.error("❌ [Quiz Service] Gagal memproses penyimpanan skor:", error.message);
    throw error;
  }
};