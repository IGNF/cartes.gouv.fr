# Migration from Apache to Caddy

This document explains the migration from Apache + mod_php to Caddy + PHP-FPM setup.

## Key Changes

### Architecture Changes

- **Before**: Apache with mod_php
- **After**: Caddy with PHP-FPM managed by Supervisor

### New Files Created

- `.docker/Dockerfile.caddy` - New Dockerfile with Caddy instead of Apache
- `.docker/Caddyfile` - Caddy web server configuration
- `.docker/supervisord.conf` - Process manager configuration
- `.docker/php-fpm.conf` - PHP-FPM pool configuration
- `.docker/application-caddy.sh` - Startup script for Caddy setup
- `compose.caddy.yml` - Development Docker Compose for Caddy
- `compose.caddy.prod.yml` - Production Docker Compose for Caddy

### Benefits of Caddy over Apache

1. **Simpler Configuration**: Single Caddyfile vs multiple Apache config files
2. **Better Performance**: Caddy is generally faster and uses less memory
3. **Modern Features**: Built-in HTTP/2, automatic HTTPS (when using domains)
4. **Better Static File Serving**: Optimized for modern web applications
5. **JSON Logging**: Better structured logs for monitoring
6. **Process Separation**: PHP-FPM runs separately, better for scaling

## How to Use

### Development

```bash
# Build and run with Caddy
docker compose -f compose.caddy.yml up --build

# Or use the new image directly
docker compose -f compose.caddy.yml up
```

### Production

```bash
# Build and run production with Caddy
docker compose -f compose.caddy.prod.yml up --build

# Or use the new image directly
docker compose -f compose.caddy.prod.yml up
```

## Configuration Details

### Caddy Configuration (Caddyfile)

- Serves files from `/opt/cartesgouvfr-site/public`
- Handles PHP via FastCGI to PHP-FPM socket
- Includes security headers
- Enables compression
- Caches static assets
- Handles Symfony routing

### PHP-FPM Configuration

- Uses Unix socket instead of TCP connection for better performance
- Optimized pool settings for containerized environment
- Proper logging configuration
- Security settings enabled

### Supervisor Configuration

- Manages both Caddy and PHP-FPM processes
- Ensures both services restart if they crash
- Logs to stdout/stderr for Docker compatibility

## Verification

After starting the container, you can verify:

1. **Container Health**:

    ```bash
    docker compose -f compose.caddy.yml ps
    ```

2. **Logs**:

    ```bash
    docker compose -f compose.caddy.yml logs -f
    ```

3. **Access the Application**:

    - Development: http://localhost:9092
    - Production: http://localhost:9090

4. **Check Process Status** (inside container):
    ```bash
    docker exec -it <container_name> supervisorctl status
    ```

## Troubleshooting

### Common Issues

1. **Permission Issues**:

    - Check that www-data owns the application files
    - Verify PHP-FPM socket permissions

2. **PHP-FPM Not Starting**:

    - Check PHP configuration in `/etc/php/8.2/fpm/`
    - Verify socket path in both Caddy and PHP-FPM configs

3. **Caddy Configuration Issues**:
    - Test Caddyfile syntax: `caddy validate --config /etc/caddy/Caddyfile`
    - Check Caddy logs for specific errors

### Debugging Commands

```bash
# Check if PHP-FPM is running
docker exec -it <container> ps aux | grep php-fpm

# Check if Caddy is running
docker exec -it <container> ps aux | grep caddy

# Test PHP-FPM socket
docker exec -it <container> ls -la /run/php/

# Check Supervisor status
docker exec -it <container> supervisorctl status
```

## Rollback Plan

If you need to rollback to Apache:

1. Use the original `compose.yml` and `compose.prod.yml`
2. The original Dockerfile remains untouched as `.docker/Dockerfile`
3. All Apache configuration files are still present

## Performance Comparison

Initial testing should show:

- Faster static file serving
- Lower memory usage
- Better handling of concurrent requests
- Improved response times for API endpoints

Monitor your application metrics after migration to verify performance improvements.
