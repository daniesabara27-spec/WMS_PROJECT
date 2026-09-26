import { useState } from 'react';
import { Download, Loader2, FileSpreadsheet, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { FormField, Alert } from '@/components/FormField';

type Category = 'packing' | 'inbound' | 'outbound' | 'moisture_container' | 'inspeksi_pengiriman' | 'stock_opname' | 'cycle_time' | 'sor_incident' | 'all';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'Semua Kategori' },
  { value: 'packing', label: 'Packing' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'moisture_container', label: 'Moisture Container' },
  { value: 'inspeksi_pengiriman', label: 'Inspeksi Pengiriman' },
  { value: 'stock_opname', label: 'Stock Opname' },
  { value: 'cycle_time', label: 'Cycle Time' },
  { value: 'sor_incident', label: 'SOR Incident' },
];

function today() {
  return new Date().toISOString().split('T')[0];
}

function lastMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
}

function formatSheetName(table: string): string {
  const map: Record<string, string> = {
    packing: 'Packing',
    inbound: 'Inbound',
    outbound: 'Outbound',
    moisture_container: 'Moisture Container',
    inspeksi_pengiriman: 'Inspeksi',
    stock_opname: 'Stock Opname',
    cycle_time: 'Cycle Time',
    sor_incident: 'SOR Incident',
  };
  return map[table] ?? table;
}

async function fetchTable(table: string, from: string, to: string) {
  const { data, error } = await supabase
    .from(table as any)
    .select('*')
    .gte('created_at', `${from}T00:00:00`)
    .lte('created_at', `${to}T23:59:59`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

export default function TarikData() {
  const [dateFrom, setDateFrom] = useState(lastMonth());
  const [dateTo, setDateTo] = useState(today());
  const [category, setCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [preview, setPreview] = useState<{ table: string; count: number }[]>([]);

  const TABLES: string[] = category === 'all'
    ? ['packing', 'inbound', 'outbound', 'moisture_container', 'inspeksi_pengiriman', 'stock_opname', 'cycle_time', 'sor_incident']
    : [category];

  async function handlePreview() {
    setLoading(true);
    setAlert(null);
    try {
      const counts = await Promise.all(
        TABLES.map(async (t) => {
          const { count, error } = await supabase
            .from(t as any)
            .select('*', { count: 'exact', head: true })
            .gte('created_at', `${dateFrom}T00:00:00`)
            .lte('created_at', `${dateTo}T23:59:59`);
          if (error) throw error;
          return { table: t, count: count ?? 0 };
        })
      );
      setPreview(counts);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setLoading(true);
    setAlert(null);
    try {
      const wb = XLSX.utils.book_new();

      for (const table of TABLES) {
        const rows = await fetchTable(table, dateFrom, dateTo);
        if (rows.length === 0) continue;

        // Format dates for readability
        const formatted = rows.map((r: any) => ({
          ...r,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('id-ID')
            : '',
        }));

        const ws = XLSX.utils.json_to_sheet(formatted);

        // Auto column widths
        const cols = Object.keys(formatted[0] || {}).map((k) => ({
          wch: Math.max(k.length, ...formatted.map((r: any) => String(r[k] ?? '').length)) + 2,
        }));
        ws['!cols'] = cols;

        XLSX.utils.book_append_sheet(wb, ws, formatSheetName(table));
      }

      const filename = `warehouse_export_${dateFrom}_to_${dateTo}.xlsx`;
      XLSX.writeFile(wb, filename);
      setAlert({ type: 'success', msg: `File "${filename}" berhasil didownload!` });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  const totalPreview = preview.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <div className="form-section">
        <div className="pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-blue-600" />
            Export Data ke Excel
          </h3>
          <p className="text-slate-500 text-xs mt-1">Pilih rentang tanggal dan kategori, lalu download sebagai file .xlsx</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tanggal Dari">
            <input
              type="date"
              className="glass-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo}
            />
          </FormField>
          <FormField label="Tanggal Sampai">
            <input
              type="date"
              className="glass-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
            />
          </FormField>
        </div>

        <FormField label="Kategori Data">
          <select className="glass-select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </FormField>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="glass-card-solid p-4 space-y-2">
            <p className="text-slate-700 font-semibold text-sm">Preview Data</p>
            <div className="space-y-1.5">
              {preview.map((p) => (
                <div key={p.table} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{formatSheetName(p.table)}</span>
                  <span className={`badge ${p.count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {p.count} baris
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-bold border-t border-white/40 pt-2 mt-2">
                <span className="text-slate-700">Total</span>
                <span className="badge bg-emerald-100 text-emerald-700">{totalPreview} baris</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={loading}
            className="glass-btn-secondary flex items-center gap-2 flex-1 justify-center py-3"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Cek Data
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="glass-btn-primary flex items-center gap-2 flex-1 justify-center py-3"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download Excel
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-4">
        <p className="text-white/70 text-sm font-medium mb-2">Catatan:</p>
        <ul className="text-white/50 text-xs space-y-1 list-disc list-inside">
          <li>File Excel akan berisi sheet terpisah per kategori.</li>
          <li>Tanggal dikonversi ke format lokal (id-ID).</li>
          <li>Jika suatu kategori tidak memiliki data, sheet tidak akan dibuat.</li>
          <li>Klik "Cek Data" untuk melihat jumlah baris sebelum download.</li>
        </ul>
      </div>
    </div>
  );
}
