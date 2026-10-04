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
        id: '',
        blockId: '',
        categoryId: '',
        price: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            blockId: data.block?.uuid,
            categoryId: data.category?.uuid,
            price: data.price || '',
        },
    });

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                id: data.id || '',
                blockId: data.block?.uuid,
                categoryId: data.category?.uuid,
                price: data.price || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: any) => {
        const _data: any = {
            blockId: formData.blockId,
            categoryId: formData.categoryId,
            price: Number(formData.price),
        };
        if (formData.id) _data.id = formData.id;
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

                        {/* Price */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="price"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Price is required' },
                                    min: { value: 1, message: 'Price must be greater than 0' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        type="number"
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Price"
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
