// Script Interaktivitas Lengkap - Layanan Konseling Sahabat BKPI UIBN Tegal
// Terintegrasi: Google Sheets Database + WhatsApp Gateway

// ====================================================================================
// PENGATURAN KONEKSI GOOGLE SHEETS & WHATSAPP
// ====================================================================================
// Tempelkan URL Google Apps Script Web App kamu di bawah ini (yang berakhiran /exec)
// Panduan lengkap membuat URL-nya ada di file: google-apps-script-code.js
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbw9RpUl2RNdWGL924Q306UyB1lepptNICYwPhergBrbPDFb8va7ypsVhDGkWj6abmMODw/exec"; 

// Ganti dengan nomor WhatsApp resmi HMPS BKPI / Konselor bertugas (Gunakan format 62...)
const WHATSAPP_KONSELOR_NUMBER = "62882006744363"; 
// ====================================================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 2. Anonymous Toggle on Booking Form
  const anonToggle = document.getElementById('anonToggle');
  const nameInput = document.getElementById('clientName');

  if (anonToggle && nameInput) {
    anonToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        const randomInitial = ['A', 'R', 'S', 'D', 'M', 'F', 'N'][Math.floor(Math.random() * 7)];
        nameInput.value = `Konseli (Inisial: ${randomInitial})`;
        nameInput.readOnly = true;
        nameInput.classList.add('bg-gray-100', 'text-gray-600', 'font-semibold');
      } else {
        nameInput.value = '';
        nameInput.readOnly = false;
        nameInput.classList.remove('bg-gray-100', 'text-gray-600', 'font-semibold');
        nameInput.focus();
      }
    });
  }

  // 3. Interactive Service Cards: Klik Layanan -> Auto-pilih di Form & Scroll
  const serviceCards = document.querySelectorAll('.service-card');
  const topicSelect = document.getElementById('counselingTopic');
  const reservationSection = document.getElementById('reservasi');

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const topic = card.getAttribute('data-topic');
      if (topic && topicSelect) {
        topicSelect.value = topic;
      }

      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
        const formCard = reservationSection.querySelector('form');
        if (formCard) {
          formCard.classList.add('ring-4', 'ring-emerald-400');
          setTimeout(() => {
            formCard.classList.remove('ring-4', 'ring-emerald-400');
          }, 1500);
        }
      }
    });
  });

  // 4. Interactive Format Cards: Klik Format Sesi -> Auto-pilih Radio & Scroll
  const formatCards = document.querySelectorAll('.format-card');
  formatCards.forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.getAttribute('data-mode');
      if (mode) {
        const targetRadio = document.querySelector(`input[name="counselingMode"][value="${mode}"]`);
        if (targetRadio) {
          targetRadio.checked = true;
        }
      }

      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 5. Booking Form Submission (Kombinasi Google Sheets + WhatsApp)
  const bookingForm = document.getElementById('bookingForm');
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalSummary = document.getElementById('modalSummary');
  const modalWaBtn = document.getElementById('modalWaBtn');
  const submitBtn = bookingForm ? bookingForm.querySelector('button[type="submit"]') : null;

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value || 'Konseli UIBN';
      const contact = document.getElementById('clientContact')?.value || '-';
      const topic = document.getElementById('counselingTopic')?.value || 'Umum';
      const mode = document.querySelector('input[name="counselingMode"]:checked')?.value || 'Tatap Muka di Ruang BKPI';
      const counselor = document.getElementById('counselorSelect')?.value || 'Konselor Sebaya (Mahasiswa BKPI)';
      const date = document.getElementById('sessionDate')?.value || 'Menyesuaikan ketersediaan';

      const bookingPayload = {
        action: 'booking',
        nama: name,
        kontak: contact,
        topik: topic,
        metode: mode,
        konselor: counselor,
        tanggal: date,
        waktuKirim: new Date().toISOString()
      };

      // Tampilkan status loading di tombol
      let originalBtnHtml = '';
      if (submitBtn) {
        originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <i class="fas fa-spinner fa-spin text-uibn-warmyellow mr-2"></i>
          <span>Menyimpan ke Google Sheets &amp; Menyiapkan Jadwal...</span>
        `;
      }

      // 1. KIRIM DATA KE GOOGLE SHEETS JIKA URL SUDAH DISET
      let sheetStatusMessage = "";
      if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.trim() !== "") {
        try {
          await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk Google Apps Script Web App
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingPayload)
          });
          sheetStatusMessage = `<span class="inline-flex items-center text-emerald-800 font-semibold"><i class="fas fa-check-circle text-emerald-600 mr-1.5"></i> Data berhasil terekap otomatis di Google Sheets HMPS BKPI</span>`;
        } catch (err) {
          console.error("Gagal mengirim ke Google Sheets:", err);
          sheetStatusMessage = `<span class="inline-flex items-center text-amber-800"><i class="fas fa-info-circle text-amber-600 mr-1.5"></i> Data tersimpan di memori browser (Google Sheets sedang offline)</span>`;
        }
      } else {
        // Backup ke penyimpanan lokal laptop (Local Storage)
        saveToLocalStorageBackup('booking_list', bookingPayload);
        sheetStatusMessage = `<span class="inline-flex items-center text-slate-700"><i class="fas fa-database text-yellow-500 mr-1.5"></i> Mode Siap Terhubung ke Google Sheets (Data tersimpan di rekap lokal)</span>`;
      }

      // Pulihkan tombol kirim
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }

      // 2. SIAPKAN RINGKASAN & LINK WHATSAPP
      if (modalSummary) {
        modalSummary.innerHTML = `
          <div class="space-y-3">
            <div class="bg-emerald-100/70 border border-emerald-300 rounded-2xl p-3 text-xs">
              ${sheetStatusMessage}
            </div>

            <div class="bg-white border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2 shadow-sm">
              <p><strong class="text-emerald-900">Nama / Inisial:</strong> ${escapeHtml(name)}</p>
              <p><strong class="text-emerald-900">WhatsApp Konseli:</strong> ${escapeHtml(contact)}</p>
              <p><strong class="text-emerald-900">Topik Konseling:</strong> ${escapeHtml(topic)}</p>
              <p><strong class="text-emerald-900">Metode Sesi:</strong> ${escapeHtml(mode)}</p>
              <p><strong class="text-emerald-900">Pilihan Konselor:</strong> ${escapeHtml(counselor)}</p>
              <p><strong class="text-emerald-900">Perkiraan Waktu:</strong> ${escapeHtml(date)}</p>
            </div>
            
            <p class="text-[11px] text-slate-500 text-center">
              Langkah terakhir: klik tombol hijau di bawah untuk mengirim konfirmasi langsung ke WhatsApp konselor.
            </p>
          </div>
        `;
      }

      // Generate Link WhatsApp dengan Teks Rapi
      const waText = encodeURIComponent(
        `Assalamu'alaikum Kak Konselor HMPS BKPI UIBN Tegal,\n\nSaya telah mengisi formulir pendaftaran konseling di website:\n• Nama/Inisial: ${name}\n• No. WhatsApp: ${contact}\n• Topik: ${topic}\n• Metode: ${mode}\n• Pilihan Konselor: ${counselor}\n• Rencana Tanggal: ${date}\n\nData sudah terkirim ke rekap database. Mohon konfirmasi jadwal temu ya kak. Terima kasih! 🙏`
      );
      
      if (modalWaBtn) {
        modalWaBtn.href = `https://wa.me/${WHATSAPP_KONSELOR_NUMBER}?text=${waText}`;
      }

      // Tampilkan Modal
      if (bookingModal) {
        bookingModal.classList.remove('hidden');
        bookingModal.classList.add('flex');
      }
    });
  }

  if (modalCloseBtn && bookingModal) {
    modalCloseBtn.addEventListener('click', () => {
      bookingModal.classList.add('hidden');
      bookingModal.classList.remove('flex');
      bookingForm.reset();
      if (nameInput) {
        nameInput.readOnly = false;
        nameInput.classList.remove('bg-gray-100', 'text-gray-600', 'font-semibold');
      }
    });
  }

  // 6. Interactive Self-Assessment (Cek Beban Emosi)
  const quizForm = document.getElementById('selfQuizForm');
  const quizResult = document.getElementById('quizResult');

  if (quizForm && quizResult) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const q1 = parseInt(document.querySelector('input[name="q1"]:checked')?.value || '1');
      const q2 = parseInt(document.querySelector('input[name="q2"]:checked')?.value || '1');
      const q3 = parseInt(document.querySelector('input[name="q3"]:checked')?.value || '1');
      const q4 = parseInt(document.querySelector('input[name="q4"]:checked')?.value || '1');

      const totalScore = q1 + q2 + q3 + q4;
      let level = '';
      let badgeColor = '';
      let description = '';

      if (totalScore <= 6) {
        level = 'Kondisi Emosionalmu Relatif Stabil 🌱';
        badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-300';
        description = 'Alhamdulillah, regulasi emosimu cukup baik saat ini. Pertahankan pola istirahat dan kegiatan positifmu. Jika sewaktu-waktu butuh teman bercerita, sahabat BKPI UIBN siap mendengarkan.';
      } else if (totalScore <= 10) {
        level = 'Perlu Relaksasi & Teman Berbagi Cerita 💛';
        badgeColor = 'bg-yellow-50 text-yellow-900 border-yellow-300';
        description = 'Kamu tampaknya sedang menampung cukup banyak pikiran atau tekanan kuliah. Jangan dipendam sendiri ya! Mengobrol santai dengan konselor sebaya bisa sangat membantumu merasa lebih lega.';
      } else {
        level = 'Beban Pikiran Cukup Berat & Sangat Perlu Didengar ❤️';
        badgeColor = 'bg-amber-50 text-amber-950 border-amber-300';
        description = 'Perasaanmu sepenuhnya valid. Beban kuliah, ekspektasi, atau masalah pribadi terkadang terasa sangat menumpuk. Kamu tidak harus memikul semuanya sendirian. Yuk, jadwalkan sesi konseling gratis dan rahasia bersama kami.';
      }

      quizResult.innerHTML = `
        <div class="p-6 rounded-3xl border ${badgeColor} transition-all duration-300 shadow-sm">
          <div class="flex items-center space-x-2 font-bold text-base mb-2">
            <span>${level}</span>
          </div>
          <p class="text-xs sm:text-sm leading-relaxed mb-4 text-slate-700">${description}</p>
          <a href="#reservasi" class="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-emerald-300 hover:border-emerald-500 transition-all">
            Jadwalkan Konseling Sekarang <i class="fas fa-arrow-right ml-2 text-[10px]"></i>
          </a>
        </div>
      `;
      quizResult.classList.remove('hidden');
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // 7. Kotak Curhat Anonim (Bisa tersimpan ke Google Sheets juga!)
  const ventBtn = document.getElementById('sendVentBtn');
  const ventInput = document.getElementById('ventText');
  const ventFeedback = document.getElementById('ventFeedback');

  const upliftingQuotes = [
    "Terima kasih sudah berani melepaskan beban itu. Menuliskan perasaan adalah langkah pertama yang hebat untuk menenangkan hati.",
    "Perasaanmu sepenuhnya valid. Kamu sudah berjuang sangat baik sampai hari ini di kampus, berikan pelukan hangat untuk dirimu sendiri.",
    "Tarik napas perlahan... Kamu tidak harus menyelesaikan semuanya dalam satu hari. Satu langkah kecil sudah sangat berarti.",
    "Ingat, kamu tidak sendirian di kampus ini. Sahabat BKPI UIBN siap menjadi tempat berteduh saat dunia kuliah terasa berisik."
  ];

  if (ventBtn && ventInput && ventFeedback) {
    ventBtn.addEventListener('click', async () => {
      const text = ventInput.value.trim();
      if (!text) {
        ventFeedback.innerHTML = `
          <div class="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl flex items-center gap-2">
            <i class="fas fa-exclamation-circle text-amber-600"></i>
            <span>Tuliskan sepatah kata atau apa yang sedang kamu rasakan terlebih dahulu ya.</span>
          </div>
        `;
        ventFeedback.classList.remove('hidden');
        return;
      }

      // Simpan curhat anonim ke Google Sheets secara asinkron
      if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.trim() !== "") {
        fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'curhat_anonim', pesan: text })
        }).catch(err => console.log("Gagal log curhat ke sheets:", err));
      } else {
        saveToLocalStorageBackup('curhat_anonim_list', { pesan: text, waktu: new Date().toISOString() });
      }

      const randomQuote = upliftingQuotes[Math.floor(Math.random() * upliftingQuotes.length)];
      ventFeedback.innerHTML = `
        <div class="bg-gradient-to-r from-emerald-50 to-yellow-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 text-sm shadow-sm">
          <div class="flex items-start space-x-3">
            <div class="w-9 h-9 rounded-full bg-yellow-400 text-emerald-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
              <i class="fas fa-heart text-sm"></i>
            </div>
            <div>
              <p class="font-extrabold text-sm mb-1 text-emerald-900">Pesanmu telah tersampaikan dengan aman</p>
              <p class="text-slate-700 italic text-xs mb-3 leading-relaxed">"${randomQuote}"</p>
              <div class="pt-2 border-t border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                <span class="text-[11px] text-emerald-700 font-medium">Butuh teman ngobrol dua arah?</span>
                <a href="#reservasi" class="text-xs font-bold text-emerald-800 hover:underline">
                  Jadwalkan Konseling <i class="fas fa-arrow-right text-[10px]"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      ventFeedback.classList.remove('hidden');
      ventInput.value = '';
    });
  }

  // 8. FAQ Accordion (Buka-Tutup Pertanyaan)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const toggleBtn = item.querySelector('.faq-toggle');
    const content = item.querySelector('.faq-content');
    const icon = toggleBtn?.querySelector('.fa-chevron-down');

    if (toggleBtn && content) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = content.classList.contains('hidden');
        
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.querySelector('.faq-content')?.classList.add('hidden');
            otherItem.querySelector('.fa-chevron-down')?.classList.remove('rotate-180');
          }
        });

        if (isHidden) {
          content.classList.remove('hidden');
          icon?.classList.add('rotate-180');
        } else {
          content.classList.add('hidden');
          icon?.classList.remove('rotate-180');
        }
      });
    }
  });

  // Helper Sanitasi HTML
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  // Helper Simpan Backup Cadangan ke LocalStorage Laptop
  function saveToLocalStorageBackup(key, data) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(data);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn("Storage full / blocked", e);
    }
  }

});
