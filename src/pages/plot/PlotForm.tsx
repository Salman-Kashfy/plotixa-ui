import { useContext, useEffect } from 'react';
import { Box, Card, CardContent, Typography, InputAdornment } from '@mui/material';
import { AdminContext } from '../../hooks/AdminContext';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import PlotLocationFields from './PlotLocationFields';

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

function PlotForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const adminContext: any = useContext(AdminContext);
    const currencyCode = adminContext.projects?.find(
        (p: any) => p.uuid === adminContext.projectUuid
    )?.currencyCode || '';
    const defaultValues = {
        blockId: '',
        categoryId: '',
        plotNo: '',
        price: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            blockId: data.block?.uuid || '',
            categoryId: data.category?.uuid || '',
            plotNo: data.plotNo ?? '',
            price: data.price || '',
        },
    });

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                blockId: data.block?.uuid || '',
                categoryId: data.category?.uuid || '',
                plotNo: data.plotNo ?? '',
                price: data.price || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: any) => {
        const _data: any = {
            projectUuid: adminContext.projectUuid,
            blockUuid: formData.blockId,
            categoryUuid: formData.categoryId,
            plotNo: Number(formData.plotNo),
            price: Number(formData.price),
        };
        callback(_data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading || formLoader}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Plot Details</Typography>
                    <Grid container spacing={3}>

                        <PlotLocationFields control={control} />

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="plotNo"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Plot number is required' },
                                    validate: (value) => {
                                        const plotNo = Number(value);
                                        return Number.isInteger(plotNo) && plotNo >= 1 && plotNo <= 1_000_000
                                            ? true
                                            : 'Enter a whole number from 1 to 1,000,000';
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Plot No."
                                        params={{ inputProps: { step: '1', min: '1', max: '1000000' } }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Price */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="price"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Price is required' },
                                    validate: (value) => {
                                        const price = Number(value);
                                        return Number.isFinite(price) && price >= 0 &&
                                            Number.isInteger(price)
                                            ? true
                                            : 'Enter a non-negative whole number';
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
                                        params={{ inputProps: { step: '1', min: '0' } }}
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

export default PlotForm;
