# FormFlow Architecture & Engineering Specifications

## 1. Executive Overview

FormFlow is a production-grade full-stack SaaS platform designed for building high-conversion, conversational form experiences ("Create forms people actually enjoy completing").

The system uses a decoupled client-server architecture:
- **Frontend**: Next.js App Router (TypeScript) with Tailwind CSS, Framer Motion, TanStack Query, Zod, and dnd-kit.
- **Backend**: Python FastAPI with SQLAlchemy 2.0 (async ORM), Pydantic v2 schemas, Alembic migrations, and JWT authentication.
- **Database**: SQLite (for local development/evaluation) with a 100% PostgreSQL-compatible SQLAlchemy 2.x ORM abstraction.

---

## 2. Core Architectural Pillars

### 2.1 Router → Service → Repository → Database Pattern
The backend enforces a clean separation of concerns:
1. **API Routers (`app/api/`)**: Handle HTTP request parsing, status codes, query parameters, and OpenAPI annotations. No raw database queries or business logic exist in router handlers.
2. **Service Layer (`app/services/`)**: Enforces business logic, domain invariants, ownership verification, server-side data validation, version snapshot generation, and transaction demarcation.
3. **ORM Layer (`app/models/`)**: SQLAlchemy 2.0 mapped models with explicit type hints (`Mapped`, `mapped_column`), foreign key relationships, cascade constraints, and indexes.

### 2.2 Immutable Form Versioning Architecture
To prevent edits to published forms from corrupting or mutating historical submission definitions:
- When a form is published, the backend executes `publish_form()`, which evaluates pre-publish health checks and creates an immutable snapshot record in `form_versions` (`snapshot_json`).
- `snapshot_json` captures the exact form metadata, questions, question types, validation rules, titles, and choice options at the time of publication.
- Public respondents submit answers against the `form_version_id`.
- The Individual Response view and analytics render answers against the exact historical snapshot definition, ensuring historical integrity even if questions are later modified or deleted from the active draft.

### 2.3 Server-Side Public Form Validation
Public form submissions are unauthenticated. The server treats incoming client data as untrusted:
- The server loads the published `FormVersion` snapshot.
- Every answer is validated against the version's required rules, min/max length, regex email format, numeric ranges, and option value sets.
- Submission persistence is wrapped in a single database transaction to guarantee atomicity.

---

## 3. Frontend Architecture & State Management

FormFlow separates client application state into three distinct domains:
1. **Server State**: Managed via **TanStack Query (React Query)** for caching, invalidation, and background synchronization.
2. **Editor & Local State**: Managed via **Zustand (`useBuilderStore`)** for active question selection, undo/redo history stack (bounded to 30 states), autosave state ("saving", "saved", "error"), command palette toggle, and modal controls.
3. **Respondent Local Progress Recovery**: Anonymous respondent progress is saved locally under `formflow_draft_{slug}`. When respondents return to an incomplete form, a recovery prompt allows them to resume or start fresh.

---

## 4. Production Deployment & Future Scaling

- **Database**: Swap `DATABASE_URL` from `sqlite+aiosqlite:///./formflow.db` to `postgresql+asyncpg://user:pass@host:5432/formflow` in `.env`.
- **Stateless Backend**: Backend instances are fully stateless. Authentication relies on JWT tokens.
- **Docker Compose**: Containerized with production-ready multi-stage builds (`backend/Dockerfile`, `frontend/Dockerfile`).
