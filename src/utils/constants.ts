export enum ROLE {
    SUPER_ADMIN = 'super admin',
    BRAND_ADMIN = 'brand admin',
    GYM_ADMIN = 'gym admin',
    PT_ADMIN = 'pt admin'
}

export enum ROLE_NAMES {
    SUPER_ADMIN = 'Super Admin',
    BRAND_ADMIN = 'Brand Admin',
    GYM_ADMIN = 'Gym Admin',
    PT_ADMIN = 'PT Admin'
}

export enum ROLE_KEYS {
    SUPER_ADMIN = 'SUPER_ADMIN',
    BRAND_ADMIN = 'BRAND_ADMIN',
    GYM_ADMIN = 'GYM_ADMIN',
    PT_ADMIN = 'PT_ADMIN'
}

export enum GENDERS {
    ANY = '',
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    RATHER_NOT_SAY = 'RATHER_NOT_SAY',
}

export const GENDER_NAMES = {
    ANY: 'Any',
    MALE: 'Male',
    FEMALE: 'Female',
    RATHER_NOT_SAY: 'Rather not say',
};

export const PAYMENT_METHOD = {
    CASH: 'Cash',
    ONLINE_TRANSFER: 'Online transfer',
    CARD_OVER_COUNTER: 'Card over counter',
}

export const PAYMENT_OPTION = {
    FULL_PAYMENT: 'FULL_PAYMENT',
    CUSTOM_AMOUNT: 'CUSTOM_AMOUNT'
}

export enum REFUND_TYPE {
    NO_REFUND = 'NO_REFUND',
    FULL_REFUND = 'FULL_REFUND',
    CUSTOM = 'CUSTOM',
}

export const REFUND_TYPE_NAMES: Record<REFUND_TYPE, string> = {
    [REFUND_TYPE.NO_REFUND]: 'No Refund',
    [REFUND_TYPE.FULL_REFUND]: 'Full Refund',
    [REFUND_TYPE.CUSTOM]: 'Custom',
};

export enum ERROR_CODES {
    NOT_ALLOWED = 'NOT_ALLOWED',
    UNAUTHENTICATED = 'UNAUTHENTICATED',
}

export enum CHAMPION_TYPE {
    DOMESTIC = 'DOMESTIC',
    CUSTOM = 'CUSTOM',
}

export enum PAYMENT_TYPE {
    SINGLE = 'SINGLE',
    RECURRING = 'RECURRING',
}

export enum LEAD_SOURCE {
    FACEBOOK = 'Facebook',
    INSTAGRAM = 'Instagram',
    YOUTUBE = 'Youtube',
    LINKEDIN = 'LinkedIn',
    EXTERIOR_SIGNAGE = 'Exterior signage',
    GOOGLE_ADS = 'Google Ads',
    WEBSITE = 'Website',
    EMAIL = 'Email marketing',
    REFERRAL = 'Referral',
    CORPORATE = 'Corporate',
    OUTREACH = 'Outreach',
    WHATS_APP = 'WhatsApp',
    SMS = 'SMS',
    TV = 'TV'
}

export enum LEAD_STATUS {
    HOT = 'HOT',
    COLD = 'COLD',
    // TRIAL = 'TRIAL',
    // FREE_TRIAL_EXPIRED = 'Free trial expired',
}

export enum LEAD_TYPE {
    MARKETING = 'Marketing',
    SELF_GENERATED = 'Self Generated',
    WALK_IN = 'Walk in',
    TELEPHONE_INQUIRY = 'Telephone inquiry',
}

