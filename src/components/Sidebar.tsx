import { X, LayoutDashboard, Database, Package, ArrowDownToLine, ArrowUpFromLine, Droplets, ClipboardCheck, Download, ChevronRight } from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'master-data'
  | 'packing'
  | 'inbound'
  | 'outbound'
  | 'moisture'
  | 'inspeksi'
  | 'tarik-data';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, group: 'Utama' },
  { id: 'master-data', label: 'Master Data', icon: <Database size={18} />, group: 'Utama' },
  { id: 'packing', label: 'Packing', icon: <Package size={18} />, group: 'Operasional' },
  { id: 'inbound', label: 'Inbound', icon: <ArrowDownToLine size={18} />, group: 'Operasional' },
  { id: 'outbound', label: 'Outbound', icon: <ArrowUpFromLine size={18} />, group: 'Operasional' },
  { id: 'moisture', label: 'Moisture Container', icon: <Droplets size={18} />, group: 'Quality' },
  { id: 'inspeksi', label: 'Inspeksi Pengiriman', icon: <ClipboardCheck size={18} />, group: 'Quality' },
  { id: 'tarik-data', label: 'Tarik Data', icon: <Download size={18} />, group: 'Laporan' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const groups = [...new Set(NAV_ITEMS.map((i) => i.group))];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto`}
        style={{
          background: 'linear-gradient(180deg, rgba(15,40,90,0.92) 0%, rgba(10,70,110,0.90) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-400/30 border border-blue-300/40 flex items-center justify-center">
                <Package size={16} className="text-blue-200" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">KCC Glass</p>
                <p className="text-white/50 text-xs">Warehouse System</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-white/35 text-xs uppercase tracking-widest font-semibold mb-2 px-4">
                {group}
              </p>
              <ul className="space-y-1">
                {NAV_ITEMS.filter((i) => i.group === group).map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => { onNavigate(item.id); onClose(); }}
                      className={`sidebar-item w-full ${currentPage === item.id ? 'sidebar-item-active' : ''}`}
                    >
                      <span className={`${currentPage === item.id ? 'text-blue-300' : 'text-white/60'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {currentPage === item.id && (
                        <ChevronRight size={14} className="text-blue-300" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">v2.0 — Sept 2026</p>
        </div>
      </aside>
    </>
  );
}
