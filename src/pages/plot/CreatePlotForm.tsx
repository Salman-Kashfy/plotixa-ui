import { useContext } from 'react';
import {
    Box, Card, CardContent, InputAdornment, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { AdminContext } from '../../hooks/AdminContext';
import PlotLocationFields from './PlotLocationFields';

type FormValues = {
    blockId: string;
    categoryId: string;
    startPlotNo: string;
    endPlotNo: string;
    price: string;
};

type Props = {
    callback: (data: {
        projectUuid: string;
        blockUuid: string;
        categoryUuid: string;
        startPlotNo: number;
        endPlotNo?: number;
        price: number;
    }) => void;
    btnLabel: string;
    loading: boolean;
};

const MAX_PLOT_NO = 1_000_000;
const MAX_PLOTS_PER_REQUEST = 1_000;

function CreatePlotForm({ callback, btnLabel, loading }: Props) {
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (project: any) => project.uuid === adminContext.projectUuid
    )?.currencyCode || '';
    const { control, handleSubmit, getValues } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
            blockId: '',
            categoryId: '',
            startPlotNo: '',
            endPlotNo: '',
            price: '',
        },
    });

    const onSubmit = (formData: FormValues) => {
        const endPlotNo = formData.endPlotNo ? Number(formData.endPlotNo) : undefined;
        callback({
            projectUuid: adminContext.projectUuid,
            blockUuid: formData.blockId,
            categoryUuid: formData.categoryId,
            startPlotNo: Number(formData.startPlotNo),
            ...(endPlotNo === undefined ? {} : { endPlotNo }),
            price: Number(formData.price),
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Plot Details</Typography>
                    <Grid container spacing={3}>
                        <PlotLocationFields control={control} />
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="startPlotNo"
                                control={control}
                                rules={{
                                    deps: 'endPlotNo',
                                    required: 'Starting plot number is required',
                                    validate: (value) => {
                                        const number = Number(value);
                                        return Number.isInteger(number) && number >= 1 && number <= MAX_PLOT_NO
                                            ? true
                                            : `Enter a whole number from 1 to ${MAX_PLOT_NO.toLocaleString()}`;
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Start Plot No."
                                        params={{ inputProps: { step: '1', min: '1', max: MAX_PLOT_NO } }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="endPlotNo"
                                control={control}
                                rules={{
                                    validate: (value) => {
                                        if (!value) return true;
                                        const end = Number(value);
                                        const start = Number(getValues('startPlotNo'));
                                        if (!Number.isInteger(end) || end < 1 || end > MAX_PLOT_NO) {
                                            return `Enter a whole number from 1 to ${MAX_PLOT_NO.toLocaleString()}`;
                                        }
                                        if (end < start) return 'End plot number must be at least the start number';
                                        if (end - start + 1 > MAX_PLOTS_PER_REQUEST) {
                                            return `You can create at most ${MAX_PLOTS_PER_REQUEST.toLocaleString()} plots at a time`;
                                        }
                                        return true;
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="End Plot No. (optional)"
                                        params={{ inputProps: { step: '1', min: '1', max: MAX_PLOT_NO } }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="price"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Price is required' },
                                    validate: (value) => {
                                        const price = Number(value);
                                        return Number.isInteger(price) && price > 0
                                            ? true
                                            : 'Enter a whole number greater than 0';
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Price"
                                        params={{ inputProps: { step: '1', min: '1' } }}
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
    );
}

export default CreatePlotForm;
