# 🏦 Bank Sentosa — Credit Analyst & SPV Loan Approval Dashboard (`dashboard_CA`)

Dashboard internal Loan Origination System (LOS) untuk **Credit Analyst (CA)** dan **Supervisor (SPV)** Bank Sentosa. Aplikasi ini menangani seluruh alur persetujuan kredit mulai dari verifikasi dokumen/analisis risiko nasabah (Layer 1), persetujuan supervisor (Layer 2), penawaran digital ke nasabah, hingga pencairan pinjaman (*disbursement*) ke Core Banking IBSCore (USSI CBS).

---

## 📑 Daftar Isi
- [1. Prasyarat Sistem](#1-prasyarat-sistem)
- [2. Panduan Instalasi & Setup PostgreSQL Lokal](#2-panduan-instalasi--setup-postgresql-lokal)
  - [Opsi A: Menggunakan Docker (Direkomendasikan & Paling Praktis)](#opsi-a-menggunakan-docker-direkomendasikan--paling-praktis)
  - [Opsi B: Menggunakan Homebrew di macOS](#opsi-b-menggunakan-homebrew-di-macos)
  - [Opsi C: Menggunakan GUI (Postgres.app / pgAdmin / DBeaver)](#opsi-c-menggunakan-gui-postgresapp--pgadmin--dbeaver)
- [3. Konfigurasi Environment Variable (`.env`)](#3-konfigurasi-environment-variable-env)
- [4. Inisialisasi Database & Skema Tabel](#4-inisialisasi-database--skema-tabel)
  - [Cara 1: Otomatis via Script TSX (Direkomendasikan)](#cara-1-otomatis-via-script-tsx-direkomendasikan)
  - [Cara 2: Eksekusi Manual via Raw SQL Query](#cara-2-eksekusi-manual-via-raw-sql-query)
- [5. Seeding Data Awal (Akun Pengguna & Demo Loans)](#5-seeding-data-awal-akun-pengguna--demo-loans)
  - [Daftar Akun Login Default](#daftar-akun-login-default)
  - [Daftar Kasus Pinjaman Demo](#daftar-kasus-pinjaman-demo)
- [6. Sinkronisasi Data Real dari Server Dev (Opsional)](#6-sinkronisasi-data-real-dari-server-dev-opsional)
- [7. Menjalankan Server Development](#7-menjalankan-server-development)
- [8. Standar & Aturan Pengembangan (Developer Rules)](#8-standar--aturan-pengembangan-developer-rules)

---

## 1. Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
* **Node.js**: Versi `>= 20.x`
* **npm**: Versi `>= 10.x`
* **PostgreSQL**: Versi `>= 14.x` (Disarankan PostgreSQL 16)
* **Docker Desktop** *(Opsional, sangat disarankan untuk kemudahan setup database)*

---

## 2. Panduan Instalasi & Setup PostgreSQL Lokal

Pilih salah satu metode instalasi database di bawah ini:

### Opsi A: Menggunakan Docker (Direkomendasikan & Paling Praktis)

Metode ini paling bersih karena tidak mengotori konfigurasi sistem Mac/OS Anda.

1. **Pastikan Docker Desktop aktif di komputer Anda.**
2. **Jalankan container PostgreSQL baru dengan perintah berikut:**
   ```bash
   docker run --name postgres-sentosa \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=Alastor159jr!! \
     -e POSTGRES_DB=ca-dashboard \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```
3. **Cek apakah container sudah berjalan:**
   ```bash
   docker ps
   ```
   *Jika container statusnya `Up`, PostgreSQL siap digunakan di `localhost:5432` dengan database `ca-dashboard`.*

> **Tips Docker:**
> - Menghentikan database: `docker stop postgres-sentosa`
> - Menyalakan kembali database: `docker start postgres-sentosa`
> - Masuk ke CLI psql container: `docker exec -it postgres-sentosa psql -U postgres -d ca-dashboard`

---

### Opsi B: Menggunakan Homebrew di macOS

Jika Anda lebih memilih PostgreSQL terinstall langsung di macOS:

1. **Install PostgreSQL via Homebrew:**
   ```bash
   brew install postgresql@16
   ```

2. **Jalankan service PostgreSQL:**
   ```bash
   brew services start postgresql@16
   ```

3. **Atur password user `postgres` dan buat database `ca-dashboard`:**
   ```bash
   # Masuk ke terminal psql default
   psql postgres
   ```
   Lalu jalankan query SQL berikut di dalam prompt `psql`:
   ```sql
   -- Buat user postgres jika belum ada, atau atur passwordnya
   ALTER USER postgres WITH PASSWORD 'Alastor159jr!!';

   -- Buat database khusus dashboard CA
   CREATE DATABASE "ca-dashboard" OWNER postgres;

   -- Berikan hak akses
   GRANT ALL PRIVILEGES ON DATABASE "ca-dashboard" TO postgres;

   -- Keluar dari psql
   \q
   ```

---

### Opsi C: Menggunakan GUI (Postgres.app / pgAdmin / DBeaver)

1. Unduh dan pasang [Postgres.app](https://postgresapp.com/) atau jalankan server PostgreSQL lokal Anda.
2. Buka software database client pilihan Anda (misal: **DBeaver**, **TablePlus**, atau **pgAdmin**).
3. Buat koneksi ke server lokal:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: *(sesuai konfigurasi Anda, misal `Alastor159jr!!`)*
4. Buat database baru bernama:
   - **Database Name**: `ca-dashboard`
   - **Encoding**: `UTF8`

---

## 3. Konfigurasi Environment Variable (`.env`)

Proyek ini menyediakan template konfigurasi untuk lingkungan Development (`.env.dev`) dan Production (`.env.prod`).

1. **Aktifkan environment Development:**
   ```bash
   npm run switch:dev
   ```
   *Perintah ini otomatis menyalin `.env.dev` menjadi berkas aktif `.env`.*

2. **Periksa berkas `.env` Anda:**
   Pastikan variabel `DATABASE_URL` sesuai dengan kredensial PostgreSQL lokal Anda:
   ```env
   DATABASE_URL="postgresql://postgres:Alastor159jr%21%21@localhost:5432/ca-dashboard?schema=public"
   PORT=3001
   APP_URL="http://localhost:3001"
   ```
   > ⚠️ **Catatan URL Encoding:**
   > Karakter tanda seru (`!`) pada password `Alastor159jr!!` harus di-encode menjadi `%21%21` agar connection string URI tidak mengalami parse error.

---

## 4. Inisialisasi Database & Skema Tabel

Proyek ini menggunakan **Driver Adapter Postgres (`@prisma/adapter-pg`)** dengan koneksi `pg.Pool`.

### Langkah A: Generate Prisma Client
Setiap kali melakukan clone pertama kali atau mengubah skema:
```bash
npx prisma generate
```

### Langkah B: Buat Tabel & Tipe ENUM

#### Cara 1: Otomatis via Script TSX (Direkomendasikan)
Jalankan script inisialisasi yang sudah disediakan:
```bash
npx tsx src/scripts/init-tables.ts
```
Script ini akan otomatis membuat semua enum (`LoanStatus`, `ReviewLayer`), tabel RBAC (`admin_roles`, `admin_users`, `admin_invitations`, `password_resets`), serta tabel utama (`loan_applications`, `loan_review_logs`).

---

#### Cara 2: Eksekusi Manual via Raw SQL Query
Jika Anda ingin mengeksekusi DDL secara manual melalui DBeaver, TablePlus, atau `psql`, jalankan query SQL berikut:

```sql
-- 1. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE "LoanStatus" AS ENUM (
    'PAYMENT_FAILED',
    'UNDER_REVIEW_CA',
    'WAITING_SPV_APPROVAL',
    'OFFERING_CUSTOMER',
    'READY_FOR_DISBURSEMENT',
    'DISBURSED',
    'REJECTED_CA',
    'REJECTED_SPV'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewLayer" AS ENUM (
    'LAYER_1_CA',
    'LAYER_2_SPV',
    'CUSTOMER_OFFERING',
    'DISBURSEMENT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. RBAC & AUTHENTICATION TABLES
CREATE TABLE IF NOT EXISTS "admin_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(50) UNIQUE NOT NULL,
  "display_name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "permissions" TEXT[] NOT NULL DEFAULT '{}',
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(150) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255),
  "role_id" UUID REFERENCES "admin_roles"("id") ON DELETE SET NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "admin_invitations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(150) NOT NULL,
  "role_id" UUID NOT NULL REFERENCES "admin_roles"("id") ON DELETE CASCADE,
  "token" VARCHAR(255) UNIQUE NOT NULL,
  "invited_by" UUID REFERENCES "admin_users"("id") ON DELETE SET NULL,
  "expires_at" TIMESTAMP(6) NOT NULL,
  "accepted_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "password_resets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(150) NOT NULL,
  "token" VARCHAR(255) UNIQUE NOT NULL,
  "expires_at" TIMESTAMP(6) NOT NULL,
  "used_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CORE LOAN TABLES
CREATE TABLE IF NOT EXISTS "loan_applications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_no" VARCHAR(32) UNIQUE NOT NULL,
  "applicant_name" VARCHAR(100) NOT NULL,
  "id_no" VARCHAR(30) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "account_no" VARCHAR(50) NOT NULL,
  "bank_name" VARCHAR(50) NOT NULL DEFAULT 'Bank Sentosa',
  "loan_type" VARCHAR(50) NOT NULL DEFAULT 'KREDIT_MULTIGUNA',
  "requested_amount" NUMERIC(15,2) NOT NULL,
  "approved_amount" NUMERIC(15,2),
  "tenor_month" INTEGER NOT NULL DEFAULT 1,
  "approved_tenor" INTEGER,
  "interest_rate" NUMERIC(5,2) NOT NULL DEFAULT 3.00,
  "monthly_income" NUMERIC(15,2) NOT NULL,
  "dsr_ratio" NUMERIC(5,2) NOT NULL,
  "credit_score" INTEGER NOT NULL,
  "slik_status" VARCHAR(20) NOT NULL DEFAULT 'LANCAR',
  "status" "LoanStatus" NOT NULL DEFAULT 'UNDER_REVIEW_CA',
  "current_layer" "ReviewLayer" NOT NULL DEFAULT 'LAYER_1_CA',
  "ca_notes" TEXT,
  "spv_notes" TEXT,
  "rejection_reason" TEXT,
  
  -- Profil Nasabah Tambahan
  "company_name" VARCHAR(150),
  "job_type" VARCHAR(50),
  "street_address" TEXT,
  "city" VARCHAR(50),
  "province" VARCHAR(50),
  
  -- Kontak Darurat
  "emergency_name" VARCHAR(100),
  "emergency_relation" VARCHAR(50),
  "emergency_phone" VARCHAR(20),
  
  -- Perangkat & Verifikasi Biometrik
  "device_model" VARCHAR(50),
  "face_score" VARCHAR(10),
  
  -- Catatan Verifikasi CA
  "tele_verify" TEXT,
  "call_relat" TEXT,
  
  -- Integrasi IBSCore Core Banking
  "cif" VARCHAR(50),
  "mother_name" VARCHAR(100),
  "birth_place" VARCHAR(100),
  "birth_date" VARCHAR(20),
  "loan_account_no" VARCHAR(50),
  "spk_no" VARCHAR(50),
  "branch_code" VARCHAR(10) DEFAULT '212',
  "product_code" VARCHAR(10) DEFAULT '102',
  "credit_type" VARCHAR(10) DEFAULT '700',
  "disbursement_receipt_no" VARCHAR(100),
  "disbursement_tx_type" VARCHAR(10) DEFAULT 'C2',

  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "loan_review_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "loan_id" UUID NOT NULL REFERENCES "loan_applications"("id") ON DELETE CASCADE,
  "operator_name" VARCHAR(100) NOT NULL,
  "operator_role" VARCHAR(50) NOT NULL,
  "action" VARCHAR(50) NOT NULL,
  "amount_before" NUMERIC(15,2),
  "amount_after" NUMERIC(15,2),
  "notes" TEXT,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Seeding Data Awal (Akun Pengguna & Demo Loans)

Setelah tabel terbentuk, jalankan script seeder untuk mengisi data akun pengguna (Admin/CA/SPV) serta pengajuan pinjaman demo:

```bash
npx tsx src/scripts/seed.ts
```

### Daftar Akun Login Default
Semua akun default menggunakan password: `SentosaAdmin@2025`

| Role | Nama Lengkap | Email Login | Hak Akses Utama |
|---|---|---|---|
| **Super Admin** | Jimmy Dolly | `jimmy.dolly@banksentosa.co.id` | Akses penuh, kelola hak akses/matriks role, invite user |
| **Supervisor (SPV)** | Dewi Lestari | `dewi.lestari@banksentosa.co.id` | Approval kredit Layer 2, pencairan dana (*disburse*), invite user |
| **Credit Analyst (CA)** | Budi Santoso | `budi.santoso@banksentosa.co.id` | Analisis kredit Layer 1, verifikasi telepon, rekomendasi plafon |

---

### Daftar Kasus Pinjaman Demo
Seeder akan membuat 6 pengajuan pinjaman simulasi untuk mempermudah pengetesan setiap alur:

1. **Arief Wijaya Putra** (`UNDER_REVIEW_CA`): Pengajuan baru Rp 3.000.000 — siap di-review oleh Credit Analyst.
2. **Hendra Wijaya** (`WAITING_SPV_APPROVAL`): Rekomendasi CA sudah selesai — siap di-review & disetujui Supervisor.
3. **Siti Rahmawati** (`OFFERING_CUSTOMER`): Persetujuan kredit selesai — menunggu konfirmasi penerimaan dari nasabah.
4. **Dimas Prasetyo** (`READY_FOR_DISBURSEMENT`): Nasabah telah tanda tangan digital — siap dieksekusi pencairan dana ke IBSCore.
5. **Rian Gunawan** (`DISBURSED`): Telah berhasil dicairkan ke rekening Bank Sentosa (No. Rekening Pinjaman: `2121020000404`).
6. **Maya Indah Lestari** (`REJECTED_CA`): Contoh pengajuan ditolak karena DSR tinggi (62.2%) & riwayat SLIK tidak lancar.

---

## 6. Sinkronisasi Data Real dari Server Dev (Opsional)

Jika Anda ingin menarik data pengajuan asli dari database MySQL server development (`10.101.32.134`):

```bash
npm run sync:dev
# atau
npx tsx src/scripts/sync-dev-data.ts
```

> ⚠️ **Catatan Penting Jaringan & SSH:**
> - Script ini menggunakan SSH Tunnel ke IP `10.101.32.134`.
> - **VPN Kantor Bank Sentosa wajib terhubung** agar port SSH dapat dijangkau.
> - Jika muncul pesan error `SSH AUTH ERROR: All configured authentication methods failed`, pastikan kredensial `SSH_USER` dan `SSH_PASSWORD` di `.env` sesuai dengan akses server Anda.

---

## 7. Menjalankan Server Development

Setelah database PostgreSQL siap dan di-seed:

```bash
npm run dev
```

Buka browser Anda di:
👉 **[http://localhost:3001](http://localhost:3001)**

Silakan login menggunakan email dan password akun demo (misal: `jimmy.dolly@banksentosa.co.id` / `SentosaAdmin@2025`).

---

## 8. Standar & Aturan Pengembangan (Developer Rules)

Wajib dipatuhi oleh seluruh developer saat mengembangkan sistem ini:

1. **Eksekusi Script:**
   Selalu gunakan **`npx tsx`**, dilarang menggunakan `ts-node`.
   ```bash
   # BENAR:
   npx tsx src/scripts/<nama-script>.ts
   ```

2. **Perubahan Skema Database (`schema.prisma`):**
   - **Dilarang keras menjalankan `npx prisma db push`** secara langsung di CLI.
   - Setiap ada perubahan model atau kolom, wajib menyediakan Query SQL DDL eksplisit (`ALTER TABLE ...` / `CREATE TABLE ...`) agar tercatat rapi dan aman untuk production.

3. **Prisma Driver Adapter:**
   Proyek menggunakan driver adapter Postgres (`@prisma/adapter-pg`). Jangan membuat instance `new PrismaClient()` standar tanpa adapter. Selalu import client dari:
   ```typescript
   import { prisma } from '@/lib/prisma';
   ```

4. **Dynamic Import pada Script Standalone (`src/scripts`):**
   Jika membuat script di `src/scripts` yang meng-override `process.env.DATABASE_URL`, **wajib menggunakan dynamic import** setelah mendefinisikan variabel:
   ```typescript
   // Di dalam fungsi main():
   process.env.DATABASE_URL = '...';
   const { prisma } = await import('../lib/prisma');
   ```
   *(Hal ini mencegah masalah hoisting ES Module yang menyebabkan error `DATABASE_URL is not set`).*

5. **Build & Test Automation:**
   Jangan menjalankan `npm run build` atau Playwright test otomatis kecuali diminta secara eksplisit. Gunakan `npx tsc --noEmit` untuk validasi tipe data TypeScript.
