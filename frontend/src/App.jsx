import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, productsRes, inventoryRes, salesRes, purchaseRes, workRes] = await Promise.all([
          fetch(`${API_URL}/dashboard`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/inventory`),
          fetch(`${API_URL}/sales-orders`),
          fetch(`${API_URL}/purchase-orders`),
          fetch(`${API_URL}/work-orders`)
        ]);

        const dashboardData = await dashboardRes.json();
        const productsData = await productsRes.json();
        const inventoryData = await inventoryRes.json();
        const salesData = await salesRes.json();
        const purchaseData = await purchaseRes.json();
        const workData = await workRes.json();

        setDashboard(dashboardData);
        setProducts(productsData);
        setInventory(inventoryData);
        setSales(salesData);
        setPurchaseOrders(purchaseData);
        setWorkOrders(workData);
      } catch (error) {
        console.error('Failed to load ERP data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="page"><h2>Loading ERP dashboard...</h2></div>;
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Operations Overview</p>
          <h1>Manufacturing ERP</h1>
        </div>
      </header>

      <section className="stats-grid">
        <div className="card metric">
          <span>Products</span>
          <strong>{dashboard?.summary?.totalProducts ?? 0}</strong>
        </div>
        <div className="card metric">
          <span>Inventory Units</span>
          <strong>{dashboard?.summary?.totalInventory ?? 0}</strong>
        </div>
        <div className="card metric">
          <span>Pending Sales</span>
          <strong>{dashboard?.summary?.pendingSales ?? 0}</strong>
        </div>
        <div className="card metric">
          <span>Active Work Orders</span>
          <strong>{dashboard?.summary?.activeWorkOrders ?? 0}</strong>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <h3>Low Stock Alerts</h3>
          <ul className="list">
            {(dashboard?.lowStock ?? []).map((item) => (
              <li key={item.name}>
                <span>{item.name}</span>
                <strong>{item.quantity}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3>Products</h3>
          <ul className="list">
            {products.slice(0, 5).map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <strong>{product.category}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="table-section">
        <div className="table-card">
          <h3>Inventory</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Location</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.location}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3>Sales Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 6).map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.customer_name}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="table-section">
        <div className="table-card">
          <h3>Purchase Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Product</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.slice(0, 6).map((order) => (
                <tr key={order.id}>
                  <td>{order.supplier_name}</td>
                  <td>{order.product_name}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3>Work Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Planned Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.slice(0, 6).map((order) => (
                <tr key={order.id}>
                  <td>{order.product_name}</td>
                  <td>{order.planned_quantity}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
