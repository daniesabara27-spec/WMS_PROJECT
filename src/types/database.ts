export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      master_data: {
        Row: MasterData;
        Insert: Omit<MasterData, 'id' | 'created_at'>;
        Update: Partial<Omit<MasterData, 'id'>>;
      };
      packing: {
        Row: Packing;
        Insert: Omit<Packing, 'id' | 'created_at'>;
        Update: Partial<Omit<Packing, 'id'>>;
      };
      inbound: {
        Row: Inbound;
        Insert: Omit<Inbound, 'id' | 'created_at'>;
        Update: Partial<Omit<Inbound, 'id'>>;
      };
      outbound: {
        Row: Outbound;
        Insert: Omit<Outbound, 'id' | 'created_at'>;
        Update: Partial<Omit<Outbound, 'id'>>;
      };
      moisture_container: {
        Row: MoistureContainer;
        Insert: Omit<MoistureContainer, 'id' | 'created_at'>;
        Update: Partial<Omit<MoistureContainer, 'id'>>;
      };
      inspeksi_pengiriman: {
        Row: InspeksiPengiriman;
        Insert: Omit<InspeksiPengiriman, 'id' | 'created_at'>;
        Update: Partial<Omit<InspeksiPengiriman, 'id'>>;
      };
    };
  };
}

export interface MasterData {
  id: string;
  created_at: string;
  barcode: string;
  product_code: string | null;
  product_name: string | null;
  thickness: string | null;
  keeping_no: string | null;
  stock: number | null;
}

export interface Packing {
  id: string;
  created_at: string;
  shift: string | null;
  no_rak: string | null;
  pic: string | null;
  barcode: string | null;
  description: string | null;
  thickness: string | null;
  qty: number | null;
}

export interface Inbound {
  id: string;
  created_at: string;
  jenis_penerimaan: string | null;
  no_surat_jalan: string | null;
  penempatan_gudang: string | null;
  shift: string | null;
  no_rak: string | null;
  pic: string | null;
  barcode: string | null;
  description: string | null;
  thickness: string | null;
  qty: number | null;
}

export interface Outbound {
  id: string;
  created_at: string;
  jenis: string | null;
  tujuan: string | null;
  container_no: string | null;
  no_surat_jalan: string | null;
  shift: string | null;
  pic: string | null;
  barcode: string | null;
  description: string | null;
  thickness: string | null;
  qty: number | null;
}

export interface MoistureContainer {
  id: string;
  created_at: string;
  shift: string | null;
  container_no: string;
  point_a: number | null;
  point_b: number | null;
  point_c: number | null;
  point_d: number | null;
  point_e: number | null;
  average: number | null;
  form_photo_url: string | null;
}

export interface InspeksiPengiriman {
  id: string;
  created_at: string;
  shift: string | null;
  container_no: string;
  barcode: string | null;
  description: string | null;
  chk_packing: boolean | null;
  chk_barcode: boolean | null;
  chk_steelband: boolean | null;
  chk_vinyl: boolean | null;
  chk_moisture: boolean | null;
  chk_silica: boolean | null;
  chk_stopper: boolean | null;
  photo_url: string | null;
}
