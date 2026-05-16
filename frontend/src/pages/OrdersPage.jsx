import { useEffect, useState } from 'react';
import { fetchOrders, addToCart, markOrderReceived } from '../api';
import { getStoredUserId } from '../utils/auth';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const userId = getStoredUserId();

  useEffect(() => {
    if (userId) {
      loadOrders();
    }
  }, [userId]);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders(Number(userId));
      setOrders(data);
    } catch (error) {
      setMessage('Could not load orders');
    }
  };

  const handleQuickReorder = async (order) => {
    try {
      for (const item of order.items) {
        await addToCart({ userId: Number(userId), productId: item.productId, quantity: item.quantity });
      }
      setMessage('Items added to cart for quick reorder!');
    } catch (error) {
      setMessage('Could not reorder some items');
    }
  };

  const handleMarkReceived = async (orderId) => {
    try {
      const updatedOrder = await markOrderReceived(Number(userId), orderId);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
      setMessage('Order marked as delivered');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update delivery status');
    }
  };

  if (!userId) {
    return (
      <div className="page-container">
        <h1>Orders</h1>
        <p>Please login to see your orders.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Your Orders</h1>
      {message && <div className="message">{message}</div>}
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card glass-panel">
            <div className="order-header">
              <div className="order-id">Order #{order.id}</div>
              <div className="order-date">{new Date(order.orderDate).toLocaleString()}</div>
              <div className="order-total">Total: ₹{order.totalAmount.toFixed(2)}</div>
            </div>
            <div className="order-status">
              Status: {order.status || 'PLACED'}
              {order.deliveredAt ? ` (${new Date(order.deliveredAt).toLocaleString()})` : ''}
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.productName}</span>
                  <span>{item.quantity} × ₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {order.status !== 'DELIVERED' && (
              <button className="secondary reorder-button" onClick={() => handleMarkReceived(order.id)}>
                Mark as Received
              </button>
            )}
            <button className="reorder-button primary" onClick={() => handleQuickReorder(order)}>Quick Reorder</button>
          </div>
        ))
      )}
    </div>
  );
}

export default OrdersPage;
