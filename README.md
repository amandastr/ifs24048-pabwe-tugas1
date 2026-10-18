# Peachy Plans - Simple To-Do List

Aplikasi web to-do list bertema pink yang imut, dibuat untuk **Tugas I - 11S3133 Pengembangan Aplikasi Berbasis Web**.
Kode dikembangkan dengan bantuan Generative AI (Claude) sebagai asisten pemrograman, lalu dievaluasi, diuji, dan diperbaiki secara mandiri.

## Fitur
- Sidebar: Home, All Tasks, In Progress, Completed (dengan jumlah tugas)
- Sapaan sesuai waktu ("Good Morning", dst.) dan nama yang dapat diganti (klik "Hallo, ...")
- Tambah cepat lewat kolom Add, atau dialog lengkap: judul, deskripsi, prioritas, status, dan tenggat (tombol Hari ini / Besok)
- Tiga status tugas: **Pending, In Progress, Completed** (klik badge untuk mengganti, atau centang untuk menyelesaikan)
- Edit lewat dialog, hapus, dan tombol **Urungkan** setelah menghapus
- Filter (pill), pencarian, pengurutan (terbaru, tenggat, prioritas), dan bilah progres
- Penanda tugas terlambat, mode terang/gelap (diingat), dan tampilan responsif dengan menu geser di ponsel
- Data tersimpan otomatis di `localStorage`
- Aman dari XSS (masukan pengguna ditampilkan dengan `textContent`)
- Pintasan keyboard: tekan `/` untuk mencari, `Esc` menutup dialog

## Teknologi
HTML5, CSS3, JavaScript (vanilla, tanpa framework/dependensi). Ikon berupa SVG inline. Font Nunito dimuat dari Google Fonts (jika offline, otomatis memakai font sistem).

## Struktur Proyek
```
peachy-plans/
├── index.html   # struktur halaman dan dialog
├── style.css    # tema pink, mode gelap, responsif
├── script.js    # logika aplikasi
├── README.md
└── .gitignore
```

## Cara Menjalankan
1. Clone repositori: `git clone <URL-REPOSITORI>`
2. Buka `index.html` di browser (tidak perlu server atau instalasi).

## Pengujian Manual
| Skenario | Hasil |
|---|---|
| Tambah tugas cepat dan lewat dialog | Lulus |
| Judul hanya spasi | Ditolak |
| Input `<img src=x onerror=alert(1)>` | Tampil sebagai teks, tidak dieksekusi |
| Ganti status lewat badge dan centang | Lulus |
| Edit lewat dialog (simpan, Esc, judul kosong) | Sesuai harapan |
| Hapus saat filter aktif, lalu Urungkan | Tugas yang benar terhapus dan kembali |
| Cari, urutkan, dan filter lewat sidebar/pill | Sinkron |
| Muat ulang halaman | Data, nama, dan tema tetap ada |
| Data `localStorage` rusak atau format lama | Aplikasi tetap berjalan |
| Layar 390 px | Tidak ada scroll horizontal, menu geser berfungsi |

## Catatan Penggunaan AI
Riwayat prompt, evaluasi kode, kesalahan yang ditemukan, serta perbaikannya dijelaskan lengkap pada dokumen proposal.

## Pembuat
- Nama: Amanda Shinta Sitorus
- NIM: 11S24048