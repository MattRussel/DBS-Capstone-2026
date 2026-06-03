// backend/services/checkinService.js
import * as checkinRepository from '../repositories/checkinRepository.js';

/**
 * 🛠️ FUNGSI HELPER INTERNAL: Menghasilkan Tanggal format YYYY-MM-DD murni berbasis UTC
 * Ini memastikan tanggal murni mengunci di database tanpa terpengaruh Timezone laptop/server!
 */
const dapatkanTanggalUTC = () => {
  const d = new Date();
  const tahun = d.getUTCFullYear();
  // Tambahkan angka 0 di depan jika bulan < 10
  const bulan = String(d.getUTCMonth() + 1).padStart(2, '0');
  // Tambahkan angka 0 di depan jika tanggal < 10
  const tanggal = String(d.getUTCDate()).padStart(2, '0');
  
  return `${tahun}-${bulan}-${tanggal}`; // Hasil pasti: "YYYY-MM-DD" murni UTC
};

/**
 * 📝 Menjalankan fungsi Absensi Harian (Daily Check-In) Anak
 * Mengatur validasi absensi ganda dan kalkulasi runtun hari (streak)
 */
export const executeDailyCheckIn = async (userId, materiDipelajari, mood, tingkatKesulitan) => {
  // 🟢 PERBAIKAN UTAMA: Gunakan tanggal murni berbasis UTC agar sinkron dengan Supabase
  const hariIni = dapatkanTanggalUTC();
  const cleanUserId = parseInt(userId, 10);

  if (isNaN(cleanUserId)) {
    throw new Error('Gagal memproses check-in! ID Pengguna harus berupa angka.');
  }

  // A. VALIDASI: Pastikan anak spesifik ini belum absen hari ini
  const alreadyCheckin = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, hariIni);
  if (alreadyCheckin) {
    throw new Error('Kamu sudah melakukan check-in hari ini, Ilmuwan Cilik! 🌟 Datang lagi besok ya!');
  }

  // B. 🌊 HITUNG STREAK PER USER: Hitung waktu kemarin berbasis UTC murni
  const dKemarin = new Date();
  dKemarin.setUTCDate(dKemarin.getUTCDate() - 1);
  const tahunK = dKemarin.getUTCFullYear();
  const bulanK = String(dKemarin.getUTCMonth() + 1).padStart(2, '0');
  const tanggalK = String(dKemarin.getUTCDate()).padStart(2, '0');
  const kemarin = `${tahunK}-${bulanK}-${tanggalK}`;

  const checkinKemarin = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, kemarin);
  
  // Jika kemarin ada data absen milik user ini, naikkan streak. Jika bolos, reset otomatis ke angka 1
  const streakTerbaru = checkinKemarin ? checkinKemarin.streak_count + 1 : 1;

  // C. SIMPAN: Kirim semua data jurnal lengkap ke repository untuk disimpan ke Supabase Cloud
  await checkinRepository.createCheckin(cleanUserId, hariIni, streakTerbaru, materiDipelajari, mood, tingkatKesulitan);

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
  // 🟢 PERBAIKAN UTAMA: Paksa pengecekan murni UTC dan validasi tipe data Integer ID
  const hariIni = dapatkanTanggalUTC();
  const cleanUserId = parseInt(userId, 10);

  if (isNaN(cleanUserId)) return false;

  const checkinData = await checkinRepository.findCheckinByUserIdAndDate(cleanUserId, hariIni);
  
  return !!checkinData; // Mengembalikan true jika sudah absen, false jika belum
};

// ====================================================================
// 🌟 JEMBATAN BARU: Mengambil Riwayat Jurnal Belajar Detail untuk Orang Tua
// ====================================================================
export const getHistoryByUserId = async (userId) => {
  const cleanUserId = parseInt(userId, 10);
  if (!cleanUserId || isNaN(cleanUserId)) {
    throw new Error('ID Pengguna tidak valid untuk memuat riwayat.');
  }
  
  console.log(`⛓️ [CheckIn Service] Meneruskan pencarian riwayat database ke repositori untuk User: ${cleanUserId}`);
  return await checkinRepository.getCheckInHistoryByUserId(cleanUserId);
};