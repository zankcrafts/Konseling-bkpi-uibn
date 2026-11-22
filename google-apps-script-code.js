/**
 * KODE GOOGLE APPS SCRIPT UNTUK GOOGLE SHEETS
 * HMPS BKPI - UNIVERSITAS ISLAM BAKTI NEGARA TEGAL
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Beri nama file: "Database Konseling HMPS BKPI UIBN"
 * 3. Di baris pertama (Header), buat kolom:
 *    A1: Waktu Pendaftaran
 *    B1: Nama / Inisial
 *    C1: No WhatsApp
 *    D1: Topik Konseling
 *    E1: Metode Konseling
 *    F1: Pilihan Konselor
 *    G1: Rencana Tanggal
 *    H1: Status Penanganan
 *    I1: Catatan Konselor
 * 4. Klik menu "Ekstensi" (Extensions) -> pilih "Apps Script".
 * 5. Hapus kode bawaan, lalu SALIN & TEMPEL (Copy-Paste) seluruh kode di bawah ini:
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    if (data.action === "booking") {
      var sheet = ss.getSheetByName("Pendaftaran") || ss.getActiveSheet();
      sheet.appendRow([
        new Date(),
        data.nama,
        "'" + data.kontak,
        data.topik,
        data.metode,
        data.konselor,
        data.tanggal,
        "Belum Dihubungi", // Status default
        ""                  // Catatan konselor
      ]);
    } else if (data.action === "curhat_anonim") {
      var curhatSheet = ss.getSheetByName("Curhat Anonim");
      if (!curhatSheet) {
        curhatSheet = ss.insertSheet("Curhat Anonim");
        curhatSheet.appendRow(["Waktu", "Isi Curahan Hati"]);
      }
      curhatSheet.appendRow([new Date(), data.pesan]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * LANGKAH DEPLOY APPS SCRIPT:
 * 1. Di editor Apps Script, klik tombol biru "Terapkan" (Deploy) di kanan atas -> pilih "Penerapan baru" (New deployment).
 * 2. Klik ikon gerigi (Select type) -> pilih "Aplikasi web" (Web app).
 * 3. Isi keterangan (misal: "Web Layanan BKPI").
 * 4. Pada bagian "Yang memiliki akses" (Who has access), UBAH menjadi: "Siapa saja" (Anyone).
 * 5. Klik "Terapkan" (Deploy) dan berikan izin akses Google akunmu.
 * 6. Salin "URL Aplikasi Web" yang berakhiran `/exec`.
 * 7. Tempelkan URL tersebut ke file `js/script.js` pada variabel `GOOGLE_SHEETS_URL`.
 */
