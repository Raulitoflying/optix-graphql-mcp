#!/bin/bash

# Optix MCP Server 真实 API 测试启动脚本

echo "🏢 Optix GraphQL MCP Server - 真实 API 测试"
echo "============================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未发现 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查项目构建
if [ ! -f "dist/index.js" ]; then
    echo "🔨 构建项目..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 项目构建失败"
        exit 1
    fi
fi

# 检查 Optix API 配置
echo "🔍 检查 Optix API 配置..."
node setup-optix-config.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 启动真实 API 测试..."
    echo "==============================="
    node test-real-optix-api.js
else
    echo ""
    echo "❌ 配置检查失败，请按照上述指南设置 Optix Access Token"
    echo ""
    echo "📋 快速设置示例:"
    echo "export OPTIX_ACCESS_TOKEN=\"your-optix-token\""
    echo "或者运行:"
    echo "node setup-optix-config.js --token=your-optix-token"
    exit 1
fi