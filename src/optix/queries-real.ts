/**
 * Optix GraphQL Query Templates
 * 
 * 基于真实的 Optix API Schema 更新的查询模板
 * Schema 来源: https://api.optixapp.com/graphql
 */

export const OPTIX_QUERIES = {
	// ==================== 组织和用户信息 ====================
	
	GET_ORGANIZATION_INFO: `
		query GetOrganizationInfo {
			me {
				user {
					user_id
					name
					email
					first_name
					last_name
					status
				}
				member {
					member_id
					status
					is_admin
					primary_location_id
				}
				organization {
					organization_id
					name
					subdomain
					timezone
					currency
					primary_location {
						location_id
						name
						address
						timezone
					}
				}
			}
		}
	`,

	LIST_ACCOUNTS: `
		query ListAccounts(
			$limit: Int = 100
			$page: Int = 1
			$search: String
			$search_by_name: String
			$search_by_email: String
			$type: [String!]
		) {
			accounts(
				limit: $limit
				page: $page
				search: $search
				search_by_name: $search_by_name
				search_by_email: $search_by_email
				type: $type
			) {
				data {
					account_id
					name
					type
					email
					phone
					status
					created_timestamp
					primary_location_id
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	LIST_LOCATIONS: `
		query ListLocations(
			$limit: Int = 100
			$page: Int = 1
			$name: String
			$include_visible: Boolean
			$include_hidden: Boolean
		) {
			locations(
				limit: $limit
				page: $page
				name: $name
				include_visible: $include_visible
				include_hidden: $include_hidden
			) {
				data {
					location_id
					name
					address
					phone
					timezone
					currency
					status
					is_primary
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	LIST_RESOURCES: `
		query ListResources(
			$limit: Int = 100
			$page: Int = 1
			$location_id: [ID!]
			$name: String
			$is_bookable: Boolean
			$resource_type_id: [ID!]
		) {
			resources(
				limit: $limit
				page: $page
				location_id: $location_id
				name: $name
				is_bookable: $is_bookable
				resource_type_id: $resource_type_id
			) {
				data {
					resource_id
					name
					title
					description
					capacity
					is_bookable
					is_assignable
					resource_type {
						resource_type_id
						name
						booking_experience
					}
					location {
						location_id
						name
					}
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	LIST_PLAN_TEMPLATES: `
		query ListPlanTemplates(
			$limit: Int = 100
			$page: Int = 1
			$name: String
			$location_id: [ID!]
		) {
			planTemplates(
				limit: $limit
				page: $page
				name: $name
				location_id: $location_id
			) {
				data {
					plan_template_id
					name
					description
					frequency
					billing_start
					price {
						amount
						currency
					}
					location_visibility {
						location_id
						name
					}
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	// ==================== 预订相关查询 ====================
	
	LIST_BOOKINGS: `
		query ListBookings(
			$limit: Int = 100
			$page: Int = 1
			$order: BookingOrder
			$include_new: Boolean
			$include_approved: Boolean
			$include_completed: Boolean
			$start_timestamp_from: Int
			$start_timestamp_to: Int
			$location_id: [ID]
			$resource_id: [ID]
		) {
			bookings(
				limit: $limit
				page: $page
				order: $order
				include_new: $include_new
				include_approved: $include_approved
				include_completed: $include_completed
				start_timestamp_from: $start_timestamp_from
				start_timestamp_to: $start_timestamp_to
				location_id: $location_id
				resource_id: $resource_id
			) {
				data {
					booking_id
					start_timestamp
					end_timestamp
					status
					notes
					created_timestamp
					owner_account {
						account_id
						name
						type
						email
					}
					payer_account {
						account_id
						name
						email
					}
					resource {
						resource_id
						name
						title
						resource_type {
							name
						}
						location {
							location_id
							name
						}
					}
					booking_cost {
						total_cost
						currency
					}
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,
	
	GET_BOOKING: `
		query GetBooking($booking_id: ID!) {
			booking(booking_id: $booking_id) {
				booking_id
				start_timestamp
				end_timestamp
				status
				notes
				created_timestamp
				owner_account {
					account_id
					name
					type
					email
					phone
				}
				payer_account {
					account_id
					name
					email
				}
				resource {
					resource_id
					name
					title
					description
					capacity
					resource_type {
						resource_type_id
						name
						booking_experience
					}
					location {
						location_id
						name
						address
					}
				}
				booking_cost {
					total_cost
					currency
					breakdown {
						description
						amount
					}
				}
				invitees {
					status
					email
					name
				}
			}
		}
	`,

	// ==================== 搜索和过滤查询 ====================
	
	SEARCH_ACCOUNTS: `
		query SearchAccounts(
			$search: String!
			$limit: Int = 20
			$type: [String!]
		) {
			accounts(
				search: $search
				limit: $limit
				type: $type
			) {
				data {
					account_id
					name
					type
					email
					status
					primary_location_id
				}
				pagination {
					total
				}
			}
		}
	`,

	SEARCH_RESOURCES: `
		query SearchResources(
			$name: String!
			$limit: Int = 20
			$location_id: [ID!]
			$is_bookable: Boolean = true
		) {
			resources(
				name: $name
				limit: $limit
				location_id: $location_id
				is_bookable: $is_bookable
			) {
				data {
					resource_id
					name
					title
					capacity
					is_bookable
					resource_type {
						name
					}
					location {
						location_id
						name
					}
				}
				pagination {
					total
				}
			}
		}
	`,

	SEARCH_BOOKINGS: `
		query SearchBookings(
			$limit: Int = 20
			$page: Int = 1
			$start_timestamp_from: Int
			$start_timestamp_to: Int
			$resource_id: [ID]
			$location_id: [ID]
			$include_new: Boolean = true
			$include_approved: Boolean = true
		) {
			bookings(
				limit: $limit
				page: $page
				start_timestamp_from: $start_timestamp_from
				start_timestamp_to: $start_timestamp_to
				resource_id: $resource_id
				location_id: $location_id
				include_new: $include_new
				include_approved: $include_approved
			) {
				data {
					booking_id
					start_timestamp
					end_timestamp
					status
					owner_account {
						name
						email
					}
					resource {
						resource_id
						name
						location {
							name
						}
					}
				}
				pagination {
					total
					has_next_page
				}
			}
		}
	`,

	// ==================== 详细信息查询 ====================
	
	GET_ACCOUNT_DETAILS: `
		query GetAccountDetails($account: AccountInput!) {
			account(account: $account) {
				account_id
				name
				type
				email
				phone
				status
				created_timestamp
				primary_location_id
				properties {
					property_id
					value
				}
				plans {
					account_plan_id
					plan_template {
						name
						description
					}
					status
					start_timestamp
					end_timestamp
				}
			}
		}
	`,

	GET_RESOURCE_DETAILS: `
		query GetResourceDetails($resource_id: ID!) {
			resource(resource_id: $resource_id) {
				resource_id
				name
				title
				description
				capacity
				is_bookable
				is_assignable
				resource_type {
					resource_type_id
					name
					booking_experience
				}
				location {
					location_id
					name
					address
					timezone
				}
				properties {
					property_id
					value
				}
				amenities {
					amenity_id
					name
					type
				}
			}
		}
	`,

	// ==================== 分析和统计查询 ====================
	
	GET_ANALYTICS_SUMMARY: `
		query GetAnalyticsSummary($query: AnalyticsQueryInput!) {
			analyticsQuery(query: $query) {
				columns {
					name
					type
				}
				rows
				metadata {
					total_rows
					execution_time
				}
			}
		}
	`,

	// ==================== 团队和权限查询 ====================
	
	LIST_TEAMS: `
		query ListTeams(
			$limit: Int = 100
			$page: Int = 1
		) {
			teams(
				limit: $limit
				page: $page
			) {
				data {
					team_id
					name
					description
					created_timestamp
					member_count
					primary_location_id
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	GET_TEAM_DETAILS: `
		query GetTeamDetails($team_id: ID!) {
			teamProfile(team_id: $team_id) {
				team_id
				name
				description
				created_timestamp
				primary_location_id
				members {
					account_id
					name
					email
					role
				}
				properties {
					property_id
					value
				}
			}
		}
	`,

	GET_USER_PERMISSIONS: `
		query GetUserPermissions {
			me {
				user {
					user_id
					name
					email
				}
				member {
					member_id
					is_admin
					status
					permissions {
						resource
						actions
					}
				}
				organization {
					organization_id
					name
					features {
						name
						enabled
					}
				}
			}
		}
	`,

	// ==================== 活动和事件查询 ====================
	
	LIST_EVENTS: `
		query ListEvents(
			$limit: Int = 100
			$page: Int = 1
			$start_timestamp_from: Int
			$start_timestamp_to: Int
			$type: [ScheduleEventType!]
			$location_id: [ID!]
		) {
			schedule(
				limit: $limit
				page: $page
				start_timestamp_from: $start_timestamp_from
				start_timestamp_to: $start_timestamp_to
				type: $type
				location_id: $location_id
			) {
				data {
					event_id
					type
					start_timestamp
					end_timestamp
					status
					title
					description
					location {
						location_id
						name
					}
					resource {
						resource_id
						name
					}
					owner_account {
						account_id
						name
					}
				}
				pagination {
					total
					page
					limit
					has_next_page
				}
			}
		}
	`,

	GET_EVENT_DETAILS: `
		query GetEventDetails($event_id: ID!) {
			scheduleEvent(event_id: $event_id) {
				event_id
				type
				start_timestamp
				end_timestamp
				status
				title
				description
				notes
				created_timestamp
				location {
					location_id
					name
					address
				}
				resource {
					resource_id
					name
					title
					capacity
				}
				owner_account {
					account_id
					name
					email
				}
				attendees {
					account_id
					name
					email
					status
				}
			}
		}
	`
};