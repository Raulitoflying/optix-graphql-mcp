# Optix GraphQL MCP Setup Guide

This guide shows how to use the Optix GraphQL MCP Server with different AI applications.

## Prerequisites

1. Build the server first:
```bash
npm install
npm run build
```

2. Get your Optix API token from [Optix Dashboard](https://app.optixapp.com)

## Configuration for Different Apps

### 🖥️ Claude Desktop

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
Or: `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["/absolute/path/to/optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_OPTIX_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

**Replace:**
- `/absolute/path/to/optix-graphql-mcp` with actual path
- `YOUR_OPTIX_TOKEN` with your Optix API token

### 📝 Cursor

Edit: `~/.cursor/mcp_config.json` (macOS/Linux)
Or: `%USERPROFILE%\.cursor\mcp_config.json` (Windows)

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["/absolute/path/to/optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_OPTIX_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

### 🌊 Windsurf

Similar to Cursor, check Windsurf's documentation for the exact config file location.

### 💻 VS Code (with MCP extension)

Install the MCP extension, then configure in VS Code settings or create `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["${workspaceFolder}/../optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_OPTIX_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENDPOINT` | ✅ | - | Your Optix GraphQL endpoint |
| `HEADERS` | ✅ | - | Authentication headers (JSON string) |
| `ALLOW_MUTATIONS` | ❌ | `false` | Enable write operations |
| `NAME` | ❌ | `mcp-graphql` | Server name |

## Enable Mutations (Optional)

⚠️ **Warning**: Mutations can modify your Optix data permanently!

To enable create/update/cancel operations:

```json
{
  "env": {
    "ENDPOINT": "https://api.optixapp.com/graphql",
    "HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}",
    "ALLOW_MUTATIONS": "true"  // ⚠️ Enable mutations
  }
}
```

This enables:
- `optix_create_booking` - Create bookings
- `optix_update_booking` - Update booking time/resource
- `optix_cancel_booking` - Cancel bookings
- `optix_create_member` - Add members

## Using npx (Alternative)

After publishing to npm, users can use:

```json
{
  "mcpServers": {
    "optix": {
      "command": "npx",
      "args": ["-y", "optix-graphql-mcp@latest"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}"
      }
    }
  }
}
```

## Troubleshooting

### Server not connecting?

1. Check the path is absolute (not relative)
2. Ensure `dist/index.js` exists (run `npm run build`)
3. Verify your Optix token is valid
4. Check the config file syntax (valid JSON)

### Tools not appearing?

1. Restart the AI application
2. Check server logs for errors
3. Verify `ENDPOINT` points to Optix API

### Mutations not working?

1. Set `ALLOW_MUTATIONS=true`
2. Verify your Optix token has write permissions
3. Check mutation is enabled for your Optix account

## Testing

Test the server with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector ./run-server.sh
```

Or use the test scripts:

```bash
node test-mcp-stdio.js
node test-all-business-tools.js
```

## Getting Help

- [GitHub Issues](https://github.com/Raulitoflying/optix-graphql-mcp/issues)
- [Optix API Docs](https://developers.optixapp.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)
