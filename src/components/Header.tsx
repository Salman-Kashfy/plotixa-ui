import { useNavigate } from 'react-router';
import { Logout, EmptyLocalStorage } from '../services/auth/auth.service';
import { AdminContext } from '../hooks/AdminContext';
import MuiAppBar from '@mui/material/AppBar';
import {
    Paper,
    Divider,
    Toolbar,
    IconButton,
    ListItemIcon,
    Typography,
    Box,
    Menu,
    Tooltip,
    Avatar,
    MenuItem,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';
import { useContext, useState } from 'react';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import { styled } from '@mui/material/styles';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { PERMISSIONS, ROLE, ROUTES } from '../utils/constants';
import { hasPermission } from '../utils/permissions';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import { DRAWER_WIDTH } from './Sidebar';
import crmLogo from '../assets/cloudfitnest.png';

interface AppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})<AppBarProps & { isMobile?: boolean }>(({ theme, open, isMobile }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(isMobile
        ? {
              marginLeft: 0,
              width: '100%',
          }
        : open
          ? {
                marginLeft: DRAWER_WIDTH,
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }
          : {
                marginLeft: `calc(${theme.spacing(8)} + 1px)`,
                width: `calc(100% - calc(${theme.spacing(8)} + 1px))`,
            }),
}));

type HeaderProps = {
    open: boolean;
    drawerWidth: number;
    handleDrawerOpen: () => void;
    isDarkMode: boolean;
    handleThemeChange: () => void;
    isMobile?: boolean;
};

function Header({
    open,
    handleDrawerOpen,
    isDarkMode,
    handleThemeChange,
    isMobile = false,
}: HeaderProps) {
    const adminContext = useContext(AdminContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const isTabletUp = useMediaQuery(theme.breakpoints.up('md'));

    const menus = [
        { name: 'Sales', route: ROUTES.REPORT.SALES, permission: PERMISSIONS.PAYMENT.LIST },
        { name: 'Expense', route: ROUTES.EXPENSE.LIST, permission: PERMISSIONS.EXPENSE.LIST },
        { name: 'Memberships', route: ROUTES.MEMBERSHIP.LIST, permission: PERMISSIONS.MEMBERSHIP.LIST },
        { name: 'Attendance', route: ROUTES.GYM_QR_SESSION.LIST, permission: PERMISSIONS.GYM_QR_SESSION.LIST },
        { name: 'Calendar', route: ROUTES.CALENDAR.VIEW, permission: PERMISSIONS.CLASS_SCHEDULE.LIST },
    ];

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [toast, setToast] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('info');
    const [toastMessage, setToastMessage] = useState('');

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    async function handleLogout() {
        await Logout()
            .then(async (data) => {
                if (data.status) {
                    await EmptyLocalStorage();
                    navigate('/');
                } else {
                    setToastSeverity('error');
                    setToastMessage(data.message);
                    setToast(true);
                }
            })
            .catch((error) => {
                setToastSeverity('error');
                setToastMessage(error.response?.data?.message || 'Logout failed');
                setToast(true);
            });
    }

    return (
        <AppBar position="fixed" open={open} isMobile={isMobile} elevation={0} variant="outlined">
            <Toolbar>
                {isMobile ? (
                    <Box component={NavLink} to={ROUTES.DASHBOARD} sx={{ display: 'flex', alignItems: 'center', mr: 1, textDecoration: 'none' }}>
                        <Box component="img" src={crmLogo} alt="CloudFitnest" sx={{ height: 28, filter: isDarkMode ? 'invert(1)' : 'none' }}/>
                    </Box>
                ) : (
                    <IconButton aria-label="Toggle sidebar" onClick={handleDrawerOpen} edge="start">
                        <MenuIcon />
                    </IconButton>
                )}
                <Box sx={{ flexGrow: 1, justifyContent: 'center', display: { xs: 'none', md: 'flex' } }}>
                    {menus.map((menu) => (
                        <Button
                            key={menu.name}
                            size="small"
                            sx={{
                                mx: 0.5,
                                display: menu.permission
                                    ? hasPermission(menu.permission)
                                        ? 'inline-flex'
                                        : 'none'
                                    : 'inline-flex',
                            }}
                            component={NavLink}
                            to={menu.route}
                        >
                            {menu.name}
                        </Button>
                    ))}
                    {hasPermission(PERMISSIONS.LEAD.UPSERT) ? (
                        <Button variant="contained" size="small" sx={{ ml: 1 }} component={NavLink} to={ROUTES.LEAD.CREATE}>
                            Create
                        </Button>
                    ) : null}
                </Box>
                <Box sx={{ flexGrow: isTabletUp ? 0 : 1 }} />
                <Box sx={{ flexGrow: 0, ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Toggle theme">
                        <IconButton onClick={handleThemeChange} aria-label="change-mode">
                            {isDarkMode ? <LightModeOutlinedIcon color="warning" /> : <DarkModeIcon color="primary" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Your profile and settings">
                        <IconButton onClick={handleOpenUserMenu}>
                            <Avatar sx={{ bgcolor: isDarkMode ? 'grey' : 'black', width: 35, height: 35, fontSize: 15 }}>
                                {adminContext.admin.firstName.charAt(0)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        keepMounted
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <Paper sx={{ minWidth: '230px' }} elevation={0}>
                            <Box sx={{ py: 1, px: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Account
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: isDarkMode ? 'grey' : 'black', width: 45, height: 45, fontSize: 20 }}>
                                        {adminContext.admin.firstName.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ ml: 1, textAlign: 'left', pr: 1 }}>
                                        <Typography variant="body1">{adminContext.admin.firstName}</Typography>
                                        <Typography variant="body2" textTransform="capitalize">
                                            {adminContext.admin.role.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 1 }} />
                            <Typography sx={{ px: 2 }} variant="subtitle2" gutterBottom>
                                Manage account
                            </Typography>
                            {[ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase()) ? (
                                <MenuItem key="subscription-view" component={NavLink} to={ROUTES.SUBSCRIPTION.VIEW} onClick={handleCloseUserMenu}>
                                    <ListItemIcon>
                                        <PlayCircleOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography sx={{ textAlign: 'center' }}>Subscription</Typography>
                                </MenuItem>
                            ) : null}
                            <MenuItem key="logout" component={NavLink} onClick={handleLogout}>
                                <ListItemIcon>
                                    <PowerSettingsNewOutlinedIcon fontSize="small" />
                                </ListItemIcon>
                                <Typography sx={{ textAlign: 'center' }}>Logout</Typography>
                            </MenuItem>
                        </Paper>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
