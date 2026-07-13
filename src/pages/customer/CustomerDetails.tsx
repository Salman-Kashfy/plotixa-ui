import { GENDERS, ROUTES } from '../../utils/constants';
import { NavLink } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Link from '@mui/material/Link';
import dayjs from 'dayjs';

function CustomerDetails({ record }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Grid container size={12}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Name
                </Typography>
                <Typography variant="subtitle2">{record.fullName}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Customer Code
                </Typography>
                <Typography variant="subtitle2">{record.customerCode}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Gym
                </Typography>
                <Typography variant="subtitle2">
                    <Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline="none">
                        {record.gym.name}
                    </Link>
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Country
                </Typography>
                <Typography variant="subtitle2">{record.country.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Email
                </Typography>
                <Typography variant="subtitle2">{record.email || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Phone
                </Typography>
                <Typography variant="subtitle2">{record.phone}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Gender
                </Typography>
                <Typography variant="subtitle2">{GENDERS[record.gender]}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    DOB
                </Typography>
                <Typography variant="subtitle2">
                    {record.dob ? dayjs(record.dob).format('MMM DD, YYYY') : '-'}
                </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                    Address
                </Typography>
                <Typography variant="subtitle2">{record.address || '-'}</Typography>
            </Grid>
            {record.isParent && record.linkedCustomers?.length ? (
                <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5 }} color="primary">
                        Child Accounts
                    </Typography>
                    {isMobile ? (
                        <Stack spacing={2}>
                            {record.linkedCustomers.map((e, index) => (
                                <Card key={e.id || index} variant="outlined">
                                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            {e.fullName}
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" color="text.secondary">
                                                Gender: {GENDERS[e.gender]}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                DOB: {dayjs(e.dob).format('MMM DD, YYYY')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Phone: {e.phone || '-'}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant="subtitle2" color="primary">
                                            Name
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" color="primary">
                                            Gender
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" color="primary">
                                            DOB
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" color="primary">
                                            Phone
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {record.linkedCustomers.map((e, index) => (
                                    <TableRow key={e.id || index}>
                                        <TableCell>{e.fullName}</TableCell>
                                        <TableCell>{GENDERS[e.gender]}</TableCell>
                                        <TableCell>{dayjs(e.dob).format('MMM DD, YYYY')}</TableCell>
                                        <TableCell>{e.phone || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Grid>
            ) : null}
        </Grid>
    );
}

export default CustomerDetails;
