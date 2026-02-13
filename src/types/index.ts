// Core Entity Types

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  currentSellingPrice: number;
  isActive: boolean;
};

export type Batch = {
  id: string;
  productId: string;
  purchasePrice: number;
  initialQty: number;
  remainingQty: number;
  receivedDate: string;
  expiryDate?: string;
  supplierNote?: string;
};

export type StoreType = 'mainHQ' | 'provincialHQ' | 'retail';

export type Store = {
  id: string;
  name: string;
  isWarehouse: boolean;
  storeType: StoreType;
  location?: string;
};

export type StoreStock = {
  storeId: string;
  batchId: string;
  currentQty: number;
};

export type PaymentMethod = 'cash' | 'fonepay';

export type CashHolding = {
  storeId: string;
  balance: number;
};

export type CashTransfer = {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  amount: number;
  transferDate: string;
};

export type PriceHistory = {
  id: string;
  productId: string;
  sellingPrice: number;
  effectiveDate: string;
  note?: string;
};

// Sales / Transaction Types

export type SalesTransactionBatchItem = {
  batchId: string;
  qtyFromBatch: number;
  purchasePricePerUnit: number;
  sellingPricePerUnit: number;
  lineMargin: number;
};

export type SalesTransaction = {
  id: string;
  storeId: string;
  productId: string;
  qtySold: number;
  sellingPricePerUnit: number;
  batchItems: SalesTransactionBatchItem[];
  totalRevenue: number;
  totalCOGS: number;
  totalMargin: number;
  marginPercent: number;
  transactionDate: string;
  paymentMethod: PaymentMethod;
  note?: string;
};

// FIFO Algorithm Types

export type FIFOAllocationItem = {
  batchId: string;
  qtyAllocated: number;
  purchasePricePerUnit: number;
};

export type FIFOSaleResult = {
  success: boolean;
  allocations: FIFOAllocationItem[];
  totalAllocated: number;
  shortfall: number;
  totalCOGS: number;
  error?: string;
};