export enum GLOBAL_STATUSES {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum DISCOUNT_STATUSES {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED',
}

export enum CLASS_TYPE {
    ONLINE = 'Online',
    ONSITE = 'On Site',
}

export enum DISCOUNT_ON {
    GYM_CLASS = 'Classes',
    MEMBERSHIP = 'Memberships',
    PRIVATE_COACH = 'Private Coach',
}

export enum PT_SESSION_ATTEND_STATUS {
    BOOKED = 'BOOKED',
    ATTENDED = 'ATTENDED',
    MISSED = 'MISSED',
}

export enum GYM_CLASS_STATUS {
    ACTIVE = 'ACTIVE',
    DONE = 'DONE'
}

export enum ORDER_TYPE {
    GYM_CLASS = 'GYM_CLASS',
    MEMBERSHIP = 'MEMBERSHIP',
    PRIVATE_COACH = 'PRIVATE_COACH'
}

export enum SUB_ORDER_TYPE {
    GYM_CLASS = 'GYM_CLASS',
    MEMBERSHIP = 'MEMBERSHIP',
    MEMBERSHIP_RENEW = 'MEMBERSHIP_RENEW',
    PRIVATE_COACH = 'PRIVATE_COACH'
}

export const ORDER_TYPE_NAME: Record<ORDER_TYPE, string> = {
    [ORDER_TYPE.GYM_CLASS]: 'Class',
    [ORDER_TYPE.MEMBERSHIP]: 'Membership',
    [ORDER_TYPE.PRIVATE_COACH]: 'Private Coach'
};

export enum DISCOUNT_TYPE {
    FIXED = 'FIXED',
    PERCENTAGE = 'PERCENTAGE'
}

export enum COMMISSION_TYPE {
    FIXED = 'FIXED',
    PERCENTAGE = 'PERCENTAGE'
}

export enum MEMBERSHIP_STATUS {
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
    UPCOMING = 'UPCOMING',
    CANCELLED = 'CANCELLED'
}

export enum CUSTOMER_MEMBERSHIP_STATUS {
    MEMBER = 'MEMBER',
    EXPIRED = 'EXPIRED'
}

export const constants = {
    PER_PAGE: 10,
    LOCAL_STORAGE_TOKEN: 'AUTH_ACCESS_TOKEN',
    LOCAL_STORAGE_ADMIN: 'ADMIN_DATA',
    LOCAL_STORAGE_PERMISSIONS: 'USER_PERMISSIONS',
    DARK_MODE: 'DARK_MODE',
    DOC_SIDEBAR: 'DOC_SIDEBAR',
    APP_URL: import.meta.env.VITE_APP_URL,
    BASE_URL: import.meta.env.VITE_BASE_URL,
    API_URL: import.meta.env.VITE_BASE_URL + '/api',
    GRAPHQL_SERVER: import.meta.env.VITE_BASE_URL + '/graphql',
    STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    FAKE_RESPONSE: import.meta.env.VITE_FAKE_RESPONSE === 'true',
    PROJECT_UUID: 'PROJECT_UUID',
};

export const apiUrl = {
    adminLogin: '/login',
    refreshToken: '/refresh-token',
    logout: '/logout',
    userPermissions: '/user-permissions',
    projects: '/projects',
    uploadImage: '/upload-image',
    deleteFile: '/delete-file',
    createOtp: '/create-otp',
    verifyOtp: '/verify-otp',
    resetPassword: '/reset-password',
    invite: '/invite',
    validateInvite: '/validate-invite',
    dashboardStats: '/dashboard-stats',
    expenses: '/expenses',
    expenseTypes: '/expense-types',
    plots: '/plots',
    plotBlocks: '/plot-blocks',
    plotCategories: '/plot-categories',
}

export const ROUTES = {
    DASHBOARD: '/dashboard',
    FORBIDDEN: '/access-forbidden',
    AUTH: {
        LOGIN: '/',
        FORGOT_PASSWORD: '/forgot-password',
        INVITATION: '/invitation/:inviteLink',
    },
    BRAND: {
        LIST: '/brands',
        CREATE: '/brand/create',
        EDIT: ((id = null) => '/brand/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/brand/'+(id || ':id')),
        ACTIVATION: ((id = null) => '/brand/'+(id || ':id')+'/activation'),
    },
    GYM: {
        LIST: '/gyms',
        CREATE: '/gym/create',
        EDIT: ((id = null) => '/gym/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/gym/'+(id || ':id')),
    },
    LEAD: {
        LIST: '/leads',
        CREATE: '/lead/create',
        EDIT: ((id = null) => '/lead/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/lead/'+(id || ':id')),
    },
    CUSTOMER: {
        LIST: '/customers',
        CREATE: '/customer/create',
        EDIT: ((id = null) => '/customer/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/customer/'+(id || ':id')),
    },
    INSTRUCTOR: {
        LIST: '/instructors',
        CREATE: '/instructor/create',
        EDIT: ((id = null) => '/instructor/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/instructor/'+(id || ':id')),
    },
    SERVICE: {
        LIST: '/services',
        CREATE: '/service/create',
        EDIT: ((id = null) => '/service/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/service/'+(id || ':id')),
    },
    CALENDAR: {
        VIEW: '/calendar',
    },
    MEMBERSHIP_PLAN_GROUP: {
        LIST: '/membership-plan-groups',
        CREATE: '/membership-plan-group/create',
        EDIT: ((id = null) => '/membership-plan-group/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/membership-plan-group/'+(id || ':id')),
    },
    MEMBERSHIP_PLAN: {
        LIST: '/membership-plans',
        CREATE: '/membership-plan/create',
        EDIT: ((id = null) => '/membership-plan/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/membership-plan/'+(id || ':id')),
    },
    PAYMENT_PLAN: {
        LIST: '/payment-plans',
        CREATE: '/payment-plan/create',
        EDIT: ((id = null) => '/payment-plan/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/payment-plan/'+(id || ':id')),
    },
    ADMIN: {
        LIST: '/admins',
        CREATE: '/admin/create',
        EDIT: ((id = null) => '/admin/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/admin/'+(id || ':id'))
    },
    CLASS: {
        LIST: '/classes',
        CREATE: '/class/create',
        EDIT: ((id = null) => '/class/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/class/'+(id || ':id')),
    },
    CLASS_SCHEDULE: {
        LIST: '/class-schedules',
        CREATE: '/class-schedule/create',
        EDIT: ((id = null) => '/class-schedule/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/class-schedule/'+(id || ':id')),
    },
    REPORT: {
        SALES: '/reports/sales',
        PT_COMMISSION: '/reports/pt-commission',
    },
    MEMBERSHIP: {
        LIST: '/memberships',
        CREATE: '/membership/create',
        EDIT: ((id = null) => '/membership/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/membership/'+(id || ':id')),
    },
    EXPENSE: {
        LIST: '/expenses',
        CREATE: '/expense/create',
        EDIT: ((id = null) => '/expense/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/expense/'+(id || ':id')),
    },
    EXPENSE_TYPE: {
        LIST: '/expense-types',
    },
    PLOT: {
        LIST: '/plots',
        CREATE: '/plot/create',
        EDIT: ((id = null) => '/plot/' + (id || ':id') + '/edit'),
    },
    PLOT_BLOCK: {
        LIST: '/plot-blocks',
    },
    PLOT_CATEGORY: {
        LIST: '/plot-categories',
    },
    GYM_QR_SESSION: {
        LIST: '/attendance',
        VIEW: ((id = null) => '/attendance/'+(id || ':id')),
    },
    DISCOUNT: {
        LIST: '/discounts',
        CREATE: '/discount/create',
        EDIT: ((id = null) => '/discount/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/discount/'+(id || ':id')),
    },
    SUBSCRIPTION: {
        PAYMENT: '/subscription-payments',
    },
}

export const PERMISSIONS = {
    BRAND: {
        LIST: 'brand:view',
        CREATE: 'brand:create',
        UPDATE: 'brand:update',
    },
    GYM: {
        LIST: 'gym:view',
        CREATE: 'gym:create',
        UPDATE: 'gym:update',
        DELETE: 'gym:delete',
    },
    LEAD: {
        LIST: 'lead:view',
        CREATE: 'lead:create',
        UPDATE: 'lead:update',
        DELETE: 'lead:delete',
    },
    CUSTOMER: {
        LIST: 'customer:view',
        CREATE: 'customer:create',
        UPDATE: 'customer:update',
        DELETE: 'customer:delete',
    },
    INSTRUCTOR: {
        LIST: 'instructor:view',
        CREATE: 'instructor:create',
        UPDATE: 'instructor:update',
        DELETE: 'instructor:delete',
    },
    SERVICE: {
        LIST: 'service:view',
        CREATE: 'service:create',
        UPDATE: 'service:update',
        DELETE: 'service:delete',
    },
    MEMBERSHIP_PLAN_GROUP: {
        LIST: 'membership_plan_group:view',
        CREATE: 'membership_plan_group:create',
        UPDATE: 'membership_plan_group:update',
        DELETE: 'membership_plan_group:delete',
    },
    MEMBERSHIP_PLAN: {
        LIST: 'membership_plan:view',
        CREATE: 'membership_plan:create',
        UPDATE: 'membership_plan:update',
        DELETE: 'membership_plan:delete',
    },
    PAYMENT_PLAN: {
        LIST: 'payment_plan:view',
        UPSERT: 'payment_plan:upsert',
        DELETE: 'payment_plan:delete',
    },
    ADMIN: {
        LIST: 'admin:view',
        UPSERT: 'admin:upsert',
        DELETE: 'admin:delete',
    },
    CLASS: {
        LIST: 'class:view',
        CREATE: 'class:create',
        UPDATE: 'class:update',
        DELETE: 'class:delete',
    },
    CLASS_SCHEDULE: {
        LIST: 'class_schedule:view',
        CREATE: 'class_schedule:create',
        UPDATE: 'class_schedule:update',
        DELETE: 'class_schedule:delete',
    },
    MEMBERSHIP: {
        LIST: 'membership:view',
        CREATE: 'membership:create',
        UPDATE: 'membership:update',
        DELETE: 'membership:delete',
    },
    EXPENSE: {
        LIST: 'expense:view',
        CREATE: 'expense:create',
        UPDATE: 'expense:update',
        DELETE: 'expense:delete',
    },
    EXPENSE_TYPE: {
        LIST: 'expense_type:view',
        CREATE: 'expense_type:create',
        UPDATE: 'expense_type:update',
        DELETE: 'expense_type:delete',
    },
    PLOT: {
        LIST: 'plot:view',
        CREATE: 'plot:create',
        UPDATE: 'plot:update',
        DELETE: 'plot:delete',
    },
    PLOT_BLOCK: {
        LIST: 'plot_block:view',
        CREATE: 'plot_block:create',
        UPDATE: 'plot_block:update',
        DELETE: 'plot_block:delete',
    },
    PLOT_CATEGORY: {
        LIST: 'plot_category:view',
        CREATE: 'plot_category:create',
        UPDATE: 'plot_category:update',
        DELETE: 'plot_category:delete',
    },
    REPORT: {
        PT_COMMISSION: 'report:pt_commission',
    },
    GYM_QR_SESSION: {
        LIST: 'gym_qr_session:view',
    },
    DISCOUNT: {
        LIST: 'discount:view',
        CREATE: 'discount:create',
        UPDATE: 'discount:update',
        DELETE: 'discount:delete',
    },
    PAYMENT: {
        LIST: 'payments:view',
    },
    SUBSCRIPTION: {
        LIST: 'subscription:view',
        BILLING: 'subscription:purchase',
        PAYMENT: 'subscription:payment', // For Super Admin use ONLY
    },
}

export enum CUSTOMER_TABS {
    DETAILS = 'details',
    MEMBERSHIPS = 'memberships',
    CONTRACTS = 'contracts',
    PAYMENTS = 'payments',
}

export enum PAYMENT_STATUS {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    REFUNDED = "REFUNDED",
    PENDING_PAYMENT = "PENDING_PAYMENT",
}

export const emptyListResponse = {
    list: [],
    paging: {
        totalPages: 0,
        totalResultCount: 0
    }
}

export const emptyMutationResponse = {
    data: null,
    status: false,
    errorMessage: null
}

export enum OTP_CHANNEL {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE'
}

export enum PAYMENT_PLAN_INTERVAL {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

export enum SUBSCRIPTION_PLAN_ACTION {
    RENEW = 'RENEW',
    UPGRADE = 'UPGRADE',
}

export enum SUBSCRIPTION_PLAN_TYPES {
    FREE_TRIAL = 'FREE_TRIAL',
    STARTER = 'STARTER',
    GROWTH = 'GROWTH',
    PROFESSIONAL = 'PROFESSIONAL',
    ENTERPRISE = 'ENTERPRISE'
}

export enum SUBSCRIPTION_STATUS {
    ACTIVE = 'ACTIVE',
    GRACE  = 'GRACE',
    EXPIRED = 'EXPIRED'
}

export enum SUBSCRIPTION_PAYMENT_STATUS {
    PENDING = 'PENDING',
    PENDING_PAYMENT = 'PENDING_PAYMENT'
}

export enum PAYMENT_SCHEME {
    CARD = 'CARD',
    ONLINE_TRANSFER = 'ONLINE_TRANSFER'
}

export enum GYM_QR_SESSION_STATE {
    CHECK_IN = 'Check in',
    CHECK_OUT = 'Check out'
}

export enum GYM_QR_SESSION_STATE {
    CHECK_IN = 'Check in',
    CHECK_OUT = 'Check out',
    OVERTIME_IN = 'Overtime in',
    OVERTIME_OUT = 'Overtime out',
}
