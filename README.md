# Panduan Integrasi Google Sheets + WhatsApp
### Website Layanan Konseling Sahabat BKPI - UIBN Tegal

Sistem formulir pendaftaran konseling dan kotak curhat anonim kini menggunakan arsitektur **Kombinasi Terbaik (Google Sheets + WhatsApp Gateway)**:

1. **Otomatis Tersimpan ke Google Sheets:** Data pendaftar langsung tercatat rapi ke Spreadsheet milik pengurus HMPS BKPI untuk arsip, monitoring penanganan, dan laporan prodi.
2. **Langsung Terhubung ke WhatsApp:** Konseli langsung mendapatkan tombol chat WhatsApp dengan pesan yang sudah terformat rapi untuk penentuan jadwal temu secara personal.

---

## 📋 Langkah 2 Menit Menghubungkan ke Google Sheets Milikmu

Kamu tidak butuh server atau bayar sewa database. Ikuti langkah mudah berikut:

### Langkah 1: Buat Spreadsheet Baru
1. Buka browser dan buka [sheets.new](https://sheets.new) (pastikan login dengan akun Google HMPS BKPI atau akun pribadimu).
2. Beri judul spreadsheet: **Database Konseling HMPS BKPI UIBN**.
3. Di **Sheet1** (bisa di-rename menjadi **Pendaftaran**), buat judul kolom pada baris ke-1:
   * **A1:** `Waktu Pendaftaran`
   * **B1:** `Nama / Inisial`
   * **C1:** `No WhatsApp`
   * **D1:** `Topik Konseling`
   * **E1:** `Metode Sesi`
   * **F1:** `Pilihan Konselor`
   * **G1:** `Rencana Tanggal`
   * **H1:** `Status Penanganan`
   * **I1:** `Catatan Konselor`

---

### Langkah 2: Pasang Kode Apps Script
1. Di halaman Google Sheets tersebut, klik menu **Ekstensi** (*Extensions*) ➔ pilih **Apps Script**.
2. Hapus semua tulisan bawaan yang ada di editor tersebut.
3. Buka file [google-apps-script-code.js](file:///C:/Users/ASUS%20VIVOBOOK/.gemini/antigravity/scratch/uibn-bkpi-counseling/google-apps-script-code.js) di folder proyekmu, **salin semua isinya** lalu tempel ke editor Apps Script.
4. Klik tombol **Simpan** (ikon disket).

---

### Langkah 3: Deploy (Terapkan) Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan** (*Deploy*) ➔ pilih **Penerapan baru** (*New deployment*).
2. Klik ikon gerigi di sebelah kiri ➔ pilih **Aplikasi web** (*Web app*).
3. Isi kolom:
   * **Deskripsi:** `Formulir Konseling BKPI`
   * **Jalankan sebagai:** `Saya (email kamu)`
   * **Yang memiliki akses:** Pilih **`Siapa saja`** (*Anyone*) ⚠️ *(Penting agar website bisa mengirim data tanpa login akun Google)*.
4. Klik tombol **Terapkan** (*Deploy*).
5. Berikan izin akses (*Authorize access*) dengan memilih akun Google-mu.
6. Salin **URL Aplikasi Web** yang diberikan (URL berakhiran `/exec`).

---

### Langkah 4: Tempel URL ke Kodingan Web
1. Buka file [js/script.js](file:///C:/Users/ASUS%20VIVOBOOK/.gemini/antigravity/scratch/uibn-bkpi-counseling/js/script.js).
2. Cari baris ke-9:
   ```javascript
   const GOOGLE_SHEETS_URL = "TEMPEL_URL_KAMU_DI_SINI";
   ```
3. Ubah nomor WhatsApp pada baris ke-12 dengan nomor WhatsApp resmi HMPS BKPI:
   ```javascript
   const WHATSAPP_KONSELOR_NUMBER = "62882006744363";
   ```
4. Simpan file! Sekarang formulir di websitemu sudah 100% otomatis masuk ke Google Sheets dan membuka WhatsApp konselor!
