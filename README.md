# AURA Backend

## Read this in other languages

- [Português (Brasil)](./docs/README.pt-BR.md)

Backend API for **AURA**, a makeup e-commerce platform.

A production-ready REST API built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and AWS S3.

This service provides authentication, product management, cart handling, order creation, and image uploads for the Aura store.  
The API follows a modular architecture and uses presigned URLs to upload product images directly to cloud storage.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Application logic and type safety |
| **Zod** | Request validation |
| **PostgreSQL (Neon)** | Cloud database |
| **Prisma ORM** | Database modeling and queries |
| **Prisma Migrate** | Database migrations |
| **AWS S3** | Product image storage |
| **Docker** | Containerized development environment |
| **Vitest** | Unit and integration testing |
| **Supertest** | HTTP endpoint testing |
| **Render** | Production deployment |

---

## Architecture

The backend uses a layered structure to separate responsibilities:

```
Controller → Service → Repository
```

This structure keeps business logic isolated from HTTP handling and database access.

---

## API Base URL

```
https://aura-backend-szzx.onrender.com/api/v1
```
---

## API Routes

### Auth

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

### Products

```http
GET /api/v1/products
GET /api/v1/products/:id
POST /api/v1/products
PATCH /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Cart

```http
GET /api/v1/cart
POST /api/v1/cart
PATCH /api/v1/cart/:productId
DELETE /api/v1/cart/:productId
```

### Orders

```http
GET /api/v1/orders
POST /api/v1/orders
GET /api/v1/orders/:id
```

### Uploads

```http
POST /api/v1/uploads/presign
```

Generates a **presigned URL** for uploading product images directly to **AWS S3**.

---

## Image Upload Flow

Product images are uploaded using **presigned URLs**.

### How it works

1. The client sends a request to the backend with:
   - `productId`
   - `filename`
   - `contentType`

2. The backend generates a **presigned URL** for AWS S3:

```http
POST /api/v1/uploads/presign
```

The backend returns an object like:

```json
{
  "key": "products/clx123abc/cover-171987123-image.png",
  "uploadUrl": "https://...",
  "publicUrl": "https://..."
}
```

The client uploads the file directly to S3 using the uploadUrl.

The returned `publicUrl` can be stored and used by the frontend to display the product image.

Example request

```json
{
  "productId": "clx123abc",
  "filename": "lipstick.png",
  "contentType": "image/png"
}
```

Frontend upload example

```ts
const presignResponse = await fetch(`${API_URL}/uploads/presign`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productId: "clx123abc",
    filename: file.name,
    contentType: file.type
  })
});

const { uploadUrl, publicUrl } = await presignResponse.json();

await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": file.type
  },
  body: file
});
```

### Why this approach

- avoids sending large files through the backend
- reduces server load
- improves scalability
- keeps uploads secure using temporary URLs

---

## Features

- JWT authentication
- Product management
- Shopping cart system
- Order creation
- Image upload using presigned URLs
- Modular architecture
- Automated API tests

---

## Security

- Request validation using **Zod**
- Restricted file upload types (`png`, `jpeg`, `webp`)
- Filename sanitization to prevent unsafe characters
- Presigned S3 URLs with short expiration time
- Environment variable validation at startup

---

## Error Handling

The API uses a centralized error handling strategy through a custom `AppError` class.

Operational errors return structured responses with appropriate HTTP status codes.

---

## Environment Configuration

Environment variables are managed through example files to keep secrets out of the repository.

```
.env.example
.env.docker.example
.env.test
```

The actual `.env` file is ignored by Git.

---

## Environment Validation

Environment variables are validated at startup through a centralized configuration file.

```
src/shared/config/env.ts
```

Required variables are checked before the server starts.  
If any variable is missing, the application throws an error and stops.

## Development

Create your environment file:

```bash
cp .env.example .env
```

### Docker

When running the project with Docker:

```bash
cp .env.docker.example .env
```
---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run db:test:migrate` | Run Prisma migrations for the test database |
| `npm run db:test:reset` | Reset the test database |
| `npm run db:test:studio` | Open Prisma Studio for the test database |

---

## Development Workflow

Typical development workflow:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

Run tests:

```bash
npm run test
```

## Database (Test Environment)

Run migrations for the test database:

```bash
npm run db:test:migrate
```

Reset the test database:

```bash
npm run db:test:reset
```

Open Prisma Studio:

```bash
npm run db:test:studio
```