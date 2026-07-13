import { useEffect, useState, useContext } from 'react';
import {
    Card,
    Box,
    CardContent,
    InputLabel,
    FormControl,
    Chip,
    Autocomplete,
    TextField,
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
    MenuItem,
    Table,
    TableBody,
    TableFooter,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { NavLink } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ROUTES, GLOBAL_STATUSES, constants, PERMISSIONS, ROLE } from '../../utils/constants';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import { GetGyms } from '../../services/gym.service';
import { GetBrands } from '../../services/brand.service';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import SearchForm from '../../components/SearchForm';
import PageTitle from '../../components/PageTitle';
import { getAuthBrand, hasPermission } from '../../utils/permissions';
import { AdminContext } from '../../hooks/AdminContext';
import GymCard from './GymCard';

function Gym() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext = useContext(AdminContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [brands, setBrands] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultBrandId, setDefaultBrandId] = useState(brandSelection ? {} : { value: getAuthBrand(), label: '' });
    const btn = {
        to: ROUTES.GYM.CREATE,
        label: 'Create Gym',
        show: hasPermission(PERMISSIONS.GYM.CREATE),
    };

    const [status, setStatus] = useState('');
    const [searchText, setSearchText] = useState('');
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'brand', label: 'Brand', minWidth: 170 },
        { id: 'country', label: 'Country', minWidth: 170 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleBrandChange = (event: any, value: { value: string; label: string } | null) => {
        setDefaultBrandId(value);
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: { searchText: string; status?: string; brandId?: string } = {
            searchText,
            status,
            brandId: defaultBrandId.value,
        };
        if (!status) delete params.status;
        GetGyms({ page: page + 1 }, params)
            .then((gyms: any) => {
                const { list, paging: nextPaging } = gyms;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    brand: e.brand.name,
                    country: e.brand.country.name,
                    status: (
                        <Chip
                            label={e.status}
                            color={e.status === GLOBAL_STATUSES.ACTIVE ? 'success' : 'default'}
                        />
                    ),
                    actions: (
                        <>
                            <IconButton component={NavLink} to={ROUTES.GYM.VIEW(e.id)} color="info">
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.GYM.UPDATE) ? (
                                <>
                                    <IconButton component={NavLink} to={ROUTES.GYM.EDIT(e.id)} color="warning">
                                        <ModeEditIcon />
                                    </IconButton>
                                    <IconButton component={NavLink} to={ROUTES.GYM.OPTIONS(e.id)}>
                                        <SettingsSuggestIcon />
                                    </IconButton>
                                </>
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

    const fetchBrands = () => {
        GetBrands({ limit: 0 })
            .then((brands: any) => {
                const { list } = brands;
                const nextBrands = list.map((e: any) => ({ value: e.id, label: e.name }));
                setBrands(nextBrands);
            })
            .catch((e) => {
                console.log(e.message);
            });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Gyms' }]);
    }, []);

    useEffect(() => {
        if (brandSelection) {
            fetchBrands();
        }
    }, []);

    useEffect(() => {
        fetchRows();
    }, [page, status, searchText, defaultBrandId]);

    return (
        <>
            <PageTitle title="Gyms" to={ROUTES.GYM.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <SearchForm callback={handleSearch} label="Search Gyms" />
                        </Grid>
                        {brandSelection ? (
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Autocomplete
                                    id="brands-dd"
                                    options={brands}
                                    getOptionLabel={(option) => option.label || ''}
                                    onChange={handleBrandChange}
                                    value={defaultBrandId}
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
                        <Grid size={{ xs: 12, sm: 3 }}>
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
                                        <GymCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No gyms found
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
                                        <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length} />
                                        <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length} />
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

export default Gym;
