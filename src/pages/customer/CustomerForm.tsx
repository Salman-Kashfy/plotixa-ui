import { useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import { numberOnly } from '../../utils/validations';

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

function CustomerForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const defaultValues = {
        id: '',
        name: '',
        phoneCode: '',
        phoneNumber: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            id: data.id || '',
            name: data.name || '',
            phoneCode: data.phoneCode || '',
            phoneNumber: data.phoneNumber || '',
        },
    });

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                id: data.id || '',
                name: data.name || '',
                phoneCode: data.phoneCode || '',
                phoneNumber: data.phoneNumber || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: any) => {
        const _data: any = {
            name: formData.name,
            phoneCode: formData.phoneCode,
            phoneNumber: formData.phoneNumber,
        };
        if (formData.id) _data.id = formData.id;
        callback(_data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading || formLoader}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Customer Details</Typography>
                    <Grid container spacing={3}>

                        {/* Name */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Name is required' },
                                    maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Name"
                                    />
                                )}
                            />
                        </Grid>

                        {/* Phone Code + Phone Number */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Controller
                                    name="phoneCode"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: 'Required' },
                                        maxLength: { value: 5, message: 'Max 5 chars' },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput
                                            error={error}
                                            field={field}
                                            value={field.value}
                                            label="Code"
                                            sx={{ width: 90, flexShrink: 0 }}
                                            onInput={(e) => numberOnly(e, 5, false)}
                                        />
                                    )}
                                />
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: 'Phone number is required' },
                                        maxLength: { value: 15, message: 'Must not exceed 15 digits' },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput
                                            fullWidth
                                            error={error}
                                            field={field}
                                            value={field.value}
                                            label="Phone Number"
                                            onInput={(e) => numberOnly(e, 15, false)}
                                        />
                                    )}
                                />
                            </Box>
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

export default CustomerForm;
