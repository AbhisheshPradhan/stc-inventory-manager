import { createContext, useReducer, type ReactNode } from 'react';
import type {
  Product,
  Batch,
  Store,
  StoreStock,
  PriceHistory,
  SalesTransaction,
  FIFOSaleResult,
  CashHolding,
  PaymentMethod,
} from '@/types';
import {
  products as mockProducts,
  batches as mockBatches,
  stores as mockStores,
  storeStocks as mockStoreStocks,
  priceHistories as mockPriceHistories,
  transactions as mockTransactions,
  cashHoldings as mockCashHoldings,
} from '@/data';
import { calculateFIFOSale, applyFIFOSale, buildSalesTransaction } from '@/utils/fifo';

const MAIN_HQ_ID = 'hq-ktm';

type InventoryState = {
  products: Product[];
  batches: Batch[];
  stores: Store[];
  storeStocks: StoreStock[];
  priceHistories: PriceHistory[];
  transactions: SalesTransaction[];
  cashHoldings: CashHolding[];
};

type InventoryAction =
  | { type: 'RECORD_SALE'; storeStocks: StoreStock[]; batches: Batch[]; transaction: SalesTransaction; cashStoreId: string; cashAmount: number }
  | { type: 'UPDATE_PRICE'; productId: string; newPrice: number; priceHistory: PriceHistory }
  | { type: 'ADD_BATCH'; batch: Batch; storeStock: StoreStock }
  | { type: 'TRANSFER_STOCK'; fromStoreId: string; toStoreId: string; batchId: string; qty: number }
  | { type: 'TRANSFER_CASH'; fromStoreId: string; toStoreId: string; amount: number };

function updateCashBalance(holdings: CashHolding[], storeId: string, delta: number): CashHolding[] {
  const existing = holdings.find((ch) => ch.storeId === storeId);
  if (existing) {
    return holdings.map((ch) =>
      ch.storeId === storeId ? { ...ch, balance: ch.balance + delta } : ch
    );
  }
  return [...holdings, { storeId, balance: delta }];
}

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'RECORD_SALE': {
      let updatedCash = state.cashHoldings;
      if (action.cashAmount > 0) {
        updatedCash = updateCashBalance(updatedCash, action.cashStoreId, action.cashAmount);
      }
      return {
        ...state,
        storeStocks: action.storeStocks,
        batches: action.batches,
        transactions: [action.transaction, ...state.transactions],
        cashHoldings: updatedCash,
      };
    }
    case 'UPDATE_PRICE':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, currentSellingPrice: action.newPrice } : p
        ),
        priceHistories: [...state.priceHistories, action.priceHistory],
      };
    case 'ADD_BATCH':
      return {
        ...state,
        batches: [...state.batches, action.batch],
        storeStocks: [...state.storeStocks, action.storeStock],
      };
    case 'TRANSFER_STOCK': {
      const { fromStoreId, toStoreId, batchId, qty } = action;
      let updatedStocks = state.storeStocks.map((ss) => {
        if (ss.storeId === fromStoreId && ss.batchId === batchId) {
          return { ...ss, currentQty: ss.currentQty - qty };
        }
        return ss;
      });

      const existing = updatedStocks.find(
        (ss) => ss.storeId === toStoreId && ss.batchId === batchId
      );
      if (existing) {
        updatedStocks = updatedStocks.map((ss) => {
          if (ss.storeId === toStoreId && ss.batchId === batchId) {
            return { ...ss, currentQty: ss.currentQty + qty };
          }
          return ss;
        });
      } else {
        updatedStocks = [...updatedStocks, { storeId: toStoreId, batchId, currentQty: qty }];
      }

      return { ...state, storeStocks: updatedStocks };
    }
    case 'TRANSFER_CASH': {
      let updatedCash = updateCashBalance(state.cashHoldings, action.fromStoreId, -action.amount);
      updatedCash = updateCashBalance(updatedCash, action.toStoreId, action.amount);
      return { ...state, cashHoldings: updatedCash };
    }
    default:
      return state;
  }
}

type InventoryContextType = InventoryState & {
  recordSale: (storeId: string, productId: string, qty: number, paymentMethod: PaymentMethod) => FIFOSaleResult;
  updateSellingPrice: (productId: string, newPrice: number, note?: string) => void;
  addBatch: (productId: string, purchasePrice: number, qty: number, targetStoreId?: string, expiryDate?: string, supplierNote?: string) => void;
  transferStock: (fromStoreId: string, toStoreId: string, batchId: string, qty: number) => { success: boolean; error?: string };
  transferCash: (fromStoreId: string, toStoreId: string, amount: number) => { success: boolean; error?: string };
};

