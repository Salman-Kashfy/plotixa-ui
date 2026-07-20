import { useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem,
    InputAdornment, IconButton, Tooltip, FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { GetExpenseTypes } from '../../services/expense.service';
import { hasPermission } from '../../utils/permissions';
import { PERMISSIONS } from '../../utils/constants';
import ExpenseTypeDialog from './ExpenseTypeDialog';
import { ToastContext } from '../../hooks/ToastContext';

type ExpenseType = { id: string; name: string };

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

function ExpenseForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const toastContext: any = useContext(ToastContext);
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);

    const canManageTypes = hasPermission(PERMISSIONS.EXPENSE_TYPE.CREATE) ||
        hasPermission(PERMISSIONS.EXPENSE_TYPE.UPDATE) ||
        hasPermission(PERMISSIONS.EXPENSE_TYPE.DELETE);

    const defaultValues = {
        id: '',
        expenseTypeId: '',
        amount: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            id: data.id || '',
            expenseTypeId: data.expenseType?.id || '',
            amount: data.amount || '',
        },
    });

    const fetchTypes = () => {
        setTypesLoading(true);
        GetExpenseTypes().then((types) => {
            setExpenseTypes(types);
            setTypesLoading(false);
        }).catch(() => setTypesLoading(false));
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                id: data.id || '',
                expenseTypeId: data.expenseType?.id || '',
                amount: data.amount || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: any) => {
        const _data: any = { expenseTypeId: formData.expenseTypeId, amount: Number(formData.amount) };
        if (formData.id) _data.id = formData.id;
        if (!_data.expenseTypeId) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Expense type is required.');
            toastContext.setToast(true);
            return;
        }
        callback(_data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading || formLoader} />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Expense Details</Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="expenseTypeId"
                                control={control}
                                rules={{ required: { value: true, message: 'Expense type is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Expense Type</InputLabel>
                                        <Select
                                            {...field}
                                            label="Expense Type"
                                            disabled={typesLoading}
                                            endAdornment={
                                                canManageTypes ? (
                                                    <InputAdornment position="end" sx={{ mr: 2 }}>
                                                        <Tooltip title="Manage expense types">
                                                            <IconButton size="small" onClick={() => setTypeDialogOpen(true)}>
                                                                <SettingsIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ) : null
                                            }
                                        >
                                            <MenuItem value=""><em>Select type</em></MenuItem>
                                            {expenseTypes.map((type) => (
                                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
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
                                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Amount"
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

            <ExpenseTypeDialog
                open={typeDialogOpen}
                onClose={() => setTypeDialogOpen(false)}
                onUpdated={(updatedTypes) => setExpenseTypes(updatedTypes)}
            />
        </form>
    );
}

export default ExpenseForm;
