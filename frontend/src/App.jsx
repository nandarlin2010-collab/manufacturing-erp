import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  initializeDatabase,
  getDashboardMetrics,
  getProducts,
  getInventory,
  getPurchaseOrders,
  getSalesOrders,
  getWorkOrders,
  createProduct,
  createSalesOrder,
  createWorkOrder,
  createSupplier,
  createCustomer,
  adjustInventory,
  getUserByEmail,
  getSuppliers,
  getCustomers,
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || token !== 'demo-token-admin') {
    return res.status(401).json({ error: 'Unauthorized. Log in first.' });
  }

  next();
};

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await getUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    token: 'demo-token-admin',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Manufacturing ERP API is running' });
});

app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/suppliers', requireAuth, async (req, res) => {
  try {
    const suppliers = await getSuppliers();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers', requireAuth, async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory', requireAuth, async (req, res) => {
  try {
    const inventory = await getInventory();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchase-orders', requireAuth, async (req, res) => {
  try {
    const rows = await getPurchaseOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales-orders', requireAuth, async (req, res) => {
  try {
    const rows = await getSalesOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/work-orders', requireAuth, async (req, res) => {
  try {
    const rows = await getWorkOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', requireAuth, async (req, res) => {
  try {
    const { name, sku, category, unit_price, reorder_level } = req.body;

    if (!name || !sku || !category) {
      return res.status(400).json({ error: 'name, sku and category are required' });
    }

    const product = await createProduct({
      name,
      sku,
      category,
      unit_price: Number(unit_price || 0),
      reorder_level: Number(reorder_level || 5)
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/suppliers', requireAuth, async (req, res) => {
  try {
    const { name, contact_name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const supplier = await createSupplier({ name, contact_name, email, phone });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', requireAuth, async (req, res) => {
  try {
    const { name, contact_name, email, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const customer = await createCustomer({ name, contact_name, email, phone });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sales-orders', requireAuth, async (req, res) => {
  try {
    const { customer_name, product_id, quantity, total_amount } = req.body;

    if (!customer_name || !product_id || !quantity) {
      return res.status(400).json({ error: 'customer_name, product_id and quantity are required' });
    }

    const order = await createSalesOrder({
      customer_name,
      product_id,
      quantity: Number(quantity),
      total_amount: Number(total_amount || 0)
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/work-orders', requireAuth, async (req, res) => {
  try {
    const { product_id, planned_quantity, status } = req.body;

    if (!product_id || !planned_quantity) {
      return res.status(400).json({ error: 'product_id and planned_quantity are required' });
    }

    const order = await createWorkOrder({
      product_id,
      planned_quantity: Number(planned_quantity),
      status
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory/adjust', requireAuth, async (req, res) => {
  try {
    const { product_id, quantity, location } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'product_id and quantity are required' });
    }

    const movement = await adjustInventory({
      product_id,
      quantity: Number(quantity),
      location: location || 'Main Warehouse'
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Manufacturing ERP API listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
