import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {DAY_TO_WEEKDAY, GENDERS, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetGymClassSchedule} from "../../services/class.schedule.service";
import {NavLink, useParams} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Typography,
    Stack,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import {AdminContext} from "../../hooks/AdminContext";
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
            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', verticalAlign: 'top', width: label === 'Permit Non Members:' ? 300 : undefined }}>
                {label}
            </TableCell>
            <TableCell sx={{ wordBreak: 'break-word' }}>{children}</TableCell>
        </TableRow>
    );
}

function ViewGymClassSchedule() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const btn = {
        to: ROUTES.CLASS_SCHEDULE.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.CLASS_SCHEDULE.UPSERT),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CLASS_SCHEDULE.LIST, name: 'Class Schedules' }, {name: 'View Class Schedule' }])
        GetGymClassSchedule(id).then((row) => {
            setRecord(row)
            setLoading(false)
        })
    }, []);

    const detailRows = !loading ? (
        <>
            <DetailRow label="Class:" isMobile={isMobile}>
                <Link component={NavLink} to={ROUTES.CLASS.VIEW(record.gymClass.id)} underline={'none'}>
                    {record.gymClass.name}
                </Link>
            </DetailRow>
            {gymSelection ? (
                <DetailRow label="Gym:" isMobile={isMobile}>
                    <Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline={'none'}>
                        {record.gym.name}
                    </Link>
                </DetailRow>
            ) : null}
            <DetailRow label="Start Date:" isMobile={isMobile}>
                {dayjs(record.startDate).format("MMM DD, YYYY")}
            </DetailRow>
            <DetailRow label="End Date:" isMobile={isMobile}>
                {dayjs(record.endDate).format("MMM DD, YYYY")}
            </DetailRow>
            <DetailRow label="Durations:" isMobile={isMobile}>{record.duration} mins</DetailRow>
            <DetailRow label="Spots:" isMobile={isMobile}>{record.spots}</DetailRow>
            <DetailRow label="Gender:" isMobile={isMobile}>{GENDERS[record.gender]}</DetailRow>
            <DetailRow label="Created:" isMobile={isMobile}>
                {dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy.fullName}
            </DetailRow>
            <DetailRow label="Updated:" isMobile={isMobile}>
                {record.lastUpdatedBy
                    ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy.fullName
                    : '-'}
            </DetailRow>
            <DetailRow label="Status:" isMobile={isMobile}>
                <Chip label={record.status} color={ record.status === GLOBAL_STATUSES.ACTIVE ? 'success' : '' } />
            </DetailRow>
        </>
    ) : null;

    const pricingRows = !loading ? (
        <>
            <DetailRow label="Permit Members:" isMobile={isMobile}>
                {record.gymMemberClient ? 'Yes' : 'No'}
            </DetailRow>
            <DetailRow label="Permit Non Members:" isMobile={isMobile}>
                {record.dropInClient ? 'Yes' : 'No'}
            </DetailRow>
            {record.gymMemberClient ? (
                <DetailRow label="Member Price:" isMobile={isMobile}>
                    {record.gym.brand.country.currency.symbol + record.gymMemberClientPrice}
                </DetailRow>
            ) : null}
            {record.dropInClient ? (
                <DetailRow label="Non Member Price:" isMobile={isMobile}>
                    {record.gym.brand.country.currency.symbol + record.dropInClientPrice}
                </DetailRow>
            ) : null}
        </>
    ) : null;

    return (
        <>
            <PageTitle title={'View Class Schedule'} backTo={ROUTES.CLASS_SCHEDULE.LIST} btn={btn}/>
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
                                    Class Schedule details
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
                    {
                        loading ?
                        <Box sx={{textAlign: 'center', py: 4}}>
                            <CircularProgress/>
                        </Box>
                        :<Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{mb: 1.5, pl: { xs: 0, sm: 1.5 }}} color={'primary'}>
                                    Pricing
                                </Typography>
                                <Divider/>
                                {isMobile ? (
                                    <Stack sx={{ mt: 1 }}>{pricingRows}</Stack>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableBody>{pricingRows}</TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid size={{ xs: 12 }}>
                    {
                        loading ?
                        <></>
                        : <Card>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Typography variant="h6" sx={{mb: 1.5, pl: { xs: 0, sm: 1.5 }}} color={'primary'}>
                                    Schedule
                                </Typography>
                                <Divider/>
                                {isMobile ? (
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        {record.schedule.map((e, index) => (
                                            <Box
                                                key={`${e.day}-${e.openTime}-${index}`}
                                                sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider' }}
                                            >
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    {DAY_TO_WEEKDAY[e.day]} · {dayjs(record.startDate + e.openTime).format("hh:mm A")}
                                                </Typography>
                                                <Typography variant="body2">Duration: {e.duration} mins</Typography>
                                                <Typography variant="body2">Gender: {GENDERS[e.gender]}</Typography>
                                                <Typography variant="body2">Spots: {e.spots}</Typography>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    Instructors:{' '}
                                                    {e.instructors?.length
                                                        ? e.instructors.map((instructor, i) => (
                                                            <span key={instructor.id}>
                                                                {i > 0 ? ', ' : ''}
                                                                <Link component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(instructor.id)} underline={'none'}>
                                                                    {instructor.fullName}
                                                                </Link>
                                                            </span>
                                                        ))
                                                        : '-'}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Day</TableCell>
                                                    <TableCell>Time</TableCell>
                                                    <TableCell>Duration</TableCell>
                                                    <TableCell>Gender</TableCell>
                                                    <TableCell>Spots</TableCell>
                                                    <TableCell>Instructors</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    record.schedule.map((e, index) => {
                                                        return (
                                                            <TableRow key={`${e.day}-${e.openTime}-${index}`}>
                                                                <TableCell>{DAY_TO_WEEKDAY[e.day]}</TableCell>
                                                                <TableCell>{dayjs(record.startDate+e.openTime).format("hh:mm A")}</TableCell>
                                                                <TableCell>{e.duration} mins</TableCell>
                                                                <TableCell>{GENDERS[e.gender]}</TableCell>
                                                                <TableCell>{e.spots}</TableCell>
                                                                <TableCell>
                                                                    {e.instructors?.map((instructor) => (
                                                                        <Link key={instructor.id} component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(instructor.id)} underline={'none'}>{instructor.fullName}</Link>
                                                                    )).reduce((prev, curr) => [prev, ", ", curr])}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })
                                                }
                                            </TableBody>
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

export default ViewGymClassSchedule
