import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { MasterData } from '@/types/database';

interface BarcodeCache {
  [barcode: string]: {
    description: string;
    thickness: string;
    productName: string;
  };
}

interface WarehouseStore {
  masterData: MasterData[];
  barcodeCache: BarcodeCache;
  masterDataLoading: boolean;
  masterDataError: string | null;
  fetchMasterData: () => Promise<void>;
  lookupBarcode: (barcode: string) => BarcodeCache[string] | null;
  addMasterData: (item: Omit<MasterData, 'id' | 'created_at'>) => Promise<void>;
  bulkAddMasterData: (items: Omit<MasterData, 'id' | 'created_at'>[]) => Promise<void>;
  updateMasterData: (id: string, item: Partial<MasterData>) => Promise<void>;
  deleteMasterData: (id: string) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  masterData: [],
  barcodeCache: {},
  masterDataLoading: false,
  masterDataError: null,

  fetchMasterData: async () => {
    set({ masterDataLoading: true, masterDataError: null });
    const { data, error } = await supabase
      .from('master_data')
      .select('*')
      .order('barcode');

    if (error) {
      set({ masterDataError: error.message, masterDataLoading: false });
      return;
    }

    const cache: BarcodeCache = {};
    (data || []).forEach((row) => {
      cache[row.barcode.toUpperCase()] = {
        description: row.product_name ?? '',
        thickness: row.thickness ?? '',
        productName: row.product_name ?? '',
      };
    });

    set({ masterData: data ?? [], barcodeCache: cache, masterDataLoading: false });
  },

  lookupBarcode: (barcode: string) => {
    const cache = get().barcodeCache;
    return cache[barcode.toUpperCase()] ?? null;
  },

  addMasterData: async (item) => {
    const { error } = await supabase.from('master_data').insert(item);
    if (error) throw new Error(error.message);
    await get().fetchMasterData();
  },

  bulkAddMasterData: async (items) => {
    const { error } = await supabase.from('master_data').insert(items);
    if (error) throw new Error(error.message);
    await get().fetchMasterData();
  },

  updateMasterData: async (id, item) => {
    const { error } = await supabase.from('master_data').update(item).eq('id', id);
    if (error) throw new Error(error.message);
    await get().fetchMasterData();
  },

  deleteMasterData: async (id) => {
    const { error } = await supabase.from('master_data').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await get().fetchMasterData();
  },
}));
