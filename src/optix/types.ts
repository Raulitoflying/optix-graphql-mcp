/**
 * Optix Business Types
 * 
 * TypeScript type definitions for Optix business entities.
 * These types help ensure type safety when working with Optix data.
 */

// ==================== 基础类型 ====================

export interface OptixEntity {
	id: string;
	createdAt: string;
	updatedAt?: string;
}

// ==================== 预订相关类型 ====================

export interface Booking extends OptixEntity {
	start: string;
	end: string;
	status: BookingStatus;
	member: Member;
	resource: Resource;
	notes?: string;
	cancelledAt?: string;
	cancelReason?: string;
	confirmedAt?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface BookingInput {
	memberId: string;
	resourceId: string;
	start: string;
	end: string;
	notes?: string;
	requireApproval?: boolean;
}

export interface BookingUpdateInput {
	start?: string;
	end?: string;
	notes?: string;
	status?: BookingStatus;
}

export interface AvailabilityCheck {
	available: boolean;
	conflicts: BookingConflict[];
}

export interface BookingConflict {
	id: string;
	start: string;
	end: string;
	member: {
		name: string;
	};
}

// ==================== 成员相关类型 ====================

export interface Member extends OptixEntity {
	name: string;
	email: string;
	phone?: string;
	status: MemberStatus;
	plan?: MembershipPlan;
	organization?: Organization;
	lastSeenAt?: string;
	recentBookings?: Booking[];
}

export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface MemberInput {
	name: string;
	email: string;
	phone?: string;
	organizationId?: string;
	planTemplateId?: string;
	startDate?: string;
}

export interface MemberUpdateInput {
	name?: string;
	email?: string;
	phone?: string;
	status?: MemberStatus;
}

// ==================== 计划相关类型 ====================

export interface MembershipPlan extends OptixEntity {
	template: PlanTemplate;
	member: Member;
	startDate: string;
	endDate?: string;
	price: number;
	currency: string;
	status: PlanStatus;
}

export type PlanStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface PlanTemplate extends OptixEntity {
	name: string;
	description?: string;
	price: number;
	currency: string;
	billingPeriod: BillingPeriod;
	category?: string;
	features: string[];
	bookingCredits?: number;
	accessHours?: AccessHours;
	amenities?: string[];
	restrictions?: PlanRestrictions;
	active: boolean;
	sortOrder?: number;
}

export type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one_time';

export interface AccessHours {
	monday?: TimeSlot;
	tuesday?: TimeSlot;
	wednesday?: TimeSlot;
	thursday?: TimeSlot;
	friday?: TimeSlot;
	saturday?: TimeSlot;
	sunday?: TimeSlot;
}

export interface TimeSlot {
	start: string; // HH:MM format
	end: string;   // HH:MM format
}

export interface PlanRestrictions {
	maxBookingsPerDay?: number;
	maxBookingsPerWeek?: number;
	maxBookingsPerMonth?: number;
	maxBookingDuration?: number; // in minutes
	advanceBookingDays?: number;
	allowedResourceTypes?: string[];
	blackoutDates?: string[];
}

// ==================== 资源相关类型 ====================

export interface Resource extends OptixEntity {
	name: string;
	description?: string;
	type: ResourceType;
	capacity: number;
	amenities: string[];
	hourlyRate?: number;
	currency?: string;
	bookingRules: BookingRules;
	images?: ResourceImage[];
	location?: ResourceLocation;
	upcomingBookings?: Booking[];
	schedule?: ResourceSchedule[];
}

export type ResourceType = 'meeting_room' | 'desk' | 'office' | 'phone_booth' | 'event_space' | 'locker' | 'parking' | 'other';

export interface ResourceInput {
	name: string;
	description?: string;
	type: ResourceType;
	capacity: number;
	amenities?: string[];
	hourlyRate?: number;
	currency?: string;
	bookingRules?: Partial<BookingRules>;
	locationId?: string;
}

export interface ResourceUpdateInput {
	name?: string;
	description?: string;
	capacity?: number;
	amenities?: string[];
	hourlyRate?: number;
	bookingRules?: Partial<BookingRules>;
}

export interface BookingRules {
	minDuration: number;        // in minutes
	maxDuration: number;        // in minutes
	advanceBooking: number;     // max days in advance
	allowCancellation: boolean;
	cancellationDeadline?: number; // hours before start
	requireApproval: boolean;
	allowRecurring: boolean;
}

export interface ResourceImage {
	url: string;
	alt?: string;
	isPrimary?: boolean;
}

export interface ResourceLocation {
	floor?: string;
	room?: string;
	building?: string;
	address?: string;
}

export interface ResourceSchedule {
	date: string;
	slots: TimeSlotAvailability[];
}

export interface TimeSlotAvailability {
	start: string;
	end: string;
	available: boolean;
	booking?: {
		id: string;
		member: {
			name: string;
		};
	};
}

// ==================== 组织相关类型 ====================

export interface Organization extends OptixEntity {
	name: string;
	timezone: string;
	currency: string;
	settings: OrganizationSettings;
	subscription?: OrganizationSubscription;
}

export interface OrganizationSettings {
	bookingRules: GlobalBookingRules;
	businessHours: AccessHours;
	features: OrganizationFeatures;
	branding?: OrganizationBranding;
}

export interface GlobalBookingRules {
	maxAdvanceBooking: number;    // days
	minBookingDuration: number;   // minutes
	maxBookingDuration: number;   // minutes
	allowWeekendBooking: boolean;
	defaultCancellationDeadline: number; // hours
}

export interface OrganizationFeatures {
	allowMemberBooking: boolean;
	requireApproval: boolean;
	allowCancellation: boolean;
	enableWaitlist: boolean;
	enableRecurringBookings: boolean;
	enableMobileApp: boolean;
}

export interface OrganizationBranding {
	logoUrl?: string;
	primaryColor?: string;
	secondaryColor?: string;
	customDomain?: string;
}

export interface OrganizationSubscription {
	plan: string;
	features: string[];
	limits: SubscriptionLimits;
	expiresAt?: string;
}

export interface SubscriptionLimits {
	maxMembers: number;
	maxResources: number;
	maxBookingsPerMonth: number;
	maxAdmins: number;
	storageGB: number;
}

// ==================== 统计和报告类型 ====================

export interface BookingStats {
	totalBookings: number;
	confirmedBookings: number;
	cancelledBookings: number;
	totalRevenue: number;
	averageBookingDuration: number;
	popularResources: PopularResource[];
	dailyBreakdown: DailyStats[];
}

export interface PopularResource {
	resourceId: string;
	resourceName: string;
	bookingCount: number;
	revenue?: number;
}

export interface DailyStats {
	date: string;
	bookingCount: number;
	revenue: number;
	newMembers?: number;
}

export interface MemberStats {
	totalMembers: number;
	activeMembers: number;
	newMembersThisMonth: number;
	membersByPlan: PlanMemberCount[];
	topMembers: TopMember[];
}

export interface PlanMemberCount {
	planName: string;
	count: number;
}

export interface TopMember {
	memberId: string;
	memberName: string;
	bookingCount: number;
	totalSpent: number;
}

// ==================== API 响应类型 ====================

export interface OptixResponse<T> {
	data?: T;
	errors?: OptixError[];
	warnings?: string[];
}

export interface OptixError {
	message: string;
	code?: string;
	field?: string;
}

export interface CreateBookingResponse {
	booking?: Booking;
	errors?: string[];
	warnings?: string[];
}

export interface UpdateBookingResponse {
	booking?: Booking;
	errors?: string[];
	warnings?: string[];
}

export interface CancelBookingResponse {
	success: boolean;
	booking?: Booking;
	errors?: string[];
}

export interface CreateMemberResponse {
	member?: Member;
	errors?: string[];
}

export interface AssignPlanResponse {
	success: boolean;
	plan?: MembershipPlan;
	errors?: string[];
}

// ==================== 工具参数类型 ====================

export interface ListBookingsArgs {
	from?: string;
	to?: string;
	status?: BookingStatus;
	limit?: number;
	memberId?: string;
	resourceId?: string;
}

export interface ListMembersArgs {
	search?: string;
	status?: MemberStatus;
	limit?: number;
	offset?: number;
	organizationId?: string;
}

export interface ListResourcesArgs {
	type?: ResourceType;
	available?: boolean;
	capacity?: number;
	amenities?: string[];
}

export interface CheckAvailabilityArgs {
	resourceId: string;
	start: string;
	end: string;
}

export interface GetBookingStatsArgs {
	from: string;
	to: string;
	resourceIds?: string[];
	memberIds?: string[];
}

// ==================== 实时更新类型 ====================

export interface BookingUpdate {
	type: 'created' | 'updated' | 'cancelled' | 'confirmed';
	booking: Booking;
	timestamp: string;
}

export interface MemberActivity {
	type: 'login' | 'logout' | 'booking_created' | 'booking_cancelled';
	member: Member;
	timestamp: string;
	metadata?: Record<string, any>;
}