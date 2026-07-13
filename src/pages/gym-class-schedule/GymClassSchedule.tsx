import {useEffect, useState, useContext} from 'react'
import {
    Card,
    Box,
    CardContent,
    TextField,
    InputLabel,
    FormControl,
    TableFooter,
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from '@mui/material';
import {MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow} from '@mui/material';
import {NavLink} from "react-router-dom";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {constants, DAY_TO_WEEKDAY, GENDERS, GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import {getAuthGym, hasPermission} from "../../utils/permissions";
import {GetGyms} from "../../services/gym.service";
import {GetGymClassSchedules} from "../../services/class.schedule.service";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PageTitle from "../../components/PageTitle";
import SearchForm from "../../components/SearchForm";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {AdminContext} from "../../hooks/AdminContext";
import dayjs from "dayjs";
import ListingCard from "../../components/ListingCard";

function GymClassSchedule() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [gyms, setGyms] = useState([]);
    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultGymId, setDefaultGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const btn = {
        to: ROUTES.CLASS_SCHEDULE.CREATE,
        label: 'Create Class Schedule',
        show: hasPermission(PERMISSIONS.CLASS_SCHEDULE.UPSERT),
    }

    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const [searchText, setSearchText] = useState('');
    const columns = [
        { id: 'className', label: 'Class', minWidth: 170 },
        { id: 'schedule', label: 'Schedule', minWidth: 170 },
        { id: 'dateRange', label: 'Date Range', minWidth: 170 },
        { id: 'gender', label: 'Gender', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]

    const handleChangePage = (event: unknown, newPage: number) => {
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

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultGymId(value)
    }

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { searchText, status, gymId: defaultGymId.value }
        if(!status) delete params.status
        GetGymClassSchedules({page:page+1}, params).then((records:any) => {
            const { list, paging } = records
            const rows = list.map((e:any) => {
                return {
                    id: e.id,
                    className: e.gymClass.name,
                    schedule: e?.schedule.map((e) => DAY_TO_WEEKDAY[e.day].substring(0, 3)).join(', '),
                    dateRange: e.startDate === e.endDate ? dayjs(e.startDate).format("MMM DD, YYYY") : `${dayjs(e.startDate).format("MMM DD, YYYY")} - ${dayjs(e.endDate).format("MMM DD, YYYY")}`,
                    gender: GENDERS[e.gender] || 'Any',
                    actions: <>
                        <IconButton component={NavLink} to={ROUTES.CLASS_SCHEDULE.VIEW(e.id)} color={'info'}>
                            <VisibilityIcon/>
                        </IconButton>
                        { hasPermission(PERMISSIONS.CLASS_SCHEDULE.UPSERT) ?
                            <IconButton component={NavLink} color={'warning'} to={ROUTES.CLASS_SCHEDULE.EDIT(e.id)} disabled={!!parseInt(e.orderCount)}>
                                <ModeEditIcon/>
                            </IconButton>
                            : <></>
                        }
                    </>
                }
            })
            setRows(rows)
            setPaging(paging)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }

    const fetchGyms = () => {
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then((brands:any) => {
            const { list } = brands
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setGyms(rows)
            if(rows.length>0){
                setDefaultGymId(rows[0])
            }
        }).catch((e) => {
            console.log(e.message)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Class Schedules' }])
    }, []);

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }
    }, [page, status, searchText, defaultGymId]);

    return (
        <>
            <PageTitle title={'Class Schedules'} to={ROUTES.CLASS_SCHEDULE.CREATE} btn={btn}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <SearchForm callback={handleSearch} label={'Search Class Schedule'}/>
                        </Grid>
                        {
                            gymSelection ?
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Autocomplete
                                        id="gyms-dd"
                                        options={gyms}
                                        getOptionLabel={(option) => option.label || ''}
                                        onChange={handleGymChange}
                                        value={defaultGymId}
                                        disableClearable
                                        renderInput={(params) => <TextField disabled={!gyms.length} variant="standard" {...params} label="Gym" />}
                                    />
                                </Grid>
                                : <></>
                        }
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value={''}>ANY</MenuItem>
                                    { Object.keys(GLOBAL_STATUSES).map((key:string) => {
                                        return (<MenuItem selected={status === key} value={key} key={key}>{key}</MenuItem>)
                                    }) }
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{p:3}}>
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
                                        No class schedules found
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
                                                    align={column?.align}
                                                    style={{ minWidth: column.minWidth }}>
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody >
                                        <>
                                            {rows
                                                .map((row) => {
                                                    return (
                                                        <TableRow hover role="checkbox" key={row.id} sx={{opacity: loading ? 0.2 : 1 }}>
                                                            {columns.map((column) => {
                                                                const value = row[column.id];
                                                                return (
                                                                    <TableCell key={column.id} align={column.align}>{value}</TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    );
                                                })
                                            }
                                            <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                            <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length}/>
                                        </>
                                    </TableBody>
                                    <TableFooter>
                                        {loading ? <TableSpinner colSpan={columns.length}/> : <></>}
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
    )
}

export default GymClassSchedule
