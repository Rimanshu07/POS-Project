import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useOrders } from '../hooks/useOrders';
import { 
  Package, 
  Tags, 
  Users, 
  UserCircle,
  TrendingUp,
  Monitor,
  BookOpen,
  ShoppingCart,
  Calendar,
  AlertCircle,
  Eye,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceModal } from '../components/orders/InvoiceModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [filterPreset, setFilterPreset] = useState('today');
  
  // Data hooks
  const { data: dashboardData, isLoading: isLoadingDash } = useDashboard({ preset: filterPreset });
  const { data: productsData } = useProducts({ limit: 1 });
  const { data: categoriesData } = useCategories({ limit: 1 });
  const { data: ordersData, isLoading: isLoadingOrders } = useOrders({ limit: 5 });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Cards Data Setup
  const cards = [
    {
      title: 'Total Products',
      value: productsData?.meta?.total || 0,
      icon: <Package className="w-8 h-8 text-indigo-600" />,
      bgColor: 'bg-indigo-50 border-indigo-100',
      textColor: 'text-gray-900'
    },
    {
      title: 'Categories',
      value: categoriesData?.meta?.total || 0,
      icon: <Tags className="w-8 h-8 text-blue-600" />,
      bgColor: 'bg-blue-50 border-blue-100',
      textColor: 'text-gray-900'
    },
    {
      title: 'Today Sales',
      value: dashboardData?.todaySales ? `₹${dashboardData.todaySales}` : '₹0.00',
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      bgColor: 'bg-emerald-50 border-emerald-100',
      textColor: 'text-gray-900'
    },
    {
      title: 'Point of Sale',
      value: '',
      icon: <ShoppingCart className="w-10 h-10 text-white mx-auto" />,
      bgColor: 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700 cursor-pointer shadow-md hover:shadow-lg transition-modern hover:-translate-y-1',
      textColor: 'text-white',
      isButton: true,
      onClick: () => navigate('/pos')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <select
              value={filterPreset}
              onChange={(e) => setFilterPreset(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full outline-none shadow-sm cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div> */}
      </div>

      {/* 8 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) =>
          card.isButton ? (
            <div
              key={idx}
              onClick={card.onClick}
              className={`${card.bgColor} rounded-xl border p-6 flex flex-col items-center justify-center text-center min-h-[120px]`}
            >
              {card.icon}
              <span className="mt-2 text-white font-bold text-lg tracking-wide">
                {card.title}
              </span>
            </div>
          ) : (
            <div
              key={idx}
              className="bg-white rounded-xl card-shadow p-5 flex items-center gap-5 border border-gray-100 hover:shadow-md transition-modern group"
            >
              <div
                className={`${card.bgColor} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border transition-modern group-hover:scale-105`}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className={`text-2xl font-extrabold mt-1 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Recent Sales</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">ITEMS</th>
                <th className="px-6 py-4">TOTAL</th>
                <th className="px-6 py-4">AMOUNT + GST</th>
                <th className="px-6 py-4">PAYMENT STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingOrders ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading recent sales...
                  </td>
                </tr>
              ) : ordersData?.orders?.length > 0 ? (
                ordersData.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-modern"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {format(new Date(order.created_at), "MM/dd/yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(order.created_at), "hh:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-bold">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      <div>Amount: ₹{Number(order.subtotal || 0).toFixed(2)}</div>
                      <div className="text-xs text-indigo-600">GST: ₹{Number(order.tax_amount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceId(order.id)}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-modern inline-flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No recent sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-modern flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> View All Sales
            </button>
          </div>
        </div>
      </div>

      {selectedInvoiceId && (
        <InvoiceModal
          isOpen={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          orderId={selectedInvoiceId}
        />
      )}
    </div>
  );
};
