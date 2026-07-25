import { useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem, FormHelperText,
    InputAdornment, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller, useWatch } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { GetPlots } from '../../services/plot.service';
import { AdminContext } from '../../hooks/AdminContext';
import { TENURE_OPTIONS } from '../../utils/constants';

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

type InstallmentRow = { month: number; amount: number; isQuarterly: boolean };

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

    // If quarterly is user-specified and non-zero, use it; otherwise auto from perSlot
    const effectiveQuarterly = quarterly > 0 ? quarterly : perSlot;
    const monthlyFromQuarterly = numQuarterly > 0
        ? (remaining - effectiveQuarterly * numQuarterly) / tenure
        : remaining / tenure;

    const rows: InstallmentRow[] = [];
    for (let m = 1; m <= tenure; m++) {
        const isQ = numQuarterly > 0 && m % 4 === 0 && Math.floor(m / 4) <= numQuarterly;
        rows.push({
            month: m,
            amount: isQ ? monthlyFromQuarterly + effectiveQuarterly : monthlyFromQuarterly,
            isQuarterly: isQ,
        });
    }
    return rows;
}

function n(val: any) {
    const v = parseFloat(val);
    return isNaN(v) ? 0 : v;
}

function BookingForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';

    const [plots, setPlots] = useState<any[]>([]);
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
            plotId: data.plot?.id || '',
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

    // Fetch plots on mount
    useEffect(() => {
        GetPlots({ page: 1, limit: 200 }, {}).then((res) => setPlots(res.data || []));
    }, []);

    // Populate price when plot is pre-selected (edit mode)
    useEffect(() => {
        if (Object.keys(data).length) {
            if (data.plot) setPlotPrice(data.plot.price || 0);
            reset({
                plotId: data.plot?.id || '',
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
        const plot = plots.find((p) => p.id === plotId);
        setPlotPrice(plot?.price || 0);
        setValue('plotId', plotId);
    };

    // Compute installments reactively
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

    const fmt = (val: number) =>
        `${currencyCode} ${Math.round(val).toLocaleString()}`;

    const onSubmit = (formData: any) => {
        const _data: any = {
            plotId: formData.plotId,
            tokenAmount: n(formData.tokenAmount),
            bookingAmount: n(formData.bookingAmount),
            allocationAmount: n(formData.allocationAmount),
            confirmationAmount: n(formData.confirmationAmount),
            startOfWorkAmount: n(formData.startOfWorkAmount),
            onPossessionAmount: n(formData.onPossessionAmount),
            quarterlyAmount: n(formData.quarterlyAmount),
            tenure: n(formData.tenure),
            installments: installments.map(({ month, amount }) => ({ month, amount: Math.round(amount) })),
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
            {/* ── Plot selection ── */}
            <Card sx={{ mb: 3 }}>
                <ProgressBar formLoader={loading || formLoader}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>Plot</Typography>
                    <Grid container spacing={3} alignItems="flex-end">
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
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                handlePlotChange(e.target.value);
                                            }}
                                        >
                                            <MenuItem value=""><em>Select plot</em></MenuItem>
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

                    {/* Summary row */}
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
                                            <TableCell>Month {row.month}</TableCell>
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
                    disabled={loading}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {btnLabel}
                </LoadingButton>
            </Box>
        </form>
    );
}

export default BookingForm;
