import { Menu, Bell } from 'lucide-react';
import type { Page } from './Sidebar';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  'master-data': 'Master Data Produk',
  packing: 'Form Packing',
  inbound: 'Form Inbound',
  outbound: 'Form Outbound',
  moisture: 'Moisture Container',
  inspeksi: 'Inspeksi Pengiriman',
  'tarik-data': 'Tarik Data / Export',
};

interface TopbarProps {
  currentPage: Page;
  onMenuClick: () => void;
}

export default function Topbar({ currentPage, onMenuClick }: TopbarProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/15"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">{PAGE_TITLES[currentPage]}</h1>
          <p className="text-white/50 text-xs">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-all">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-blue-400/40 border border-blue-300/40 flex items-center justify-center text-white font-bold text-sm">
          W
        </div>
      </div>
    </header>
  );
}
