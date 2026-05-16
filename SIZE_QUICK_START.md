# Size Management Feature - Quick Start Guide

## 🎯 What's New?

Admins can now define multiple sizes for each product with custom prices!

**Examples:**
- 🍕 Pizza: Regular ($200) | Medium ($300) | Large ($400)
- 🥤 Drinks: 500ml ($50) | 1L ($80) | 2L ($120)
- 🍞 Breads: Small | Medium | Large

---

## 📱 Admin How-To

### Step 1: Go to Admin Panel
- Login as admin
- Click "Inventory" tab

### Step 2: Manage Product Sizes
For any product:
1. Click **"Sizes"** button (new!)
2. Fill in size name + price
3. Click **"Add Size"**

### Step 3: Edit or Delete
- **Edit**: Click "Edit" on any size, modify, click "Save"
- **Delete**: Click "Delete" and confirm

---

## 🛒 Customer How-To

### Step 1: Browse Menu
- View all products on homepage

### Step 2: Add Product with Size
- Click **"Add to cart"** on any product
- If product has sizes, a modal appears
- **Select your preferred size** from the options
- See the price for that specific size
- Click **"Add to Cart"**

### Step 3: Proceed
- Continue shopping or go to checkout

---

## 🔧 Technical Details

### Endpoints (Admin Only)

```
GET    /api/products/{productId}/sizes       → Get all sizes
POST   /api/products/{productId}/sizes       → Add new size
PUT    /api/products/sizes/{sizeId}          → Edit size
DELETE /api/products/sizes/{sizeId}          → Delete size
```

### Database
- **Table**: `product_sizes`
- **Fields**: id, product_id, size, price
- **Relationship**: Many sizes per product

### Files Modified
- Backend: ProductService.java, ProductController.java
- Frontend: AdminPage.js, HomePage.js, api.js
- New file: ProductSizeRepository.java

---

## ✨ Features

✅ Add unlimited sizes per product  
✅ Custom price for each size  
✅ Edit sizes anytime  
✅ Delete sizes (confirmation prompt)  
✅ Size selection modal for customers  
✅ Admin-only protection  
✅ Real-time updates  
✅ Fully integrated with cart system  

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Size modal not showing | Product must have sizes defined in admin panel first |
| Price not showing | Ensure size has valid price entered (non-negative) |
| Can't delete size | Only admins can manage sizes - login check |
| Size not appearing | Refresh page or check browser console for errors |

---

## 📝 Notes

- Sizes are optional - products can still be added without sizes
- Each size can have a unique price
- Changing sizes doesn't affect existing orders
- Size information is returned in all product API calls
