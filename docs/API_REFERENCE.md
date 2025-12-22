# API Reference

Complete reference for all Puppet Master API endpoints.

## Authentication

### Session-Based Auth

Puppet Master uses session-based authentication with HTTP-only cookies:

1. **Login** - POST `/api/auth/login` returns session cookie + CSRF token
2. **Include cookies** - All requests must include `credentials: 'include'`
3. **CSRF header** - State-changing requests require `X-CSRF-Token` header

### Making Authenticated Requests

```typescript
async function apiRequest(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    }
  })
}
```

### Error Response Format

```json
{
  "statusCode": 401,
  "message": "Authentication required",
  "data": {}
}
```

| Code | Meaning |
|------|---------|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Forbidden (role or CSRF) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 423 | Account locked |
| 429 | Rate limited |
| 503 | Service unhealthy |

---

## Public Endpoints

### Health Check

```
GET /api/health
```

Returns server health status. Used by load balancers and monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": [
    { "name": "database", "status": "ok", "latency": 5 },
    { "name": "memory", "status": "ok", "message": "150MB / 500MB" }
  ],
  "responseTime": 12
}
```

| Status | HTTP Code |
|--------|-----------|
| `ok` | 200 |
| `degraded` | 200 |
| `unhealthy` | 503 |

---

### Settings

```
GET /api/settings
```

Returns public site settings grouped by category.

**Response:**
```json
{
  "contact": {
    "email": "hello@example.com",
    "phone": "+1234567890",
    "location": "New York, NY"
  },
  "social": {
    "instagram": "https://instagram.com/example",
    "telegram": "https://t.me/example"
  },
  "seo": {
    "title": "My Site",
    "description": "Site description"
  }
}
```

---

### Translations

```
GET /api/i18n/{locale}
```

Returns all translations for a specific locale.

**Parameters:**
- `locale` - Language code (e.g., `en`, `ru`, `he`)

**Response:**
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "hero": {
    "title": "Welcome",
    "subtitle": "..."
  }
}
```

---

### Contact Form

```
POST /api/contact/submit
```

Submit a contact form. Rate limited: 5 per hour per IP.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to inquire about..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

### Portfolios (Public)

```
GET /api/portfolios
```

Returns published portfolios.

**Query Parameters:**
- `type` - Filter by type: `gallery` | `case_study`

**Response:**
```json
[
  {
    "id": 1,
    "slug": "web-projects",
    "name": "Web Projects",
    "description": "...",
    "type": "gallery",
    "coverImageUrl": "/uploads/cover.webp",
    "coverThumbnailUrl": "/uploads/cover-thumb.webp"
  }
]
```

---

```
GET /api/portfolios/{id}
```

Returns single portfolio with items.

**Response:**
```json
{
  "id": 1,
  "slug": "web-projects",
  "name": "Web Projects",
  "type": "gallery",
  "items": [
    {
      "id": 1,
      "itemType": "image",
      "mediaUrl": "/uploads/image.webp",
      "thumbnailUrl": "/uploads/image-thumb.webp",
      "caption": "Project screenshot"
    }
  ]
}
```

---

## Authentication Endpoints

### Login

```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  },
  "csrfToken": "abc123..."
}
```

**Cookies Set:**
- `pm-session` - Session ID (httpOnly, secure)
- `pm-csrf` - CSRF token (httpOnly, secure)

---

### Logout

```
POST /api/auth/logout
```

Clears session and cookies.

**Response:**
```json
{
  "success": true
}
```

---

### Get Session

```
GET /api/auth/session
```

