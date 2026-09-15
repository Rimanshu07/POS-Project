const { listOrderSchema } = require('./modules/orders/order.validation.js');
const req = {
  query: {
    start_date: '2026-09-10',
    end_date: '2026-09-15',
    invoice_no: '',
    payment_status: 'pending',
    page: '1',
    limit: '10',
    date_from: '2026-09-10',
    date_to: '2026-09-15'
  }
};
const result = listOrderSchema.safeParse(req);
console.log(JSON.stringify(result, null, 2));
