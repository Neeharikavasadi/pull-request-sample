import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8083/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const initialToken = sessionStorage.getItem('token');
if (initialToken) {
  api.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      sessionStorage.clear();
      // Optional: window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export async function login(user) {
  const response = await api.post('/auth/login', user);
  return response.data;
}

export async function register(user) {
  const response = await api.post('/auth/register', user);
  return response.data;
}

export async function fetchProducts() {
  const response = await api.get('/products');
  return response.data;
}

export async function fetchAvailableProducts() {
  const response = await api.get('/products/available');
  return response.data;
}

export async function searchProducts(params) {
  const response = await api.get('/products/search', { params });
  return response.data;
}

export async function addProduct(product) {
  const response = await api.post('/products', product);
  return response.data;
}

export async function updateProduct(productId, product) {
  const response = await api.put(`/products/${productId}`, product);
  return response.data;
}

export async function deleteProduct(productId) {
  const token = sessionStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  console.log('api.deleteProduct', { productId, config });
  const response = await api.delete(`/products/${productId}`, config);
  return response.data;
}

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/products/${productId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
}

export async function fetchProductsByCategory(categoryId) {
  const response = await api.get(`/products/category/${categoryId}`);
  return response.data;
}

export async function fetchCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function addCategory(category) {
  const response = await api.post('/categories', category);
  return response.data;
}

export async function deleteCategory(categoryId) {
  const token = sessionStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.delete(`/categories/${categoryId}`, config);
  return response.data;
}

export async function fetchCart(userId) {
  const response = await api.get(`/cart/${userId}`);
  return response.data;
}

export async function addToCart(payload) {
  const response = await api.post('/cart/add', payload);
  return response.data;
}

export async function removeCartItem(userId, itemId) {
  const response = await api.delete(`/cart/remove/${userId}/${itemId}`);
  return response.data;
}

export async function updateCartItemQuantity(userId, itemId, delta) {
  const response = await api.patch(`/cart/quantity/${userId}/${itemId}`, null, {
    params: { delta },
  });
  return response.data;
}

export async function placeOrder(userId, payload) {
  const response = await api.post(`/orders/${userId}`, payload);
  return response.data;
}

export async function fetchOrders(userId) {
  const response = await api.get(`/orders/${userId}`);
  return response.data;
}

export async function markOrderReceived(userId, orderId) {
  const response = await api.patch(`/orders/${userId}/${orderId}/receive`);
  return response.data;
}

export async function fetchAllOrders() {
  const response = await api.get('/orders');
  return response.data;
}

export async function addStock(productId, quantity) {
  const response = await api.patch(`/products/${productId}/stock`, { quantity });
  return response.data;
}

// Product Size Management APIs
export async function getProductSizes(productId) {
  const response = await api.get(`/products/${productId}/sizes`);
  return response.data;
}

export async function addProductSize(productId, size) {
  const response = await api.post(`/products/${productId}/sizes`, size);
  return response.data;
}

export async function updateProductSize(sizeId, size) {
  const response = await api.put(`/products/sizes/${sizeId}`, size);
  return response.data;
}

export async function deleteProductSize(sizeId) {
  const response = await api.delete(`/products/sizes/${sizeId}`);
  return response.data;
}

// Coupon Management APIs
export async function fetchCoupons() {
  const response = await api.get('/admin/coupons');
  return response.data;
}

export async function addCoupon(coupon) {
  const response = await api.post('/admin/coupons', coupon);
  return response.data;
}

export async function updateCoupon(couponId, coupon) {
  const response = await api.put(`/admin/coupons/${couponId}`, coupon);
  return response.data;
}

export async function deleteCoupon(couponId) {
  const response = await api.delete(`/admin/coupons/${couponId}`);
  return response.data;
}

export async function validateCoupon(code) {
  const response = await api.get(`/coupons/validate/${code}`);
  return response.data;
}

export async function fetchActiveCoupons() {
  const response = await api.get('/coupons/active');
  return response.data;
}

export default api;
