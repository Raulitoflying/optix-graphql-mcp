# Optix GraphQL MCP Server

A specialized Model Context Protocol (MCP) server for **Optix workspace management**, providing 15+ business-specific tools for coworking spaces, flexible offices, and workspace booking systems.

## 🌟 Features

### 🔧 Dual-Mode Operation

The server provides **2 base tools** for any GraphQL API, plus **19 Optix-specific tools** when connected to Optix.

#### 🔹 Base GraphQL Tools (Always Available)

- `introspect-schema` - Get GraphQL schema information for any endpoint
- `query-graphql` - Execute custom GraphQL queries with variables

These tools work with **any GraphQL API**, not just Optix. Perfect for:
- Exploring unknown GraphQL schemas
- Running custom queries
- Debugging API responses
- Advanced use cases not covered by specialized tools

**Note**: While these tools can technically perform any operation, the specialized Optix tools below are **faster and more AI-friendly** because they:
- Complete operations in 1 step vs 2-3 steps
- Have clear, simple parameters
- Return optimized data structures
- Don't require knowledge of GraphQL syntax

#### 🎯 Optix Business Tools (Auto-enabled for Optix APIs)

When the endpoint contains "optix" or "optixapp.com", **19 specialized tools** are automatically loaded:

#### 📅 Booking Management
- `optix_list_bookings` - List and filter bookings
- `optix_get_booking_details` - Get comprehensive booking info
- `optix_check_availability` - Check resource availability (defaults to 7 days)
- `optix_get_upcoming_schedule` - View schedule with bookings, assignments, blocks
- `optix_create_booking` 🔒 - Create new bookings
- `optix_update_booking` 🔒 - Update booking time or resource
- `optix_cancel_booking` 🔒 - Cancel bookings

#### 👥 Member Management
- `optix_list_members` - Browse all members
- `optix_get_member` - Get detailed member info
- `optix_search_members` - Search by name, email, or phone
- `optix_get_member_stats` - Member statistics and breakdowns
- `optix_create_member` 🔒 - Add new members/leads

#### 🏢 Resource Management
- `optix_list_resources` - Browse rooms, desks, and spaces
- `optix_get_resource_details` - Resource info and amenities
- `optix_get_resource_schedule` - Detailed availability calendars

#### 💼 Plans & Organization
- `optix_list_plan_templates` - Browse membership plans
- `optix_get_plan_template` - Plan details and pricing
- `optix_get_organization_info` - Workspace settings
- `optix_list_locations` - All locations
- `optix_get_teams` - Teams and organizations

