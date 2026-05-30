import * as authService from '../services/userService.js';

export const handleRegister = async (req, res) => {
  const { username, email, password, role, parent_id, nama_lengkap } = req.body;

  if (!username || !email || !password || !role || !nama_lengkap) {
    return res.status(400).json({ 
      success: false, 
      message: 'Gagal! Username, Email, Password, Role, dan Nama Lengkap wajib diisi.' 
    });
  }

  try {
    const user = await authService.registerUser(username, email, password, role, parent_id, nama_lengkap);
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
      ...data
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};