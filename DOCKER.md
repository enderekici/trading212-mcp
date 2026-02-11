# Docker Deployment Guide

This guide covers deploying the Trading 212 MCP server using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose 1.29+ (included in Docker Desktop)
- Trading 212 API key

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the project root:

```bash
TRADING212_API_KEY=your_api_key_here
TRADING212_ENVIRONMENT=demo  # or 'live'
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

### 3. View Logs

```bash
docker-compose logs -f trading212-mcp
```

### 4. Stop the Server

```bash
docker-compose down
```

## Building the Image

### Build with Docker

```bash
docker build -t trading212-mcp:latest .
```

### Build with Docker Compose

```bash
docker-compose build
```

### Multi-platform Build (for distribution)

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t trading212-mcp:latest .
```

## Running the Container

### Using Docker Run

```bash
docker run -d \
  --name trading212-mcp \
  -e TRADING212_API_KEY=your_api_key \
  -e TRADING212_ENVIRONMENT=demo \
  --restart unless-stopped \
  --memory=1g \
  --memory-reservation=256m \
  --security-opt no-new-privileges:true \
  --read-only \
  --tmpfs /tmp:noexec,nosuid,size=64m \
  trading212-mcp:latest
```

### Using Docker Compose (Recommended)

Docker Compose provides better configuration management:

```bash
docker-compose up -d
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TRADING212_API_KEY` | Yes | - | Your Trading 212 API key |
| `TRADING212_ENVIRONMENT` | No | `demo` | Environment: `demo` or `live` |
| `NODE_ENV` | No | `production` | Node environment |

### Resource Limits

The default configuration includes:

- **Memory Limit**: 1GB maximum
- **Memory Reservation**: 256MB minimum
- **CPU Limit**: 1.0 CPU (100%)
- **CPU Reservation**: 0.25 CPU (25%)

Adjust these in `docker-compose.yml` under `deploy.resources`.

## Security Features

### Built-in Security

The Docker configuration includes multiple security layers:

1. **Non-root User**: Container runs as user `mcp` (UID 1001)
2. **Read-only Filesystem**: Root filesystem is read-only
3. **No New Privileges**: Prevents privilege escalation
4. **Minimal Base Image**: Alpine Linux for smaller attack surface
5. **Multi-stage Build**: Only production dependencies in final image

### Security Best Practices

1. **Never commit `.env` files** with real API keys
2. **Use secrets management** in production (Docker Swarm secrets, Kubernetes secrets)
3. **Regularly update** the base image and dependencies
4. **Monitor container** logs for suspicious activity

## Health Checks

The container includes a health check that:

- Runs every 30 seconds
- Verifies the Node.js server can start
- Has a 10-second timeout
- Allows 3 retries before marking unhealthy
- Waits 5 seconds on initial start

View health status:

```bash
docker ps
# Look for "(healthy)" in the STATUS column

# Or detailed info:
docker inspect --format='{{.State.Health.Status}}' trading212-mcp
```

## Logging

### View Logs

```bash
# Follow logs in real-time
docker-compose logs -f trading212-mcp

# View last 100 lines
docker-compose logs --tail=100 trading212-mcp

# View logs since timestamp
docker logs --since 2024-01-01T00:00:00 trading212-mcp
```

### Log Configuration

Logs are configured with:

- **Driver**: JSON file
- **Max Size**: 10MB per file
- **Max Files**: 3 files retained
- **Total Storage**: ~30MB maximum

## Troubleshooting

### Container Won't Start

Check environment variables:

```bash
docker-compose config
```

View startup errors:

```bash
docker-compose logs trading212-mcp
```

### Container is Unhealthy

Check health status:

```bash
docker inspect --format='{{json .State.Health}}' trading212-mcp | jq
```

### API Connection Issues

Verify API key is set:

```bash
docker exec trading212-mcp env | grep TRADING212
```

Test network connectivity:

```bash
docker exec trading212-mcp ping -c 3 demo.trading212.com
```

### Memory Issues

Check current memory usage:

```bash
docker stats trading212-mcp
```

