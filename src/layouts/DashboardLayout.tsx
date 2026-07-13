import {useEffect, useState, useContext} from 'react'
import { Navigate, NavLink, useLocation } from "react-router-dom";
import {useNavigate} from "react-router";
import Header from '../components/Header';
import { DesktopSidebar, MobileSidebarDrawer, DRAWER_WIDTH } from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme, useMediaQuery } from '@mui/material';
import { AppProvider } from '@toolpad/core/AppProvider';
import {constants, ROUTES, SUBSCRIPTION_STATUS} from "../utils/constants";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {Breadcrumbs, Link} from "@mui/material";
import { lightTheme, darkTheme } from '../utils/theme';
import { hasPermission } from '../utils/permissions';
import { BreadcrumbContext } from '../hooks/BreadcrumbContext';
import {ToastContext} from '../hooks/ToastContext';
import { GetToken } from '../services/auth/auth.service'
import PermissionDenied from '../components/PermissionDenied'
import Billing from '../pages/subscription/Billing'
import * as React from "react";
import Toast from "../components/Toast";
import {AdminContext} from "../hooks/AdminContext";

const drawerWidth = DRAWER_WIDTH

function DashboardLayout({ children, isDarkMode, handleThemeChange }) {
    const theme = useTheme();
    const isMobileNav = useMediaQuery(theme.breakpoints.down('lg'));
    const toastContext:any = useContext(ToastContext)
    const adminContext = useContext(AdminContext)
    const [open, setOpen] = useState(JSON.parse(localStorage.getItem('DOC_SIDEBAR')) === null ? true : JSON.parse(localStorage.getItem('DOC_SIDEBAR')) );
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [breadcrumb, setBreadcrumb] = useState([]);

    const handleDrawerOpen = () => {
        const _open = !open
        localStorage.setItem(constants.DOC_SIDEBAR,_open)
        setOpen(_open);
    };

    const breadcrumbData = {
        breadcrumb, setBreadcrumb
    }

    useEffect(() => {
        if(JSON.parse(localStorage.getItem('DOC_SIDEBAR')) === null){
            localStorage.setItem(constants.DOC_SIDEBAR,true)
            setOpen(true)
        }else{
            setOpen(JSON.parse(localStorage.getItem('DOC_SIDEBAR')))
        }
    },[open])

    return (
        <AppProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <BreadcrumbContext.Provider value={breadcrumbData}>
                <Toast toast={toastContext.toast} toastSeverity={toastContext.toastSeverity} toastMessage={toastContext.toastMessage}/>
                <Box sx={{ display: 'flex' }}>
                    <Header
                        open={open}
                        drawerWidth={drawerWidth}
                        handleDrawerOpen={handleDrawerOpen}
                        isDarkMode={isDarkMode}
                        handleThemeChange={handleThemeChange}
                        isMobile={isMobileNav}
                    />
                    {!isMobileNav && <DesktopSidebar open={open} />}
                    {isMobileNav && (
                        <MobileSidebarDrawer
                            open={mobileNavOpen}
                            onClose={() => setMobileNavOpen(false)}
                        />
                    )}
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            mt: '65px',
                            pb: isMobileNav ? 'calc(80px + env(safe-area-inset-bottom, 0px))' : 3,
                            width: isMobileNav ? '100%' : undefined,
                        }}
                    >
                        {
                            breadcrumb.length ?
                                <Box sx={{px:3, py:2}}>
                                    <Breadcrumbs aria-label="breadcrumb">
                                        <Link underline="none" color="text.primary" key={'dashboard'} component={NavLink} to={ROUTES.DASHBOARD}>Dashboard</Link>
                                    {
                                        breadcrumbData.breadcrumb.map((e:any) => {
                                            return e.to ? (
                                                <Link underline="none" color="text.primary" key={e.name} component={NavLink} to={e.to}>{e.name}</Link>
                                            ) : (
                                                <Link underline="none" color="inherit" key={e.name}>{e.name}</Link>
                                            );
                                        })
                                    }
                                    </Breadcrumbs>
                                </Box>
                                :
                                <></>
                        }
                        <Box sx={{px: 3}}>
                            {
                                adminContext.admin.subscriptionStatus !== 'EXPIRED' ?
                                    children :
                                    <Billing/>
                            }
                        </Box>
                    </Box>
                    {isMobileNav && <BottomNav onMenuOpen={() => setMobileNavOpen(true)} />}
                </Box>
            </BreadcrumbContext.Provider>
        </AppProvider>
    );
}

const DashboardLayoutRoute = ({ isAuth, component: Component, permissionName }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const adminContext = useContext(AdminContext)
    isAuth = Boolean(GetToken());
    let permission
    if(permissionName){
        permission = hasPermission(permissionName)
    }

    const [isDarkMode, setIsDarkMode] = useState(JSON.parse(localStorage.getItem(constants.DARK_MODE)) || false);
    const handleThemeChange = () => {
        const _isDarkMode = !isDarkMode
        localStorage.setItem(constants.DARK_MODE,_isDarkMode)
        setIsDarkMode(_isDarkMode);
    }

    /**
    * Redirect to subscription billing if expired
    * */
    useEffect(() => {
        if (
            adminContext.admin.subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED &&
            location.pathname !== ROUTES.SUBSCRIPTION.BILLING
        ) {
            navigate(ROUTES.SUBSCRIPTION.BILLING, { replace: true });
        }
    }, [adminContext.admin.subscriptionStatus, location.pathname, navigate]);

    return (
        <>
            { isAuth ?
                <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
                    <DashboardLayout isDarkMode={isDarkMode} handleThemeChange={handleThemeChange}>
                        { permission || permission === undefined ? <Component /> : <PermissionDenied/> }
                    </DashboardLayout>
                </ThemeProvider>
                :  <Navigate to="/" /> }
        </>
    );
};

export default DashboardLayoutRoute;
