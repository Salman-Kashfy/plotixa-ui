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
};

export const apiUrl = {
    adminLogin: '/login',
    refreshToken: '/refresh-token',
    logout: '/logout',
    userPermissions: '/user-permissions',
    uploadImage: '/upload-image',
    deleteFile: '/delete-file',
    billingTotal: '/billing-total',
    isGymPrefixUnique: '/is-gym-prefix-unique',
    createOtp: '/create-otp',
    verifyOtp: '/verify-otp',
    resetPassword: '/reset-password',
    invite: '/invite',
    validateInvite: '/validate-invite',
    dashboardStats: '/dashboard-stats',
    biometricUpdateCustomer: '/biometric-update-customer',
    // settings: 'settings',
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
        OPTIONS: ((id = null) => '/gym/'+(id || ':id')+'/options'),
    },
    LEAD: {
        LIST: '/leads',
        CREATE: '/lead/create',
        EDIT: ((id = null) => '/lead/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/lead/'+(id || ':id'))
    },
    CUSTOMER: {
        LIST: '/customers',
        EDIT: ((id = null) => '/customer/'+(id || ':id')+'/edit'),
        TAB: ((id = null, tab = null) => '/customer/'+(id || ':id')+'/'+(tab || ':tab')),
    },
    INSTRUCTOR: {
        LIST: '/instructors',
        CREATE: '/instructor/create',
        EDIT: ((id = null) => '/instructor/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/instructor/'+(id || ':id'))
    },
    SERVICE: {
        LIST: '/services',
        CREATE: '/service/create',
        EDIT: ((id = null) => '/service/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/service/'+(id || ':id'))
    },
    MEMBERSHIP_PLAN_GROUP: {
        LIST: '/plan-groups',
        CREATE: '/plan-group/create',
        EDIT: ((id = null) => '/plan-group/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/plan-group/'+(id || ':id'))
    },
    MEMBERSHIP_PLAN: {
        LIST: '/membership-plans',
        CREATE: '/membership-plan/create',
        EDIT: ((id = null) => '/membership-plan/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/membership-plan/'+(id || ':id'))
    },
    PAYMENT_PLAN: {
        LIST: '/payment-plans',
        CREATE: '/payment-plan/create',
        EDIT: ((id = null) => '/payment-plan/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/payment-plan/'+(id || ':id'))
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
        VIEW: ((id = null) => '/class/'+(id || ':id'))
    },
    CLASS_SCHEDULE: {
        LIST: '/class-schedules',
        CREATE: '/class-schedule/create',
        EDIT: ((id = null) => '/class-schedule/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/class-schedule/'+(id || ':id'))
    },
    DISCOUNT: {
        LIST: '/discounts',
        CREATE: '/discount/create',
        EDIT: ((id = null) => '/discount/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/discount/'+(id || ':id'))
    },
    CALENDAR: {
        VIEW: '/calendar',
    },
    REPORT: {
        SALES: '/report/sales',
        PT_COMMISSION: '/report/pt-commission',
    },
    GYM_QR_SESSION: {
        LIST: '/attendance',
    },
    MEMBERSHIP: {
        LIST: '/memberships',
    },
    SUBSCRIPTION: {
        VIEW: '/subscription',
        BILLING: '/subscription/billing',
        PAYMENT: '/subscription/payments', // For Super Admin use ONLY
    },
    EXPENSE: {
        LIST: '/expenses',
        CREATE: '/expense/create',
        EDIT: ((id = null) => '/expense/'+(id || ':id')+'/edit'),
        VIEW: ((id = null) => '/expense/'+(id || ':id'))
    },
    PT_COMMISSION: {
        VIEW: ((instructorId = null) => '/instructor/pt-commission/'+(instructorId || ':instructorId')),
    },
    CLASS_COMMISSION: {
        VIEW: ((instructorId = null) => '/instructor/class-commission/'+(instructorId || ':instructorId')),
    },
}

