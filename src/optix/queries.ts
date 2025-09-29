/**
 * Optix GraphQL Query Templates
 * 
 * This file contains pre-defined GraphQL queries and mutations specifically
 * tailored for Optix business operations. These templates cover common
 * business scenarios like booking management, member operations, and
 * resource scheduling.
 */

export const OPTIX_QUERIES = {
	// ==================== 预订相关查询 ====================
	
	LIST_BOOKINGS: `
		query ListBookings($from: DateTime, $to: DateTime, $status: String, $limit: Int) {
			bookings(from: $from, to: $to, status: $status, limit: $limit) {
				id
				start
				end
				status
				member {
					id
					name
					email
				}
				resource {
					id
					name
					type
				}
				notes
				createdAt
				updatedAt
			}
		}
	`,
	
	GET_BOOKING: `
		query GetBooking($id: ID!) {
			booking(id: $id) {
				id
				start
				end
				status
				member {
					id
					name
					email
					phone
				}
				resource {
					id
					name
					type
					capacity
					amenities
				}
				notes
				createdAt
				updatedAt
				cancelledAt
				cancelReason
			}
		}
	`,
	
	CHECK_AVAILABILITY: `
		query CheckAvailability($resourceId: ID!, $start: DateTime!, $end: DateTime!) {
			resource(id: $resourceId) {
				id
				name
				type
				availability(start: $start, end: $end) {
					available
					conflicts {
						id
						start
						end
						member {
							name
						}
					}
				}
			}
		}
	`,
	
	GET_UPCOMING_BOOKINGS: `
		query GetUpcomingBookings($memberId: ID, $resourceId: ID, $days: Int = 7) {
			upcomingBookings(memberId: $memberId, resourceId: $resourceId, days: $days) {
				id
				start
				end
				status
				member {
					id
					name
					email
				}
				resource {
					id
					name
					type
				}
			}
		}
	`,
	
	// ==================== 成员相关查询 ====================
	
	LIST_MEMBERS: `
		query ListMembers($search: String, $status: String, $limit: Int, $offset: Int) {
			members(search: $search, status: $status, limit: $limit, offset: $offset) {
				id
				name
				email
				phone
				status
				plan {
					id
					name
					type
				}
				organization {
					id
					name
				}
				createdAt
				lastSeenAt
			}
		}
	`,
	
	GET_MEMBER: `
		query GetMember($id: ID!) {
			member(id: $id) {
				id
				name
				email
				phone
				status
				plan {
					id
					name
					type
					startDate
					endDate
					price
					currency
				}
				organization {
					id
					name
				}
				recentBookings: bookings(limit: 10) {
					id
					start
					end
					status
					resource {
						id
						name
						type
					}
				}
				createdAt
				lastSeenAt
			}
		}
	`,
	
	SEARCH_MEMBERS: `
		query SearchMembers($query: String!, $limit: Int = 20) {
			searchMembers(query: $query, limit: $limit) {
				id
				name
				email
				status
				plan {
					name
				}
				organization {
					name
				}
			}
		}
	`,
	
	// ==================== 计划模板相关查询 ====================
	
	LIST_PLAN_TEMPLATES: `
		query ListPlanTemplates($active: Boolean, $category: String) {
			planTemplates(active: $active, category: $category) {
				id
				name
				description
				price
				currency
				billingPeriod
				category
				features
				active
				sortOrder
			}
		}
	`,
	
	GET_PLAN_TEMPLATE: `
		query GetPlanTemplate($id: ID!) {
			planTemplate(id: $id) {
				id
				name
				description
				price
				currency
				billingPeriod
				category
				features
				bookingCredits
				accessHours
				amenities
				restrictions
				active
				createdAt
				updatedAt
			}
		}
	`,
	
	// ==================== 资源/空间相关查询 ====================
	
	LIST_RESOURCES: `
		query ListResources($type: String, $available: Boolean, $capacity: Int) {
			resources(type: $type, available: $available, capacity: $capacity) {
				id
				name
				type
				capacity
				amenities
				hourlyRate
				currency
				bookingRules {
					minDuration
					maxDuration
					advanceBooking
				}
				images {
					url
					alt
				}
			}
		}
	`,
	
	GET_RESOURCE: `
		query GetResource($id: ID!) {
			resource(id: $id) {
				id
				name
				description
				type
				capacity
				amenities
				hourlyRate
				currency
				bookingRules {
					minDuration
					maxDuration
					advanceBooking
					allowCancellation
				}
				images {
					url
					alt
				}
				location {
					floor
					room
					building
				}
				upcomingBookings(days: 3) {
					id
					start
					end
					member {
						name
					}
				}
			}
		}
	`,
	
	GET_RESOURCE_SCHEDULE: `
		query GetResourceSchedule($resourceId: ID!, $from: DateTime!, $to: DateTime!) {
			resource(id: $resourceId) {
				id
				name
				schedule(from: $from, to: $to) {
					date
					slots {
						start
						end
						available
						booking {
							id
							member {
								name
							}
						}
					}
				}
			}
		}
	`,
	
	// ==================== 组织相关查询 ====================
	
	GET_ORGANIZATION_INFO: `
		query GetOrganizationInfo {
			organization {
				id
				name
				timezone
				currency
				settings {
					bookingRules {
						maxAdvanceBooking
						minBookingDuration
						maxBookingDuration
						allowWeekendBooking
					}
					businessHours {
						monday { start, end }
						tuesday { start, end }
						wednesday { start, end }
						thursday { start, end }
						friday { start, end }
						saturday { start, end }
						sunday { start, end }
					}
					features {
						allowMemberBooking
						requireApproval
						allowCancellation
					}
				}
				subscription {
					plan
					features
					limits {
						maxMembers
						maxResources
						maxBookingsPerMonth
					}
				}
			}
		}
	`,
	
	// ==================== 统计和报告查询 ====================
	
	GET_BOOKING_STATS: `
		query GetBookingStats($from: DateTime!, $to: DateTime!) {
			bookingStats(from: $from, to: $to) {
				totalBookings
				confirmedBookings
				cancelledBookings
				totalRevenue
				averageBookingDuration
				popularResources {
					resourceId
					resourceName
					bookingCount
				}
				dailyBreakdown {
					date
					bookingCount
					revenue
				}
			}
		}
	`,
	
	GET_MEMBER_STATS: `
		query GetMemberStats {
			memberStats {
				totalMembers
				activeMembers
				newMembersThisMonth
				membersByPlan {
					planName
					count
				}
				topMembers {
					memberId
					memberName
					bookingCount
					totalSpent
				}
			}
		}
	`,
};

