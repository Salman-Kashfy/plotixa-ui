import {useEffect, useState, useContext, SyntheticEvent} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {COMMISSION_TYPE, PERMISSIONS, ROUTES} from "../../utils/constants";
import IconButton from "@mui/material/IconButton";
import PageTitle from "../../components/PageTitle";
import {Box, Card, CardContent, InputLabel, Typography, TextField, MenuItem, FormControl, Button} from "@mui/material";
import {useParams} from "react-router-dom";
import {InstructorCommissions, SaveContractCommission} from "../../services/instructor.commission.service";
import {displayAmount} from "../../utils/format";
import {GetInstructor} from "../../services/instructor.service";
import {isEmpty,capitalize} from "lodash";
import {useForm, useFieldArray, Controller} from "react-hook-form";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccordionDetails from "@mui/material/AccordionDetails";
import Grid from "@mui/material/Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import {GetServices} from "../../services/service.service";
import FormInput from "../../components/FormInput";
import {AdminContext} from "../../hooks/AdminContext";
import Select from "@mui/material/Select";
import ProgressBar from "../../components/ProgressBar";
import AddIcon from "@mui/icons-material/Add";
import LoadingButton from "@mui/lab/LoadingButton";
import {ToastContext} from "../../hooks/ToastContext";
import {hasPermission} from "../../utils/permissions";

