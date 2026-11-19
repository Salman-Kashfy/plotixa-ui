import { useCallback, useContext, useEffect, useState } from 'react';
import {
    Chip, CircularProgress, FormControl, FormHelperText, InputAdornment,
    InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid2';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { AdminContext } from '../../hooks/AdminContext';
import { GetBlocks } from '../../services/block.service';
import { GetCategories } from '../../services/category.service';
import { GetCustomers, type Customer } from '../../services/customer.service';
import { GetPlots } from '../../services/plot.service';
import { TOKEN_STATUS, TOKEN_STATUS_COLOR } from '../../utils/constants';

type Props = {
    data?: any;
    customer?: Customer | null;
    callback: (data: any) => void;
    formId: string;
    loading: boolean;
    formLoader?: boolean;
};

type CustomerOption = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    phoneCode: string;
    phoneNumber: string;
};

type LocationOption = { id?: string; uuid?: string; name: string };

const toCustomerOption = (customer: Partial<Customer> & { name?: string }): CustomerOption | null => {
    const id = customer.uuid;
    if (!id) return null;
    return {
        id,
        name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phoneCode: customer.phoneCode || '',
        phoneNumber: customer.phoneNumber || '',
    };
};

function TokenForm({
    data = {},
    customer = null,
    callback,
    formId,
    loading,
    formLoader = false,
}: Props) {
    const adminContext: any = useContext(AdminContext);
    const projectUuid = adminContext.projectUuid || '';
    const currencyCode = adminContext.projects?.find(
        (project: any) => project.uuid === projectUuid,
    )?.currencyCode || '';
    const isEditing = Boolean(data?.uuid || data?.id);
    const presetCustomer = toCustomerOption(customer || data?.customer || {});

    const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>(
        presetCustomer ? [presetCustomer] : [],
    );
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerInput, setCustomerInput] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(presetCustomer);
    const [blocks, setBlocks] = useState<LocationOption[]>([]);
    const [categories, setCategories] = useState<LocationOption[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [plotsLoading, setPlotsLoading] = useState(false);

    const defaultValues = {
        customerUuid: customer?.uuid || '',
        blockUuid: '',
        categoryUuid: '',
        plotUuid: '',
        amount: '',
        validForDays: 7,
        status: TOKEN_STATUS.ACTIVE as TOKEN_STATUS,
    };

    const { control, handleSubmit, reset, setValue, watch } = useForm({
        mode: 'onChange',
        defaultValues,
    });

    const blockUuid = watch('blockUuid');
    const categoryUuid = watch('categoryUuid');

    const searchCustomers = useCallback((search: string) => {
        if (!search.trim() || !projectUuid) {
            setCustomerOptions(selectedCustomer ? [selectedCustomer] : []);
            return;
        }
        setCustomerLoading(true);
        GetCustomers({ page: 1, perPage: 20 }, projectUuid)
            .then((response) => {
                const options = (response.data?.list || [])
                    .map(toCustomerOption)
                    .filter((option): option is CustomerOption => Boolean(option))
                    .filter((option) =>
                        `${option.name} ${option.phoneCode}${option.phoneNumber}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                    );
                setCustomerOptions(options);
            })
            .catch(() => setCustomerOptions([]))
            .finally(() => setCustomerLoading(false));
    }, [projectUuid, selectedCustomer]);

    useEffect(() => {
        if (customer || isEditing) return;
        const timer = setTimeout(() => searchCustomers(customerInput), 400);
        return () => clearTimeout(timer);
    }, [customer, customerInput, isEditing, searchCustomers]);

    useEffect(() => {
        if (!projectUuid) {
            setBlocks([]);
            setCategories([]);
            return;
        }
        GetBlocks({ projectUuid }).then(setBlocks).catch(() => setBlocks([]));
        GetCategories({ projectUuid }).then(setCategories).catch(() => setCategories([]));
    }, [projectUuid]);

    useEffect(() => {
        if (!projectUuid || !blockUuid || !categoryUuid) {
            setPlots([]);
            setPlotsLoading(false);
            return;
        }
        setPlotsLoading(true);
        const params = {
            projectUuid,
            status: 'ACTIVE',
            blockUuid,
            categoryUuid,
        };

        GetPlots({ page: 1, limit: 200 }, params as { projectUuid: string; [key: string]: any })
            .then((response) => setPlots(response.list || []))
            .catch(() => setPlots([]))
            .finally(() => setPlotsLoading(false));
    }, [blockUuid, categoryUuid, projectUuid]);

    useEffect(() => {
        const customerOption = toCustomerOption(customer || data?.customer || {});
        if (customerOption) {
            setSelectedCustomer(customerOption);
            setCustomerOptions([customerOption]);
            setValue('customerUuid', customerOption.id);
        }
    }, [customer, data?.customer, setValue]);

    useEffect(() => {
        if (!Object.keys(data).length) return;
        reset({
            customerUuid: data.customer?.uuid || data.customer?.id || '',
            blockUuid: data.plot?.block?.uuid || data.plot?.block?.id || '',
            categoryUuid: data.plot?.category?.uuid || data.plot?.category?.id || '',
            plotUuid: data.plot?.uuid || data.plot?.id || '',
            amount: data.amount ?? '',
            validForDays: 7,
            status: data.status || TOKEN_STATUS.ACTIVE,
        });
    }, [data, reset]);

    const onSubmit = (formData: typeof defaultValues) => {
        const payload: any = {
            projectUuid,
            plotUuid: formData.plotUuid,
            customerUuid: formData.customerUuid,
            amount: Number(formData.amount),
        };

        if (isEditing) {
            payload.uuid = data.uuid || data.id;
            payload.status = formData.status;
        } else {
            payload.validForDays = Number(formData.validForDays);
        }

        callback(payload);
    };

    return (
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <ProgressBar formLoader={loading || formLoader} />
            <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="customerUuid"
                                control={control}
                                rules={{ required: { value: true, message: 'Customer is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <Autocomplete
                                        options={customerOptions}
                                        getOptionLabel={(option) =>
                                            option.phoneNumber
                                                ? `${option.name} (${option.phoneCode}${option.phoneNumber})`
                                                : option.name
                                        }
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        value={selectedCustomer}
                                        loading={customerLoading}
                                        disabled={Boolean(customer) || isEditing}
                                        filterOptions={(options) => options}
                                        noOptionsText={customerInput ? 'No customers found' : 'Type to search customers'}
                                        onInputChange={(_event, value) => setCustomerInput(value)}
                                        onChange={(_event, value) => {
                                            setSelectedCustomer(value);
                                            field.onChange(value?.id || '');
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

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="blockUuid"
                                control={control}
                                render={({ field }) => (
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel>Block</InputLabel>
                                        <Select
                                            {...field}
                                            label="Block"
                                            onChange={(event) => {
                                                field.onChange(event.target.value);
                                                setValue('plotUuid', '');
                                            }}
                                        >
                                            <MenuItem value=""><em>All blocks</em></MenuItem>
                                            {blocks.map((block) => (
                                                <MenuItem key={block.uuid || block.id} value={block.uuid || block.id}>
                                                    {block.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="categoryUuid"
                                control={control}
                                render={({ field }) => (
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            {...field}
                                            label="Category"
                                            onChange={(event) => {
                                                field.onChange(event.target.value);
                                                setValue('plotUuid', '');
                                            }}
                                        >
                                            <MenuItem value=""><em>All categories</em></MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem
                                                    key={category.uuid || category.id}
                                                    value={category.uuid || category.id}
                                                >
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="plotUuid"
                                control={control}
                                rules={{ required: { value: true, message: 'Plot is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Plot</InputLabel>
                                        <Select
                                            {...field}
                                            label="Plot"
                                            disabled={!blockUuid || !categoryUuid || plotsLoading}
                                        >
                                            <MenuItem value="">
                                                <em>
                                                    {plotsLoading
                                                        ? 'Loading...'
                                                        : !blockUuid || !categoryUuid
                                                            ? 'Select block and category first'
                                                            : 'Select plot'}
                                                </em>
                                            </MenuItem>
                                            {data.plot?.uuid || data.plot?.id ? (
                                                <MenuItem value={data.plot.uuid || data.plot.id}>
                                                    {data.plot.block?.name
                                                        ? `${data.plot.block.name}-${data.plot.plotNo}`
                                                        : `Plot ${data.plot.plotNo}`}
                                                </MenuItem>
                                            ) : null}
                                            {plots
                                                .filter((plot) =>
                                                    (plot.uuid || plot.id) !== (data.plot?.uuid || data.plot?.id),
                                                )
                                                .map((plot) => (
                                                    <MenuItem key={plot.uuid || plot.id} value={plot.uuid || plot.id}>
                                                        {plot.block?.name
                                                            ? `${plot.block.name}-${plot.plotNo}`
                                                            : `Plot ${plot.plotNo}`}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Amount is required' },
                                    min: { value: 0, message: 'Amount must be 0 or more' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Token Amount"
                                        inputProps={{ step: '0.01', min: '0' }}
                                        InputProps={currencyCode ? {
                                            startAdornment: (
                                                <InputAdornment position="start">{currencyCode}</InputAdornment>
                                            ),
                                        } : undefined}
                                    />
                                )}
                            />
                        </Grid>

                        {isEditing ? (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="status"
                                    control={control}
                                    rules={{ required: { value: true, message: 'Status is required' } }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant="standard" fullWidth error={!!error}>
                                            <InputLabel>Status</InputLabel>
                                            <Select {...field} label="Status">
                                                {Object.values(TOKEN_STATUS).map((status) => (
                                                    <MenuItem key={status} value={status}>
                                                        <Chip
                                                            label={status}
                                                            color={TOKEN_STATUS_COLOR[status]}
                                                            size="small"
                                                        />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error && (
                                                <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>
                        ) : (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="validForDays"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: 'Validity is required' },
                                        min: { value: 7, message: 'Validity must be at least 7 days' },
                                        validate: (value) =>
                                            Number.isInteger(Number(value)) || 'Validity must be a whole number of days',
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput
                                            fullWidth
                                            type="number"
                                            error={error}
                                            field={field}
                                            value={field.value}
                                            label="Valid For (Days)"
                                            inputProps={{ step: '1', min: '7' }}
                                        />
                                    )}
                                />
                            </Grid>
                        )}
            </Grid>
        </form>
    );
}

export default TokenForm;
