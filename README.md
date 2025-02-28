# IndoScript

IndoScript adalah bahasa pemrograman sederhana yang dirancang untuk memudahkan pemrograman dengan sintaks yang mirip dengan bahasa Indonesia. Bahasa ini mendukung berbagai fitur yang tersedia pada JavaScript.

## Fitur (Saat Ini)

- Deklarasi variabel
- Fungsi dan fungsi panah (arrow function)
- Pernyataan kondisi (`jika`, `dan jika`, `lainnya`)
- Loop (`selama`, `untuk`, `untukSetiap`)
- Array dan metode array (`push`, `forEach`)

## Contoh Kode

Berikut adalah contoh kode sederhana dalam IndoScript:

```indoscript
// Deklarasi variabel
atur x = 10;
atur y = 20;

// Fungsi
atur tambah = (a, b) => {
  kembalikan a + b;
};

// Menggunakan fungsi
atur hasil = tambah(x, y);

// Cetak hasil
cetak(hasil); // Output: 30

// Kondisi
jika (x > y) {
  cetak("x lebih besar dari y");
} dan jika (x < y) {
  cetak("x lebih kecil dari y");
} lainnya {
  cetak("x sama dengan y");
}

// Loop
atur i = 0;
selama (i < 5) {
  cetak(i);
  i = i + 1;
}

// Array
atur arr = [1, 2, 3];
arr.push(4);
arr.untukSetiap((item, index) => {
  cetak("Item:", item, "Index:", index);
});

```

## Kontribusi
Kontribusi sangat diterima! Silakan fork repositori ini dan buat pull request dengan perubahan Anda.

## Lisensi
Proyek ini dilisensikan di bawah lisensi MIT. Lihat file LICENSE untuk informasi lebih lanjut.

Semoga README ini membantu Anda memahami dan menggunakan IndoScript!