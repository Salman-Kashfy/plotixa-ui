import { useEffect, useState, useContext } from 'react';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import {
    GLOBAL_STATUSES,
    constants,
    GENDERS,
    GENDER_NAMES,
    LEAD_STATUS,
    PERMISSIONS,
    ROUTES,
    LEAD_SOURCE,
    LEAD_TYPE,
    ROLE,
} from '../../utils/constants';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PageTitle from '../../components/PageTitle';
import { getAuthGym, hasPermission } from '../../utils/permissions';
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
    Chip,
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
import { GetLeads } from '../../services/lead.service';
import { NavLink } from 'react-router-dom';
import { GetGyms } from '../../services/gym.service';
import { AdminContext } from '../../hooks/AdminContext';
import LeadCard from './LeadCard';

function Lead() {
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
    const [leadStatus, setLeadStatus] = useState('');
    const [gender, setGender] = useState('');
    const [leadSource, setLeadSource] = useState('');
    const [leadType, setLeadType] = useState('');
    const btn = {
        to: ROUTES.LEAD.CREATE,
        label: 'Create Lead',
        show: hasPermission(PERMISSIONS.LEAD.UPSERT),
    };
    const columns = [
        { id: 'fullName', label: 'Name', minWidth: 170 },
        { id: 'phone', label: 'Phone' },
        { id: 'gender', label: 'Gender' },
        { id: 'leadType', label: 'Lead Type' },
        { id: 'source', label: 'Source' },
        { id: 'leadStatus', label: 'Lead Status' },
        { id: 'actions', label: 'Action' },
    ];

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleGymChange = (event: any, value: { value: string; label: string } | null) => {
        setDefaultGymId(value);
    };

    const handleLeadStatusChange = (event) => {
        setLeadStatus(event.target.value);
        setPage(0);
    };

    const handleGenderChange = (event) => {
        setGender(event.target.value);
        setPage(0);
    };

    const handleLeadSourceChange = (event) => {
        setLeadSource(event.target.value);
        setPage(0);
    };

    const handleLeadTypeChange = (event) => {
        setLeadType(event.target.value);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
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
        breadcrumbContext.setBreadcrumb([{ name: 'Leads' }]);
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
    }, [page, searchText, leadStatus, gender, leadSource, leadType, defaultGymId]);

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params = {
            searchText,
            gymId: defaultGymId.value,
            leadStatus: leadStatus || undefined,
            gender: gender || undefined,
            leadSource: leadSource || undefined,
            leadType: leadType || undefined,
        };
        GetLeads({ page: page + 1 }, params)
            .then((leads: any) => {
                const { list, paging: nextPaging } = leads;
                const nextRows = list.map((e: any) => ({
                    id: e.id,
                    fullName: e.fullName,
                    phone: e.phoneNumber ? e.phone : '-',
                    gender: e?.gender ? GENDER_NAMES[e.gender] : '-',
                    leadType: e?.leadType ? LEAD_TYPE[e.leadType] : '-',
                    source: e?.source ? LEAD_SOURCE[e.source] : '-',
                    leadStatus: (
                        <Chip
                            label={e.leadStatus}
                            color={e.leadStatus === LEAD_STATUS.HOT ? 'error' : 'primary'}
                        />
                    ),
                    actions: (
                        <>
                            <IconButton component={NavLink} to={ROUTES.LEAD.VIEW(e.id)} color="info">
                                <VisibilityIcon />
                            </IconButton>
                            <IconButton component={NavLink} color="warning" to={ROUTES.LEAD.EDIT(e.id)}>
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
            <PageTitle title="Leads" to={ROUTES.LEAD.CREATE} btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label="Search Leads" />
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
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Lead Status</InputLabel>
                                <Select label="Status" onChange={handleLeadStatusChange} value={leadStatus}>
                                    <MenuItem value="">ANY</MenuItem>
                                    {Object.keys(LEAD_STATUS).map((key: string) => (
                                        <MenuItem selected={leadStatus === key} value={key} key={key}>
                                            {key}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Lead Type</InputLabel>
                                <Select label="Lead Type" onChange={handleLeadTypeChange} value={leadType}>
                                    <MenuItem value="">Any</MenuItem>
                                    {Object.keys(LEAD_TYPE).map((key: string) => (
                                        <MenuItem selected={leadType === key} value={key} key={key}>
                                            {LEAD_TYPE[key]}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Lead Source</InputLabel>
                                <Select label="Lead Source" onChange={handleLeadSourceChange} value={leadSource}>
                                    <MenuItem value="">Any</MenuItem>
                                    {Object.keys(LEAD_SOURCE).map((key: string) => (
                                        <MenuItem selected={leadSource === key} value={key} key={key}>
                                            {LEAD_SOURCE[key]}
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
                                        <LeadCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No leads found
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

export default Lead;
