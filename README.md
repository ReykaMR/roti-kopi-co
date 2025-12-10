# Roti Kopi Co

![React](https://img.shields.io/badge/React-19.1-blue.svg)
![Express](https://img.shields.io/badge/Express-5.1-black.svg)
![MySQL](https://img.shields.io/badge/MySQL-15.1-4479a1.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-9403fc.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF.svg)

Platform F&B (Food & Beverage) yang dibangun menggunakan React dan Bootstrap 5 untuk frontend, Express untuk backend, serta MySQL sebagai database. Sistem ini menyediakan pengalaman belanja online dengan fitur keranjang belanja, pembayaran melalui QR Code, dashboard admin untuk manajemen produk, serta modul kasir untuk pengelolaan transaksi.

---

## 📸 Tampilan Aplikasi

<table align="center">
  <tr>
    <td><img src="screenshot-aplikasi/foto1.png" alt="Screenshot 1" width="100%" height="250"></td>
    <td><img src="screenshot-aplikasi/foto2.png" alt="Screenshot 2" width="100%" height="250"></td>
    <td><img src="screenshot-aplikasi/foto3.png" alt="Screenshot 3" width="100%" height="250"></td>
  </tr>
</table>

---

## ✨ Fitur

- **Responsive design untuk semua device**
- **Sistem authentication & authorization**
- **Integration payment QR Code**
- **Admin dashboard untuk manajemen produk**
- **Kasir dashboard untuk manajemen pembayaran**
- **Real-time inventory management**

---

## 🛠️ Teknologi yang Digunakan

- **React** - Library UI
- **Express** - Framework aplikasi web node.js
- **MySQL** - Relational Database Management System
- **Bootstrap** - Framework CSS
- **Vite** - Alat build dan server development

---

## 📋 Prasyarat

Sebelum memulai, pastikan telah menginstal:

- [Visual Studio Code](https://code.visualstudio.com/download)
- [XAMPP](https://sourceforge.net/projects/xampp/files/) (v7.4.33)
- [Node.js](https://nodejs.org/) (v20.19.6 LTS atau yang lebih baru)

---

## ⚡ Memulai dengan Cepat

1. **Clone repositori**

   ```bash
   git clone https://github.com/ReykaMR/roti-kopi-co.git
   cd roti-kopi-co
   ```

2. **Setup Database**
   
   - **Langkah 1:** Buka phpmyadmin
   - **Langkah 2:** Buat database dengan nama roti_kopi_co
   - **Langkah 3:** Import file roti_kopi_co (support semua versi mysql).sql

3. **Instal dependensi + Menjalankan server development**

   **Langkah 1:** Buka terminal untuk masuk ke dalam folder backend di visual studio code dengan menekan tombol (ctrl + `), lalu ketik:
   ```bash
   cd ./backend/  // Masuk ke folder backend
   npm install    // Instal dependensi
   npm run dev    // Jalankan server
   ```

   **Langkah 2:** Tambah terminal baru untuk masuk ke dalam folder frontend di visual studio code dengan menekan tombol (ctrl + shift + `), lalu ketik:
   ```bash
   cd ./frontend/  // Masuk ke folder frontend
   npm install     // Instal dependensi
   npm run dev     // Jalankan server
   ```

4. **Buka browser**

   Buka http://localhost:5173