Returns current session and CSRF token.

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  },
  "csrfToken": "abc123..."
}
```

---

## User Endpoints

### Change Password

```
PUT /api/user/change-password
```

**Requires:** Authentication

**Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Admin Endpoints

All admin endpoints require authentication and appropriate role.

### Statistics

```
GET /api/admin/stats
```

**Requires:** Editor+

**Response:**
```json
{
  "portfolios": 5,
  "contacts": {
    "total": 100,
    "unread": 3
  },
  "users": 4
}
```

---

### Settings

```
PUT /api/admin/settings
```

**Requires:** Editor+

**Body:**
```json
{
  "contact.email": "new@example.com",
  "social.instagram": "https://instagram.com/new"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Contacts

```
GET /api/admin/contacts
```

**Requires:** Editor+

**Query:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "message": "...",
      "read": false,
      "createdAt": 1705315800000
    }
  ],
  "unreadCount": 3
}
```

---

```
PUT /api/admin/contacts/{id}
```

Update contact (mark as read).

**Body:**
```json
{
  "read": true
}
```

---

```
DELETE /api/admin/contacts/{id}
```

Delete contact submission.

---

### Users

```
GET /api/admin/users
```

**Requires:** Admin+

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

```
POST /api/admin/users
```

**Requires:** Admin+

**Body:**
```json
{
  "email": "new@example.com",
  "password": "password123",
  "name": "New User",
  "role": "editor"
}
```

**Response:**
```json
{
  "success": true,
  "id": 5
}
```

---

```
PUT /api/admin/users/{id}
```

**Requires:** Admin+

**Body:**
```json
{
  "name": "Updated Name",
  "role": "admin"
}
```

---

```
DELETE /api/admin/users/{id}
```

**Requires:** Admin+

---

### Translations

```
GET /api/admin/translations
```

**Requires:** Editor+

**Response:**
```json
{
  "locales": ["en", "ru", "he"],
  "content": {
    "en": [
      { "id": 1, "key": "hero.title", "value": "Welcome" }
    ]
  },
  "system": {
    "en": [
      { "id": 100, "key": "nav.home", "value": "Home" }
    ]
  },
  "canEditSystem": true
}
```

---

```
POST /api/admin/translations
```

Create or update translation.

**Body:**
```json
{
  "locale": "en",
  "key": "hero.title",
  "value": "New Title"
}
```

**Response:**
```json
{
  "success": true,
  "action": "updated",
  "id": 1
}
```

---

```
DELETE /api/admin/translations/{id}
```

Delete translation.

---

### Logs (Master Only)

```
GET /api/admin/logs
```

**Requires:** Master

Returns in-memory application logs (last 500 entries).

---

```
GET /api/admin/audit-logs
```

**Requires:** Master

**Query:**
- `limit` - Max entries (default: 50, max: 200)
- `offset` - Pagination offset
- `action` - Filter by action type
- `userId` - Filter by actor

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "action": "login",
      "userId": 1,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 100
}
```

---

### Health (Master Only)

```
GET /api/admin/health
```

**Requires:** Master

Extended health information including memory, CPU, database stats.

---

## Portfolio Management

### List Portfolios (Admin)

```
GET /api/portfolios
```

When authenticated, returns all portfolios including unpublished.

---

### Create Portfolio

```
POST /api/portfolios
```

**Requires:** Editor+

**Body:**
```json
{
  "name": "New Portfolio",
  "slug": "new-portfolio",
  "description": "Description",
  "type": "gallery",
  "published": false
}
```

---

### Update Portfolio

```
PUT /api/portfolios/{id}
```

**Requires:** Editor+

**Body:**
```json
{
  "name": "Updated Name",
  "published": true
}
```

---

### Delete Portfolio

```
DELETE /api/portfolios/{id}
```

**Requires:** Editor+

---

### Portfolio Items

```
GET /api/portfolios/{id}/items
```

**Query:**
- `type` - Filter by item type

---

```
POST /api/portfolios/{id}/items
```

**Body (Gallery Item):**
```json
{
  "itemType": "image",
  "mediaUrl": "/uploads/image.webp",
  "thumbnailUrl": "/uploads/thumb.webp",
  "caption": "Image caption"
}
```

**Body (Case Study):**
```json
{
  "itemType": "case_study",
  "slug": "project-name",
  "title": "Project Name",
  "description": "Short description",
  "content": "Full markdown content...",
  "category": "Web Design",
  "tags": "design, web, responsive"
}
```

---

```
PUT /api/portfolios/{id}/items/{itemId}
```

Update portfolio item.

---

```
DELETE /api/portfolios/{id}/items/{itemId}
```

Delete portfolio item.

---

```
POST /api/portfolios/{id}/items/reorder
```

Reorder portfolio items.

**Body:**
```json
{
  "items": [
    { "id": 3, "order": 0 },
    { "id": 1, "order": 1 },
    { "id": 2, "order": 2 }
  ]
}
```

---

## File Upload

### Upload Image

```
POST /api/upload/image
```

**Requires:** Editor+

**Body:** `multipart/form-data`
- `file` - Image file (max 10MB)

**Response:**
```json
{
  "url": "/uploads/image-1705315800.webp",
  "thumbnailUrl": "/uploads/image-1705315800-thumb.webp"
}
```

---

### Upload Video

```
POST /api/upload/video
```

**Requires:** Editor+

**Body:** `multipart/form-data`
- `file` - Video file (max 100MB, max 5 minutes)

**Response:**
```json
{
  "url": "/uploads/video-1705315800.mp4",
  "thumbnailUrl": "/uploads/video-1705315800-thumb.webp"
}
```

---

## WebSocket

```
WS /api/ws
```

WebSocket endpoint for real-time communication. See [WEBSOCKET.md](WEBSOCKET.md) for details.

---

## Pagination

Paginated endpoints accept:
- `page` - Page number (1-indexed)
- `limit` - Items per page (max 100)

Response includes:
```json
{
  "items": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 minutes |
| `/api/contact/submit` | 5 submissions | 60 minutes |
