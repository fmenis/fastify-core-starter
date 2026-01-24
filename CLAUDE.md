# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fastify Core Starter is a production-ready Fastify boilerplate with TypeScript. It uses PostgreSQL via Kysely query builder, Redis queues with BullMQ, and includes security features, API documentation (Swagger/OpenAPI), and Sentry integration.

**Requirements**: Node.js v22 LTS or higher, Docker

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot-reload and inspector
npm run build            # Compile TypeScript to dist/
npm start                # Run production build

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

## Architecture

### Plugin-Based Structure

The app uses Fastify's plugin system for modularity. Plugins are registered in dependency order in `src/app.ts`. Key patterns:

- **Repository Pattern**: Data access via decorated repositories (e.g., `account.repository.ts`)
- **Use Case Pattern**: Each route handler is a use case file (e.g., `login.usecase.ts`)
- **TypeBox Schemas**: All request/response validation uses TypeBox with `Static<typeof schema>` for types
- **Dependency Injection**: Services are Fastify decorators (`fastify.kysely`, `fastify.accountRepository`, `fastify.bullmq`)

### Source Structure

```
src/
├── server.ts           # Entry point - initializes Fastify and registers plugins
├── app.ts              # Main app plugin - registers core plugins and routes
├── common/             # Shared constants, enums, interfaces, schemas
├── lib/                # Core libraries (logger, kysely, redis, sentry)
├── plugins/            # Fastify plugins (auth, bullmq, errors, hooks, swagger)
├── routes/             # API routes organized by domain
│   ├── auth/           # Auth routes with usecases/ and queue/
│   ├── accounts/       # Account repository and interfaces
│   └── misc/           # Health/status endpoints
├── utils/              # Utilities (env schema, server options)
└── @types/             # TypeScript type definitions
```

### Adding New Routes

Follow the pattern in `src/routes/auth/`:

1. Create route directory with `index.ts` for registration
2. Define schemas in `*.schema.ts` using TypeBox
3. Create use cases in `usecases/*.usecase.ts`
4. Register routes in parent `src/routes/index.ts`

### API Versioning

Routes are versioned via `Accept-Version` header (default: 1.0.0). Disable per-route with `disableVersioning: true` in route config.

### Queue Jobs (BullMQ)

- Queue name defined in `src/common/constants.ts`
- Add jobs via `fastify.bullmq.add(jobName, data, options)`
- Workers in `src/routes/*/queue/*.worker.ts`

### Error Handling

Custom errors use codes from `src/plugins/commonClientErrors.plugin.ts`. Standard response format:

```json
{
  "statusCode": 404,
  "error": "Not found",
  "message": "Entity 'user' with 'xxx' not found",
  "internalCode": "NOT_FOUND",
  "details": { "entityId": "xxx", "entityName": "user" }
}
```

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
- Prefix service-specific vars (e.g., `PG_*` for PostgreSQL, `REDIS_*` for Redis)

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

**Required:** `APP_ENV`, `API_DOMAIN`, `LOG_LEVEL`, `PG_HOST`, `PG_PORT`, `PG_DB`, `PG_USER`, `PG_PW`, `REDIS_HOST`, `REDIS_PORT`

**Optional:** `NODE_ENV`, `APP_NAME`, `SERVER_ADDRESS`, `SERVER_PORT`, `SENTRY_ENABLED`, `SENTRY_DSN`

See [.env.example](.env.example) for all variables with defaults.

## Unit Testing

The project uses Vitest for unit testing with a mock-based approach for testing use cases in isolation.

### Running Tests

```bash
npm test                 # Run all tests once
npx vitest               # Run tests in watch mode
```

### Test File Structure

- Test files are co-located with source files: `*.usecase.ts` → `*.usecase.test.ts`
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
│       └── usecases/
│           ├── read.usecase.ts
│           └── read.usecase.test.ts  # Co-located test
```

### Writing Use Case Tests

Use cases are tested by mocking the Fastify instance and calling the handler directly.

### Mock Utilities

**`createMockFastify(options?)`** - Creates a mock Fastify instance with:
- `accountRepository` - Mocked repository methods (`findById`, `findByEmail`, `createAccount`)
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
```

2. Add factory function to `src/test/utils/fastify.mock.ts`:
```typescript
export function createMockNewRepository(): MockNewRepository {
  return {
    findAll: vi.fn(),
    create: vi.fn(),
  };
}
```

3. Add to `MockFastifyInstance` interface and `createMockFastify()` function.

## Local Development Ports

- PostgreSQL: 6432
- Redis: 7379
- Nginx: 8080
- Portainer: 9000

## Git Workflow

Direct pushes to `main` are not allowed. All changes must go through Pull Requests.
