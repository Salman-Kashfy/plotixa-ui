import {Navigate} from "react-router-dom";
import { AppProvider } from '@toolpad/core/AppProvider';
import { GetToken } from '../services/auth/auth.service'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {Box, Typography} from "@mui/material";
import crmLogo from "../assets/cloudfitnest.png";
import companyLogo from "../assets/company-logo.png";
import { lightTheme } from '../utils/theme';

function AuthLayout({children}) {
    return (
        <AppProvider theme={lightTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh',  justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(142deg, rgba(243,242,247,1) 0%, rgba(214,232,246,1) 72%)' }}>
                <Box>
                    <Box sx={{backgroundColor: '#fff', p: 4, maxWidth: '440px',mx:2, position: 'relative', boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 6px'}}>
                        <Box sx={{display: 'flex', justifyContent: 'center', mb:2}}>
                            <img src={crmLogo} width={160}/>
                        </Box>
                        {children}
                    </Box>
                </Box>
            </Box>
        </AppProvider>
    )
}

const AuthLayoutRoute = ({isAuth, component: Component}) => {
    isAuth = Boolean(GetToken());
    return(
        <>
            { isAuth ?
                <Navigate to="/dashboard" /> :
                <AuthLayout>
                    <Component />
                </AuthLayout>
            }
        </>
    )
}

export default AuthLayoutRoute
