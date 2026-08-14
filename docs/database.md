# FormFlow Database Schema & Entity-Relationship Specifications

FormFlow utilizes a normalized relational database schema designed for high performance, strict referential integrity, and immutable versioning.

---

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o{ workspaces : owns
    workspaces ||--o{ forms : contains
    forms ||--o{ questions : contains
    questions ||--o{ question_options : has
    forms ||--o{ form_versions : snapshots
    forms ||--o{ responses : receives
    form_versions ||--o{ responses : submitted_against
    responses ||--o{ response_answers : contains
    forms ||--o{ form_events : logs

    users {
        string id PK
        string name
        string email UK
        string password_hash
        string avatar_url
        datetime created_at
        datetime updated_at
        datetime last_login_at
    }

    workspaces {
        string id PK
        string name
        string owner_id FK
        datetime created_at
        datetime updated_at
    }

    forms {
        string id PK
        string workspace_id FK
        string title
        string description
        string slug UK
        string status
        string theme_id
        json theme_data
        string thank_you_title
        string thank_you_message
        boolean allow_back_navigation
        boolean show_progress
        datetime created_at
        datetime updated_at
        datetime published_at
    }

    questions {
        string id PK
        string form_id FK
        string type
        string title
        string description
        boolean required
        integer position
        json settings_json
        datetime created_at
        datetime updated_at
    }

    question_options {
        string id PK
        string question_id FK
        string label
        string value
        integer position
    }

    form_versions {
        string id PK
        string form_id FK
        integer version_number
        json snapshot_json
        datetime created_at
        datetime published_at
    }

    responses {
        string id PK
        string form_id FK
        string form_version_id FK
        string respondent_token
        datetime started_at
        datetime submitted_at
        integer completion_time_seconds
        string status
    }

    response_answers {
        string id PK
        string response_id FK
        string question_id
        json value
        datetime created_at
    }

    form_events {
        string id PK
        string form_id FK
        string response_id FK
        string event_type
        json metadata_json
        datetime created_at
    }
```

---

## 2. Table Definitions & Key Indexes

### 2.1 `users`
- Primary Key: `id` (UUID)
- Unique Index: `email` (lowercased)

### 2.2 `forms`
- Primary Key: `id` (UUID)
- Foreign Key: `workspace_id` -> `workspaces(id)`
- Unique Index: `slug`

### 2.3 `form_versions`
- Primary Key: `id` (UUID)
- Foreign Key: `form_id` -> `forms(id)`
- `snapshot_json`: Complete JSON payload of published form structure.

### 2.4 `responses`
- Primary Key: `id` (UUID)
- Foreign Keys: `form_id` -> `forms(id)`, `form_version_id` -> `form_versions(id)`
