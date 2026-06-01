# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fastify Core Starter is a production-ready Fastify boilerplate with TypeScript. It uses PostgreSQL via Kysely query builder, Redis queues with BullMQ, and includes security features, API documentation (Swagger/OpenAPI), and Sentry integration.

**Requirements**: Node.js v22 LTS or higher, Docker

## Common Commands

```bash
# Development
npm run dev:http         # Start HTTP server with hot-reload and inspector
npm run dev:worker       # Start worker process (BullMQ + scheduled jobs)
npm run build            # Compile TypeScript to dist/
npm run prod:http        # Run production HTTP server (requires build)
npm run prod:worker      # Run production worker process (requires build)

# Scripts (one-off, no HTTP server)
npm run script:run -- src/scripts/my-script.ts   # Run a one-off script

# Code Quality
npm run lint             # Run ESLint
npm run format           # Run Prettier

# Local Stack (Docker: PostgreSQL, Redis, Nginx, Portainer)
npm run initStack        # Start Docker services
npm run shutdownStack    # Stop Docker services
npm run rebuildStack     # Rebuild database

# Database
npm run kysely:codegen   # Generate TypeScript types from database schema
npm run db:migrate       # Run database migrations with postgrator
```

## Versioning & Dependency Hygiene

Before writing or suggesting any Node.js code, configuration, or tooling setup:

1. **Always check the current latest stable version** of any library, runtime, or tool involved.
   - Use `npm info <package> version` or check npmjs.com/registry
   - Do NOT rely on your training data for version numbers — they are stale by definition
   - Flag explicitly if a package has had breaking changes between the version you know and latest

2. **For Node.js itself**: check nodejs.org/en/download for the current LTS. Default to LTS unless the user specifies otherwise.

3. **For config files** (Dockerfile, docker-compose.yml, .github/workflows, tsconfig.json, eslint.config.js, etc.):
   - Always use the current recommended syntax for that tool's version
   - Call out deprecated fields explicitly (e.g., `version:` top-level key in Compose is now obsolete)
   - Reference official docs, not Stack Overflow or blog posts

4. **For Fastify, Prisma, Zod, TypeScript, etc.**: before generating code, confirm the API surface matches the installed or latest stable version. Many AI models hallucinate APIs from older major versions.

5. If you cannot verify a version at runtime, say so explicitly and provide the command the user should run to verify themselves.

## Architecture

### Plugin-Based Structure

The app uses Fastify's plugin system for modularity. Plugins are registered in dependency order in `src/app.ts`. Key patterns:

- **Repository Pattern**: Data access via decorated repositories (e.g., `account.repository.ts`)
- **Service Pattern**: Business logic via decorated services (e.g., `account.service.ts`)
- **Route Pattern**: Each route handler is a route file (e.g., `login.route.ts`)
- **TypeBox Schemas**: All request/response validation uses TypeBox with `Static<typeof schema>` for types
- **Dependency Injection**: Core libraries and domain layers are Fastify decorators (`fastify.kysely`, `fastify.accountRepository`, `fastify.accountService`, `fastify.bullmq`)

### Source Structure

```
src/
├── main.ts             # Single entry point - branches on APP_MODE (http | worker)
├── app.ts              # HTTP app plugin - registers HTTP-only plugins and routes
├── bootstrap.ts        # Standalone factory - boots Fastify with services, no HTTP (used by scripts)
├── common/             # Shared constants, enums, interfaces, schemas
├── lib/                # Core libraries (logger, kysely, redis, sentry)
├── modules/            # Domain modules
│   ├── index.ts        # HTTP modules entry (authentication + routes)
│   ├── servicePlugins.ts  # Business layer plugin - registers all repositories and services
│   ├── accounts/       # Account domain (repository, service, routes, interfaces)
│   ├── auth/           # Auth domain with routes/ and queue/
│   ├── activityLog/    # Activity log service
│   └── misc/           # Health/status endpoints
├── jobs/               # Scheduled job handlers and worker plugin (worker mode)
│   ├── index.ts        # Fastify plugin - starts Workers + registers scheduled jobs via upsertJobScheduler
│   └── *.job.ts        # Individual job handlers (pure functions, no Fastify dependency)
├── plugins/            # Fastify plugins (auth, bullmq, bullBoard, errors, hooks, swagger)
├── scripts/            # One-off scripts (run via npm run script:run)
│   ├── helpers/
│   │   └── runScript.ts   # Script runner utility - bootstraps app and handles shutdown
│   └── *.ts            # Individual scripts
├── utils/              # Utilities (env schema, server options, helpers)
└── @types/             # TypeScript type definitions
```

