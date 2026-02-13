import type { Store, CashHolding } from '@/types';

export const stores: Store[] = [
  // Main HQ
  {
    id: 'hq-ktm',
    name: 'Kathmandu HQ',
    isWarehouse: true,
    storeType: 'mainHQ',
    location: 'Balaju Industrial District, Kathmandu',
  },
  // Provincial HQs
  {
    id: 'hq-brt',
    name: 'Biratnagar HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Main Road, Biratnagar',
  },
  {
    id: 'hq-brg',
    name: 'Birgunj HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Adarsha Nagar, Birgunj',
  },
  {
    id: 'hq-bhw',
    name: 'Bhairawa HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Siddharthanagar, Bhairawa',
  },
  {
    id: 'hq-dhg',
    name: 'Dhangadi HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Hasanpur, Dhangadi',
  },
  {
    id: 'hq-npg',
    name: 'Nepalgunj HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Surkhet Road, Nepalgunj',
  },
  {
    id: 'hq-btm',
    name: 'Birtamode HQ',
    isWarehouse: true,
    storeType: 'provincialHQ',
    location: 'Birtamode Chowk, Jhapa',
  },
  // Retail Stores / Dealers
  {
    id: 'store-01',
    name: 'New Road Store',
    isWarehouse: false,
    storeType: 'retail',
    location: 'New Road, Kathmandu',
  },
  {
    id: 'store-02',
    name: 'Patan Store',
    isWarehouse: false,
    storeType: 'retail',
    location: 'Mangal Bazaar, Lalitpur',
  },
  {
    id: 'store-03',
    name: 'Bhaktapur Store',
    isWarehouse: false,
    storeType: 'retail',
    location: 'Durbar Square, Bhaktapur',
  },
];

export const cashHoldings: CashHolding[] = [
  { storeId: 'hq-ktm', balance: 250000 },
  { storeId: 'hq-brt', balance: 0 },
  { storeId: 'hq-brg', balance: 0 },
  { storeId: 'hq-bhw', balance: 0 },
  { storeId: 'hq-dhg', balance: 0 },
  { storeId: 'hq-npg', balance: 0 },
  { storeId: 'hq-btm', balance: 0 },
  { storeId: 'store-01', balance: 15000 },
  { storeId: 'store-02', balance: 8500 },
  { storeId: 'store-03', balance: 5000 },
];
