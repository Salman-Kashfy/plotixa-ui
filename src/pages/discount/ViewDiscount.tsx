import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {DISCOUNT_ON, DISCOUNT_TYPE, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import {NavLink, useParams} from 'react-router-dom';
import {GetDiscount} from "../../services/discount.service";
import PageTitle from "../../components/PageTitle";
import Grid from "@mui/material/Grid2";
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
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import {AdminContext} from "../../hooks/AdminContext";
import {startCase,toLower} from "lodash";
import dayjs from "dayjs";
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
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', width: label === 'Target Members:' ? 300 : undefined }}>
                {label}
            </TableCell>
            <TableCell sx={{ wordBreak: 'break-word' }}>{children}</TableCell>
        </TableRow>
    );
}

function ViewDiscount() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = {
        to: ROUTES.DISCOUNT.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.DISCOUNT.UPSERT),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.DISCOUNT.LIST, name: 'Discounts' }, {name: 'View Discount' }])
        GetDiscount(id).then((discount) => {
            setRecord(discount)
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
            <DetailRow label="Discount on:" isMobile={isMobile}>{DISCOUNT_ON[record.discountOn]}</DetailRow>
            <DetailRow label="Start Date:" isMobile={isMobile}>
                {dayjs(record.startDate).format("MMM DD, YYYY")}
            </DetailRow>
            <DetailRow label="End Date:" isMobile={isMobile}>
                {dayjs(record.endDate).format("MMM DD, YYYY")}
            </DetailRow>
            <DetailRow label="Status:" isMobile={isMobile}>
                <Chip label={record.status} color={ record.status === GLOBAL_STATUSES.ACTIVE ? 'success' : '' } />
            </DetailRow>
            <DetailRow label="Created:" isMobile={isMobile}>
                {dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy.fullName}
            </DetailRow>
            <DetailRow label="Updated:" isMobile={isMobile}>
                {record.lastUpdatedBy
                    ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy.fullName
                    : '-'}
            </DetailRow>
        </>
    ) : null;

    const optionRows = !loading ? (
        <>
            <DetailRow label="Target Members:" isMobile={isMobile}>
                {record.forMembers ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Target Non Members:" isMobile={isMobile}>
                {record.forNonMembers ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Discount type:" isMobile={isMobile}>
                {startCase(toLower(DISCOUNT_TYPE[record.discountType]))}
            </DetailRow>
            {record.discountType === DISCOUNT_TYPE.PERCENTAGE ? (
                <>
                    <DetailRow label="Discount (%):" isMobile={isMobile}>{record.percentage}%</DetailRow>
                    <DetailRow label="Discount Cap:" isMobile={isMobile}>
                        {record.brand.country.currency.symbol + record.maxLimit}
                    </DetailRow>
                </>
            ) : null}
            {record.discountType === DISCOUNT_TYPE.FIXED ? (
                <DetailRow label="Discount Amount:" isMobile={isMobile}>
                    {record.brand.country.currency.symbol + record.fixedAmount}
                </DetailRow>
            ) : null}
        </>
    ) : null;

    return (
        <>
            <PageTitle title={record.name} backTo={ROUTES.DISCOUNT.LIST} btn={btn}/>
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
                                    Discount Details
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
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ?
                        <Box sx={{textAlign: 'center', py: 4}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{mb: 1.5, pl: { xs: 0, sm: 1.5 }}} color={'primary'}>
                                    Discount Options
                                </Typography>
                                <Divider/>
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
                    }
                </Grid>
            </Grid>
        </>
    )
}

export default ViewDiscount
