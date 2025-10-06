# Optix GraphQL MCP Server

A specialized Model Context Protocol (MCP) server for **Optix workspace management**, providing 15+ business-specific tools for coworking spaces, flexible offices, and workspace booking systems.

## 🌟 Features

### 🔧 Dual-Mode Operation

- **Generic GraphQL Mode**: Full GraphQL introspection and querying for any GraphQL API
- **Optix Business Mode**: Auto-detects Optix endpoints and enables specialized business tools

### 🎯 Optix Business Tools (15+ read-only + 4 mutation tools)

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

\`\`\`bash
git clone https://github.com/Raulitoflying/optix-graphql-mcp.git
cd optix-graphql-mcp
npm install
npm run build
\`\`\`

### Claude Desktop Configuration

Add to `claude_desktop_config.json`:

\`\`\`json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer your-token\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
\`\`\`

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

### Check Today's Schedule
> "Show me today's complete schedule"

Uses `optix_get_upcoming_schedule`

### Find Available Rooms
> "Is Conference Room A available tomorrow 2-4 PM?"

Uses `optix_check_availability`

### Create Booking (requires mutations)
> "Book main conference room for John tomorrow 3-5 PM"

1. Searches member: `optix_search_members`
2. Finds resource: `optix_list_resources`
3. Checks availability: `optix_check_availability`
4. Creates booking: `optix_create_booking`

## 🔧 Development

### Scripts

\`\`\`bash
npm run dev      # Development with auto-reload
npm run build    # Production build
npm run start    # Start production server
npm run format   # Format code with Biome
npm run check    # Check formatting
\`\`\`

### Testing

\`\`\`bash
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
\`\`\`

### Using MCP Inspector

Interactive testing and debugging:

\`\`\`bash
npx @modelcontextprotocol/inspector ./run-server.sh
\`\`\`

Opens browser UI to test all tools interactively.

### Project Structure

\`\`\`
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
\`\`\`

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

\`\`\`typescript
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
\`\`\`

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Acknowledgments

- Built on [mcp-graphql](https://github.com/blurrah/mcp-graphql)
- Powered by [Model Context Protocol](https://modelcontextprotocol.io/)
- For [Optix](https://optixapp.com/) workspace management

---

**Made with ❤️ for the coworking community**
