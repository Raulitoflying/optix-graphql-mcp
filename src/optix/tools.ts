/**
 * Optix Business Tools
 * 
 * This module creates MCP tools specifically designed for Optix business operations.
 * These tools provide high-level business functionality that goes beyond basic GraphQL queries,
 * offering Claude intelligent ways to interact with Optix data.
 */

import { z } from "zod";
import { OPTIX_QUERIES, OPTIX_MUTATIONS } from "./queries.js";
import type {
	Booking,
	Member,
	Resource,
	PlanTemplate,
	Organization,
	BookingStats,
	MemberStats,
	ListBookingsArgs,
	ListMembersArgs,
	CheckAvailabilityArgs,
	BookingInput,
	CreateMemberResponse,
} from "./types.js";

/**
 * Tool definition interface
 */
interface OptixTool {
	name: string;
	description: string;
	inputSchema: z.ZodObject<any>; // Keep it as ZodObject and extract shape later
	execute: (args: any, endpoint: string, headers: Record<string, string>) => Promise<any>;
}

/**
 * Create a GraphQL request helper
 */
async function executeGraphQL(
	query: string,
	variables: any,
	endpoint: string,
	headers: Record<string, string>
): Promise<any> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	if (!response.ok) {
		throw new Error(`GraphQL request failed: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors && result.errors.length > 0) {
		throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
	}

	return result.data;
}

/**
 * Create all Optix business tools
 */
export function createOptixTools(): Map<string, OptixTool> {
	const tools = new Map<string, OptixTool>();

	// ==================== 预订管理工具 ====================

	tools.set("optix_list_bookings", {
		name: "optix_list_bookings",
		description: "List bookings in your Optix workspace. Perfect for checking daily schedules, finding specific bookings, or getting an overview of space usage. You can filter by date range, status, member, or resource.",
		inputSchema: z.object({
			from: z.string().optional().describe("Start date/time in ISO 8601 format (e.g., '2025-09-29T00:00:00Z'). If not provided, shows bookings from today."),
			to: z.string().optional().describe("End date/time in ISO 8601 format. If not provided, shows bookings for the next 7 days."),
			status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]).optional().describe("Filter by booking status"),
			limit: z.number().min(1).max(100).default(50).describe("Maximum number of results to return"),
			memberId: z.string().optional().describe("Filter bookings for a specific member"),
			resourceId: z.string().optional().describe("Filter bookings for a specific resource/space"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.LIST_BOOKINGS, args, endpoint, headers);
			return {
				bookings: data.bookings,
				summary: {
					total: data.bookings.length,
					byStatus: data.bookings.reduce((acc: any, booking: Booking) => {
						acc[booking.status] = (acc[booking.status] || 0) + 1;
						return acc;
					}, {}),
				},
			};
		},
	});

	tools.set("optix_get_booking_details", {
		name: "optix_get_booking_details",
		description: "Get comprehensive details about a specific booking, including member information, resource details, and booking history.",
		inputSchema: z.object({
			id: z.string().describe("The booking ID"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_BOOKING, args, endpoint, headers);
			return data.booking;
		},
	});

	tools.set("optix_check_availability", {
		name: "optix_check_availability",
		description: "Check if a resource (meeting room, desk, etc.) is available for a specific time period. Shows any conflicting bookings and suggests alternative times if needed.",
		inputSchema: z.object({
			resourceId: z.string().describe("The resource/space ID to check"),
			start: z.string().describe("Start time in ISO 8601 format (e.g., '2025-09-29T14:00:00Z')"),
			end: z.string().describe("End time in ISO 8601 format (e.g., '2025-09-29T16:00:00Z')"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.CHECK_AVAILABILITY, args, endpoint, headers);
			const resource = data.resource;
			const availability = resource.availability;

			return {
				resource: {
					id: resource.id,
					name: resource.name,
					type: resource.type,
				},
				timeSlot: {
					start: args.start,
					end: args.end,
				},
				available: availability.available,
				conflicts: availability.conflicts,
				recommendation: availability.available 
					? "✅ Resource is available for the requested time"
					: `❌ Resource is not available. ${availability.conflicts.length} conflicting booking(s) found.`,
			};
		},
	});

	tools.set("optix_create_booking", {
		name: "optix_create_booking",
		description: "Create a new booking for a member. This will reserve a resource for the specified time period.",
		inputSchema: z.object({
			memberId: z.string().describe("The member ID making the booking"),
			resourceId: z.string().describe("The resource/space ID to book"),
			start: z.string().describe("Booking start time in ISO 8601 format"),
			end: z.string().describe("Booking end time in ISO 8601 format"),
			notes: z.string().optional().describe("Optional notes for the booking"),
			requireApproval: z.boolean().default(false).describe("Whether this booking requires admin approval"),
		}),
		execute: async (args, endpoint, headers) => {
			const input: BookingInput = {
				memberId: args.memberId,
				resourceId: args.resourceId,
				start: args.start,
				end: args.end,
				notes: args.notes,
				requireApproval: args.requireApproval,
			};

			const data = await executeGraphQL(OPTIX_MUTATIONS.CREATE_BOOKING, { input }, endpoint, headers);
			const response = data.createBooking;

			if (response.errors && response.errors.length > 0) {
				throw new Error(`Booking creation failed: ${response.errors.join(", ")}`);
			}

			return {
				booking: response.booking,
				warnings: response.warnings || [],
				status: response.booking.status === "confirmed" ? "✅ Booking confirmed!" : "⏳ Booking created and pending approval",
			};
		},
	});

	tools.set("optix_cancel_booking", {
		name: "optix_cancel_booking",
		description: "Cancel an existing booking. This will free up the resource for other members to book.",
		inputSchema: z.object({
			id: z.string().describe("The booking ID to cancel"),
			reason: z.string().optional().describe("Optional reason for cancellation"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_MUTATIONS.CANCEL_BOOKING, args, endpoint, headers);
			const response = data.cancelBooking;

			if (!response.success) {
				throw new Error(`Cancellation failed: ${response.errors?.join(", ") || "Unknown error"}`);
			}

			return {
				success: true,
				booking: response.booking,
				message: "✅ Booking cancelled successfully",
			};
		},
	});

	tools.set("optix_get_upcoming_bookings", {
		name: "optix_get_upcoming_bookings",
		description: "Get upcoming bookings for a specific member or resource. Great for daily schedules and planning.",
		inputSchema: z.object({
			memberId: z.string().optional().describe("Get upcoming bookings for this member"),
			resourceId: z.string().optional().describe("Get upcoming bookings for this resource"),
			days: z.number().min(1).max(30).default(7).describe("Number of days to look ahead"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_UPCOMING_BOOKINGS, args, endpoint, headers);
			const bookings = data.upcomingBookings;

			return {
				bookings,
				summary: {
					total: bookings.length,
					next24Hours: bookings.filter((b: Booking) => {
						const start = new Date(b.start);
						const now = new Date();
						const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
						return start >= now && start <= tomorrow;
					}).length,
				},
			};
		},
	});

	// ==================== 成员管理工具 ====================

	tools.set("optix_list_members", {
		name: "optix_list_members",
		description: "List members in your Optix workspace. You can search by name/email, filter by status, or browse all members with pagination.",
		inputSchema: z.object({
			search: z.string().optional().describe("Search by member name or email address"),
			status: z.enum(["active", "inactive", "pending", "suspended"]).optional().describe("Filter by member status"),
			limit: z.number().min(1).max(100).default(50).describe("Maximum number of results"),
			offset: z.number().min(0).default(0).describe("Number of results to skip (for pagination)"),
			organizationId: z.string().optional().describe("Filter by organization/company"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.LIST_MEMBERS, args, endpoint, headers);
			const members = data.members;

			return {
				members,
				pagination: {
					returned: members.length,
					offset: args.offset || 0,
					hasMore: members.length === (args.limit || 50),
				},
				summary: {
					byStatus: members.reduce((acc: any, member: Member) => {
						acc[member.status] = (acc[member.status] || 0) + 1;
						return acc;
					}, {}),
				},
			};
		},
	});

	tools.set("optix_get_member_profile", {
		name: "optix_get_member_profile",
		description: "Get detailed information about a specific member, including their membership plan, recent booking history, and contact details.",
		inputSchema: z.object({
			id: z.string().describe("The member ID"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_MEMBER, args, endpoint, headers);
			const member = data.member;

			return {
				...member,
				insights: {
					totalRecentBookings: member.recentBookings?.length || 0,
					memberSince: member.createdAt,
					planStatus: member.plan?.endDate 
						? new Date(member.plan.endDate) > new Date() ? "Active" : "Expired"
						: "No Plan",
				},
			};
		},
	});

	tools.set("optix_search_members", {
		name: "optix_search_members",
		description: "Smart search for members by name, email, or partial matches. Perfect for quickly finding a specific member when you don't have their exact ID.",
		inputSchema: z.object({
			query: z.string().describe("Search term - can be partial name, email, or phone number"),
			limit: z.number().min(1).max(50).default(20).describe("Maximum number of results"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.SEARCH_MEMBERS, args, endpoint, headers);
			return {
				members: data.searchMembers,
				searchTerm: args.query,
				resultCount: data.searchMembers.length,
			};
		},
	});

	tools.set("optix_create_member", {
		name: "optix_create_member",
		description: "Create a new member in your Optix workspace. You can optionally assign them to a membership plan immediately.",
		inputSchema: z.object({
			name: z.string().describe("Full name of the new member"),
			email: z.string().email().describe("Email address (must be unique)"),
			phone: z.string().optional().describe("Phone number"),
			organizationId: z.string().optional().describe("Organization/company ID to assign the member to"),
			planTemplateId: z.string().optional().describe("Membership plan template ID to assign"),
			startDate: z.string().optional().describe("Plan start date in ISO 8601 format (defaults to today)"),
		}),
		execute: async (args, endpoint, headers) => {
			const input = {
				name: args.name,
				email: args.email,
				phone: args.phone,
				organizationId: args.organizationId,
				planTemplateId: args.planTemplateId,
				startDate: args.startDate,
			};

			const data = await executeGraphQL(OPTIX_MUTATIONS.CREATE_MEMBER, { input }, endpoint, headers);
			const response: CreateMemberResponse = data.createMember;

			if (response.errors && response.errors.length > 0) {
				throw new Error(`Member creation failed: ${response.errors.join(", ")}`);
			}

			return {
				member: response.member,
				message: "✅ Member created successfully!",
				nextSteps: args.planTemplateId 
					? "Member has been assigned a plan and can start booking immediately."
					: "Consider assigning a membership plan to enable booking access.",
			};
		},
	});

	// ==================== 资源管理工具 ====================

	tools.set("optix_list_resources", {
		name: "optix_list_resources",
		description: "List all available resources (meeting rooms, desks, offices) in your workspace. Filter by type, capacity, or availability.",
		inputSchema: z.object({
			type: z.enum(["meeting_room", "desk", "office", "phone_booth", "event_space", "locker", "parking", "other"]).optional().describe("Filter by resource type"),
			available: z.boolean().optional().describe("Only show currently available resources"),
			capacity: z.number().min(1).optional().describe("Minimum capacity required"),
			amenities: z.array(z.string()).optional().describe("Required amenities (e.g., ['projector', 'whiteboard'])"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.LIST_RESOURCES, args, endpoint, headers);
			const resources = data.resources;

			return {
				resources,
				summary: {
					total: resources.length,
					byType: resources.reduce((acc: any, resource: Resource) => {
						acc[resource.type] = (acc[resource.type] || 0) + 1;
						return acc;
					}, {}),
					averageCapacity: Math.round(
						resources.reduce((sum: number, r: Resource) => sum + r.capacity, 0) / resources.length
					),
				},
			};
		},
	});

	tools.set("optix_get_resource_details", {
		name: "optix_get_resource_details",
		description: "Get comprehensive details about a specific resource, including booking rules, amenities, upcoming bookings, and availability patterns.",
		inputSchema: z.object({
			id: z.string().describe("The resource ID"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_RESOURCE, args, endpoint, headers);
			const resource = data.resource;

			return {
				...resource,
				utilizationInsights: {
					upcomingBookingsCount: resource.upcomingBookings?.length || 0,
					hasBookingsToday: resource.upcomingBookings?.some((b: Booking) => {
						const bookingDate = new Date(b.start).toDateString();
						const today = new Date().toDateString();
						return bookingDate === today;
					}) || false,
				},
			};
		},
	});

	tools.set("optix_get_resource_schedule", {
		name: "optix_get_resource_schedule",
		description: "Get a detailed schedule for a resource showing all time slots and their availability over a date range. Perfect for visualizing usage patterns.",
		inputSchema: z.object({
			resourceId: z.string().describe("The resource ID"),
			from: z.string().describe("Start date in ISO 8601 format"),
			to: z.string().describe("End date in ISO 8601 format"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_RESOURCE_SCHEDULE, args, endpoint, headers);
			const resource = data.resource;

			return {
				resource: {
					id: resource.id,
					name: resource.name,
				},
				dateRange: {
					from: args.from,
					to: args.to,
				},
				schedule: resource.schedule,
				utilizationStats: resource.schedule.map((day: any) => ({
					date: day.date,
					totalSlots: day.slots.length,
					bookedSlots: day.slots.filter((slot: any) => !slot.available).length,
					utilizationRate: Math.round(
						(day.slots.filter((slot: any) => !slot.available).length / day.slots.length) * 100
					),
				})),
			};
		},
	});

	// ==================== 计划模板管理工具 ====================

	tools.set("optix_list_plan_templates", {
		name: "optix_list_plan_templates",
		description: "List all membership plan templates (pricing plans) available in your workspace. These define the different membership tiers and their features.",
		inputSchema: z.object({
			active: z.boolean().default(true).describe("Filter by active status"),
			category: z.string().optional().describe("Filter by plan category (e.g., 'premium', 'basic', 'corporate')"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.LIST_PLAN_TEMPLATES, args, endpoint, headers);
			const plans = data.planTemplates;

			return {
				planTemplates: plans,
				summary: {
					total: plans.length,
					priceRange: {
						min: Math.min(...plans.map((p: PlanTemplate) => p.price)),
						max: Math.max(...plans.map((p: PlanTemplate) => p.price)),
						currency: plans[0]?.currency || "USD",
					},
					byBillingPeriod: plans.reduce((acc: any, plan: PlanTemplate) => {
						acc[plan.billingPeriod] = (acc[plan.billingPeriod] || 0) + 1;
						return acc;
					}, {}),
				},
			};
		},
	});

	tools.set("optix_get_plan_template", {
		name: "optix_get_plan_template",
		description: "Get detailed information about a specific membership plan template, including features, pricing, and restrictions.",
		inputSchema: z.object({
			id: z.string().describe("The plan template ID"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_PLAN_TEMPLATE, args, endpoint, headers);
			return data.planTemplate;
		},
	});

	// ==================== 组织和设置工具 ====================

	tools.set("optix_get_organization_info", {
		name: "optix_get_organization_info",
		description: "Get comprehensive information about your Optix organization, including settings, business hours, booking rules, and subscription details.",
		inputSchema: z.object({}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_ORGANIZATION_INFO, {}, endpoint, headers);
			const org = data.organization;

			return {
				...org,
				currentTime: new Date().toLocaleString("en-US", { timeZone: org.timezone }),
				subscriptionStatus: org.subscription?.expiresAt 
					? new Date(org.subscription.expiresAt) > new Date() ? "Active" : "Expired"
					: "Unknown",
			};
		},
	});

	// ==================== 统计和报告工具 ====================

	tools.set("optix_get_booking_stats", {
		name: "optix_get_booking_stats",
		description: "Get comprehensive booking statistics and analytics for a date range. Perfect for understanding space utilization and revenue patterns.",
		inputSchema: z.object({
			from: z.string().describe("Start date in ISO 8601 format"),
			to: z.string().describe("End date in ISO 8601 format"),
			resourceIds: z.array(z.string()).optional().describe("Filter stats for specific resources"),
			memberIds: z.array(z.string()).optional().describe("Filter stats for specific members"),
		}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_BOOKING_STATS, args, endpoint, headers);
			const stats: BookingStats = data.bookingStats;

			return {
				...stats,
				insights: {
					cancellationRate: Math.round((stats.cancelledBookings / stats.totalBookings) * 100),
					averageRevenuePerBooking: Math.round(stats.totalRevenue / stats.confirmedBookings * 100) / 100,
					topPerformingResource: stats.popularResources[0]?.resourceName || "None",
					peakUsageDay: stats.dailyBreakdown.reduce((peak, day) => 
						day.bookingCount > peak.bookingCount ? day : peak
					),
				},
			};
		},
	});

	tools.set("optix_get_member_stats", {
		name: "optix_get_member_stats",
		description: "Get member statistics and insights including growth metrics, plan distribution, and top users by activity.",
		inputSchema: z.object({}),
		execute: async (args, endpoint, headers) => {
			const data = await executeGraphQL(OPTIX_QUERIES.GET_MEMBER_STATS, {}, endpoint, headers);
			const stats: MemberStats = data.memberStats;

			return {
				...stats,
				insights: {
					activePercentage: Math.round((stats.activeMembers / stats.totalMembers) * 100),
					growthRate: `${stats.newMembersThisMonth} new members this month`,
					mostPopularPlan: stats.membersByPlan.reduce((max, plan) => 
						plan.count > max.count ? plan : max
					)?.planName || "None",
				},
			};
		},
	});

	return tools;
}