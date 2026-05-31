// backend/services/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'KUNCI_RAHASIA_SUPER_SAINS_2026';

/**
 * 📝 Logika Bisnis Registrasi Pengguna Baru
 */
// 🟢 PERBAIKAN: Ganti parameter parentId menjadi parent_password
export const registerUser = async (username, email, password, role, parent_password, namaLengkap) => {
  try {
    // 1. Validasi: Cek duplikasi via repository
    const existingUser = await userRepository.findUserByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new Error('Username atau Email sudah terdaftar! Gunakan data lain.');
    }

    // 2. Security: Enkripsi Password menggunakan bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Persist: Perintahkan simpan ke database Supabase via Repository
    const result = await userRepository.createUser({
      username, 
      email, 
      passwordHash, 
      role, 
      parentPassword: parent_password, // 🟢 SINKRON: Menggunakan parentPassword sesuai camelCase di repository
      namaLengkap
    });

    return {
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role,
      namaLengkap: result.nama_lengkap,
      parent_password: result.parent_password // 🟢 Mengembalikan kolom baru
    };
  } catch (error) {
    console.error("❌ [Auth Service] Gagal memproses registrasi:", error.message);
    throw error;
  }
};

/**
 * 🔑 Logika Bisnis Autentikasi Login Pengguna
 */
export const loginUser = async (username, password) => {
  try {
    // 1. Validasi: Cari user via repository
    const user = await userRepository.findUserByUsername(username);
    
    // Deteksi spesifik jika akun sama sekali belum ada di database
    if (!user) {
      throw new Error('Username belum terdaftar, nih! Yuk, buat akun baru dulu di tab Daftar! 📝');
    }

    // 2. Security: Bandingkan password ketikan dengan password_hash di database
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    // Deteksi spesifik jika akun ada tapi password-nya salah ketik
    if (!isMatch) {
      throw new Error('Kata sandi yang kamu masukkan salah, Ilmuwan Cilik! Periksa kembali ya. 🔑');
    }

    // 3. Tokenization: Generate Token JWT untuk sesi login 24 jam
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.nama_lengkap },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 🟢 PERBAIKAN: Sertakan parent_password dari database agar bisa diteruskan ke Controller -> Frontend
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
        parent_password: user.parent_password // 🔒 Dibawa ke frontend untuk disimpan di localStorage
      }
    };
  } catch (error) {
    console.error("❌ [Auth Service] Gagal memproses login:", error.message);
    throw error;
  }
};