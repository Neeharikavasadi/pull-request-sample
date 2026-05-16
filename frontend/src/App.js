import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';

function App() {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={localStorage.getItem('role') === 'ROLE_ADMIN' ? <Navigate to="/admin" replace /> : <HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/admin" element={localStorage.getItem('role') === 'ROLE_ADMIN' ? <AdminPage /> : <Navigate to="/" replace />} />
          <Route path="/admin/categories" element={localStorage.getItem('role') === 'ROLE_ADMIN' ? <ManageCategoriesPage /> : <Navigate to="/" replace />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to={localStorage.getItem('role') === 'ROLE_ADMIN' ? "/admin" : "/"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
