import { useState, useRef } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Loader2, Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useWarehouseStore } from '@/store/useWarehouseStore';
import { FormField } from '@/components/FormField';
import { Alert } from '@/components/FormField';
import type { MasterData as MD } from '@/types/database';

const EMPTY: Omit<MD, 'id' | 'created_at'> = {
  barcode: '', product_code: '', product_name: '', thickness: '', keeping_no: '', stock: 0,
};

export default function MasterData() {
  const { masterData, addMasterData, bulkAddMasterData, updateMasterData, deleteMasterData } = useWarehouseStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MD | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<Omit<MD, 'id' | 'created_at'>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const COLUMN_MAP: Record<string, keyof Omit<MD, 'id' | 'created_at'>> = {
    barcode: 'barcode',
    'Barcode': 'barcode',
    'BARCODE': 'barcode',
    product_code: 'product_code',
    'Product Code': 'product_code',
    'Kode Produk': 'product_code',
    product_name: 'product_name',
    'Product Name': 'product_name',
    'Nama Produk': 'product_name',
    'Nama': 'product_name',
    thickness: 'thickness',
    'Thickness': 'thickness',
    'Tebal': 'thickness',
    keeping_no: 'keeping_no',
    'Keeping No': 'keeping_no',
    'Keeping Number': 'keeping_no',
    stock: 'stock',
    'Stock': 'stock',
    'Stok': 'stock',
    'Qty': 'stock',
  };

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setAlert(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

        const mapped: Omit<MD, 'id' | 'created_at'>[] = rows.map((row) => {
          const obj: any = { barcode: '', product_code: '', product_name: '', thickness: '', keeping_no: '', stock: 0 };
          for (const [excelCol, val] of Object.entries(row)) {
            const dbCol = COLUMN_MAP[excelCol.trim()];
            if (dbCol) {
              if (dbCol === 'stock') {
                obj[dbCol] = Number(val) || 0;
              } else {
                obj[dbCol] = String(val ?? '').trim();
              }
            }
          }
          return obj;
        }).filter((r) => r.barcode);

        if (mapped.length === 0) {
          setAlert({ type: 'error', msg: 'Tidak ada baris valid. Pastikan ada kolom "barcode" di file Excel.' });
          setUploading(false);
          return;
        }

        setUploadPreview(mapped);
        setShowUpload(true);
        setUploading(false);
      } catch {
        setAlert({ type: 'error', msg: 'Gagal membaca file Excel. Pastikan format .xlsx atau .xls.' });
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  async function handleUploadConfirm() {
    setUploading(true);
    try {
      await bulkAddMasterData(uploadPreview);
      setAlert({ type: 'success', msg: `${uploadPreview.length} produk berhasil diupload ke database!` });
      setShowUpload(false);
      setUploadPreview([]);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message });
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const sample = [
      { barcode: 'KCC001', product_code: 'P-001', product_name: 'Float Glass 5mm Clear', thickness: '5mm', keeping_no: 'KP-001', stock: 100 },
      { barcode: 'KCC002', product_code: 'P-002', product_name: 'Float Glass 6mm Bronze', thickness: '6mm', keeping_no: 'KP-002', stock: 50 },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 28 }, { wch: 10 }, { wch: 12 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master Data');
    XLSX.writeFile(wb, 'template_master_data.xlsx');
  }

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
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="glass-btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Memproses...' : 'Upload Excel'}
          </button>
          <button onClick={downloadTemplate} className="glass-btn-secondary flex items-center gap-2 whitespace-nowrap" title="Download template Excel kosong">
            <Download size={16} /> Template
          </button>
          <button onClick={openAdd} className="glass-btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Tambah Data
          </button>
        </div>
      </div>

      {/* Upload Preview Modal */}
      {showUpload && (
        <div className="form-section animate-scale-in">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-600" />
              Preview Upload Excel ({uploadPreview.length} baris)
            </h3>
            <button onClick={() => { setShowUpload(false); setUploadPreview([]); }} className="text-slate-500 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-x-auto max-h-64 rounded-xl border border-white/30">
            <table className="w-full glass-table min-w-[700px]">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Kode</th>
                  <th>Nama Produk</th>
                  <th>Thickness</th>
                  <th>Keeping No</th>
                  <th>Stok</th>
                </tr>
              </thead>
              <tbody>
                {uploadPreview.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs font-semibold">{row.barcode}</td>
                    <td className="text-xs">{row.product_code || '-'}</td>
                    <td>{row.product_name || '-'}</td>
                    <td>{row.thickness || '-'}</td>
                    <td>{row.keeping_no || '-'}</td>
                    <td>{row.stock ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {uploadPreview.length > 50 && (
            <p className="text-slate-500 text-xs">Menampilkan 50 dari {uploadPreview.length} baris.</p>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={handleUploadConfirm} disabled={uploading} className="glass-btn-primary flex items-center gap-2">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {uploading ? 'Mengupload...' : `Upload ${uploadPreview.length} Produk`}
            </button>
            <button onClick={() => { setShowUpload(false); setUploadPreview([]); }} className="glass-btn-secondary">Batal</button>
          </div>
        </div>
      )}

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
