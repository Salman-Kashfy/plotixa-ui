import { useLocation, useNavigate } from 'react-router-dom';
import {
    BottomNavigation,
    BottomNavigationAction,
    Fab,
    Paper,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { hasPermission } from '../utils/permissions';
import { PERMISSIONS, ROUTES } from '../utils/constants';
import { bottomNavMenuItem, getBottomNavItems } from './navigation/sidebarNavConfig';

type BottomNavProps = {
    onMenuOpen: () => void;
};

function BottomNav({ onMenuOpen }: BottomNavProps) {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const items = getBottomNavItems(hasPermission);
    const canCreateLead = hasPermission(PERMISSIONS.LEAD.UPSERT);

    const mid = Math.ceil(items.length / 2);
    const leftItems = canCreateLead ? items.slice(0, mid) : items;
    const rightItems = canCreateLead ? items.slice(mid) : [];

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
                    position: 'relative',
                    bgcolor: 'background.paper',
                }}
            >
                {leftItems.map((item) => (
                    <BottomNavigationAction
                        key={item.key}
                        label={item.label}
                        value={item.route}
                        icon={<item.Icon />}
                        onClick={() => navigate(item.route)}
                        sx={navActionSx}
                    />
                ))}

                {canCreateLead ? (
                    <BottomNavigationAction
                        value="create-lead"
                        disableRipple
                        showLabel={false}
                        icon={
                            <Fab
                                color="primary"
                                size="medium"
                                aria-label="Create lead"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(ROUTES.LEAD.CREATE);
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: -22,
                                    width: 56,
                                    height: 56,
                                    boxShadow: 4,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                }}
                            >
                                <AddIcon sx={{ fontSize: 28 }} />
                            </Fab>
                        }
                        onClick={() => navigate(ROUTES.LEAD.CREATE)}
                        sx={{
                            ...navActionSx,
                            flex: '0 0 64px',
                            maxWidth: 64,
                        }}
                    />
                ) : null}

                {rightItems.map((item) => (
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
