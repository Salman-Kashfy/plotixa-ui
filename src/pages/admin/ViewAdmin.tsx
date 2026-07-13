import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GENDERS, PERMISSIONS, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetAdmin} from "../../services/admin.service";
import {NavLink, useParams} from "react-router-dom";
import {
    Box,
    Chip,
    Typography,
    Card,
    CardContent,
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import {first} from "lodash";
import Link from "@mui/material/Link";
import dayjs from "dayjs";
import Divider from "@mui/material/Divider";
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

function ViewAdmin() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = {
        to: ROUTES.ADMIN.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.ADMIN.UPSERT),
    }

    useEffect(() => {
        setLoading(true)
        breadcrumbContext.setBreadcrumb([{to:ROUTES.ADMIN.LIST, name: 'Admins' }, {name: 'View Admin' }])
        GetAdmin(id).then((admin) => {
            setRecord(admin)
            setLoading(false)
        })
    }, []);

    const detailRows = !loading ? (
        <>
            <DetailRow label="Name:" isMobile={isMobile}>{record.fullName}</DetailRow>
            <DetailRow label="Gender:" isMobile={isMobile}>{GENDERS[record.gender]}</DetailRow>
            <DetailRow label="Phone:" isMobile={isMobile}>{record.phone}</DetailRow>
            <DetailRow label="Email:" isMobile={isMobile}>{record.email}</DetailRow>
            <DetailRow label="Role:" isMobile={isMobile}>{first(record.roles)?.name}</DetailRow>
            {record.gymId ? (
                <DetailRow label="Gym:" isMobile={isMobile}>
                    <Link component={NavLink} to={ROUTES.GYM.VIEW(first(record.gyms).id)} underline={'none'}>
                        {first(record.gyms).name}
                    </Link>
                </DetailRow>
            ) : null}
            {record.brandId ? (
                <DetailRow label="Brand:" isMobile={isMobile}>
                    <Link component={NavLink} to={ROUTES.BRAND.VIEW(first(record.brands).id)} underline={'none'}>
                        {first(record.brands).name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Status:" isMobile={isMobile}>
                <Chip label={record.status} color={record.status ? 'success' : ''}/>
            </DetailRow>
            <DetailRow label="Created:" isMobile={isMobile}>
                {dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy?.fullName}
            </DetailRow>
            <DetailRow label="Updated:" isMobile={isMobile}>
                {record.lastUpdatedBy
                    ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy?.fullName
                    : '-'}
            </DetailRow>
        </>
    ) : null;

    return (
        <>
            <PageTitle title={record.fullName} backTo={ROUTES.ADMIN.LIST} btn={btn}/>
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
                                    Admin details
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

export default ViewAdmin
