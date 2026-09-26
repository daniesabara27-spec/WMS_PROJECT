import { useState, useEffect } from 'react';
import { Check, Loader2, RefreshCw, Timer, Play, Square } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { FormField, Alert } from '@/components/FormField';

const SHIFTS = ['Shift 1', 'Shift 2', 'Shift 3'];
const STAGES = ['Arrival', 'Prep', 'Stuffing', 'Stopper', 'QC'];

const EMPTY = {
  shift: '', container_no: '', process_stage: '',
  start_time: '', end_time: '', total_duration_minutes: '', pic: '',
};

type FormState = typeof EMPTY;

function calcDuration(start: string, end: string): string {
  if (!start || !end) return '';
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return '';
  const mins = Math.round((e - s) / 60000);
  return String(mins);
}

export default function CycleTime() {
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
      .from('cycle_time')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecent(data ?? []);
    setLoadingRecent(false);
  }

  useEffect(() => {
    setForm((p) => ({ ...p, total_duration_minutes: calcDuration(p.start_time, p.end_time) }));
  }, [form.start_time, form.end_time]);

  const f = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.container_no.trim()) { setAlert({ type: 'error', msg: 'No. Container wajib diisi.' }); return; }
    setSaving(true);
    const payload = {
      shift: form.shift,
      container_no: form.container_no,
      process_stage: form.process_stage,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      total_duration_minutes: form.total_duration_minutes ? Number(form.total_duration_minutes) : null,
      pic: form.pic,
    };
    const { error } = await supabase.from('cycle_time').insert(payload);
    setSaving(false);
    if (error) { setAlert({ type: 'error', msg: error.message }); return; }
    setAlert({ type: 'success', msg: 'Data cycle time berhasil disimpan!' });
    setForm(EMPTY);
    loadRecent();
  }

  function setNow(field: 'start_time' | 'end_time') {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm((p) => ({ ...p, [field]: local }));
  }

  const stageColor: Record<string, string> = {
    Arrival: 'bg-blue-100 text-blue-700',
    Prep: 'bg-violet-100 text-violet-700',
    Stuffing: 'bg-amber-100 text-amber-700',
    Stopper: 'bg-cyan-100 text-cyan-700',
    QC: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="form-section">
        <div className="flex items-center justify-between pb-2 border-b border-white/30">
          <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
            <Timer size={18} className="text-blue-600" />
            Cycle Time Tracking
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
          <FormField label="No. Container" required>
            <input className="glass-input" value={form.container_no} onChange={f('container_no')} placeholder="ABCD1234567" required />
          </FormField>
          <FormField label="Tahapan Proses" required>
            <select className="glass-select" value={form.process_stage} onChange={f('process_stage')} required>
              <option value="">-- Pilih Tahapan --</option>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="PIC" required>
            <input className="glass-input" value={form.pic} onChange={f('pic')} placeholder="Nama petugas" required />
          </FormField>
        </div>

        {/* Time inputs with quick-set buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start Time">
            <div className="flex gap-2">
              <input
                type="datetime-local"
                className="glass-input"
                value={form.start_time}
                onChange={f('start_time')}
              />
              <button
                type="button"
                onClick={() => setNow('start_time')}
                className="glass-btn-secondary flex items-center gap-1.5 whitespace-nowrap px-3"
                title="Set waktu sekarang"
              >
                <Play size={14} />
              </button>
            </div>
          </FormField>
          <FormField label="End Time">
            <div className="flex gap-2">
              <input
                type="datetime-local"
                className="glass-input"
                value={form.end_time}
                onChange={f('end_time')}
              />
              <button
                type="button"
                onClick={() => setNow('end_time')}
                className="glass-btn-secondary flex items-center gap-1.5 whitespace-nowrap px-3"
                title="Set waktu sekarang"
              >
                <Square size={14} />
              </button>
            </div>
          </FormField>
        </div>

        {/* Duration display */}
        <div className="glass-card-solid p-4 flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-xs font-medium uppercase tracking-wide">Total Duration</p>
            <p className={`text-2xl font-bold mt-1 ${form.total_duration_minutes ? 'text-blue-700' : 'text-slate-400'}`}>
              {form.total_duration_minutes ? `${form.total_duration_minutes} menit` : '—'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-400/20 border border-blue-300/40 flex items-center justify-center">
            <Timer size={24} className="text-blue-600" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="glass-btn-primary flex items-center gap-2 w-full justify-center py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Menyimpan...' : 'Simpan Cycle Time'}
        </button>
      </form>

      {/* Recent records */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/20">
          <span className="text-white/80 text-sm font-medium">Riwayat Cycle Time Terkini</span>
        </div>
        <div className="overflow-x-auto">
          {loadingRecent ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-white/50" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">Belum ada data cycle time.</div>
          ) : (
            <table className="w-full glass-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Container</th>
                  <th>Tahapan</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Durasi</th>
                  <th>PIC</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-semibold">{r.container_no ?? '-'}</td>
                    <td>
                      <span className={`badge ${stageColor[r.process_stage] ?? 'bg-slate-100 text-slate-600'}`}>
                        {r.process_stage ?? '-'}
                      </span>
                    </td>
                    <td className="text-xs">{r.start_time ? new Date(r.start_time).toLocaleString('id-ID') : '-'}</td>
                    <td className="text-xs">{r.end_time ? new Date(r.end_time).toLocaleString('id-ID') : '-'}</td>
                    <td className="font-bold text-blue-600">{r.total_duration_minutes ? `${r.total_duration_minutes} min` : '-'}</td>
                    <td className="text-xs">{r.pic ?? '-'}</td>
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
