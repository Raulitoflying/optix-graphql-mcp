#!/usr/bin/env node

/**
 * 简化的 Optix API 测试 - 探索真实的 Schema 结构
 */

const { GraphQLClient, gql } = require('graphql-request');

async function testSimpleAPI() {
	console.log('🔍 Optix API 简化测试');
	console.log('====================');

	// 检查环境变量
	const token = process.env.OPTIX_ACCESS_TOKEN;
	if (!token) {
		console.error('❌ 缺少 OPTIX_ACCESS_TOKEN 环境变量');
		process.exit(1);
	}

	const endpoint = 'https://api.optixapp.com/graphql';
	const client = new GraphQLClient(endpoint, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		timeout: 60000,
	});

	try {
		// 1. 测试最基本的查询
		console.log('\n1️⃣ 测试 ping 查询...');
		const pingQuery = gql`
			query {
				ping {
					pong
				}
			}
		`;
		
		try {
			const pingResult = await client.request(pingQuery);
			console.log('✅ Ping 成功:', pingResult);
		} catch (pingError) {
			console.log('❌ Ping 失败:', pingError.message);
		}

		// 2. 测试 me 查询（最简化版本）
		console.log('\n2️⃣ 测试基础 me 查询...');
		const simpleMeQuery = gql`
			query {
				me {
					user {
						id
						name
						email
					}
					organization {
						organization_id
						name
					}
				}
			}
		`;

		try {
			const meResult = await client.request(simpleMeQuery);
			console.log('✅ Me 查询成功:', JSON.stringify(meResult, null, 2));
		} catch (meError) {
			console.log('❌ Me 查询失败:', meError.message);
			
			// 尝试更简化的版本
			console.log('\n🔄 尝试最简化的 me 查询...');
			const minimalMeQuery = gql`
				query {
					me {
						organization {
							organization_id
							name
						}
					}
				}
			`;
			
			try {
				const minimalResult = await client.request(minimalMeQuery);
				console.log('✅ 最简化 me 查询成功:', JSON.stringify(minimalResult, null, 2));
			} catch (minimalError) {
				console.log('❌ 最简化 me 查询也失败:', minimalError.message);
			}
		}

		// 3. 测试 accounts 查询
		console.log('\n3️⃣ 测试 accounts 查询...');
		const accountsQuery = gql`
			query {
				accounts(limit: 5) {
					data {
						account_id
						name
						type
					}
					pagination {
						total
					}
				}
			}
		`;

		try {
			const accountsResult = await client.request(accountsQuery);
			console.log('✅ Accounts 查询成功:', JSON.stringify(accountsResult, null, 2));
		} catch (accountsError) {
			console.log('❌ Accounts 查询失败:', accountsError.message);
		}

	} catch (error) {
		console.error('❌ 测试过程中出现错误:', error);
	}
}

// 检查是否有必要的依赖
try {
	require('graphql-request');
} catch (e) {
	console.error('❌ 缺少 graphql-request 依赖。请运行: npm install graphql-request');
	process.exit(1);
}

testSimpleAPI().catch(console.error);