export const OPTIX_MUTATIONS = {
	// ==================== 预订管理变更 ====================
	
	CREATE_BOOKING: `
		mutation CreateBooking($input: BookingInput!) {
			createBooking(input: $input) {
				booking {
					id
					start
					end
					status
					member {
						id
						name
						email
					}
					resource {
						id
						name
						type
					}
				}
				errors
				warnings
			}
		}
	`,
	
	UPDATE_BOOKING: `
		mutation UpdateBooking($id: ID!, $input: BookingUpdateInput!) {
			updateBooking(id: $id, input: $input) {
				booking {
					id
					start
					end
					status
					notes
					updatedAt
				}
				errors
				warnings
			}
		}
	`,
	
	CANCEL_BOOKING: `
		mutation CancelBooking($id: ID!, $reason: String) {
			cancelBooking(id: $id, reason: $reason) {
				success
				booking {
					id
					status
					cancelledAt
					cancelReason
				}
				errors
			}
		}
	`,
	
	CONFIRM_BOOKING: `
		mutation ConfirmBooking($id: ID!) {
			confirmBooking(id: $id) {
				success
				booking {
					id
					status
					confirmedAt
				}
				errors
			}
		}
	`,
	
	// ==================== 成员管理变更 ====================
	
	CREATE_MEMBER: `
		mutation CreateMember($input: MemberInput!) {
			createMember(input: $input) {
				member {
					id
					name
					email
					status
					plan {
						id
						name
					}
				}
				errors
			}
		}
	`,
	
	UPDATE_MEMBER: `
		mutation UpdateMember($id: ID!, $input: MemberUpdateInput!) {
			updateMember(id: $id, input: $input) {
				member {
					id
					name
					email
					phone
					status
					updatedAt
				}
				errors
			}
		}
	`,
	
	ASSIGN_PLAN: `
		mutation AssignPlan($memberId: ID!, $planTemplateId: ID!, $startDate: DateTime) {
			assignPlan(memberId: $memberId, planTemplateId: $planTemplateId, startDate: $startDate) {
				success
				plan {
					id
					startDate
					endDate
					template {
						name
						price
					}
				}
				errors
			}
		}
	`,
	
	DEACTIVATE_MEMBER: `
		mutation DeactivateMember($id: ID!, $reason: String) {
			deactivateMember(id: $id, reason: $reason) {
				success
				member {
					id
					status
					deactivatedAt
				}
				errors
			}
		}
	`,
	
	// ==================== 资源管理变更 ====================
	
	CREATE_RESOURCE: `
		mutation CreateResource($input: ResourceInput!) {
			createResource(input: $input) {
				resource {
					id
					name
					type
					capacity
					hourlyRate
				}
				errors
			}
		}
	`,
	
	UPDATE_RESOURCE: `
		mutation UpdateResource($id: ID!, $input: ResourceUpdateInput!) {
			updateResource(id: $id, input: $input) {
				resource {
					id
					name
					description
					capacity
					amenities
					hourlyRate
					updatedAt
				}
				errors
			}
		}
	`,
	
	SET_RESOURCE_AVAILABILITY: `
		mutation SetResourceAvailability($resourceId: ID!, $from: DateTime!, $to: DateTime!, $available: Boolean!, $reason: String) {
			setResourceAvailability(resourceId: $resourceId, from: $from, to: $to, available: $available, reason: $reason) {
				success
				errors
			}
		}
	`,
};

export const OPTIX_SUBSCRIPTIONS = {
	// ==================== 实时订阅 ====================
	
	BOOKING_UPDATES: `
		subscription BookingUpdates($resourceId: ID) {
			bookingUpdates(resourceId: $resourceId) {
				type
				booking {
					id
					start
					end
					status
					member {
						name
					}
					resource {
						id
						name
					}
				}
			}
		}
	`,
	
	MEMBER_ACTIVITY: `
		subscription MemberActivity {
			memberActivity {
				type
				member {
					id
					name
					lastSeenAt
				}
			}
		}
	`,
};