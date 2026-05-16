import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, addCategory, deleteCategory } from '../api';

function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showMessage('Failed to load categories', true);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      showMessage('Please enter a category name', true);
      return;
    }

    try {
      await addCategory({ name: categoryName.trim() });
      setCategoryName('');
      showMessage('Category added successfully');
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add category';
      showMessage(message, true);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!categoryId) {
      showMessage('Invalid category selected', true);
      return;
    }

    if (!window.confirm('Delete this category? This will fail if products still use it.')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      showMessage('Category deleted');
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete category';
      showMessage(message, true);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Retail Admin</h2>
        <button className="admin-sidebar-btn" onClick={() => navigate('/admin')}>📦 Inventory</button>
        <button className="admin-sidebar-btn active">🗂️ Manage Categories</button>
        <button className="admin-sidebar-btn" onClick={() => navigate('/admin?tab=coupons')}>🎟️ Coupons</button>
        <button className="admin-sidebar-btn" onClick={() => navigate('/admin?tab=orders')}>🛒 Orders</button>
      </aside>

      <main className="admin-main-content">
        <header className="admin-header">
          <h1>Manage Categories</h1>
          <button type="button" className="primary" onClick={() => navigate('/admin')}>Back to Inventory</button>
        </header>

        {message && <div className="message">{message}</div>}

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="New category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{ flex: '1 1 240px', padding: '0.8rem', borderRadius: '10px', border: '1px solid #d1d5db' }}
            />
            <button type="button" className="primary" onClick={handleAddCategory}>Add Category</button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <strong>Existing categories</strong>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
              {categories.map(category => (
                <div key={category.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <span>{category.name}</span>
                  <button type="button" className="action-btn delete" style={{ padding: '0.35rem 0.75rem' }} onClick={() => handleDeleteCategory(category.id)} aria-label={`Delete category ${category.name}`}>
                    Delete
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ color: '#64748b' }}>No categories yet. Add one to get started.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ManageCategoriesPage;
