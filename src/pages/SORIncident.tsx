import { useState, useEffect } from 'react';
import { Check, Loader2, RefreshCw, AlertTriangle, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FormField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];
const CATEGORIES = ['Salah Kirim Thickness', 'Temuan Hama/Kecoa', 'Lainnya'];

const EMPTY = {
  shift: '', issue_category: '', description_id: '', description_en: '', corrective_action: '', pic: '',
};

type FormState = typeof EMPTY;

export default function SORIncident() {
  const [form, setForm] = useState<FormState>(EMPTY);
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
      .from('sor_incident')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecent(data ?? []);
    setLoadingRecent(false);
  }

  const f = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.issue_category) { setAlert({ type: 'error', msg: 'Kategori insiden wajib dipilih.' }); return; }
    if (!form.description_id.trim() && !form.description_en.trim()) {
      setAlert({ type: 'error', msg: 'Deskripsi (ID atau EN) wajib diisi.' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('sor_incident').insert(form);
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Laporan insiden SOR berhasil disimpan!' });
    setForm(EMPTY);
    loadRecent();
  }

  const catColor: Record<string, string> = {
    'Salah Kirim Thickness': 'bg-red-100 text-red-700',
    'Temuan Hama/Kecoa': 'bg-amber-100 text-amber-700',
    'Lainnya': 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            Statement of Reason (SOR) / Insiden
          </h3>
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
          <FormField label="Kategori Insiden" required>
            <select className="glass-select" value={form.issue_category} onChange={f('issue_category')} required>
              <option value="">-- Pilih Kategori --</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="PIC" required>
          <input className="glass-input" value={form.pic} onChange={f('pic')} placeholder="Nama petugas pelapor" required />
        </FormField>

        {/* Bilingual descriptions */}
        <div className="glass-card-solid p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <Globe size={15} className="text-blue-500" />
            Deskripsi Insiden (Dwi-Bahasa)
          </div>

          <FormField label="Deskripsi (Bahasa Indonesia)" required>
            <textarea
              className="glass-input min-h-[80px] resize-y"
              value={form.description_id}
              onChange={f('description_id')}
              placeholder="Jelaskan insiden dalam Bahasa Indonesia..."
              rows={3}
            />
          </FormField>

          <FormField label="Description (English)" required>
            <textarea
              className="glass-input min-h-[80px] resize-y"
              value={form.description_en}
              onChange={f('description_en')}
              placeholder="Describe the incident in English..."
              rows={3}
            />
          </FormField>
        </div>

        <FormField label="Tindakan Perbaikan (Corrective Action)" required>
          <textarea
            className="glass-input min-h-[80px] resize-y"
            value={form.corrective_action}
            onChange={f('corrective_action')}
            placeholder="Langkah perbaikan yang dilakukan atau akan dilakukan..."
            rows={3}
          />
        </FormField>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Laporan SOR'}
        </button>
      </form>

      {/* Recent records */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/20">
          <span className="text-white/80 text-sm font-medium">Riwayat Laporan SOR Terkini</span>
        </div>
        <div className="overflow-x-auto">
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-white/50" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">Belum ada laporan insiden.</div>
          ) : (
            <table className="w-full glass-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Deskripsi (ID)</th>
                  <th>Corrective Action</th>
                  <th>PIC</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={`badge ${catColor[r.issue_category] ?? 'bg-slate-100 text-slate-600'}`}>
                        {r.issue_category ?? '-'}
                      </span>
                    </td>
                    <td className="text-xs max-w-[200px] truncate" title={r.description_id ?? ''}>
                      {r.description_id ?? '-'}
                    </td>
                    <td className="text-xs max-w-[200px] truncate" title={r.corrective_action ?? ''}>
                      {r.corrective_action ?? '-'}
                    </td>
                    <td className="text-xs">{r.pic ?? '-'}</td>
                    <td className="text-xs text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleString('id-ID') : '-'}
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
