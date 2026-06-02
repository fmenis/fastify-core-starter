# Fastify Core Starter

A production-ready Fastify boilerplate with TypeScript, designed to kickstart modern Node.js applications with best practices and essential features out of the box.

**Note**: This project is still a work in progress with plenty of room for improvement. Any contributions, suggestions, or feedback would be greatly appreciated!

## 📋 Prerequisites

- Node.js (v22 LTS or higher)
- Docker & docker-compose

## 🚀 Features

### Base

- [x] Modern Node.js features
- [x] TypeScript ready
- [x] Postgres ready
- [x] Solid codebase structure
- [x] Kysely TypeScript SQL query builder
- [x] Request validation
- [x] VSCode debugging configuration
- [x] Environment variables usage
- [x] Database migrations
- [x] Precommit checks
- [x] Local development environment with Docker
- [x] Dockerizing application
- [x] Valid OpenAPI documentation
- [x] Proper error handling (structured http errors and domainErrors)
- [x] Linting (ESLint)
- [x] Graceful Shutdown
- [x] Proper logging
- [ ] Basic authentication with refresh token
- [ ] Basic authorization (Casl)
- [x] Unit tests
- [x] Integration tests
- [x] Base security features
- [x] Sentry integration
- [x] Api versioning
- [x] Correlation ID for every response

### Advanced

- [x] Execute commands
- [x] Rate limiting
- [ ] Distributed Tracing
- [x] Server and db timeouts
- [x] Queue management (BullMQ)
- [x] Activity log
- [ ] Async localStorage
- [ ] Request sanitization
- [ ] Release please
- [ ] Advanced env variables management ([infisical](https://infisical.com/))

## 🛠️ Installation

1.  Set up environment variables:

```bash
cp .env.example .env
```

2. Configure your `.env` file with the appropriate values (see below)

3. Start the development environment with Docker:

```bash
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

**Bold** env must be required.

| Name             |     Default     | Description                       |
| ---------------- | :-------------: | --------------------------------- |
| **APP_ENV**      |                 | Application environment           |
| **APP_MODE**     |                 | Application mode (http or worker) |
| APP_NAME         | fastify-service | Application name                  |
| SERVER_ADDRESS   |    127.0.0.1    | Server address                    |
| SERVER_PORT      |      3000       | Server port                       |
| **API_DOMAIN**   |                 | Production, staging or dev domain |
| **LOG_LEVEL**    |                 | Pino.js default log level         |
| **DATABASE_URL** |                 | PostgreSQL connection string      |
| **REDIS_HOST**   |                 | Redis host                        |
| **REDIS_PORT**   |                 | Redis port                        |
| SENTRY_ENABLED   |      false      | Enable sentry integration         |
| SENTRY_DSN       |                 | Sentry DSN                        |

## 🧪 Testing

### Unit tests

```bash
npm run test:unit
```

### Integration tests

Integration tests run against real Postgres and Redis instances managed via Docker.

```bash
npm run test:integration
```

This command:

1. Starts Postgres and Redis containers (`tests/docker-compose.test.yml`)
2. Waits for healthchecks to pass
3. Runs migrations against the test DB
4. Executes all tests under `tests/integration/`
5. Tears down the containers

### Debugging integration tests

> **Prerequisites:** the test containers must be running before starting the debugger.

```bash
docker compose -f tests/docker-compose.test.yml up -d --wait
```

Then launch **Debug Integration Tests** from the VS Code Run & Debug panel (`Ctrl+Shift+D`).

Breakpoints work in both test files and application source code. The launch configuration uses `autoAttachChildProcesses: true` to attach to the child processes spawned by Vitest for each test file.

To debug a single file, edit `.vscode/launch.json` and add the file path as the last entry in `args`:

```json
"args": [
  "run",
  "--config", "tests/vitest.integration.config.ts",
  "tests/modules/profile/read.route.test.ts"
]
```

Remember to remove the containers with

```bash
docker compose -f tests/docker-compose.test.yml down
```

## 🚢 Deployment

The project uses GitHub Actions for automated deployment to a VPS. The deployment process is triggered automatically and uses SSH to securely copy code to your server.

### Deployment Setup

1. **Configure GitHub Secrets:**
   Navigate to your repository settings → Secrets and variables → Actions, and add:
   - `VPS_SSH_KEY`: Your private SSH key for accessing the VPS

2. **Deployment Workflow:**
   - The deployment is triggered automatically via GitHub Actions
   - Code is securely copied to the VPS using the configured SSH key
   - The application is deployed with zero-downtime using systemd

3. **Requirements:**
   - A VPS with SSH access
   - Systemd configured on the server
   - Proper SSH key pair (private key in GitHub secrets, public key on VPS)

For detailed deployment configuration, refer to the GitHub Actions workflow file in `.github/workflows/deploy`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note:** Direct pushes to the `main` branch are not allowed. All changes must go through a Pull Request review process.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

Made with ❤️ by Filippo Menis - [@fmenis](https://github.com/fmenis)
