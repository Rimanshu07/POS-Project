import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, X, Search, Filter } from 'lucide-react';
import { useDailyProductDetails, useDailySalesReport } from '../../hooks/useReports';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/api/orders';
import { OrderDetailsModal } from '../orders/OrderDetailsModal';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return '₹' + num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const DailySalesReport = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeModalTab, setActiveModalTab] = useState('products');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const { data: calendarData, isLoading } = useDailySalesReport({ year, month });
  const { data: productDetails = [], isLoading: isDetailsLoading } = useDailyProductDetails(
    { date: selectedDate },
    Boolean(selectedDate)
  );

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['dailySalesOrders', selectedDate],
    queryFn: () => getOrders({
      date_from: selectedDate,
      date_to: selectedDate,
      limit: 1000 // Get all orders for the day
    }),
    enabled: Boolean(selectedDate && activeModalTab === 'orders'),
    keepPreviousData: true
  });

  const filteredProductDetails = useMemo(() => {
    if (!productSearch) return productDetails;
    const lowerSearch = productSearch.toLowerCase();
    return productDetails.filter(p => 
      p.product_name.toLowerCase().includes(lowerSearch) || 
      (p.category_name && p.category_name.toLowerCase().includes(lowerSearch))
    );
  }, [productDetails, productSearch]);

  const filteredOrders = useMemo(() => {
    if (!ordersData?.orders) return [];
    let filtered = ordersData.orders;
    
    if (orderSearch) {
      const lowerSearch = orderSearch.toLowerCase();
      filtered = filtered.filter(o => 
        (o.invoice_no && o.invoice_no.toLowerCase().includes(lowerSearch)) ||
        (o.order_number && o.order_number.toLowerCase().includes(lowerSearch))
      );
    }
    
    if (orderStatusFilter !== 'ALL') {
      filtered = filtered.filter(o => {
        const totalAmount = parseFloat(o.total_amount || 0);
        const totalPaid = o.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        
        let paymentStatus = 'PENDING';
        if (totalPaid > 0 && totalPaid < totalAmount) {
          paymentStatus = 'PARTIAL';
        } else if (totalPaid >= totalAmount) {
          paymentStatus = 'PAID';
        }
        
        return paymentStatus === orderStatusFilter;
      });
    }
    
    return filtered;
  }, [ordersData, orderSearch, orderStatusFilter]);

  const selectedDayData = useMemo(() => {
    if (!calendarData || !selectedDate) return null;
    return calendarData.find(d => d.date === selectedDate)?.sale_data;
  }, [calendarData, selectedDate]);

  const calendar = useMemo(() => {
    if (!calendarData) return [];
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = calendarData.find(d => d.date === dateStr);
      currentWeek.push(dayData || { date: dateStr, day, sale_data: null });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [calendarData, year, month]);

  const stats = useMemo(() => {
    if (!calendarData) return { daysWithSales: 0, totalSales: 0 };
    const daysWithSales = calendarData.filter(d => d.sale_data).length;
    const totalSales = calendarData.reduce((sum, d) => sum + (d.sale_data?.total_grand_total || 0), 0);
    return { daysWithSales, totalSales };
  }, [calendarData]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDownloadExcel = () => {
    if (!calendarData) return;
    
    const filteredData = calendarData.filter(d => d.sale_data);
    const excelData = filteredData.map(day => {
      const gross = parseFloat(day.sale_data.total_gross_sale);
      const discount = parseFloat(day.sale_data.total_discount);
      const tax = parseFloat(day.sale_data.total_tax);
      const total = parseFloat(day.sale_data.total_grand_total);
      const roundOff = total - (gross - discount + tax);
      
      return {
        'Date': day.date,
        'Gross Sale': gross.toFixed(2),
        'Discount': discount.toFixed(2),
        'Tax': tax.toFixed(2),
        'Round Off': roundOff.toFixed(2),
        'Total': total.toFixed(2),
        'Paid': parseFloat(day.sale_data.total_paid || 0).toFixed(2),
        'Due': (total - parseFloat(day.sale_data.total_paid || 0)).toFixed(2),
        'Orders': day.sale_data.total_orders,
        'Items Sold': day.sale_data.total_items_sold
      };
    });

    const totalGross = filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_gross_sale), 0);
    const totalDiscount = filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_discount), 0);
    const totalTax = filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_tax), 0);
    const totalGrand = filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_grand_total), 0);
    const totalPaid = filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_paid || 0), 0);
    
    const totalRow = {
      'Date': 'TOTAL',
      'Gross Sale': totalGross.toFixed(2),
      'Discount': totalDiscount.toFixed(2),
      'Tax': totalTax.toFixed(2),
      'Round Off': (totalGrand - (totalGross - totalDiscount + totalTax)).toFixed(2),
      'Total': totalGrand.toFixed(2),
      'Paid': totalPaid.toFixed(2),
      'Due': (totalGrand - totalPaid).toFixed(2),
      'Orders': filteredData.reduce((sum, day) => sum + parseInt(day.sale_data.total_orders), 0),
      'Items Sold': filteredData.reduce((sum, day) => sum + parseInt(day.sale_data.total_items_sold), 0)
    };

    excelData.push(totalRow);
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wscols = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }
    ];
    ws['!cols'] = wscols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `Daily_Sales_${MONTH_NAMES[month - 1]}_${year}.xlsx`);
  };

  const handleDownloadDetails = () => {
    if (!productDetails.length) return;
    const rows = productDetails.map(product => {
      const isVat = (product.tax_type || '').toUpperCase() === 'VAT';
      const contribution = selectedDayData && selectedDayData.total_grand_total > 0 
        ? ((product.total_amount / selectedDayData.total_grand_total) * 100).toFixed(1) 
        : 0;
      return {
        'Product Name': product.product_name,
        'Category': product.category_name || 'Uncategorized',
        'Orders': product.order_count || 0,
        'Average Price': Number(product.avg_price || 0).toFixed(2),
        'Quantity': Number(product.total_quantity || 0).toFixed(2),
        'Gross Amount': Number(product.gross_amount || 0).toFixed(2),
        'Discount': product.discount_amount > 0 ? `-${Number(product.discount_amount).toFixed(2)}` : '-',
        'CGST': isVat ? '-' : `${Number(product.tax_rate / 2 || 0).toFixed(2)}% (₹${Number(product.tax_amount / 2 || 0).toFixed(2)})`,
        'SGST': isVat ? '-' : `${Number(product.tax_rate / 2 || 0).toFixed(2)}% (₹${Number(product.tax_amount / 2 || 0).toFixed(2)})`,
        'VAT': isVat ? `${Number(product.tax_rate || 0).toFixed(2)}% (₹${Number(product.tax_amount || 0).toFixed(2)})` : '-',
        'Net Amount': Number(product.total_amount || 0).toFixed(2),
        '% Cont.': `${contribution}%`
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Details');
    XLSX.writeFile(workbook, `Daily_Sales_Details_${selectedDate}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          <i className="fas fa-calendar-day me-2"></i>Daily Sales Report
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <button onClick={prevMonth} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </h3>
            <button onClick={nextMonth} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4 text-xs sm:text-sm text-gray-600 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
            <span>Total Days with Sales: <strong>{stats.daysWithSales}</strong></span>
            <span>Total Sales: <strong>{formatCurrency(stats.totalSales)}</strong></span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-700 text-white text-center font-bold">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-xs sm:text-sm hidden sm:block">{day}</div>
            ))}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="py-1.5 text-xs sm:hidden">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendar.map((week, weekIdx) => (
              week.map((day, dayIdx) => {
                if (!day) {
                  return <div key={`${weekIdx}-${dayIdx}`} className="border border-gray-200 bg-gray-50 min-h-[120px]" />;
                }
                
                const hasSales = !!day.sale_data;
                return (
                  <div
                    key={day.date}
                    className={`border border-gray-200 p-2 min-h-[120px] relative transition-all hover:shadow-md ${
                      hasSales ? 'bg-green-50 cursor-pointer hover:bg-green-100' : 'bg-white'
                    }`}
                    onClick={() => hasSales && setSelectedDate(day.date)}
                  >
                    <div className="font-bold text-xs sm:text-sm mb-1">{day.day}</div>
                    {hasSales && (
                      <div className="text-[10px] sm:text-xs space-y-0.5 sm:space-y-1">
                        <div className="text-blue-600 hidden sm:block">
                          <small>Total Orders:</small> {day.sale_data.total_orders}
                        </div>
                        <div className="text-green-700 font-semibold hidden sm:block">
                          <small>Gross Sale:</small> {formatCurrency(day.sale_data.total_gross_sale)}
                        </div>
                        <div className="text-red-600 hidden sm:block">
                          <small>Discount:</small> -{formatCurrency(day.sale_data.total_discount)}
                        </div>
                        <div className="text-info hidden sm:block">
                          <small>Tax:</small> {formatCurrency(day.sale_data.total_tax)}
                        </div>
                        <div className="text-gray-500 hidden sm:block">
                          <small>Round Off:</small> {(
                            parseFloat(day.sale_data.total_grand_total) - 
                            (parseFloat(day.sale_data.total_gross_sale) - parseFloat(day.sale_data.total_discount) + parseFloat(day.sale_data.total_tax))
                          ).toFixed(2)}
                        </div>
                        <div className="text-blue-800 font-bold border-t pt-1 mt-1">
                          <span className="hidden sm:inline"><small>Total:</small> </span>{formatCurrency(day.sale_data.total_grand_total)}
                        </div>
                        {parseFloat(day.sale_data.total_grand_total || 0) - parseFloat(day.sale_data.total_paid || 0) > 0 && (
                          <div className="text-red-600 font-bold hidden sm:block">
                            <small>Due:</small> {formatCurrency(parseFloat(day.sale_data.total_grand_total || 0) - parseFloat(day.sale_data.total_paid || 0))}
                          </div>
                        )}
                        <div className="text-primary hidden sm:block">
                          <small>Paid:</small> {formatCurrency(day.sale_data.total_paid || 0)}
                        </div>
                        <div className="text-primary hidden sm:block border-t pt-1 mt-1">
                          <small>Items:</small> {day.sale_data.total_items_sold}
                        </div>
                        <div className="sm:hidden text-gray-500 mt-1">
                          {day.sale_data.total_orders} ord
                        </div>
                      </div>
                    )}
                    {!hasSales && (
                      <div className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-2">No sales</div>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 p-0 sm:p-4">
          <div className="max-h-[95vh] sm:max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-t-xl sm:rounded-xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 bg-[#2c3e50] px-4 sm:px-5 py-3 sm:py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">Daily Sales Details</h3>
                <p className="text-sm text-gray-200">{new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDetails}
                  disabled={isDetailsLoading || !productDetails.length}
                  className="inline-flex items-center rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold hover:bg-green-800 disabled:opacity-50"
                >
                  <Download className="mr-2 h-4 w-4" /> Download Excel
                </button>
                <button onClick={() => setSelectedDate('')} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close details">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex border-b border-gray-200 bg-gray-50 px-4 sm:px-5">
              <button
                onClick={() => setActiveModalTab('products')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeModalTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Product Breakdown
              </button>
              <button
                onClick={() => setActiveModalTab('orders')}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeModalTab === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Order Details
              </button>
            </div>
            <div className="flex-1 overflow-auto p-0 sm:p-5">
              {activeModalTab === 'products' && (
                <>
                <div className="mb-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products or categories..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              {isDetailsLoading ? (
                <div className="py-12 text-center text-sm text-gray-500">Loading daily sales details...</div>
              ) : filteredProductDetails.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">No products match your search.</div>
              ) : (
                <div className="overflow-x-auto sm:rounded-lg border-y sm:border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Product Name', 'Category', 'Orders', 'Avg Price', 'Qty', 'Gross', 'Disc.', 'CGST', 'SGST', 'VAT', 'Net Amount', '% Cont.'].map(header => (
                          <th key={header} className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 ${
                            header === 'Product Name' ? 'sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]' : ''
                          } ${
                            ['Product Name', 'Category'].includes(header) ? 'text-left' : 'text-center'
                          }`}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredProductDetails.map(product => {
                        const isVat = (product.tax_type || '').toUpperCase() === 'VAT';
                        const contribution = selectedDayData && selectedDayData.total_grand_total > 0 
                          ? ((product.total_amount / selectedDayData.total_grand_total) * 100).toFixed(1) 
                          : 0;
                        return (
                          <tr key={product.product_id} className="hover:bg-gray-50 group">
                            <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">{product.product_name}</td>
                            <td className="px-4 py-3 text-gray-600">{product.category_name || 'Uncategorized'}</td>
                            <td className="px-4 py-3 text-center font-medium text-gray-700">{product.order_count || 0}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{formatCurrency(product.avg_price)}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{Number(product.total_quantity || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{formatCurrency(product.gross_amount)}</td>
                            <td className="px-4 py-3 text-center text-red-600">{product.discount_amount > 0 ? `-${formatCurrency(product.discount_amount)}` : '-'}</td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {isVat ? (
                                <span className="text-gray-400 font-medium">—</span>
                              ) : (
                                <>
                                  {Number(product.tax_rate / 2 || 0).toFixed(2)}%<br/>
                                  <span className="text-xs text-gray-500">{formatCurrency(product.tax_amount / 2)}</span>
                                </>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {isVat ? (
                                <span className="text-gray-400 font-medium">—</span>
                              ) : (
                                <>
                                  {Number(product.tax_rate / 2 || 0).toFixed(2)}%<br/>
                                  <span className="text-xs text-gray-500">{formatCurrency(product.tax_amount / 2)}</span>
                                </>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {isVat ? (
                                <>
                                  {Number(product.tax_rate || 0).toFixed(2)}%<br/>
                                  <span className="text-xs text-gray-500">{formatCurrency(product.tax_amount)}</span>
                                </>
                              ) : (
                                <span className="text-gray-400 font-medium">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-green-700">{formatCurrency(product.total_amount)}</td>
                            <td className="px-4 py-3 text-center text-xs font-semibold text-blue-600 bg-blue-50/50">{contribution}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="10" className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                          Products Total (Net):
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                          {formatCurrency(productDetails.reduce((s, p) => s + parseFloat(p.total_amount), 0))}
                        </td>
                        <td className="px-4 py-3 bg-blue-50/50"></td>
                      </tr>
                      {selectedDayData && parseFloat(selectedDayData.total_discount) > 0 && (
                        <tr>
                          <td colSpan="10" className="px-4 py-2 text-right text-sm text-red-600">
                            Order-Level Discounts:
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-red-600">
                            -{formatCurrency(selectedDayData.total_discount)}
                          </td>
                          <td className="px-4 py-2 bg-blue-50/50"></td>
                        </tr>
                      )}
                      {selectedDayData && (
                        <tr>
                          <td colSpan="10" className="px-4 py-2 text-right text-sm text-gray-500">
                            Round Off:
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-gray-500">
                            {formatCurrency(parseFloat(selectedDayData.total_grand_total) - (parseFloat(selectedDayData.total_gross_sale) - parseFloat(selectedDayData.total_discount) + parseFloat(selectedDayData.total_tax)))}
                          </td>
                          <td className="px-4 py-2 bg-blue-50/50"></td>
                        </tr>
                      )}
                      {selectedDayData && (
                        <tr className="bg-gray-100">
                          <td colSpan="10" className="px-4 py-3 text-right text-base font-bold text-gray-900">
                            Final Total:
                          </td>
                          <td className="px-4 py-3 text-center text-lg font-bold text-blue-700">
                            {formatCurrency(selectedDayData.total_grand_total)}
                          </td>
                          <td className="px-4 py-3 bg-blue-50/50"></td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              )}
              </>
              )}

              {activeModalTab === 'orders' && (
                <>
                  <div className="mb-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by Invoice No..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="relative min-w-[150px]">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>
                  {isOrdersLoading ? (
                    <div className="py-12 text-center text-sm text-gray-500">Loading orders...</div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">No orders match your filters.</div>
                  ) : (
                    <div className="overflow-x-auto sm:rounded-lg border-y sm:border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Time</th>
                            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Invoice No</th>
                            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700">Items</th>
                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Gross</th>
                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Discount</th>
                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Tax</th>
                            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-700">Total</th>
                            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredOrders.map(order => {
                            const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                            const amount = parseFloat(order.subtotal || 0);
                            const gstAmount = parseFloat(order.tax_amount || 0);
                            const discountAmount = parseFloat(order.discount_amount || 0);
                            const totalAmount = parseFloat(order.total_amount || 0);
                            const totalPaid = order.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
                            
                            let paymentStatus = 'PENDING';
                            if (totalPaid > 0 && totalPaid < totalAmount) {
                              paymentStatus = 'PARTIAL';
                            } else if (totalPaid >= totalAmount) {
                              paymentStatus = 'PAID';
                            }
                            
                            return (
                              <tr 
                                key={order.id} 
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedOrderId(order.id)}
                              >
                                <td className="px-4 py-3 text-gray-900">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                <td className="px-4 py-3 text-gray-600 font-medium">{order.invoice_no || order.order_number || '-'}</td>
                                <td className="px-4 py-3 text-center text-gray-600">{totalItems}</td>
                                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(amount)}</td>
                                <td className="px-4 py-3 text-right text-red-600">{discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '-'}</td>
                                <td className="px-4 py-3 text-right text-indigo-600">{formatCurrency(gstAmount)}</td>
                                <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(totalAmount)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <OrderDetailsModal
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </div>
  );
};