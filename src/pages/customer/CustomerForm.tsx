import { useEffect, type FormEvent } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import type { Customer, CustomerFields } from '../../services/customer.service';

type Props = {
    data?: Partial<Customer>;
    callback: (data: CustomerFields) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
};

function CustomerForm({ data = {}, callback, btnLabel, loading, formLoader = false }: Props) {
    const defaultValues = {
        uuid: '',
        firstName: '',
        lastName: '',
        phoneCode: '',
        phoneNumber: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            uuid: data.uuid || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phoneCode: data.phoneCode || '',
            phoneNumber: data.phoneNumber || '',
        },
    });

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                uuid: data.uuid || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                phoneCode: data.phoneCode || '',
                phoneNumber: data.phoneNumber || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: typeof defaultValues) => {
        const _data: CustomerFields = {
            phoneCode: formData.phoneCode,
            phoneNumber: formData.phoneNumber,
            firstName: formData.firstName,
            lastName: formData.lastName,
        };
        if (formData.uuid) _data.uuid = formData.uuid;
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
                                name="firstName"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Name is required' },
                                    maxLength: { value: 100, message: 'First name must not exceed 100 characters' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="First Name"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Controller
                                name="lastName"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Last name is required' },
                                    maxLength: { value: 100, message: 'Last name must not exceed 100 characters' },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <FormInput
                                        fullWidth
                                        error={error}
                                        field={field}
                                        value={field.value}
                                        label="Last Name"
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
                                            onInput={(e: FormEvent<HTMLInputElement>) => {
                                                e.currentTarget.value = e.currentTarget.value
                                                    .replace(/[^\d+]/g, '')
                                                    .replace(/(?!^)\+/g, '')
                                                    .slice(0, 5);
                                            }}
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
                                            onInput={(e: FormEvent<HTMLInputElement>) => {
                                                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 15);
                                            }}
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
                    loading={loading || formLoader}
                    disabled={loading || formLoader}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {btnLabel}
                </LoadingButton>
            </Box>
        </form>
    );
}

export default CustomerForm;
