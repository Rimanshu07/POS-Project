const AppError = require('./AppError');

const getDateRange = (preset, from, to) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  // Reset times for today
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new AppError('Invalid date format for from/to', 'VALIDATION_ERROR', 400);
    }
    
    startDate = fromDate;
    startDate.setHours(0, 0, 0, 0);
    
    endDate = toDate;
    endDate.setHours(23, 59, 59, 999);
    
    if (startDate > endDate) {
      throw new AppError('Start date cannot be after end date', 'VALIDATION_ERROR', 400);
    }
  } else if (preset) {
    switch (preset) {
      case 'today':
        // Already handled by default
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        endDate.setDate(now.getDate() - 1);
        break;
      case 'this_week':
        const first = now.getDate() - now.getDay(); // Sunday
        startDate.setDate(first);
        break;
      case 'this_month':
        startDate.setDate(1);
        break;
      default:
        throw new AppError('Invalid preset filter', 'VALIDATION_ERROR', 400);
    }
  }

  return { startDate, endDate };
};

module.exports = { getDateRange };