function PTCommission() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(true);
    const { instructorId } = useParams();
    const [instructor, setInstructor] = useState({});
    const [services, setServices] = useState([]);
    const [expanded, setExpanded] = useState<string | false>('');
    const defaultValues = {
        instructorId,
        rates: []
    }
    const {control, handleSubmit, setValue, watch, formState: {errors}, reset} = useForm({
        mode: "onChange",
        defaultValues
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'rates'
    })
    const rates = watch('rates')
    const currency = {
        code: adminContext.admin.currency?.code || '',
        symbol: adminContext.admin.currency?.symbol || ''
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.INSTRUCTOR.LIST, name: 'Instructors' }, {name: '...' }, {name: 'PT Commissions' }])
        GetInstructor(instructorId).then((instructor) => {
            setInstructor(instructor)
            fetchServices(instructor.brandId)
        })
    }, []);

    useEffect(() => {
        if(!isEmpty(instructor)){
            breadcrumbContext.setBreadcrumb([{to:ROUTES.INSTRUCTOR.LIST, name: 'Instructors' }, {to:ROUTES.INSTRUCTOR.VIEW(instructorId), name: instructor.fullName }, {name: 'PT Commissions' }])
        }
    }, [instructor]);

    useEffect(() => {
        if(!isEmpty(services)){
            fetchRows()
        }
    }, [services]);

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    const fetchServices = (brandId) => {
        GetServices({limit:0},{brandId,commissionable:true}).then(({list}:any) => {
            setServices(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const handleServiceChange = (value, index) => {
        setValue(`rates.${index}.serviceId`, value?.value || '', {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handleAmountChange = (e, index) => {
        setValue(`rates.${index}.amount`, e.target.value || '', {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handlePercentageChange = (e, index) => {
        setValue(`rates.${index}.percentage`, e.target.value || '', {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handlePanelChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    }

    const addCommission = () => {
        append({ serviceId: '', type: '', amount: '' , percentage: '' });
        setExpanded('panel'+rates.length)
    };

    const fetchRows = () => {
        if(!loading) setLoading(true)
        const params = { instructorId }
        InstructorCommissions(params).then((response:any) => {
            const { list } = response
            const rates = []
            for (const ic of list) {
                rates.push({
                    type: ic.type,
                    name: ic.service.name,
                    serviceId: ic.service.id,
                    percentage: ic.percentage || null,
                    amount: ic.amount || null,
                    currencyCode: ic.currencyCode || null,
                    currencySymbol: ic.currencySymbol || null,
                })
            }
            initializeForm({instructorId, rates})
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }

    const onSubmit = async (data) => {
        data.rates = data.rates.map((e:any) => {
            return {
                type:e.type,
                serviceId:e.serviceId,
                amount:e.amount ? Number(e.amount) : null,
                percentage:e.percentage ? Number(e.percentage) : null
            }
        })
        setLoading(true)
        SaveContractCommission(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Saved successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
            console.log(e.message)
        })
    };

    const getAvailableServices = (currentIndex = null) => {
        return services.filter(service => {
            if (currentIndex !== null && rates[currentIndex]?.serviceId === service.value) {
                return true;
            }
            return !rates.some((rate, index) =>
                index !== currentIndex && rate.serviceId === service.value
            );
        });
    };

    return (
        <>
            <PageTitle title={'PT Commission'}/>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Card sx={{mb:3}}>
                            <ProgressBar formLoader={loading}/>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                { !isEmpty(instructor) ? <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>{instructor.fullName}</Typography> : <></> }
                                {fields.map((field, index) => (
                                    <Accordion key={field.id} expanded={expanded === 'panel'+index} onChange={handlePanelChange('panel'+index)}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls={'panelbh-content-'+index}
                                            id={'panelbh-header-'+index}
                                            sx={{
                                                flexDirection: 'row-reverse',
                                                gap: 1,
                                                '& .MuiAccordionSummary-content': {
                                                    flexWrap: 'wrap',
                                                    gap: 1,
                                                    alignItems: 'center',
                                                    minWidth: 0,
                                                },
                                            }}
                                        >
                                            <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0, pt: { sm: 1 } }}>
                                                <Typography component="span" color={'primary'} sx={{ fontWeight: 500, pr:2 }}>{services?.find((e) => e.value === rates[index].serviceId)?.label} </Typography>
                                                { rates[index].type ? <Typography component="span" sx={{ fontWeight: 500, pr:2 }}>{capitalize(rates[index].type)} </Typography> : <></> }
                                                { rates[index].amount || rates[index].percentage ? <Typography component="span" sx={{ fontWeight: 500 }}>{rates[index].type === COMMISSION_TYPE.FIXED ? displayAmount(currency, Number(rates[index].amount)) : rates[index].percentage+'%' }</Typography> : <></> }
                                            </Box>
                                            <Typography component="span" color={'error'} sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, order: { xs: 3, sm: 0 } }}>
                                                { errors?.rates?.[index]?.serviceId?.message || errors?.rates?.[index]?.amount?.message || errors?.rates?.[index]?.percentage?.message }
                                            </Typography>
                                            { hasPermission(PERMISSIONS.PT_COMMISSION.UPSERT) ?
                                                <Box sx={{ marginLeft: 'auto' }}>
                                                    <IconButton onClick={() => remove(index)}>
                                                        <DeleteOutlineIcon color={'error'} />
                                                    </IconButton>
                                                </Box> : <></>
                                            }
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Controller name={`rates.${index}.serviceId`} control={control}
                                                        rules={{
                                                            required: {
                                                                value: "required",
                                                                message: "Service is required"
                                                            }
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <Autocomplete
                                                                id={`services-dd-`+index}
                                                                options={getAvailableServices(index)}
                                                                getOptionLabel={(option) => option.label || ''}
                                                                value={services.find(option => option.value === field.value)}
                                                                onChange={(e, newValue) => {
                                                                    field.onChange(newValue?.value || '');
                                                                    handleServiceChange(newValue, index);
                                                                }}
                                                                renderInput={(params) => <FormInput fullWidth={true} disabled={!services.length} label={'Service'} params={params}/>}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <Controller
                                                        name={`rates.${index}.type`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: "required",
                                                                message: "Commission type is required"
                                                            }
                                                        }}
                                                        render={({ field:_field, fieldState }) => (
                                                            <FormControl variant={'standard'} fullWidth={true}>
                                                                <InputLabel>Commission type</InputLabel>
                                                                <Select label="Commission type" {..._field} value={_field.value || ''}>
                                                                    {Object.keys(COMMISSION_TYPE).map((key) => (
                                                                        <MenuItem value={key} key={key}>{capitalize(key)}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                    {rates[index].type === COMMISSION_TYPE.FIXED ?
                                                        <Controller
                                                            name={`rates.${index}.amount`}
                                                            key={`rates.${index}.amount`}
                                                            control={control}
                                                            rules={{
                                                                required: {
                                                                    value: "required",
                                                                    message: "Amount is required"
                                                                }
                                                            }}
                                                            render={({field: _field, fieldState}) => (
                                                                <TextField
                                                                    {..._field}
                                                                    value={_field.value}
                                                                    label="Amount"
                                                                    type="number"
                                                                    error={!!fieldState.error}
                                                                    variant={'standard'}
                                                                    fullWidth={true}
                                                                    helperText={fieldState.error?.message}
                                                                    onChange={(e) => {
                                                                        _field.onChange(e.target.value);
                                                                        handleAmountChange(e, index);
                                                                    }}
                                                                    InputProps={{
                                                                        startAdornment: <InputAdornment position="start">{currency.symbol}</InputAdornment>,
                                                                    }}
                                                                />
                                                            )}
                                                        /> :
                                                        <Controller
                                                            name={`rates.${index}.percentage`}
                                                            control={control}
                                                            key={`rates.${index}.percentage`}
                                                            rules={{
                                                                required: {
                                                                    value: "required",
                                                                    message: "Percentage is required"
                                                                }
                                                            }}
                                                            render={({field: _field, fieldState}) => (
                                                                <TextField
                                                                    {..._field}
                                                                    value={_field.value}
                                                                    label="Percentage"
                                                                    type="number"
                                                                    error={!!fieldState.error}
                                                                    variant={'standard'}
                                                                    fullWidth={true}
                                                                    helperText={fieldState.error?.message}
                                                                    onChange={(e) => {
                                                                        if(e.target.value && Number(e.target.value) > 100) return
                                                                        _field.onChange(e.target.value);
                                                                        handlePercentageChange(e, index);
                                                                    }}
                                                                    InputProps={{
                                                                        endAdornment: <InputAdornment position="start">%</InputAdornment>,
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    }
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                                { hasPermission(PERMISSIONS.PT_COMMISSION.UPSERT) ?
                                    <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: 3 }}>
                                        <Button onClick={addCommission} disabled={loading} startIcon={<AddIcon/>} sx={{ width: { xs: '100%', sm: 'auto' } }}>Add Commission</Button>
                                    </Box> :<></>
                                }
                            </CardContent>
                        </Card>
                        {
                            hasPermission(PERMISSIONS.PT_COMMISSION.UPSERT) ?
                                <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                                    <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>Save Commissions</LoadingButton>
                                </Box> : <></>
                        }
                    </Grid>
                </Grid>
            </form>
        </>
    )
}
export default PTCommission