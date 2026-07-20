import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { ROUTES, PERMISSIONS } from '../../utils/constants';
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
    { key: 'dashboard', label: 'Dashboard', route: ROUTES.DASHBOARD, Icon: GridViewOutlinedIcon, bottomNav: true },
    { key: 'expenses', label: 'Expenses', route: ROUTES.EXPENSE.LIST, permission: PERMISSIONS.EXPENSE.LIST, Icon: TrendingDownOutlinedIcon, bottomNav: true },
];

export const bottomNavMenuItem = {
    key: 'menu',
    label: 'Menu',
    Icon: MenuIcon,
};

export function getVisibleNavItems(items: SidebarNavItem[] = sidebarNavItems, hasPermission: (p?: string) => boolean) {
    return items.filter((item) => !item.permission || hasPermission(item.permission));
}

export function getBottomNavItems(hasPermission: (p?: string) => boolean) {
    const visible = getVisibleNavItems(sidebarNavItems, hasPermission);
    return visible.filter((item) => item.bottomNav);
}
