# JCC-Main-Bareng
Tugas Akhir Jabar Coding Camp (JCC) Node JS - Membuat WEB API Aplikasi Main Bareng\
Oleh:\
Ahmad Fajar Islami (fajarislami.0702@gmail.com)

[Link Aplikasi Klik Disini](https://web-api-main-bareng.herokuapp.com/docs/index.html)

# Overview
Aplikasi Main Bareng untuk mempertemukan pemuda-pemuda yang ingin berolahraga tim (futsal/voli/basket/minisoccer/soccer) dan booking tempat bersama. 
Definisi:\ 
#### User
Atribut tabel users: id, name, password, email, role\
Data pengguna aplikasi. Terdapat 2 role: ‘user’, ‘owner’. \
**user** : pengguna biasa yang dapat melakukan booking ke satu field. Dapat melakukan join/unjoin ke booking tertentu.\
**owner** : pemilik venue yang menyewakan lapangan (field) untuk dibooking.\
#### Venue
Atribut tabel venues: id, name, address, phone\
Data tempat sarana olahraga. Dapat berupa kompleks olahraga yang memiliki lebih dari satu lapangan (field) dan jenis olahraga. \
#### Field
Atribut tabel fields: id, name, type\
Field adalah bagian dari Venue. Setiap field akan memiliki type yaitu jenis olahraga yang dimainkan di antaranya : soccer, minisoccer, futsal, basketball, volleyball 
#### Booking
Atribut tabel bookings: id, user_id, play_date_start, play_date_end, field_id\
Booking adalah jadwal penyewaan atau jadwal main user di field/venue tertentu.\

## Aplikasi web api ini dibuat dengan
Teknologi:\
Node.js, Adonis.js, phc-bcrypt, adonis5-swagger\
Database: Mysql/ Postgre

## Link Teknologi dan Database
[Node](https://nodejs.org/en/)\
[Adonis](https://adonisjs.com/)\
[adonis5-swagger](https://www.npmjs.com/package/adonis5-swagger)\
[phc-bcrypt](https://www.npmjs.com/package/phc-bcrypt)\
[XAMPP](https://www.apachefriends.org/download.html)

