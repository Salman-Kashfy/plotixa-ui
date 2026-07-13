import {useContext, useEffect, useState} from "react";
import {ToastContext} from "../../hooks/ToastContext";
import {useParams} from "react-router-dom";
import {ROUTES} from "../../utils/constants";
import {GetGym, SaveGymOptions} from "../../services/gym.service";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import {Box, Card, CardContent, Typography, FormControlLabel} from '@mui/material';
import {Controller, useForm} from "react-hook-form";
import PageTitle from "../../components/PageTitle";
import Grid from "@mui/material/Grid2";
import Switch from '@mui/material/Switch';
import FormInput from "../../components/FormInput";
import ProgressBar from "../../components/ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";

function GymOptions() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const { id } = useParams();
    const [loader, setLoader] = useState(false);
    const [record, setRecord] = useState({});
    const defaultValues = {
        id: '',
        gsReminder: false,
        gsApiKey: '',
        gsSourceNo: '',
        gsSourceName: '',
        gsTemplate: '',
    }
    const {control, handleSubmit, setValue, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const gsReminder = watch('gsReminder')

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key] || '') : data[key]
        }
        reset(_data)
    }

    const fetchGym = () => {
        setLoader(true)
        GetGym(id).then((gym) => {
            setRecord(gym)
            initializeForm(gym)
            setLoader(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.GYM.LIST, name: 'Gyms' }, {to: record?.id ? ROUTES.GYM.VIEW(record.id) : undefined, name: record?.name || '...' }, {name: 'Gym Options' }])
    }, [record]);

    useEffect(() => {
        fetchGym()
    }, []);

    const onSubmit = (data) => {
        setLoader(true)
        SaveGymOptions(data).then((data) => {
            if(data.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(data.errorMessage)
            }
            toastContext.setToast(true)
            setLoader(false)
        })
    }

    return (
        <>
            <PageTitle title={'Gym Options'} backTo={ROUTES.GYM.LIST}/>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card sx={{mb:3}}>
                    <ProgressBar formLoader={loader}/>
                    <CardContent sx={{p:3}}>
                        <Typography variant="h6" sx={{mb:3}}>WhatsApp Reminder</Typography>
                        <FormControlLabel
                            control={
                                <Switch checked={gsReminder} onChange={(e) => setValue('gsReminder',e.target.checked)} name="gsReminder" />
                            }
                            label={gsReminder ? 'Enabled' : 'Disabled'}
                            sx={{mb:1}}
                        />
                        {
                            gsReminder ?
                                <Grid container spacing={2}>
                                    <Grid size={3}>
                                        <Controller name="gsApiKey" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "API Key is required"
                                                },
                                                maxLength: {
                                                    value: 250,
                                                    message: "Gym name must not exceed 250 characters"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'GupShup API Key'}/>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={3}>
                                        <Controller name="gsSourceNo" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Source no. is required"
                                                },
                                                maxLength: {
                                                    value: 18,
                                                    message: "Source no. must not exceed 18 characters"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Source No.'}/>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={3}>
                                        <Controller name="gsSourceName" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Source name is required"
                                                },
                                                maxLength: {
                                                    value: 30,
                                                    message: "Source name must not exceed 30 characters"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'Source Name'}/>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={3}>
                                        <Controller name="gsTemplate" control={control}
                                            rules={{
                                                required: {
                                                    value: "required",
                                                    message: "Template ID is required"
                                                }
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} label={'GupShup Template ID'}/>
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            :<></>
                        }
                    </CardContent>
                </Card>
                <Box sx={{textAlign: 'right', marginTop: 3}}>
                    <LoadingButton variant="contained" type="submit" loading={loader} disabled={loader}>Update</LoadingButton>
                </Box>
            </form>
        </>
    )
}
export default GymOptions