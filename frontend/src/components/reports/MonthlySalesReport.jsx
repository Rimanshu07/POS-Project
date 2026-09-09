import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, ArrowLeft, TrendingUp, ShoppingBag, Tag, Receipt, X } from 'lucide-react';
import { useMonthlySalesReport, useMonthlyProductDetails } from '../../hooks/useReports';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ─── Monthly Product Detail View ──────────────────────────────────────────

const MonthProductDetailView = ({ year, month, monthData, onBack }) => {
  const { data: products, isLoading, isError, error } = useMonthlyProductDetails({ year, month });

  const productsByCategory = useMemo(() => {
    if (!products) return {};
    const grouped = {};
    products.forEach(product => {
      const category = product.category_name || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(product);
    });
    return grouped;
  }, [products]);

  const totals = useMemo(() => {
    if (!products) return { totalQuantity: 0, totalSales: 0, totalProducts: 0, totalCategories: 0 };
    return {
      totalQuantity: products.reduce((s, p) => s + p.total_quantity, 0),
      totalSales: products.reduce((s, p) => s + p.total_amount, 0),
      totalProducts: new Set(products.map(p => p.product_name)).size,
      totalCategories: Object.keys(productsByCategory).length
    };
  }, [products, productsByCategory]);

  const handleDownloadExcel = () => {
    if (!products || products.length === 0) return;
    const excelData = products.map(p => ({
      'Category': p.category_name,
      'Product': p.product_name,
      'Orders': p.order_count,
      'Quantity': p.total_quantity,
      'Avg Price': parseFloat(p.avg_price).toFixed(2),
      'Total Amount': parseFloat(p.total_amount).toFixed(2)
    }));
    const totalRow = {
      'Category': 'TOTAL',
      'Product': `${totals.totalProducts} products`,
      'Orders': '-',
      'Quantity': totals.totalQuantity,
      'Avg Price': '-',
      'Total Amount': totals.totalSales.toFixed(2)
    };
    excelData.push(totalRow);
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${MONTH_NAMES[month - 1]} ${year}`);
    XLSX.writeFile(wb, `Products_${MONTH_NAMES[month - 1]}_${year}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {MONTH_NAMES[month - 1]} {year} — Product Sales Details
            </h2>
            <p className="text-sm text-gray-500">Product-wise breakdown for the month</p>
          </div>
        </div>
        <button
          onClick={handleDownloadExcel}
          disabled={!products?.length}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700">{totals.totalQuantity.toFixed(0)}</div>
          <div className="text-xs font-medium text-indigo-500 mt-1">Items Sold</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{totals.totalProducts}</div>
          <div className="text-xs font-medium text-green-500 mt-1">Products</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{totals.totalCategories}</div>
          <div className="text-xs font-medium text-amber-500 mt-1">Categories</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(totals.totalSales)}</div>
          <div className="text-xs font-medium text-blue-500 mt-1">Total Sales</div>
        </div>
      </div>

      {/* Product Breakdown by Category */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Product Sales Breakdown</h3>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-sm">Loading product details...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-sm">Error loading product details</p>
            <p className="text-xs mt-1">{error?.message || 'Please try again'}</p>
          </div>
        ) : Object.keys(productsByCategory).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm">No products sold in this month</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => {
              const categoryTotal = categoryProducts.reduce((s, p) => s + p.total_amount, 0);
              const categoryQty = categoryProducts.reduce((s, p) => s + p.total_quantity, 0);
              return (
                <div key={category} className="p-5">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    {category}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Product</th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Orders</th>
                          <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Avg Price</th>
                          <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {categoryProducts.map((product, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{product.product_name}</td>
                            <td className="px-4 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                {product.order_count}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-700">{product.total_quantity}</td>
                            <td className="px-4 py-2 text-right text-sm text-gray-600">{formatCurrency(product.avg_price)}</td>
                            <td className="px-4 py-2 text-right text-sm font-bold text-green-700">{formatCurrency(product.total_amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-sm font-bold text-gray-900">
                            Category Total
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-bold text-gray-700">{categoryQty}</td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-right text-sm font-bold text-green-700">{formatCurrency(categoryTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Monthly Summary Grid ────────────────────────────────────────────────────

export const MonthlySalesReport = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  const { data: monthlyData, isLoading, isError, error, refetch } = useMonthlySalesReport({ year });

  const stats = useMemo(() => {
    if (!monthlyData) return { monthsWithSales: 0 };
    return {
      monthsWithSales: monthlyData.filter(m => m.total_orders > 0).length
    };
  }, [monthlyData]);

  const prevYear = () => setYear(year - 1);
  const nextYear = () => setYear(year + 1);

  const handleDownloadExcel = () => {
    if (!monthlyData) return;
    const excelData = monthlyData.map(monthData => ({
      'Month': MONTH_NAMES[monthData.sale_month - 1],
      'Orders': monthData.total_orders,
      'Items Sold': monthData.total_items_sold,
      'Total Sales': parseFloat(monthData.total_grand_total).toFixed(2),
      'Tax': parseFloat(monthData.total_tax).toFixed(2),
      'Discount': parseFloat(monthData.total_discount).toFixed(2)
    }));
    const totals = {
      'Month': 'TOTAL',
      'Orders': monthlyData.reduce((sum, m) => sum + m.total_orders, 0),
      'Items Sold': monthlyData.reduce((sum, m) => sum + m.total_items_sold, 0),
      'Total Sales': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_grand_total), 0).toFixed(2),
      'Tax': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_tax), 0).toFixed(2),
      'Discount': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_discount), 0).toFixed(2)
    };
    excelData.push(totals);
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Sales');
    XLSX.writeFile(wb, `Monthly_Sales_${year}.xlsx`);
  };

  // Drill-down view
  if (selectedMonth) {
    return (
      <MonthProductDetailView
        year={year}
        month={selectedMonth.month}
        monthData={selectedMonth.monthData}
        onBack={() => setSelectedMonth(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          <i className="fas fa-chart-bar me-2"></i>Monthly Sales Report
        </h2>
        <button
          onClick={handleDownloadExcel}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Excel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={prevYear} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
              Year {year}
            </h3>
            <button onClick={nextYear} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total Months with Sales: <span className="font-semibold text-indigo-600">{stats.monthsWithSales}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading monthly sales data</p>
            <p className="text-sm mt-2">{error?.message || 'Please try again'}</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Retry
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">Click on any month to see product-wise sales details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {monthlyData?.map((monthData) => {
                const monthName = MONTH_NAMES[monthData.sale_month - 1];
                const hasSales = monthData.total_orders > 0;

                return (
                  <div
                    key={monthData.sale_month}
                    onClick={() => setSelectedMonth({ month: monthData.sale_month, monthData })}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      hasSales
                        ? 'border-indigo-200 hover:shadow-lg hover:border-indigo-400 cursor-pointer hover:-translate-y-0.5'
                        : 'border-gray-200 hover:shadow-md hover:border-gray-300 cursor-pointer'
                    }`}
                  >
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${hasSales ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'}`}>
                      <h5 className="font-semibold text-gray-900">{monthName}</h5>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        hasSales ? 'text-indigo-600 bg-indigo-100' : 'text-gray-500 bg-gray-200'
                      }`}>
                        {hasSales ? 'View Details →' : 'View →'}
                      </span>
                    </div>
                    <div className="p-4">
                      {hasSales ? (
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <div className="text-lg font-bold text-indigo-600">{monthData.total_orders}</div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-600">{monthData.total_items_sold}</div>
                            <div className="text-xs text-gray-500">Items</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-lg font-bold text-green-700">{formatCurrency(monthData.total_grand_total)}</div>
                            <div className="text-xs text-gray-500">Total Sales</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-amber-600">{formatCurrency(monthData.total_tax)}</div>
                            <div className="text-xs text-gray-500">Tax</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-600">{formatCurrency(monthData.total_discount)}</div>
                            <div className="text-xs text-gray-500">Discount</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-6">
                          <div className="text-3xl mb-2">📊</div>
                          <p className="text-sm">No Sales</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
