import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be less than 150 characters'),
  category_id: z.string().min(1, 'Category is required'),
  price: z.string().min(1, 'MRP is required').regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid price'),
  gst_type: z.enum(['GST', 'VAT']).default('GST'),
  gst_percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid percentage').refine(value => parseFloat(value) <= 100, 'GST must be between 0 and 100'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

export const ProductModal = ({ isOpen, onClose, onSubmit, product, isSubmitting }) => {
  const { data: categoriesData } = useCategories({ is_active: 'true' });
  const categories = categoriesData?.categories || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category_id: '',
      price: '',
      gst_type: 'GST',
      gst_percentage: '0',
      description: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          category_id: product.category_id.toString(),
          price: product.price,
          gst_type: product.gst_type || 'GST',
          gst_percentage: product.gst_percentage?.toString() || '0',
          description: product.description || '',
          is_active: product.is_active
        });
      } else {
        reset({
          name: '',
          category_id: '',
          price: '',
          gst_type: 'GST',
          gst_percentage: '0',
          description: '',
          is_active: true
        });
      }
    }
  }, [isOpen, product, reset]);

  if (!isOpen) return null;

  const submitHandler = (data) => {
    const payload = {
      ...data,
      category_id: parseInt(data.category_id, 10),
    };

    if (product) {
      const allowedFields = ['category_id', 'name', 'description', 'price', 'gst_type', 'gst_percentage', 'image_url', 'is_active'];
      const changedData = {};
      let hasChanges = false;
      Object.keys(payload).forEach(key => {
        if (allowedFields.includes(key)) {
          if (String(payload[key]) !== String(product[key])) {
            changedData[key] = payload[key];
            hasChanges = true;
          }
        }
      });
      if (!hasChanges) { onClose(); return; }
      onSubmit(changedData);
    } else {
      onSubmit(payload);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";
  const errorCls = "mt-1 text-xs text-red-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all sm:my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-500 disabled:opacity-50 p-1 rounded-lg hover:bg-gray-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className={labelCls}>Product Name <span className="text-red-500">*</span></label>
              <input {...register('name')} type="text" className={inputCls} placeholder="e.g. Premium Chocolate Cake" />
              {errors.name && <p className={errorCls}>{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category <span className="text-red-500">*</span></label>
              <select {...register('category_id')} className={inputCls}>
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className={errorCls}>{errors.category_id.message}</p>}
            </div>

            {/* MRP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>MRP (Price) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₹</span>
                  <input {...register('price')} type="text" className={`${inputCls} pl-7`} placeholder="0.00" />
                </div>
                {errors.price && <p className={errorCls}>{errors.price.message}</p>}
              </div>
            </div>

            {/* GST fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>GST Type</label>
                <select {...register('gst_type')} className={inputCls}>
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>GST Percentage (%)</label>
                <div className="relative">
                <input {...register('gst_percentage')} type="number" min="0" max="100" step="0.01" className={`${inputCls} pr-8`} placeholder="e.g. 5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
                {errors.gst_percentage && <p className={errorCls}>{errors.gst_percentage.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea {...register('description')} rows="2" className={inputCls} placeholder="Short product description..." />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-1">
              <input {...register('is_active')} id="is_active" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active — visible in POS
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
