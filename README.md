# QTip Solution

## Running the Application

```bash
docker compose up --build
```

Then open [http://localhost:3000](http://localhost:3000)

To stop:
```bash
docker compose down
```

To reset the database:
```bash
docker compose down -v
```

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│  React + Vite   │     │  .NET 8 API     │     │                 │
│  (nginx:80)     │     │  (port 8080)    │     │  (port 5434)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
      :3000                   :5001
```

### Technology Choices

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript + Vite | Type safety, fast development |
| Backend | .NET 8 Minimal APIs | Clean, good for small focused APIs |
| Database | PostgreSQL | Reliable, great Docker support |
| Deployment | Docker Compose | Single command startup as required |

---

## Data Model

The schema separates tokenized content from sensitive values:

```
┌──────────────────────────┐       ┌──────────────────────────┐
│      Submissions         │       │    Classifications       │
├──────────────────────────┤       ├──────────────────────────┤
│ Id (PK)                  │◀──────│ SubmissionId (FK)        │
│ TokenizedText            │       │ Id (PK)                  │
│ CreatedAt                │       │ Token                    │
└──────────────────────────┘       │ OriginalValue            │
                                   │ ClassificationTag        │
                                   │ CreatedAt                │
                                   └──────────────────────────┘
```

**Example transformation:**

| Input | Stored in Submissions | Stored in Classifications |
|-------|----------------------|---------------------------|
| `Contact tiaan@test.com` | `Contact {{TKN-a1b2c3d4}}` | token: `{{TKN-a1b2c3d4}}`, original: `tiaan@test.com`, tag: `pii.email` |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submissions` | POST | Submit text for PII detection and tokenization |
| `/api/statistics` | GET | Get total count of PII emails detected |

### POST /api/submissions

**Request:**
```json
{ "text": "Contact tiaan@example.com for details" }
```

**Response:**
```json
{ "submissionId": "uuid", "piiCount": 1 }
```

### GET /api/statistics

**Response:**
```json
{ "totalPiiEmails": 42 }
```

---

## Architectural Decisions

### 1. Minimal API over MVC Controllers
I chose .NET 8 Minimal APIs for reduced boilerplate. For a small API with 2 endpoints, full MVC would be overkill.

### 2. Direct EF Core usage (no repository pattern)
The scope is small enough that abstracting data access adds complexity without benefit. Direct `DbContext` usage in endpoint handlers keeps the code simple and readable.

### 3. Overlay-based highlighting
I used a transparent textarea over a styled backdrop div for email highlighting. This is simpler than `contenteditable` and avoids cursor/selection issues.

### 4. Auto-migration on startup
Database migrations run automatically when the backend starts. Appropriate for a demo application, production would use explicit migration deployment.

### 5. Nginx as frontend server + API proxy
The frontend nginx container serves static files and proxies `/api/*` requests to the backend. This removes CORS complexity in production and mirrors a typical deployment setup.

---

## Trade-offs and Shortcuts

| Decision | Trade-off |
|----------|-----------|
| Single regex for email detection | Good enough for demonstration, production would need RFC 5322 compliant parsing |
| No input validation | Assumed valid input for scope, production would validate request bodies |
| No error handling UI | Errors log to console, production would show user-friendly messages |
| No tests | Time constraint, would add unit tests for tokenization logic and integration tests for API |
| Hardcoded token format | `{{TKN-xxxxxxxx}}` format is fixed, could be configurable |

---

## Project Structure

```
qtip-valuation/
├── docker-compose.yml
├── backend/
│   └── QTip.Api/
│       ├── Program.cs              # API endpoints + service logic
│       ├── Data/
│       │   ├── AppDbContext.cs     # EF Core context
│       │   ├── Submission.cs       # Tokenized text entity
│       │   └── Classification.cs   # PII vault entity
│       ├── Models/
│       │   ├── SubmitRequest.cs
│       │   ├── SubmitResponse.cs
│       │   └── StatisticsResponse.cs
│       ├── Migrations/
│       └── Dockerfile
└── frontend/
    ├── src/
    │   ├── App.tsx                 # Main component
    │   ├── api.ts                  # API client
    │   └── components/
    │       ├── TextInput.tsx       # Input with highlighting
    │       └── StatsPanel.tsx      # Statistics display
    ├── nginx.conf
    └── Dockerfile
```

---

## Optional Extension

The current design supports multiple classification types by:
- Adding more regex patterns to the detection logic
- Using different `ClassificationTag` values (for example `pii.phone`, `finance.iban`)
- No schema changes required

This would be implemented as a configuration object rather than a full plugin system, keeping complexity appropriate for the scope.