export const InventoryContext = createContext<InventoryContextType | null>(null);

const initialState: InventoryState = {
  products: mockProducts,
  batches: mockBatches,
  stores: mockStores,
  storeStocks: mockStoreStocks,
  priceHistories: mockPriceHistories,
  transactions: mockTransactions,
  cashHoldings: mockCashHoldings,
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  const recordSale = (storeId: string, productId: string, qty: number, paymentMethod: PaymentMethod): FIFOSaleResult => {
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      return {
        success: false,
        allocations: [],
        totalAllocated: 0,
        shortfall: qty,
        totalCOGS: 0,
        error: 'Product not found',
      };
    }

    const result = calculateFIFOSale(storeId, productId, qty, state.storeStocks, state.batches);

    if (result.success) {
      const { updatedStoreStocks, updatedBatches } = applyFIFOSale(
        result,
        storeId,
        state.storeStocks,
        state.batches
      );
      const transaction = buildSalesTransaction(
        storeId,
        productId,
        qty,
        product.currentSellingPrice,
        result,
        paymentMethod
      );

      const totalRevenue = product.currentSellingPrice * qty;
      // Cash: goes to selling store. Fonepay: goes directly to main HQ.
      const cashStoreId = paymentMethod === 'fonepay' ? MAIN_HQ_ID : storeId;

      dispatch({
        type: 'RECORD_SALE',
        storeStocks: updatedStoreStocks,
        batches: updatedBatches,
        transaction,
        cashStoreId,
        cashAmount: totalRevenue,
      });
    }

    return result;
  };

  const updateSellingPrice = (productId: string, newPrice: number, note?: string) => {
    const priceHistory: PriceHistory = {
      id: `ph-${Date.now()}`,
      productId,
      sellingPrice: newPrice,
      effectiveDate: new Date().toISOString(),
      note,
    };

    dispatch({ type: 'UPDATE_PRICE', productId, newPrice, priceHistory });
  };

  const addBatch = (
    productId: string,
    purchasePrice: number,
    qty: number,
    targetStoreId?: string,
    expiryDate?: string,
    supplierNote?: string
  ) => {
    // Default to main HQ if no target specified
    const warehouseId = targetStoreId || state.stores.find((s) => s.storeType === 'mainHQ')?.id;
    if (!warehouseId) return;

    const batchId = `batch-${Date.now()}`;
    const batch: Batch = {
      id: batchId,
      productId,
      purchasePrice,
      initialQty: qty,
      remainingQty: qty,
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || undefined,
      supplierNote: supplierNote || undefined,
    };

    const storeStock: StoreStock = {
      storeId: warehouseId,
      batchId,
      currentQty: qty,
    };

    dispatch({ type: 'ADD_BATCH', batch, storeStock });
  };

  const transferStock = (
    fromStoreId: string,
    toStoreId: string,
    batchId: string,
    qty: number
  ): { success: boolean; error?: string } => {
    if (qty <= 0) return { success: false, error: 'Quantity must be greater than zero' };
    if (fromStoreId === toStoreId) return { success: false, error: 'Source and destination must differ' };

    const sourceStock = state.storeStocks.find(
      (ss) => ss.storeId === fromStoreId && ss.batchId === batchId
    );
    if (!sourceStock || sourceStock.currentQty < qty) {
      return { success: false, error: `Insufficient stock (available: ${sourceStock?.currentQty ?? 0})` };
    }

    dispatch({ type: 'TRANSFER_STOCK', fromStoreId, toStoreId, batchId, qty });
    return { success: true };
  };

  const transferCash = (
    fromStoreId: string,
    toStoreId: string,
    amount: number
  ): { success: boolean; error?: string } => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than zero' };
    if (fromStoreId === toStoreId) return { success: false, error: 'Source and destination must differ' };

    const sourceHolding = state.cashHoldings.find((ch) => ch.storeId === fromStoreId);
    if (!sourceHolding || sourceHolding.balance < amount) {
      return { success: false, error: `Insufficient cash (available: ${sourceHolding?.balance ?? 0})` };
    }

    dispatch({ type: 'TRANSFER_CASH', fromStoreId, toStoreId, amount });
    return { success: true };
  };

  return (
    <InventoryContext.Provider value={{ ...state, recordSale, updateSellingPrice, addBatch, transferStock, transferCash }}>
      {children}
    </InventoryContext.Provider>
  );
}
