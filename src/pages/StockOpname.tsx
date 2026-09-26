import { useState, useEffect } from 'react';
import { Check, Loader2, RefreshCw, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { FormField, BarcodeField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];

const EMPTY = {
  shift: '', pic: '', barcode: '', description: '', thickness: '',
  qty_system: 0, qty_physical: 0, discrepancy: 0, status: 'Match',
};

type FormState = typeof EMPTY;

export default function StockOpname() {
  const { lookupBarcode } = useWarehouseStore();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [autoFilled, setAutoFilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    setLoadingRecent(true);
    const { data } = await supabase
      .from('stock_opname')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecent(data ?? []);
    setLoadingRecent(false);
  }

  useEffect(() => {
    const disc = (form.qty_physical ?? 0) - (form.qty_system ?? 0);
    setForm((p) => ({ ...p, discrepancy: disc, status: disc === 0 ? 'Match' : 'Miss' }));
  }, [form.qty_physical, form.qty_system]);

  function handleBarcodeChange(val: string) {
    setForm((p) => ({ ...p, barcode: val }));
    setAutoFilled(false);
  }

  function handleBarcodeLookup(barcode: string) {
    if (!barcode.trim()) return;
    const match = lookupBarcode(barcode);
    if (match) {
      setForm((p) => ({
        ...p,
        description: match.description,
        thickness: match.thickness,
        qty_system: 0,
      }));
      // Also look up current stock from master_data
      supabase
        .from('master_data')
        .select('stock')
        .ilike('barcode', barcode)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setForm((p) => ({ ...p, qty_system: (data as any).stock ?? 0 }));
          }
        });
      setAutoFilled(true);
    }
  }

  const f = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: key === 'qty_system' || key === 'qty_physical' ? Number(e.target.value) : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.barcode.trim()) { setAlert({ type: 'error', msg: 'Barcode wajib diisi.' }); return; }
    setSaving(true);
    const { error } = await supabase.from('stock_opname').insert(form);
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Data stock opname berhasil disimpan!' });
    setForm(EMPTY);
    setAutoFilled(false);
    loadRecent();
  }

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
            <ClipboardList size={18} className="text-blue-600" />
            Stock Opname & Rekonsiliasi
          </h3>
          <button type="button" onClick={() => { setForm(EMPTY); setAutoFilled(false); }} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs">
            <RefreshCw size={13} /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Shift" required>
            <select className="glass-select" value={form.shift} onChange={f('shift')} required>
              <option value="">-- Pilih Shift --</option>
              {SHIFTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="PIC" required>
            <input className="glass-input" value={form.pic} onChange={f('pic')} placeholder="Nama petugas" required />
          </FormField>
        </div>

        <BarcodeField value={form.barcode} onChange={handleBarcodeChange} onLookup={handleBarcodeLookup} autoFilled={autoFilled} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Deskripsi Produk">
            <input className="glass-input" value={form.description} onChange={f('description')} placeholder="Auto-filled dari barcode" readOnly />
          </FormField>
          <FormField label="Thickness">
            <input className="glass-input" value={form.thickness} onChange={f('thickness')} placeholder="Auto-filled dari barcode" readOnly />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Qty System" hint="Dari Master Data">
            <input className="glass-input bg-blue-50/60 font-semibold" type="number" min={0} value={form.qty_system} readOnly />
          </FormField>
          <FormField label="Qty Physical" required hint="Hasil hitung fisik">
            <input className="glass-input" type="number" min={0} value={form.qty_physical} onChange={f('qty_physical')} required />
          </FormField>
          <FormField label="Selisih (Discrepancy)">
            <input
              className={`glass-input font-bold ${form.discrepancy === 0 ? 'bg-emerald-50/70 text-emerald-700' : 'bg-red-50/70 text-red-700'}`}
              value={form.discrepancy > 0 ? `+${form.discrepancy}` : form.discrepancy}
              readOnly
            />
          </FormField>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${form.status === 'Match' ? 'bg-emerald-50/70 border-emerald-300/60' : 'bg-red-50/70 border-red-300/60'}`}>
          <span className={`w-3 h-3 rounded-full ${form.status === 'Match' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className={`font-semibold text-sm ${form.status === 'Match' ? 'text-emerald-700' : 'text-red-700'}`}>
            Status: {form.status === 'Match' ? 'MATCH — Stok Sesuai' : 'MISS — Ada Selisih'}
          </span>
        </div>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Stock Opname'}
        </button>
      </form>

      {/* Recent records */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/20">
          <span className="text-white/80 text-sm font-medium">Riwayat Stock Opname Terkini</span>
        </div>
        <div className="overflow-x-auto">
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-white/50" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">Belum ada data stock opname.</div>
          ) : (
            <table className="w-full glass-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Deskripsi</th>
                  <th>Qty System</th>
                  <th>Qty Fisik</th>
                  <th>Selisih</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-semibold">{r.barcode ?? '-'}</td>
                    <td className="text-xs">{r.description ?? '-'}</td>
                    <td>{r.qty_system ?? 0}</td>
                    <td>{r.qty_physical ?? 0}</td>
                    <td className={`font-bold ${(r.discrepancy ?? 0) === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(r.discrepancy ?? 0) > 0 ? `+${r.discrepancy}` : r.discrepancy ?? 0}
                    </td>
                    <td>
                      <span className={`badge ${(r.status ?? 'Match') === 'Match' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {r.status ?? 'Match'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
