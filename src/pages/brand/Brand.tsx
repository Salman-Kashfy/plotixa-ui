import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ROUTES, GLOBAL_STATUSES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import {
    Card,
    Box,
    CardContent,
    InputLabel,
    FormControl,
    Chip,
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
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import { GetBrands } from '../../services/brand.service';
import TableSpinner from '../../components/TableSpinner';
import SearchForm from '../../components/SearchForm';
import PageTitle from '../../components/PageTitle';
import NoRowsFound from '../../components/NoRowsFound';
import BrandCard from './BrandCard';

function Brand() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const btn = {
        to: ROUTES.BRAND.CREATE,
        label: 'Create Brand',
        show: hasPermission(PERMISSIONS.BRAND.CREATE),
    };

    const [status, setStatus] = useState('');
    const [searchText, setSearchText] = useState('');
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'country', label: 'Country', minWidth: 170 },
        { id: 'gymCount', label: 'Gyms', minWidth: 100 },
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

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: { searchText: string; status?: string } = { searchText, status };
        if (!status) delete params.status;
        GetBrands({ page: page + 1 }, params)
            .then((brands: any) => {
                const { list, paging: nextPaging } = brands;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    country: e.country.name,
                    gymCount: Number(e.gyms.length) || 0,
                    status: (
                        <Chip
                            label={e.status}
                            color={e.status === GLOBAL_STATUSES.ACTIVE ? 'success' : 'default'}
                        />
                    ),
                    actions: (
                        <>
                            <IconButton component={NavLink} to={ROUTES.BRAND.VIEW(e.id)} color="info">
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.BRAND.UPDATE) ? (
                                <>
                                    <IconButton component={NavLink} to={ROUTES.BRAND.EDIT(e.id)} color="warning">
                                        <ModeEditIcon />
                                    </IconButton>
                                    <IconButton component={NavLink} to={ROUTES.BRAND.ACTIVATION(e.id)} color="primary">
                                        <EditLocationAltIcon />
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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Brands' }]);
    }, []);

    useEffect(() => {
        fetchRows();
    }, [page, status, searchText]);

    return (
        <>
            <PageTitle title="Brands" to={ROUTES.BRAND.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <SearchForm callback={handleSearch} label="Search Brands" />
                        </Grid>
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
                                        <BrandCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No brands found
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

export default Brand;