### Application Modes

The app has a single entry point (`src/main.ts`) that branches on the `APP_MODE` environment variable. The variable is read directly from `process.env` before Fastify initializes — it is **not** part of `configSchema`.

| `APP_MODE` | What starts                                | Use case                                   |
| ---------- | ------------------------------------------ | ------------------------------------------ |
| `http`     | Full HTTP server (swagger, routes, listen) | API server                                 |
| `worker`   | Fastify with DB + services, no HTTP        | BullMQ worker processes and scheduled jobs |

If `APP_MODE` is missing or has an unrecognized value the process exits immediately with an explicit error. Valid values are defined in the `AppMode` enum (`src/common/enum.ts`).

**Base setup (both modes):** `kyselyPlugin` + `bullmqPlugin` + `servicePlugins`

**HTTP-only additions:** `swaggerPlugin` + `bullBoardPlugin` + `app` (routes, cors, helmet, rate-limit) + `fastify.listen()`

**Worker-only additions:** `jobsPlugin` (Workers BullMQ + scheduled job registration)

### Scripts

Scripts are one-off processes that need the full business layer (services, repositories, Kysely) but no HTTP server.

**Utility files:**

- `src/bootstrap.ts` — boots a Fastify instance with env + kysely + servicePlugins, calls `ready()`, returns the instance. Used internally by `runScript`.
- `src/scripts/helpers/runScript.ts` — wraps `bootstrapApp()`, runs the provided function, then closes Fastify. Handles errors and `process.exitCode`.

**Writing a new script:**

```typescript
// src/scripts/my-script.ts
import { runScript } from "./helpers/runScript.js";

runScript(async fastify => {
  const { kysely } = fastify;
  // fastify.accountService, fastify.accountRepository, fastify.kysely all available
});
```

**Running a script:**

```bash
# Generic runner (pass the file path as argument)
npm run script:run -- src/scripts/my-script.ts

# Or add a dedicated npm script in package.json
"job:my-script": "tsx --env-file .env src/scripts/my-script.ts"
```

**When to add a dedicated npm script:** when a script is recurring or part of a scheduled job. Use `job:` as prefix (e.g., `job:delete-inactive-accounts`).

### Adding New Routes

Follow the pattern in `src/routes/auth/`:

1. Create route directory with `index.ts` for registration
2. Define schemas in `*.schema.ts` using TypeBox
3. Create route handlers in `routes/*.route.ts`
4. Register routes in parent `src/routes/index.ts`

### Service Layer

Services contain business logic and sit between routes and repositories. Routes should call services for business operations, not repositories directly.

**Layer responsibilities:**

- **Routes**: HTTP handling, request/response transformation, calling services
- **Services**: Business logic, orchestration, domain rules
- **Repositories**: Data access only (CRUD operations)

### Activity Logging

**Every route that produces a side effect (POST, PUT, PATCH, DELETE) must call `activityLogService` and create a record.** Read-only routes (GET) do not need to log.

The `activityLogService` is available via `fastify.activityLogService`. Call it after the operation succeeds, before returning the response.

**Fields:**

