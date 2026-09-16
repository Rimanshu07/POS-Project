import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Search, Filter, AlertCircle, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { getOrderById } from '../services/api/orders';

export const OrderHistory = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState('');
  
  // For search input
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isSettlingId, setIsSettlingId] = useState(null);
  
  const navigate = useNavigate();
  const { setItems, setDiscount, setPendingOrderNumber, setAlreadyPaid, setExistingPayments } = useCartStore();
  
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Handle status change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const { data, isLoading, isError, error } = useOrders({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined
  });

  const orders = data?.orders || [];
  const meta = data?.meta || { totalPages: 1, total: 0 };

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
      setSelectedOrderId(orderId);
    } finally {
      setIsSettlingId(null);
    }
  };

  // Status badge helper
  const getStatusBadge = (order) => {
    if (order.status === 'CANCELLED') {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
    }
    
    const totalPaidAmount = (order.payments || [])
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
    if (totalPaidAmount >= parseFloat(order.total_amount || 0)) {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Paid</span>;
    } else if (totalPaidAmount > 0) {
      return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Partial</span>;
    }
    return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Pending</span>;
  };

  // Pagination component used by both layouts
  const Pagination = ({ compact = false }) => (
    <div className={clsx(
      "flex items-center justify-between gap-2",
      compact ? "py-2" : "bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
    )}>
      <p className="text-xs sm:text-sm text-gray-500">
        {compact
          ? `Page ${page} of ${meta.totalPages || 1} · ${meta.total} orders`
          : `Showing page ${meta.page} of ${meta.totalPages || 1} (Total: ${meta.total} orders)`
        }
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Prev
        </button>
        <button
          onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
          disabled={page === meta.totalPages}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-0.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage past orders and receipts.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Invoice No (e.g. ORD-2026...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow shadow-sm"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={status}
            onChange={handleStatusChange}
            className="block w-full pl-9 pr-8 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              Error loading orders: {error?.response?.data?.error?.message || error.message}
            </p>
          </div>
        </div>
      )}

      {/* ── DESKTOP TABLE (md and above) ── */}
      <div className="hidden md:block bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice No</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-base font-medium text-gray-900">No orders found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-indigo-50/30 transition-modern">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{order.invoice_no || order.order_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{parseFloat(order.total_amount).toFixed(2)}</div>
                      {(() => {
                        const totalPaid = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                        const due = parseFloat(order.total_amount || 0) - totalPaid;
                        if (due > 0 && order.status !== 'CANCELLED') {
                          return <div className="text-xs font-bold text-red-600 mt-0.5">Due: ₹{due.toFixed(2)}</div>;
                        }
                        return null;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                            <span className="w-4 h-4 mr-1 inline-block border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className="mr-1">✓</span>
                          )}
                          Settle
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && orders.length > 0 && <Pagination />}
      </div>

      {/* ── MOBILE CARDS (below md) ── */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-900">No orders found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              {/* Top row: Invoice + Status */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.invoice_no || order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                {getStatusBadge(order)}
              </div>
              {/* Amount */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-600">
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
                {(() => {
                  const totalPaid = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                  const due = parseFloat(order.total_amount || 0) - totalPaid;
                  if (due > 0 && order.status !== 'CANCELLED') {
                    return <span className="text-xs font-bold text-red-600">Due: ₹{due.toFixed(2)}</span>;
                  }
                  return null;
                })()}
              </div>
              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-gray-100">
                {(() => {
                  const totalPaidAmount = (order.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                  const isUnpaid = totalPaidAmount < parseFloat(order.total_amount || 0);
                  return isUnpaid && order.status !== 'CANCELLED';
                })() && (
                  <button
                    onClick={() => handleDirectSettle(order.id)}
                    disabled={isSettlingId === order.id}
                    className="flex-1 text-white bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg transition-colors inline-flex items-center justify-center text-xs font-semibold gap-1 disabled:opacity-70"
                  >
                    {isSettlingId === order.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : '✓'}
                    Settle
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrderId(order.id)}
                  className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors inline-flex items-center justify-center text-xs font-semibold gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
              </div>
            </div>
          ))
        )}

        {!isLoading && orders.length > 0 && <Pagination compact />}
      </div>

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
