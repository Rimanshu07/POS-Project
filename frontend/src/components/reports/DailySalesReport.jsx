import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useDailySalesReport } from '../../hooks/useReports';
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

  const { data: calendarData, isLoading } = useDailySalesReport({ year, month });

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
    const excelData = filteredData.map(day => ({
      'Date': day.date,
      'Gross Sale': parseFloat(day.sale_data.total_grand_total).toFixed(2),
      'Discount': parseFloat(day.sale_data.total_discount).toFixed(2),
      'Tax': parseFloat(day.sale_data.total_tax).toFixed(2),
      'Total': parseFloat(day.sale_data.total_grand_total - day.sale_data.total_discount + day.sale_data.total_tax).toFixed(2),
      'Orders': day.sale_data.total_orders,
      'Items Sold': day.sale_data.total_items_sold
    }));

    const totalRow = {
      'Date': 'TOTAL',
      'Gross Sale': filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_grand_total), 0).toFixed(2),
      'Discount': filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_discount), 0).toFixed(2),
      'Tax': filteredData.reduce((sum, day) => sum + parseFloat(day.sale_data.total_tax), 0).toFixed(2),
      'Total': filteredData.reduce((sum, day) => sum + (parseFloat(day.sale_data.total_grand_total) - parseFloat(day.sale_data.total_discount) + parseFloat(day.sale_data.total_tax)), 0).toFixed(2),
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
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
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total Days with Sales: {stats.daysWithSales}</span>
            <span>Total Sales: {formatCurrency(stats.totalSales)}</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-700 text-white text-center font-bold">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-sm">{day}</div>
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
                  >
                    <div className="font-bold text-sm mb-1">{day.day}</div>
                    {hasSales && (
                      <div className="text-xs space-y-1">
                        <div className="text-blue-600">
                          <small>Total Orders:</small> {day.sale_data.total_orders}
                        </div>
                        <div className="text-green-700 font-semibold">
                          <small>Gross Sale:</small> {formatCurrency(day.sale_data.total_grand_total)}
                        </div>
                        <div className="text-red-600">
                          <small>Discount:</small> -{formatCurrency(day.sale_data.total_discount)}
                        </div>
                        <div className="text-primary">
                          <small>Items:</small> {day.sale_data.total_items_sold}
                        </div>
                        {day.sale_data.total_tax > 0 && (
                          <div className="text-info">
                            <small>Order Tax:</small> {formatCurrency(day.sale_data.total_tax)}
                          </div>
                        )}
                      </div>
                    )}
                    {!hasSales && (
                      <div className="text-gray-400 text-xs mt-2">No sales</div>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};