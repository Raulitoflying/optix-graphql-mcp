# 🏢 Optix MCP Server 真实 API 测试指南

本指南将帮助您使用真实的 Optix API 端点测试 MCP Server 的完整功能。

## 📋 测试前准备

### 1. 获取 Optix Access Token

根据 [Optix 官方文档](https://developer.optixapp.com/using-the-api/)：

1. **登录 Optix 管理后台**
   - 访问 `app.optixapp.com`
   - 使用您的 Optix 账户登录

2. **获取 Access Token**
   - 转到 `Develop → [your app]` 页面
   - 复制 Access Token
   - **Organization Token**: 以 `o` 结尾，用于组织级操作
   - **Personal Token**: 以 `p` 结尾，用于个人级操作

### 2. 配置认证信息

有多种方式配置 Access Token：

#### 方式 1: 使用配置助手 (推荐)
```bash
# 检查当前配置
node setup-optix-config.js

# 或直接设置 token
node setup-optix-config.js --token=your-optix-token
```

#### 方式 2: 环境变量
```bash
export OPTIX_ACCESS_TOKEN="your-optix-token"
```

#### 方式 3: .env 文件
```bash
echo "OPTIX_ACCESS_TOKEN=your-token" > .env
```

#### 方式 4: 样例测试 (仅演示)
```bash
export OPTIX_ACCESS_TOKEN="sample-personal"
```

## 🚀 运行测试

### 快速启动
```bash
./run-real-test.sh
```

### 手动运行
```bash
# 1. 确保项目已构建
npm run build

# 2. 检查配置
node setup-optix-config.js

# 3. 运行测试
node test-real-optix-api.js
```

## 📊 测试内容

测试脚本将执行以下步骤：

### 1. API 连接验证 🌐
- 验证 Optix API 端点连通性
- 测试 Bearer Token 认证
- 获取当前用户信息

### 2. Schema 内省 🔍
- 获取完整的 Optix GraphQL Schema
- 分析可用的查询和变更操作
- 保存真实 Schema 到 `optix-real-schema.graphql`

### 3. 业务工具测试 🧪
测试 18 个 Optix 业务工具：

| 工具名称 | 功能描述 |
|---------|---------|
| `optix_get_organization_info` | 获取组织基本信息 |
| `optix_list_members` | 列出组织成员 |
| `optix_list_resources` | 列出可预订资源 |
| `optix_list_bookings` | 列出预订记录 |
| `optix_get_member_details` | 获取成员详细信息 |
| `optix_get_resource_details` | 获取资源详细信息 |
| `optix_get_booking_details` | 获取预订详细信息 |
| `optix_search_members` | 搜索成员 |
| `optix_search_resources` | 搜索资源 |
| `optix_search_bookings` | 搜索预订 |
| `optix_list_plans` | 列出计划/套餐 |
| `optix_get_plan_details` | 获取计划详情 |
| `optix_list_teams` | 列出团队 |
| `optix_get_team_details` | 获取团队详情 |
| `optix_get_analytics_summary` | 获取分析摘要 |
| `optix_list_events` | 列出活动事件 |
| `optix_get_event_details` | 获取事件详情 |
| `optix_get_user_permissions` | 获取用户权限 |

### 4. 结果分析 📋
- 生成详细的测试报告
- 分析 API 响应结构
- 提供配置优化建议

## 📄 输出文件

测试完成后会生成以下文件：

1. **`optix-real-schema.graphql`** - 完整的 Optix GraphQL Schema
2. **`optix-test-report.md`** - 详细的测试结果报告

## 🔧 故障排除

### 常见问题

#### 1. Token 认证失败
```
❌ API 连接失败
错误详情: [{"message": "Invalid token"}]
```

**解决方案:**
- 检查 Token 是否正确复制
- 确认 Token 未过期
- 验证 Token 类型是否正确

#### 2. 权限不足
```
❌ API 连接失败
错误详情: [{"message": "Insufficient permissions"}]
```

**解决方案:**
- 确认 Token 具有相应权限
- 尝试使用 Organization Token
- 联系 Optix 管理员检查权限设置

#### 3. 网络连接问题
```
❌ 网络连接失败
```

**解决方案:**
- 检查网络连接
- 确认可以访问 `api.optixapp.com`
- 检查防火墙和代理设置

#### 4. Schema 内省失败
```
❌ Schema 内省失败
```

**解决方案:**
- 确认 API 连接正常
- 检查 Token 是否有内省权限
- 尝试重新运行测试

### 调试模式

启用详细日志：
```bash
DEBUG=optix:* node test-real-optix-api.js
```

## 🎯 测试成功标准

一个成功的测试应该显示：

```
🎯 真实 API 测试完成！
============================================
✅ API 连接: 成功
📊 Schema 内省: 成功
🧪 工具测试: 4/4 成功

🎉 Optix MCP Server 可以正常工作！
```

## 📝 下一步

测试成功后，您可以：

1. **配置 Claude Desktop**
   ```bash
   ./setup-claude.sh
   ```

2. **在 Claude Desktop 中测试对话**
   - 询问组织信息
   - 查询成员列表
   - 搜索预订记录

3. **根据真实 Schema 优化查询**
   - 查看 `optix-real-schema.graphql`
   - 更新 GraphQL 查询以匹配实际结构

4. **生产环境部署**
   - 发布到 npm: `npm publish`
   - 在生产环境中配置

## 🔗 相关链接

- [Optix API 文档](https://developer.optixapp.com/using-the-api/)
- [GraphQL Voyager](https://api.optixapp.com/graphql-voyager)
- [GraphQL Playground](https://api.optixapp.com/graphql-playground)
- [Model Context Protocol](https://github.com/modelcontextprotocol/specification)

## 💡 高级用法

### 自定义测试
```javascript
// 自定义测试脚本示例
const { runRealOptixTest, CONFIG } = require('./test-real-optix-api');

// 修改配置
CONFIG.timeout = 60000; // 增加超时时间
CONFIG.endpoint = 'https://api.optixapp.com/graphql'; // 自定义端点

// 运行测试
runRealOptixTest().then(() => {
  console.log('自定义测试完成');
});
```

### 持续集成
```yaml
# GitHub Actions 示例
name: Optix API Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: node test-real-optix-api.js
        env:
          OPTIX_ACCESS_TOKEN: ${{ secrets.OPTIX_ACCESS_TOKEN }}
```

---

如果您在测试过程中遇到任何问题，请检查上述故障排除部分，或创建 Issue 获得帮助。