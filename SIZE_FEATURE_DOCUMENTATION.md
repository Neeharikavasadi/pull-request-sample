# Product Size Management Feature Documentation

## Overview
A complete product size management system has been implemented to allow admins to define different sizes for products with individual prices. For example:
- **Pizzas**: Regular, Medium, Large
- **Drinks**: 500ml, 1L, 2L
- **Any product**: with flexible size definitions

## Architecture

### Backend Implementation

#### 1. **Database Model** (`ProductSize.java`)
- **Entity**: `ProductSize` 
- **Relationship**: Many-to-One with `Product`
- **Fields**:
  - `id` (Long): Primary key
  - `product` (Product): Parent product reference
  - `size` (String): Size name (e.g., "Large", "1L", "Regular")
  - `price` (BigDecimal): Size-specific price

#### 2. **Repository** (`ProductSizeRepository.java`)
```java
public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    List<ProductSize> findByProductId(Long productId);
}
```
- Provides database operations for ProductSize entities
- Query method to fetch all sizes for a specific product

#### 3. **Data Transfer Objects**

**ProductSizeRequest.java** (Input)
```java
{
  "size": "Large",
  "price": 250.00
}
```

**ProductSizeResponse.java** (Output)
```java
{
  "id": 1,
  "size": "Large",
  "price": 250.00
}
```

#### 4. **Service Layer** (`ProductService.java`)

**Size Management Methods:**
```java
// Fetch all sizes for a product
List<ProductSize> getProductSizes(Long productId)

// Add a new size to a product
ProductSize addProductSize(Long productId, ProductSizeRequest request)

// Update an existing size
ProductSize updateProductSize(Long sizeId, ProductSizeRequest request)

// Delete a size
void deleteProductSize(Long sizeId)
```

**Product CRUD with Sizes:**
- `addProduct()` - Creates product with optional sizes from `ProductRequest`
- `updateProduct()` - Updates product and replaces all sizes with new ones

#### 5. **Controller** (`ProductController.java`)

**REST Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/{productId}/sizes` | Fetch all sizes for a product |
| POST | `/api/products/{productId}/sizes` | Add a new size to product |
| PUT | `/api/products/sizes/{sizeId}` | Update a specific size |
| DELETE | `/api/products/sizes/{sizeId}` | Delete a specific size |

**Response Mapping:**
- Updated `mapToResponse()` to include sizes in ProductResponse
- All product endpoints now return full size information

### Frontend Implementation

#### 1. **API Functions** (`frontend/src/api.js`)
```javascript
getProductSizes(productId) // GET sizes for product
addProductSize(productId, size) // POST new size
updateProductSize(sizeId, size) // PUT update size
deleteProductSize(sizeId) // DELETE size
```

#### 2. **Admin Interface** (`AdminPage.js`)

**Size Management Modal:**
- **View**: Tab button "Sizes" in the product actions
- **Features**:
  - Add new sizes with name and price
  - Edit existing sizes inline
  - Delete sizes with confirmation
  - Real-time updates

**Implementation:**
- New state variables for size management
- Modal dialog for managing sizes
- Form validation for size name and price
- Error handling with user feedback

#### 3. **Customer Interface** (`HomePage.js`)

**Size Selection on Add to Cart:**
- Products with sizes show a **"Select Size"** modal when adding to cart
- Modal displays all available sizes with their prices
- Customer selects size before adding to cart
- Size information is passed with the cart item

**Implementation:**
- Modal overlay with size selection grid
- Visual feedback for selected size
- Confirmation button to add to cart with selected size

## Data Flow Examples

### Admin Adding Sizes to Pizza Product

1. Admin clicks "Edit" on Margherita Pizza → Opens product form
2. Admin clicks "Sizes" button → Opens size management modal
3. Admin enters:
   - Size: "Regular" → Price: 200
   - Size: "Medium" → Price: 300
   - Size: "Large" → Price: 400
4. System stores in `product_sizes` table with `product_id` reference

### Customer Ordering Pizza

1. Customer sees Margherita Pizza on homepage
2. Clicks "Add to cart"
3. Size selection modal appears showing:
   - Regular - ₹200
   - Medium - ₹300
   - Large - ₹400
4. Customer selects "Large"
5. Cart receives item with `sizeId` for price calculation

## Database Schema

```sql
-- Existing table
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  ...
);

-- New sizes table
CREATE TABLE product_sizes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  size VARCHAR(100),
  price DECIMAL(10,2),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## API Request/Response Examples

### Get Product with Sizes
**Request:** `GET /api/products`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Margherita Pizza",
    "price": 300.00,
    "category": "Pizzas",
    "sizes": [
      {
        "id": 10,
        "size": "Regular",
        "price": 200.00
      },
      {
        "id": 11,
        "size": "Large",
        "price": 400.00
      }
    ]
  }
]
```

### Add Size to Product
**Request:** `POST /api/products/1/sizes`
```json
{
  "size": "Extra Large",
  "price": 500.00
}
```

**Response:**
```json
{
  "id": 12,
  "size": "Extra Large",
  "price": 500.00
}
```

### Update Size
**Request:** `PUT /api/products/sizes/10`
```json
{
  "size": "Small",
  "price": 150.00
}
```

## Security

- All size management endpoints require **ADMIN** role
- Authorization check: `authorizationService.validateAdminAccess()`
- Size operations tied to authenticated admin users only

## Validation

**Backend:**
- Size name cannot be null/empty
- Price must be non-negative
- Product must exist before adding sizes

**Frontend:**
- Both fields required in size form
- Price validated as number
- Confirmation dialogs for destructive operations

## File Changes Summary

### Backend Files
1. **New**: `ProductSizeRepository.java` - Data access layer
2. **Modified**: `ProductService.java` - Added size management methods
3. **Modified**: `ProductController.java` - Added size REST endpoints, fixed response mapping

### Frontend Files
1. **Modified**: `api.js` - Added 4 new API functions
2. **Modified**: `AdminPage.js` - Added size management UI and modal
3. **Modified**: `HomePage.js` - Added size selection on cart add

## Usage Instructions

### For Admin:
1. Navigate to Admin Panel → Inventory
2. Click "Sizes" button on any product
3. Enter size name (e.g., "Large", "1L") and price
4. Click "Add Size"
5. Edit or delete existing sizes as needed

### For Customer:
1. Browse products on homepage
2. If product has sizes, a "Select Size" modal appears when clicking "Add to cart"
3. Choose preferred size and confirm
4. Item added to cart with size-specific price

## Future Enhancements

- Size selection in cart (change size for existing items)
- Size-specific inventory tracking
- Size recommendations based on category
- Bulk size management across multiple products
- Size templates for common categories