- `actorId` — ID of the entity performing the action (e.g. authenticated user ID)
- `actorType` — `ActorType.USER` or `ActorType.SYSTEM` (from `src/common/enum.ts`)
- `action` — plain string describing what happened (e.g. `"account.created"`, `"account.deleted"`)
- `resourceType` — `ResourceType.ACCOUNT`, etc. (from `src/common/enum.ts`). Add new values to the enum when introducing new domains.
- `resourceId` — ID of the affected resource
- `changes` — optional JSON with before/after data, or `null`

**Example — single record:**

```typescript
// In a route handler
const account = await fastify.accountService.createAccount(body);

await fastify.activityLogService.logActivity({
  actorId: request.user.id,
  actorType: ActorType.USER,
  action: "account.created",
  resourceType: ResourceType.ACCOUNT,
  resourceId: account.id,
  changes: null,
});

return account;
```

**Example — bulk (multiple resources affected):**

```typescript
await fastify.activityLogService.logBulkActivity(
  accounts.map(account => ({
    actorId: request.user.id,
    actorType: ActorType.USER,
    action: "account.updated",
    resourceType: ResourceType.ACCOUNT,
    resourceId: account.id,
    changes: null,
  })),
);
```

**When adding a new `ResourceType`:**

1. Add the value to the `ResourceType` enum in `src/common/enum.ts`
2. Re-run `npm run kysely:codegen` if the enum is database-backed

**Plugin naming convention:**

The `dependencies` array must reference plugins by their `name` property (e.g., `"account-repository"`), not by the decorator name (e.g., `"accountRepository"`).

### API Versioning

Routes are versioned via `Accept-Version` header (default: 1.0.0). Disable per-route with `disableVersioning: true` in route config.

### Queue Jobs (BullMQ)

Queue name and job name enums are defined in `src/common/constants.ts`. The worker process runs with `APP_MODE=worker` (`npm run dev:worker` / `npm run prod:worker`).

**Architettura cron job (regola obbligatoria)**

Il cron non esegue mai logica di business direttamente — si limita ad accodare un job. Il worker esegue la logica reale.

```
upsertJobScheduler (cron) → queue.add(JOB) → Worker: esegue la logica
```

**Fan-out (`addBulk`) — quando usarlo**

Il fan-out ha senso quando ogni elemento di una collezione richiede un'operazione **lenta o fallibile in modo indipendente**: inviare un'email, chiamare un'API esterna, processare un file. In questi casi vuoi retry per singolo record, non per l'intera collezione.

```
Worker (collect)
  → query N elementi → queue.addBulk([JOB x N])
      → Worker (process): operazione lenta/esterna su singolo elemento
```

**Fan-out — quando NON usarlo**

Se l'operazione su N record è una singola query SQL (bulk `UPDATE`, bulk `INSERT`), il fan-out è controproducente: il database gestisce migliaia di righe in una query in modo molto più efficiente di N job Redis. L'overhead di enqueue + storage + dequeue per N job supera largamente il beneficio.

Regola pratica: se l'operazione è un'istruzione SQL che lavora su più righe → eseguila direttamente nel job. Se l'operazione per ogni elemento chiama qualcosa di esterno al database (API, email, filesystem) → fan-out.

| Scenario                                   | Approccio                      |
| ------------------------------------------ | ------------------------------ |
| Soft-delete di N account inattivi          | Query bulk diretta nel job     |
| Invio email a N utenti                     | Fan-out — un job per email     |
| Aggiornamento stato ordini via API esterna | Fan-out — un job per ordine    |
| Pulizia sessioni scadute                   | Query bulk diretta nel job     |
| Export PDF per N documenti                 | Fan-out — un job per documento |

**Aggiungere un nuovo job schedulato:**

1. Aggiungere `SCHEDULER_ID` e `SCHEDULED_JOB_NAME` in `src/common/constants.ts`
2. Creare `src/jobs/my-job.job.ts` con gli handler (funzioni pure, usano singleton `kysely`/`loggerInstance`)
3. Aggiungere il `case` nello switch del Worker in `src/jobs/index.ts`
4. Registrare lo scheduler in `onReady` di `src/jobs/index.ts`:

