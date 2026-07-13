import {Fragment, useContext, useEffect, useState} from 'react'
import {Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField} from '@mui/material';
import {Controller, useForm} from "react-hook-form";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import FormInput from "../../components/FormInput";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {AdminContext} from "../../hooks/AdminContext";
import InputAdornment from "@mui/material/InputAdornment";
import {decimalOnly} from "../../utils/validations";
import {GLOBAL_STATUSES} from "../../utils/constants";

function EditExpense({record = {}, callback, loading, gyms, gymSelection, expenseCategories}) {
    const adminContext = useContext(AdminContext)
    const [gymId, setGymId] = useState({});
    const defaultValues = {
        id: '',
        date: '',
        gymId: '',
        amount: '',
        categoryId: '',
        status: '',
    }
    const {control, handleSubmit, setValue, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const onSubmit = async (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            switch (key) {
                case 'id':
                    if (!data[key]) continue
                    break
                case 'amount':
                    data[key] = Number(data[key])
                    break
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        console.log(_data)
        reset(_data)
    }

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
    }

    const handleExpenseChange = (value) => {
        setValue(`categoryId`, value)
    };

    useEffect(() => {
        if (!isEmpty(record)) {
            initializeForm(record)
            const gym = gyms.find((e:any) => e.value === record.gymId)
            setGymId(gym)
        }
    }, [record]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
                <ProgressBar formLoader={loading}/>
                <Box>
                    {
                        gymSelection ?
                            <Box sx={{mb:2}}>
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
                                            onChange={handleGymChange}
                                            renderInput={(params) => <FormInput fullWidth={true} disabled={!gyms.length} error={error} label={'Gym'} params={params}
                                                slotProps={{
                                                    input: {
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <Fragment>
                                                                {params.InputProps.endAdornment}
                                                            </Fragment>
                                                        ),
                                                    },
                                                }}
                                            />}
                                        />
                                    )}
                                />
                            </Box>
                        : <></>
                    }
                    <Box sx={{mb:2}}>
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
                    </Box>
                    <Box sx={{mb:2}}>
                        <Controller name={`categoryId`} control={control}
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
                                        handleExpenseChange(newValue?.value);
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Expense Category" variant={'standard'}  error={!!fieldState.error} helperText={fieldState.error?.message} />
                                    )}
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{mb:2}}>
                        <Controller name={`amount`} control={control}
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
                                    onInput={decimalOnly}
                                    helperText={fieldState.error?.message}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{adminContext.admin.currency?.symbol}</InputAdornment>,
                                    }}
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{mb:2}}>
                        <Controller name="status" control={control}
                            rules={{
                                required: {
                                    value: "required",
                                    message: "Status is required"
                                },
                            }}
                            render={({ field, fieldState: { error } }) => (
                                <FormControl variant={'standard'} fullWidth={true} error={!!error}>
                                    <InputLabel>Status</InputLabel>
                                    <Select label="Status" {...field} value={field.value || ''} error={!!error}>
                                        { Object.keys(GLOBAL_STATUSES).map((_status) => {
                                            return (<MenuItem value={_status} key={_status}>{_status}</MenuItem>)
                                        }) }
                                    </Select>
                                    {error && <FormHelperText sx={{ml:0}}>{error.message}</FormHelperText>}
                                </FormControl>
                            )}
                        />
                    </Box>
                </Box>
                <Box sx={{ mt: 3, textAlign: { xs: 'center', sm: 'right' } }}>
                    <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>Update</LoadingButton>
                </Box>
            </Box>
        </form>
    )
}

export default EditExpense