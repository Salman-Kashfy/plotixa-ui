import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SportsIcon from '@mui/icons-material/Sports';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InsightsIcon from '@mui/icons-material/Insights';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuIcon from '@mui/icons-material/Menu';
import { PERMISSIONS, ROUTES } from '../../utils/constants';
import type { SvgIconComponent } from '@mui/icons-material';

export const DRAWER_WIDTH = 240;

export type SidebarNavItem = {
    key: string;
    label: string;
    route: string;
    permission?: string;
    Icon: SvgIconComponent;
    bottomNav?: boolean;
};

export const sidebarNavItems: SidebarNavItem[] = [
    { key: 'dashboard', label: 'Dashboard', route: ROUTES.DASHBOARD, permission: PERMISSIONS.GYM.LIST, Icon: GridViewOutlinedIcon, bottomNav: true },
    { key: 'brand', label: 'Brands', route: ROUTES.BRAND.LIST, permission: PERMISSIONS.BRAND.LIST, Icon: WorkspacePremiumOutlinedIcon },
    { key: 'gym', label: 'Gyms', route: ROUTES.GYM.LIST, permission: PERMISSIONS.GYM.LIST, Icon: FitnessCenterIcon },
    { key: 'leads', label: 'Leads', route: ROUTES.LEAD.LIST, permission: PERMISSIONS.LEAD.LIST, Icon: TransferWithinAStationIcon },
    { key: 'customers', label: 'Customers', route: ROUTES.CUSTOMER.LIST, permission: PERMISSIONS.CUSTOMER.LIST, Icon: BadgeOutlinedIcon, bottomNav: true },
    { key: 'instructors', label: 'Instructors', route: ROUTES.INSTRUCTOR.LIST, permission: PERMISSIONS.INSTRUCTOR.LIST, Icon: SportsIcon },
    { key: 'services', label: 'Services', route: ROUTES.SERVICE.LIST, permission: PERMISSIONS.SERVICE.LIST, Icon: SportsGymnasticsOutlinedIcon },
    { key: 'calendar', label: 'Calendar', route: ROUTES.CALENDAR.VIEW, permission: PERMISSIONS.CLASS_SCHEDULE.LIST, Icon: CalendarMonthIcon },
    { key: 'membership-plan-group', label: 'Plan Groups', route: ROUTES.MEMBERSHIP_PLAN_GROUP.LIST, permission: PERMISSIONS.MEMBERSHIP_PLAN_GROUP.LIST, Icon: CategoryOutlinedIcon },
    { key: 'membership-plan', label: 'Membership Plans', route: ROUTES.MEMBERSHIP_PLAN.LIST, permission: PERMISSIONS.MEMBERSHIP_PLAN.LIST, Icon: DonutLargeIcon },
    { key: 'payment-plan', label: 'Payment Plans', route: ROUTES.PAYMENT_PLAN.LIST, permission: PERMISSIONS.PAYMENT_PLAN.LIST, Icon: SellOutlinedIcon },
    { key: 'admins', label: 'Admins', route: ROUTES.ADMIN.LIST, permission: PERMISSIONS.ADMIN.LIST, Icon: AdminPanelSettingsOutlinedIcon },
    { key: 'classes', label: 'Classes', route: ROUTES.CLASS.LIST, permission: PERMISSIONS.CLASS.LIST, Icon: SchoolOutlinedIcon },
    { key: 'class-schedules', label: 'Class Schedules', route: ROUTES.CLASS_SCHEDULE.LIST, permission: PERMISSIONS.CLASS_SCHEDULE.LIST, Icon: ScheduleIcon },
    { key: 'sales', label: 'Sales', route: ROUTES.REPORT.SALES, permission: PERMISSIONS.PAYMENT.LIST, Icon: InsightsIcon },
    { key: 'membership', label: 'Memberships', route: ROUTES.MEMBERSHIP.LIST, permission: PERMISSIONS.MEMBERSHIP.LIST, Icon: CardMembershipIcon },
    { key: 'expense', label: 'Expenses', route: ROUTES.EXPENSE.LIST, permission: PERMISSIONS.EXPENSE.LIST, Icon: TrendingDownOutlinedIcon },
    { key: 'pt-commission', label: 'PT Commission', route: ROUTES.REPORT.PT_COMMISSION, permission: PERMISSIONS.REPORT.PT_COMMISSION, Icon: AltRouteIcon },
    { key: 'attendance', label: 'Attendance', route: ROUTES.GYM_QR_SESSION.LIST, permission: PERMISSIONS.GYM_QR_SESSION.LIST, Icon: ChecklistOutlinedIcon, bottomNav: true },
    { key: 'discounts', label: 'Discounts', route: ROUTES.DISCOUNT.LIST, permission: PERMISSIONS.DISCOUNT.LIST, Icon: PercentOutlinedIcon },
    { key: 'subscription-payments', label: 'Subscription Payments', route: ROUTES.SUBSCRIPTION.PAYMENT, permission: PERMISSIONS.SUBSCRIPTION.PAYMENT, Icon: AccountBalanceIcon },
];

export const bottomNavMenuItem = {
    key: 'menu',
    label: 'Menu',
    Icon: MenuIcon,
};

/** Preferred bottom-nav order (excluding Menu and the center Create Lead FAB). */
const BOTTOM_NAV_ORDER = ['dashboard', 'customers', 'attendance'] as const;

export function getVisibleNavItems(items: SidebarNavItem[] = sidebarNavItems, hasPermission: (p?: string) => boolean) {
    return items.filter((item) => !item.permission || hasPermission(item.permission));
}

export function getBottomNavItems(hasPermission: (p?: string) => boolean) {
    const visible = getVisibleNavItems(sidebarNavItems, hasPermission);
    const byKey = new Map(visible.map((item) => [item.key, item]));

    return BOTTOM_NAV_ORDER.map((key) => byKey.get(key)).filter(
        (item): item is SidebarNavItem => Boolean(item?.bottomNav)
    );
}
