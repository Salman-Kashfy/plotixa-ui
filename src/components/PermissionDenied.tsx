import {useEffect, useContext} from 'react'
import {BreadcrumbContext} from '../hooks/BreadcrumbContext';
import {Box, Typography} from '@mui/material';
import AccessDenied from '../assets/access-denied.png';

function PermissionDenied() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([])
    }, []);

    return (
        <Box sx={{height: 'calc(100vh - 65px)', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <Box>
                <img src={AccessDenied} width={400}/>
                <Typography variant="h5" textAlign={'center'} fontWeight={800}>Access denied.</Typography>
                <Typography variant="subtitle2" textAlign={'center'}>You lack permission to access this page.</Typography>
            </Box>
        </Box>
    )
}

export default PermissionDenied