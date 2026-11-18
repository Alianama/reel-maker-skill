---
name: reel-maker
description: Bikin reel vertikal 1080x1920 motion graphic (gaya paper atau voxel, caption kata-per-kata, kamera punch, transisi, SFX per animasi, musik) yang visual dan animasinya dirancang khusus sesuai isi konten, misalnya UI produk asli. Pakai saat user minta bikin reel/video/konten baru, edit reel, atau mengisi PROMPT-TEMPLATE.md.
---

# Reel Maker

Proyek Remotion ada di `reel/` (di root proyek kerja). Semua perintah dijalankan dari folder `reel/`.

**Setup sekali (kalau `reel/` belum ada):** salin folder `engine/` dari folder skill ini menjadi `reel/` di root proyek, lalu install:
`cp -R <folder-skill-ini>/engine ./reel && cd reel && npm install`. Salin juga `PROMPT-TEMPLATE.md` ke root proyek.
Butuh Node 20+, `ffmpeg`, dan (opsional, untuk timing VO) `whisper-cli`. Jangan render di dalam folder skill.
Untuk detail Remotion, lihat skill `remotion-best-practices`.
Contoh: `reel/reels/umum/kenapa-ai-2026/script.json` (topik umum), `reel/reels/melichat/pengenalan-voxel/script.json` dan `reel/reels/melibrain/pengenalan/script.json` (produk, UI asli, tanpa suara + musik). Baca dulu.

## Prinsip utama: gaya tetap, isi dirancang ulang

Yang **sama** di setiap video = gaya: skin (paper/voxel), caption, headline stempel, kamera punch, transisi, fx, kepadatan SFX, musik, ritme cepat.
Yang **tidak boleh sama** = template isi. Jangan mengulang urutan/visual video sebelumnya hanya karena sudah ada.

1. **Riset konten dulu.** Kalau tentang produk/aplikasi: baca kode UI, dokumen produk, harga, FAQ (mis. folder website user) untuk tahu tampilan layar, fitur, istilah, dan alur kerjanya. Jangan mengarang fitur.
2. **Tunjukkan, jangan cuma sebut.** Animasi harus memperagakan isi: produk → tiru UI aslinya (layout, label, status, warna brand) dan perlihatkan cara kerjanya langkah demi langkah dengan satu cerita/tokoh yang konsisten dari awal sampai hasil. Topik lain → cari metafora visual yang paling pas untuk topik itu.
3. **Bikin visual baru kalau katalog tidak pas.** Tambahkan komponen di `src/` (seperti `ChatUI.tsx` untuk Melichat) daripada memaksakan `cards`/`folder`/`envelope`. Setiap komponen baru: elemen muncul bertahap sepanjang durasi (bukan statis), ikut palet skin, dan **setiap elemen yang muncul diberi SFX** (`<Sfx name at />`).
4. **Ramai tapi rapi**: setiap animasi kecil bersuara (pop, ding, ketik, blip, koin, whoosh), plus musik latar. Kalau suara efek yang ada tidak cocok, tambah resep di `scripts/sfx.mjs`.
5. Pilih struktur yang cocok dengan konten (cara kerja, before/after, cerita, tips, daftar); struktur hook → poin → twist → action → CTA hanya **contoh**, bukan kewajiban. Hook dan CTA tetap wajib.

## Alur kerja (selalu urut)

1. **Slug** = `<produk>/<judul>` huruf kecil-tanda-hubung, mis. `melichat/pov-admin-tanggal-kembar`.
   Folder produk: `melichat` · `melibrain` · `melidoc` · `melikas` (kasir & pesan dari HP, pengganti Melisense sejak 29 Okt 2026) · `melisense` (arsip) · `almeli` (perusahaan/lintas produk/layanan) · `umum` (topik umum).
2. **Tanya user dulu: pasang watermark atau tidak?** (default handle `@almelilabs`). Kalau ya, isi top-level `"watermark": "@almelilabs"`: teks putih transparan yang pindah posisi tiap 4 detik di tepi video supaya susah dipotong.
3. **Tulis `reel/reels/<produk>/<judul>/script.json`** mengikuti aturan di bawah, plus **`caption.txt`** (caption postingan siap tempel + hashtag) di folder yang sama. Naskah VO ElevenLabs (dengan tag intonasi) → **`vo.txt`**, rekamannya → **`vo.mp3`**, semua di folder reel itu.
   **Root `claude-video/` hanya untuk `reel/` + template.** File dari user (mp3/mp4) yang ditaruh di root: pindahkan ke folder reel/edit/talk-nya, jangan dibiarkan dobel.