```typescript
await fastify.bullmq.queue.upsertJobScheduler(
  SCHEDULER_ID.MY_JOB,
  { pattern: "0 2 * * *" },
  { name: SCHEDULED_JOB_NAME.MY_COLLECT_JOB, data: {} },
);
```

**Cambio di cron pattern:** `upsertJobScheduler` aggiorna la definizione esistente in Redis se lo `schedulerId` è lo stesso. Non crea duplicati al riavvio.

**Dashboard (HTTP mode):** Bull Board disponibile su `/queues` — mostra job schedulati, completati, falliti e permette retry manuali. Da proteggere con autenticazione prima di andare in produzione.

**Event-driven workers** (job accodati manualmente, non schedulati): seguire il pattern esistente in `src/modules/auth/queue/auth.worker.ts` — Worker singleton che usa `redisWorkerClient` e singleton diretti.

### Error Handling

The project uses a two-layer error system:

**1. Domain Errors** (`src/common/errors.ts`) - HTTP-agnostic errors thrown by services:

```typescript
import { EntityNotFoundError } from "../../common/errors.js";

// In service - throws domain error
async findAccount(accountId: string): Promise<Account> {
  const account = await accountRepository.findById(accountId);
  if (!account) {
    throw new EntityNotFoundError("account", accountId);
  }
  return account;
}
```

**2. HTTP Errors** (`src/plugins/commonClientErrors.plugin.ts`) - Convert domain errors to HTTP responses:

```typescript
// In route - catch domain error, convert to HTTP error
try {
  const account = await accountService.findAccount(id);
  return { ... };
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    return throwNotFoundError({ id: error.entityId, name: error.entityName });
  }
  throw error;
}
```

**Adding new domain errors:**

```typescript
// src/common/errors.ts
export class EntityNotFoundError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
  ) {
    super(`Entity '${entityName}' with '${entityId}' not found`);
  }
}
```

**Standard HTTP error response format:**

```json
{
  "statusCode": 404,
  "error": "Not found",
  "message": "Entity 'user' with 'xxx' not found",
  "internalCode": "NOT_FOUND",
  "details": { "entityId": "xxx", "entityName": "user" }
}
```

**Why two layers?**

- Services remain HTTP-agnostic (reusable in workers, CLI, etc.)
- Routes handle HTTP concerns (status codes, response format)
- Clear separation between business logic and HTTP layer

## API Documentation (Swagger/OpenAPI)

The project uses `@fastify/swagger` and `@fastify/swagger-ui` for auto-generated API documentation available at `/doc`.

### Adding New API Tags

When creating a new route domain (e.g., `accounts`, `products`), add a corresponding tag to the Swagger configuration:

1. Open `src/plugins/swagger.plugin.ts`
2. Add a new tag object to the `tags` array:

```typescript
tags: [
  { name: "accounts", description: "Accounts related end-points" },
  { name: "auth", description: "Auth related end-points" },
  { name: "misc", description: "Misc related end-points" },
].sort((a, b) => a.name.localeCompare(b.name)),
```

3. In the route's `index.ts`, use the `onRoute` hook to assign the tag:

```typescript
fastify.addHook("onRoute", options => {
  options.schema = {
    ...options.schema,
    tags: ["accounts"], // Must match the tag name in swagger.plugin.ts
  };
});
```

### Route Description Format

Use `buildRouteFullDescription()` from `src/utils/main.js` for consistent route descriptions:

```typescript
schema: {
  description: buildRouteFullDescription({
    api: "read account",
    description: "Get account by ID.",
    version,
    errors,
  }),
}
```

## Database (Kysely)

The project uses Kysely as a type-safe SQL query builder for PostgreSQL.

### Type Generation

Database types are automatically generated from the schema using kysely-codegen:

```bash
npm run kysely:codegen  # Generates src/generated/kysely/types.ts
```

Run this after any database schema changes. Generated types are committed to version control.

### Kysely Documentation

