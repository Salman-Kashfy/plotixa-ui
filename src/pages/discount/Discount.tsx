import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {
    constants,
    DISCOUNT_TYPE,
    DISCOUNT_ON,
    DISCOUNT_STATUSES,
    PERMISSIONS,
    ROLE,
    ROUTES
} from "../../utils/constants";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PageTitle from "../../components/PageTitle";
import {getAuthBrand, hasPermission} from "../../utils/permissions";
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
    Stack,
    useTheme,
    useMediaQuery,
    CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchForm from "../../components/SearchForm";
import Autocomplete from "@mui/material/Autocomplete";
import TableSpinner from "../../components/TableSpinner";
import NoRowsFound from "../../components/NoRowsFound";
import {GetDiscounts} from "../../services/discount.service";
import {NavLink} from "react-router-dom";
import {GetBrands} from "../../services/brand.service";
import {AdminContext} from "../../hooks/AdminContext";
import dayjs from "dayjs";
import {startCase,toLower} from "lodash";
import ListingCard from "../../components/ListingCard";

function Discount() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({totalPages: 0, totalResultCount: 0})
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [discountOn, setDiscountOn] = useState('');
    const [discountType, setDiscountType] = useState('');
    const [brands, setBrands] = useState([]);
    const brandSelection = [ROLE.SUPER_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [defaultBrandId, setDefaultBrandId] = useState(brandSelection ? {} : {value: getAuthBrand(), label: ''});
    const btn = {
        to: ROUTES.DISCOUNT.CREATE,
        label: 'Create Discount',
        show: hasPermission(PERMISSIONS.DISCOUNT.UPSERT),
    }
    const [status, setStatus] = useState(DISCOUNT_STATUSES.ACTIVE);
    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'dateRange', label: 'Date Range', minWidth: 170 },
        { id: 'discountOn', label: 'Discount On' },
        { id: 'discountType', label: 'Discount Type', },
        { id: 'discount', label: 'Discount', minWidth: 100 },
        { id: 'discountCap', label: 'Cap' },
        { id: 'actions', label: 'Action', minWidth: 100 },
    ]

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(0);
    };

    const handleBrandChange = (event: any, value: { value: string, label: string } | null) => {
        setDefaultBrandId(value)
    }

    const handleDiscountOnChange = (event) => {
        setDiscountOn(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(0);
    };

    const fetchBrands = () => {
        GetBrands({limit:0}).then((brands:any) => {
            const { list } = brands
            const rows = list.map((e:any) => {
                return { value: e.id, label: e.name }
            })
            setBrands(rows)
            if(rows.length>0){
                setDefaultBrandId(rows[0])
            }
        }).catch((e) => {
            console.log(e.message)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Discounts' }])
    }, []);

    useEffect(() => {
        if(brandSelection){
            fetchBrands()
        }
    }, []);

    useEffect(() => {
        if(defaultBrandId?.value){
            fetchRows()
        }
    }, [page, searchText, defaultBrandId, discountType, discountOn, status]);

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { searchText, brandId: defaultBrandId.value, discountType: discountType || undefined , discountOn: discountOn || undefined, status: status || undefined }
        GetDiscounts({page:page+1}, params).then((discounts:any) => {
            const { list, paging } = discounts
            const rows = list.map((e:any) => {
                return {
                    id: e.id,
                    name: e.name,
                    discountOn: DISCOUNT_ON[e.discountOn],
                    discountType: startCase(toLower(e.discountType)),
                    dateRange: e.startDate === e.endDate ? dayjs(e.startDate).format("MMM DD, YYYY") : `${dayjs(e.startDate).format("MMM DD, YYYY")} - ${dayjs(e.endDate).format("MMM DD, YYYY")}`,
                    discount: e.discountType === DISCOUNT_TYPE.PERCENTAGE ? e.percentage+'%' : e.brand.country.currency.symbol+e.fixedAmount,
                    discountCap: e.maxLimit ? e.brand.country.currency.symbol+e.maxLimit : '-',
                    actions: <>
                        <IconButton component={NavLink} to={ROUTES.DISCOUNT.VIEW(e.id)} color={'info'}>
                            <VisibilityIcon/>
                        </IconButton>
                        { hasPermission(PERMISSIONS.DISCOUNT.UPSERT) ?
                            <IconButton component={NavLink} color={'warning'} to={ROUTES.DISCOUNT.EDIT(e.id)}>
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

    return (
        <>
            <PageTitle title={'Discounts'} to={ROUTES.DISCOUNT.CREATE} btn={btn}/>
            <Card sx={{mb:3}}>
                <CardContent sx={{p:3}}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <SearchForm callback={handleSearch} label={'Search Discounts'}/>
                        </Grid>
                        {
                            brandSelection ?
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Autocomplete
                                        id="brands-dd"
                                        options={brands}
                                        getOptionLabel={(option) => option.label || ''}
                                        onChange={handleBrandChange}
                                        value={defaultBrandId}
                                        disableClearable
                                        renderInput={(params) => <TextField disabled={!brands.length} variant="standard" {...params} label="Brand" />}
                                    />
                                </Grid>
                                : <></>
                        }
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Discount On</InputLabel>
                                <Select label="Discount On" onChange={handleDiscountOnChange} value={discountOn}>
                                    <MenuItem value={''}>Any</MenuItem>
                                    { Object.keys(DISCOUNT_ON).map((key:string) => {
                                        return (<MenuItem selected={discountOn === key} value={key} key={key}>{DISCOUNT_ON[key]}</MenuItem>)
                                    }) }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant={'standard'} fullWidth={true}>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" onChange={handleStatusChange} value={status}>
                                    <MenuItem value={''}>ANY</MenuItem>
                                    { Object.keys(DISCOUNT_STATUSES).map((key:string) => {
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
                                        No discounts found
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

export default Discount
