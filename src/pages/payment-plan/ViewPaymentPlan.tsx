import { useContext, useEffect, useState } from 'react';
import { PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import { NavLink, useParams } from 'react-router-dom';
import { GetPaymentPlan } from '../../services/payment.plan.service';
import PageTitle from '../../components/PageTitle';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
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
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { AdminContext } from '../../hooks/AdminContext';
import dayjs from 'dayjs';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { hasPermission } from '../../utils/permissions';
import { capitalize } from 'lodash';

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

function ViewPaymentPlan() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext);
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState<any>({});
    const btn = {
        to: ROUTES.PAYMENT_PLAN.EDIT(id),
        icon: <ModeEditIcon />,
        show: hasPermission(PERMISSIONS.PAYMENT_PLAN.UPSERT),
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.PAYMENT_PLAN.LIST, name: 'Payment Plan' },
            { name: 'View Payment Plan' },
        ]);
        GetPaymentPlan(id).then((paymentPlan) => {
            setRecord(paymentPlan);
            setLoading(false);
        });
    }, []);

    const currency = record?.membershipPlan?.group?.brand?.country?.currency?.symbol || '';

    const rows = !loading ? (
        <>
            <DetailRow label="Name:" isMobile={isMobile}>
                {record.name}
            </DetailRow>
            {ROLE.SUPER_ADMIN === adminContext.admin.role.name.toLowerCase() ? (
                <DetailRow label="Brand:" isMobile={isMobile}>
                    <Link
                        component={NavLink}
                        to={ROUTES.BRAND.VIEW(record.membershipPlan.group.brand.id)}
                        underline="none"
                    >
                        {record.membershipPlan.group.brand.name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Price:" isMobile={isMobile}>
                {currency + record.price}
            </DetailRow>
            <DetailRow label="Joining Fee:" isMobile={isMobile}>
                {currency + record.joiningFee}
            </DetailRow>
            <DetailRow label="Time Period:" isMobile={isMobile}>
                {record.recursionDuration + ' ' + capitalize(record.recursionPeriod + '(s)')}
            </DetailRow>
            <DetailRow label="Membership Plan:" isMobile={isMobile}>
                <Link
                    component={NavLink}
                    to={ROUTES.MEMBERSHIP_PLAN.VIEW(record.membershipPlan.id)}
                    underline="none"
                >
                    {record.membershipPlan.name}
                </Link>
            </DetailRow>
            <DetailRow label="Service Pack:" isMobile={isMobile}>
                {record.servicePacks?.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {record.servicePacks.map(({ service }) => (
                            <Link
                                key={service.id}
                                component={NavLink}
                                to={ROUTES.SERVICE.VIEW(service.id)}
                                underline="none"
                            >
                                <Chip label={service.name} />
                            </Link>
                        ))}
                    </Stack>
                ) : (
                    '-'
                )}
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
            <PageTitle title={record.name} backTo={ROUTES.PAYMENT_PLAN.LIST} btn={btn} />
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
                                    Payment Plan Details
                                </Typography>
                                <Divider />
                                {isMobile ? (
                                    <Stack sx={{ mt: 1 }}>{rows}</Stack>
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

export default ViewPaymentPlan;