Kysely provides comprehensive LLM-friendly documentation for AI assistants. For complete query examples, patterns, and advanced features, refer to:

**Official Documentation:** https://kysely.dev/llms.txt

The documentation includes:

- **Query Operations**: SELECT, INSERT, UPDATE, DELETE, MERGE with various patterns
- **Advanced Features**: CTEs, transactions, joins (inner, aliased, complex, subquery)
- **WHERE Clauses**: Simple, complex, conditional, OR operations, IN lists
- **Recipes**: Conditional selects, data types, raw SQL, logging, migrations
- **Examples**: Nested objects/arrays, function calls, subqueries, and more

**Quick Reference - Common Patterns:**

```typescript
// INSERT with returning
await kysely
  .insertInto("account")
  .values(params)
  .returningAll()
  .executeTakeFirstOrThrow();

// SELECT with WHERE
await kysely
  .selectFrom("account")
  .selectAll()
  .where("email", "=", email)
  .executeTakeFirst();

// UPDATE with returning
await kysely
  .updateTable("account")
  .set({ firstName: "New" })
  .where("id", "=", id)
  .returningAll()
  .executeTakeFirstOrThrow();

// DELETE
await kysely
  .deleteFrom("account")
  .where("id", "=", id)
  .executeTakeFirstOrThrow();
```

For complex queries, joins, transactions, and advanced patterns, always consult the official documentation above.

### Accessing Kysely

- **In routes/repositories**: Use `fastify.kysely` (injected via plugin)
- **In workers**: Import singleton from `../lib/kysely.js`

### Migrations

Use plain SQL migrations with postgrator. Place migration files in `migrations/` directory.

**Table naming convention:** All table names must use **camelCase** (e.g., `activityLog`, `userProfile`). Column names also use camelCase, quoted for PostgreSQL (e.g., `"actorId"`, `"createdAt"`).

## Environment Variables

### Adding New Environment Variables

When adding a new environment variable, **automatically update all 5 files** to maintain consistency:

1. **`.env.example`** - Add the variable with empty value (or example value for non-secrets)
2. **`.env`** - Add the variable with appropriate local development value
3. **`src/utils/env.schema.ts`** - Add TypeBox validation (see patterns below)
4. **`README.md`** - Add row to the Environment Variables table with name, default, and description
5. **`.github/workflows/deploy.yml`** - Add to "Create .env file on VPS" step (line ~65-78)

### Naming Conventions

- Use **UPPER_SNAKE_CASE** for all environment variable names
- Group related variables (app config, database, external services)
- Prefix service-specific vars (e.g., `REDIS_*` for Redis)
- Use standard connection string variables where possible (e.g., `DATABASE_URL` for PostgreSQL)

### TypeBox Validation Patterns

Use these patterns in `src/utils/env.schema.ts`:

```typescript
// Required string
VAR_NAME: Type.String();

// Required string with default value
VAR_NAME: Type.String({ default: "default-value" });

// Required number
VAR_NAME: Type.Number();

// Required number with default
VAR_NAME: Type.Number({ default: 3000 });

// Required boolean with default
VAR_NAME: Type.Boolean({ default: false });

// Optional string (can be undefined)
VAR_NAME: Type.Optional(Type.String());

// String enum (limited choices)
VAR_NAME: StringEnum(["value1", "value2", "value3"]);
```

**When to use each:**

- `Type.String()` - Most config values, URLs, hostname
- `Type.Number()` - Ports, timeouts, numeric thresholds
- `Type.Boolean()` - Feature flags (always provide `{ default: false/true }`)
- `Type.Optional()` - Truly optional config (e.g., `SENTRY_DSN` only needed if Sentry enabled)
- `StringEnum()` - Limited set of valid values (e.g., log levels, environments)

### Handling Secrets vs Config Values

**Secrets** (API keys, passwords, tokens):

- In `.env.example`: Leave empty
- In `.env`: Use real value for local development
- In `deploy.yml`: Reference as `${{ secrets.VAR_NAME }}`
- GitHub secret must be configured in repo settings

