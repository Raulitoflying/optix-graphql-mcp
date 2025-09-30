#!/usr/bin/env node

/**
 * 准确的 Optix API 测试 - 基于发现的字段结构
 */

const { GraphQLClient, gql } = require('graphql-request');

async function testAccurateAPI() {
	console.log('🎯 Optix API 准确测试');
	console.log('====================');

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
		// 1. 基础组织信息（已确认工作）
		console.log('\n1️⃣ 获取组织信息...');
		const orgQuery = gql`
			query {
				me {
					organization {
						organization_id
						name
						subdomain
						timezone
						currency
					}
				}
			}
		`;
		
		const orgResult = await client.request(orgQuery);
		console.log('✅ 组织信息:', JSON.stringify(orgResult, null, 2));

		// 2. 测试 accounts 查询（不包含 pagination）
		console.log('\n2️⃣ 测试 accounts 查询...');
		const accountsQuery = gql`
			query {
				accounts(limit: 3) {
					data {
						account_id
						name
						type
						email
						status
					}
				}
			}
		`;

		const accountsResult = await client.request(accountsQuery);
		console.log('✅ Accounts 查询成功:', JSON.stringify(accountsResult, null, 2));

		// 3. 测试 bookings 查询（修正字段名）
		console.log('\n3️⃣ 测试 bookings 查询...');
		const bookingsQuery = gql`
			query {
				bookings(limit: 3, include_new: true, include_approved: true) {
					data {
						booking_id
						start_timestamp
						end_timestamp
						account {
							account_id
							name
							email
						}
						resource {
							resource_id
							name
							title
						}
					}
				}
			}
		`;

		const bookingsResult = await client.request(bookingsQuery);
		console.log('✅ Bookings 查询成功:', JSON.stringify(bookingsResult, null, 2));

		// 4. 测试 resources 查询（修正字段名）
		console.log('\n4️⃣ 测试 resources 查询...');
		const resourcesQuery = gql`
			query {
				resources(limit: 3) {
					data {
						resource_id
						name
						title
						capacity
						is_bookable
						location {
							location_id
							name
						}
					}
				}
			}
		`;

		const resourcesResult = await client.request(resourcesQuery);
		console.log('✅ Resources 查询成功:', JSON.stringify(resourcesResult, null, 2));

		// 5. 测试 locations 查询
		console.log('\n5️⃣ 测试 locations 查询...');
		const locationsQuery = gql`
			query {
				locations(limit: 3) {
					data {
						location_id
						name
						address
						timezone
					}
				}
			}
		`;

		const locationsResult = await client.request(locationsQuery);
		console.log('✅ Locations 查询成功:', JSON.stringify(locationsResult, null, 2));

		console.log('\n🎉 所有测试完成！API 连接和基本查询都工作正常。');

	} catch (error) {
		console.error('❌ 测试失败:', error.message);
		if (error.response) {
			console.error('错误响应:', JSON.stringify(error.response.errors, null, 2));
		}
	}
}

testAccurateAPI().catch(console.error);