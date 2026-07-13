import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import {
    GLOBAL_STATUSES,
    constants,
    GENDERS,
    ROUTES,
    ROLE,
    CUSTOMER_TABS,
    GENDER_NAMES,
} from '../../utils/constants';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import { getAuthGym } from '../../utils/permissions';
import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchForm from '../../components/SearchForm';
import Autocomplete from '@mui/material/Autocomplete';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import { GetCustomers } from '../../services/customer.service';
import { NavLink } from 'react-router-dom';
import { GetGyms } from '../../services/gym.service';
import { startCase, toLower } from 'lodash';
import { AdminContext } from '../../hooks/AdminContext';
import CustomerCard from './CustomerCard';

function Customer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext = useContext(AdminContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [gyms, setGyms] = useState([]);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(
        adminContext.admin.role.name.toLowerCase()
    );
    const [defaultGymId, setDefaultGymId] = useState(
        gymSelection ? {} : { value: getAuthGym(), label: '' }
    );
    const [gender, setGender] = useState('');
    const [membershipStatus, setMembershipStatus] = useState('');
    const columns = [
        { id: 'fullName', label: 'Name', minWidth: 170 },
        { id: 'customerCode', label: 'Customer Code', minWidth: 140 },
        { id: 'phone', label: 'Phone', minWidth: 120 },
        { id: 'gender', label: 'Gender', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ];

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleGymChange = (event: any, value: { value: string; label: string } | null) => {
        setDefaultGymId(value);
    };

    const handleGenderChange = (event) => {
        setGender(event.target.value);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleMembershipStatusChange = (event) => {
        setMembershipStatus(event.target.value);
        setPage(0);
    };

    const fetchGyms = () => {
        GetGyms({ limit: 0 }, { status: GLOBAL_STATUSES.ACTIVE })
            .then((brands: any) => {
                const { list } = brands;
                const nextGyms = list.map((e: any) => ({ value: e.id, label: e.name }));
                setGyms(nextGyms);
                if (nextGyms.length > 0) {
                    setDefaultGymId(nextGyms[0]);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Customers' }]);
    }, []);

    useEffect(() => {
        if (gymSelection) {
            fetchGyms();
        }
    }, []);

    useEffect(() => {
        if (defaultGymId?.value) {
            fetchRows();
        }
    }, [page, searchText, gender, defaultGymId, membershipStatus]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params = {
            searchText,
            gymId: defaultGymId.value,
            gender: gender || undefined,
            membershipStatus: membershipStatus || undefined,
        };
        GetCustomers({ page: page + 1 }, params)
            .then((customers: any) => {
                const { list, paging: nextPaging } = customers;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    fullName: e.fullName,
                    customerCode: e.customerCode,
                    phone: e.phoneNumber ? e.phone : '-',
                    gender: e?.gender ? startCase(toLower(e?.gender?.replace(/_/g, ' '))) : '-',
                    membershipStatus: e?.membershipStatus
                        ? startCase(toLower(e?.membershipStatus?.replace(/_/g, ' ')))
                        : '-',
                    actions: (
                        <>
                            <IconButton
                                component={NavLink}
                                to={ROUTES.CUSTOMER.TAB(e.id, CUSTOMER_TABS.DETAILS)}
                                color="info"
                            >
                                <VisibilityIcon />
                            </IconButton>
                            <IconButton component={NavLink} color="warning" to={ROUTES.CUSTOMER.EDIT(e.id)}>
                                <ModeEditIcon />
                            </IconButton>
                        </>
                    ),
                }));
                setRows(nextRows);
                setPaging(nextPaging);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return (
        <>
            <PageTitle title="Customers" />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Customers" />
                        </Grid>
                        {gymSelection ? (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Autocomplete
                                    id="gyms-dd"
                                    options={gyms}
                                    getOptionLabel={(option) => option.label || ''}
                                    onChange={handleGymChange}
                                    value={defaultGymId}
                                    disableClearable
                                    renderInput={(params) => (
                                        <TextField
                                            disabled={!gyms.length}
                                            variant="standard"
                                            {...params}
                                            label="Gym"
                                        />
                                    )}
                                />
                            </Grid>
                        ) : null}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select label="Gender" onChange={handleGenderChange} value={gender}>
                                    {Object.entries(GENDERS).map(([key, value]) => (
                                        <MenuItem selected={gender === value} value={value} key={key}>
                                            {GENDER_NAMES[value]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box>
                        {isMobile ? (
                            <>
                                <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                                    {rows.map((row) => (
                                        <CustomerCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No customers found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    style={{ minWidth: column.minWidth }}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow hover key={row.id} sx={{ opacity: loading ? 0.2 : 1 }}>
                                                {columns.map((column) => (
                                                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                        <TableSpinner
                                            loading={loading}
                                            colSpan={columns.length}
                                            rowCount={rows.length}
                                        />
                                        <NoRowsFound
                                            loading={loading}
                                            colSpan={columns.length}
                                            rowCount={rows.length}
                                        />
                                    </TableBody>
                                    <TableFooter>
                                        {loading ? (
                                            <TableSpinner loading colSpan={columns.length} rowCount={rows.length} />
                                        ) : null}
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            component="div"
                            count={paging.totalResultCount}
                            rowsPerPage={constants.PER_PAGE}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPageOptions={[]}
                        />
                    </Box>
                </CardContent>
            </Card>
        </>
    );
}

export default Customer;
