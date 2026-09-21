import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Alastor159jr%21%21@localhost:5432/ca-dashboard?schema=public';

const pool = new Pool({ connectionString });

async function initTables() {
  console.log('\n============================================================');
  console.log('🏗️  [INIT TABLES] Inisialisasi Skema Database ca-dashboard...');
  console.log('============================================================\n');

  try {
    await pool.query(`
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

      -- Tambahkan nilai PAYMENT_FAILED jika enum sudah pernah dibuat sebelumnya
      DO $$ BEGIN
        ALTER TYPE "LoanStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_FAILED' BEFORE 'UNDER_REVIEW_CA';
      EXCEPTION
        WHEN others THEN null;
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

      -- 2. RBAC & AUTH TABLES
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

      -- 3. LOAN CORE TABLES
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
        
        -- Extended Debtor Profile
        "company_name" VARCHAR(150),
        "job_type" VARCHAR(50),
        "street_address" TEXT,
        "city" VARCHAR(50),
        "province" VARCHAR(50),
        
        -- Emergency Contact
        "emergency_name" VARCHAR(100),
        "emergency_relation" VARCHAR(50),
        "emergency_phone" VARCHAR(20),
        
        -- Device & Biometric
        "device_model" VARCHAR(50),
        "face_score" VARCHAR(10),
        
        -- CA Verification Notes
        "tele_verify" TEXT,
        "call_relat" TEXT,
        
        -- IBSCore Core Banking
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

      -- Migration aman untuk kolom-kolom baru jika tabel loan_applications sudah ada
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "company_name" VARCHAR(150);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "job_type" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "street_address" TEXT;
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "city" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "province" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "emergency_name" VARCHAR(100);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "emergency_relation" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "emergency_phone" VARCHAR(20);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "device_model" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "face_score" VARCHAR(10);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "tele_verify" TEXT;
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "call_relat" TEXT;
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "cif" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "mother_name" VARCHAR(100);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "birth_place" VARCHAR(100);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "birth_date" VARCHAR(20);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "loan_account_no" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "spk_no" VARCHAR(50);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "branch_code" VARCHAR(10) DEFAULT '212';
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "product_code" VARCHAR(10) DEFAULT '102';
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "credit_type" VARCHAR(10) DEFAULT '700';
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "disbursement_receipt_no" VARCHAR(100);
      ALTER TABLE "loan_applications" ADD COLUMN IF NOT EXISTS "disbursement_tx_type" VARCHAR(10) DEFAULT 'C2';

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
    `);

    console.log('✅ Semua tabel dan ENUM berhasil diinisialisasi:');
    console.log('   - ENUM: "LoanStatus", "ReviewLayer"');
    console.log('   - RBAC: "admin_roles", "admin_users", "admin_invitations", "password_resets"');
    console.log('   - Core: "loan_applications", "loan_review_logs"');
  } catch (err) {
    console.error('❌ Error saat inisialisasi tabel:', err);
  } finally {
    await pool.end();
  }
}

initTables();
