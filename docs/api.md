# TaskFlow API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require the `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "secure123"
}
```

**Response 201:**
```json
{
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "657f...",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "bio": "",
    "avatar": "",
    "role": "user",
    "createdAt": "2024-12-17T10:00:00.000Z"
  }
}
```

**Validation Errors 400:**
```json
{
  "errors": [
    { "path": "email", "msg": "Valid email required" },
    { "path": "password", "msg": "Password must contain a number" }
  ]
}
```

---

### POST /auth/login

Sign in to get a JWT token.

**Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "secure123"
}
```

**Response 200:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Error 401:**
```json
{ "error": "Invalid email or password." }
```

---

### GET /auth/me

Get the currently authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user": {
    "_id": "657f...",
    "name": "Alex Johnson",
    "email": "alex@example.com"
  }
}
```

---

## Users

### GET /users/profile

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user": {
    "_id": "657f...",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "bio": "Product designer",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

---

### PUT /users/profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Alex J.",
  "bio": "Full-stack developer",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response 200:**
```json
{
  "message": "Profile updated.",
  "user": { ... }
}
```

---

### PUT /users/password

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldPassword1",
  "newPassword": "newSecure2"
}
```

**Response 200:**
```json
{ "message": "Password changed successfully." }
```

---

## Tasks

### GET /tasks

List tasks with optional filtering, sorting, and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by: `todo`, `in-progress`, `done` |
| priority | string | Filter by: `low`, `medium`, `high` |
| search | string | Search title and description |
| sortBy | string | Sort field: `createdAt`, `title`, `dueDate` |
| order | string | `asc` or `desc` (default: `desc`) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20) |

**Response 200:**
```json
{
  "tasks": [
    {
      "_id": "657f...",
      "title": "Build login page",
      "description": "React form with validation",
      "status": "in-progress",
      "priority": "high",
      "tags": ["frontend", "auth"],
      "dueDate": "2024-12-20T00:00:00.000Z",
      "user": "657f...",
      "createdAt": "2024-12-17T10:00:00.000Z",
      "updatedAt": "2024-12-17T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### GET /tasks/stats

Get task count statistics.

**Response 200:**
```json
{
  "stats": {
    "todo": 5,
    "in-progress": 3,
    "done": 12,
    "total": 20
  }
}
```

---

### GET /tasks/:id

Get a single task.

**Response 200:**
```json
{
  "task": { ... }
}
```

---

### POST /tasks

Create a new task.

**Request Body:**
```json
{
  "title": "Design dashboard",
  "description": "Create wireframes for main dashboard",
  "status": "todo",
  "priority": "high",
  "tags": ["design", "ui"],
  "dueDate": "2024-12-25"
}
```

**Response 201:**
```json
{
  "message": "Task created.",
  "task": { ... }
}
```

---

### PUT /tasks/:id

Update an existing task. All fields are optional.

**Request Body:** Same as POST

**Response 200:**
```json
{
  "message": "Task updated.",
  "task": { ... }
}
```

---

### DELETE /tasks/:id

Delete a task.

**Response 200:**
```json
{ "message": "Task deleted." }
```

---

## Error Responses

All endpoints return errors in this format:

```json
{ "error": "Human-readable error message." }
```

Or for validation errors:
```json
{
  "errors": [
    { "path": "fieldName", "msg": "Validation message" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (e.g. email taken) |
| 429 | Rate limit exceeded |
| 500 | Server error |
