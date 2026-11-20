import { useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem, FormHelperText,
    InputAdornment, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller, useWatch } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { GetPlots } from '../../services/plot.service';
import { GetCategories } from '../../services/category.service';
import { AdminContext } from '../../hooks/AdminContext';
import { TENURE_OPTIONS } from '../../utils/constants';

type Props = {
    data?: any;
    tokenLocked?: boolean;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
    loadError?: string;
};

type InstallmentRow = { month: number; label: string; amount: number; isQuarterly: boolean };
type CategoryOption = { id?: string; uuid?: string; name: string };

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel(index: number): string {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + index);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function computeInstallments(
    plotPrice: number,
    token: number,
    booking: number,
    allocation: number,
    confirmation: number,
    startOfWork: number,
    onPossession: number,
    quarterly: number,
    tenure: number,
): InstallmentRow[] {
    if (!tenure || !plotPrice) return [];
    const fixedTotal = token + booking + allocation + confirmation + startOfWork + onPossession;
    const remaining = plotPrice - fixedTotal;
    const numQuarterly = Math.floor(tenure / 4);
    const totalSlots = tenure + numQuarterly;
    const perSlot = totalSlots > 0 ? remaining / totalSlots : 0;

    const effectiveQuarterly = quarterly > 0 ? quarterly : perSlot;
    const monthlyBase = numQuarterly > 0
        ? (remaining - effectiveQuarterly * numQuarterly) / tenure
        : remaining / tenure;

    const rows: InstallmentRow[] = [];
    for (let m = 1; m <= tenure; m++) {
        const isQ = numQuarterly > 0 && m % 4 === 0 && Math.floor(m / 4) <= numQuarterly;
        rows.push({
            month: m,
            label: monthLabel(m - 1),
            amount: isQ ? monthlyBase + effectiveQuarterly : monthlyBase,
            isQuarterly: isQ,
        });
    }
    return rows;
}

function n(val: any) {
    const v = parseFloat(val);
    return isNaN(v) ? 0 : v;
}

