import { useContext, useEffect, useState } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { CHAMPION_TYPE, PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import { NavLink, useParams } from 'react-router-dom';
import { GetMembershipPlan } from '../../services/membership.plan.service';
import PageTitle from '../../components/PageTitle';
import Grid from '@mui/material/Grid2';
import {
    Box,
    Card,
    CardContent,
    Chip,
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
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { startCase, toLower } from 'lodash';
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

function ViewMembershipPlan() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext);
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState<any>({});
    const btn = {
        to: ROUTES.MEMBERSHIP_PLAN.EDIT(id),
        icon: <ModeEditIcon />,
        show: hasPermission(PERMISSIONS.MEMBERSHIP_PLAN.UPSERT),
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.MEMBERSHIP_PLAN.LIST, name: 'Membership Plans' },
            { name: 'View Membership Plan' },
        ]);
        GetMembershipPlan(id).then((nextRecord) => {
            setRecord(nextRecord);
            setLoading(false);
        });
    }, []);

    const detailRows = !loading ? (
        <>
            <DetailRow label="Name:" isMobile={isMobile}>
                {record.name}
            </DetailRow>
            {ROLE.SUPER_ADMIN === adminContext.admin.role.name.toLowerCase() ? (
                <DetailRow label="Brand:" isMobile={isMobile}>
                    <Link
                        component={NavLink}
                        to={ROUTES.BRAND.VIEW(record.group.brand.id)}
                        underline="none"
                    >
                        {record.group.brand.name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Plan Group:" isMobile={isMobile}>
                <Link
                    component={NavLink}
                    to={ROUTES.MEMBERSHIP_PLAN_GROUP.VIEW(record.group.id)}
                    underline="none"
                >
                    {record.group.name}
                </Link>
            </DetailRow>
            <DetailRow label="Cancellation Period:" isMobile={isMobile}>
                {record.gracePeriodCancellation} day(s)
            </DetailRow>
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

    const optionRows = !loading ? (
        <>
            <DetailRow label="Booking Status:" isMobile={isMobile}>
                <Chip
                    label={record.visible ? 'Enabled' : 'Disabled'}
                    color={record.visible ? 'success' : 'default'}
                />
            </DetailRow>
            <DetailRow label="Scope:" isMobile={isMobile}>
                {record.isChampion ? 'Global' : 'Local'}
            </DetailRow>
            {record.isChampion ? (
                <DetailRow label="Coverage:" isMobile={isMobile}>
                    {startCase(toLower(record.championType))}
                </DetailRow>
            ) : null}
            {record.isChampion && record.championType === CHAMPION_TYPE.CUSTOM ? (
                <DetailRow label="Gyms:" isMobile={isMobile}>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {record.customGyms.map((e) => (
                            <Link key={e.id} component={NavLink} to={ROUTES.GYM.VIEW(e.id)} underline="none">
                                <Chip label={e.name} />
                            </Link>
                        ))}
                    </Stack>
                </DetailRow>
            ) : null}
        </>
    ) : null;

    return (
        <>
            <PageTitle title={record.name} backTo={ROUTES.MEMBERSHIP_PLAN.LIST} btn={btn} />
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography
                                    variant="h6"
                                    sx={{ mb: 1.5, pl: { xs: 0, sm: 1.5 } }}
                                    color="primary"
                                >
                                    Membership Plan Details
                                </Typography>
                                <Divider />
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
                    )}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{ mb: 1.5 }} color="primary">
                                    Plan options
                                </Typography>
                                <Divider />
                                {isMobile ? (
                                    <Stack sx={{ mt: 1 }}>{optionRows}</Stack>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableBody>{optionRows}</TableBody>
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

export default ViewMembershipPlan;
