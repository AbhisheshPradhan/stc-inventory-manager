import type { Batch, StoreStock } from '@/types';

export const batches: Batch[] = [
  // Basmati Rice 25kg (prod-001) - 3 batches with rising cost
  {
    id: 'batch-001',
    productId: 'prod-001',
    purchasePrice: 1500,
    initialQty: 200,
    remainingQty: 45,
    receivedDate: '2025-11-10',
    expiryDate: '2026-11-10',
  },
  {
    id: 'batch-002',
    productId: 'prod-001',
    purchasePrice: 1600,
    initialQty: 150,
    remainingQty: 150,
    receivedDate: '2025-12-20',
    expiryDate: '2026-12-20',
  },
  {
    id: 'batch-003',
    productId: 'prod-001',
    purchasePrice: 1700,
    initialQty: 180,
    remainingQty: 180,
    receivedDate: '2026-01-25',
    expiryDate: '2027-01-25',
  },

  // Table Salt 1kg (prod-002) - 3 batches
  {
    id: 'batch-004',
    productId: 'prod-002',
    purchasePrice: 12,
    initialQty: 500,
    remainingQty: 120,
    receivedDate: '2025-10-05',
    expiryDate: '2028-10-05',
  },
  {
    id: 'batch-005',
    productId: 'prod-002',
    purchasePrice: 14,
    initialQty: 400,
    remainingQty: 400,
    receivedDate: '2025-12-10',
    expiryDate: '2028-12-10',
  },
  {
    id: 'batch-006',
    productId: 'prod-002',
    purchasePrice: 15,
    initialQty: 300,
    remainingQty: 300,
    receivedDate: '2026-02-01',
    expiryDate: '2029-02-01',
  },

  // White Sugar 5kg (prod-003) - 3 batches
  {
    id: 'batch-007',
    productId: 'prod-003',
    purchasePrice: 190,
    initialQty: 150,
    remainingQty: 28,
    receivedDate: '2025-10-15',
    expiryDate: '2027-10-15',
  },
  {
    id: 'batch-008',
    productId: 'prod-003',
    purchasePrice: 205,
    initialQty: 200,
    remainingQty: 200,
    receivedDate: '2025-12-22',
    expiryDate: '2027-12-22',
  },
  {
    id: 'batch-009',
    productId: 'prod-003',
    purchasePrice: 215,
    initialQty: 120,
    remainingQty: 120,
    receivedDate: '2026-01-30',
    expiryDate: '2028-01-30',
  },

  // Cooking Gas 14kg (prod-004) - 2 batches
  {
    id: 'batch-010',
    productId: 'prod-004',
    purchasePrice: 720,
    initialQty: 80,
    remainingQty: 22,
    receivedDate: '2025-11-20',
  },
  {
    id: 'batch-011',
    productId: 'prod-004',
    purchasePrice: 780,
    initialQty: 100,
    remainingQty: 100,
    receivedDate: '2026-01-15',
  },

  // Red Lentils 5kg (prod-005) - 3 batches
  {
    id: 'batch-012',
    productId: 'prod-005',
    purchasePrice: 380,
    initialQty: 180,
    remainingQty: 40,
    receivedDate: '2025-10-01',
    expiryDate: '2026-10-01',
  },
  {
    id: 'batch-013',
    productId: 'prod-005',
    purchasePrice: 400,
    initialQty: 150,
    remainingQty: 150,
    receivedDate: '2025-12-15',
    expiryDate: '2026-12-15',
  },
  {
    id: 'batch-014',
    productId: 'prod-005',
    purchasePrice: 420,
    initialQty: 100,
    remainingQty: 100,
    receivedDate: '2026-02-05',
    expiryDate: '2027-02-05',
  },

  // Vegetable Oil 5L (prod-006) - 2 batches
  {
    id: 'batch-015',
    productId: 'prod-006',
    purchasePrice: 480,
    initialQty: 120,
    remainingQty: 35,
    receivedDate: '2025-11-05',
    expiryDate: '2026-11-05',
  },
  {
    id: 'batch-016',
    productId: 'prod-006',
    purchasePrice: 520,
    initialQty: 150,
    remainingQty: 150,
    receivedDate: '2026-01-18',
    expiryDate: '2027-01-18',
  },

  // Wheat Flour 10kg (prod-007) - 2 batches
  {
    id: 'batch-017',
    productId: 'prod-007',
    purchasePrice: 320,
    initialQty: 160,
    remainingQty: 50,
    receivedDate: '2025-10-20',
    expiryDate: '2026-07-20',
  },
  {
    id: 'batch-018',
    productId: 'prod-007',
    purchasePrice: 350,
    initialQty: 120,
    remainingQty: 120,
    receivedDate: '2026-01-08',
    expiryDate: '2026-10-08',
  },

  // Yellow Lentils 5kg (prod-008) - 2 batches
  {
    id: 'batch-019',
    productId: 'prod-008',
    purchasePrice: 460,
    initialQty: 100,
    remainingQty: 30,
    receivedDate: '2025-10-28',
    expiryDate: '2026-10-28',
  },
  {
    id: 'batch-020',
    productId: 'prod-008',
    purchasePrice: 490,
    initialQty: 80,
    remainingQty: 80,
    receivedDate: '2026-01-22',
    expiryDate: '2027-01-22',
  },
];

