# FrankenPHP Worker Mode Configuration

This application is now configured to run with FrankenPHP in **Worker Mode**, which provides significant performance improvements over the classic mode.

## What is Worker Mode?

Worker Mode keeps your Symfony application loaded in memory across multiple requests, eliminating the overhead of bootstrapping the application for each request. This results in:

- **Faster response times** (2-10x improvement)
- **Lower memory usage** per request
- **Better resource utilization**
- **Persistent application state** between requests

## Configuration Files

### Runtime Classes

- `src/Runtime/FrankenPhpRuntime.php` - Main runtime class that detects FrankenPHP
- `src/Runtime/FrankenPhpRunner.php` - Handles the worker request lifecycle

### Caddyfile Configuration

- `.docker/Caddyfile.frankenphp` - Production configuration with 4 workers
- `.docker/Caddyfile.dev.frankenphp` - Development configuration with 2 workers and file watching

### Key Configuration Options

#### Production (`Caddyfile.frankenphp`)

```caddy
worker {
    file ./public/index.php
    num 4  # Number of workers (adjust based on CPU cores)
    env APP_RUNTIME App\\Runtime\\FrankenPhpRuntime
}
```

#### Development (`Caddyfile.dev.frankenphp`)

```caddy
worker {
    file ./public/index.php
    num 2  # Fewer workers for development
    watch  # Enable file watching - restarts workers on file changes
    env APP_RUNTIME App\\Runtime\\FrankenPhpRuntime
}
```

## Building and Running

### Development

```bash
docker-compose -f compose.frankenphp.yml up --build
```

### Production

```bash
docker-compose -f compose.frankenphp.prod.yml up --build
```

## Performance Tuning

### Worker Count

- **Development**: 2 workers (easier debugging)
- **Production**: 4 workers (adjust based on CPU cores)
- **Rule of thumb**: Start with number of CPU cores, monitor and adjust

### Memory Settings

- Each worker maintains its own memory space
- Monitor memory usage and adjust `memory_limit` if needed
- Current setting: `256M` per worker

## Troubleshooting

### File Changes Not Reflected (Development)

- The `watch` directive should handle this automatically
- If issues persist, restart the container

### Memory Issues

- Reduce number of workers
- Increase `memory_limit` in Caddyfile
- Check for memory leaks in application code

### Performance Issues

- Monitor worker utilization
- Adjust worker count based on load
- Check application logs for bottlenecks

## Monitoring

Worker mode provides better performance, but you should monitor:

- Memory usage per worker
- Request distribution across workers
- Response times
- Error rates

## Important Notes

1. **Stateful Services**: Be careful with stateful services that might accumulate state between requests
2. **Memory Management**: Workers keep objects in memory - ensure proper cleanup
3. **File Watching**: Only enabled in development mode for automatic restarts
4. **Database Connections**: Connection pooling works better with worker mode

## Rollback to Classic Mode

If you need to rollback to classic mode, comment out the `worker` block in both Caddyfile configurations and restart the containers.