export enum DAY_TO_WEEKDAY {
    "1" = "Sunday",
    "2" = "Monday",
    "3" = "Tuesday",
    "4" = "Wednesday",
    "5" = "Thursday",
    "6" = "Friday",
    "7" = "Saturday",
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
    },
    LEAD: {
        LIST: 'lead:view',
        UPSERT: 'lead:upsert',
        DELETE: 'lead:delete',
    },
    CUSTOMER: {
        LIST: 'customer:view',
        UPSERT: 'customer:upsert',
    },
    INSTRUCTOR: {
        LIST: 'instructor:view',
        UPSERT: 'instructor:upsert',
        DELETE: 'instructor:delete',
    },
    SERVICE: {
        LIST: 'service:view',
        UPSERT: 'service:upsert',
        DELETE: 'service:delete',
    },
    MEMBERSHIP_PLAN_GROUP: {
        LIST: 'membership_plan_group:view',
        UPSERT: 'membership_plan_group:upsert',
        DELETE: 'membership_plan_group:delete',
    },
    MEMBERSHIP_PLAN: {
        LIST: 'membership_plan:view',
        UPSERT: 'membership_plan:upsert',
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
        UPSERT: 'class:upsert',
        DELETE: 'class:delete',
        PURCHASE: 'class:purchase',
    },
    CLASS_SCHEDULE: {
        LIST: 'class_schedule:view',
        UPSERT: 'class_schedule:upsert',
        DELETE: 'class_schedule:delete',
        ATTEND: 'class_schedule:attend',
        MODIFY: 'class_schedule:modify',
        MARK_DONE: 'class_schedule:mark_done',
    },
    DISCOUNT: {
        LIST: 'discount:view',
        UPSERT: 'discount:upsert',
        DELETE: 'discount:delete',
    },
    SESSION_CONTRACT: {
        LIST: 'session_contract:view',
        UPSERT: 'session_contract:upsert',
        DELETE: 'session_contract:delete',
        BOOK: 'session_contract:book',
        PAY: 'session_contract:pay',
    },
    PAYMENT: {
        LIST: 'payments:view',
    },
    MEMBERSHIP: {
        LIST: 'membership:list',
        PURCHASE: 'membership:purchase',
        CANCEL: 'membership:cancel',
    },
    GYM_QR_SESSION: {
        LIST: 'gym_qr_session:view',
        UPSERT: 'gym_qr_session:upsert'
    },
    SUBSCRIPTION: {
        LIST: 'subscription:view',
        BILLING: 'subscription:purchase',
        PAYMENT: 'subscription:payment', // For Super Admin use ONLY
    },
    EXPENSE: {
        LIST: 'expense:view',
        UPSERT: 'expense:upsert',
        DELETE: 'expense:delete',
    },
    PT_COMMISSION: {
        VIEW:'pt_commission:view',
        UPSERT:'pt_commission:upsert',
    },
    CLASS_COMMISSION: {
        VIEW:'class_commission:view',
        UPSERT:'class_commission:upsert',
    },
    REPORT: {
        PT_COMMISSION: 'pt_commission_report:view',
        CLASS_COMMISSION: 'class_commission_report:view',
    }
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

// export enum MEMBERSHIP_STATUS {
//     PENDING_PAYMENT = 'PENDING_PAYMENT',
//     ACTIVE = 'ACTIVE',
//     ENDED = 'ENDED',
//     CANCELLED = 'CANCELLED',
//     FROZEN = 'FROZEN',
//     TERMINATED = 'TERMINATED',
//     INACTIVE = 'INACTIVE',
//     UPCOMING = 'UPCOMING',
//     TRANSFERRED = 'TRANSFERRED',
//     RELOCATED = 'RELOCATED'
// }

export enum SERVICE_TYPE {
    SINGLE_SESSION = 'SINGLE_SESSION',
    GROUP_SESSION = 'GROUP_SESSION'
}

export enum TAX_MODE {
    NO_TAXES = 'NO_TAXES',
    INCLUSIVE = 'INCLUSIVE',
    EXCLUSIVE = 'EXCLUSIVE'
}

export enum SESSION_CONTRACT_STATUS {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    CANCELED = "CANCELED",
    NOT_STARTED = "NOT STARTED",
    STARTED = "STARTED",
    ENDED = "ENDED",
    EXPIRED = "EXPIRED",
    TERMINATED = "TERMINATED"
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
