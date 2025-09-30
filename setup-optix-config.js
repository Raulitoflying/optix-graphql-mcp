#!/usr/bin/env node

/**
 * Optix API 配置助手
 * 帮助用户快速配置 Optix API 认证信息
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Optix API 配置助手');
console.log('=====================\n');

/**
 * 检查是否已有配置
 */
function checkExistingConfig() {
  const envFile = path.join(process.cwd(), '.env');
  const envVar = process.env.OPTIX_ACCESS_TOKEN;
  
  if (envVar) {
    console.log('✅ 发现环境变量中的 OPTIX_ACCESS_TOKEN');
    console.log(`   Token: ${envVar.slice(0, 8)}...${envVar.slice(-3)}`);
    return envVar;
  }
  
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const match = content.match(/OPTIX_ACCESS_TOKEN=([^\n\r]+)/);
    if (match) {
      console.log('✅ 发现 .env 文件中的 OPTIX_ACCESS_TOKEN');
      console.log(`   Token: ${match[1].slice(0, 8)}...${match[1].slice(-3)}`);
      return match[1];
    }
  }
  
  console.log('⚠️ 未发现 Optix Access Token 配置');
  return null;
}

/**
 * 提供配置指南
 */
function showConfigGuide() {
  console.log('\n📋 获取 Optix Access Token 的步骤:');
  console.log('=====================================');
  console.log('1. 登录 Optix 管理后台 (app.optixapp.com)');
  console.log('2. 转到 "Develop → [your app]" 页面');
  console.log('3. 复制 Access Token:');
  console.log('   • Organization Token (以 "o" 结尾) - 用于组织级操作');
  console.log('   • Personal Token (以 "p" 结尾) - 用于个人级操作');
  console.log('');
  
  console.log('🛠️ 配置方式选择:');
  console.log('=================');
  console.log('方式 1 - 环境变量 (推荐):');
  console.log('   export OPTIX_ACCESS_TOKEN="your-optix-token"');
  console.log('');
  console.log('方式 2 - .env 文件:');
  console.log('   echo "OPTIX_ACCESS_TOKEN=your-token" > .env');
  console.log('');
  console.log('方式 3 - 样例测试 (仅用于演示):');
  console.log('   export OPTIX_ACCESS_TOKEN="sample-personal"');
  console.log('');
}

/**
 * 创建 .env 文件
 */
function createEnvFile(token) {
  const envFile = path.join(process.cwd(), '.env');
  const content = `# Optix API 配置
OPTIX_ACCESS_TOKEN=${token}

# 可选：设置开发模式
NODE_ENV=development

# 可选：启用调试日志
DEBUG=optix:*
`;
  
  fs.writeFileSync(envFile, content);
  console.log('✅ .env 文件已创建');
  console.log(`   位置: ${envFile}`);
  
  // 确保 .env 在 .gitignore 中
  const gitignoreFile = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignoreFile)) {
    const gitignoreContent = fs.readFileSync(gitignoreFile, 'utf8');
    if (!gitignoreContent.includes('.env')) {
      fs.appendFileSync(gitignoreFile, '\n# Environment variables\n.env\n');
      console.log('✅ .env 已添加到 .gitignore');
    }
  }
}

/**
 * 验证 Token 格式
 */
function validateToken(token) {
  if (!token || token.length < 10) {
    return { valid: false, reason: 'Token 长度太短' };
  }
  
  if (token === 'sample-personal') {
    return { valid: true, type: 'Sample', note: '这是样例 token，仅用于演示' };
  }
  
  if (token.endsWith('o')) {
    return { valid: true, type: 'Organization', note: '组织级 token，可以访问组织数据' };
  }
  
  if (token.endsWith('p')) {
    return { valid: true, type: 'Personal', note: '个人级 token，可以访问个人数据' };
  }
  
  return { valid: true, type: 'Unknown', note: '未知 token 类型，请确认是否正确' };
}

/**
 * 快速 API 测试
 */
function quickApiTest(token) {
  return new Promise((resolve) => {
    console.log('\n🧪 快速 API 连接测试...');
    
    const testScript = `
const https = require('https');

const query = \`query { me { user { name email } } }\`;
const postData = JSON.stringify({ query });

const options = {
  hostname: 'api.optixapp.com',
  port: 443,
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.errors) {
        console.log('API_TEST_ERROR:', response.errors[0].message);
      } else {
        console.log('API_TEST_SUCCESS:', JSON.stringify(response.data));
      }
    } catch (e) {
      console.log('API_TEST_PARSE_ERROR:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.log('API_TEST_NETWORK_ERROR:', e.message);
});

req.write(postData);
req.end();
`;
    
    const testProcess = spawn('node', ['-e', testScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.on('close', () => {
      if (output.includes('API_TEST_SUCCESS')) {
        console.log('✅ API 连接测试成功');
        const match = output.match(/API_TEST_SUCCESS: (.+)/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            if (data.me && data.me.user) {
              console.log(`   用户: ${data.me.user.name} (${data.me.user.email})`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
        resolve(true);
      } else if (output.includes('API_TEST_ERROR')) {
        const match = output.match(/API_TEST_ERROR: (.+)/);
        console.log(`❌ API 测试失败: ${match ? match[1] : '未知错误'}`);
        resolve(false);
      } else {
        console.log('⚠️ API 测试结果不明确');
        console.log('输出:', output.slice(0, 200));
        resolve(false);
      }
    });
    
    setTimeout(() => {
      testProcess.kill();
      console.log('⏰ API 测试超时');
      resolve(false);
    }, 10000);
  });
}

/**
 * 主函数
 */
async function main() {
  const existingToken = checkExistingConfig();
  
  if (existingToken) {
    const validation = validateToken(existingToken);
    console.log(`🏷️ Token 类型: ${validation.type}`);
    console.log(`📝 说明: ${validation.note}`);
    
    if (validation.valid) {
      const testResult = await quickApiTest(existingToken);
      
      if (testResult) {
        console.log('\n🎉 配置正确！您现在可以运行真实 API 测试：');
        console.log('   node test-real-optix-api.js');
      } else {
        console.log('\n⚠️ 配置可能有问题，请检查 Token 权限');
      }
    }
  } else {
    showConfigGuide();
    
    // 检查是否有命令行参数
    const args = process.argv.slice(2);
    if (args.length > 0 && args[0].startsWith('--token=')) {
      const token = args[0].split('=')[1];
      const validation = validateToken(token);
      
      if (validation.valid) {
        console.log(`\n✅ 使用提供的 ${validation.type} Token`);
        createEnvFile(token);
        
        const testResult = await quickApiTest(token);
        if (testResult) {
          console.log('\n🎉 配置完成！您现在可以运行：');
          console.log('   node test-real-optix-api.js');
        }
      } else {
        console.log(`\n❌ Token 验证失败: ${validation.reason}`);
      }
    } else {
      console.log('\n💡 使用示例:');
      console.log('   node setup-optix-config.js --token=your-optix-token');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}