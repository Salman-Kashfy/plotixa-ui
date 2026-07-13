import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { constants, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import { getAuthBrand, hasPermission, hasRole } from '../../utils/permissions';
import {
    Box,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
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
import { GetPaymentPlans } from '../../services/payment.plan.service';
import { NavLink } from 'react-router-dom';
import { GetBrands } from '../../services/brand.service';
import Select from '@mui/material/Select';
import { AdminContext } from '../../hooks/AdminContext';
import ListingCard from '../../components/ListingCard';

function PaymentPlan() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext = useContext(AdminContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultBrandId, setDefaultBrandId] = useState(
        brandSelection ? {} : { value: getAuthBrand(), label: '' }
    );
    const [brands, setBrands] = useState([]);
    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const btn = {
        to: ROUTES.PAYMENT_PLAN.CREATE,
        label: 'Create Payment Plan',
        show: hasPermission(PERMISSIONS.PAYMENT_PLAN.UPSERT),
    };
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'membershipPlan', label: 'Membership Plan', minWidth: 170 },
        { id: 'price', label: 'Price', minWidth: 170 },
        { id: 'planGroup', label: 'Plan Group', minWidth: 170 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ];

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleBrandChange = (
        _event: any,
        value: { value: string; label: string; countryId: string } | null
    ) => {
        if (hasRole(ROLE.SUPER_ADMIN)) {
            setDefaultBrandId({ label: value?.label, value: value?.value });
        }
    };

    const fetchBrands = () => {
        GetBrands({ limit: 0 })
            .then(({ list }: any) => {
                const nextBrands = list.map((e: any) => ({
                    value: e.id,
                    label: e.name,
                    countryId: e.country.id,
                }));
                setBrands(nextBrands);
                if (nextBrands.length > 0) {
                    setDefaultBrandId(nextBrands[0]);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Payment Plans' }]);
    }, []);

    useEffect(() => {
        if (brandSelection) {
            fetchBrands();
        }
    }, []);

    useEffect(() => {
        if (defaultBrandId?.value) {
            fetchRows();
        }
    }, [page, status, searchText, defaultBrandId]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: { searchText: string; status?: string; brandId?: string } = {
            searchText,
            status,
            brandId: defaultBrandId?.value,
        };
        if (!status) delete params.status;
        GetPaymentPlans({ page: page + 1 }, params)
            .then((membershipPlans: any) => {
                const { list, paging: nextPaging } = membershipPlans;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    membershipPlan: e.membershipPlan.name,
                    price: e.membershipPlan.group.brand.country.currency.symbol + e.price,
                    planGroup: e.membershipPlan.group.name,
                    actions: (
                        <>
                            <IconButton
                                component={NavLink}
                                to={ROUTES.PAYMENT_PLAN.VIEW(e.id)}
                                color="info"
                            >
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.PAYMENT_PLAN.UPSERT) ? (
                                <IconButton
                                    component={NavLink}
                                    color="warning"
                                    to={ROUTES.PAYMENT_PLAN.EDIT(e.id)}
                                >
                                    <ModeEditIcon />
                                </IconButton>
                            ) : null}
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
            <PageTitle title="Payment Plans" to={ROUTES.PAYMENT_PLAN.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Payment Plans" />
                        </Grid>
                        {brandSelection ? (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Autocomplete
                                    id="brands-dd"
                                    options={brands}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={defaultBrandId}
                                    onChange={handleBrandChange}
                                    disableClearable
                                    renderInput={(params) => (
                                        <TextField
                                            disabled={!brands.length}
                                            variant="standard"
                                            {...params}
                                            label="Brand"
                                        />
                                    )}
                                />
                            </Grid>
                        ) : null}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value="">ANY</MenuItem>
                                    {Object.keys(GLOBAL_STATUSES).map((key: string) => (
                                        <MenuItem selected={status === key} value={key} key={key}>
                                            {key}
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
                                        <ListingCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No payment plans found
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
                                            <TableSpinner
                                                loading
                                                colSpan={columns.length}
                                                rowCount={rows.length}
                                            />
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

export default PaymentPlan;
