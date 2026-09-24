import { useState, useEffect } from 'react';
import { Check, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FormField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];

const EMPTY = {
  shift: '', container_no: '',
  point_a: '', point_b: '', point_c: '', point_d: '', point_e: '',
  average: '', form_photo_url: '',
};

type FormState = typeof EMPTY;

function calcAverage(form: FormState): string {
  const vals = [form.point_a, form.point_b, form.point_c, form.point_d, form.point_e]
    .map(Number)
    .filter((v) => !isNaN(v) && v > 0);
  if (vals.length === 0) return '';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

export default function MoistureContainer() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    setForm((p) => ({ ...p, average: calcAverage(p) }));
  }, [form.point_a, form.point_b, form.point_c, form.point_d, form.point_e]);

  const f = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.container_no.trim()) { setAlert({ type: 'error', msg: 'No. Container wajib diisi.' }); return; }
    setSaving(true);
    const payload = {
      shift: form.shift,
      container_no: form.container_no,
      point_a: form.point_a ? Number(form.point_a) : null,
      point_b: form.point_b ? Number(form.point_b) : null,
      point_c: form.point_c ? Number(form.point_c) : null,
      point_d: form.point_d ? Number(form.point_d) : null,
      point_e: form.point_e ? Number(form.point_e) : null,
      average: form.average ? Number(form.average) : null,
      form_photo_url: form.form_photo_url || null,
    };
    const { error } = await supabase.from('moisture_container').insert(payload);
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Data moisture berhasil disimpan!' });
    setForm(EMPTY);
  }

  const pointFields = [
    { key: 'point_a' as const, label: 'Point A' },
    { key: 'point_b' as const, label: 'Point B' },
    { key: 'point_c' as const, label: 'Point C' },
    { key: 'point_d' as const, label: 'Point D' },
    { key: 'point_e' as const, label: 'Point E' },
  ];

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base">Moisture Container</h3>
          <button type="button" onClick={() => setForm(EMPTY)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs">
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

        {/* Moisture Points */}
        <div className="glass-card-solid p-4 space-y-3">
          <p className="text-slate-700 font-semibold text-sm">Pengukuran Titik Moisture (%)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pointFields.map(({ key, label }) => (
              <FormField key={key} label={label}>
                <input
                  className="glass-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form[key]}
                  onChange={f(key)}
                  placeholder="0.00"
                />
              </FormField>
            ))}
          </div>

          {/* Average */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/30">
            <span className="text-slate-600 font-medium text-sm">Rata-rata:</span>
            <div className="flex-1 glass-input bg-blue-50/60 text-blue-700 font-bold text-center">
              {form.average ? `${form.average} %` : '—'}
            </div>
          </div>
        </div>

        <FormField label="URL Foto Form" hint="Link foto bukti form pengukuran (opsional)">
          <input className="glass-input" value={form.form_photo_url} onChange={f('form_photo_url')} placeholder="https://..." />
        </FormField>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Data Moisture'}
        </button>
      </form>
    </div>
  );
}
