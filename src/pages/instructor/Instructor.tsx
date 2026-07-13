import { useEffect, useState, useContext } from 'react';
import {
    Card,
    Box,
    CardContent,
    TextField,
    InputLabel,
    FormControl,
    Chip,
    TableFooter,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { constants, GENDERS, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES } from '../../utils/constants';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import { getAuthGym, hasPermission } from '../../utils/permissions';
import { GetGyms } from '../../services/gym.service';
import { GetInstructors } from '../../services/instructor.service';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import SearchForm from '../../components/SearchForm';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import { AdminContext } from '../../hooks/AdminContext';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import InstructorCard from './InstructorCard';

function Instructor() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const adminContext = useContext(AdminContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [gyms, setGyms] = useState([]);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(
        adminContext.admin.role.name.toLowerCase()
    );
    const [defaultGymId, setDefaultGymId] = useState(
        gymSelection ? {} : { value: getAuthGym(), label: '' }
    );
    const btn = {
        to: ROUTES.INSTRUCTOR.CREATE,
        label: 'Create Instructor',
        show: hasPermission(PERMISSIONS.INSTRUCTOR.UPSERT),
    };

    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const [searchText, setSearchText] = useState('');
    const columns = [
        { id: 'fullName', label: 'Name', minWidth: 170 },
        { id: 'phone', label: 'Phone', minWidth: 170 },
        { id: 'gender', label: 'Gender', minWidth: 170 },
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

    const handleGymChange = (event: any, value: { value: string; label: string } | null) => {
        setDefaultGymId(value);
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params = { searchText, status, gymId: defaultGymId.value };
        GetInstructors({ page: page + 1 }, params)
            .then((instructors: any) => {
                const { list, paging: nextPaging } = instructors;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    fullName: e.fullName,
                    phone: e.phone,
                    gender: GENDERS[e.gender],
                    status: (
                        <Chip
                            label={e.status}
                            color={e.status === GLOBAL_STATUSES.ACTIVE ? 'success' : 'default'}
                        />
                    ),
                    actions: (
                        <>
                            <IconButton component={NavLink} to={ROUTES.INSTRUCTOR.VIEW(e.id)} color="info">
                                <VisibilityIcon />
                            </IconButton>
                            {hasPermission(PERMISSIONS.INSTRUCTOR.UPSERT) ? (
                                <IconButton component={NavLink} color="warning" to={ROUTES.INSTRUCTOR.EDIT(e.id)}>
                                    <ModeEditIcon />
                                </IconButton>
                            ) : null}
                            {hasPermission(PERMISSIONS.PT_COMMISSION.VIEW) ? (
                                <IconButton component={NavLink} color="primary" to={ROUTES.PT_COMMISSION.VIEW(e.id)}>
                                    <AltRouteIcon />
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
        breadcrumbContext.setBreadcrumb([{ name: 'Instructors' }]);
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
    }, [page, status, searchText, defaultGymId]);

    return (
        <>
            <PageTitle title="Instructors" to={ROUTES.INSTRUCTOR.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Instructors" />
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
                                        <InstructorCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No instructors found
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

export default Instructor;
