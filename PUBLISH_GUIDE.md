# Publishing to npm

This guide explains how to publish the Optix GraphQL MCP Server to npm so others can easily use it.

## Before Publishing

### 1. Update version in package.json

```bash
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Build the project

```bash
npm run build
```

### 3. Test locally

```bash
# Test the built version
node dist/index.js

# Or test with MCP Inspector
npx @modelcontextprotocol/inspector ./run-server.sh
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
# Enter your npm username, password, and email
```

### 2. Publish

```bash
npm publish
```

That's it! Your package is now on npm.

## After Publishing

Users can now install and use it with:

```bash
# Install globally
npm install -g optix-graphql-mcp

# Or use with npx (no install needed)
npx optix-graphql-mcp
```

### Claude Desktop config after publishing:

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

## Update Package

When you make changes:

1. Update code
2. Update version: `npm version patch`
3. Build: `npm run build`
4. Publish: `npm publish`

## Package Info

Your package will be available at:
- npm: https://www.npmjs.com/package/optix-graphql-mcp
- GitHub: https://github.com/Raulitoflying/optix-graphql-mcp

## Versioning Guidelines

- **Patch** (1.0.0 -> 1.0.1): Bug fixes
- **Minor** (1.0.0 -> 1.1.0): New features, backward compatible
- **Major** (1.0.0 -> 2.0.0): Breaking changes

## Important Files for npm

The `package.json` already has these configured:

```json
{
  "bin": {
    "optix-graphql-mcp": "./dist/index.js"
  },
  "files": [
    "dist"
  ]
}
```

- `bin`: Makes the command available globally
- `files`: Only includes `dist/` folder in npm package

## Pre-publish Checklist

- [ ] All tests passing
- [ ] README.md is up to date
- [ ] Version bumped in package.json
- [ ] Built with `npm run build`
- [ ] Tested locally
- [ ] Git committed and pushed
- [ ] CHANGELOG updated (optional)

## Troubleshooting

### Package name already exists?

Change the name in package.json:
```json
{
  "name": "@your-username/optix-graphql-mcp"
}
```

### Permission denied?

Make sure you're logged in:
```bash
npm whoami
npm login
```

### Build errors?

Clean and rebuild:
```bash
rm -rf dist node_modules
npm install
npm run build
```
