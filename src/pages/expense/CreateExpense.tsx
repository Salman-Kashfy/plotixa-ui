import {useEffect, useState, useContext, Fragment, SyntheticEvent} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GLOBAL_STATUSES, ROLE, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import { GetExpenseCategories, CreateExpense as _CreateExpense } from "../../services/expense.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";
import {Controller, useForm, useFieldArray} from "react-hook-form";
import {getAuthGym} from "../../utils/permissions";
import {AdminContext} from "../../hooks/AdminContext";
import Grid from "@mui/material/Grid2";
import {Box, Button,Card,CardContent,FormControl,FormHelperText,IconButton,TextField,InputLabel,MenuItem,Typography} from "@mui/material";
import ProgressBar from "../../components/ProgressBar";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import CircularProgress from "@mui/material/CircularProgress";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {GetGyms} from "../../services/gym.service";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccordionDetails from "@mui/material/AccordionDetails";
import {decimalOnly} from "../../utils/validations";
import AddIcon from "@mui/icons-material/Add";
import InputAdornment from '@mui/material/InputAdornment';
import {displayAmount} from "../../utils/format";
import FunctionsIcon from '@mui/icons-material/Functions';
import LoadingButton from "@mui/lab/LoadingButton";

function CreateExpense() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const adminContext = useContext(AdminContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const gymSelection = [ROLE.SUPER_ADMIN, ROLE.BRAND_ADMIN].includes(adminContext.admin.role.name.toLowerCase());
    const [gymId, setGymId] = useState(gymSelection ? {} : {value: getAuthGym(), label: ''});
    const [gyms, setGyms] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [gymLoader, setGymLoader] = useState(false);
    const maxExpense = 12
    const [expanded, setExpanded] = useState<string | false>('');

    const defaultValues = {
        gymId: gymSelection ? '' : getAuthGym(),
        date: dayjs().format('YYYY-MM-DD'),
        expenses: []
    }
    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset, setError, clearErrors} = useForm({
        mode: "onChange",
        defaultValues
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'expenses'
    });

    const expenses = watch('expenses')

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
    }

    const handlePanelChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    }

    const addExpense = () => {
        if (fields.length >= maxExpense) return;
        append({ categoryId: '', amount: '' });
        setExpanded('panel'+expenses.length)
    };

    const handleExpenseChange = (value, index) => {
        setValue(`expenses.${index}.categoryId`, value?.value || '', {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const handleAmountChange = (e, index) => {
        decimalOnly(e)
        setValue(`expenses.${index}.amount`, Number(e.target.value), {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const onSubmit = (data) => {
        data.expenses = data.expenses.map((e:any) => {
            e.amount = Number(e.amount)
            return e
        })
        setLoading(true)
        _CreateExpense(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Created successfully.')
                navigate(ROUTES.EXPENSE.LIST)
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
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.EXPENSE.LIST, name: 'Expenses' }, {name: 'Create Expense' }])
        fetchExpenseCategories()
    }, []);

    const fetchGyms = () => {
        setGymLoader(true)
        GetGyms({limit:0},{status: GLOBAL_STATUSES.ACTIVE}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
            setGymLoader(false)
        }).catch((e) => {
            setGymLoader(false)
            console.log(e.message)
        })
    }

    const fetchExpenseCategories = () => {
        GetExpenseCategories()
            .then(({ list }: any) => {
                const parents = list.filter((e: any) => e.parentId === null);
                const parentMap = new Map(parents.map((p: any) => [p.id, p.name]));

                const childrenWithGroup = list
                    .filter((e: any) => e.parentId !== null)
                    .map((e: any) => ({
                        value: e.id,
                        label: e.name,
                        group: parentMap.get(e.parentId) || 'Uncategorized',
                    }));

                setExpenseCategories(childrenWithGroup);
            })
            .catch((e) => {
                console.log(e.message);
            });
    };


    useEffect(() => {
        if(gymSelection){
            fetchGyms()
        }
    }, [])

    return (
        <>
            <PageTitle title={'Create Expense'} backTo={ROUTES.EXPENSE.LIST}/>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Card sx={{mb:3}}>
                            <ProgressBar formLoader={loading}/>
                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                <Grid container spacing={3} sx={{mb:3}}>
                                    {
                                        gymSelection ?
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Controller name="gymId" control={control}
                                                    rules={{
                                                        required: {
                                                            value: "required",
                                                            message: "Gym is required"
                                                        }
                                                    }}
                                                    render={({ field, fieldState: { error } }) => (
                                                        <Autocomplete
                                                            id="gyms-dd"
                                                            options={gyms}
                                                            getOptionLabel={(option) => option.label || ''}
                                                            value={gymId}
                                                            loading={gymLoader}
                                                            onChange={handleGymChange}
                                                            renderInput={(params) => <FormInput fullWidth={true} disabled={!gyms.length} error={error} label={'Gym'} params={params}
                                                                slotProps={{
                                                                    input: {
                                                                        ...params.InputProps,
                                                                        endAdornment: (
                                                                            <Fragment>
                                                                                {gymLoader ? <CircularProgress color="inherit" size={20} /> : null}
                                                                                {params.InputProps.endAdornment}
                                                                            </Fragment>
                                                                        ),
                                                                    },
                                                                }}
                                                            />}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        : <></>
                                    }
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Controller name="date" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Date is required"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormControl error={!!error} fullWidth={true}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            label="Date"
                                                            closeOnSelect={true}
                                                            value={field.value ? dayjs(field.value) : null}
                                                            format="MMM DD, YYYY"
                                                            onChange={(event) => field.onChange(event.format('YYYY-MM-DD'))}
                                                            slotProps={{
                                                                textField: {
                                                                    variant: 'standard',
                                                                    sx:{width:'100%'},
                                                                }
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                    {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                                </FormControl>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
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
                                                <Typography component="span" color={'primary'} sx={{ fontWeight: 500, pr:2 }}>{expenseCategories?.find((e) => e.value === expenses[index].categoryId)?.label} </Typography>
                                                <Typography component="span" sx={{ fontWeight: 500 }}>{expenses[index].amount ? displayAmount(adminContext.admin.currency, Number(expenses[index].amount)) : '' }</Typography>
                                            </Box>
                                            <Typography component="span" color={'error'} sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, order: { xs: 3, sm: 0 } }}>
                                                { errors?.expenses?.[index]?.categoryId?.message || errors?.expenses?.[index]?.amount?.message }
                                            </Typography>
                                            <Box sx={{ marginLeft: 'auto' }}>
                                                <IconButton onClick={() => remove(index)}>
                                                    <DeleteOutlineIcon color={'error'} />
                                                </IconButton>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Controller
                                                        name={`expenses.${index}.categoryId`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: "required",
                                                                message: "Category is required"
                                                            }
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <Autocomplete
                                                                {...field}
                                                                value={expenseCategories.find(option => option.value === field.value) || null}
                                                                options={expenseCategories.sort((a, b) => a.group.localeCompare(b.group))}
                                                                groupBy={(option) => option.group}
                                                                getOptionLabel={(option) => option.label}
                                                                onChange={(e, newValue) => {
                                                                    field.onChange(newValue?.value || '');
                                                                    handleExpenseChange(newValue, index);
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField {...params} label="Expense Category" variant={'standard'}  error={!!fieldState.error} helperText={fieldState.error?.message} />
                                                                )}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Controller
                                                        name={`expenses.${index}.amount`}
                                                        control={control}
                                                        rules={{
                                                            required: {
                                                                value: "required",
                                                                message: "Amount is required"
                                                            }
                                                        }}
                                                        render={({ field, fieldState }) => (
                                                            <TextField
                                                                {...field}
                                                                value={field.value}
                                                                label="Amount"
                                                                type="number"
                                                                error={!!fieldState.error}
                                                                variant={'standard'}
                                                                fullWidth={true}
                                                                helperText={fieldState.error?.message}
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);
                                                                    handleAmountChange(e, index);
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: <InputAdornment position="start">{adminContext.admin.currency?.symbol}</InputAdornment>,
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                                {
                                    expenses.length && Number(expenses[0].amount) ?
                                        <Accordion>
                                            <AccordionDetails>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, pt: 1, pl: 0}}>
                                                    <FunctionsIcon sx={{ color: 'primary.main' }} />
                                                    <Typography color="primary" sx={{ fontWeight: 500 }}>Total</Typography>
                                                    <Typography sx={{ fontWeight: 500 }}>
                                                        {displayAmount(adminContext.admin.currency, expenses.reduce((init, expense) => init + Number(expense.amount), 0))}
                                                    </Typography>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>:<></>
                                }
                                <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: 3 }}>
                                    <Button onClick={addExpense} disabled={expenses?.length>=maxExpense || loading || !gymId?.value} startIcon={<AddIcon/>} sx={{ width: { xs: '100%', sm: 'auto' } }}>Add Expense</Button>
                                </Box>
                            </CardContent>
                        </Card>
                        <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                            <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>Create</LoadingButton>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </>
    )
}
export default CreateExpense