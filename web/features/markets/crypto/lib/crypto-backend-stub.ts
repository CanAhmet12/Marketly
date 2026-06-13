/** Supabase / RPC entegrasyonu için ileride genişletilecek alanlar */
export type CryptoCategoryBackendMeta = {
  /** Dashboard sürümü — cache invalidation */
  schemaVersion: 1;
  /** Canlı segment ısısı RPC hazır mı */
  segmentsRpcReady: boolean;
  /** Treemap ağırlıkları canlı mcap RPC'den mi */
  treemapLiveWeights: boolean;
};

export const CRYPTO_CATEGORY_BACKEND_STUB: CryptoCategoryBackendMeta = {
  schemaVersion: 1,
  segmentsRpcReady: false,
  treemapLiveWeights: false,
};
