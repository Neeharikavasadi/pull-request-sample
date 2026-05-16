# Retail Ordering Website

A beginner-friendly full-stack application for browsing pizza, drinks, and breads, adding items to a cart, and placing orders.

## Tech Stack

- Backend: Spring Boot, Spring Data JPA, MySQL
- Frontend: React, React Router, Axios

## Project Structure

- `src/main/java/com/example/RetailOrderingWebsite/` - Spring Boot backend source
- `src/main/resources/application.properties` - backend configuration
- `frontend/` - React frontend app

## Backend Setup

1. Create a MySQL database:

```sql
CREATE DATABASE retail_ordering_db;
```

2. Update `src/main/resources/application.properties` with your MySQL username and password.

3. Run the backend:

```bash
./mvnw spring-boot:run
```

The backend runs on `http://localhost:8080`.

## Frontend Setup

1. Change into the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend runs on `http://localhost:3000`.

## Production Build

1. From the `frontend/` directory, run:

```bash
npm run build
```

2. The production build will be emitted to `frontend/build`.

> If you need to serve the built files from a static server, use tools like `serve` or configure your own web server to point to `frontend/build`.

## Frontend Troubleshooting

- If `npm install` fails, make sure you have Node.js 18+ installed.
- If `npm start` fails due to missing scripts, verify `react-scripts` is installed and included in `frontend/package.json`.
- If the frontend cannot reach the backend, confirm the backend is running on `http://localhost:8080` and CORS is enabled.

## API Endpoints

### Authentication

- `POST /api/auth/register`
  - Request body: `{ "username": "user", "email": "user@example.com", "password": "pass" }`
  - Response: `{ "userId": 1, "username": "user", "message": "Registration successful" }`

- `POST /api/auth/login`
  - Request body: `{ "username": "user", "password": "pass" }`

### Products

- `GET /api/products`
- `GET /api/products/category/{categoryId}`
- `GET /api/categories`

### Cart

- `POST /api/cart/add`
  - Request body: `{ "userId": 1, "productId": 2, "quantity": 1 }`
- `GET /api/cart/{userId}`
- `DELETE /api/cart/remove/{userId}/{cartItemId}`
- `PATCH /api/cart/quantity/{userId}/{cartItemId}?delta=1`

### Orders

- `POST /api/orders/{userId}`
- `GET /api/orders/{userId}`
- `PATCH /api/orders/{userId}/{orderId}/receive`

## Security and Operations

- JWT authentication with protected cart/order routes
- Authorization checks enforcing user ownership on cart/order APIs
- Request rate limiting using Bucket4j (`429 Too Many Requests`)
- Inventory validation on cart updates and order placement

## API Validation (Swagger)

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Notes

- The backend seeds sample categories and products on first startup.
- The frontend stores logged-in user details and loyalty points in `localStorage`.
- Real order confirmation email is supported when SMTP is configured in `application.properties`.
- GitHub CI build pipeline is included at `.github/workflows/ci.yml`.
