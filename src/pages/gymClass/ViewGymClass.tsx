import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {CLASS_TYPE, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import {NavLink, useParams} from 'react-router-dom';
import {GetGymClass} from "../../services/class.service";
import PageTitle from "../../components/PageTitle";
import Grid from "@mui/material/Grid2";
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    Button,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import {AdminContext} from "../../hooks/AdminContext";
import LaunchIcon from '@mui/icons-material/Launch';
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {hasPermission} from "../../utils/permissions";

function DetailRow({ label, children, isMobile }) {
    if (isMobile) {
        return (
            <Box sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                    {label}
                </Typography>
                <Box sx={{ typography: 'body2', wordBreak: 'break-word' }}>{children}</Box>
            </Box>
        );
    }

    return (
        <TableRow>
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                {label}
            </TableCell>
            <TableCell sx={{ wordBreak: 'break-word' }}>{children}</TableCell>
        </TableRow>
    );
}

function ViewGymClass() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = {
        to: ROUTES.CLASS.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.CLASS.UPSERT),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS.LIST, name: 'Classes' }, {name: 'View Class' }])
        GetGymClass(id).then((service) => {
            setRecord(service)
            setLoading(false)
        })
    }, []);

    const detailRows = !loading ? (
        <>
            <DetailRow label="Name:" isMobile={isMobile}>{record.name}</DetailRow>
            {ROLE.SUPER_ADMIN === adminContext.admin.role.name.toLowerCase() ? (
                <DetailRow label="Brand:" isMobile={isMobile}>
                    <Link component={NavLink} to={ROUTES.BRAND.VIEW(record.brand.id)} underline={'none'}>
                        {record.brand.name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Category:" isMobile={isMobile}>{record.gymClassCategory.name}</DetailRow>
            <DetailRow label="Class type:" isMobile={isMobile}>{CLASS_TYPE[record.classType]}</DetailRow>
            {CLASS_TYPE[record.classType] === CLASS_TYPE.ONLINE ? (
                <DetailRow label="Web URL:" isMobile={isMobile}>
                    <Button href={record.onlineLink} target="_blank" rel="noreferrer" variant={'contained'} size="small" endIcon={<LaunchIcon />}>
                        LINK
                    </Button>
                </DetailRow>
            ) : null}
            <DetailRow label="Description:" isMobile={isMobile}>{record.description || '-'}</DetailRow>
        </>
    ) : null;

    return (
        <>
            <PageTitle title={record.name} backTo={ROUTES.CLASS.LIST} btn={btn}/>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ?
                        <Box sx={{textAlign: 'center', py: 4}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{mb: 1.5, pl: { xs: 0, sm: 1.5 }}} color={'primary'}>
                                    Class details
                                </Typography>
                                <Divider/>
                                {isMobile ? (
                                    <Stack sx={{ mt: 1 }}>{detailRows}</Stack>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableBody>{detailRows}</TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    }
                </Grid>
            </Grid>
        </>
    )
}

export default ViewGymClass
