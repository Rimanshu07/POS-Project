import axios from 'axios';

// Map backend error codes to user-friendly messages
const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  PRODUCT_NOT_FOUND: 'This product is no longer available.',
  CATEGORY_NOT_FOUND: 'This category does not exist.',
  USER_NOT_FOUND: 'User not found.',
  ORDER_NOT_FOUND: 'Order could not be found.',
  ORDER_CREATION_FAILED: 'Failed to create the order. Please try again.',
  PAYMENT_FAILED: 'Payment failed to process.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later.'
};

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => {
    // Unwrap { success: true, data: ... }
    return response.data.data;
  },
  (error) => {
    // If we have a structured backend error response
    if (error.response && error.response.data && error.response.data.error) {
      const { code, message: backendMessage } = error.response.data.error;
      
      const friendlyMessage = ERROR_MESSAGES[code] || backendMessage || 'An unexpected error occurred.';
      
      const normalizedError = {
        code: code || 'UNKNOWN_ERROR',
        message: friendlyMessage
      };

      // Redirect to login on 401, but NOT if the request was for login itself, and NOT if we are already on /login
      if (
        error.response.status === 401 && 
        !error.config.url.includes('/auth/login') &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }

      return Promise.reject(normalizedError);
    }
    
    // Fallback for network errors, timeouts, etc
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.'
    });
  }
);

export default api;
