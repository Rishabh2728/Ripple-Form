# FormFlow API Documentation

FastAPI provides automatic interactive OpenAPI documentation accessible at:
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI Schema**: `/openapi.json`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new creator user and initializes their default workspace.

**Request Body**:
```json
{
  "name": "Alex Morgan",
  "email": "alex@company.com",
  "password": "securepassword123"
}
```

**Response (201 Created)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": "usr_123",
    "name": "Alex Morgan",
    "email": "alex@company.com",
    "workspace_id": "ws_456",
    "workspace_name": "Alex Morgan's Workspace"
  }
}
```

### `POST /api/auth/login`
Authenticates creator credentials and issues a JWT token.

---

## 2. Forms Endpoints

### `GET /api/forms`
Lists all forms belonging to the authenticated creator's workspace.
- **Query Params**: `status` (`draft`, `published`, `archived`)

### `POST /api/forms`
Creates a new form.

### `POST /api/forms/{id}/publish`
Validates form health and creates an immutable published `FormVersion` snapshot.

---

## 3. Public Respondent Endpoints

### `GET /api/public/forms/{slug}`
Retrieves published form snapshot definition for respondent completion. Unauthenticated.

### `POST /api/public/forms/{slug}/responses`
Submits respondent answers. Performs server-side validation against the published form snapshot.

---

## 4. Responses & Analytics

### `GET /api/forms/{id}/analytics`
Returns total views, completions, completion rate %, average time, question choice distributions, star ratings, and Net Promoter Score (NPS).

### `GET /api/forms/{id}/responses/export`
Exports form responses in RFC4180 CSV format.