🔒 = Mutation tool (requires `ALLOW_MUTATIONS=true`)

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Raulitoflying/optix-graphql-mcp.git
cd optix-graphql-mcp
npm install
npm run build
```

### Configuration for AI Applications

#### 🖥️ Claude Desktop

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["/absolute/path/to/optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

#### 📝 Cursor

**macOS/Linux**: `~/.cursor/mcp_config.json`
**Windows**: `%USERPROFILE%\.cursor\mcp_config.json`

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["/absolute/path/to/optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

#### 🌊 Windsurf

Similar configuration to Cursor. Check Windsurf's documentation for config file location.

#### 💻 VS Code

Install MCP extension, then create `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["${workspaceFolder}/../optix-graphql-mcp/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/optix-graphql-mcp` with your actual path and `YOUR_TOKEN` with your Optix API token from [Optix Dashboard](https://app.optixapp.com).

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENDPOINT` | ✅ | - | GraphQL endpoint URL |
| `HEADERS` | ✅ | - | HTTP headers as JSON string |
| `NAME` | ❌ | `"mcp-graphql"` | Server name |
| `ALLOW_MUTATIONS` | ❌ | `"false"` | Enable write operations |
| `SCHEMA` | ❌ | - | Local schema file path |

## 🔒 Mutations (Optional)

**Default: Read-only mode** (`ALLOW_MUTATIONS=false`)
- 15+ read-only tools
- Safe for production use
- No data modification

**Mutations enabled** (`ALLOW_MUTATIONS=true`)
- 4 additional write tools
- Can create/update/cancel bookings
- Can create members

> ⚠️ **Security**: Only enable mutations when needed and ensure proper authentication.

## 💬 Usage Examples

### Using Base GraphQL Tools

**Explore Any GraphQL API:**
> "Introspect the schema of this GraphQL endpoint"

Uses `introspect-schema` to discover available types, queries, and mutations.

**Run Custom Queries:**
> "Query the GraphQL API with this custom query: { users { id name } }"

Uses `query-graphql` to execute any GraphQL query against the configured endpoint.

### Using Optix Business Tools

**Check Today's Schedule:**
> "Show me today's complete schedule"

Uses `optix_get_upcoming_schedule`

**Find Available Rooms:**
> "Is Conference Room A available tomorrow 2-4 PM?"

Uses `optix_check_availability`

**Search Members:**
> "Find all members named Sarah"

Uses `optix_search_members`

**Create Booking (requires mutations):**
> "Book main conference room for John tomorrow 3-5 PM"

1. Searches member: `optix_search_members`
2. Finds resource: `optix_list_resources`
3. Checks availability: `optix_check_availability`
4. Creates booking: `optix_create_booking`

## 🔧 Troubleshooting

### Server not connecting?
1. Check the path is absolute (not relative)
2. Ensure `dist/index.js` exists (run `npm run build`)
3. Verify your Optix token is valid
4. Check config file has valid JSON syntax
5. Restart the AI application after config changes

### Tools not appearing?
1. Restart the AI application completely
2. Check server logs for errors
3. Verify `ENDPOINT` points to `https://api.optixapp.com/graphql`
4. Ensure Node.js is installed and accessible

### Mutations not working?
1. Set `ALLOW_MUTATIONS=true` in config
2. Verify your Optix token has write permissions
3. Check mutation is enabled for your Optix account

## 🔧 Development

### Scripts

```bash
npm run dev      # Development with auto-reload
npm run build    # Production build
npm run start    # Start production server
npm run format   # Format code with Biome
npm run check    # Check formatting
```

### Testing

```bash
# Test MCP stdio communication
node test-mcp-stdio.js

# Test business tools
node test-business-tools.js
node test-all-business-tools.js

# Test mutations (requires ALLOW_MUTATIONS=true)
node test-mutation-mode.js

# Test specific features
node test-pagination.js
node test-booking-fixes.js
```

### Using MCP Inspector

**MCP Inspector** is a web-based tool for interactively testing MCP servers. It's perfect for:
- Testing tools before deploying
- Debugging issues
- Understanding tool parameters
- Viewing real API responses

#### Setup and Run

```bash
# 1. Create your local configuration
cp run-server.sh.example run-server.sh

# 2. Edit run-server.sh and add your Optix token
# Replace YOUR_TOKEN_HERE with your actual token

# 3. Run Inspector
npx @modelcontextprotocol/inspector ./run-server.sh
```

This will:
1. Start the MCP server with your configuration
2. Launch Inspector proxy on `http://localhost:6274`
3. Open your browser automatically

#### Using Inspector

Once the browser opens:

1. **View Tools** - See all 21 available tools (2 base + 19 Optix) in the left sidebar
2. **Test a Tool** - Click any tool to see its parameters
3. **Run Tool** - Fill in parameters and click "Run"
4. **View Results** - See the JSON response from API

**Example Tests:**

```json
// Base GraphQL Tools
// introspect-schema - No parameters needed
{}

// query-graphql
{
  "query": "{ accounts(limit: 5) { data { account_id name email } } }",
  "variables": {}
}

// Optix Business Tools
// optix_list_bookings
{
  "days": 7
}

// optix_search_members
{
  "query": "John"
}

// optix_check_availability
{
  "resourceId": "602411",
  "start": "2024-10-08T14:00:00Z",
  "end": "2024-10-08T16:00:00Z"
}

// optix_get_upcoming_schedule
{
  "days": 1
}
```

**Tips:**
- Use Inspector's **JSON editor** for complex parameters
- Check the **Response** tab to see full API output
- Test mutations in Inspector before using in production
- Inspector runs on port 6274 by default

> **Security Note**: `run-server.sh` is git-ignored because it contains your API token. Never commit files with real tokens!

### Project Structure

```
src/
├── index.ts              # Main MCP server
├── helpers/
│   ├── introspection.ts  # Schema discovery
│   ├── headers.ts        # Auth handling
│   └── execute.ts        # GraphQL execution
└── optix/
    ├── queries.ts        # Query templates (15+ read + 4 mutations)
    ├── tools.ts          # Tool definitions
    └── types.ts          # TypeScript types
```

## 🤝 Contributing

### Adding New Tools

1. **Add query** to `src/optix/queries.ts`
2. **Define types** in `src/optix/types.ts`
3. **Implement tool** in `src/optix/tools.ts`:
   - Define Zod schema with `.describe()`
   - Implement `execute()` function
   - For mutations, add inside `if (allowMutations)` block
4. **Update docs**

### Example Tool

```typescript
tools.set("optix_example", {
  name: "optix_example",
  description: "Example tool description",
  inputSchema: z.object({
    param: z.string().describe("Parameter description"),
  }),
  execute: async (args, endpoint, headers) => {
    const data = await executeGraphQL(
      OPTIX_QUERIES.EXAMPLE,
      { param: args.param },
      endpoint,
      headers
    );
    return data.result;
  },
});
```

## 📄 License

MIT License - see [LICENSE](LICENSE)

## Automation Mapping (Natural Language Examples)

This section explains how to translate natural language requests into automation rules.

### Logic Rules

- Default: multiple conditions mean AND.
- Use groups for OR:
  - Each group is AND.
  - Groups are OR.

### Example 1: Single condition

Natural language:
"Send a message when a user books for the 1st time."

Structure:
```
trigger_type: NEW_BOOKING
conditions_logic: SINGLE
conditions:
  - operation: EQUALS
    operands:
      - { type: variable, name: NTH_TIME }
      - { type: value, value: 1 }
actions:
  - SEND_MESSAGE
```

### Example 2: AND conditions

Natural language:
"If booking source is not drop-in AND this is the 1st booking, send a message."

Structure:
```
trigger_type: NEW_BOOKING
conditions_logic: AND
conditions:
  - operation: DIFF
    operands:
      - { type: variable, name: BOOKING_SOURCE }
      - { type: value, value: Booking::SOURCE_DROP_IN }
  - operation: EQUALS
    operands:
      - { type: variable, name: NTH_TIME }
      - { type: value, value: 1 }
actions:
  - SEND_MESSAGE
```

### Example 3: OR groups

Natural language:
"If account source is User app OR Web onboarding, send an email."

Structure:
```
trigger_type: NEW_UNCONFIRMED_USER
conditions_groups:
  - conditions:
      - operation: EQUALS
        operands:
          - { type: variable, name: ACCOUNT_SOURCE }
          - { type: value, value: User app }
  - conditions:
      - operation: EQUALS
        operands:
          - { type: variable, name: ACCOUNT_SOURCE }
          - { type: value, value: Web onboarding }
actions:
  - SEND_EMAIL
```

### Example 4: Date modifier

Natural language:
"Send a message 7 days before the oldest unpaid invoice due date."

Structure:
```
trigger_type: DATE
conditions_logic: SINGLE
conditions:
  - operation: EQUALS
    operands:
      - { type: variable, name: ACCOUNT_MIN_DUE_INVOICE_DUE_DATE }
      - { type: variable, name: TRIGGER_DATE, date_modifier: { value: -7, unit: DAY } }
actions:
  - SEND_MESSAGE
```

## 🙏 Acknowledgments

- Built on [mcp-graphql](https://github.com/blurrah/mcp-graphql)
- Powered by [Model Context Protocol](https://modelcontextprotocol.io/)
- For [Optix](https://optixapp.com/) workspace management

---

**Made with ❤️ for the coworking community**
