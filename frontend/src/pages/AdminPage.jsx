import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  fetchAllOrders, 
  fetchProducts, 
  addStock, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  fetchCategories,
  getProductSizes,
  addProductSize,
  updateProductSize,
  deleteProductSize,
  fetchCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon
} from '../api';

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [stockInputs, setStockInputs] = useState({});
  const [message, setMessage] = useState('');
  const [coupons, setCoupons] = useState([]);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', categoryId: '', brand: '', packaging: '', stockQuantity: 0, imageUrl: '', sizes: [], manageSizes: false
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Size Management State
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeModalProductId, setSizeModalProductId] = useState(null);
  const [productSizes, setProductSizes] = useState([]);
  const [newSize, setNewSize] = useState({ size: '', price: '', quantity: '' });
  const [editingSizeId, setEditingSizeId] = useState(null);
  const [editingSizeData, setEditingSizeData] = useState({ size: '', price: '', quantity: '' });

  // Coupon Management State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '', discountPercentage: '', expiryDate: '', active: true
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['inventory', 'orders', 'coupons', 'low_stock'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData, categoriesData, couponsData] = await Promise.all([
        fetchAllOrders(),
        fetchProducts(),
        fetchCategories(),
        fetchCoupons()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setCoupons(couponsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showMessage('Failed to load admin data', true);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // --- Handlers ---
  const handleStockChange = (productId, value) => setStockInputs(prev => ({ ...prev, [productId]: value }));

  const handleAddStock = async (productId) => {
    const quantity = parseInt(stockInputs[productId], 10);
    if (!quantity || quantity <= 0) return;
    try {
      await addStock(productId, quantity);
      setStockInputs(prev => ({ ...prev, [productId]: '' }));
      loadData();
      showMessage('Stock updated successfully');
    } catch (error) { showMessage('Failed to update stock', true); }
  };

  const handleDeleteProduct = async (productId) => {
    console.log('AdminPage.delete', { productId, token: localStorage.getItem('token') });
    if (!productId) {
      showMessage('Invalid product selected', true);
      return;
    }

    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        loadData();
        showMessage('Item deleted');
      } catch (error) {
        console.error('deleteProduct error', error.response?.status, error.response?.data, error.message);
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message || 'Failed to delete item';
        if (status === 401) {
          localStorage.clear();
          showMessage('Session expired. Please login again.', true);
          window.location.href = '/auth';
          return;
        }
        if (status === 403) {
          showMessage('Admin access required to delete this item.', true);
          return;
        }
        showMessage(message, true);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const openForm = (product = null) => {
    setSelectedFile(null);
    if (product) {
      setEditingProductId(product.id);
      const cat = categories.find(c => c.name === product.category);
      setFormData({
        name: product.name, description: product.description, price: product.price,
        categoryId: cat ? cat.id : (categories[0]?.id || ''), brand: product.brand || '',
        packaging: product.packaging || '', stockQuantity: product.stockQuantity, imageUrl: product.imageUrl || '', sizes: product.sizes || [],
        manageSizes: product.sizes && product.sizes.length > 0
      });
    } else {
      setEditingProductId(null);
      setFormData({
        name: '', description: '', price: '', categoryId: categories[0]?.id || '', brand: '', packaging: '', stockQuantity: 0, imageUrl: '', sizes: [], manageSizes: false
      });
    }
    setShowForm(true);
  };

  // Size Management Handlers
  const openSizeModal = async (productId) => {
    setSizeModalProductId(productId);
    setNewSize({ size: '', price: '', quantity: '' });
    setEditingSizeId(null);
    try {
      const sizes = await getProductSizes(productId);
      setProductSizes(sizes || []);
    } catch (error) {
      showMessage('Failed to load sizes', true);
    }
    setShowSizeModal(true);
  };

  const closeSizeModal = () => {
    setShowSizeModal(false);
    setSizeModalProductId(null);
    setProductSizes([]);
    setNewSize({ size: '', price: '', quantity: '' });
    setEditingSizeId(null);
  };

  const handleAddSize = async () => {
    if (!newSize.size || !newSize.price || newSize.quantity === '') {
      showMessage('Please fill in all size fields', true);
      return;
    }
    try {
      await addProductSize(sizeModalProductId, { size: newSize.size, price: parseFloat(newSize.price), quantity: parseInt(newSize.quantity, 10) });
      showMessage('Size added successfully');
      setNewSize({ size: '', price: '', quantity: '' });
      const sizes = await getProductSizes(sizeModalProductId);
      setProductSizes(sizes || []);
      loadData();
    } catch (error) {
      showMessage('Failed to add size', true);
    }
  };

  const handleEditSize = (size) => {
    setEditingSizeId(size.id);
    setEditingSizeData({ size: size.size, price: size.price, quantity: size.quantity });
  };

  const handleSaveEditSize = async () => {
    if (!editingSizeData.size || !editingSizeData.price || editingSizeData.quantity === '') {
      showMessage('Please fill in all size fields', true);
      return;
    }
    try {
      await updateProductSize(editingSizeId, { size: editingSizeData.size, price: parseFloat(editingSizeData.price), quantity: parseInt(editingSizeData.quantity, 10) });
      showMessage('Size updated successfully');
      setEditingSizeId(null);
      const sizes = await getProductSizes(sizeModalProductId);
      setProductSizes(sizes || []);
      loadData();
    } catch (error) {
      showMessage('Failed to update size', true);
    }
  };

  const handleDeleteSize = async (sizeId) => {
    if (window.confirm('Are you sure you want to delete this size?')) {
      try {
        await deleteProductSize(sizeId);
        showMessage('Size deleted successfully');
        const sizes = await getProductSizes(sizeModalProductId);
        setProductSizes(sizes || []);
        loadData();
      } catch (error) {
        showMessage('Failed to delete size', true);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId, 10),
        stockQuantity: formData.manageSizes ? 0 : parseInt(formData.stockQuantity, 10)
      };

      if (!formData.manageSizes) {
        payload.sizes = [];
      } else {
        delete payload.sizes;
      }

      let savedProduct;
      if (editingProductId) {
        savedProduct = await updateProduct(editingProductId, payload);
      } else {
        savedProduct = await addProduct(payload);
      }

      if (selectedFile) {
        await uploadProductImage(savedProduct.id || editingProductId, selectedFile);
      }
      
      showMessage(editingProductId ? 'Item updated' : 'Item created');
      setShowForm(false);
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save', true);
    }
  };

  // --- Coupon Handlers ---
  const openCouponModal = (coupon = null) => {
    if (coupon) {
      setEditingCouponId(coupon.id);
      setCouponFormData({
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
        active: coupon.active
      });
    } else {
      setEditingCouponId(null);
      setCouponFormData({ code: '', discountPercentage: '', expiryDate: '', active: true });
    }
    setShowCouponModal(true);
  };

  const handleCouponFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponFormData,
        discountPercentage: parseInt(couponFormData.discountPercentage, 10),
        expiryDate: couponFormData.expiryDate ? `${couponFormData.expiryDate}T23:59:59` : null
      };

      if (editingCouponId) {
        await updateCoupon(editingCouponId, payload);
        showMessage('Coupon updated successfully');
      } else {
        await addCoupon(payload);
        showMessage('Coupon created successfully');
      }
      setShowCouponModal(false);
      loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save coupon', true);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        showMessage('Coupon deleted');
        loadData();
      } catch (error) {
        showMessage('Failed to delete coupon', true);
      }
    }
  };

  // --- Calculations ---
  const isLowStock = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.some(size => size.quantity <= 10);
    }
    return product.stockQuantity <= 10;
  };

  const lowStockCount = products.filter(isLowStock).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>Retail Admin</h2>
        <button className={`admin-sidebar-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>📦 Inventory</button>
        <button className="admin-sidebar-btn" onClick={() => navigate('/admin/categories')}>🗂️ Manage Categories</button>
        <button className={`admin-sidebar-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}>🎟️ Coupons</button>
        <button className={`admin-sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>🛒 Orders</button>
        <button className={`admin-sidebar-btn ${activeTab === 'low_stock' ? 'active' : ''}`} onClick={() => setActiveTab('low_stock')}>⚠️ Low Stock</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>
            {activeTab === 'inventory' ? 'Inventory Management' : 
             activeTab === 'orders' ? 'Customer Orders' :
             activeTab === 'low_stock' ? 'Low Stock Management' : 'Coupons'}
          </h1>
          {activeTab === 'inventory' && (
            <button type="button" className="primary" onClick={() => openForm(null)}>+ New Food Item</button>
          )}
          {activeTab === 'coupons' && (
            <button type="button" className="primary" onClick={() => openCouponModal()}>+ New Coupon</button>
          )}
        </header>

        {message && <div className="message">{message}</div>}

        {/* SUMMARY CARDS */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Products</h3>
            <div className="value">{products.length}</div>
          </div>
          <div className="summary-card">
            <h3>Low Stock Alerts</h3>
            <div className="value" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--accent)' }}>{lowStockCount}</div>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <div className="value">{orders.length}</div>
          </div>
          <div className="summary-card">
            <h3>Revenue</h3>
            <div className="value">₹{totalRevenue.toFixed(0)}</div>
          </div>
        </div>

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Packaging</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={isLowStock(product) ? { backgroundColor: '#fee2e2' } : {}}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {product.imageUrl && (
                          <img src={product.imageUrl.startsWith('/uploads') ? `http://localhost:8083${product.imageUrl}` : product.imageUrl} alt={product.name} style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: isLowStock(product) ? '#b91c1c' : 'inherit' }}>{product.name}</div>

                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>₹{product.price.toFixed(2)}</td>
                      <td>{product.category || 'Uncategorized'}</td>
                      <td>{product.brand || '—'}</td>
                      <td>{product.packaging || '—'}</td>
                      <td>
                        {product.sizes && product.sizes.length > 0 ? (
                          <div>
                            <span className="stock-badge" style={{ width: 'auto', padding: '0 8px' }}>Total: {product.stockQuantity}</span>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>Managed in Sizes</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`stock-badge ${product.stockQuantity <= 10 ? 'low-stock' : ''}`} style={{ width: '30px' }}>
                              {product.stockQuantity}
                            </span>
                            <input type="number" min="1" placeholder="+Qty" style={{ width: '60px', padding: '0.4rem', borderRadius: '6px' }}
                              value={stockInputs[product.id] || ''} onChange={(e) => handleStockChange(product.id, e.target.value)} />
                              <button type="button" className="action-btn upload" onClick={() => handleAddStock(product.id)}>Add</button>
                          </div>
                        )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="action-btn edit" onClick={() => openForm(product)} style={{ marginRight: '0.5rem' }}>Edit</button>
                          <button type="button" className="action-btn edit" onClick={() => openSizeModal(product.id)} style={{ marginRight: '0.5rem' }}>Sizes</button>
                          <button type="button" className="action-btn delete" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
          )}

          {/* LOW STOCK TAB */}
          {activeTab === 'low_stock' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Stock Details</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(isLowStock).map(product => (
                      <tr key={product.id} style={{ backgroundColor: '#fee2e2' }}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {product.imageUrl && (
                            <img src={product.imageUrl.startsWith('/uploads') ? `http://localhost:8083${product.imageUrl}` : product.imageUrl} alt={product.name} style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
                          )}
                          <div style={{ fontWeight: '600', color: '#b91c1c' }}>{product.name}</div>
                        </td>
                        <td style={{ color: '#b91c1c' }}>{product.category || 'Uncategorized'}</td>
                        <td>
                          {product.sizes && product.sizes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {product.sizes.map(s => (
                                <div key={s.id} style={{ color: s.quantity <= 10 ? '#dc2626' : '#7f1d1d', fontWeight: s.quantity <= 10 ? 'bold' : 'normal' }}>
                                  {s.size}: {s.quantity} {s.quantity <= 10 && '(Low)'}
                                </div>
                              ))}
                              <div style={{ fontSize: '0.85rem', color: '#991b1b', marginTop: '4px' }}>Total Stock: {product.stockQuantity}</div>
                            </div>
                          ) : (
                            <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                              Quantity: {product.stockQuantity} (Low)
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {product.sizes && product.sizes.length > 0 ? (
                            <button type="button" className="action-btn edit" onClick={() => openSizeModal(product.id)}>Update Sizes</button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <input type="number" min="1" placeholder="+Qty" style={{ width: '60px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #f87171' }}
                                value={stockInputs[product.id] || ''} onChange={(e) => handleStockChange(product.id, e.target.value)} />
                              <button type="button" className="action-btn upload" style={{ backgroundColor: '#dc2626' }} onClick={() => handleAddStock(product.id)}>Add</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {products.filter(isLowStock).length === 0 && (
                      <tr><td colSpan="4" className="text-center">No low stock items.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '700' }}>#{order.id}</td>
                        <td>{order.username}</td>
                        <td>{new Date(order.orderDate).toLocaleString()}</td>
                        <td style={{ fontWeight: '600' }}>₹{order.totalAmount.toFixed(2)}</td>
                        <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan="5" className="text-center">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon.id}>
                        <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{coupon.code}</td>
                        <td style={{ fontWeight: '600' }}>{coupon.discountPercentage}%</td>
                        <td>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}</td>
                        <td>
                          <span className={`status-badge ${coupon.active ? 'shipped' : 'cancelled'}`}>
                            {coupon.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="action-btn edit" onClick={() => openCouponModal(coupon)} style={{ marginRight: '0.5rem' }}>Edit</button>
                          <button type="button" className="action-btn delete" onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr><td colSpan="5" className="text-center">No coupons found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingProductId ? 'Edit Food Item' : 'Create Food Item'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select required name="categoryId" value={formData.categoryId} onChange={handleFormChange}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="manageSizes" 
                    name="manageSizes" 
                    checked={formData.manageSizes} 
                    onChange={handleFormChange} 
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="manageSizes" style={{ margin: 0, fontWeight: '500' }}>Manage item sizes?</label>
                </div>
                {!formData.manageSizes && (
                  <div className="form-group">
                    <label>Initial Stock</label>
                    <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleFormChange} />
                  </div>
                )}
                <div className="form-group">
                  <label>Brand (Optional)</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Packaging (Optional)</label>
                  <select name="packaging" value={formData.packaging} onChange={handleFormChange}>
                    <option value="">Select Packaging</option>
                    <option value="Box">Box</option>
                    <option value="Bottle">Bottle</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea required name="description" rows="3" value={formData.description} onChange={handleFormChange}></textarea>
                </div>
                <div className="form-group full-width" style={{ background: '#f9fafb', padding: '1rem', borderRadius: '10px', border: '1px dashed #d1d5db' }}>
                  <label>Product Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ background: 'transparent', border: 'none', padding: '0' }}/>
                  {formData.imageUrl && !selectedFile && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current image: <a href={formData.imageUrl.startsWith('/uploads') ? `http://localhost:8083${formData.imageUrl}` : formData.imageUrl} target="_blank" rel="noreferrer">View</a></div>}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>Cancel</button>
                <button type="submit" className="primary">{editingProductId ? 'Update Item' : 'Create Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIZE MANAGEMENT MODAL */}
      {showSizeModal && (
        <div className="modal-overlay" onClick={closeSizeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Manage Product Sizes</h2>
            
            {/* Add Size Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Add New Size</h3>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.85rem' }}>Size Name (e.g., Small, 500ml)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Large, 1L" 
                    value={newSize.size} 
                    onChange={(e) => setNewSize({ ...newSize, size: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.85rem' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={newSize.price} 
                    onChange={(e) => setNewSize({ ...newSize, price: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.85rem' }}>Quantity Available</label>
                  <input 
                    type="number" 
                    min="0" 
                    placeholder="0" 
                    value={newSize.quantity} 
                    onChange={(e) => setNewSize({ ...newSize, quantity: e.target.value })}
                  />
                </div>
                <button type="button" className="primary" onClick={handleAddSize} style={{ padding: '0.5rem 1rem' }}>Add Size</button>
              </div>
            </div>

            {/* Sizes List */}
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Existing Sizes</h3>
              {productSizes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No sizes added yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {productSizes.map(size => (
                    <div key={size.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: size.quantity <= 10 ? '#fca5a5' : '#fff', border: size.quantity <= 10 ? '2px solid #dc2626' : '1px solid #e5e7eb', borderRadius: '8px' }}>
                      {editingSizeId === size.id ? (
                        <>
                          <input 
                            type="text" 
                            value={editingSizeData.size} 
                            onChange={(e) => setEditingSizeData({ ...editingSizeData, size: e.target.value })}
                            style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editingSizeData.price} 
                            onChange={(e) => setEditingSizeData({ ...editingSizeData, price: e.target.value })}
                            style={{ width: '120px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                          <input 
                            type="number" 
                            min="0" 
                            value={editingSizeData.quantity} 
                            onChange={(e) => setEditingSizeData({ ...editingSizeData, quantity: e.target.value })}
                            style={{ width: '100px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                          />
                          <button type="button" className="primary" onClick={handleSaveEditSize} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Save</button>
                          <button type="button" onClick={() => setEditingSizeId(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontWeight: '500', color: size.quantity <= 10 ? '#991b1b' : 'inherit' }}>{size.size}</span>
                          <span style={{ fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>₹{size.price.toFixed(2)}</span>
                          <span style={{ color: size.quantity <= 10 ? '#991b1b' : '#6b7280', minWidth: '90px', textAlign: 'right', fontWeight: size.quantity <= 10 ? 'bold' : 'normal' }}>Qty: {size.quantity}</span>
                          <button type="button" className="action-btn edit" onClick={() => handleEditSize(size)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                          <button type="button" className="action-btn delete" onClick={() => handleDeleteSize(size.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Delete</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={closeSizeModal} className="primary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* COUPON FORM MODAL */}
      {showCouponModal && (
        <div className="modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingCouponId ? 'Edit Seasonal Coupon' : 'Create Seasonal Coupon'}</h2>
            <form onSubmit={handleCouponSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Coupon Name / Code</label>
                  <input 
                    required 
                    type="text" 
                    name="code" 
                    placeholder="e.g. SUMMER15"
                    value={couponFormData.code} 
                    onChange={handleCouponFormChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    max="100" 
                    name="discountPercentage" 
                    value={couponFormData.discountPercentage} 
                    onChange={handleCouponFormChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    name="expiryDate" 
                    value={couponFormData.expiryDate} 
                    onChange={handleCouponFormChange} 
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="active" 
                    name="active" 
                    checked={couponFormData.active} 
                    onChange={handleCouponFormChange} 
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="active" style={{ margin: 0 }}>Active</label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCouponModal(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>Cancel</button>
                <button type="submit" className="primary">{editingCouponId ? 'Update Coupon' : 'Create Coupon'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
