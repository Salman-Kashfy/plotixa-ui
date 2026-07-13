import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { constants, PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import { getAuthBrand, hasPermission, hasRole } from '../../utils/permissions';
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
import { GetMembershipPlanGroups } from '../../services/membership.plan.group.service';
import { NavLink } from 'react-router-dom';
import { GetBrands } from '../../services/brand.service';
import { AdminContext } from '../../hooks/AdminContext';
import ListingCard from '../../components/ListingCard';

function MembershipPlanGroup() {
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
    const btn = {
        to: ROUTES.MEMBERSHIP_PLAN_GROUP.CREATE,
        label: 'Create Plan Group',
        show: hasPermission(PERMISSIONS.MEMBERSHIP_PLAN_GROUP.UPSERT),
    };
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Plan Groups' }]);
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
    }, [page, searchText, defaultBrandId]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params = { searchText, brandId: defaultBrandId?.value };
        GetMembershipPlanGroups({ page: page + 1 }, params)
            .then((services: any) => {
                const { list, paging: nextPaging } = services;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    actions: (
                        <>
                            <IconButton
                                component={NavLink}
                                to={ROUTES.MEMBERSHIP_PLAN_GROUP.VIEW(e.id)}
                                color="info"
                            >
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.MEMBERSHIP_PLAN_GROUP.UPSERT) ? (
                                <IconButton
                                    component={NavLink}
                                    color="warning"
                                    to={ROUTES.MEMBERSHIP_PLAN_GROUP.EDIT(e.id)}
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
            <PageTitle title="Plan Groups" to={ROUTES.MEMBERSHIP_PLAN_GROUP.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Plan Groups" />
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
                                        No plan groups found
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

export default MembershipPlanGroup;
