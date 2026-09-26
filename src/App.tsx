import { useState, useEffect } from 'react';
import Sidebar, { type Page } from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/pages/Dashboard';
import MasterData from '@/pages/MasterData';
import Packing from '@/pages/Packing';
import Inbound from '@/pages/Inbound';
import Outbound from '@/pages/Outbound';
import MoistureContainer from '@/pages/MoistureContainer';
import InspeksiPengiriman from '@/pages/InspeksiPengiriman';
import StockOpname from '@/pages/StockOpname';
import CycleTime from '@/pages/CycleTime';
import SORIncident from '@/pages/SORIncident';
import TarikData from '@/pages/TarikData';
import { useWarehouseStore } from '@/store/useWarehouseStore';

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case 'dashboard': return <Dashboard />;
    case 'master-data': return <MasterData />;
    case 'packing': return <Packing />;
    case 'inbound': return <Inbound />;
    case 'outbound': return <Outbound />;
    case 'moisture': return <MoistureContainer />;
    case 'inspeksi': return <InspeksiPengiriman />;
    case 'stock-opname': return <StockOpname />;
    case 'cycle-time': return <CycleTime />;
    case 'sor-incident': return <SORIncident />;
    case 'tarik-data': return <TarikData />;
    default: return <Dashboard />;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fetchMasterData = useWarehouseStore((s) => s.fetchMasterData);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return (
    <div className="app-bg min-h-screen flex">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar currentPage={currentPage} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <PageContent page={currentPage} />
        </main>
      </div>
    </div>
  );
}
