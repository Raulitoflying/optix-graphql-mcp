# Claude Desktop 集成配置指南

## 📋 配置步骤

### 1. 备份现有配置（如果存在）
```bash
# 检查现有配置
ls ~/Library/Application\ Support/Claude/

# 如果存在，创建备份
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup
```

### 2. 配置 Optix GraphQL MCP Server

#### 方法 A: 直接复制配置文件
```bash
# 复制提供的配置文件到 Claude Desktop 配置目录
cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### 方法 B: 手动编辑现有配置
如果你已经有其他 MCP servers 在运行，请手动添加 Optix server 配置：

1. 打开 Claude Desktop 配置文件：
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

2. 在 `mcpServers` 对象中添加 Optix server：
```json
{
  "mcpServers": {
    "optix-graphql-mcp": {
      "command": "node",
      "args": [
        "/Users/raul/raulitoflying/optix-graphql-mcp/dist/index.js",
        "YOUR_OPTIX_GRAPHQL_ENDPOINT_HERE"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 3. 配置你的 Optix GraphQL 端点

⚠️ **重要**: 你需要将 `YOUR_OPTIX_GRAPHQL_ENDPOINT_HERE` 替换为你实际的 Optix GraphQL API 端点。

常见的 Optix 端点格式：
- `https://yourworkspace.optixapp.com/graphql`
- `https://api.optixapp.com/graphql`
- 或者你的自定义 Optix 部署端点

### 4. 环境变量配置（可选）

如果你的 Optix API 需要认证，可以在配置中添加环境变量：

```json
{
  "mcpServers": {
    "optix-graphql-mcp": {
      "command": "node",
      "args": [
        "/Users/raul/raulitoflying/optix-graphql-mcp/dist/index.js",
        "https://yourworkspace.optixapp.com/graphql"
      ],
      "env": {
        "NODE_ENV": "production",
        "OPTIX_API_TOKEN": "your-api-token-here",
        "OPTIX_WORKSPACE_ID": "your-workspace-id"
      }
    }
  }
}
```

### 5. 重启 Claude Desktop

配置完成后，完全退出并重新启动 Claude Desktop 应用程序。

### 6. 验证集成

启动 Claude Desktop 后，你应该能够：

1. **看到 Optix 工具**: 在对话中询问 "你有哪些 Optix 相关的工具？"

2. **使用业务功能**: 尝试这些命令：
   - "帮我查看今天的预订情况"
   - "显示会员列表"
   - "检查会议室可用性"

3. **检查工具列表**: 你应该看到这些 Optix 工具可用：
   - `optix_get_bookings` - 获取预订信息
   - `optix_create_booking` - 创建新预订
   - `optix_get_members` - 获取会员列表
   - `optix_get_resources` - 获取资源列表
   - `optix_get_analytics` - 获取分析数据
   - 等等...（总共16个工具）

## 🔧 故障排除

### 问题 1: Claude Desktop 启动失败
- 检查配置文件 JSON 格式是否正确
- 验证文件路径是否存在：`/Users/raul/raulitoflying/optix-graphql-mcp/dist/index.js`

### 问题 2: MCP Server 连接失败
- 确保你已经运行 `npm run build` 构建了项目
- 检查 Optix GraphQL 端点是否可访问
- 验证网络连接和 API 权限

### 问题 3: 工具不显示
- 重启 Claude Desktop
- 检查 Console.app 中的错误日志
- 验证 GraphQL schema 是否与 Optix API 兼容

### 问题 4: API 认证失败
- 确保你的 API token 有效
- 检查 workspace ID 是否正确
- 验证 Optix API 权限设置

## 📝 配置示例

### 完整配置示例
```json
{
  "mcpServers": {
    "optix-graphql-mcp": {
      "command": "node",
      "args": [
        "/Users/raul/raulitoflying/optix-graphql-mcp/dist/index.js",
        "https://mycompany.optixapp.com/graphql"
      ],
      "env": {
        "NODE_ENV": "production",
        "OPTIX_API_TOKEN": "your-token-here"
      }
    },
    "other-mcp-server": {
      "command": "uvx",
      "args": ["other-server"]
    }
  }
}
```

## ✅ 验证清单

- [ ] 配置文件已创建/更新
- [ ] Optix GraphQL 端点已配置
- [ ] 项目已构建 (`npm run build`)
- [ ] Claude Desktop 已重启
- [ ] 可以看到 Optix 工具列表
- [ ] 测试了基本的 Optix 功能
- [ ] API 认证工作正常（如需要）

配置完成后，你就可以在 Claude Desktop 中直接使用 Optix 的所有业务功能了！🚀