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
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';
import { useContext, useState } from 'react';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import { styled } from '@mui/material/styles';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ROUTES, constants } from '../utils/constants';
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
    const adminContext = useContext(AdminContext) as any;
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const projects = adminContext.projects || [];
    const selectedProjectUuid = adminContext.projectUuid || '';

    const handleProjectChange = (uuid: string) => {
        localStorage.setItem(constants.PROJECT_UUID, uuid);
        adminContext.setProjectUuid(uuid);
    };

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
                }
            })
            .catch((error) => {
                console.error(error.response?.data?.message || 'Logout failed');
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
                <Box sx={{ flexGrow: 1 }} />
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
                            {projects.length > 0 && (
                                <>
                                    <Divider sx={{ mb: 1 }} />
                                    <Box sx={{ px: 2, pb: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Project
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="project-select-label">Select project</InputLabel>
                                            <Select
                                                labelId="project-select-label"
                                                value={selectedProjectUuid}
                                                label="Select project"
                                                onChange={(e) => handleProjectChange(e.target.value)}
                                            >
                                                {projects.map((project: any) => (
                                                    <MenuItem key={project.uuid} value={project.uuid}>
                                                        {project.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </>
                            )}
                            <Divider sx={{ mb: 1 }} />
                            <Typography sx={{ px: 2 }} variant="subtitle2" gutterBottom>
                                Manage account
                            </Typography>
                            <MenuItem key="logout" onClick={handleLogout}>
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
