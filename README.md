# Optix GraphQL MCP Server# Optix GraphQL MCP Server



A Model Context Protocol (MCP) server that provides access to Optix business tools through GraphQL.A specialized Model Context Protocol (MCP) server for **Optix workspace management**, extending the powerful GraphQL foundation with business-specific tools for coworking spaces, flexible offices, and workspace booking systems.



## Features## 🌟 Features



- 15+ Optix business tools for bookings, members, resources, and analytics### 🔧 **Dual-Mode Operation**

- Real-time data access via Optix GraphQL API- **Generic GraphQL Mode**: Full GraphQL introspection and querying capabilities for any GraphQL API

- Built-in authentication and error handling- **Optix Business Mode**: Automatically detects Optix APIs and enables 20+ specialized business tools

- Compatible with Claude Desktop and other MCP clients

### 🎯 **Optix Business Tools**

## Quick Start

#### 📅 **Booking Management**

1. Install dependencies:- `optix_list_bookings` - List and filter bookings by date, status, member, or resource

   ```bash- `optix_get_booking_details` - Get comprehensive booking information

   npm install- `optix_check_availability` - Check resource availability with conflict detection

   ```- `optix_create_booking` - Create new bookings with validation

- `optix_cancel_booking` - Cancel bookings with reason tracking

2. Build the server:- `optix_get_upcoming_bookings` - View upcoming schedules

   ```bash

   npm run build#### 👥 **Member Management**

   ```- `optix_list_members` - Browse and search members

- `optix_get_member_profile` - Detailed member information and history

3. Configure Claude Desktop with your Optix API token:- `optix_search_members` - Smart search by name, email, or phone

   ```json- `optix_create_member` - Add new members with plan assignment

   {

     "mcpServers": {#### 🏢 **Resource Management**

       "optix": {- `optix_list_resources` - Browse meeting rooms, desks, and spaces

         "command": "node",- `optix_get_resource_details` - Resource info, amenities, and booking rules

         "args": ["path/to/dist/index.js"],- `optix_get_resource_schedule` - Detailed availability calendars

         "env": {

           "ENDPOINT": "https://api.optixapp.com/graphql",#### 💼 **Plan Templates**

           "HEADERS": "{\"Authorization\":\"Bearer YOUR_OPTIX_TOKEN\"}"- `optix_list_plan_templates` - Browse membership plans and pricing

         }- `optix_get_plan_template` - Detailed plan features and restrictions

       }

     }#### 📊 **Analytics & Reports**

   }- `optix_get_booking_stats` - Booking analytics and revenue insights

   ```- `optix_get_member_stats` - Member growth and engagement metrics

- `optix_get_organization_info` - Workspace settings and configuration

## Available Tools

## 🚀 Quick Start

### Booking Management

- `optix_list_bookings` - List and filter bookings### Installation

- `optix_get_booking_details` - Get specific booking information

- `optix_check_availability` - Check resource availability```bash

- `optix_get_upcoming_bookings` - Get upcoming bookings# Install globally

npm install -g optix-graphql-mcp

### Member Management  

- `optix_list_members` - List all members# Or use with npx

- `optix_get_member_profile` - Get member detailsnpx optix-graphql-mcp

- `optix_search_members` - Search members by query```



### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "optix": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {
        "NAME": "optix-workspace",
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer your-optix-token\"}",
        "ALLOW_MUTATIONS": "false"
      }
    }
  }
}
```

### Environment Variables

## License}

```

MIT License - see LICENSE file for details.
### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NAME` | Server name | `"optix-workspace"` | No |
| `ENDPOINT` | GraphQL endpoint URL | `"https://api.optixapp.com/graphql"` | Yes |
| `HEADERS` | HTTP headers (JSON) | `"{\"Authorization\":\"Bearer token\"}"` | Yes |
| `ALLOW_MUTATIONS` | Enable write operations | `"true"` or `"false"` (default) | No |
| `SCHEMA` | Local schema file path | `"./schema.graphql"` | No |

### 🔒 Mutation Tools (Optional)

By default, **all mutation tools are disabled** for safety. When `ALLOW_MUTATIONS=false` (default), you get 15 read-only tools:

- ✅ List and view data (bookings, members, resources)
- ✅ Search and filter 
- ✅ Check availability and get statistics
- ❌ Create, update, or delete operations

To enable **3 additional mutation tools**, set `ALLOW_MUTATIONS=true`:

- `optix_create_booking` - Create new bookings
- `optix_cancel_booking` - Cancel existing bookings  
- `optix_create_member` - Add new members

> **⚠️ Security Notice**: Only enable mutations if you need write operations and understand the risks. Mutations can modify your Optix data permanently.

## 💬 Usage Examples

### With Claude

**Check Today's Bookings:**
> "Show me all bookings for today"

Claude will use `optix_list_bookings` with today's date range.

**Find Available Meeting Rooms:**
> "Is Conference Room A available tomorrow from 2-4 PM?"

Claude will use `optix_check_availability` to check conflicts.

**Create a Booking:**
> "Book the main conference room for John Smith tomorrow 3-5 PM"

Claude will:
1. Search for John Smith using `optix_search_members`
2. Find the conference room using `optix_list_resources`
3. Check availability using `optix_check_availability`
4. Create the booking using `optix_create_booking`

**Member Management:**
> "Find all members named Sarah and show their recent activity"

Claude will use `optix_search_members` and `optix_get_member_profile`.

**Analytics:**
> "Show me booking statistics for this month"

Claude will use `optix_get_booking_stats` with appropriate date ranges.

## 🔧 Development

### Setup

```bash
# Clone repository
git clone https://github.com/Raulitoflying/optix-graphql-mcp.git
cd optix-graphql-mcp

# Install dependencies
bun install

# Start development server
bun run dev
```

### Build

```bash
# Build for production
bun run build

# Test locally
bun run start
```

### Project Structure

```
src/
├── index.ts              # Main server entry point
├── helpers/              # GraphQL utilities
│   ├── introspection.ts  # Schema introspection
│   ├── headers.ts        # HTTP header handling
│   ├── deprecation.ts    # Legacy warning system
│   └── package.ts        # Version management
└── optix/                # Optix business layer
    ├── queries.ts        # GraphQL query templates
    ├── tools.ts          # Business tool definitions
    └── types.ts          # TypeScript type definitions
```

## 🧪 Testing

The project includes debug tools for testing:

```bash
# Test with debug client
bun run dev/debug-client.ts

# Manual JSON-RPC testing
bun run dev/debug-manual-client.ts

# Start test GraphQL server
bun run dev/graphql.ts
```

## 🐳 Docker

```bash
# Build image
docker build -t optix-graphql-mcp .

# Run container
docker run -e ENDPOINT="https://api.optixapp.com/graphql" \
           -e HEADERS='{"Authorization":"Bearer token"}' \
           optix-graphql-mcp
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

### Adding New Optix Tools

1. Add GraphQL queries to `src/optix/queries.ts`
2. Define types in `src/optix/types.ts`
3. Implement tools in `src/optix/tools.ts`
4. Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Built on the excellent [mcp-graphql](https://github.com/blurrah/mcp-graphql) foundation
- Powered by the [Model Context Protocol](https://modelcontextprotocol.io/)
- Designed for [Optix](https://optixapp.com/) workspace management

---

**Made with ❤️ for the coworking community**
