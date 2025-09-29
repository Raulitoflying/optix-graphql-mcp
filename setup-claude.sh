#!/bin/bash

# Optix GraphQL MCP Server - Claude Desktop 自动配置脚本
# 
# 这个脚本将自动配置 Claude Desktop 来使用 Optix GraphQL MCP Server

set -e

echo "🚀 Optix GraphQL MCP Server - Claude Desktop 配置脚本"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Claude Desktop 是否安装
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo -e "${BLUE}📋 步骤 1: 检查 Claude Desktop 安装状态${NC}"

if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo -e "${RED}❌ 错误: Claude Desktop 配置目录不存在${NC}"
    echo -e "${YELLOW}请先安装 Claude Desktop: https://claude.ai/download${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Claude Desktop 配置目录存在${NC}"

# 检查项目构建状态
echo -e "${BLUE}📋 步骤 2: 验证项目构建状态${NC}"

PROJECT_DIR="$(dirname "$0")"
DIST_FILE="$PROJECT_DIR/dist/index.js"

if [ ! -f "$DIST_FILE" ]; then
    echo -e "${YELLOW}⚠️ 项目未构建，正在执行构建...${NC}"
    cd "$PROJECT_DIR"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 项目构建失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 项目构建成功${NC}"
else
    echo -e "${GREEN}✅ 项目已构建${NC}"
fi

# 获取用户输入的 Optix GraphQL 端点
echo -e "${BLUE}📋 步骤 3: 配置 Optix GraphQL 端点${NC}"

read -p "请输入你的 Optix GraphQL 端点 (例: https://yourworkspace.optixapp.com/graphql): " OPTIX_ENDPOINT

if [ -z "$OPTIX_ENDPOINT" ]; then
    echo -e "${YELLOW}⚠️ 使用默认测试端点: http://localhost:4000/graphql${NC}"
    OPTIX_ENDPOINT="http://localhost:4000/graphql"
fi

echo -e "${GREEN}✅ 使用端点: $OPTIX_ENDPOINT${NC}"

# 备份现有配置
echo -e "${BLUE}📋 步骤 4: 备份现有配置${NC}"

if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    BACKUP_FILE="$CLAUDE_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CLAUDE_CONFIG_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ 已备份现有配置到: $BACKUP_FILE${NC}"
    
    # 读取现有配置
    EXISTING_CONFIG=$(cat "$CLAUDE_CONFIG_FILE")
else
    echo -e "${YELLOW}⚠️ 未找到现有配置，将创建新配置${NC}"
    EXISTING_CONFIG='{}'
fi

# 生成新配置
echo -e "${BLUE}📋 步骤 5: 生成 MCP Server 配置${NC}"

# 获取项目的绝对路径
ABS_PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
ABS_DIST_FILE="$ABS_PROJECT_DIR/dist/index.js"

# 创建 Optix MCP Server 配置
OPTIX_CONFIG=$(cat << EOF
{
  "mcpServers": {
    "optix-graphql-mcp": {
      "command": "node",
      "args": [
        "$ABS_DIST_FILE",
        "$OPTIX_ENDPOINT"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF
)

# 如果存在现有配置，合并配置
if [ "$EXISTING_CONFIG" != "{}" ]; then
    # 使用 node 来合并 JSON 配置
    MERGED_CONFIG=$(node -e "
        const existing = $EXISTING_CONFIG;
        const optix = $OPTIX_CONFIG;
        
        if (!existing.mcpServers) {
            existing.mcpServers = {};
        }
        
        existing.mcpServers['optix-graphql-mcp'] = optix.mcpServers['optix-graphql-mcp'];
        
        console.log(JSON.stringify(existing, null, 2));
    ")
else
    MERGED_CONFIG="$OPTIX_CONFIG"
fi

# 写入配置文件
echo "$MERGED_CONFIG" > "$CLAUDE_CONFIG_FILE"

echo -e "${GREEN}✅ Claude Desktop 配置已更新${NC}"

# 显示配置摘要
echo -e "${BLUE}📋 步骤 6: 配置摘要${NC}"
echo -e "${GREEN}服务器名称:${NC} optix-graphql-mcp"
echo -e "${GREEN}GraphQL 端点:${NC} $OPTIX_ENDPOINT"
echo -e "${GREEN}服务器文件:${NC} $ABS_DIST_FILE"
echo -e "${GREEN}配置文件:${NC} $CLAUDE_CONFIG_FILE"

# 提供下一步指示
echo -e "${BLUE}📋 下一步操作${NC}"
echo -e "${YELLOW}1. 完全退出 Claude Desktop 应用程序${NC}"
echo -e "${YELLOW}2. 重新启动 Claude Desktop${NC}"
echo -e "${YELLOW}3. 在对话中测试: '你有哪些 Optix 相关的工具？'${NC}"

echo -e "${GREEN}🎉 配置完成！${NC}"

# 可选：询问是否立即测试
echo ""
read -p "是否现在运行快速测试？(y/N): " RUN_TEST

if [[ $RUN_TEST =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧪 运行快速测试...${NC}"
    node "$PROJECT_DIR/test-simple.js"
fi

echo -e "${GREEN}✨ 设置完成！请重启 Claude Desktop 开始使用 Optix 工具。${NC}"