**Regular config** (domains, ports, feature flags):

- In `.env.example`: Provide example or empty
- In `.env`: Use local development value
- In `deploy.yml`: Hardcode production value directly

### README.md Table Format

Add new variables to the table following this pattern:

```markdown
| Name | Default | Description |
| VAR_NAME | value/empty | Clear description of purpose |
```

- **Bold** the variable name if it's required (no default value)
- Center-align the Default column
- Keep descriptions concise but clear

### Current Environment Variables

**Required:** `APP_MODE`, `APP_ENV`, `API_DOMAIN`, `LOG_LEVEL`, `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`

**Optional:** `NODE_ENV`, `APP_NAME`, `SERVER_ADDRESS`, `SERVER_PORT`, `SENTRY_ENABLED`, `SENTRY_DSN`

> `APP_MODE` is read directly from `process.env` in `src/main.ts` and is **not** validated by TypeBox/configSchema. It does not need to be added to `src/utils/env.schema.ts`.

See [.env.example](.env.example) for all variables with defaults.

## Unit Testing

The project uses Vitest for unit testing with a mock-based approach for testing routes in isolation.

### Running Tests

```bash
npm test                 # Run all tests once
npx vitest               # Run tests in watch mode
```

### Test File Structure

- Test files are co-located with source files: `*.route.ts` → `*.route.test.ts`
- Test utilities live in `src/test/utils/`
- Pattern: `src/**/*.{test,spec}.ts`

```
src/
├── test/
│   └── utils/
│       ├── fastify.mock.ts      # Mock Fastify instance and request
│       ├── types.ts             # TypeScript interfaces for mocks
│       └── fixtures/            # Test data factories
│           └── account.fixture.ts
├── routes/
│   └── accounts/
│       └── routes/
│           ├── read.route.ts
│           └── read.route.test.ts  # Co-located test
```

### Writing Route Tests

Routes are tested by mocking the Fastify instance and calling the handler directly.

### Mock Utilities

**`createMockFastify(options?)`** - Creates a mock Fastify instance with:

- `accountRepository` - Mocked repository methods (`findById`, `findByEmail`, `createAccount`)
- `accountService` - Mocked service methods (`findAccount`)
- `commonClientErrors` - Mocked error handlers (`throwNotFoundError`)
- `bullmq` - Mocked queue (`queue.add`)
- `log` - Mocked logger
- `capturedHandler` - Captures the route handler for direct invocation

**`createMockRequest({ body?, params?, query? })`** - Creates a mock request object.

### Test Data Factories

Factories generate realistic test data using Faker. Located in `src/test/utils/fixtures/`.

```typescript
// Creating test data with defaults
const account = createMockAccount();

// Overriding specific fields
const account = createMockAccount({
  email: "specific@email.com",
  createdAt: new Date("2024-01-01"),
});
```

### What to Test

**DO test:**

- Handler business logic (happy path and edge cases)
- Repository method calls with correct arguments
- Repository method calls with correct arguments
- Response data shape and transformations
- Error handling (not found, validation errors)

**DO NOT test:**

- Route configuration (URL, method, version) - these are static values
- Schema definitions - TypeBox handles validation
- Fastify internals

### Adding New Mock Types

When adding new repositories or services:

1. Add interface to `src/test/utils/types.ts`:

```typescript
export interface MockNewRepository {
  findAll: Mock;
  create: Mock;
}

export interface MockNewService {
  doSomething: Mock;
}
```

2. Add factory function to `src/test/utils/fastify.mock.ts`:

```typescript
export function createMockNewRepository(): MockNewRepository {
  return {
    findAll: vi.fn(),
    create: vi.fn(),
  };
}

export function createMockNewService(): MockNewService {
  return {
    doSomething: vi.fn(),
  };
}
```

3. Add to `MockFastifyInstance` interface and `createMockFastify()` function.

**Testing services vs repositories:**

