import { useEffect, useState } from 'react';
import {
  fetchAvailableProducts,
  searchProducts,
  fetchCategories,
  fetchProductsByCategory,
  addToCart,
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
  fetchActiveCoupons
} from '../api';
import { getStoredUserId } from '../utils/auth';

const productImageMap = {
  'Margherita Pizza': '/RetailOrdering/Margherita Pizza.jpg',
  'Cheese Pizza': '/RetailOrdering/Cheese Pizza.png',
  'Pepperoni Pizza': '/RetailOrdering/Pepperoni Pizza.jpg',
  'Veggie Pizza': '/RetailOrdering/Veggie Pizza.jpg',
  Cola: '/RetailOrdering/Cola.jpg',
  Lemonade: '/RetailOrdering/Lemonade.jpg',
  'Garlic Bread': '/RetailOrdering/GarlicBread.jpg',
  'Cheesy Bread': '/RetailOrdering/CheesyBread.jpg',
};

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');
  const [cartItemsByProduct, setCartItemsByProduct] = useState({});
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  
  // Size selection state
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchMinPrice, setSearchMinPrice] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  const userId = getStoredUserId();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadActiveCoupons();
    if (userId) {
      loadCartState();
    }
  }, []);

  useEffect(() => {
    let interval;
    if (activeCoupons.length > 1) {
      interval = setInterval(() => {
        setCurrentCouponIndex((prev) => (prev + 1) % activeCoupons.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCoupons.length]); // Use length as dependency for better stability

  const loadActiveCoupons = async () => {
    try {
      const coupons = await fetchActiveCoupons();
      if (coupons && coupons.length > 0) {
        setActiveCoupons(coupons);
      }
    } catch (error) {
      console.error('Failed to load active coupons:', error);
    }
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const loadProducts = async () => {
    const data = await fetchAvailableProducts();
    setProducts(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = {};
    if (searchName) params.name = searchName;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (searchMinPrice) params.minPrice = searchMinPrice;
    if (searchMaxPrice) params.maxPrice = searchMaxPrice;
    
    const data = await searchProducts(params);
    // Filter available products if they are using search because we don't have available flag in search API,
    // wait, we can just let them see all search results, or filter manually:
    setProducts(data.filter(p => p.stockQuantity > 0));
  };

  const syncCartState = (cartData) => {
    const nextMap = {};
    (cartData?.items || []).forEach((item) => {
      if (nextMap[item.productId]) {
        nextMap[item.productId].quantity += item.quantity;
        // For products with sizes, we don't need a single cartItemId on the Home page
      } else {
        nextMap[item.productId] = { cartItemId: item.id, quantity: item.quantity };
      }
    });
    setCartItemsByProduct(nextMap);
  };

  const loadCartState = async () => {
    try {
      const data = await fetchCart(Number(userId));
      syncCartState(data);
    } catch (error) {
      // Keep homepage usable even if cart API is temporarily unavailable.
    }
  };

  const filterProducts = async (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      await loadProducts();
      return;
    }
    const data = await fetchProductsByCategory(categoryId);
    setProducts(data);
  };

  const isLowStock = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.some(size => (size.quantity ?? 0) <= 10);
    }
    return product.stockQuantity <= 10;
  };

  const handleAddToCart = async (product) => {
    if (!userId) {
      setMessage('Please login to add items to the cart.');
      return;
    }
    
    // If product has sizes, show size selection modal
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProductForSize(product);
      setSelectedSize(null);
      setShowSizeModal(true);
      return;
    }
    
    // Otherwise add directly
    try {
      const data = await addToCart({ userId: Number(userId), productId: product.id, quantity: 1 });
      syncCartState(data);
      setMessage('Item added to cart');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add item');
    }
  };

  const handleConfirmSizeSelection = async () => {
    if (!selectedSize) {
      setMessage('Please select a size', true);
      return;
    }
    
    try {
      const data = await addToCart({ 
        userId: Number(userId), 
        productId: selectedProductForSize.id, 
        quantity: 1,
        sizeId: selectedSize.id 
      });
      syncCartState(data);
      setMessage('Item added to cart');
      setShowSizeModal(false);
      setSelectedProductForSize(null);
      setSelectedSize(null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not add item');
    }
  };

  const handleChangeQuantity = async (product, delta) => {
    if (!userId) {
      setMessage('Please login to update cart.');
      return;
    }

    const item = cartItemsByProduct[product.id];
    if (!item || updatingProductId === product.id) return;

    setUpdatingProductId(product.id);
    try {
      const data = await updateCartItemQuantity(Number(userId), item.cartItemId, delta);
      syncCartState(data);
      setMessage(delta > 0 ? 'Item quantity increased' : 'Item quantity decreased');
    } catch (error) {
      try {
        if (delta > 0) {
          const data = await addToCart({ userId: Number(userId), productId: product.id, quantity: 1 });
          syncCartState(data);
          setMessage('Item quantity increased');
        } else if (item.quantity <= 1) {
          const data = await removeCartItem(Number(userId), item.cartItemId);
          syncCartState(data);
          setMessage('Item removed from cart');
        } else {
          await removeCartItem(Number(userId), item.cartItemId);
          const data = await addToCart({
            userId: Number(userId),
            productId: product.id,
            quantity: item.quantity - 1,
          });
          syncCartState(data);
          setMessage('Item quantity decreased');
        }
      } catch (fallbackError) {
        setMessage(fallbackError.response?.data?.message || 'Could not update quantity');
      }
    } finally {
      setUpdatingProductId(null);
    }
  };

  return (
    <div className="page-container">
      {activeCoupons.length > 0 && (
        <div className="seasonal-banner-container">
          {activeCoupons.map((coupon, index) => (
            <div 
              key={coupon.id} 
              className={`seasonal-banner ${index === currentCouponIndex ? 'active' : ''}`}
            >
              <h2>{coupon.code.includes('SUMMER') ? 'Summer Special' : 
                   coupon.code.includes('WINTER') ? 'Winter Special' : 
                   coupon.code.includes('DIWALI') ? 'Diwali Special' : 'Special Offer'}</h2>
              <p>Limited time offer! Use code <strong>{coupon.code}</strong> at checkout for {coupon.discountPercentage}% off your entire order.</p>
            </div>
          ))}
          {activeCoupons.length > 1 && (
            <div className="carousel-dots">
              {activeCoupons.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${index === currentCouponIndex ? 'active' : ''}`}
                  onClick={() => setCurrentCouponIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      <h1>Menu</h1>
      <div className="filter-row">
        <button className={!selectedCategory ? 'active' : ''} onClick={() => filterProducts(null)}>
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={selectedCategory === category.id ? 'active' : ''}
            onClick={() => filterProducts(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      


      {message && <div className="message">{message}</div>}
      <div className="product-grid">
        {products.map((product) => {
          const cartEntry = cartItemsByProduct[product.id];
          return (
          <div key={product.id} className="card glass-panel" style={isLowStock(product) ? { border: '2px solid #dc2626', backgroundColor: '#fee2e2' } : {}}>
            <img
              className="product-image"
              src={product.imageUrl ? (product.imageUrl.startsWith('/uploads') ? `http://localhost:8083${product.imageUrl}` : product.imageUrl) : (productImageMap[product.name] || '/RetailOrdering/Margherita Pizza.jpg')}
              alt={product.name}
            />
            <h3>{product.name}</h3>
            {product.brand && <div className="product-brand">{product.brand}</div>}

            <p>{product.description}</p>
            <p className="price">₹{product.price.toFixed(2)}</p>
            {cartEntry ? (
              <div className="product-quantity-controls">
                <button
                  className="quantity-button"
                  onClick={() => handleChangeQuantity(product, -1)}
                  disabled={updatingProductId === product.id}
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  -
                </button>
                <span className="quantity-value">{cartEntry.quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => (product.sizes && product.sizes.length > 0) ? handleAddToCart(product) : handleChangeQuantity(product, 1)}
                  disabled={updatingProductId === product.id}
                  aria-label={`Increase ${product.name} quantity`}
                >
                  +
                </button>
              </div>
            ) : userRole !== 'ROLE_ADMIN' ? (
              <button className="primary" onClick={() => handleAddToCart(product)}>Add to cart</button>
            ) : (
              <button disabled>Admin (Cannot Order)</button>
            )}
          </div>
        )})}
      </div>

      {/* SIZE SELECTION MODAL */}
      {showSizeModal && selectedProductForSize && (
        <div className="modal-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Select Size for {selectedProductForSize.name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {selectedProductForSize.sizes.map(size => (
                <button
                  key={size.id}
                  className={`size-button ${selectedSize?.id === size.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  disabled={(size.quantity ?? 0) <= 0}
                  style={{
                    padding: '1rem',
                    border: selectedSize?.id === size.id ? '2px solid var(--accent)' : ((size.quantity ?? 0) <= 10 ? '2px solid #dc2626' : '1px solid #d1d5db'),
                    borderRadius: '8px',
                    background: selectedSize?.id === size.id ? 'var(--accent)' : ((size.quantity ?? 0) <= 10 ? '#fca5a5' : '#fff'),
                    color: selectedSize?.id === size.id ? '#fff' : ((size.quantity ?? 0) <= 10 ? '#991b1b' : 'inherit'),
                    cursor: (size.quantity ?? 0) <= 0 ? 'not-allowed' : 'pointer',
                    opacity: (size.quantity ?? 0) <= 0 ? 0.65 : 1,
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>{size.size}</div>
                  <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>₹{size.price.toFixed(2)}</div>
                  <div style={{ fontSize: '0.8rem', color: (size.quantity ?? 0) <= 10 && selectedSize?.id !== size.id ? '#991b1b' : '#6b7280', marginTop: '0.25rem' }}>
                    Qty: {size.quantity ?? 0}
                  </div>
                  {(size.quantity ?? 0) <= 0 && <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem' }}>Sold out</div>}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowSizeModal(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>Cancel</button>
              <button type="button" className="primary" onClick={handleConfirmSizeSelection}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
