import { useEffect, useState } from 'react';
import { addToCart, fetchCart, removeCartItem, placeOrder, updateCartItemQuantity, validateCoupon } from '../api';
import { getStoredUserId } from '../utils/auth';

function CartPage() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [message, setMessage] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);
  const userId = getStoredUserId();
  const availablePoints = Number(sessionStorage.getItem('loyaltyPoints') || 0);

  useEffect(() => {
    if (userId) {
      loadCart();
    }
  }, [userId]);

  const loadCart = async () => {
    try {
      const data = await fetchCart(Number(userId));
      setCart(data);
    } catch (error) {
      setMessage('Unable to load cart');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      const data = await removeCartItem(Number(userId), itemId);
      setCart(data);
      setMessage('Item removed from cart');
    } catch (error) {
      setMessage('Could not remove item');
    }
  };

  const handleChangeQuantity = async (item, delta) => {
    if (updatingItemId === item.id) return;
    setUpdatingItemId(item.id);
    try {
      const data = await updateCartItemQuantity(Number(userId), item.id, delta);
      setCart(data);
      setMessage(delta > 0 ? 'Item quantity increased' : 'Item quantity decreased');
    } catch (error) {
      try {
        if (delta > 0) {
          const data = await addToCart({ userId: Number(userId), productId: item.productId, quantity: 1 });
          setCart(data);
          setMessage('Item quantity increased');
          return;
        }

        if (item.quantity <= 1) {
          const data = await removeCartItem(Number(userId), item.id);
          setCart(data);
          setMessage('Item removed from cart');
          return;
        }

        await removeCartItem(Number(userId), item.id);
        const data = await addToCart({
          userId: Number(userId),
          productId: item.productId,
          quantity: item.quantity - 1,
        });
        setCart(data);
        setMessage('Item quantity decreased');
      } catch (fallbackError) {
        setMessage(fallbackError.response?.data?.message || 'Could not update quantity');
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const coupon = await validateCoupon(couponCode);
      setDiscount(coupon.discountPercentage / 100);
      setMessage(`Coupon applied: ${coupon.discountPercentage}% off!`);
    } catch (error) {
      setDiscount(0);
      setMessage(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRedeemStars = () => {
    if (availablePoints < 10) {
      setMessage('Need at least 10 stars to redeem');
      return;
    }
    // Simple rule: 1 star = ₹1
    const pointsToRedeem = availablePoints;
    const pointDiscount = pointsToRedeem;
    setPointsRedeemed(pointsToRedeem);
    setMessage(`Redeemed ${pointsToRedeem} stars for ₹${pointDiscount.toFixed(2)} off!`);
  };

  const handlePlaceOrder = async () => {
    try {
      const subtotal = cart.totalPrice * (1 - discount);
      const pointDiscount = pointsRedeemed;
      const finalTotal = Math.max(0, subtotal - pointDiscount).toFixed(2);
      
      const response = await placeOrder(Number(userId), { 
        totalAmount: finalTotal,
        pointsRedeemed: pointsRedeemed
      });
      
      sessionStorage.setItem('loyaltyPoints', response.updatedLoyaltyPoints);
      setCart({ items: [], totalPrice: 0 });
      setMessage('Order placed successfully');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to place order');
    }
  };

  if (!userId) {
    return (
      <div className="page-container">
        <h1>Cart</h1>
        <p>Please login to view your cart.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Cart</h1>
      {message && <div className="message">{message}</div>}
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item glass-panel">
                <div className="cart-item-details">
                  <strong>{item.productName}{item.sizeName ? ` (${item.sizeName})` : ''}</strong>
                  <div className="quantity-controls">
                    <button
                      className="quantity-button"
                      onClick={() => handleChangeQuantity(item, -1)}
                      aria-label={`Decrease ${item.productName} quantity`}
                      disabled={updatingItemId === item.id}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-button"
                      onClick={() => handleChangeQuantity(item, 1)}
                      aria-label={`Increase ${item.productName} quantity`}
                      disabled={updatingItemId === item.id}
                    >
                      +
                    </button>
                  </div>
                  <p>₹{item.totalPrice.toFixed(2)}</p>
                </div>
                <button className="danger" onClick={() => handleRemove(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-summary glass-panel">
            <div className="coupon-section" style={{ marginBottom: '10px' }}>
              <input type="text" placeholder="Enter coupon code (e.g. DISCOUNT10)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button className="primary" onClick={handleApplyCoupon}>Apply</button>
            </div>
            <div className="redeem-section" style={{ marginBottom: '20px' }}>
              <p>Available Stars: ⭐ {availablePoints}</p>
              <button className="secondary" onClick={handleRedeemStars} disabled={availablePoints < 10}>Redeem All Stars</button>
            </div>
            <div className="summary-row"><span>Subtotal:</span> <span>₹{cart.totalPrice.toFixed(2)}</span></div>
            {discount > 0 && <div className="summary-row"><span>Coupon Discount:</span> <span>-₹{(cart.totalPrice * discount).toFixed(2)}</span></div>}
            {pointsRedeemed > 0 && <div className="summary-row"><span>Star Discount:</span> <span>-₹{pointsRedeemed.toFixed(2)}</span></div>}
            <div className="summary-total"><span>Total:</span> <span>₹{Math.max(0, (cart.totalPrice * (1 - discount)) - pointsRedeemed).toFixed(2)}</span></div>
            <button className="primary" style={{ width: '100%' }} onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