- **Routes** should mock services (not repositories) when services contain the business logic
- **Services** should mock repositories for unit testing service logic in isolation

## Integration Testing

Integration tests run against real Postgres and Redis instances via Docker. They test the full HTTP stack without mocking the database.

### Running Tests

```bash
npm run test:integration          # start containers, run tests, stop containers
npm run test:integration:watch    # watch mode (containers must already be running)
```

### Test File Structure

```
tests/
├── .env.test                          # env vars for the test DB/Redis
├── docker-compose.test.yml            # Postgres + Redis containers (tmpfs, no persistence)
├── vitest.integration.config.ts       # Vitest config (globalSetup, setupFiles, fileParallelism)
├── helpers/
│   ├── global-setup.ts                # runs once: loads .env.test, applies migrations
│   ├── setup.ts                       # afterEach: truncates all tables
│   ├── build-app.ts                   # getTestApp() factory — builds Fastify without listen()
│   └── seeds/                         # (optional) shared seed helpers across test files
└── modules/
    └── <domain>/
        ├── <route>.route.test.ts
        └── <entity>.seed.ts           # seed helpers co-located with the domain tests
```

### Vitest Configuration

- **`fileParallelism: false`** — test files run sequentially. Required to avoid race conditions on shared DB state and to prevent top-level await singletons (Kysely pool, Redis clients) from being re-initialized in parallel forks.
- **`globalSetup`** — runs once in the main process before any fork is spawned. Loads `tests/.env.test` via `dotenv.config()` and applies migrations by running `src/scripts/applyMigrations.ts` as a subprocess. Env vars set here are inherited by all worker forks.
- **`setupFiles`** — runs in every worker fork, registers `afterEach` that truncates all user tables (excluding `migrations`).

### Writing Integration Tests

**App factory** — call `getTestApp()` once per describe block in `beforeAll`. The factory builds the full Fastify app (same plugins as production, minus Swagger) and calls `ready()`. With `fileParallelism: false` the module is shared within the fork, so repeated calls return the cached instance:

```typescript
describe("GET /api/accounts/:id", () => {
  let app: FastifyInstance;
  let account: Selectable<Account>;

  beforeAll(async () => {
    app = await getTestApp();
    account = await seedAccount(); // seed shared data here
  });

  it("returns 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/accounts/${account.id}`,
      headers: { "accept-version": "1.0.0" },
    });
    expect(response.statusCode).toBe(200);
  });
});
```

**Hook execution order:**

```
beforeAll (describe)  → getTestApp() + seedAccount()
  afterEach (setup.ts)  → TRUNCATE              ← runs after each test
  test 1               → uses beforeAll data
  afterEach            → TRUNCATE
  test 2               → starts clean
```

`afterEach` (not `beforeEach`) is used for truncation so that `beforeAll` seeds survive until the first test runs.

**Seeds** — use Kysely directly (not HTTP calls). Co-locate seed files with the test domain and use `@faker-js/faker` for realistic random data:

```typescript
// tests/modules/accounts/account.seed.ts
import { faker } from "@faker-js/faker";

export async function seedAccount(
  overrides = {},
): Promise<Selectable<Account>> {
  return kysely
    .insertInto("account")
    .values({
      firstName: overrides.firstName ?? faker.person.firstName(),
      // ...
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}
```

**Versioned routes** require the `Accept-Version` header:

```typescript
headers: { "accept-version": "1.0.0" }
```

### Table cleanup

`setup.ts` truncates all tables in `public` schema except `migrations` (Postgrator's version table). New tables added via migrations are picked up automatically — no manual update needed.

`RESTART IDENTITY` is omitted because all tables use UUID PKs (`gen_random_uuid()`), which are not backed by sequences. `CASCADE` is included defensively for future FK constraints.

## Local Development Ports

- PostgreSQL: 6432
- Redis: 7379
- Nginx: 8080
- Portainer: 9000

## Git Workflow

Direct pushes to `main` are not allowed. All changes must go through Pull Requests.
