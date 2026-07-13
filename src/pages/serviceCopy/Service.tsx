import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {constants, GLOBAL_STATUSES, PERMISSIONS, ROUTES} from "../../utils/constants";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PageTitle from "../../components/PageTitle";
import {hasPermission} from "../../utils/permissions";
import {Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, FormControl, InputLabel, Select, MenuItem  } from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchForm from "../../components/SearchForm";
import Autocomplete from "@mui/material/Autocomplete";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {GetServices} from "../../services/service.service";
import {NavLink} from "react-router-dom";
import {GetGyms} from "../../services/gym.service";

function Service() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [gyms, setGyms] = useState([]);
    const [defaultGymId, setDefaultGymId] = useState({});
    const [status, setStatus] = useState(GLOBAL_STATUSES.ACTIVE);
    const btn = {
        to: ROUTES.SERVICE.CREATE,
        label: 'Create Service',
        show: hasPermission(PERMISSIONS.SERVICE.UPSERT),
    }
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'serviceType', label: 'Type', minWidth: 170 },
        { id: 'totalCost', label: 'Total Cost', minWidth: 170 },
        { id: 'servicePack', label: 'Service Pack', minWidth: 170 },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultGymId(value)
    }

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    }

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Services' }])
    }, []);

    useEffect(() => {
        fetchGyms()
    }, []);

    useEffect(() => {
        if(defaultGymId?.value){
            fetchRows()
        }
    }, [page, status, searchText, defaultGymId]);

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { searchText, gymId: defaultGymId.value, status }
        if(!status) delete params.status
        GetServices({page:page+1}, params).then((services:any) => {
            const { list, paging } = services
            const rows = list.map((e:any) => {
                return {
                    name: e.name,
                    serviceType: e.serviceType.replace('_SESSION',''),
                    totalCost: e.gym.brand.country.currency.symbol+e.totalCost,
                    servicePack: <Chip label={e.servicePack ? 'Yes' : 'No'}/>,
                    actions: <>
                        <IconButton component={NavLink} to={ROUTES.SERVICE.LIST} color={'primary'}>
                            <VisibilityIcon/>
                        </IconButton>
                        <IconButton component={NavLink} to={ROUTES.SERVICE.EDIT(e.id)}>
                            <ModeEditIcon/>
                        </IconButton>
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

    return (
        <>
            <PageTitle title={'Services'} to={ROUTES.SERVICE.CREATE} btn={btn}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        <Grid size={3}>
                            <SearchForm callback={handleSearch} label={'Search Services'}/>
                        </Grid>
                        <Grid size={3}>
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
                        <Grid size={3}>
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
                                                    <TableRow hover role="checkbox" key={Math.random()} sx={{opacity: loading ? 0.2 : 1 }}>
                                                        {columns.map((column) => {
                                                            const value = row[column.id];
                                                            return (
                                                                <TableCell key={Math.random()} align={column.align}>{value}</TableCell>
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

export default Service
