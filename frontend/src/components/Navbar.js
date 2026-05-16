import { Link } from 'react-router-dom';

function Navbar() {
  const username = localStorage.getItem('username');
  const points = localStorage.getItem('loyaltyPoints');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <header className="navbar">
      <div className="brand">Retail Ordering</div>
      <nav>
        {role !== 'ROLE_ADMIN' && (
          <>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Orders</Link>
          </>
        )}
        {role === 'ROLE_ADMIN' && <Link to="/admin">Admin Dashboard</Link>}
        <div className="user-info">
          {role === 'ROLE_ADMIN' ? (
            <span>Hi, {username}</span>
          ) : (
            <span>Hi, {username} (⭐ {points || 0})</span>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
