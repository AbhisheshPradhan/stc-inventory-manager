import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from '@/context/InventoryContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewPage } from '@/components/dashboard/OverviewPage';
import { ProductsPage } from '@/components/products/ProductsPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { StoresPage } from '@/components/stores/StoresPage';
import { SalesPage } from '@/components/sales/SalesPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { HQManagerPage } from '@/components/hq/HQManagerPage';
import { SellerPOSDashboard } from '@/components/pos/SellerPOSDashboard';
import { ExecutiveAnalyticsDashboard } from '@/components/analytics/ExecutiveAnalyticsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="hq" element={<HQManagerPage />} />
            <Route path="pos" element={<SellerPOSDashboard />} />
            <Route path="analytics" element={<ExecutiveAnalyticsDashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </InventoryProvider>
    </BrowserRouter>
  );
}
