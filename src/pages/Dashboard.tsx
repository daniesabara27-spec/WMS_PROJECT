import { useEffect, useState } from 'react';
import { Package, ArrowDownToLine, ArrowUpFromLine, Database, TrendingUp, Activity, Droplets, ClipboardCheck, ClipboardList, Timer, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWarehouseStore } from '@/store/useWarehouseStore';

interface Stats {
  masterData: number;
  packing: number;
  inbound: number;
  outbound: number;
  moisture: number;
  inspeksi: number;
  stockOpname: number;
  cycleTime: number;
  sorIncident: number;
}

interface RecentItem {
  id: string;
  type: string;
  barcode: string | null;
  created_at: string;
  pic?: string | null;
}

export default function Dashboard() {
  const { masterData } = useWarehouseStore();
  const [stats, setStats] = useState<Stats>({ masterData: 0, packing: 0, inbound: 0, outbound: 0, moisture: 0, inspeksi: 0, stockOpname: 0, cycleTime: 0, sorIncident: 0 });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [pack, inb, out, moist, insp, opnCount, cycCount, sorCount] = await Promise.all([
        supabase.from('packing').select('id, barcode, pic, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('inbound').select('id, barcode, pic, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('outbound').select('id, barcode, pic, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('moisture_container').select('*', { count: 'exact', head: true }),
        supabase.from('inspeksi_pengiriman').select('*', { count: 'exact', head: true }),
        supabase.from('stock_opname').select('*', { count: 'exact', head: true }),
        supabase.from('cycle_time').select('*', { count: 'exact', head: true }),
        supabase.from('sor_incident').select('*', { count: 'exact', head: true }),
      ]);

      const [packCount, inbCount, outCount] = await Promise.all([
        supabase.from('packing').select('*', { count: 'exact', head: true }),
        supabase.from('inbound').select('*', { count: 'exact', head: true }),
        supabase.from('outbound').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        masterData: masterData.length,
        packing: packCount.count ?? 0,
        inbound: inbCount.count ?? 0,
        outbound: outCount.count ?? 0,
        moisture: moist.count ?? 0,
        inspeksi: insp.count ?? 0,
        stockOpname: opnCount.count ?? 0,
        cycleTime: cycCount.count ?? 0,
        sorIncident: sorCount.count ?? 0,
      });

      const recentItems: RecentItem[] = [
        ...(pack.data ?? []).map((r) => ({ ...r, type: 'Packing' })),
        ...(inb.data ?? []).map((r) => ({ ...r, type: 'Inbound' })),
        ...(out.data ?? []).map((r) => ({ ...r, type: 'Outbound' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

      setRecent(recentItems);
      setLoading(false);
    }
    loadStats();
  }, [masterData.length]);

  const statCards = [
    { label: 'Master Data', value: stats.masterData, icon: <Database size={22} />, color: 'from-blue-400/30 to-blue-600/30', iconColor: 'text-blue-300' },
    { label: 'Total Packing', value: stats.packing, icon: <Package size={22} />, color: 'from-violet-400/30 to-violet-600/30', iconColor: 'text-violet-300' },
    { label: 'Total Inbound', value: stats.inbound, icon: <ArrowDownToLine size={22} />, color: 'from-emerald-400/30 to-emerald-600/30', iconColor: 'text-emerald-300' },
    { label: 'Total Outbound', value: stats.outbound, icon: <ArrowUpFromLine size={22} />, color: 'from-amber-400/30 to-amber-600/30', iconColor: 'text-amber-300' },
    { label: 'Moisture Records', value: stats.moisture, icon: <Droplets size={22} />, color: 'from-cyan-400/30 to-cyan-600/30', iconColor: 'text-cyan-300' },
    { label: 'Inspeksi Records', value: stats.inspeksi, icon: <ClipboardCheck size={22} />, color: 'from-rose-400/30 to-rose-600/30', iconColor: 'text-rose-300' },
    { label: 'Stock Opname', value: stats.stockOpname, icon: <ClipboardList size={22} />, color: 'from-teal-400/30 to-teal-600/30', iconColor: 'text-teal-300' },
    { label: 'Cycle Time', value: stats.cycleTime, icon: <Timer size={22} />, color: 'from-indigo-400/30 to-indigo-600/30', iconColor: 'text-indigo-300' },
    { label: 'SOR Incident', value: stats.sorIncident, icon: <AlertTriangle size={22} />, color: 'from-orange-400/30 to-orange-600/30', iconColor: 'text-orange-300' },
  ];

  const typeColor: Record<string, string> = {
    Packing: 'bg-violet-400/20 text-violet-700',
    Inbound: 'bg-emerald-400/20 text-emerald-700',
    Outbound: 'bg-amber-400/20 text-amber-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/40 to-cyan-400/40 border border-white/40 flex items-center justify-center">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Selamat Datang!</h2>
            <p className="text-white/60 text-sm mt-0.5">KCC Glass Warehouse Management System</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-700 text-sm font-medium">Sistem Aktif</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`glass-card p-5 bg-gradient-to-br ${card.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-white text-3xl font-bold mt-1">
                  {loading ? <span className="text-white/30 text-lg">...</span> : card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${card.iconColor} opacity-80`}>{card.icon}</div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={12} className="text-white/40" />
              <span className="text-white/40 text-xs">Total records</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Activity size={16} className="text-blue-300" />
            Aktivitas Terkini
          </h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-sm">Belum ada aktivitas</div>
          ) : (
            <table className="w-full glass-table">
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Barcode</th>
                  <th>PIC</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id + item.type}>
                    <td>
                      <span className={`badge ${typeColor[item.type]}`}>{item.type}</span>
                    </td>
                    <td className="font-mono text-xs">{item.barcode ?? '-'}</td>
                    <td>{item.pic ?? '-'}</td>
                    <td className="text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleString('id-ID')}
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
