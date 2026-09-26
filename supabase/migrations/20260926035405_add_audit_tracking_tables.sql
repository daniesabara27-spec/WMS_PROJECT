/*
# Add Stock Opname, Cycle Time, and SOR Incident tables

## Overview
Three new operational tables for the KCC Glass warehouse system.
Single-tenant app (no auth), so all policies allow anon + authenticated access.

## New Tables

### stock_opname
Records stock opname / reconciliation events.
- id, created_at, shift, pic, barcode, description, thickness
- qty_system (integer, stock from master data)
- qty_physical (integer, actual counted stock)
- discrepancy (integer, computed: qty_physical - qty_system)
- status (text: 'Match' or 'Miss')

### cycle_time
Tracks container loading process stage durations.
- id, created_at, shift, container_no, process_stage
- process_stage values: Arrival, Prep, Stuffing, Stopper, QC
- start_time, end_time (timestamptz)
- total_duration_minutes (numeric, computed)
- pic

### sor_incident
Statement of Reason / incident reports (bilingual).
- id, created_at, shift
- issue_category: Salah Kirim Thickness, Temuan Hama/Kecoa, Lainnya
- description_id (text, Indonesian description)
- description_en (text, English description)
- corrective_action (text)
- pic

## Security
- RLS enabled on all tables.
- Single-tenant: anon + authenticated CRUD.
*/

-- stock_opname
CREATE TABLE IF NOT EXISTS stock_opname (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  pic text,
  barcode text,
  description text,
  thickness text,
  qty_system integer DEFAULT 0,
  qty_physical integer DEFAULT 0,
  discrepancy integer DEFAULT 0,
  status text DEFAULT 'Match'
);

ALTER TABLE stock_opname ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stock_opname" ON stock_opname;
CREATE POLICY "anon_select_stock_opname" ON stock_opname FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stock_opname" ON stock_opname;
CREATE POLICY "anon_insert_stock_opname" ON stock_opname FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stock_opname" ON stock_opname;
CREATE POLICY "anon_update_stock_opname" ON stock_opname FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stock_opname" ON stock_opname;
CREATE POLICY "anon_delete_stock_opname" ON stock_opname FOR DELETE TO anon, authenticated USING (true);

-- cycle_time
CREATE TABLE IF NOT EXISTS cycle_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  container_no text NOT NULL,
  process_stage text,
  start_time timestamptz,
  end_time timestamptz,
  total_duration_minutes numeric,
  pic text
);

ALTER TABLE cycle_time ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cycle_time" ON cycle_time;
CREATE POLICY "anon_select_cycle_time" ON cycle_time FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cycle_time" ON cycle_time;
CREATE POLICY "anon_insert_cycle_time" ON cycle_time FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cycle_time" ON cycle_time;
CREATE POLICY "anon_update_cycle_time" ON cycle_time FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cycle_time" ON cycle_time;
CREATE POLICY "anon_delete_cycle_time" ON cycle_time FOR DELETE TO anon, authenticated USING (true);

-- sor_incident
CREATE TABLE IF NOT EXISTS sor_incident (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  shift text,
  issue_category text,
  description_id text,
  description_en text,
  corrective_action text,
  pic text
);

ALTER TABLE sor_incident ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sor_incident" ON sor_incident;
CREATE POLICY "anon_select_sor_incident" ON sor_incident FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sor_incident" ON sor_incident;
CREATE POLICY "anon_insert_sor_incident" ON sor_incident FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sor_incident" ON sor_incident;
CREATE POLICY "anon_update_sor_incident" ON sor_incident FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sor_incident" ON sor_incident;
CREATE POLICY "anon_delete_sor_incident" ON sor_incident FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stock_opname_created_at ON stock_opname(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_time_created_at ON cycle_time(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sor_incident_created_at ON sor_incident(created_at DESC);
