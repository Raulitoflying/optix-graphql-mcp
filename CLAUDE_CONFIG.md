# Claude Desktop Configuration Examples

## Basic Optix Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "optix": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "NAME": "optix-workspace",
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer your-optix-api-key\"}",
        "ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

## Development Configuration

For local development with a custom endpoint:

```json
{
  "mcpServers": {
    "optix-dev": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/optix-graphql-mcp",
      "env": {
        "NAME": "optix-dev",
        "ENDPOINT": "http://localhost:4000/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer dev-token\"}",
        "ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

## Generic GraphQL Configuration

Use with any GraphQL API (GitHub example):

```json
{
  "mcpServers": {
    "github-graphql": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "NAME": "github-api",
        "ENDPOINT": "https://api.github.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer your-github-token\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

## Multi-Environment Setup

Configure multiple Optix environments:

```json
{
  "mcpServers": {
    "optix-prod": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "NAME": "optix-production",
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer prod-token\"}",
        "ALLOW_MUTATIONS": "true"
      }
    },
    "optix-staging": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "NAME": "optix-staging",
        "ENDPOINT": "https://staging-api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer staging-token\"}",
        "ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NAME` | No | Server identifier | `"optix-workspace"` |
| `ENDPOINT` | Yes | GraphQL API endpoint | `"https://api.optixapp.com/graphql"` |
| `HEADERS` | No | HTTP headers as JSON | `"{\"Authorization\":\"Bearer token\"}"` |
| `ALLOW_MUTATIONS` | No | Enable write operations | `"true"` or `"false"` (default) |
| `SCHEMA` | No | Local schema file path | `"./optix-schema.graphql"` |

## Security Notes

1. **API Keys**: Store sensitive tokens securely and never commit them to version control
2. **Mutations**: Only enable `ALLOW_MUTATIONS` if you need write access
3. **Environment**: Use different API keys for development, staging, and production
4. **Headers**: Ensure proper authentication headers are configured for your API