export const storeStocks: StoreStock[] = [
  // Basmati Rice - distributed across HQs and retail
  { storeId: 'hq-ktm', batchId: 'batch-001', currentQty: 10 },
  { storeId: 'hq-brt', batchId: 'batch-001', currentQty: 5 },
  { storeId: 'hq-brg', batchId: 'batch-001', currentQty: 5 },
  { storeId: 'store-01', batchId: 'batch-001', currentQty: 15 },
  { storeId: 'store-02', batchId: 'batch-001', currentQty: 10 },

  { storeId: 'hq-ktm', batchId: 'batch-002', currentQty: 40 },
  { storeId: 'hq-brt', batchId: 'batch-002', currentQty: 20 },
  { storeId: 'hq-bhw', batchId: 'batch-002', currentQty: 15 },
  { storeId: 'hq-btm', batchId: 'batch-002', currentQty: 15 },
  { storeId: 'store-01', batchId: 'batch-002', currentQty: 30 },
  { storeId: 'store-02', batchId: 'batch-002', currentQty: 30 },

  { storeId: 'hq-ktm', batchId: 'batch-003', currentQty: 50 },
  { storeId: 'hq-brt', batchId: 'batch-003', currentQty: 20 },
  { storeId: 'hq-npg', batchId: 'batch-003', currentQty: 15 },
  { storeId: 'hq-dhg', batchId: 'batch-003', currentQty: 15 },
  { storeId: 'store-01', batchId: 'batch-003', currentQty: 40 },
  { storeId: 'store-03', batchId: 'batch-003', currentQty: 40 },

  // Table Salt
  { storeId: 'hq-ktm', batchId: 'batch-004', currentQty: 20 },
  { storeId: 'hq-brg', batchId: 'batch-004', currentQty: 15 },
  { storeId: 'hq-bhw', batchId: 'batch-004', currentQty: 15 },
  { storeId: 'store-01', batchId: 'batch-004', currentQty: 40 },
  { storeId: 'store-02', batchId: 'batch-004', currentQty: 30 },

  { storeId: 'hq-ktm', batchId: 'batch-005', currentQty: 100 },
  { storeId: 'hq-brt', batchId: 'batch-005', currentQty: 50 },
  { storeId: 'hq-btm', batchId: 'batch-005', currentQty: 50 },
  { storeId: 'store-01', batchId: 'batch-005', currentQty: 100 },
  { storeId: 'store-03', batchId: 'batch-005', currentQty: 100 },

  { storeId: 'hq-ktm', batchId: 'batch-006', currentQty: 100 },
  { storeId: 'hq-npg', batchId: 'batch-006', currentQty: 40 },
  { storeId: 'hq-dhg', batchId: 'batch-006', currentQty: 40 },
  { storeId: 'store-01', batchId: 'batch-006', currentQty: 60 },
  { storeId: 'store-02', batchId: 'batch-006', currentQty: 60 },

  // White Sugar
  { storeId: 'hq-ktm', batchId: 'batch-007', currentQty: 5 },
  { storeId: 'hq-brt', batchId: 'batch-007', currentQty: 5 },
  { storeId: 'store-01', batchId: 'batch-007', currentQty: 10 },
  { storeId: 'store-02', batchId: 'batch-007', currentQty: 8 },

  { storeId: 'hq-ktm', batchId: 'batch-008', currentQty: 50 },
  { storeId: 'hq-brg', batchId: 'batch-008', currentQty: 25 },
  { storeId: 'hq-bhw', batchId: 'batch-008', currentQty: 25 },
  { storeId: 'store-01', batchId: 'batch-008', currentQty: 50 },
  { storeId: 'store-03', batchId: 'batch-008', currentQty: 50 },

  { storeId: 'hq-ktm', batchId: 'batch-009', currentQty: 30 },
  { storeId: 'hq-npg', batchId: 'batch-009', currentQty: 20 },
  { storeId: 'hq-btm', batchId: 'batch-009', currentQty: 20 },
  { storeId: 'store-02', batchId: 'batch-009', currentQty: 50 },

  // Cooking Gas
  { storeId: 'hq-ktm', batchId: 'batch-010', currentQty: 4 },
  { storeId: 'hq-brt', batchId: 'batch-010', currentQty: 6 },
  { storeId: 'store-01', batchId: 'batch-010', currentQty: 6 },
  { storeId: 'store-02', batchId: 'batch-010', currentQty: 6 },

  { storeId: 'hq-ktm', batchId: 'batch-011', currentQty: 30 },
  { storeId: 'hq-dhg', batchId: 'batch-011', currentQty: 10 },
  { storeId: 'hq-npg', batchId: 'batch-011', currentQty: 10 },
  { storeId: 'store-01', batchId: 'batch-011', currentQty: 25 },
  { storeId: 'store-03', batchId: 'batch-011', currentQty: 25 },

  // Red Lentils
  { storeId: 'hq-ktm', batchId: 'batch-012', currentQty: 5 },
  { storeId: 'hq-bhw', batchId: 'batch-012', currentQty: 5 },
  { storeId: 'hq-btm', batchId: 'batch-012', currentQty: 5 },
  { storeId: 'store-01', batchId: 'batch-012', currentQty: 15 },
  { storeId: 'store-02', batchId: 'batch-012', currentQty: 10 },

  { storeId: 'hq-ktm', batchId: 'batch-013', currentQty: 40 },
  { storeId: 'hq-brt', batchId: 'batch-013', currentQty: 20 },
  { storeId: 'hq-brg', batchId: 'batch-013', currentQty: 20 },
  { storeId: 'store-01', batchId: 'batch-013', currentQty: 35 },
  { storeId: 'store-03', batchId: 'batch-013', currentQty: 35 },

  { storeId: 'hq-ktm', batchId: 'batch-014', currentQty: 30 },
  { storeId: 'hq-dhg', batchId: 'batch-014', currentQty: 15 },
  { storeId: 'hq-npg', batchId: 'batch-014', currentQty: 15 },
  { storeId: 'store-01', batchId: 'batch-014', currentQty: 20 },
  { storeId: 'store-02', batchId: 'batch-014', currentQty: 20 },

  // Vegetable Oil
  { storeId: 'hq-ktm', batchId: 'batch-015', currentQty: 5 },
  { storeId: 'hq-brt', batchId: 'batch-015', currentQty: 5 },
  { storeId: 'hq-btm', batchId: 'batch-015', currentQty: 5 },
  { storeId: 'store-01', batchId: 'batch-015', currentQty: 10 },
  { storeId: 'store-02', batchId: 'batch-015', currentQty: 10 },

  { storeId: 'hq-ktm', batchId: 'batch-016', currentQty: 40 },
  { storeId: 'hq-brg', batchId: 'batch-016', currentQty: 20 },
  { storeId: 'hq-bhw', batchId: 'batch-016', currentQty: 20 },
  { storeId: 'store-01', batchId: 'batch-016', currentQty: 35 },
  { storeId: 'store-03', batchId: 'batch-016', currentQty: 35 },

  // Wheat Flour
  { storeId: 'hq-ktm', batchId: 'batch-017', currentQty: 10 },
  { storeId: 'hq-brt', batchId: 'batch-017', currentQty: 5 },
  { storeId: 'hq-npg', batchId: 'batch-017', currentQty: 5 },
  { storeId: 'store-01', batchId: 'batch-017', currentQty: 15 },
  { storeId: 'store-02', batchId: 'batch-017', currentQty: 15 },

  { storeId: 'hq-ktm', batchId: 'batch-018', currentQty: 35 },
  { storeId: 'hq-dhg', batchId: 'batch-018', currentQty: 15 },
  { storeId: 'hq-btm', batchId: 'batch-018', currentQty: 20 },
  { storeId: 'store-01', batchId: 'batch-018', currentQty: 25 },
  { storeId: 'store-03', batchId: 'batch-018', currentQty: 25 },

  // Yellow Lentils
  { storeId: 'hq-ktm', batchId: 'batch-019', currentQty: 6 },
  { storeId: 'hq-bhw', batchId: 'batch-019', currentQty: 6 },
  { storeId: 'store-01', batchId: 'batch-019', currentQty: 10 },
  { storeId: 'store-02', batchId: 'batch-019', currentQty: 8 },

  { storeId: 'hq-ktm', batchId: 'batch-020', currentQty: 25 },
  { storeId: 'hq-brt', batchId: 'batch-020', currentQty: 10 },
  { storeId: 'hq-brg', batchId: 'batch-020', currentQty: 10 },
  { storeId: 'store-01', batchId: 'batch-020', currentQty: 20 },
  { storeId: 'store-03', batchId: 'batch-020', currentQty: 15 },
];
