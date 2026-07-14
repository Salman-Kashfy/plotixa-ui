import {useContext, useEffect, useState} from 'react'
import {
    InputLabel,
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    MenuItem,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableFooter,
    TableContainer,
    FormHelperText,
    Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import {GLOBAL_STATUSES, ROUTES, SUBSCRIPTION_STATUS} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import ActiveSubscription from "../../components/ActiveSubscription";
import LoadingButton from "@mui/lab/LoadingButton";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import {ToastContext} from "../../hooks/ToastContext";
import {NavLink, useParams} from "react-router-dom";
import {GetBrand} from "../../services/brand.service";

function GymActivation() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const { id } = useParams();
    const [loader, setLoader] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [gyms, setGyms] = useState([]);
    const [brand, setBrand] = useState({});

    const {control, handleSubmit, setValue, watch} = useForm({
        mode: "onChange",
        defaultValues: {
            brandId:id,
            statuses: []
        }
    })

    const statuses = watch('statuses')
    const fetchBrand = () => {
        return new Promise((res) => {
            GetBrand(id).then((brand) => {
                setBrand(brand)
                res(true)
            })
        })
    }

    const fetchGyms = () => {
        return new Promise((res) => { res(true) })
    }
    
    const loadData = async () => {
        setFormLoader(true)
        await Promise.all([fetchBrand(),fetchGyms()])
        setFormLoader(false)
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.BRAND.LIST, name: 'Brands' }, {to: brand?.id ? ROUTES.BRAND.VIEW(brand.id) : undefined, name: brand?.name || '...' }, {name: 'Gym Activation' }])
    }, [brand]);

    useEffect(() => {
        loadData()
    }, []);

    const onSubmit = async (_data) => {}

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                {
                    brand?.subscription?.status === SUBSCRIPTION_STATUS.GRACE ?
                        <Alert severity="error" sx={{mb: 3}}>Subscription expired, you're given some grace period before you lose access to CloudFitnest.</Alert>
                        :<></>
                }
                <Card sx={{mb:3}}>
                    <ProgressBar formLoader={formLoader || loader}/>
                    <CardContent sx={{p:3}}>
                        <Typography variant="h6" color={'primary'} sx={{mb:3}}>Gym Activation</Typography>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <TableContainer>
                                <Table>
                                    <TableBody sx={{width: '100%'}}>
                                        {
                                            statuses.map((e:any,index) => {
                                                return (
                                                    <TableRow key={index+'-table-activation'}>
                                                        <TableCell width={'65%'} sx={{fontWeight: 500}}>
                                                            {
                                                                gyms.find((_e) => _e.id === e.gymId).name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            <Controller name={`statuses[${index}].status`} control={control}
                                                                rules={{
                                                                    required: {
                                                                        value: "required",
                                                                        message: "Status is required"
                                                                    }
                                                                }}
                                                                render={({field, fieldState: {error}}) => (
                                                                    <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                                                        <InputLabel>Status</InputLabel>
                                                                        <Select label="Status" error={!!error} {...field} value={field.value || ''}>
                                                                            { Object.keys(GLOBAL_STATUSES).map((key) => {
                                                                                return (<MenuItem selected={key === e.status} value={key} key={key}>{key}</MenuItem>)
                                                                            }) }
                                                                        </Select>
                                                                        {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                                    </FormControl>
                                                                )}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={2}>
                                                <Box sx={{textAlign: 'right'}}>
                                                    <LoadingButton variant="contained" type="submit" loading={loader} disabled={loader}>Update</LoadingButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default GymActivation