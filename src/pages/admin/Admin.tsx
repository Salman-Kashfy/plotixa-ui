import {useEffect, useState, useContext, Fragment} from 'react'
import {Card, Box, CardContent, InputLabel, FormControl, Chip, TextField, Stack, useTheme, useMediaQuery, CircularProgress} from '@mui/material';
import {MenuItem, Table, TableBody, TableFooter, TableCell, TableContainer, TableHead, TablePagination, TableRow} from '@mui/material';
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {ROUTES, GLOBAL_STATUSES, constants, PERMISSIONS, ROLE} from "../../utils/constants";
import Grid from "@mui/material/Grid2";
import Select from "@mui/material/Select";
import {GetAdmins} from "../../services/admin.service";
import TableSpinner from "../../components/TableSpinner";
import SearchForm from "../../components/SearchForm";
import PageTitle from "../../components/PageTitle";
import {getAuthGym, hasPermission} from "../../utils/permissions";
import NoRowsFound from "../../components/NoRowsFound";
import {first} from "lodash";
import {AdminContext} from "../../hooks/AdminContext";
import Autocomplete from "@mui/material/Autocomplete";
import {GetGyms} from "../../services/gym.service";
import IconButton from "@mui/material/IconButton";
import {NavLink} from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {GetRoles} from "../../services/role.service";
import FormInput from "../../components/FormInput";
import ListingCard from "../../components/ListingCard";

function Admin() {
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
    const [roleLoader, setRoleLoader] = useState(false);
    const [roles, setRoles] = useState([]);
    const [roleId, setRoleId] = useState({});

    const btn = {
        to: ROUTES.ADMIN.CREATE,
        label: 'Create Admin',
        show: hasPermission(PERMISSIONS.ADMIN.UPSERT),
    }

    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const [searchText, setSearchText] = useState('');
    const columns = [
        { id: 'fullName', label: 'Name', minWidth: 170 },
        { id: 'phone', label: 'Phone', minWidth: 170 },
        { id: 'gym', label: 'Gym', minWidth: 100 },
        { id: 'role', label: 'Role', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 100 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const handleRoleChange = (event: any, value: { value: string, label: string } | null) => {
        setRoleId(value);
        setPage(0);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultGymId(value)
        setPage(0);
    }

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { searchText, status, gymId: defaultGymId?.value, roleId: roleId?.value }
        if(!status) delete params.status
        GetAdmins({page:page+1}, params).then((brands:any) => {
            const { list, paging } = brands
            const rows = list.map((e:any) => {
                return {
                    id: e.id,
                    fullName: e.fullName,
                    phone: e.phone,
                    gym: e?.gyms.length ? first(e.gyms).name : '*',
                    role: first(e.roles).name,
                    status: <Chip label={e.status} color={ e.status === GLOBAL_STATUSES.ACTIVE ? 'success' : '' } />,
                    actions: <>
                        <IconButton component={NavLink} to={ROUTES.ADMIN.VIEW(e.id)} color={'info'}>
                            <VisibilityIcon/>
                        </IconButton>
                        { hasPermission(PERMISSIONS.ADMIN.UPSERT) ?
                            <IconButton component={NavLink} color={'warning'} to={ROUTES.ADMIN.EDIT(e.id)}>
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
        }).catch((e) => {
            setLoading(false)
        })
    }

    const fetchGyms = () => {
        GetGyms({limit:0}).then((brands:any) => {
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

    const fetchRoles = () => {
        setRoleLoader(true)
        GetRoles().then(({list}:any) => {
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setRoles(rows)
            setRoleLoader(false)
        }).catch((e) => {
            setRoleLoader(false)
            console.log(e.message)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Admins' }])
    }, []);

    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
        fetchRoles()
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }
    }, [page, status, searchText, defaultGymId, roleId]);

    return (
        <>
            <PageTitle title={'Admins'} to={ROUTES.ADMIN.CREATE} btn={btn}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <SearchForm callback={handleSearch} label={'Search Admins'}/>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Autocomplete
                                id="roles-dd"
                                options={roles}
                                getOptionLabel={(option) => option.label || ''}
                                value={roleId}
                                loading={roleLoader}
                                onChange={handleRoleChange}
                                renderInput={(params) => <FormInput fullWidth={true} disabled={!roles.length} label={'Role'} params={params}
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Fragment>
                                                    {roleLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </Fragment>
                                            ),
                                        },
                                    }}
                                />}
                            />
                        </Grid>
                        {
                            gymSelection ?
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value={''}>Any</MenuItem>
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
                                        No admins found
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
export default Admin
