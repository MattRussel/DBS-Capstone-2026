// backend/services/checkinService.js
import * as checkinRepository from '../repositories/checkinRepository.js';

/**
 * 📝 Menjalankan fungsi Absensi Harian (Daily Check-In) Anak
 * Mengatur validasi absensi ganda dan kalkulasi runtun hari (streak)
 */
export const executeDailyCheckIn = async (userId) => {
  const hariIni = new Date().toLocaleDateString('sv-SE');

  // A. VALIDASI: Pastikan anak belum absen hari ini
  const alreadyCheckin = await checkinRepository.findCheckinByUserIdAndDate(userId, hariIni);
  if (alreadyCheckin) {
    throw new Error('Kamu sudah melakukan check-in hari ini, Ilmuwan Cilik! 🌟 Datang lagi besok ya!');
  }

  // B. 🌊 HITUNG STREAK: Kurangi waktu saat ini sebanyak 24 jam untuk mendapatkan tanggal kemarin
  const kemarin = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE');
  const checkinKemarin = await checkinRepository.findCheckinByUserIdAndDate(userId, kemarin);
  
  // Jika kemarin ada data absen, naikkan streak. Jika bolos, reset otomatis ke angka 1
  const streakTerbaru = checkinKemarin ? checkinKemarin.streak_count + 1 : 1;

  // C. SIMPAN: Tusuk baris data absensi baru ke Supabase
  await checkinRepository.createCheckin(userId, hariIni, streakTerbaru);

  return { 
    success: true, 
    streak: streakTerbaru, 
    message: `🎉 Hore! Jurnal hari ini berhasil disimpan. Kamu mempertahankan rekor ${streakTerbaru} hari beruntun! Semangat!` 
  };
};

/**
 * 🔍 Mengecek status absensi anak untuk kebutuhan render tombol di Frontend React
 */
export const checkIfAlreadyCheckedIn = async (userId) => {
  const hariIni = new Date().toLocaleDateString('sv-SE');
  const checkinData = await checkinRepository.findCheckinByUserIdAndDate(userId, hariIni);
  
  return !!checkinData; // Mengembalikan true jika sudah absen, false jika belum
};