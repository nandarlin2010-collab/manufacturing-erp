import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'erp.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const getSingle = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

export async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      unit_price REAL DEFAULT 0,
      reorder_level INTEGER DEFAULT 5,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplier_name TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL,
      order_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount REAL DEFAULT 0,
      status TEXT NOT NULL,
      order_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      planned_quantity INTEGER NOT NULL,
      status TEXT NOT NULL,
      due_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  const userCount = await getSingle('SELECT COUNT(*) as count FROM users');
  if (!userCount || userCount.count === 0) {
    await run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'System Admin', 'admin@hnh.com', 'admin123', 'admin']
    );
  }

  const supplierCount = await getSingle('SELECT COUNT(*) as count FROM suppliers');
  if (!supplierCount || supplierCount.count === 0) {
    const sampleSuppliers = [
      { name: 'North Supply Co.', contact_name: 'Aye Aye', email: 'aye@northsupply.com', phone: '091234567' },
      { name: 'East Valve Works', contact_name: 'Kyaw Kyaw', email: 'hello@eastvalve.com', phone: '092345678' }
    ];

    for (const supplier of sampleSuppliers) {
      await run(
        `INSERT INTO suppliers (id, name, contact_name, email, phone) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), supplier.name, supplier.contact_name, supplier.email, supplier.phone]
      );
    }
  }

  const customerCount = await getSingle('SELECT COUNT(*) as count FROM customers');
  if (!customerCount || customerCount.count === 0) {
    const sampleCustomers = [
      { name: 'Alpha Manufacturing', contact_name: 'Min Min', email: 'min@alphamfg.com', phone: '093456789' },
      { name: 'Delta Industries', contact_name: 'Thein Thein', email: 'sales@deltaind.com', phone: '094567890' }
    ];

    for (const customer of sampleCustomers) {
      await run(
        `INSERT INTO customers (id, name, contact_name, email, phone) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), customer.name, customer.contact_name, customer.email, customer.phone]
      );
    }
  }

  const productCount = await getSingle('SELECT COUNT(*) as count FROM products');
  if (!productCount || productCount.count === 0) {
    const sampleProducts = [
      { name: 'Steel Rod', sku: 'MAT-STEEL-001', category: 'Raw Material', unit_price: 12.5, reorder_level: 40 },
      { name: 'Hydraulic Pump', sku: 'COMP-PUMP-002', category: 'Component', unit_price: 340, reorder_level: 15 },
      { name: 'Motor Assembly', sku: 'ASM-MOTOR-003', category: 'Assembly', unit_price: 980, reorder_level: 8 },
      { name: 'Safety Sensor', sku: 'ELEC-SENSOR-004', category: 'Electronics', unit_price: 55, reorder_level: 25 }
    ];

    for (const product of sampleProducts) {
      const id = uuidv4();
      await run(
        `INSERT INTO products (id, name, sku, category, unit_price, reorder_level) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, product.name, product.sku, product.category, product.unit_price, product.reorder_level]
      );

      await run(
        `INSERT INTO inventory (id, product_id, quantity, location) VALUES (?, ?, ?, ?)`,
        [uuidv4(), id, Math.floor(Math.random() * 80) + 20, 'Main Warehouse']
      );

      await run(
        `INSERT INTO purchase_orders (id, supplier_name, product_id, quantity, status) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), 'North Supply Co.', id, 50, 'Approved']
      );

      await run(
        `INSERT INTO sales_orders (id, customer_name, product_id, quantity, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'Alpha Manufacturing', id, 10, product.unit_price * 10, 'Pending']
      );

      await run(
        `INSERT INTO work_orders (id, product_id, planned_quantity, status) VALUES (?, ?, ?, ?)`,
        [uuidv4(), id, 25, 'Scheduled']
      );
    }
  }
}

export async function getUserByEmail(email) {
  return getSingle('SELECT * FROM users WHERE email = ?', [email]);
}

export async function getSuppliers() {
  return all('SELECT * FROM suppliers ORDER BY created_at DESC');
}

export async function getCustomers() {
  return all('SELECT * FROM customers ORDER BY created_at DESC');
}

export async function getDashboardMetrics() {
  const totalProducts = await getSingle('SELECT COUNT(*) as count FROM products');
  const totalInventory = await getSingle('SELECT COALESCE(SUM(quantity), 0) as total FROM inventory');
  const pendingSales = await getSingle('SELECT COALESCE(COUNT(*), 0) as count FROM sales_orders WHERE status = "Pending"');
  const activeWorkOrders = await getSingle('SELECT COALESCE(COUNT(*), 0) as count FROM work_orders WHERE status != "Completed"');

  const lowStock = await all(`
    SELECT p.name, i.quantity, p.reorder_level
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    WHERE i.quantity <= p.reorder_level
    ORDER BY i.quantity ASC
    LIMIT 5
  `);

  return {
    summary: {
      totalProducts: totalProducts.count,
      totalInventory: totalInventory.total,
      pendingSales: pendingSales.count,
      activeWorkOrders: activeWorkOrders.count,
    },
    lowStock
  };
}

export async function getProducts() {
  return all('SELECT * FROM products ORDER BY created_at DESC');
}

export async function getInventory() {
  return all(`
    SELECT i.id, i.quantity, i.location, i.updated_at, p.name, p.sku, p.category
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    ORDER BY i.updated_at DESC
  `);
}

export async function getPurchaseOrders() {
  return all(`
    SELECT po.id, po.supplier_name, po.quantity, po.status, po.order_date, p.name as product_name
    FROM purchase_orders po
    JOIN products p ON p.id = po.product_id
    ORDER BY po.order_date DESC
  `);
}

export async function getSalesOrders() {
  return all(`
    SELECT so.id, so.customer_name, so.quantity, so.total_amount, so.status, so.order_date, p.name as product_name
    FROM sales_orders so
    JOIN products p ON p.id = so.product_id
    ORDER BY so.order_date DESC
  `);
}

export async function getWorkOrders() {
  return all(`
    SELECT wo.id, wo.planned_quantity, wo.status, wo.due_date, p.name as product_name
    FROM work_orders wo
    JOIN products p ON p.id = wo.product_id
    ORDER BY wo.due_date DESC
  `);
}

export async function createSupplier({ name, contact_name, email, phone }) {
  const id = uuidv4();
  await run(
    `INSERT INTO suppliers (id, name, contact_name, email, phone) VALUES (?, ?, ?, ?, ?)`,
    [id, name, contact_name || '', email || '', phone || '']
  );
  return { id, name, contact_name, email, phone };
}

export async function createCustomer({ name, contact_name, email, phone }) {
  const id = uuidv4();
  await run(
    `INSERT INTO customers (id, name, contact_name, email, phone) VALUES (?, ?, ?, ?, ?)`,
    [id, name, contact_name || '', email || '', phone || '']
  );
  return { id, name, contact_name, email, phone };
}

export async function createProduct({ name, sku, category, unit_price, reorder_level }) {
  const id = uuidv4();
  await run(
    `INSERT INTO products (id, name, sku, category, unit_price, reorder_level) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, sku, category, Number(unit_price), Number(reorder_level)]
  );

  await run(
    `INSERT INTO inventory (id, product_id, quantity, location) VALUES (?, ?, ?, ?)`,
    [uuidv4(), id, 0, 'Main Warehouse']
  );

  return { id, name, sku, category, unit_price, reorder_level };
}

