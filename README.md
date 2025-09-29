# Optix GraphQL MCP Server

A specialized Model Context Protocol (MCP) server for **Optix workspace management**, extending the powerful GraphQL foundation with business-specific tools for coworking spaces, flexible offices, and workspace booking systems.

## 🌟 Features

### 🔧 **Dual-Mode Operation**
- **Generic GraphQL Mode**: Full GraphQL introspection and querying capabilities for any GraphQL API
- **Optix Business Mode**: Automatically detects Optix APIs and enables 20+ specialized business tools

### 🎯 **Optix Business Tools**

#### 📅 **Booking Management**
- `optix_list_bookings` - List and filter bookings by date, status, member, or resource
- `optix_get_booking_details` - Get comprehensive booking information
- `optix_check_availability` - Check resource availability with conflict detection
- `optix_create_booking` - Create new bookings with validation
- `optix_cancel_booking` - Cancel bookings with reason tracking
- `optix_get_upcoming_bookings` - View upcoming schedules

#### 👥 **Member Management**
- `optix_list_members` - Browse and search members
- `optix_get_member_profile` - Detailed member information and history
- `optix_search_members` - Smart search by name, email, or phone
- `optix_create_member` - Add new members with plan assignment

#### 🏢 **Resource Management**
- `optix_list_resources` - Browse meeting rooms, desks, and spaces
- `optix_get_resource_details` - Resource info, amenities, and booking rules
- `optix_get_resource_schedule` - Detailed availability calendars

#### 💼 **Plan Templates**
- `optix_list_plan_templates` - Browse membership plans and pricing
- `optix_get_plan_template` - Detailed plan features and restrictions

#### 📊 **Analytics & Reports**
- `optix_get_booking_stats` - Booking analytics and revenue insights
- `optix_get_member_stats` - Member growth and engagement metrics
- `optix_get_organization_info` - Workspace settings and configuration

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g optix-graphql-mcp

# Or use with npx
npx optix-graphql-mcp
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "optix": {
      "command": "npx",
      "args": ["optix-graphql-mcp"],
      "env": {
        "NAME": "optix-workspace",
        "ENDPOINT": "https://api.optixapp.com/graphql",
        "HEADERS": "{\"Authorization\":\"Bearer your-api-key\"}",
        "ALLOW_MUTATIONS": "true"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NAME` | Server name | `"optix-workspace"` |
| `ENDPOINT` | GraphQL endpoint URL | `"https://api.optixapp.com/graphql"` |
| `HEADERS` | HTTP headers (JSON) | `"{\"Authorization\":\"Bearer token\"}"` |
| `ALLOW_MUTATIONS` | Enable mutations | `"true"` or `"false"` |
| `SCHEMA` | Local schema file path | `"./schema.graphql"` |

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
