/**
 * 🔥 FORMAT TANGGAL INDONESIA
 * Mengubah string ISO / Date object jadi format: 3 Mei 2026 15:24
 */
export const formatTanggal = (
  tanggal: string | Date | null | undefined,
): string => {
  if (!tanggal) return "-";

  // Kita definisikan tipe opsinya sesuai standar Intl
  const opsi: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Tambahin ini biar format 24 jam konsisten, Bre!
  };

  try {
    const dateObj = new Date(tanggal);

    // Cek apakah tanggal valid (biar gak muncul "Invalid Date")
    if (isNaN(dateObj.getTime())) {
      return "Tanggal Invalid";
    }

    return dateObj.toLocaleDateString("id-ID", opsi);
  } catch (error) {
    console.error("FormatTanggal Error:", error);
    return "Gagal Format";
  }
};
