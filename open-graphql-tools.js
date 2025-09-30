#!/usr/bin/env node

/**
 * Optix GraphQL 工具链接
 * 快速打开 Optix GraphQL 开发工具
 */

const { spawn } = require('child_process');

console.log('🔧 Optix GraphQL 开发工具');
console.log('========================\n');

const tools = [
  {
    name: 'GraphQL Voyager',
    description: '可视化 Schema 探索器',
    url: 'https://api.optixapp.com/graphql-voyager',
    emoji: '🗺️'
  },
  {
    name: 'GraphQL Playground',
    description: '交互式查询编辑器',
    url: 'https://api.optixapp.com/graphql-playground',
    emoji: '🎮'
  },
  {
    name: 'Optix API 文档',
    description: '官方 API 使用指南',
    url: 'https://developer.optixapp.com/using-the-api/',
    emoji: '📚'
  }
];

console.log('可用的 GraphQL 开发工具:\n');

tools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.emoji} ${tool.name}`);
  console.log(`   ${tool.description}`);
  console.log(`   ${tool.url}\n`);
});

// 检查命令行参数
const args = process.argv.slice(2);

if (args.length > 0) {
  const choice = parseInt(args[0]);
  
  if (choice >= 1 && choice <= tools.length) {
    const selectedTool = tools[choice - 1];
    console.log(`🚀 正在打开 ${selectedTool.name}...`);
    
    // 尝试在默认浏览器中打开链接
    const command = process.platform === 'darwin' ? 'open' : 
                   process.platform === 'win32' ? 'start' : 'xdg-open';
    
    spawn(command, [selectedTool.url], { detached: true, stdio: 'ignore' });
    
    console.log(`✅ 已在浏览器中打开: ${selectedTool.url}`);
  } else {
    console.log('❌ 无效选择，请输入 1-3 之间的数字');
  }
} else {
  console.log('💡 使用方法:');
  console.log('   node open-graphql-tools.js [1-3]');
  console.log('\n示例:');
  console.log('   node open-graphql-tools.js 1  # 打开 Voyager');
  console.log('   node open-graphql-tools.js 2  # 打开 Playground');
  console.log('   node open-graphql-tools.js 3  # 打开 API 文档');
  console.log('\n🔐 注意: 这些工具可能需要您在浏览器中手动输入 Access Token');
}

module.exports = { tools };