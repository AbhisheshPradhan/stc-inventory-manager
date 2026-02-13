import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/format';
import { SaleEntryModal } from './SaleEntryModal';

export function SalesPage() {
  const { transactions, stores, products } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sales Transactions</h2>
          <p className="text-sm text-slate-500 mt-1">
            {transactions.length} total transactions
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Record Sale
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-8" />
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Store
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                  Qty
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                  COGS
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => {
                const store = stores.find((s) => s.id === txn.storeId);
                const product = products.find((p) => p.id === txn.productId);
                const isExpanded = expandedTxn === txn.id;

                return (
                  <>
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() =>
                        setExpandedTxn(isExpanded ? null : txn.id)
                      }
                    >
                      <td className="px-3 sm:px-6 py-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm font-mono text-slate-600 hidden md:table-cell">
                        {txn.id}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-600">
                        {formatDate(txn.transactionDate)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 hidden sm:table-cell">
                        {store?.name ?? txn.storeId}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900">
                        {product?.name ?? txn.productId}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden sm:table-cell">
                        {txn.qtySold}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right">
                        {formatCurrency(txn.totalRevenue)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-sm text-slate-900 text-right hidden md:table-cell">
                        {formatCurrency(txn.totalCOGS)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 text-right">
                        <Badge
                          variant={
                            txn.marginPercent >= 45
                              ? 'success'
                              : txn.marginPercent >= 30
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {formatCurrency(txn.totalMargin)} ({txn.marginPercent.toFixed(1)}%)
                        </Badge>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${txn.id}-detail`}>
                        <td colSpan={9} className="bg-slate-50 px-6 py-4">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">
                            FIFO Batch Breakdown
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-slate-200">
                                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                                    Batch
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                                    Qty
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                                    Purchase Price
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                                    Selling Price
                                  </th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">
                                    Line Margin
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {txn.batchItems.map((item) => (
                                  <tr key={item.batchId}>
                                    <td className="px-4 py-2 text-sm font-mono text-slate-600">
                                      {item.batchId}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                      {item.qtyFromBatch}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                      {formatCurrency(item.purchasePricePerUnit)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-slate-900 text-right">
                                      {formatCurrency(item.sellingPricePerUnit)}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-emerald-600 text-right">
                                      {formatCurrency(item.lineMargin)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SaleEntryModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
