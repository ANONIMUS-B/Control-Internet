---
name: api-design
description: Design, review, and standardize RESTful, GraphQL, and RPC APIs. Enforces consistent HTTP methods, status codes, payload structures, pagination, filtering, authentication headers, error formats, and versioning. Trigger when creating or modifying API endpoints, designing backend responses, or integrating services.
---

# API Design & Standardization

Design predictable, developer-friendly, and standardized APIs that are easy to consume, maintain, and version.

## Core Principles

1. **Predictability Over Cleverness**: An API consumer should be able to guess endpoint names, payload structures, and error formats once they understand one resource.
2. **Proper HTTP Semantics**: Never return `200 OK` for an error. Use HTTP status codes accurately to indicate outcome.
3. **Consistent Response Envelopes**: Always structure responses predictably across all endpoints.

---

## 5 Design Standards

### 1. Resource Naming & URI Conventions
* Use **nouns in plural** for resources: `/api/v1/memberships`, `/api/v1/classes`, `/api/v1/users`.
* Use nested routes only for dependent sub-resources (max 2 levels deep):
  * Good: `/api/v1/users/{user}/memberships`
  * Avoid: `/api/v1/gyms/{gym}/rooms/{room}/classes/{class}/bookings/{booking}` (flatten to `/api/v1/bookings/{booking}`).
* Use **kebab-case** for multi-word URI segments: `/api/v1/payment-methods`.
* Use **camelCase** or **snake_case** consistently for JSON keys (never mix both in the same API).

### 2. HTTP Methods & Idempotency
| Method | Purpose | Idempotent | Expected Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | Retrieve resource(s) | Yes | `200 OK` |
| `POST` | Create a new resource | No | `201 Created` |
| `PUT` | Full replacement of resource | Yes | `200 OK` or `204 No Content` |
| `PATCH` | Partial update of resource | No | `200 OK` |
| `DELETE` | Remove a resource | Yes | `200 OK` or `204 No Content` |

### 3. HTTP Status Codes Matrix
* **2xx (Success)**:
  * `200 OK`: Request succeeded with payload.
  * `201 Created`: Resource created successfully (include `Location` header or created object).
  * `204 No Content`: Action succeeded with no body returned (common on `DELETE`).
* **4xx (Client Errors)**:
  * `400 Bad Request`: Malformed JSON or syntax error.
  * `401 Unauthorized`: Authentication missing or invalid token.
  * `403 Forbidden`: Authenticated, but lacks permission for this action.
  * `404 Not Found`: Resource does not exist.
  * `422 Unprocessable Content`: Validation failure on request body.
  * `429 Too Many Requests`: Rate limit exceeded.
* **5xx (Server Errors)**:
  * `500 Internal Server Error`: Unhandled server exception.

### 4. Standard Response Envelope

#### Success Response
```json
{
  "data": {
    "id": "mem_98231",
    "name": "Plan Trimestral",
    "price": 350.00,
    "status": "active"
  }
}
```

#### Paginated Response
```json
{
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 120,
    "last_page": 8
  },
  "links": {
    "next": "/api/v1/memberships?page=2",
    "prev": null
  }
}
```

#### Error Response (RFC 7807 compatible)
```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "email": [
      "El correo electrónico ya ha sido registrado."
    ]
  }
}
```

### 5. Filtering, Sorting & Pagination
* **Filtering**: Pass query parameters matching column or filter names: `GET /api/v1/users?status=active&role=member`.
* **Sorting**: Use a `sort` parameter with `-` prefix for descending: `GET /api/v1/classes?sort=-created_at,name`.
* **Pagination**: Always paginate unbounded collections. Default to 15-25 items per page. Limit maximum requested page size (`max: 100`).