Increase memory limit in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increase from 1G
```

## Production Deployment

### Using Docker Swarm

Initialize swarm:

```bash
docker swarm init
```

Deploy stack:

```bash
docker stack deploy -c docker-compose.yml trading212
```

### Using Kubernetes

Convert Docker Compose to Kubernetes manifests:

```bash
kompose convert
kubectl apply -f .
```

### Using Cloud Platforms

#### AWS ECS

1. Push image to ECR
2. Create ECS task definition
3. Set environment variables as secrets
4. Deploy to ECS service

#### Google Cloud Run

```bash
gcloud run deploy trading212-mcp \
  --image trading212-mcp:latest \
  --set-env-vars TRADING212_API_KEY=your_key
```

#### Azure Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name trading212-mcp \
  --image trading212-mcp:latest \
  --environment-variables \
    TRADING212_API_KEY=your_key \
    TRADING212_ENVIRONMENT=demo
```

## Continuous Integration

The repository includes a GitHub Actions workflow (`.github/workflows/docker.yml`) that:

- Builds Docker images on every push and PR
- Tests the container startup
- Scans for vulnerabilities with Trivy
- Publishes images to GitHub Container Registry (ghcr.io)
- Supports multi-platform builds (amd64, arm64)

Images are automatically tagged with:
- Branch name (e.g., `main`)
- Git SHA (e.g., `sha-abc123`)
- Semantic version tags (e.g., `v1.0.0`, `1.0`, `1`)

Pull pre-built images:

```bash
docker pull ghcr.io/enderekici/trading212-mcp:latest
```

## Maintenance

### Update Container

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (if any)
docker-compose down -v

# Remove images
docker rmi trading212-mcp:latest
```

### Backup

Since the MCP server is stateless, no backup is needed. However, if you add persistent volumes:

```bash
docker run --rm \
  --volumes-from trading212-mcp \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/data-backup.tar.gz /app/data
```

## Performance Optimization

### Build Optimization

The Dockerfile uses multi-stage builds to:

- Minimize final image size (~100MB vs ~1GB)
- Include only production dependencies
- Reduce attack surface

### Runtime Optimization

1. **Use BuildKit** for faster builds:
   ```bash
   DOCKER_BUILDKIT=1 docker build -t trading212-mcp .
   ```

2. **Layer caching**: Dependencies are cached separately from source code

3. **Alpine Linux**: Minimal base image for faster pulls and smaller size

## Integration with Claude Desktop

There are three ways to use the MCP server with Claude Desktop:

### Option 1: Run MCP Server via Docker (Recommended)

This method runs the MCP server inside a Docker container and connects Claude Desktop to it.

**Step 1: Pull or build the image**

```bash
# Option A: Pull pre-built image (when available)
docker pull ghcr.io/enderekici/trading212-mcp:latest

# Option B: Build locally
docker build -t trading212-mcp:latest .
```

**Step 2: Configure Claude Desktop**

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "trading212": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--name", "trading212-mcp-claude",
        "-e", "TRADING212_API_KEY=your_api_key_here",
        "-e", "TRADING212_ENVIRONMENT=demo",
        "trading212-mcp:latest"
      ]
    }
  }
}
```

**How it works:**
- Claude Desktop runs `docker run` which starts a fresh container
- The `-i` flag enables interactive mode for stdio communication
- The `--rm` flag automatically removes the container when Claude closes
- Each time Claude Desktop starts, a new container is created

**Pros:**
- ✅ Isolated environment
- ✅ No local Node.js required
- ✅ Consistent across machines
- ✅ Easy updates (pull new image)

**Cons:**
- ⚠️ Slightly slower startup (~1-2 seconds)
- ⚠️ Requires Docker running

---

### Option 2: Docker Compose with Named Container

For longer-running sessions, use a persistent container.

**Step 1: Start container with docker-compose**

```bash
docker-compose up -d
```

**Step 2: Configure Claude Desktop**

```json
{
  "mcpServers": {
    "trading212": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "trading212-mcp",
        "node",
        "/app/dist/index.js"
      ]
    }
  }
}
```

**How it works:**
- Container runs continuously in the background
- Claude Desktop connects via `docker exec`
- API key is set in `.env` or `docker-compose.yml`

**Pros:**
- ✅ Fast startup (no container creation)
- ✅ Container runs continuously
- ✅ Easier debugging (persistent logs)

