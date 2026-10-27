import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, getDashboardMetrics, getProducts, getInventory, getPurchaseOrders, getSalesOrders, getWorkOrders, createProduct, createSalesOrder, adjustInventory } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Manufacturing ERP API is running' });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await getInventory();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/purchase-orders', async (req, res) => {
  try {
    const rows = await getPurchaseOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales-orders', async (req, res) => {
  try {
    const rows = await getSalesOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/work-orders', async (req, res) => {
  try {
    const rows = await getWorkOrders();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
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

app.post('/api/sales-orders', async (req, res) => {
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

app.post('/api/inventory/adjust', async (req, res) => {
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
