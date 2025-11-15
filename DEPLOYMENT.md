# SIL Deployment Guide

Complete guide for deploying the Semantic Intelligence League platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)

---

## Prerequisites

### Required Software

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Docker**: >= 24.0 (for containerized deployment)
- **PostgreSQL**: >= 14.0
- **Redis**: >= 7.0 (optional, for caching)

### Install Dependencies

```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

---

## Local Development

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local settings
nano .env
```

### 2. Database Setup

```bash
# Start PostgreSQL locally (or use Docker)
docker run -d \
  --name sil-postgres \
  -e POSTGRES_DB=sil \
  -e POSTGRES_USER=sil_user \
  -e POSTGRES_PASSWORD=sil_password \
  -p 5432:5432 \
  postgres:16-alpine

# Run migrations
psql postgresql://sil_user:sil_password@localhost:5432/sil \
  < apps/api/src/db/migrations/001_initial_schema.sql
```

### 3. Start Development Servers

```bash
# Start all services in development mode
pnpm dev

# API will be available at http://localhost:3001
# Web will be available at http://localhost:3000
```

### 4. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

---

## Docker Deployment

### Quick Start

```bash
# Build and start all services
pnpm docker:build
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

### Manual Docker Commands

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Services Included

- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **api**: Express API server (port 3001)
- **web**: Next.js frontend (port 3000)

---

## Production Deployment

### Option 1: Docker Compose (VPS/Cloud VM)

1. **Provision a server** (AWS EC2, DigitalOcean, etc.)

2. **Install Docker and Docker Compose**

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

3. **Clone repository and configure**

```bash
git clone https://github.com/your-org/sil.git
cd sil

# Create production environment file
cp .env.example .env
nano .env  # Configure production values
```

4. **Deploy**

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

5. **Set up reverse proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Option 2: Kubernetes

```bash
# Build and push images
docker build -t your-registry/sil-api:latest --target api .
docker build -t your-registry/sil-web:latest --target web .

docker push your-registry/sil-api:latest
docker push your-registry/sil-web:latest

# Apply Kubernetes manifests (example)
kubectl apply -f k8s/
```

### Option 3: Serverless (Vercel + Railway)

**Frontend (Vercel)**:
```bash
cd apps/web
vercel deploy --prod
```

**API + Database (Railway)**:
1. Connect GitHub repository to Railway
2. Add PostgreSQL database service
3. Deploy API service
4. Configure environment variables

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# API Server
PORT=3001
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret

# Web Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Optional Variables

```bash
# Redis Cache
REDIS_URL=redis://localhost:6379

# Session
SESSION_SECRET=your-session-secret

# Feature Flags
ENABLE_LEADERBOARDS=true
ENABLE_SEASONS=true

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Database Setup

### Initial Schema

The database schema is automatically created from migration files:

```bash
apps/api/src/db/migrations/001_initial_schema.sql
```

### Manual Migration

```bash
# Connect to database
psql $DATABASE_URL

# Run migration
\i apps/api/src/db/migrations/001_initial_schema.sql
```

### Backup & Restore

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f web

# PM2 logs (if using PM2)
pm2 logs api
pm2 logs web
```

### Health Checks

```bash
# API health check
curl http://localhost:3001/health

# Database connection check
docker-compose exec db pg_isready

# Redis check
docker-compose exec redis redis-cli ping
```

### Metrics

Consider integrating:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Sentry**: Error tracking
- **DataDog**: APM and monitoring

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple API instances**: Scale API containers
3. **Database replication**: Set up PostgreSQL replicas
4. **Redis cluster**: Configure Redis in cluster mode

### Vertical Scaling

Adjust Docker resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Security Checklist

- [ ] Use strong JWT_SECRET and SESSION_SECRET
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Regular security updates
- [ ] Implement input validation
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable database backups

---

## Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check database is running
docker-compose ps db

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**API not accessible**
```bash
# Check API logs
docker-compose logs api

# Check port binding
netstat -tuln | grep 3001
```

**Build failures**
```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

---

## CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml`

Pipeline includes:
- Linting and type checking
- Unit and integration tests
- Build verification
- Docker image builds
- Automated deployment (configure based on target)

---

## Support

For deployment issues:
- Check logs first
- Review environment variables
- Verify network connectivity
- Check resource availability
- Consult documentation

For bugs and feature requests:
- Open an issue on GitHub
- Include logs and environment details
