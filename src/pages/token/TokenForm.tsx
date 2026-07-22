import { useContext, useEffect, useState, useCallback } from 'react';
import {
    Box, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem, FormHelperText,
    InputAdornment, CircularProgress, TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { GetCustomers } from '../../services/customer.service';
import { GetPlotBlocks, GetPlotCategories, GetPlots } from '../../services/plot.service';
import { AdminContext } from '../../hooks/AdminContext';

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

function TokenForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';

    // Customer search
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerInput, setCustomerInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    // Filters
    const [blocks, setBlocks] = useState<{ id: string; name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    // Plots
    const [plots, setPlots] = useState<any[]>([]);
    const [plotsLoading, setPlotsLoading] = useState(false);

    const defaultValues = {
        customerId: '',
        blockId: '',
        categoryId: '',
        plotId: '',
        amount: '',
        validUntil: null as Dayjs | null,
    };

    const { control, handleSubmit, reset, setValue, watch } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            customerId: data.customer?.id || '',
            blockId: data.plot?.block?.id || '',
            categoryId: data.plot?.category?.id || '',
            plotId: data.plot?.id || '',
            amount: data.amount || '',
            validUntil: data.validUntil ? dayjs(data.validUntil) : null,
        },
    });

    const blockIdValue = watch('blockId');
    const categoryIdValue = watch('categoryId');

    // Debounced customer search
    const searchCustomers = useCallback((search: string) => {
        if (!search.trim()) {
            setCustomerOptions([]);
            return;
        }
        setCustomerLoading(true);
        GetCustomers({ page: 1, limit: 20 }, { searchText: search }).then((res) => {
            setCustomerOptions(res.data || []);
            setCustomerLoading(false);
        }).catch(() => setCustomerLoading(false));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchCustomers(customerInput), 400);
        return () => clearTimeout(timer);
    }, [customerInput, searchCustomers]);

    // Fetch blocks and categories on mount
    useEffect(() => {
        GetPlotBlocks().then(setBlocks);
        GetPlotCategories().then(setCategories);
    }, []);

    // Populate existing data on edit
    useEffect(() => {
        if (Object.keys(data).length) {
            if (data.customer) {
                setSelectedCustomer(data.customer);
                setCustomerOptions([data.customer]);
            }
            reset({
                customerId: data.customer?.id || '',
                blockId: data.plot?.block?.id || '',
                categoryId: data.plot?.category?.id || '',
                plotId: data.plot?.id || '',
                amount: data.amount || '',
                validUntil: data.validUntil ? dayjs(data.validUntil) : null,
            });
        }
    }, [data, reset]);

    // Fetch plots when block or category changes
    useEffect(() => {
        if (!blockIdValue && !categoryIdValue) {
            setPlots([]);
            return;
        }
        setPlotsLoading(true);
        const params: any = { status: 'AVAILABLE' };
        if (blockIdValue) params.blockId = blockIdValue;
        if (categoryIdValue) params.categoryId = categoryIdValue;
        GetPlots({ page: 1, limit: 200 }, params).then((res) => {
            setPlots(res.data || []);
            setPlotsLoading(false);
        }).catch(() => setPlotsLoading(false));
    }, [blockIdValue, categoryIdValue]);

    const onSubmit = (formData: any) => {
        const _data: any = {
            customerId: formData.customerId,
            blockId: formData.blockId,
            categoryId: formData.categoryId,
            plotId: formData.plotId,
            amount: Number(formData.amount),
            validUntil: formData.validUntil ? (formData.validUntil as Dayjs).toISOString() : null,
        };
        callback(_data);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading || formLoader} />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Token Details</Typography>
                    <Grid container spacing={3}>

                        {/* Customer Search */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="customerId"
                                control={control}
                                rules={{ required: { value: true, message: 'Customer is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        options={customerOptions}
                                        getOptionLabel={(opt) => opt.name ? `${opt.name} (${opt.phoneCode}${opt.phoneNumber})` : ''}
                                        isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                        value={selectedCustomer}
                                        loading={customerLoading}
                                        filterOptions={(x) => x}
                                        noOptionsText={customerInput ? 'No customers found' : 'Type to search customers'}
                                        onInputChange={(_e, value) => setCustomerInput(value)}
                                        onChange={(_e, value) => {
                                            setSelectedCustomer(value);
                                            field.onChange(value?.id || '');
                                            setValue('customerId', value?.id || '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Customer"
                                                variant="standard"
                                                error={!!error}
                                                helperText={error?.message}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {customerLoading ? <CircularProgress size={16} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Block */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="blockId"
                                control={control}
                                rules={{ required: { value: true, message: 'Block is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Block</InputLabel>
                                        <Select
                                            {...field}
                                            label="Block"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                setValue('plotId', '');
                                            }}
                                        >
                                            <MenuItem value=""><em>Select block</em></MenuItem>
                                            {blocks.map((b) => (
                                                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                            ))}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Category */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="categoryId"
                                control={control}
                                rules={{ required: { value: true, message: 'Category is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            {...field}
                                            label="Category"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                setValue('plotId', '');
                                            }}
                                        >
                                            <MenuItem value=""><em>Select category</em></MenuItem>
                                            {categories.map((c) => (
                                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                            ))}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Plot */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="plotId"
                                control={control}
                                rules={{ required: { value: true, message: 'Plot is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Plot</InputLabel>
                                        <Select
                                            {...field}
                                            label="Plot"
                                            disabled={plotsLoading || (!blockIdValue && !categoryIdValue)}
                                        >
                                            <MenuItem value="">
                                                <em>
                                                    {plotsLoading
                                                        ? 'Loading...'
                                                        : (!blockIdValue && !categoryIdValue)
                                                            ? 'Select block or category first'
                                                            : 'Select plot'}
                                                </em>
                                            </MenuItem>
                                            {plots.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.block?.name}-{p.plotNo}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Token Amount */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Amount is required' },
                                    min: { value: 1, message: 'Amount must be greater than 0' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Token Amount"
                                        inputProps={{ step: '1', min: '1' }}
                                        InputProps={currencyCode ? {
                                            startAdornment: (
                                                <InputAdornment position="start">{currencyCode}</InputAdornment>
                                            ),
                                        } : undefined}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Token Validity */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="validUntil"
                                control={control}
                                rules={{ required: { value: true, message: 'Valid Until is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <DatePicker
                                        label="Valid Until"
                                        value={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        slotProps={{
                                            textField: {
                                                variant: 'standard',
                                                fullWidth: true,
                                                error: !!error,
                                                helperText: error?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>
            <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {btnLabel}
                </LoadingButton>
            </Box>
        </form>
        </LocalizationProvider>
    );
}

export default TokenForm;
