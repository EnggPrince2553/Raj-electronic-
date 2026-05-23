const mongoose = require('mongoose');
const db = require('../db');

// Helper to parse JSON body
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', err => reject(err));
  });
};

// Helper to send JSON responses
const sendJSON = (res, statusCode, data) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
};

module.exports = async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    res.end();
    return;
  }

  // GET /api/products
  if (req.method === 'GET' && (urlPath === '/api/products' || urlPath === '/api/products/')) {
    try {
      if (mongoose.connection.readyState === 1) {
        const products = await db.Product.find({}).sort({ id: 1 });
        return sendJSON(res, 200, products);
      } else {
        return sendJSON(res, 200, db.INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
      return sendJSON(res, 200, db.INITIAL_PRODUCTS);
    }
  }

  // GET /api/services
  if (req.method === 'GET' && (urlPath === '/api/services' || urlPath === '/api/services/')) {
    try {
      if (mongoose.connection.readyState === 1) {
        const services = await db.Service.find({});
        return sendJSON(res, 200, services);
      } else {
        return sendJSON(res, 200, db.INITIAL_SERVICES);
      }
    } catch (err) {
      console.error('Error fetching services:', err.message);
      return sendJSON(res, 200, db.INITIAL_SERVICES);
    }
  }

  // POST /api/orders
  if (req.method === 'POST' && (urlPath === '/api/orders' || urlPath === '/api/orders/')) {
    try {
      const body = await parseJsonBody(req);
      if (!body.customerName || !body.customerPhone || !body.deliveryMethod || !body.items || body.items.length === 0 || body.totalPrice === undefined) {
        return sendJSON(res, 400, { error: 'Missing required order fields' });
      }

      if (mongoose.connection.readyState === 1) {
        const newOrder = new db.Order({
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          deliveryMethod: body.deliveryMethod,
          address: body.address || '',
          items: body.items,
          totalPrice: body.totalPrice
        });
        await newOrder.save();
        return sendJSON(res, 201, { success: true, order: newOrder });
      } else {
        return sendJSON(res, 201, { success: true, message: 'Saved to mock store (offline DB)', order: body });
      }
    } catch (err) {
      console.error('Error saving order:', err.message);
      return sendJSON(res, 500, { error: 'Internal Server Error', message: err.message });
    }
  }

  // Fallback for unknown API routes
  sendJSON(res, 404, { error: 'API route not found' });
};