function BookingForm({
    data = {},
    tokenLocked = false,
    callback,
    btnLabel,
    loading,
    formLoader = false,
    loadError = '',
}: Props) {
    const adminContext: any = useContext(AdminContext);
    const projectUuid = adminContext.projectUuid;
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === projectUuid
    )?.currencyCode || '';

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const blockId = data.plot?.block?.uuid || data.plot?.block?.id || '';
    const [plots, setPlots] = useState<any[]>([]);
    const [plotsLoading, setPlotsLoading] = useState(false);
    const [plotPrice, setPlotPrice] = useState<number>(0);

    const defaultValues = {
        plotId: '',
        tokenAmount: '',
        bookingAmount: '',
        allocationAmount: '',
        confirmationAmount: '',
        startOfWorkAmount: '',
        onPossessionAmount: '',
        quarterlyAmount: '',
        tenure: '',
    };

    const { control, handleSubmit, reset, setValue } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            plotId: data.plot?.uuid || data.plot?.id || '',
            tokenAmount: data.tokenAmount || '',
            bookingAmount: data.bookingAmount || '',
            allocationAmount: data.allocationAmount || '',
            confirmationAmount: data.confirmationAmount || '',
            startOfWorkAmount: data.startOfWorkAmount || '',
            onPossessionAmount: data.onPossessionAmount || '',
            quarterlyAmount: data.quarterlyAmount || '',
            tenure: data.tenure || '',
        },
    });

    const watched = useWatch({ control });

    useEffect(() => {
        let active = true;

        if (tokenLocked) {
            setCategories([]);
            setCategoriesLoading(false);
            return () => { active = false; };
        }

        setCategories([]);
        setCategoryId('');
        setValue('plotId', '');
        setPlotPrice(0);

        if (!projectUuid) {
            setCategoriesLoading(false);
            return () => { active = false; };
        }

        setCategoriesLoading(true);
        GetCategories({ projectUuid })
            .then((items) => {
                if (active) setCategories(items);
            })
            .catch(() => {
                if (active) setCategories([]);
            })
            .finally(() => {
                if (active) setCategoriesLoading(false);
            });

        return () => { active = false; };
    }, [projectUuid, setValue, tokenLocked]);

    useEffect(() => {
        let active = true;

        if (tokenLocked || !projectUuid || !categoryId) {
            setPlots([]);
            setPlotsLoading(false);
            return () => { active = false; };
        }

        setPlotsLoading(true);
        GetPlots({ page: 1, limit: 200 }, {
            projectUuid,
            categoryUuid: categoryId,
            status: 'ACTIVE',
        }).then((res) => {
            if (active) setPlots(res.list || []);
        }).catch(() => {
            if (active) setPlots([]);
        }).finally(() => {
            if (active) setPlotsLoading(false);
        });

        return () => { active = false; };
    }, [categoryId, projectUuid, tokenLocked]);

    // Populate edit data
    useEffect(() => {
        if (Object.keys(data).length) {
            if (data.plot) {
                setPlotPrice(Number(data.plot.price || 0));
                const editCategoryId = data.plot.category?.uuid || data.plot.category?.id;
                if (editCategoryId) setCategoryId(editCategoryId);
            }
            reset({
                plotId: data.plot?.uuid || data.plot?.id || '',
                tokenAmount: data.tokenAmount || '',
                bookingAmount: data.bookingAmount || '',
                allocationAmount: data.allocationAmount || '',
                confirmationAmount: data.confirmationAmount || '',
                startOfWorkAmount: data.startOfWorkAmount || '',
                onPossessionAmount: data.onPossessionAmount || '',
                quarterlyAmount: data.quarterlyAmount || '',
                tenure: data.tenure || '',
            });
        }
    }, [data, reset]);

    const handlePlotChange = (plotId: string) => {
        const plot = plots.find((p) => (p.uuid || p.id) === plotId);
        setPlotPrice(plot?.price || 0);
        setValue('plotId', plotId);
    };

    const installments = computeInstallments(
        plotPrice,
        n(watched.tokenAmount),
        n(watched.bookingAmount),
        n(watched.allocationAmount),
        n(watched.confirmationAmount),
        n(watched.startOfWorkAmount),
        n(watched.onPossessionAmount),
        n(watched.quarterlyAmount),
        n(watched.tenure),
    );

    const fixedTotal = n(watched.tokenAmount) + n(watched.bookingAmount) + n(watched.allocationAmount)
        + n(watched.confirmationAmount) + n(watched.startOfWorkAmount) + n(watched.onPossessionAmount);
    const installmentTotal = installments.reduce((s, r) => s + r.amount, 0);
    const grandTotal = fixedTotal + installmentTotal;

    const fmt = (val: number) => `${currencyCode} ${Math.round(val).toLocaleString()}`;
    const hasTokenUuid = Boolean(data.tokenUuid);

    const onSubmit = (formData: any) => {
        if (!hasTokenUuid) return;
        const _data: any = {
            ...(projectUuid ? { projectUuid } : {}),
            ...(data.customer?.uuid ? { customerUuid: data.customer.uuid } : {}),
            tokenUuid: data.tokenUuid,
            plotId: formData.plotId,
            tokenAmount: n(formData.tokenAmount),
            bookingAmount: n(formData.bookingAmount),
            allocationAmount: n(formData.allocationAmount),
            confirmationAmount: n(formData.confirmationAmount),
            startOfWorkAmount: n(formData.startOfWorkAmount),
            onPossessionAmount: n(formData.onPossessionAmount),
            quarterlyAmount: n(formData.quarterlyAmount),
            tenure: n(formData.tenure),
            installments: installments.map(({ month, label, amount }) => ({
                month,
                label,
                amount: Math.round(amount),
            })),
        };
        callback(_data);
    };

    const amountField = (name: string, label: string) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
                name={name as any}
                control={control}
                rules={{
                    required: { value: true, message: `${label} is required` },
                    min: { value: 0, message: 'Must be 0 or more' },
                }}
                render={({ field, fieldState: { error } }) => (
                    <FormInput
                        fullWidth
                        type="number"
                        error={error}
                        field={field}
                        value={field.value}
                        label={label}
                        disabled={tokenLocked && name === 'tokenAmount'}
                        inputProps={{ step: '1', min: '0' }}
                        InputProps={currencyCode ? {
                            startAdornment: <InputAdornment position="start">{currencyCode}</InputAdornment>,
                        } : undefined}
                    />
                )}
            />
        </Grid>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {loadError ? (
                <Alert severity="error" sx={{ mb: 3 }}>{loadError}</Alert>
            ) : null}
            {tokenLocked && data.customer ? (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="caption" color="text.secondary">Customer</Typography>
                        <Typography variant="h6">
                            {`${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim() || 'Customer'}
                        </Typography>
                        {data.customer.phoneCode || data.customer.phoneNumber ? (
                            <Typography variant="body2" color="text.secondary">
                                {data.customer.phoneCode || ''} {data.customer.phoneNumber || ''}
                            </Typography>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}
            {/* ── Category & Plot selection ── */}
            <Card sx={{ mb: 3 }}>
                <ProgressBar formLoader={loading || formLoader}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>Plot</Typography>
                    <Grid container spacing={3} alignItems="flex-end">
                        {tokenLocked ? (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <FormControl variant="standard" fullWidth disabled>
                                    <InputLabel>Block</InputLabel>
                                    <Select value={blockId} label="Block">
                                        <MenuItem value={blockId}>
                                            {data.plot?.block?.name || 'Selected block'}
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        ) : null}

                        {/* Category */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={categoryId}
                                    label="Category"
                                    disabled={tokenLocked || categoriesLoading}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value);
                                        setValue('plotId', '');
                                        setPlotPrice(0);
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>{categoriesLoading ? 'Loading...' : 'Select category'}</em>
                                    </MenuItem>
                                    {tokenLocked ? (
                                        <MenuItem value={categoryId}>
                                            {data.plot?.category?.name || 'Selected category'}
                                        </MenuItem>
                                    ) : categories.map((c) => (
                                            <MenuItem key={c.uuid || c.id} value={c.uuid || c.id}>
                                                {c.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
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
                                            disabled={tokenLocked || !categoryId || plotsLoading}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handlePlotChange(e.target.value);
                                            }}
                                        >
                                            <MenuItem value="">
                                                <em>
                                                    {plotsLoading ? 'Loading...'
                                                        : !categoryId ? 'Select category first'
                                                        : 'Select plot'}
                                                </em>
                                            </MenuItem>
                                            {!tokenLocked ? plots.map((p) => (
                                                <MenuItem key={p.uuid || p.id} value={p.uuid || p.id}>
                                                    {p.block?.name}-{p.plotNo}
                                                </MenuItem>
                                            )) : (
                                                <MenuItem value={data.plot?.uuid || data.plot?.id}>
                                                    {data.plot?.block?.name}-{data.plot?.plotNo}
                                                </MenuItem>
                                            )}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        {/* Plot price display */}
                        {plotPrice > 0 && (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">Plot Price</Typography>
                                <Typography variant="h6" color="primary" fontWeight={700}>
                                    {fmt(plotPrice)}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* ── Payment breakdown ── */}
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>Payment Breakdown</Typography>
                    <Grid container spacing={3}>
                        {amountField('tokenAmount', 'Token Amount')}
                        {amountField('bookingAmount', 'Booking Amount')}
                        {amountField('allocationAmount', 'Allocation Amount')}
                        {amountField('confirmationAmount', 'Confirmation Amount')}
                        {amountField('startOfWorkAmount', 'Start of Work Amount')}
                        {amountField('onPossessionAmount', 'On Possession Amount')}
                        {amountField('quarterlyAmount', 'Quarterly Amount')}

                        {/* Tenure */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="tenure"
                                control={control}
                                rules={{ required: { value: true, message: 'Tenure is required' } }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl variant="standard" fullWidth error={!!error}>
                                        <InputLabel>Tenure</InputLabel>
                                        <Select {...field} label="Tenure">
                                            <MenuItem value=""><em>Select tenure</em></MenuItem>
                                            {TENURE_OPTIONS.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>

                    {/* Summary bar */}
                    {plotPrice > 0 && fixedTotal > 0 && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Plot Price</Typography>
                                    <Typography variant="body2" fontWeight={600}>{fmt(plotPrice)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Fixed Payments</Typography>
                                    <Typography variant="body2" fontWeight={600}>{fmt(fixedTotal)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Installments Total</Typography>
                                    <Typography variant="body2" fontWeight={600}>{fmt(installmentTotal)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography variant="caption" color="text.secondary">Grand Total</Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={700}
                                        color={Math.round(grandTotal) === plotPrice ? 'success.main' : 'error.main'}
                                    >
                                        {fmt(grandTotal)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ── Installment Schedule ── */}
            {installments.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Monthly Installment Schedule
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({n(watched.tenure)} months · {Math.floor(n(watched.tenure) / 4)} quarterly)
                            </Typography>
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {installments.map((row) => (
                                        <TableRow
                                            key={row.month}
                                            sx={{ bgcolor: row.isQuarterly ? 'warning.50' : 'inherit' }}
                                        >
                                            <TableCell sx={{ fontWeight: 500 }}>{row.label}</TableCell>
                                            <TableCell sx={{ fontWeight: row.isQuarterly ? 700 : 400 }}>
                                                {fmt(row.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {row.isQuarterly
                                                    ? <Chip label="Monthly + Quarterly" color="warning" size="small" />
                                                    : <Chip label="Monthly" size="small" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow sx={{ bgcolor: 'action.selected' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{fmt(installmentTotal)}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            <Box sx={{ mt: 1, textAlign: { xs: 'center', md: 'right' } }}>
                <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={loading}
                    disabled={loading || formLoader || Boolean(loadError) || !hasTokenUuid}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {btnLabel}
                </LoadingButton>
            </Box>
        </form>
    );
}

export default BookingForm;
