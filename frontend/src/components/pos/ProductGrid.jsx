import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Package, Plus, Minus, X } from 'lucide-react';

const QuantityPopup = ({ product, onClose, onAdd }) => {
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    onAdd(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="text-center mb-5">
            <p className="text-2xl font-bold text-indigo-600">₹{parseFloat(product.price).toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setQty(q => Math.max(0, q - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <input
              type="number"
              min="0"
              value={qty}
              onChange={e => setQty(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center text-xl font-bold text-gray-900 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Add to Order — ₹{(parseFloat(product.price) * qty).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductGrid = ({ products, isLoading }) => {
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const items = useCartStore((state) => state.items);
  const [popupProduct, setPopupProduct] = useState(null);

  const handleAddWithQty = (product, qty) => {
    if (qty <= 0) return;
    addItem(product);
    if (qty > 1) {
      const existing = items.find(i => i.product_id === product.id);
      const newQty = (existing ? existing.quantity : 0) + qty;
      setTimeout(() => updateQuantity(product.id, newQty), 50);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {[...Array(14)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden p-3">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
        <Package className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 font-medium">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => setPopupProduct(product)}
            className="flex flex-col text-left bg-[#fffdf9] rounded-2xl card-shadow border border-[#e8e1d5] p-3 hover:border-[#8cb99d] hover:bg-[#eef7f0] transition-modern focus:outline-none focus:ring-2 focus:ring-[#0e6b4f]"
          >
            <div className="w-full">
              <h3 className="text-sm font-semibold text-[#26332d] line-clamp-2 min-h-[40px] leading-snug">
                {product.name}
              </h3>
              <p className="mt-1 text-sm font-bold text-[#0e6b4f]">
                ₹{parseFloat(product.price).toFixed(2)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {popupProduct && (
        <QuantityPopup
          product={popupProduct}
          onClose={() => setPopupProduct(null)}
          onAdd={handleAddWithQty}
        />
      )}
    </>
  );
};


