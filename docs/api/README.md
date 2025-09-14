# API Documentation

This directory contains comprehensive API documentation for the 3D Virtual Classroom project.

## 📚 API Overview

The 3D Virtual Classroom consists of several interconnected APIs:

### Core Backend API (`/backend`)
- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT Bearer tokens
- **Content-Type**: `application/json`

### AI Services
- **Handwriting Recognition**: `http://localhost:5000`
- **LaTeX Conversion**: `http://localhost:5001`
- **External Integrations**: `http://localhost:5002`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Materials Management (Bookshelf)
- `GET /api/materials` - List all materials
- `POST /api/materials/upload` - Upload handwritten notes
- `GET /api/materials/:id` - Get specific material
- `PUT /api/materials/:id` - Update material metadata
- `DELETE /api/materials/:id` - Delete material
- `POST /api/materials/:id/process` - Trigger AI processing
- `GET /api/materials/:id/latex` - Get LaTeX version
- `GET /api/materials/:id/pdf` - Download PDF

### Forum (Bulletin Board)
- `GET /api/forum/posts` - List forum posts
- `POST /api/forum/posts` - Create new post
- `GET /api/forum/posts/:id` - Get specific post
- `PUT /api/forum/posts/:id` - Update post
- `DELETE /api/forum/posts/:id` - Delete post
- `POST /api/forum/posts/:id/comments` - Add comment
- `GET /api/forum/posts/:id/comments` - Get comments

### Scheduling (Desk)
- `GET /api/scheduling/availability` - Get educator availability
- `POST /api/scheduling/book` - Book a session
- `GET /api/scheduling/sessions` - List user sessions
- `PUT /api/scheduling/sessions/:id` - Update session
- `DELETE /api/scheduling/sessions/:id` - Cancel session

### AI Processing
- `POST /api/ai/handwriting/recognize` - Process handwriting image
- `POST /api/ai/latex/convert` - Convert text to LaTeX
- `GET /api/ai/status/:jobId` - Check processing status

## 📖 Detailed Documentation

- [Authentication API](./authentication.md)
- [Materials API](./materials.md)
- [Forum API](./forum.md)
- [Scheduling API](./scheduling.md)
- [AI Services API](./ai-services.md)

## 🔧 Development

### Testing APIs
```bash
# Start all services
npm run docker:up

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# Upload material
curl -X POST http://localhost:8000/api/materials/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@handwritten_notes.jpg"
```

### API Client Examples
- [JavaScript/TypeScript](./examples/javascript.md)
- [Python](./examples/python.md)
- [cURL](./examples/curl.md)

## 🚨 Error Handling

All APIs return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** to get an access token
2. **Include** the token in the `Authorization` header: `Bearer <token>`
3. **Refresh** the token before expiration
4. **Logout** to invalidate the token

### Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "educator|student",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## 📊 Rate Limiting

APIs implement rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **AI processing**: 5 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