4. **Gambar**: pakai yang ada di `reel/public/img/` atau minta user menaruh foto di sana. Boleh juga URL https langsung.
5. **Render**: `cd reel && npm run make -- <produk>/<judul>` → `out/<produk>/<judul>.mp4`. Perhatikan peringatan `⚠️ "at" not found` dan perbaiki.
6. **Cek sendiri**: buka `out/<slug>-check.jpg` (2 frame per scene) dengan Read. Cari teks terpotong,
   visual tertutup caption, elemen keluar layar, teks gelap di bg gelap. Perbaiki, lalu render ulang.
7. Laporkan path mp4, durasi, dan apa saja yang diperbaiki.

Revisi dari user → edit `script.json` saja, lalu render ulang. Suara hanya direkam ulang untuk scene yang teksnya berubah.

## Aturan naskah

- 8–12 scene, total 40–60 detik. Satu scene = 1–2 kalimat (± 8–18 kata).
- Bahasa lisan santai ("kamu", "aku"). Angka yang aneh kalau dibaca TTS ditulis dengan kata.
- Teks di layar hanya caption + headline stempel. Jangan tambah teks kecil/label/subjudul.
- Ikon: **jangan pakai emoji**. Pakai nama ikon Lucide (kebab-case, cek https://lucide.dev/icons), mis. `clock`, `graduation-cap`, `rocket`.
- Contoh struktur (boleh diubah sesuai konten): **hook** (bg `cork`) → **roadmap** (`steps`, headline) → tiap poin: scene judul
  (transition `halftone`, `headline` dengan `num`) + scene contoh (transition `whip`) → **twist** (`compare`) → **action** (bg `dark`, `bigText`) → **cta**.
- Tandai 1–2 kata penting per scene dengan `*kata*` (merah serif italic). Jangan lebih.
- **Setiap scene wajib bergerak**: minimal 1 `fx`, dan scene panjang (> 4 dtk) diberi 2 `beats` atau visual yang beranimasi sepanjang durasi (mis. `chat`, `lead`, `pipeline`).
- Jangan mengarang statistik. Kalau tidak ada sumber, tulis `"source": "contoh ilustrasi"`.

## Gaya visual (top-level `script.json`)

| field | isi |
|---|---|
| `watermark` | opsional, mis. `"@almelilabs"`: handle berpindah-pindah di tepi layar (anti-crop). **Selalu tanya user** sebelum memasang. |
| `style` | `"paper"` (default: krem + merah) · `"lime"` (gaya paper: font biasa, bayangan lembut, tekstur kertas, tapi warna brand lime/hijau tua/charcoal/krem; aksen = hijau tua `#4D7C0F`, sorotan = lime `#A3E635`) · `"voxel"` (dunia pixel 3D, palet lime `#A3E635`/`#84CC16`, hijau tua `#4D7C0F`/`#365314`, charcoal `#111827`, krem `#F7FEE7`) |

Di gaya voxel: font pixel, sudut kotak, foto tetap asli (tidak dipixelkan), transisi halftone jadi blok pixel, background langit krem + awan pixel + kubus 3D + tanah rumput (`cork` = malam charcoal, `dark` = malam hitam).
Ikon: pakai nama dari https://pixelarticons.com (mis. `clock`, `book-open`, `chart-line`, `robot-face-happy`); kalau tidak ada, otomatis fallback ke Lucide.
Contoh lengkap: `reel/reels/umum/kenapa-ai-2026-voxel/script.json`.

## Field scene

| field | isi |
|---|---|
| `label` | catatan internal (tidak tampil) |
| `text` | narasi (dibacakan + jadi caption) |
| `bg` | `paper` (default) · `cork` (papan gabus, untuk hook) · `dark` |
| `transition` | masuk ke scene ini: `zoom` (default, zoom-blur) · `whip` (geser cepat) · `halftone` (titik hitam, untuk ganti bagian) |
| `headline` | `{ "text": "HEMAT *WAKTU*", "num": 1, "at": "waktu" }`: teks stempel diketik per huruf (maks 2–3 kata), ditambah badge nomor |
| `visual` | satu visual untuk seluruh scene, **atau** |
| `beats` | `[{ "visual": {...}, "cross": true }, { "at": "sekarang", "visual": {...} }]`: visual berganti pada kata `at`; visual lama mengecil ke pojok (dicoret merah jika `cross`) |
| `fx` | `[{ "type": "burst", "at": "kata", "x": 0, "y": -100 }]`: efek pada kata tertentu (+ kamera punch + SFX) |

`at` = potongan kata yang **diucapkan di `text`** (tanpa `*`), atau angka detik.
`x`/`y` = geser dari tengah area visual dalam px (area kira-kira ±450 horizontal, ±450 vertikal).

### fx
`burst` (konfeti merah/hitam) · `ring` (lingkaran fokus) · `x` (coret merah besar, hilang saat beat berganti) ·
`check` (centang merah) · `note` (sticky note kuning, isi `text`) · `punch` (hanya zoom kamera).

### Katalog visual (`visual.type`)

| type | dipakai untuk | bentuk |
|---|---|---|
| `cards` | hook, kumpulan topik (2–5) | `{ "magnifier": true, "items": [{ "image": "img/kerja.jpg", "label": "Kerja" }] }` (`icon` bisa menggantikan `image`) |
| `image` | satu foto polaroid | `{ "src": "img/mesin-ketik.jpg", "caption": "cara lama" }` |
| `phone` | konten/aplikasi HP | `{ "image": "img/catatan.jpg", "title": "Laporan *seharian*", "chip": "8 JAM" }` |
| `laptop` | kerja di komputer | `{ "image": "img/laptop.jpg", "title": "Selesai dalam 2 menit" }` (`title` = jendela app di layar) |
| `browser` | website | `{ "url": "asisten-ai.chat", "title": "Mau belajar apa?", "image": "…" }` |
| `window` | chat/AI bekerja, checklist | `{ "title": "Asisten AI", "prompt": "teks diketik", "lines": [{ "text": "…", "tag": "desain", "warn": false }] }` (maks 4 baris) |
| `folder` | kumpulan file/peran | `{ "name": "Bisnis Kamu", "files": [{ "icon": "pen-line", "label": "konten" }] }` (maks 4) |
| `envelope` | misteri/pertanyaan, membuka daftar | `{ "label": "KENAPA?", "items": ["1","2","3"] }` (terbuka di tengah durasi) |
| `app` | memperkenalkan tools | `{ "icon": "graduation-cap", "name": "Guru *AI*", "color": "#E5322D" }` |
| `bigText` | punchline | `{ "text": "MULAI *HARI INI*" }` (maks 3 kata) |
| `steps` | daftar poin | `{ "active": 0, "items": [{ "title": "Waktu", "icon": "clock" }] }` |
| `stat` | angka | `{ "value": "75%", "label": "…", "source": "sumber/contoh ilustrasi" }` |
| `compare` | tanpa vs pakai | `{ "left": { "title": "Tanpa AI", "items": [] }, "right": { "title": "Pakai AI", "items": [] } }` (maks 3 item, ≤ 18 huruf) |
| `cta` | penutup | `{ "keyword": "AI" }` |
| `notifs` | hook "chat numpuk" | HP layar kunci dibanjiri notifikasi: `{ "total": 99, "items": [{ "channel": "whatsapp", "name": "Rina", "text": "…" }] }` |
| `inbox` | daftar percakapan (UI Melichat) | `{ "items": [{ "name": "…", "channel": "instagram", "text": "…", "unread": 2, "status": "bot\|wait\|agent" }] }` (maks 5) |
| `chat` | isi percakapan, pesan muncul bergantian | `{ "contact": "…", "channel": "whatsapp", "messages": [{ "from": "customer\|bot\|agent\|note\|event", "text": "…", "name": "Andi · Sales", "buttons": ["…"], "order": { "title": "…", "price": "…" } }] }` (maks 5) |
| `lead` | skor & data lead | `{ "name": "…", "score": 86, "intents": ["ingin beli"], "fields": [{ "label": "Kota", "value": "Bandung" }] }` |
| `pipeline` | kartu pindah kolom (deal Melichat, papan pesanan Melikas `Baru/Diproses/Siap`) | `{ "columns": ["Baru", "Kualifikasi", "Penawaran", "Berhasil"], "deal": { "title": "…", "value": "Rp 7 jt" } }` |

| `pile` | hook "dokumen numpuk" | file berjatuhan + kolom cari dengan timer: `{ "files": ["SOP_v3.pdf", "…"], "total": 248 }` |
| `upload` | unggah ke basis pengetahuan (UI Melibrain) | `{ "base": "Kebijakan HR", "files": [{ "name": "Cuti.pdf", "pages": 12, "ocr": false }] }` (maks 4) |
| `ask` | tanya → mencari → jawaban dengan kutipan `[1]` | `{ "question": "…", "answer": "… [1] … [2].", "refuse": false }` (`refuse: true` = "tidak ada di dokumen") |
| `sources` | daftar sumber + bar relevansi | `{ "items": [{ "title": "Cuti.pdf", "page": 4, "score": 0.94, "cited": true }] }` |
| `docPage` | halaman dokumen, kalimat disorot | `{ "title": "Cuti.pdf", "page": 4, "before": "…", "mark": "kalimat jawaban", "after": "…" }` |

| `extract` | Melidoc: dokumen dipindai, field terisi + cek lolos/gagal | `{ "doc": "Faktur Pajak", "fields": [{ "label": "PPN", "value": "Rp 1.200.000", "ok": false, "note": "harusnya Rp 1.100.000" }] }` (maks 5; `ok` kosong = tanpa cek) |
| `calc` | hitungan ala struk, hasil distempel | `{ "title": "PPN 12%", "rows": [{ "label": "Harga jual", "value": "12.000.000", "op": "×" }], "result": { "label": "PPN", "value": "Rp 1.320.000" } }` (maks 4 baris) |
| `mentions` | Melisense: grafik mention, komposisi sentimen, mention mengalir, peringatan | `{ "topic": "KopiKita", "bars": [3,4,3,5,4,4,14], "items": [{ "source": "instagram\|x\|telegram\|berita", "user": "@rani", "text": "…", "sentiment": "positif\|netral\|negatif" }], "alert": "Sentimen negatif melonjak" }` (maks 4 item) |
| `flow` | diagram alur / cara kerja teknis | `{ "nodes": [{ "icon": "files", "label": "Dokumen" }] }` (3–5 node) |
| `define` | kartu istilah (seri "istilah AI") | `{ "term": "OCR", "say": "o-se-er", "meaning": "…", "example": "…" }` |

`channel`: `whatsapp` · `instagram` · `telegram` · `messenger` · `website`. Contoh UI produk: `reel/reels/melichat/pengenalan-voxel/script.json` (voxel) dan `reel/reels/melibrain/pengenalan/script.json` (lime).

Visual tempat makan / kasir (UI Melikas, `src/KasUI.tsx`; label meniru aplikasi aslinya). Bisa dipakai ulang untuk konten UMKM/kuliner apa pun:

| type | dipakai untuk | bentuk |
|---|---|---|
| `meja` | hook "datang duluan, dilayani belakangan" | dua meja, jam +menit jalan, mangkuk ke meja sebelah, stempel LHO?!: `{ "you": "Kamu\ndatang 19.00", "them": "Meja sebelah\ndatang 19.15" }` (label putih → pakai bg `cork`/`dark`) |
| `nota` | hook "pesanan kertas numpuk" | nota berjatuhan lalu stempel merah: `{ "notes": ["Meja 4: seblak lv 3"], "diff": "LUPA DICATAT" }` (5–6 nota) |
| `qrOrder` | scan QR meja → menu di HP | `{ "store": "…", "table": "4", "item": "…", "price": 18000, "options": [{ "group": "Level pedas", "choices": ["0","1","2","3"], "pick": 3, "extra": 0 }], "name": "Dinda" }` (maks 2 grup) |
| `qris` | bayar QRIS nominal pas → uang masuk → LUNAS | `{ "store": "…", "total": 23000 }` |
| `report` | laporan penjualan | `{ "omzet": 2340000, "bars": [5,7,6,8,7,10,12], "qris": 62, "best": "…", "sold": 64 }` |
| `countdown` | hitung mundur rilis (tanpa tanggal) | `{ "days": 29 }` → HARI:JAM:MENIT:DETIK, detik berjalan. `days` = sisa hari pada tanggal posting |

Jangan memakai visual yang sama di dua scene berturut-turut, kecuali `steps` dengan `active` berbeda.

## Suara & SFX

- **Tanpa suara**: `"voice": false` → tidak ada TTS, caption jadi teks layar, hanya SFX. Durasi scene = 0,4 dtk/kata + 1,6 dtk; atur manual dengan `"duration": 8` per scene (scene `chat`/`lead` butuh 6–8 dtk). Angka boleh ditulis digit.
- Default: suara macOS `say` (Damayanti, gratis). `"voice": { "sayRate": 185 }` mengatur kecepatan.
- ElevenLabs lewat API: `"voice": { "elevenlabsVoiceId": "<id>" }` lalu `ELEVENLABS_API_KEY=xxx npm run make -- <slug>`.
- **ElevenLabs manual (yang biasa dipakai user)**: tulis `vo.txt` (Eleven v3, tag intonasi `[excited]`, `[whispers]`, `[pause]`; hook langsung di detik 0). User mengirim satu mp3 → simpan sebagai `reels/<slug>/vo.mp3`, set `"voice": { "file": "reels/<slug>/vo.mp3" }`, dan isi `"start"` (detik) di tiap scene. Cari `start` dengan transkrip per kata:
  `ffmpeg -i vo.mp3 -ar 16000 -ac 1 vo.wav && whisper-cli -m ~/.cache/whisper/ggml-base.bin -l id -ml 1 -sow -f vo.wav` (start = ±0,1 dtk sebelum kata pertama scene). Cocokkan `text` dengan yang benar-benar diucapkan; kalau ada kalimat yang hilang di rekaman, beri tahu user. Hapus `"duration"` saat memakai file.
- Timing caption mengikuti volume suara (dihitung otomatis di `scripts/make.mjs`).
- **Musik latar**: top-level `"music"`, pilih yang cocok dengan konten: `"music/chiptune.wav"` (120 BPM, ceria, cocok voxel) · `"music/lofi.wav"` (88 BPM, tenang & cerdas, cocok paper/lime) · `"music/groove.wav"` (bergerak, cocok konten jualan/UMKM). Dibuat oleh `node scripts/music.mjs [chiptune|lofi]`, bebas royalti; tambah gaya baru di sana bila perlu. Volume otomatis 0,32 tanpa narasi / 0,1 dengan narasi, fade in/out. Audio akhir dinormalisasi ke -14 LUFS.
- Setiap animasi di dalam visual punya SFX sendiri (pesan masuk `ding`, bubble `pop`, mengetik `type`, tombol `blip`, pesanan/skor `coin`, ambil alih `takeover`, baris `slide`). Visual baru juga wajib diberi `<Sfx name at />` (dari `src/sfx.tsx`).
- SFX berlapis (sub-bass + whoosh + Kenney CC0) dibuat oleh `node scripts/sfx.mjs` ke `reel/public/sfx/`; satu file per efek (`boom`, `ring`, `x`, `check`, `note`, `stamp`, `tick`, `beat`, `whoosh`, `whip`, `halftone`, `punch`, `pop`, `ding`, `type`, `slide`, `blip`, `coin`, `takeover`, `tap`, `buzz`, `cash`, `print`, `error`, `alarm`). Ubah resepnya di `RECIPES`.

## Kode gaya (konsisten di semua video; visual baru boleh ditambah)

Warna, font, dan tekstur background ada di `reel/src/theme.ts`. Efek ada di `src/Fx.tsx`, visual di `src/Visuals.tsx`,
kamera/transisi/caption/headline di `src/Reel.tsx`. Visual baru → tambah `type` di `Visuals.tsx` + `Visual` di `theme.ts` + katalog di atas.

## Sumber fakta produk Almeli Labs

Minta user menunjukkan folder website/dokumen Almeli Labs (biasanya berisi `samples/melichat/*.md`: profil, produk & harga, langganan, FAQ, layanan engineering; `docs/brand-identity.md`; kode UI di `products/<produk>/frontend/src`). Kalau tidak ada, tanya user; jangan mengarang.
Trial paket per produk 14 hari tanpa pembayaran (Enterprise tidak ada trial). Jangan mengarang fitur, angka, atau testimoni; data contoh boleh asal jelas ilustrasi.