export async function createSalesOrder({ customer_name, product_id, quantity, total_amount }) {
  const id = uuidv4();
  await run(
    `INSERT INTO sales_orders (id, customer_name, product_id, quantity, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, customer_name, product_id, Number(quantity), Number(total_amount), 'Pending']
  );
  return { id, customer_name, product_id, quantity, total_amount, status: 'Pending' };
}

export async function createWorkOrder({ product_id, planned_quantity, status }) {
  const id = uuidv4();
  await run(
    `INSERT INTO work_orders (id, product_id, planned_quantity, status) VALUES (?, ?, ?, ?)`,
    [id, product_id, Number(planned_quantity), status || 'Scheduled']
  );
  return { id, product_id, planned_quantity, status: status || 'Scheduled' };
}

export async function adjustInventory({ product_id, quantity, location }) {
  const existingRow = await getSingle(
    `SELECT * FROM inventory WHERE product_id = ? AND location = ? ORDER BY updated_at DESC LIMIT 1`,
    [product_id, location]
  );

  const nextQuantity = existingRow ? Number(existingRow.quantity) + Number(quantity) : Number(quantity);
  const id = uuidv4();

  await run(
    `INSERT INTO inventory (id, product_id, quantity, location) VALUES (?, ?, ?, ?)`,
    [id, product_id, nextQuantity, location]
  );

  return { id, product_id, quantity: nextQuantity, location };
}
