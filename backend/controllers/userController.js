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
    return res.status(400).json({ success: false, message: error.message });
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