**Cons:**
- ⚠️ Must manually start/stop container
- ⚠️ Container consumes resources even when idle

---

### Option 3: Local Installation (No Docker)

Run the MCP server directly without Docker.

**Step 1: Install globally**

```bash
npm install -g trading212-mcp
```

**Step 2: Configure Claude Desktop**

```json
{
  "mcpServers": {
    "trading212": {
      "command": "trading212-mcp",
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

**Or use npx (no global install):**

```json
{
  "mcpServers": {
    "trading212": {
      "command": "npx",
      "args": ["-y", "trading212-mcp"],
      "env": {
        "TRADING212_API_KEY": "your_api_key_here",
        "TRADING212_ENVIRONMENT": "demo"
      }
    }
  }
}
```

**Pros:**
- ✅ Fastest startup
- ✅ No Docker overhead
- ✅ Simplest setup

**Cons:**
- ⚠️ Requires Node.js installed
- ⚠️ Less isolated

---

### Comparison Table

| Method | Startup Time | Resource Usage | Isolation | Requires |
|--------|--------------|----------------|-----------|----------|
| **Docker run** | ~2s | Low | ✅ High | Docker |
| **Docker exec** | ~0.5s | Medium | ✅ High | Docker + compose |
| **Local (global)** | ~0.3s | Low | ⚠️ None | Node.js |
| **Local (npx)** | ~1s | Low | ⚠️ None | Node.js |

---

### Recommended Setup

**For Development:**
- Use **Option 3** (Local installation) - Fastest iteration

**For Production/Team:**
- Use **Option 1** (Docker run) - Consistent environment

**For Always-On:**
- Use **Option 2** (Docker exec) - Persistent container

---

### Troubleshooting Claude Desktop + Docker

#### Issue: "Container not found"

If using Option 2 (docker exec), ensure container is running:

```bash
docker ps | grep trading212-mcp
```

Start it if needed:

```bash
docker-compose up -d
```

#### Issue: "Command not found: docker"

Docker is not in Claude Desktop's PATH. Use absolute path:

```json
{
  "mcpServers": {
    "trading212": {
      "command": "/usr/local/bin/docker",
      "args": ["run", "--rm", "-i", ...]
    }
  }
}
```

Find Docker path:
```bash
which docker
```

#### Issue: Slow startup

Use Option 2 (persistent container) or Option 3 (local install).

#### Issue: API key not working

Verify environment variable in container:

```bash
docker exec trading212-mcp env | grep TRADING212
```

Check logs:

```bash
docker logs trading212-mcp
```

---

### Complete Example: Production Setup

**1. Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  trading212-mcp:
    build: .
    container_name: trading212-mcp
    environment:
      - TRADING212_API_KEY=${TRADING212_API_KEY}
      - TRADING212_ENVIRONMENT=${TRADING212_ENVIRONMENT:-demo}
    restart: unless-stopped
    mem_limit: 1g
    mem_reservation: 256m
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=64m
```

**2. Create `.env`:**

```bash
TRADING212_API_KEY=your_actual_api_key_here
TRADING212_ENVIRONMENT=demo
```

**3. Start container:**

```bash
docker-compose up -d
```

**4. Configure Claude Desktop:**

```json
{
  "mcpServers": {
    "trading212": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "trading212-mcp",
        "node",
        "/app/dist/index.js"
      ]
    }
  }
}
```

**5. Verify:**

```bash
# Check container is running
docker ps

# Check logs
docker logs trading212-mcp

# Test from command line
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  docker exec -i trading212-mcp node /app/dist/index.js
```

**6. Restart Claude Desktop**

The MCP server should now appear in Claude's available tools!

## Monitoring

### Basic Monitoring

```bash
# Resource usage
docker stats trading212-mcp

# Process list
docker top trading212-mcp

# Events
docker events --filter container=trading212-mcp
```

### Advanced Monitoring

For production, integrate with:

- **Prometheus**: Container metrics
- **Grafana**: Visualization dashboards
- **ELK Stack**: Centralized logging
- **Datadog/New Relic**: APM monitoring

## Support

For issues related to:

- **Docker configuration**: Open an issue on GitHub
- **Trading 212 API**: Check Trading 212 API documentation
- **MCP Protocol**: See MCP documentation

## License

Same as the main project (MIT License).
