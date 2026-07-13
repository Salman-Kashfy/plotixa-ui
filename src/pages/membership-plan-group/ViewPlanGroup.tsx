import { useContext, useEffect, useState } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import { NavLink, useParams } from 'react-router-dom';
import { GetMembershipPlanGroup } from '../../services/membership.plan.group.service';
import PageTitle from '../../components/PageTitle';
import Grid from '@mui/material/Grid2';
import {
    Box,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import dayjs from 'dayjs';
import { AdminContext } from '../../hooks/AdminContext';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { hasPermission } from '../../utils/permissions';

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

function ViewPlanGroup() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext);
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState<any>({});
    const btn = {
        to: ROUTES.MEMBERSHIP_PLAN_GROUP.EDIT(id),
        icon: <ModeEditIcon />,
        show: hasPermission(PERMISSIONS.MEMBERSHIP_PLAN_GROUP.UPSERT),
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.MEMBERSHIP_PLAN_GROUP.LIST, name: 'Plan Groups' },
            { name: 'View Plan Group' },
        ]);
        GetMembershipPlanGroup(id).then((planGroup) => {
            setRecord(planGroup);
            setLoading(false);
        });
    }, []);

    const rows = !loading ? (
        <>
            <DetailRow label="Name:" isMobile={isMobile}>
                {record.name}
            </DetailRow>
            {ROLE.SUPER_ADMIN === adminContext.admin.role.name.toLowerCase() ? (
                <DetailRow label="Brand:" isMobile={isMobile}>
                    <Link component={NavLink} to={ROUTES.BRAND.VIEW(record.brand.id)} underline="none">
                        {record.brand.name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Description:" isMobile={isMobile}>
                {record.description || '-'}
            </DetailRow>
            <DetailRow label="Created:" isMobile={isMobile}>
                {dayjs(record.createdAt).format('MMM DD, YYYY') + ' By ' + record.createdBy.fullName}
            </DetailRow>
            <DetailRow label="Updated:" isMobile={isMobile}>
                {record.lastUpdatedBy
                    ? dayjs(record.updatedAt).format('MMM DD, YYYY') + ' By ' + record.lastUpdatedBy.fullName
                    : '-'}
            </DetailRow>
        </>
    ) : null;

    return (
        <>
            <PageTitle title={record.name} backTo={ROUTES.MEMBERSHIP_PLAN_GROUP.LIST} btn={btn} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                {isMobile ? (
                                    <Stack>{rows}</Stack>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableBody>{rows}</TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </>
    );
}

export default ViewPlanGroup;
