import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { constants, PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import { getAuthBrand, hasPermission } from '../../utils/permissions';
import {
    Box,
    Card,
    CardContent,
    Chip,
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
import { GetServices } from '../../services/service.service';
import { NavLink } from 'react-router-dom';
import { GetBrands } from '../../services/brand.service';
import { AdminContext } from '../../hooks/AdminContext';
import ServiceCard from './ServiceCard';

function Service() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext = useContext(AdminContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [isBookable, setIsBookable] = useState('');
    const [searchText, setSearchText] = useState('');
    const [brands, setBrands] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultBrandId, setDefaultBrandId] = useState(
        brandSelection ? {} : { value: getAuthBrand(), label: '' }
    );
    const btn = {
        to: ROUTES.SERVICE.CREATE,
        label: 'Create Service',
        show: hasPermission(PERMISSIONS.SERVICE.UPSERT),
    };
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'serviceType', label: 'Type', minWidth: 100 },
        { id: 'totalCost', label: 'Total Cost', minWidth: 120 },
        { id: 'servicePack', label: 'Service Pack', minWidth: 120 },
        { id: 'isBookable', label: 'Booking Status', minWidth: 120 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ];

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleBrandChange = (event: any, value: { value: string; label: string } | null) => {
        setDefaultBrandId(value);
    };

    const handleIsBookableChange = (e) => {
        setIsBookable(e.target.value);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const fetchBrands = () => {
        GetBrands({ limit: 0 })
            .then((brands: any) => {
                const { list } = brands;
                const nextBrands = list.map((e: any) => ({ value: e.id, label: e.name }));
                setBrands(nextBrands);
                if (nextBrands.length > 0) {
                    setDefaultBrandId(nextBrands[0]);
                }
            })
            .catch((e) => {
                console.log(e.message);
            });
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Services' }]);
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
    }, [page, isBookable, searchText, defaultBrandId]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params = {
            searchText,
            brandId: defaultBrandId.value,
            isBookable: isBookable ? isBookable === 'true' : undefined,
        };
        GetServices({ page: page + 1 }, params)
            .then((services: any) => {
                const { list, paging: nextPaging } = services;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    serviceType: e.serviceType.replace('_SESSION', ''),
                    totalCost: e.brand.country.currency.symbol + e.totalCost,
                    servicePack: <Chip label={e.servicePack ? 'Yes' : 'No'} />,
                    isBookable: <Chip label={e.isBookable ? 'Open' : 'Close'} />,
                    actions: (
                        <>
                            <IconButton component={NavLink} to={ROUTES.SERVICE.VIEW(e.id)} color="info">
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.SERVICE.UPSERT) ? (
                                <IconButton component={NavLink} color="warning" to={ROUTES.SERVICE.EDIT(e.id)}>
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
            <PageTitle title="Services" to={ROUTES.SERVICE.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Services" />
                        </Grid>
                        {brandSelection ? (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Booking Status</InputLabel>
                                <Select label="Booking Status" onChange={handleIsBookableChange} value={isBookable}>
                                    <MenuItem value="">ANY</MenuItem>
                                    <MenuItem value="true">Open</MenuItem>
                                    <MenuItem value="false">Close</MenuItem>
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
                                        <ServiceCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No services found
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

export default Service;
