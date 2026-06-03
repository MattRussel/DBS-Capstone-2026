import * as authService from '../services/userService.js';

export const handleRegister = async (req, res) => {
  // 🟢 PERBAIKAN: Ganti parent_id menjadi parent_password dari req.body
  const { username, email, password, role, parent_password, nama_lengkap } = req.body;

  // Validasi input utama tetap terjaga
  if (!username || !email || !password || !role || !nama_lengkap) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! Username, Email, Password, Role, dan Nama Lengkap wajib diisi.' 
    });
  }

  // 🛡️ VALIDASI TAMBAHAN: Jika mendaftar sebagai anak, parent_password wajib ada nilainya
  if (role === 'anak' && (!parent_password || !parent_password.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Gagal! Kata Sandi Orang Tua (parent_password) wajib diisi untuk akun anak.'
    });
  }

  try {
    // 🟢 PERBAIKAN: Meneruskan variabel parent_password ke dalam userService layer
    const user = await authService.registerUser(username, email, password, role, parent_password, nama_lengkap);
    
    return res.status(201).json({
      success: true,
      message: 'Hore! Akun peneliti cilik berhasil terdaftar. ✨',
      user
    });
  } catch (error) {
    console.error("❌ [Auth Controller Error]:", error.message);

    // 🟢 JALUR PENYELAMAT: SENSOR EROR MENTAH DATABASE (ANTI-POPUP KASAR)
    // Nilai bawaan jika terjadi error tidak dikenal di laboratorium pendaftaran
    let pesanErorUser = "Waduh, terjadi gangguan di laboratorium pendaftaran. Coba lagi beberapa saat ya! 🔬";

    // Lakukan pemeriksaan kata kunci constraint keunikan email Supabase
    if (
      error.message.includes("users_email_key") || 
      error.message.toLowerCase().includes("unique constraint") || 
      error.message.toLowerCase().includes("already exists")
    ) {
      pesanErorUser = "Waduh, email ini sudah terdaftar, Ilmuwan Cilik! 👋 Yuk gunakan email lain atau langsung masuk ke menu Login!";
    } else if (error.message.toLowerCase().includes("username")) {
      pesanErorUser = "Nama pengguna (username) sudah diambil peneliti lain. Coba nama lain yang tidak kalah keren ya! 🌟";
    }

    return res.status(400).json({ 
      success: false, 
      message: pesanErorUser 
    });
  }
};

export const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password tidak boleh kosong!' });
  }

  try {
    const data = await authService.loginUser(username, password);
    return res.status(200).json({
      success: true,
      message: 'Selamat datang kembali, Ilmuwan Hebat! 🚀',
      ...data // data ini otomatis membawa token dan profil user dari service layer
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};