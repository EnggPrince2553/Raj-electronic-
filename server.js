const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const db = require('./db');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

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
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);

  // ===================== REST API ROUTES =====================
  

  // GET /api/products
  if (req.method === 'GET' && urlPath === '/api/products') {
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
  if (req.method === 'GET' && urlPath === '/api/services') {
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
  if (req.method === 'POST' && urlPath === '/api/orders') {
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

  // ===================== STATIC FILES =====================
  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h2>404 — File not found</h2>');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log('');
    console.log('  ⚡  Raj electronic sells & Service is running!');
    console.log(`  🌐  Open in browser → http://localhost:${PORT}`);
    console.log('  🔴  Press Ctrl+C to stop');
    console.log('');
  });
}

module.exports = server;
