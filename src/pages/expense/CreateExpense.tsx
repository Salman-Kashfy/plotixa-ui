import { useContext, useEffect, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
    Box, Button, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem,
    IconButton, Tooltip, FormHelperText,
    Accordion, AccordionSummary, AccordionDetails,
    TextField, InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import FunctionsIcon from '@mui/icons-material/Functions';
import SettingsIcon from '@mui/icons-material/Settings';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { AdminContext } from '../../hooks/AdminContext';
import { ROUTES, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetExpenseTypes, CreateExpense as _CreateExpense } from '../../services/expense.service';
import PageTitle from '../../components/PageTitle';
import ProgressBar from '../../components/ProgressBar';
import ExpenseTypeDialog from './ExpenseTypeDialog';

type ExpenseType = { id: string; name: string };

const MAX_EXPENSES = 12;

function CreateExpense() {
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const adminContext: any = useContext(AdminContext);
    const navigate = useNavigate();
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';
    const [loading, setLoading] = useState(false);
    const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [expanded, setExpanded] = useState<string | false>('');

    const canManageTypes = hasPermission(PERMISSIONS.EXPENSE_TYPE.CREATE) ||
        hasPermission(PERMISSIONS.EXPENSE_TYPE.UPDATE) ||
        hasPermission(PERMISSIONS.EXPENSE_TYPE.DELETE);

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        mode: 'onChange',
        defaultValues: { expenses: [] as { expenseTypeId: string; amount: string }[] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'expenses' });
    const expenses = watch('expenses');

    const fetchTypes = () => {
        setTypesLoading(true);
        GetExpenseTypes().then((data) => {
            setExpenseTypes(data);
            setTypesLoading(false);
        }).catch(() => setTypesLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([
            { to: ROUTES.EXPENSE.LIST, name: 'Expenses' },
            { name: 'Add Expense' },
        ]);
        fetchTypes();
    }, []);

    const handlePanelChange = (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const addExpense = () => {
        if (fields.length >= MAX_EXPENSES) return;
        append({ expenseTypeId: '', amount: '' });
        setExpanded(`panel${fields.length}`);
    };

    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const onSubmit = (data: any) => {
        if (!data.expenses.length) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Add at least one expense.');
            toastContext.setToast(true);
            return;
        }
        setLoading(true);
        const payload = data.expenses.map((e: any) => ({
            expenseTypeId: e.expenseTypeId,
            amount: Number(e.amount),
        }));
        _CreateExpense(payload).then((response) => {
            if (response.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Expenses created successfully.');
                toastContext.setToast(true);
                navigate(ROUTES.EXPENSE.LIST);
            } else {
                toastContext.setToastSeverity('error');
                toastContext.setToastMessage(response.errorMessage || 'Something went wrong.');
                toastContext.setToast(true);
            }
            setLoading(false);
        });
    };

    return (
        <>
            <PageTitle title="Add Expense" backTo={ROUTES.EXPENSE.LIST} />
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <ProgressBar formLoader={loading}>{null}</ProgressBar>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Expenses</Typography>
                            {canManageTypes && (
                                <Tooltip title="Manage expense types">
                                    <IconButton size="small" onClick={() => setTypeDialogOpen(true)}>
                                        <SettingsIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>

                        {fields.map((field, index) => {
                            const typeName = expenseTypes.find((t) => t.id === expenses[index]?.expenseTypeId)?.name || '';
                            const amount = expenses[index]?.amount;
                            const hasError = errors?.expenses?.[index]?.expenseTypeId || errors?.expenses?.[index]?.amount;

                            return (
                                <Accordion
                                    key={field.id}
                                    expanded={expanded === `panel${index}`}
                                    onChange={handlePanelChange(`panel${index}`)}
                                    sx={{ mb: 1 }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
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
                                        <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0 }}>
                                            <Typography component="span" color="primary" sx={{ fontWeight: 500, pr: 2 }}>
                                                {typeName || `Expense ${index + 1}`}
                                            </Typography>
                                            {amount ? (
                                                <Typography component="span" sx={{ fontWeight: 500 }}>
                                                    {currencyCode ? `${currencyCode} ` : ''}{Number(amount).toLocaleString()}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                        {hasError && (
                                            <Typography component="span" color="error" variant="caption">
                                                {(errors?.expenses?.[index]?.expenseTypeId as any)?.message ||
                                                    (errors?.expenses?.[index]?.amount as any)?.message}
                                            </Typography>
                                        )}
                                        <Box sx={{ ml: 'auto' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); remove(index); }}
                                            >
                                                <DeleteOutlineIcon color="error" fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Controller
                                                    name={`expenses.${index}.expenseTypeId`}
                                                    control={control}
                                                    rules={{ required: { value: true, message: 'Expense type is required' } }}
                                                    render={({ field: f, fieldState: { error } }) => (
                                                        <FormControl variant="standard" fullWidth error={!!error}>
                                                            <InputLabel>Expense Type</InputLabel>
                                                            <Select
                                                                {...f}
                                                                label="Expense Type"
                                                                disabled={typesLoading}
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
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Controller
                                                    name={`expenses.${index}.amount`}
                                                    control={control}
                                                    rules={{
                                                        required: { value: true, message: 'Amount is required' },
                                                        min: { value: 1, message: 'Amount must be greater than 0' },
                                                    }}
                                                    render={({ field: f, fieldState: { error } }) => (
                                                        <TextField
                                                            {...f}
                                                            label="Amount"
                                                            type="number"
                                                            variant="standard"
                                                            fullWidth
                                                            error={!!error}
                                                            helperText={error?.message}
                                                            inputProps={{ step: '1', min: '0' }}
                                                            InputProps={currencyCode ? {
                                                                startAdornment: (
                                                                    <InputAdornment position="start">{currencyCode}</InputAdornment>
                                                                ),
                                                            } : undefined}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}

                        {expenses.length > 0 && total > 0 && (
                            <Accordion expanded={false} sx={{ mt: 1, pointerEvents: 'none' }}>
                                <AccordionDetails>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FunctionsIcon sx={{ color: 'primary.main' }} />
                                        <Typography color="primary" sx={{ fontWeight: 500 }}>Total</Typography>
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {currencyCode ? `${currencyCode} ` : ''}{total.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        <Box sx={{ textAlign: { xs: 'center', sm: 'right' }, mt: 3 }}>
                            <Button
                                onClick={addExpense}
                                startIcon={<AddIcon />}
                                disabled={fields.length >= MAX_EXPENSES || loading}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                Add Expense
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                    <LoadingButton
                        variant="contained"
                        type="submit"
                        loading={loading}
                        disabled={loading || !fields.length}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                        Create
                    </LoadingButton>
                </Box>
            </form>

            <ExpenseTypeDialog
                open={typeDialogOpen}
                onClose={() => setTypeDialogOpen(false)}
                onUpdated={(updatedTypes) => setExpenseTypes(updatedTypes)}
            />
        </>
    );
}

export default CreateExpense;
