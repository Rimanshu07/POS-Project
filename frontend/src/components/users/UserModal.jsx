import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const UserModal = ({ isOpen, onClose, onSubmit, user: editUser, isSubmitting }) => {
  const { user: currentUser } = useAuth();
  
  // Custom schema definition to handle conditional password validation (required for create, optional for edit)
  const userSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().min(1, 'Email is required').email('Invalid email address').trim(),
    username: z.string().min(1, 'Username is required').trim(),
    password: z.string()
      .trim()
      .optional()
      .refine(val => {
        if (!editUser && (!val || val.length < 8)) return false; // Required on create with min 8
        if (editUser && val && val.length > 0 && val.length < 8) return false; // If provided on edit, min 8
        return true;
      }, { message: 'Password must be at least 8 characters long' }),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER'], { required_error: 'Role is required' }),
    is_active: z.boolean().default(true)
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'CASHIER',
      is_active: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        reset({
          name: editUser.name,
          email: editUser.email || '',
          username: editUser.username || '',
          password: '', // Never populate existing password
          role: editUser.role,
          is_active: editUser.is_active
        });
      } else {
        reset({
          name: '',
          email: '',
          username: '',
          password: '',
          role: 'CASHIER',
          is_active: true
        });
      }
    }
  }, [isOpen, editUser, reset]);

  if (!isOpen) return null;

  // Prevent self-demotion or self-deactivation in UI (backend will reject anyway, but good UX to disable)
  const isSelf = editUser?.id === currentUser?.id;

  const submitHandler = (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      username: data.username,
      role: data.role,
      is_active: data.is_active,
    };

    if (data.password && data.password.length > 0) {
      payload.password = data.password;
    }

    if (editUser) {
      const changedData = {};
      let hasChanges = false;
      Object.keys(payload).forEach(key => {
        // Exclude password from identical check if it wasn't provided
        if (key === 'password' && payload[key]) {
          changedData[key] = payload[key];
          hasChanges = true;
        } else if (key !== 'password' && payload[key] !== editUser[key]) {
          changedData[key] = payload[key];
          hasChanges = true;
        }
      });
      
      if (!hasChanges) {
        onClose();
        return;
      }
      onSubmit(changedData);
    } else {
      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
      
      <div className="relative my-2 max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl transition-all sm:my-8 sm:max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {editUser ? 'Edit User' : 'Add New User'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('username')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="username"
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editUser ? '(Leave blank to keep unchanged)' : <span className="text-red-500">*</span>}
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder={editUser ? 'Enter new password' : 'Min 8 characters'}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role')}
                disabled={isSelf} // Self role change prevented in UI
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="CASHIER">Cashier</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
              {isSelf && <p className="mt-1 text-xs text-amber-600">You cannot change your own role.</p>}
            </div>

            <div className="flex items-center mt-2">
              <input
                {...register('is_active')}
                id="is_active"
                type="checkbox"
                disabled={isSelf} // Self deactivation prevented in UI
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="is_active" className={`ml-2 block text-sm ${isSelf ? 'text-gray-400' : 'text-gray-900'}`}>
                Active (User can login and use the system)
              </label>
            </div>
            {isSelf && <p className="text-xs text-amber-600 ml-6">You cannot deactivate your own account.</p>}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
