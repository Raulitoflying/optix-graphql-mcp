# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Optix GraphQL MCP Server** - A Model Context Protocol (MCP) server that provides both generic GraphQL capabilities and specialized business tools for Optix workspace management APIs. The server automatically detects Optix endpoints and enables 15-18 business-specific tools for coworking spaces, flexible offices, and workspace booking systems.

## Architecture

### Dual-Mode Operation

The server operates in two modes based on endpoint detection ([src/index.ts:44](src/index.ts#L44)):

1. **Generic GraphQL Mode**: Standard introspection and querying for any GraphQL API
2. **Optix Business Mode**: Activated when endpoint contains "optixapp.com" or "optix" - loads specialized tools

### Core Components

- **[src/index.ts](src/index.ts)** - Main MCP server entry point
  - Handles environment configuration (NAME, ENDPOINT, HEADERS, ALLOW_MUTATIONS, SCHEMA)
  - Registers base tools: `introspect-schema`, `query-graphql`
  - Conditionally loads Optix tools when IS_OPTIX flag is true
  - Implements mutation safety checks (disabled by default)

- **[src/optix/tools.ts](src/optix/tools.ts)** - Business tool definitions
  - Creates 15 read-only tools (bookings, members, resources, analytics)
  - Conditionally adds 3 mutation tools when `ALLOW_MUTATIONS=true`
  - Each tool includes description, Zod schema validation, and execution logic
  - Tools are registered as a Map<string, OptixTool>

- **[src/optix/queries.ts](src/optix/queries.ts)** - GraphQL query/mutation templates
  - `OPTIX_QUERIES`: Read operations for all business tools
  - `OPTIX_MUTATIONS`: Write operations (CREATE_BOOKING, CANCEL_BOOKING, CREATE_MEMBER)

- **[src/optix/types.ts](src/optix/types.ts)** - TypeScript type definitions
  - Complete type system for Optix entities (Booking, Member, Resource, etc.)
  - Response types for API operations
  - Tool parameter interfaces

- **[src/helpers/introspection.ts](src/helpers/introspection.ts)** - Schema discovery
  - `introspectEndpoint()` - Live GraphQL introspection
  - `introspectLocalSchema()` - Load schema from file path
  - `introspectSchemaFromUrl()` - Fetch schema from URL

### Tool Registration Pattern

Tools follow this pattern in [src/index.ts:231-260](src/index.ts#L231):
```typescript
const optixTools = createOptixTools();
for (const [toolName, tool] of optixTools) {
  server.tool(toolName, tool.description, tool.inputSchema.shape, async (args) => {
    const result = await tool.execute(args, env.ENDPOINT, env.HEADERS);
    // Format and return response
  });
}
```

## Development Commands

### Build & Run
```bash
# Development with auto-reload
bun run dev
# OR
tsx src/index.ts

# Production build (compiles TypeScript to dist/)
bun run build
# OR
tsc && chmod +x dist/index.js

# Run production build
bun run start
# OR
node dist/index.js
```

### Code Quality
```bash
# Format code with Biome
bun run format

# Check formatting
bun run check
```

### Testing

The repository contains multiple test scripts for validating API integration:

```bash
# Test MCP server via stdio
node test-mcp-stdio.js

# Test business tools directly
node test-business-tools.js

# Test mutation mode (requires ALLOW_MUTATIONS=true)
node test-mutation-mode.js

# Test specific functionality
node test-booking-fixes.js
node test-pagination.js
node test-account-direct.js
```

## Environment Configuration

Required environment variables ([src/index.ts:21-39](src/index.ts#L21)):

- **ENDPOINT** (required): GraphQL endpoint URL
- **HEADERS** (required): JSON string for auth headers, e.g., `"{\"Authorization\":\"Bearer TOKEN\"}"`
- **NAME** (optional): Server name, defaults to "mcp-graphql"
- **ALLOW_MUTATIONS** (optional): "true" or "false" (default), controls write operations
- **SCHEMA** (optional): Path or URL to local schema file (bypasses introspection)

## Mutation Safety

By default, ALL mutations are disabled for safety. The server checks parsed GraphQL operations and blocks mutations unless `ALLOW_MUTATIONS=true` ([src/index.ts:135-149](src/index.ts#L135)).

When enabled, three mutation tools become available:
- `optix_create_booking`
- `optix_cancel_booking`
- `optix_create_member`

Each mutation tool validates that the corresponding GraphQL mutation exists in [src/optix/queries.ts](src/optix/queries.ts) before execution.

## Adding New Optix Tools

1. **Define GraphQL query/mutation** in [src/optix/queries.ts](src/optix/queries.ts)
   - Add to `OPTIX_QUERIES` for read operations
   - Add to `OPTIX_MUTATIONS` for write operations

2. **Create TypeScript types** in [src/optix/types.ts](src/optix/types.ts)
   - Define response types and input interfaces

3. **Implement tool** in [src/optix/tools.ts](src/optix/tools.ts)
   - Add to `createOptixTools()` function
   - Define Zod input schema with `.describe()` for documentation
   - Implement `execute()` function using `executeGraphQL()` helper
   - For mutations, add inside `if (allowMutations)` block

4. **Update console output** in [src/index.ts:273-282](src/index.ts#L273) if the tool is commonly used

## TypeScript Configuration

- **Target**: ES2022 with CommonJS modules
- **Output**: [dist/](dist/) directory with source maps and declarations
- **Strict mode**: Enabled
- **Dev files excluded**: [dev/**/*](dev/) directory is excluded from compilation

## Package Manager

This project uses **Bun** (v1.2.19+) as specified in package.json, but is compatible with npm/node for production use.
