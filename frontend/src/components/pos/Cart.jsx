import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const Cart = () => {
  const { items, removeItem, incrementQuantity, decrementQuantity, updateQuantity, updatePrice, clearCart, getSubtotal } = useCartStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Frontend calculation for display purposes only.
  // Backend is the authoritative source of truth.
  const subtotal = getSubtotal();
  const taxAmount = items.reduce((sum, item) => (
    sum + (parseFloat(item.price) * item.quantity * parseFloat(item.gst_percentage || 0) / 100)
  ), 0);
  const total = subtotal + taxAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] font-[Inter,sans-serif]">

      {/* Header */}
      <div className="flex-none border-b border-[#E5E2D9] px-3 py-2.5 sm:px-5 sm:py-4 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#24231F] tracking-tight">Current order</span>
        {items.length > 0 && (
          <span className="text-xs font-medium text-[#78766D] tabular-nums">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Item list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="w-10 h-10 text-[#D9D6CB] mb-3" strokeWidth={1.5} />
            <p className="text-[#24231F] font-medium text-sm">Cart is empty</p>
            <p className="text-[#A3A096] text-xs mt-1">Add items from the menu to start</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.product_id}
              className={`flex min-w-0 items-center gap-2 py-2.5 sm:gap-3 sm:py-3.5 ${idx !== items.length - 1 ? 'border-b border-[#EDEAE1]' : ''}`}
            >
              {/* Name + price row */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-[#24231F] sm:text-sm">{item.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-[#A3A096]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updatePrice(item.product_id, e.target.value)}
                    className="w-14 text-xs font-medium text-[#78766D] bg-transparent border-b border-dashed border-[#D9D6CB] focus:outline-none focus:border-[#0E6B4F] focus:text-[#0E6B4F] tabular-nums py-0.5"
                  />
                  <span className="text-xs text-[#A3A096]">each</span>
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2 bg-white rounded-full border border-[#E5E2D9] px-1 py-1 flex-none">
                <button
                  onClick={() => decrementQuantity(item.product_id)}
                  aria-label="Decrease quantity"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[#78766D] hover:bg-[#F1EFE8] active:scale-95 transition-all focus:outline-none"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.product_id, e.target.value)}
                  className="w-6 text-center text-sm font-semibold text-[#24231F] bg-transparent focus:outline-none tabular-nums"
                />
                <button
                  onClick={() => incrementQuantity(item.product_id)}
                  aria-label="Increase quantity"
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[#78766D] hover:bg-[#F1EFE8] active:scale-95 transition-all focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line total */}
              <span className="w-14 flex-none text-right text-xs font-semibold text-[#24231F] tabular-nums sm:w-16 sm:text-sm">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </span>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.product_id)}
                aria-label="Remove item"
                className="text-[#C7C4B8] hover:text-[#A23B2E] transition-colors focus:outline-none flex-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary + actions */}
      <div className="flex-none shrink-0 border-t border-[#E5E2D9] bg-white px-3 pt-2.5 pb-2.5 sm:px-5 sm:pt-4 sm:pb-5">
        <div className="flex justify-between text-xs text-[#78766D] mb-1 sm:text-sm sm:mb-1.5">
          <span>Subtotal</span>
          <span className="tabular-nums text-[#24231F]">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#78766D] mb-2 sm:text-sm sm:mb-3">
          <span>Tax</span>
          <span className="tabular-nums text-[#24231F]">₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-[#E5E2D9] mb-2.5 sm:pt-3 sm:mb-4">
          <span className="text-sm font-semibold text-[#24231F]">Total</span>
          <span className="text-xl font-bold text-[#24231F] tabular-nums sm:text-2xl">₹{total.toFixed(2)}</span>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={clearCart}
            disabled={items.length === 0}
            className="min-h-11 flex-1 rounded-lg border border-[#E9D9D5] py-2.5 text-xs font-semibold text-[#A23B2E] hover:bg-[#FBF1EF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-[#A23B2E]/30 sm:py-3 sm:text-sm"
          >
            Cancel order
          </button>
          <button
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={items.length === 0}
            className="min-h-11 flex-[1.5] rounded-lg bg-[#0E6B4F] py-2.5 text-xs font-semibold text-white hover:bg-[#0B5A42] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-[#0E6B4F]/30 sm:py-3 sm:text-sm"
          >
            Checkout ₹{total.toFixed(2)}
          </button>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          total={total.toFixed(2)}
        />
      )}
    </div>
  );
};