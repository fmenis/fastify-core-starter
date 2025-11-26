# Fastify Core Starter

A production-ready Fastify boilerplate with TypeScript, designed to kickstart modern Node.js applications with best practices and essential features out of the box.

**Note**: This project is still a work in progress with plenty of room for improvement. Any contributions, suggestions, or feedback would be greatly appreciated!

## 📋 Prerequisites

- Node.js (v22 LTS or higher)
- npm or yarn
- docker

## 🚀 Features

- [x] Modern Node.js features
- [x] TypeScript ready
- [ ] Solid codebase structure
- [x] Prisma ORM integration
- [x] VSCode debugging configuration
- [x] Environment variables validation
- [x] Queue management (BullMQ)
- [x] Database migrations
- [x] Precommit checks
- [x] Local development environment with Docker
- [x] Valid OpenAPI documentation
- [x] Proper error handling
- [x] Linting (ESLint)
- [ ] Package application with Docker
- [x] Proper logging
- [ ] Basic authentication with JWT
- [ ] Unit tests
- [ ] Integration tests
- [x] Base security features
- [ ] Sentry integration

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
| NODE_ENV         |   production    | Nodejs environment                |
| **APP_ENV**      |                 | Application environment           |
| APP_NAME         | fastify-service | Application name                  |
| SERVER_ADDRESS   |    127.0.0.1    | Server address                    |
| SERVER_PORT      |      3000       | Server port                       |
| **API_DOMAIN**   |                 | Production, staging or dev domain |
| **LOG_LEVEL**    |                 | Pino.js default log level         |
| **DATABASE_URL** |                 | Postgres connection url           |
| **REDIS_HOST**   |                 | Redis host                        |
| **REDIS_PORT**   |                 | Redis port                        |

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

## 🙏 Acknowledgments

- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [BullMQ](https://docs.bullmq.io/) - Premium queue package for Node.js
- [Pino](https://getpino.io/) - Super fast, all natural JSON logger

## 📧 Contact

Filippo Menis - [@fmenis](https://github.com/fmenis)
