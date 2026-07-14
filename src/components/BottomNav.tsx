import { useLocation, useNavigate } from 'react-router-dom';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    useTheme,
} from '@mui/material';
import { hasPermission } from '../utils/permissions';
import { bottomNavMenuItem, getBottomNavItems } from './navigation/sidebarNavConfig';

type BottomNavProps = {
    onMenuOpen: () => void;
};

function BottomNav({ onMenuOpen }: BottomNavProps) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const items = getBottomNavItems(hasPermission);

    const activeValue = items.find(
        (item) => location.pathname === item.route || location.pathname.startsWith(`${item.route}/`)
    )?.route ?? false;

    const navActionSx = {
        minWidth: 0,
        px: 0.5,
        color: 'text.secondary',
        '&.Mui-selected': {
            color: 'primary.main',
        },
    };

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.drawer,
                borderTop: 1,
                borderColor: 'divider',
                pb: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <BottomNavigation
                value={activeValue}
                showLabels
                sx={{
                    height: 64,
                    bgcolor: 'background.paper',
                }}
            >
                {items.map((item) => (
                    <BottomNavigationAction
                        key={item.key}
                        label={item.label}
                        value={item.route}
                        icon={<item.Icon />}
                        onClick={() => navigate(item.route)}
                        sx={navActionSx}
                    />
                ))}
                <BottomNavigationAction
                    label={bottomNavMenuItem.label}
                    value="menu"
                    icon={<bottomNavMenuItem.Icon />}
                    onClick={onMenuOpen}
                    sx={navActionSx}
                />
            </BottomNavigation>
        </Paper>
    );
}

export default BottomNav;
