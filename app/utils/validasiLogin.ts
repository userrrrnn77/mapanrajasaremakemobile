/**
 * 🔥 VALIDASI LOGIN
 * Ngecek input sebelum ditembak ke server
 * @returns string (pesan error) atau null (jika valid)
 */
export const validasiLogin = (
  phone: string,
  password: string,
): string | null => {
  // 1. Validasi Nomor HP
  if (!phone) {
    return "Nomor HP wajib diisi, Bre!";
  }

  const cleanPhone = phone.trim();
  const phoneRegex = /^[0-9]+$/; // Cuma angka

  if (cleanPhone.length < 10) {
    return "Nomor HP minimal 10 digit";
  }

  if (!phoneRegex.test(cleanPhone)) {
    return "Nomor HP harus berupa angka saja";
  }

  // 2. Validasi Password
  if (!password) {
    return "Password jangan kosong, Bre!";
  }

  if (password.length < 8) {
    return "Password minimal 8 karakter";
  }

  return null; // Semua aman
};
