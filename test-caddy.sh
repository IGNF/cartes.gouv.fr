#!/bin/bash
set -e

echo "🚀 Testing Caddy Migration for cartes.gouv.fr"
echo "================================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running or not accessible"
    exit 1
fi

echo "✅ Docker is available"

# Test building the development image
echo "📦 Building development image..."
if docker compose -f compose.caddy.yml build --no-cache; then
    echo "✅ Development image built successfully"
else
    echo "❌ Failed to build development image"
    exit 1
fi

# Test building the production image
echo "📦 Building production image..."
if docker compose -f compose.caddy.prod.yml build --no-cache; then
    echo "✅ Production image built successfully"
else
    echo "❌ Failed to build production image"
    exit 1
fi

echo ""
echo "🎉 Migration to Caddy completed successfully!"
echo ""
echo "Next steps:"
echo "1. For development: docker compose -f compose.caddy.yml up"
echo "2. For production: docker compose -f compose.caddy.prod.yml up"
echo "3. Your application will be available at:"
echo "   - Development: http://localhost:9092"
echo "   - Production: http://localhost:9090"
echo ""
echo "📝 Check MIGRATION_CADDY.md for detailed information"
