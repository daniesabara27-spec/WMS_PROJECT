/*
# Warehouse Management System — Initial Schema

## Overview
Creates all tables for the KCC Glass Indonesia warehouse management app.
This is a single-tenant app (no user authentication), so all policies allow anon + authenticated access.

## Tables

### master_data
Stores the product catalog. Each row is one barcode/product.
- id: UUID primary key
- barcode: unique product barcode string
- product_code: internal product code
- product_name: human-readable product name
- thickness: glass thickness (text, e.g. "5mm")
- keeping_no: storage reference number
- stock: current stock count

### packing
Records packing operations performed on the warehouse floor.
- id, created_at, shift, no_rak, pic, barcode, description, thickness, qty

### inbound
Records inbound deliveries (from KCC or Wanxinda).
- id, created_at, jenis_penerimaan, no_surat_jalan, penempatan_gudang, shift, no_rak, pic, barcode, description, thickness, qty

### outbound
Records outbound shipments / transfers.
- id, created_at, jenis, tujuan, container_no, no_surat_jalan, shift, pic, barcode, description, thickness, qty

### moisture_container
Records moisture measurement readings for containers.
- id, created_at, shift, container_no, point_a..e (numeric), average (numeric), form_photo_url

### inspeksi_pengiriman
Records shipping inspection checklists per barcode.
- id, created_at, shift, container_no, barcode, description, and 7 checklist boolean columns, photo_url

## Security
- RLS enabled on all tables.
- Single-tenant: anon + authenticated roles can SELECT, INSERT, UPDATE, DELETE.
*/

-- master_data
CREATE TABLE IF NOT EXISTS master_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  barcode text UNIQUE NOT NULL,
  product_code text,
  product_name text,
  thickness text,
  keeping_no text,
  stock integer DEFAULT 0
);

ALTER TABLE master_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_master_data" ON master_data;
CREATE POLICY "anon_select_master_data" ON master_data FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_master_data" ON master_data;
CREATE POLICY "anon_insert_master_data" ON master_data FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_master_data" ON master_data;
CREATE POLICY "anon_update_master_data" ON master_data FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_master_data" ON master_data;
CREATE POLICY "anon_delete_master_data" ON master_data FOR DELETE TO anon, authenticated USING (true);

-- packing
CREATE TABLE IF NOT EXISTS packing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  no_rak text,
  pic text,
  barcode text,
  description text,
  thickness text,
  qty integer DEFAULT 1
);

ALTER TABLE packing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_packing" ON packing;
CREATE POLICY "anon_select_packing" ON packing FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_packing" ON packing;
CREATE POLICY "anon_insert_packing" ON packing FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_packing" ON packing;
CREATE POLICY "anon_update_packing" ON packing FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_packing" ON packing;
CREATE POLICY "anon_delete_packing" ON packing FOR DELETE TO anon, authenticated USING (true);

-- inbound
CREATE TABLE IF NOT EXISTS inbound (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  jenis_penerimaan text,
  no_surat_jalan text,
  penempatan_gudang text,
  shift text,
  no_rak text,
  pic text,
  barcode text,
  description text,
  thickness text,
  qty integer DEFAULT 1
);

ALTER TABLE inbound ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_inbound" ON inbound;
CREATE POLICY "anon_select_inbound" ON inbound FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inbound" ON inbound;
CREATE POLICY "anon_insert_inbound" ON inbound FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inbound" ON inbound;
CREATE POLICY "anon_update_inbound" ON inbound FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inbound" ON inbound;
CREATE POLICY "anon_delete_inbound" ON inbound FOR DELETE TO anon, authenticated USING (true);

-- outbound
CREATE TABLE IF NOT EXISTS outbound (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  jenis text,
  tujuan text,
  container_no text,
  no_surat_jalan text,
  shift text,
  pic text,
  barcode text,
  description text,
  thickness text,
  qty integer DEFAULT 1
);

ALTER TABLE outbound ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_outbound" ON outbound;
CREATE POLICY "anon_select_outbound" ON outbound FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_outbound" ON outbound;
CREATE POLICY "anon_insert_outbound" ON outbound FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_outbound" ON outbound;
CREATE POLICY "anon_update_outbound" ON outbound FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_outbound" ON outbound;
CREATE POLICY "anon_delete_outbound" ON outbound FOR DELETE TO anon, authenticated USING (true);

-- moisture_container
CREATE TABLE IF NOT EXISTS moisture_container (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  container_no text NOT NULL,
  point_a numeric,
  point_b numeric,
  point_c numeric,
  point_d numeric,
  point_e numeric,
  average numeric,
  form_photo_url text
);

ALTER TABLE moisture_container ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_moisture_container" ON moisture_container;
CREATE POLICY "anon_select_moisture_container" ON moisture_container FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_moisture_container" ON moisture_container;
CREATE POLICY "anon_insert_moisture_container" ON moisture_container FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_moisture_container" ON moisture_container;
CREATE POLICY "anon_update_moisture_container" ON moisture_container FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_moisture_container" ON moisture_container;
CREATE POLICY "anon_delete_moisture_container" ON moisture_container FOR DELETE TO anon, authenticated USING (true);

-- inspeksi_pengiriman
CREATE TABLE IF NOT EXISTS inspeksi_pengiriman (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  container_no text NOT NULL,
  barcode text,
  description text,
  chk_packing boolean DEFAULT false,
  chk_barcode boolean DEFAULT false,
  chk_steelband boolean DEFAULT false,
  chk_vinyl boolean DEFAULT false,
  chk_moisture boolean DEFAULT false,
  chk_silica boolean DEFAULT false,
  chk_stopper boolean DEFAULT false,
  photo_url text
);

ALTER TABLE inspeksi_pengiriman ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_inspeksi_pengiriman" ON inspeksi_pengiriman;
CREATE POLICY "anon_select_inspeksi_pengiriman" ON inspeksi_pengiriman FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inspeksi_pengiriman" ON inspeksi_pengiriman;
CREATE POLICY "anon_insert_inspeksi_pengiriman" ON inspeksi_pengiriman FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inspeksi_pengiriman" ON inspeksi_pengiriman;
CREATE POLICY "anon_update_inspeksi_pengiriman" ON inspeksi_pengiriman FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inspeksi_pengiriman" ON inspeksi_pengiriman;
CREATE POLICY "anon_delete_inspeksi_pengiriman" ON inspeksi_pengiriman FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_master_data_barcode ON master_data(barcode);
CREATE INDEX IF NOT EXISTS idx_packing_created_at ON packing(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbound_created_at ON inbound(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_created_at ON outbound(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moisture_created_at ON moisture_container(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspeksi_created_at ON inspeksi_pengiriman(created_at DESC);
