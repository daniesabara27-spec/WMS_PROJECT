import { useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { FormField, BarcodeField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];

const CHK_ITEMS = [
  { key: 'chk_packing', label: 'Packing OK' },
  { key: 'chk_barcode', label: 'Barcode OK' },
  { key: 'chk_steelband', label: 'Steel Band OK' },
  { key: 'chk_vinyl', label: 'Vinyl OK' },
  { key: 'chk_moisture', label: 'Moisture OK' },
  { key: 'chk_silica', label: 'Silica OK' },
  { key: 'chk_stopper', label: 'Stopper OK' },
] as const;

type ChkKey = (typeof CHK_ITEMS)[number]['key'];

const EMPTY = {
  shift: '', container_no: '', barcode: '', description: '',
  chk_packing: false, chk_barcode: false, chk_steelband: false,
  chk_vinyl: false, chk_moisture: false, chk_silica: false, chk_stopper: false,
  photo_url: '',
};

export default function InspeksiPengiriman() {
  const { lookupBarcode } = useWarehouseStore();
  const [form, setForm] = useState(EMPTY);
  const [autoFilled, setAutoFilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function handleBarcodeChange(val: string) {
    setForm((p) => ({ ...p, barcode: val }));
    setAutoFilled(false);
  }

  function handleBarcodeLookup(barcode: string) {
    if (!barcode.trim()) return;
    const match = lookupBarcode(barcode);
    if (match) {
      setForm((p) => ({ ...p, description: match.description }));
      setAutoFilled(true);
    }
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  function toggleChk(key: ChkKey) {
    setForm((p) => ({ ...p, [key]: !p[key] }));
  }

  function checkAll() {
    const allTrue = CHK_ITEMS.every((c) => form[c.key]);
    const updates = CHK_ITEMS.reduce((acc, c) => ({ ...acc, [c.key]: !allTrue }), {} as Record<ChkKey, boolean>);
    setForm((p) => ({ ...p, ...updates }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.container_no.trim()) { setAlert({ type: 'error', msg: 'No. Container wajib diisi.' }); return; }
    setSaving(true);
    const { error } = await supabase.from('inspeksi_pengiriman').insert({
      ...form, photo_url: form.photo_url || null,
    });
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Data inspeksi berhasil disimpan!' });
    setForm(EMPTY);
    setAutoFilled(false);
  }

  const allChecked = CHK_ITEMS.every((c) => form[c.key]);
  const checkedCount = CHK_ITEMS.filter((c) => form[c.key]).length;

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base">Inspeksi Pengiriman</h3>
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
          <FormField label="No. Container" required>
            <input className="glass-input" value={form.container_no} onChange={f('container_no')} placeholder="ABCD1234567" required />
          </FormField>
        </div>

        <BarcodeField value={form.barcode} onChange={handleBarcodeChange} onLookup={handleBarcodeLookup} autoFilled={autoFilled} />

        <FormField label="Deskripsi Produk">
          <input className="glass-input" value={form.description} onChange={f('description')} placeholder="Auto-filled dari barcode" />
        </FormField>

        {/* Checklist */}
        <div className="glass-card-solid p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-700 font-semibold text-sm">Checklist Inspeksi</p>
            <div className="flex items-center gap-3">
              <span className={`badge ${checkedCount === CHK_ITEMS.length ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {checkedCount}/{CHK_ITEMS.length}
              </span>
              <button
                type="button"
                onClick={checkAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {allChecked ? 'Uncheck All' : 'Check All'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHK_ITEMS.map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border
                  ${form[key]
                    ? 'bg-emerald-50/70 border-emerald-300/60 text-emerald-800'
                    : 'bg-white/40 border-white/50 text-slate-600 hover:bg-white/60'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={() => toggleChk(key)}
                  className="glass-checkbox"
                />
                <span className="text-sm font-medium">{label}</span>
                {form[key] && <Check size={14} className="ml-auto text-emerald-600" />}
              </label>
            ))}
          </div>
        </div>

        <FormField label="URL Foto Inspeksi" hint="Link foto bukti inspeksi (opsional)">
          <input className="glass-input" value={form.photo_url} onChange={f('photo_url')} placeholder="https://..." />
        </FormField>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Data Inspeksi'}
        </button>
      </form>
    </div>
  );
}
