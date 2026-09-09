import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, TrendingUp, Calendar, BarChart3, Download, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getOrders } from '../services/api/orders';
import { DailySalesReport } from '../components/reports/DailySalesReport';
import { MonthlySalesReport } from '../components/reports/MonthlySalesReport';

const TABS = [
  { id: 'all', label: 'All Sales', icon: TrendingUp },
  { id: 'daily', label: 'Daily Sales', icon: Calendar },
  { id: 'monthly', label: 'Monthly Sales', icon: BarChart3 }
];

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getPaymentStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'partial': return 'bg-blue-100 text-blue-800';
    case 'failed':
    case 'due': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const Reports = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    invoice_no: '',
    payment_status: ''
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['reports', 'allSales', filters, page],
    queryFn: () => getOrders({
      ...filters,
      page,
      limit,
      date_from: filters.start_date || undefined,
      date_to: filters.end_date || undefined,
      payment_status: filters.payment_status || undefined
    }),
    keepPreviousData: true
  });

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      invoice_no: '',
      payment_status: ''
    });
    setPage(1);
  };

  const handleExportExcel = () => {
    if (!ordersData?.orders || ordersData.orders.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = ordersData.orders.map(order => {
      const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalAmount = order.total_amount || 0;
      const amount = order.subtotal || 0;
      const gstAmount = order.tax_amount || 0;
      const paymentStatus = order.payments?.[0]?.status || 'PENDING';
      
      return {
        'Date': formatDate(order.created_at),
        'Invoice No': order.invoice_no || '-',
        'Items': totalItems,
        'Total': totalAmount.toFixed(2),
        'Amount': amount.toFixed(2),
        'GST': gstAmount.toFixed(2),
        'Status': order.status,
        'Payment': paymentStatus
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Sales');
    XLSX.writeFile(wb, `All_Sales_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    const contentEl = document.getElementById('reports-print-area');
    if (!contentEl) { window.print(); return; }
    const printHtml = `
      <!DOCTYPE html><html><head>
        <title>All Sales Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 13px; color: #000; }
          h1 { font-size: 18px; margin-bottom: 4px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; border: 1px solid #e5e7eb; }
          td { padding: 6px 10px; border: 1px solid #e5e7eb; font-size: 12px; }
          .right { text-align: right; } .center { text-align: center; }
          @media print { body { margin: 0; } }
        </style>
      </head><body>
        <h1>All Sales Report</h1>
        <p style="color: #555; margin-bottom: 16px; font-size: 12px; text-align: center;">Printed on: ${new Date().toLocaleString('en-IN')}</p>
        ${contentEl.innerHTML}
      </body></html>`;
    const pw = window.open('', '_blank', 'width=1200,height=700');
    pw.document.write(printHtml);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 500);
  };

  const totalPages = ordersData?.meta?.totalPages || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">View and analyze your business performance</p>
        </div>
        {activeTab === 'all' && (
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-modern"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-modern"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </button>
          </div>
        )}
      </div>

      <div className="print:hidden">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div id="reports-print-area" className="print:shadow-none print:border-none print:p-0">
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Filters Section - Matching PHP all_sales.php */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice No</label>
                  <input
                    type="text"
                    value={filters.invoice_no}
                    onChange={(e) => handleFilterChange('invoice_no', e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={filters.payment_status}
                    onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">All</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="due">Due</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => refetch()}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            {ordersData?.meta?.total > 0 && (
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, ordersData.meta.total)} of {ordersData.meta.total} entries
                {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
              </div>
            )}

            {/* Sales Table - Matching PHP all_sales.php */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount + GST</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
                    ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center">
                          <div className="text-gray-400">
                            <div className="text-4xl mb-2">📋</div>
                            <p className="text-sm">No sales found</p>
                            <p className="text-xs mt-1">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ordersData.orders.map((order) => {
                        const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                        const totalAmount = order.total_amount || 0;
                        const amount = order.subtotal || 0;
                        const gstAmount = order.tax_amount || 0;
                        const paymentStatus = order.payments?.[0]?.status || 'PENDING';
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div>{formatDate(order.created_at)}</div>
                              <small className="text-gray-500">{formatTime(order.created_at)}</small>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{order.invoice_no || order.order_number || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{totalItems}</td>
                            <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">{formatCurrency(totalAmount)}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <div className="font-medium text-gray-900">Amount: {formatCurrency(amount)}</div>
                              <div className="text-xs text-indigo-600">GST: {formatCurrency(gstAmount)}</div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(paymentStatus)}`}>
                                {paymentStatus.toLowerCase()}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'daily' && <DailySalesReport />}
        {activeTab === 'monthly' && <MonthlySalesReport />}
      </div>
    </div>
  );
};