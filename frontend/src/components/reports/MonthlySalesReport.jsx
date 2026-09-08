import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useMonthlySalesReport } from '../../hooks/useReports';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const MonthlySalesReport = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  const { data: monthlyData, isLoading, isError, error, refetch } = useMonthlySalesReport({ year });

  console.log('Monthly Sales Debug:', { monthlyData, isLoading, isError, error, year });

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
      'Orders': monthData.total_orders || 0,
      'Items Sold': monthData.total_items_sold || 0,
      'Total Sales': parseFloat(monthData.total_grand_total || 0).toFixed(2),
      'Tax': parseFloat(monthData.total_tax || 0).toFixed(2),
      'Discount': parseFloat(monthData.total_discount || 0).toFixed(2)
    }));

    const totals = {
      'Month': 'TOTAL',
      'Orders': monthlyData.reduce((sum, m) => sum + (m.total_orders || 0), 0),
      'Items Sold': monthlyData.reduce((sum, m) => sum + (m.total_items_sold || 0), 0),
      'Total Sales': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_grand_total || 0), 0).toFixed(2),
      'Tax': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_tax || 0), 0).toFixed(2),
      'Discount': monthlyData.reduce((sum, m) => sum + parseFloat(m.total_discount || 0), 0).toFixed(2)
    };
    excelData.push(totals);

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Sales');
    XLSX.writeFile(wb, `Monthly_Sales_${year}.xlsx`);
  };

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
            Total Months with Sales: {stats.monthsWithSales}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyData?.map((monthData) => {
              const monthName = MONTH_NAMES[monthData.sale_month - 1];
              const hasSales = monthData.total_orders > 0;
              
              return (
                <div
                  key={monthData.sale_month}
                  className={`border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-lg`}
                >
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-0">{monthName}</h5>
                  </div>
                  <div className="p-4">
                    {hasSales ? (
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{monthData.total_orders}</div>
                          <div className="text-xs text-gray-500">Orders</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-success">{monthData.total_items_sold}</div>
                          <div className="text-xs text-gray-500">Items</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-lg font-bold text-warning">{formatCurrency(monthData.total_grand_total)}</div>
                          <div className="text-xs text-gray-500">Total Sales</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-info">{formatCurrency(monthData.total_tax)}</div>
                          <div className="text-xs text-gray-500">Tax</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-danger">{formatCurrency(monthData.total_discount)}</div>
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
        )}
      </div>
    </div>
  );
};