// backend/services/checkinService.js
import * as checkinRepository from '../repositories/checkinRepository.js';

const dapatkanTanggalUTC = () => {
  const d = new Date();
  const tahun = d.getUTCFullYear();
  const bulan = String(d.getUTCMonth() + 1).padStart(2, '0');
  const tanggal = String(d.getUTCDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${tanggal}`; 
};

export const executeDailyCheckIn = async (userId, materiDipelajari, mood, tingkatKesulitan) => {
  const hariIni = dapatkanTanggalUTC();
  const cleanUserId = parseInt(userId, 10);

  if (isNaN(cleanUserId)) {
    throw new Error('Gagal memproses check-in! ID Pengguna harus berupa angka.');
  }

  const alreadyCheckin = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, hariIni);
  if (alreadyCheckin) {
    throw new Error('Kamu sudah melakukan check-in hari ini, Ilmuwan Cilik! 🌟 Datang lagi besok ya!');
  }

  const dKemarin = new Date();
  dKemarin.setUTCDate(dKemarin.getUTCDate() - 1);
  const kemarin = `${dKemarin.getUTCFullYear()}-${String(dKemarin.getUTCMonth() + 1).padStart(2, '0')}-${String(dKemarin.getUTCDate()).padStart(2, '0')}`;

  const checkinKemarin = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, kemarin);
  const streakTerbaru = checkinKemarin ? checkinKemarin.streak_count + 1 : 1;

  await checkinRepository.createCheckin(cleanUserId, hariIni, streakTerbaru, materiDipelajari, mood, tingkatKesulitan);

  return { 
    success: true, 
    streak: streakTerbaru, 
    message: `🎉 Hore! Jurnal hari ini berhasil disimpan. Kamu mempertahankan rekor ${streakTerbaru} hari beruntun! Semangat!` 
  };
};

export const checkIfAlreadyCheckedIn = async (userId) => {
  const hariIni = dapatkanTanggalUTC();
  const cleanUserId = parseInt(userId, 10);

  if (isNaN(cleanUserId)) return false;

  const checkinData = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, hariIni);
  return !!checkinData; 
};

export const getHistoryByUserId = async (userId) => {
  const cleanUserId = parseInt(userId, 10);
  if (!cleanUserId || isNaN(cleanUserId)) {
    throw new Error('ID Pengguna tidak valid untuk memuat riwayat.');
  }
  return await checkinRepository.getHistoryByUserId(cleanUserId);
};