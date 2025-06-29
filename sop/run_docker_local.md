# Docker SOP - Alexbot Local Development

> **Primary Development**: Use `npm run dev` for local development with auto-reload  
> **Docker**: Used for periodic testing in production-like environment

## Quick Reference (Most Common)

### Periodic Docker Testing Workflow

```bash
# Quick test in Docker (use different port to avoid conflicts)
docker build -t alexbot . && docker run -p 3001:3000 alexbot &

# Test health endpoint
curl http://localhost:3001/health

# Stop Docker test
docker stop $(docker ps -q)
```

### Local Development (Primary)

```bash
# Start local development with auto-reload
npm run dev

# Stop local development
# Ctrl+C in terminal
```

### Check What's Running

```bash
docker ps                    # See running containers
docker ps -a                 # See all containers (including stopped)
```

### Fresh Start (Nothing Running)

```bash
docker build -t alexbot .
docker run -p 3000:3000 alexbot
```

## Development Options

### Auto-Watch for Changes (Recommended for Active Development)

```bash
# Use volume mount - no rebuild needed for code changes
docker run -p 3000:3000 -v $(pwd)/src:/app/src alexbot

# With npm run dev (if you have nodemon/ts-node-dev)
docker run -p 3000:3000 -v $(pwd)/src:/app/src alexbot npm run dev
```

### Background vs Foreground

```bash
# Background (daemon mode)
docker run -d -p 3000:3000 alexbot

# Foreground (see logs immediately)
docker run -p 3000:3000 alexbot
```

### View Logs

```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
```

## Troubleshooting

### Docker Desktop Not Running

- Start Docker Desktop app
- Wait for green whale icon
- Try command again

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:3000 alexbot
```

### Clean Up

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Nuclear option - remove everything
docker system prune -a
```

### Container Won't Stop

```bash
docker kill <container-id>
```

## Testing Commands

### Health Check

```bash
curl http://localhost:3000/health
```

### Chat Endpoint

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

## Quick One-Liners

```bash
# Complete restart
docker stop $(docker ps -q) && docker build -t alexbot . && docker run -p 3000:3000 alexbot

# Background restart
docker stop $(docker ps -q) && docker build -t alexbot . && docker run -d -p 3000:3000 alexbot

# Clean slate
docker system prune -a && docker build -t alexbot . && docker run -p 3000:3000 alexbot
```

## Notes

- **Volume mounts** avoid rebuilds but require container restart for dependency changes
- **Rebuild approach** is slower but ensures clean environment
- Use `docker ps` to get container names/IDs
- Port 3000 is internal container port, left side is host port (changeable)
