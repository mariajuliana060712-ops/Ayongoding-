/* ===== Coding Academy - script.js ===== */
(function () {
  'use strict';

  var STORAGE_KEY = 'AyoNgoding!Registrations';
  var CONFIRM_TEXT = 'Apakah Anda sudah yakin untuk menyimpan?';
  var VIEWS = ['gallery', 'pendaftaran', 'hasil'];

  // ---------- Elemen ----------
  var form = document.getElementById('registrationForm');
  var formAlert = document.getElementById('formAlert');
  var resetBtn = document.getElementById('resetBtn');
  var anotherBtn = document.getElementById('anotherBtn');
  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');

  var fields = {
    nik: document.getElementById('nik'),
    nama: document.getElementById('nama'),
    hp: document.getElementById('hp'),
    alamat: document.getElementById('alamat'),
    bahasa: document.getElementById('bahasa')
  };

  var errorEls = {
    nik: document.getElementById('nikError'),
    nama: document.getElementById('namaError'),
    gender: document.getElementById('genderError'),
    hp: document.getElementById('hpError'),
    alamat: document.getElementById('alamatError'),
    bahasa: document.getElementById('bahasaError')
  };

  var lastRegistration = null; // data untuk halaman hasil (hanya di memori)

  // ---------- Penyimpanan (localStorage) ----------
  function loadRegistrations() {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') return [];
    var parsed = JSON.parse(raw); // sengaja dibiarkan melempar error bila rusak
    if (!Array.isArray(parsed)) {
      throw new Error('Format data tersimpan tidak valid.');
    }
    return parsed;
  }

  function saveRegistration(entry) {
    var list = loadRegistrations();      // data lama tetap dipertahankan
    list.push(entry);                    // pendaftaran baru ditambahkan
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list.length;
  }

  // ---------- Validasi ----------
  function getGender() {
    var checked = form.querySelector('input[name="gender"]:checked');
    return checked ? checked.value : '';
  }

  function validateField(name, value) {
    switch (name) {
      case 'nik':
        if (value === '') return 'NIK wajib diisi.';
        if (!/^\d+$/.test(value)) return 'NIK hanya boleh berisi angka.';
        if (value.length !== 16) return 'NIK harus tepat 16 digit (saat ini ' + value.length + ' digit).';
        return '';
      case 'nama':
        if (value === '') return 'Nama lengkap wajib diisi.';
        if (value.length < 3) return 'Nama lengkap minimal 3 karakter.';
        if (!/^[\p{L}][\p{L}\s.'\-]*$/u.test(value)) return 'Nama hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.';
        return '';
      case 'gender':
        return value === '' ? 'Jenis kelamin wajib dipilih.' : '';
      case 'hp': {
        if (value === '') return 'Nomor HP wajib diisi.';
        var cleaned = value.replace(/[\s\-]/g, '');
        if (!/^\+?\d+$/.test(cleaned)) return 'Nomor HP hanya boleh berisi angka, spasi, tanda hubung, dan awalan +.';
        if (!/^(?:\+62|62|0)8[1-9]\d{7,10}$/.test(cleaned)) {
          return 'Format nomor HP tidak valid. Gunakan 08xxxxxxxxxx, 628xxxxxxxxxx, atau +628xxxxxxxxxx (10-13 digit).';
        }
        return '';
      }
      case 'alamat':
        if (value === '') return 'Alamat wajib diisi.';
        if (value.length < 10) return 'Alamat terlalu singkat. Tulis alamat lengkap (minimal 10 karakter).';
        return '';
      case 'bahasa':
        return value === '' ? 'Pilih salah satu bahasa pemrograman.' : '';
      default:
        return '';
    }
  }

  function readValues() {
    return {
      nik: fields.nik.value.trim(),
      nama: fields.nama.value.trim(),
      gender: getGender(),
      hp: fields.hp.value.trim(),
      alamat: fields.alamat.value.trim(),
      bahasa: fields.bahasa.value
    };
  }

  function setError(name, message) {
    var el = errorEls[name];
    var group = el.closest('.form-group');
    el.textContent = message;
    group.classList.toggle('has-error', message !== '');
    var input = fields[name];
    if (input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function clearErrors() {
    Object.keys(errorEls).forEach(function (name) { setError(name, ''); });
    hideAlert();
  }

  function validateAll() {
    var values = readValues();
    var order = ['nik', 'nama', 'gender', 'hp', 'alamat', 'bahasa'];
    var firstInvalid = null;
    var count = 0;

    order.forEach(function (name) {
      var msg = validateField(name, values[name]);
      setError(name, msg);
      if (msg) {
        count++;
        if (!firstInvalid) firstInvalid = name;
      }
    });

    return { valid: count === 0, count: count, firstInvalid: firstInvalid, values: values };
  }

  function focusField(name) {
    var target = name === 'gender' ? form.querySelector('input[name="gender"]') : fields[name];
    if (target) target.focus();
  }

  // ---------- Alert ----------
  function showAlert(message, type) {
    formAlert.textContent = message;
    formAlert.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.hidden = true;
    formAlert.textContent = '';
  }

  // ---------- Navigasi ----------
  function showView(name) {
    VIEWS.forEach(function (v) {
      document.getElementById('view-' + v).hidden = (v !== name);
    });

    document.querySelectorAll('.nav-link').forEach(function (link) {
      var active = link.getAttribute('data-nav') === name;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    closeMenu();
    window.scrollTo(0, 0);
  }

  function route() {
    var name = window.location.hash.replace('#', '');
    if (VIEWS.indexOf(name) === -1) name = 'gallery';

    // Halaman hasil hanya bisa dibuka setelah pendaftaran berhasil
    if (name === 'hasil' && !lastRegistration) {
      name = 'gallery';
      if (window.location.hash !== '#gallery') {
        window.history.replaceState(null, '', '#gallery');
      }
    }

    showView(name);

    if (name === 'hasil') {
      var title = document.getElementById('resultTitle');
      if (title) title.focus({ preventScroll: true });
    }
  }

  function goTo(name) {
    if (window.location.hash === '#' + name) {
      route();
    } else {
      window.location.hash = name;
    }
  }

  function closeMenu() {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu');
  }

  menuToggle.addEventListener('click', function () {
    var open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-nav]');
    if (!link) return;
    event.preventDefault();
    goTo(link.getAttribute('data-nav'));
  });

  window.addEventListener('hashchange', route);

  // ---------- Hasil pendaftaran (aman: textContent) ----------
  function renderResult(entry, total) {
    document.getElementById('outNik').textContent = entry.nik;
    document.getElementById('outNama').textContent = entry.nama;
    document.getElementById('outGender').textContent = entry.gender;
    document.getElementById('outHp').textContent = entry.hp;
    document.getElementById('outAlamat').textContent = entry.alamat;
    document.getElementById('outBahasa').textContent = entry.bahasa;

    var when = new Date(entry.createdAt).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    document.getElementById('outMeta').textContent =
      'Disimpan pada ' + when + '. Total pendaftar tersimpan di browser ini: ' + total + '.';
  }

  // ---------- Form ----------
  function resetForm() {
    form.reset();
    clearErrors();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideAlert();

    var result = validateAll();
    if (!result.valid) {
      showAlert(
        'Pendaftaran belum dapat disimpan: terdapat ' + result.count +
        ' kolom yang kosong atau tidak valid. Periksa pesan kesalahan di bawah setiap kolom.',
        'error'
      );
      focusField(result.firstInvalid);
      return;
    }

    // Dialog konfirmasi
    var yakin = window.confirm(CONFIRM_TEXT);
    if (!yakin) {
      showAlert('Penyimpanan dibatalkan. Anda dapat memeriksa atau mengubah data sebelum menyimpan.', 'error');
      return; // formulir tetap tampil dengan data utuh
    }

    var entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nik: result.values.nik,
      nama: result.values.nama,
      gender: result.values.gender,
      hp: result.values.hp,
      alamat: result.values.alamat,
      bahasa: result.values.bahasa,
      createdAt: new Date().toISOString()
    };

    var total;
    try {
      total = saveRegistration(entry);
    } catch (err) {
      var msg = 'Gagal menyimpan data. ';
      if (err && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        msg += 'Penyimpanan browser penuh.';
      } else if (err && err.name === 'SyntaxError') {
        msg += 'Data tersimpan sebelumnya rusak, sehingga tidak ditimpa demi keamanan data lama.';
      } else if (err && err.name === 'SecurityError') {
        msg += 'Browser memblokir akses penyimpanan (mode privat atau cookie/penyimpanan dinonaktifkan).';
      } else {
        msg += (err && err.message) ? err.message : 'Terjadi kesalahan tidak dikenal.';
      }
      showAlert(msg + ' Data Anda masih ada di formulir, silakan coba lagi.', 'error');
      return;
    }

    lastRegistration = entry;
    renderResult(entry, total);
    resetForm(); // data sudah tersimpan; siapkan formulir kosong
    goTo('hasil');
  });

  resetBtn.addEventListener('click', function () {
    resetForm(); // hanya mengosongkan isian, data localStorage tidak disentuh
    fields.nik.focus();
  });

  anotherBtn.addEventListener('click', function () {
    resetForm();
    goTo('pendaftaran');
    fields.nik.focus();
  });

  // Hanya angka untuk NIK (saat mengetik / menempel)
  fields.nik.addEventListener('input', function () {
    var cleaned = fields.nik.value.replace(/\D/g, '').slice(0, 16);
    if (cleaned !== fields.nik.value) fields.nik.value = cleaned;
    if (errorEls.nik.textContent) setError('nik', validateField('nik', cleaned));
  });

  // Hapus pesan kesalahan ketika pengguna memperbaiki isian
  ['nama', 'hp', 'alamat', 'bahasa'].forEach(function (name) {
    var evt = name === 'bahasa' ? 'change' : 'input';
    fields[name].addEventListener(evt, function () {
      if (errorEls[name].textContent) {
        setError(name, validateField(name, fields[name].value.trim()));
      }
    });
  });

  form.querySelectorAll('input[name="gender"]').forEach(function (radio) {
    radio.addEventListener('change', function () { setError('gender', ''); });
  });

  // ---------- Fallback gambar (jika sumber eksternal gagal dimuat) ----------
  function escapeXml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c];
    });
  }

  function makeFallbackSrc(label, color) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#0b1f4d"/><stop offset="1" stop-color="' + escapeXml(color) + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="500" fill="url(#g)"/>' +
      '<rect x="120" y="90" width="560" height="300" rx="18" fill="#0b1220" opacity="0.85"/>' +
      '<circle cx="152" cy="118" r="7" fill="#f87171"/><circle cx="176" cy="118" r="7" fill="#fbbf24"/><circle cx="200" cy="118" r="7" fill="#4ade80"/>' +
      '<text x="400" y="270" text-anchor="middle" font-family="Courier New, monospace" font-size="96" font-weight="700" fill="#38bdf8">&lt;/&gt;</text>' +
      '<text x="400" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff">' +
      escapeXml(label) + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function applyFallback(img) {
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    img.src = makeFallbackSrc(img.dataset.fallback || 'Coding Academy', img.dataset.color || '#2563eb');
  }

  document.querySelectorAll('.card-img img').forEach(function (img) {
    img.addEventListener('error', function () { applyFallback(img); });
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) applyFallback(img);
  });

  // ---------- Init ----------
  document.getElementById('year').textContent = new Date().getFullYear();
  route();
})();