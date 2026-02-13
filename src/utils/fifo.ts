import type {
  Batch,
  StoreStock,
  FIFOSaleResult,
  FIFOAllocationItem,
  SalesTransaction,
  SalesTransactionBatchItem,
  PaymentMethod,
} from '@/types';

export function calculateFIFOSale(
  storeId: string,
  productId: string,
  qtyRequested: number,
  storeStocks: StoreStock[],
  batches: Batch[]
): FIFOSaleResult {
  if (qtyRequested <= 0) {
    return {
      success: false,
      allocations: [],
      totalAllocated: 0,
      shortfall: 0,
      totalCOGS: 0,
      error: 'Quantity must be greater than zero',
    };
  }

  const batchMap = new Map<string, Batch>();
  for (const b of batches) {
    if (b.productId === productId) {
      batchMap.set(b.id, b);
    }
  }

  const eligibleStocks = storeStocks
    .filter((ss) => {
      if (ss.storeId !== storeId || ss.currentQty <= 0) return false;
      return batchMap.has(ss.batchId);
    })
    .map((ss) => ({
      storeStock: ss,
      batch: batchMap.get(ss.batchId)!,
    }))
    .sort(
      (a, b) =>
        new Date(a.batch.receivedDate).getTime() -
        new Date(b.batch.receivedDate).getTime()
    );

  let remaining = qtyRequested;
  const allocations: FIFOAllocationItem[] = [];

  for (const { storeStock, batch } of eligibleStocks) {
    if (remaining <= 0) break;

    const take = Math.min(storeStock.currentQty, remaining);
    allocations.push({
      batchId: batch.id,
      qtyAllocated: take,
      purchasePricePerUnit: batch.purchasePrice,
    });
    remaining -= take;
  }

  const totalAllocated = qtyRequested - remaining;
  const totalCOGS = allocations.reduce(
    (sum, a) => sum + a.purchasePricePerUnit * a.qtyAllocated,
    0
  );

  return {
    success: remaining === 0,
    allocations,
    totalAllocated,
    shortfall: remaining,
    totalCOGS,
    error:
      remaining > 0
        ? `Insufficient stock: short by ${remaining} units`
        : undefined,
  };
}

export function applyFIFOSale(
  result: FIFOSaleResult,
  storeId: string,
  storeStocks: StoreStock[],
  batches: Batch[]
): { updatedStoreStocks: StoreStock[]; updatedBatches: Batch[] } {
  const updatedStoreStocks = storeStocks.map((ss) => {
    const alloc = result.allocations.find(
      (a) => a.batchId === ss.batchId && ss.storeId === storeId
    );
    if (!alloc) return ss;
    return { ...ss, currentQty: ss.currentQty - alloc.qtyAllocated };
  });

  const updatedBatches = batches.map((b) => {
    const alloc = result.allocations.find((a) => a.batchId === b.id);
    if (!alloc) return b;
    return { ...b, remainingQty: b.remainingQty - alloc.qtyAllocated };
  });

  return { updatedStoreStocks, updatedBatches };
}

export function buildSalesTransaction(
  storeId: string,
  productId: string,
  qtySold: number,
  sellingPricePerUnit: number,
  fifoResult: FIFOSaleResult,
  paymentMethod: PaymentMethod = 'cash'
): SalesTransaction {
  const batchItems: SalesTransactionBatchItem[] = fifoResult.allocations.map(
    (alloc) => ({
      batchId: alloc.batchId,
      qtyFromBatch: alloc.qtyAllocated,
      purchasePricePerUnit: alloc.purchasePricePerUnit,
      sellingPricePerUnit,
      lineMargin:
        (sellingPricePerUnit - alloc.purchasePricePerUnit) *
        alloc.qtyAllocated,
    })
  );

  const totalRevenue = sellingPricePerUnit * qtySold;
  const totalCOGS = fifoResult.totalCOGS;
  const totalMargin = totalRevenue - totalCOGS;

  return {
    id: `TXN-${Date.now()}`,
    storeId,
    productId,
    qtySold,
    sellingPricePerUnit,
    batchItems,
    totalRevenue,
    totalCOGS,
    totalMargin,
    marginPercent: totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0,
    transactionDate: new Date().toISOString(),
    paymentMethod,
  };
}
