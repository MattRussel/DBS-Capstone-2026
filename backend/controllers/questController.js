// backend/controllers/questController.js
import * as questRepository from '../repositories/questRepository.js';

export const getMisiDashboard = async (req, res) => {
  // Mengambil user_id dari query parameter URL, misal: /api/quests/dashboard?user_id=1
  const { user_id } = req.query; 

  if (!user_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID Pengguna (user_id) wajib disertakan, Ilmuwan Cilik!' 
    });
  }

  try {
    // 1. Tarik semua template misi dari tabel 'quests'
    const masterQuests = await questRepository.getAllQuests();
    
    // 2. Bungkus setiap misi dengan progress aktual si anak secara paralel
    const daftarMisiDinamis = await Promise.all(
      masterQuests.map(async (quest) => {
        const statusAnak = await questRepository.getUserQuestStatus(user_id, quest.id);
        
        return {
          id_misi: quest.id,
          judul: quest.judul,
          deskripsi: quest.deskripsi,
          topik: quest.target_topik,
          target_soal: quest.target_jumlah,
          lencana_hadiah: quest.reward_badge,
          // Kalau anak belum pernah klik mulai kuis, set default progress 0 & belum selesai
          progres_anak: statusAnak ? statusAnak.progress : 0,
          sudah_selesai: statusAnak ? Boolean(statusAnak.completed) : false
        };
      })
    );

    // 3. Kirimkan hasilnya ke frontend React
    return res.status(200).json({
      success: true,
      data: daftarMisiDinamis
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Waduh, gagal mengambil papan misi: ' + error.message 
    });
  }
};