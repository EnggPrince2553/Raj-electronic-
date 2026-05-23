/**
 * Raj Electronics — DB Viewer Utility
 * Run this script with `node view_db.js` to view all saved orders and bookings in MongoDB.
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raj_electronics';

console.log('Connecting to database...');

// Import schemas
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const bookingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  service: String,
  address: String,
  notes: String,
  status: String,
  createdAt: Date
});
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  deliveryMethod: String,
  address: String,
  items: [{
    id: Number,
    name: String,
    price: Number,
    qty: Number
  }],
  totalPrice: Number,
  status: String,
  createdAt: Date
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('⚡ Connected to MongoDB successfully.\n');
    await displayBookings();
    await displayOrders();
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

async function displayBookings() {
  console.log('=====================================================================');
  console.log('🔧 REGISTERED SERVICE BOOKINGS');
  console.log('=====================================================================');
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    if (bookings.length === 0) {
      console.log('No service bookings registered yet.\n');
      return;
    }

    const tableData = bookings.map(b => ({
      Name: b.name,
      Phone: b.phone,
      Service: b.service,
      Address: b.address,
      Status: b.status.toUpperCase(),
      Date: b.createdAt.toLocaleString('en-IN')
    }));
    console.table(tableData);
    console.log('\n');
  } catch (err) {
    console.error('Error fetching bookings:', err.message);
  }
}

async function displayOrders() {
  console.log('=====================================================================');
  console.log('📦 REGISTERED PRODUCT ORDERS');
  console.log('=====================================================================');
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    if (orders.length === 0) {
      console.log('No orders placed yet.\n');
      return;
    }

    orders.forEach((o, i) => {
      console.log(`[Order #${i + 1}] — Customer: ${o.customerName} (${o.customerPhone})`);
      console.log(`- Method: ${o.deliveryMethod.toUpperCase()}`);
      if (o.deliveryMethod === 'delivery') {
        console.log(`- Address: ${o.address}`);
      }
      console.log(`- Status: ${o.status.toUpperCase()}`);
      console.log(`- Placed: ${o.createdAt.toLocaleString('en-IN')}`);
      console.log('- Items:');
      o.items.forEach(item => {
        console.log(`  • ${item.name} x${item.qty} — ₹${item.price * item.qty}`);
      });
      console.log(`- Total: ₹${o.totalPrice}`);
      console.log('---------------------------------------------------------------------');
    });
    console.log('\n');
  } catch (err) {
    console.error('Error fetching orders:', err.message);
  }
}
