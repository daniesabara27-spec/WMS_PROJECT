import { useState } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { FormField, BarcodeField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];
const JENIS = ['Pengiriman Customer', 'Transfer Gudang', 'Retur'];

const EMPTY = {
  jenis: '', tujuan: '', container_no: '', no_surat_jalan: '',
  shift: '', pic: '', barcode: '', description: '', thickness: '', qty: 1,
};

export default function Outbound() {
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
      setForm((p) => ({ ...p, description: match.description, thickness: match.thickness }));
      setAutoFilled(true);
    }
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: key === 'qty' ? Number(e.target.value) : e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.barcode.trim()) { setAlert({ type: 'error', msg: 'Barcode wajib diisi.' }); return; }
    setSaving(true);
    const { error } = await supabase.from('outbound').insert(form);
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Data outbound berhasil disimpan!' });
    setForm(EMPTY);
    setAutoFilled(false);
  }

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base">Input Data Outbound</h3>
          <button type="button" onClick={() => { setForm(EMPTY); setAutoFilled(false); }} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs">
            <RefreshCw size={13} /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Jenis Pengiriman" required>
            <select className="glass-select" value={form.jenis} onChange={f('jenis')} required>
              <option value="">-- Pilih Jenis --</option>
              {JENIS.map((j) => <option key={j}>{j}</option>)}
            </select>
          </FormField>
          <FormField label="Tujuan">
            <input className="glass-input" value={form.tujuan} onChange={f('tujuan')} placeholder="Nama tujuan pengiriman" />
          </FormField>
          <FormField label="No. Container">
            <input className="glass-input" value={form.container_no} onChange={f('container_no')} placeholder="ABCD1234567" />
          </FormField>
          <FormField label="No. Surat Jalan">
            <input className="glass-input" value={form.no_surat_jalan} onChange={f('no_surat_jalan')} placeholder="SJ-001" />
          </FormField>
          <FormField label="Shift" required>
            <select className="glass-select" value={form.shift} onChange={f('shift')} required>
              <option value="">-- Pilih Shift --</option>
              {SHIFTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="PIC" required>
            <input className="glass-input" value={form.pic} onChange={f('pic')} placeholder="Nama petugas" required />
          </FormField>
          <FormField label="Qty">
            <input className="glass-input" type="number" min={1} value={form.qty} onChange={f('qty')} />
          </FormField>
        </div>

        <BarcodeField value={form.barcode} onChange={handleBarcodeChange} onLookup={handleBarcodeLookup} autoFilled={autoFilled} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Deskripsi Produk">
            <input className="glass-input" value={form.description} onChange={f('description')} placeholder="Auto-filled dari barcode" />
          </FormField>
          <FormField label="Thickness">
            <input className="glass-input" value={form.thickness} onChange={f('thickness')} placeholder="Auto-filled dari barcode" />
          </FormField>
        </div>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Data Outbound'}
        </button>
      </form>
    </div>
  );
}
