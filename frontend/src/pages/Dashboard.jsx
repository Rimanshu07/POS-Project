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
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getOrderById } from '../services/api/orders';
import { useCartStore } from '../store/useCartStore';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { setItems, setDiscount, setPendingOrderNumber, setAlreadyPaid, setExistingPayments } = useCartStore();
  const [filterPreset, setFilterPreset] = useState('today');
  const [isSettlingId, setIsSettlingId] = useState(null);
  
  // Data hooks
  const { data: dashboardData, isLoading: isLoadingDash } = useDashboard({ preset: filterPreset });
  const { data: productsData } = useProducts({ limit: 1 });
  const { data: categoriesData } = useCategories({ limit: 1 });
  const { data: ordersData, isLoading: isLoadingOrders } = useOrders({ limit: 5 });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  const handleDirectSettle = async (orderId) => {
    setIsSettlingId(orderId);
    try {
      const response = await getOrderById(orderId);
      const order = response.data?.order || response.order;
      if (!order) throw new Error("Order not found");
      
      const cartItems = order.items.map(item => ({
        product_id: item.product_id,
        name: item.product?.name || item.name || `Product #${item.product_id}`,
        price: item.unit_price,
        quantity: item.quantity,
        gst_type: item.gst_type,
        gst_percentage: item.gst_percentage
      }));
      
      const discountType = order.discount_type || 'FLAT';
      const discountVal = discountType === 'PERCENT'
        ? (order.discount_rate !== undefined && order.discount_rate !== null ? parseFloat(order.discount_rate) : '')
        : (order.discount_amount !== undefined && order.discount_amount !== null ? parseFloat(order.discount_amount) : '');
      
      const validPayments = (order.payments || []).filter(p => p.status === 'PAID');
      const alreadyPaid = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      setItems(cartItems);
      setDiscount(discountVal, discountType);
      setPendingOrderNumber(order.order_number);
      setAlreadyPaid(alreadyPaid);
      setExistingPayments(validPayments);
      navigate('/pos', { state: { autoCheckout: true } });
    } catch (error) {
      console.error('Failed to settle directly', error);
      setSelectedOrderId(orderId); // Fallback to details modal
    } finally {
      setIsSettlingId(null);
    }
  };

  // Payment status badge helper
  const getPaymentBadge = (order) => {
    if (order.status === 'CANCELLED') return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">Cancelled</span>;
    
    const totalPaidAmount = (order.payments || [])
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
    if (totalPaidAmount >= parseFloat(order.total_amount || 0)) {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800">Paid</span>;
    } else if (totalPaidAmount > 0) {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">Partial</span>;
    }
    return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-amber-100 text-amber-800">Pending</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">
                  {card.title}
                </p>
                <p className={`text-2xl font-extrabold mt-1 ${card.textColor} truncate`}>
                  {card.value}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden mt-8">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Recent Sales</h2>
          </div>
        </div>

        {/* ── DESKTOP TABLE (md and above) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">ITEMS</th>
                <th className="px-6 py-4">TOTAL</th>
                <th className="px-6 py-4">FINANCIALS</th>
                <th className="px-6 py-4">PAYMENT STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingOrders ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
                        {format(new Date(order.created_at), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(order.created_at), "hh:mm a").toLowerCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-bold">
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                      {(() => {
                        const totalPaid = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                        const due = parseFloat(order.total_amount || 0) - totalPaid;
                        if (due > 0 && order.status !== 'CANCELLED') {
                          return <div className="text-xs font-bold text-red-600 mt-0.5">Due: ₹{due.toFixed(2)}</div>;
                        }
                        return null;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      <div className="font-medium text-gray-900">Gross: ₹{Number(order.subtotal || 0).toFixed(2)}</div>
                      {Number(order.discount_amount || 0) > 0 && <div className="text-xs text-red-600">Disc: -₹{Number(order.discount_amount || 0).toFixed(2)}</div>}
                      <div className="text-xs text-indigo-600">Tax: ₹{Number(order.tax_amount || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Round: ₹{(
                        Number(order.total_amount || 0) - 
                        (Number(order.subtotal || 0) - Number(order.discount_amount || 0) + Number(order.tax_amount || 0))
                      ).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {(() => {
                        const totalPaidAmount = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                        const isUnpaid = totalPaidAmount < parseFloat(order.total_amount || 0);
                        return isUnpaid && order.status !== 'CANCELLED';
                      })() && (
                        <button
                          onClick={() => handleDirectSettle(order.id)}
                          disabled={isSettlingId === order.id}
                          className="mr-2 text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center text-xs font-semibold shadow-sm disabled:opacity-70"
                          title="Settle Payment"
                        >
                          {isSettlingId === order.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Settle
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
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
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No recent sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS (below md) ── */}
        <div className="md:hidden divide-y divide-gray-100">
          {isLoadingOrders ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading recent sales...</div>
          ) : ordersData?.orders?.length > 0 ? (
            ordersData.orders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                {/* Top row: Invoice + badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(order.created_at), "dd/MM/yyyy")} · {format(new Date(order.created_at), "hh:mm a").toLowerCase()}
                    </p>
                  </div>
                  {getPaymentBadge(order)}
                </div>
                {/* Financials row */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span>Items: <strong className="text-gray-900">{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</strong></span>
                  <span className="flex items-center gap-1 whitespace-nowrap">Total: <strong className="text-indigo-600">₹{Number(order.total_amount || 0).toFixed(2)}</strong>
                    {(() => {
                      const totalPaid = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                      const due = parseFloat(order.total_amount || 0) - totalPaid;
                      if (due > 0 && order.status !== 'CANCELLED') {
                        return <span className="text-[10px] font-bold text-red-600">(Due: ₹{due.toFixed(2)})</span>;
                      }
                      return null;
                    })()}
                  </span>
                  <span>Gross: ₹{Number(order.subtotal || 0).toFixed(2)}</span>
                  {Number(order.discount_amount || 0) > 0 && (
                    <span className="text-red-600">Disc: -₹{Number(order.discount_amount || 0).toFixed(2)}</span>
                  )}
                  <span>Tax: ₹{Number(order.tax_amount || 0).toFixed(2)}</span>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {(() => {
                    const totalPaidAmount = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const isUnpaid = totalPaidAmount < parseFloat(order.total_amount || 0);
                    return isUnpaid && order.status !== 'CANCELLED';
                  })() && (
                    <button
                      onClick={() => handleDirectSettle(order.id)}
                      disabled={isSettlingId === order.id}
                      className="flex-1 text-white bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg transition-colors inline-flex items-center justify-center text-xs font-semibold shadow-sm disabled:opacity-70"
                    >
                      {isSettlingId === order.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Settle
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrderId(order.id)}
                    className="flex-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-modern inline-flex items-center justify-center py-2 text-xs font-semibold gap-1"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 text-sm">No recent sales found</div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-modern flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> View All Sales
          </button>
        </div>
      </div>

      {selectedInvoiceId && (
        <InvoiceModal
          isOpen={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          orderId={selectedInvoiceId}
        />
      )}

      {selectedOrderId && (
        <OrderDetailsModal
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          orderId={selectedOrderId}
        />
      )}
    </div>
  );
};
