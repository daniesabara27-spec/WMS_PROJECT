import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { FormField } from '@/components/FormField';
import { Alert } from '@/components/FormField';
import type { MasterData as MD } from '@/types/database';

const EMPTY: Omit<MD, 'id' | 'created_at'> = {
  barcode: '', product_code: '', product_name: '', thickness: '', keeping_no: '', stock: 0,
};

export default function MasterData() {
  const { masterData, addMasterData, updateMasterData, deleteMasterData } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MD | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = masterData.filter((r) =>
    [r.barcode, r.product_name, r.product_code, r.keeping_no].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(row: MD) {
    setEditing(row);
    setForm({ barcode: row.barcode, product_code: row.product_code ?? '', product_name: row.product_name ?? '', thickness: row.thickness ?? '', keeping_no: row.keeping_no ?? '', stock: row.stock ?? 0 });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.barcode.trim()) { setAlert({ type: 'error', msg: 'Barcode wajib diisi.' }); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateMasterData(editing.id, form);
        setAlert({ type: 'success', msg: 'Data berhasil diperbarui.' });
      } else {
        await addMasterData(form);
        setAlert({ type: 'success', msg: 'Data berhasil ditambahkan.' });
      }
      setShowForm(false);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteMasterData(id);
      setAlert({ type: 'success', msg: 'Data dihapus.' });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message });
    } finally {
      setDeletingId(null);
    }
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: key === 'stock' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="space-y-4 animate-fade-in">
      {alert && (
        <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barcode, nama produk..."
            className="glass-input pl-10"
          />
        </div>
        <button onClick={openAdd} className="glass-btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Tambah Data
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="form-section animate-scale-in">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-800 font-bold text-base">
              {editing ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Barcode" required>
              <input className="glass-input" value={form.barcode} onChange={f('barcode')} placeholder="Barcode unik" disabled={!!editing} />
            </FormField>
            <FormField label="Kode Produk">
              <input className="glass-input" value={form.product_code ?? ''} onChange={f('product_code')} placeholder="P-001" />
            </FormField>
            <FormField label="Nama Produk">
              <input className="glass-input" value={form.product_name ?? ''} onChange={f('product_name')} placeholder="Float Glass 5mm Clear" />
            </FormField>
            <FormField label="Thickness">
              <input className="glass-input" value={form.thickness ?? ''} onChange={f('thickness')} placeholder="5mm" />
            </FormField>
            <FormField label="Keeping No">
              <input className="glass-input" value={form.keeping_no ?? ''} onChange={f('keeping_no')} placeholder="KP-001" />
            </FormField>
            <FormField label="Stok">
              <input className="glass-input" type="number" value={form.stock ?? 0} onChange={f('stock')} min={0} />
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="glass-btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button onClick={() => setShowForm(false)} className="glass-btn-secondary">Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/20 flex items-center justify-between">
          <span className="text-white/80 text-sm font-medium">{filtered.length} produk ditemukan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full glass-table min-w-[700px]">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Thickness</th>
                <th>Keeping No</th>
                <th>Stok</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {search ? 'Tidak ada data yang cocok.' : 'Belum ada data master.'}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="font-mono text-xs font-semibold">{row.barcode}</td>
                    <td className="text-xs">{row.product_code ?? '-'}</td>
                    <td>{row.product_name ?? '-'}</td>
                    <td>{row.thickness ?? '-'}</td>
                    <td>{row.keeping_no ?? '-'}</td>
                    <td>
                      <span className={`badge ${(row.stock ?? 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {row.stock ?? 0}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-100/60 text-blue-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="p-1.5 rounded-lg hover:bg-red-100/60 text-red-500 transition-colors"
                        >
                          {deletingId === row.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
