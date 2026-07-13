import {useEffect, useState} from 'react'
import {TextField, InputLabel, Box, Card, CardContent, Typography, FormControl, MenuItem} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Select from '@mui/material/Select';
import {GLOBAL_STATUSES, ROLE} from "../../utils/constants";
import {Controller, useForm} from "react-hook-form";
import {hasRole} from "../../utils/permissions";
import {GetGyms} from "../../services/gym.service";
import ProgressBar from "../ProgressBar";
import LoadingButton from "@mui/lab/LoadingButton";
import {isEmpty} from "lodash";

function ServiceForm({record = {}, callback, btnLabel, loading, formLoader = false}) {
    const [gymId, setGymId] = useState({});
    const [gyms, setGyms] = useState([]);
    const defaultValues = {
        id: '',
        name: '',
        status: '',
    }

    const {control, handleSubmit, formState: {errors}, setValue, getValues, watch, reset} = useForm({
        mode: "onChange",
        defaultValues
    })

    const handleGymChange = (event: any, value: { value: string, label: string } | null) => {
        setValue('gymId', value?.value)
        setGymId({label: value?.label, value: value?.value})
    }

    const fetchGyms = () => {
        GetGyms({limit:0}).then(({list}:any) => {
            setGyms(list.map((e:any) => {
                return { value: e.id, label: e.name }
            }))
        }).catch((e) => {
            console.log(e.message)
        })
    }

    const onSubmit = async (data) => {
        delete data?.gym
        delete data?.brand
        delete data?.country
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            if(key === 'id' && !data[key]){
                continue
            }
            _data[key] = data[key]
        }
        callback(_data)
    };

    const initializeForm = (data) => {
        const _data = {}
        for (const key of Object.keys(defaultValues)) {
            _data[key] = ['string', 'number'].includes(typeof data[key]) ? (data[key].toString() || '') : data[key]
        }
        reset(_data)
    }

    useEffect(() => {
        if(hasRole(ROLE.SUPER_ADMIN)){
            fetchGyms()
        }
    }, [])

    useEffect(() => {
        if(!isEmpty(record)){
            initializeForm(record)
        }
    }, [record]);

    useEffect(() => {
        if(gyms.length && !isEmpty(record)){
            const gym = gyms.find((e) => e.value === record.gymId)
            if(gym){
                setGymId({label: gym.label, value: gym.value})
            }
        }
    }, [record, gyms]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
                <Grid size={9}>
                    <Card sx={{mb:3}}>
                        <ProgressBar formLoader={loading || formLoader}/>
                        <CardContent sx={{p:3}}>
                            <Typography variant="h6" sx={{mb:3}}>Service Details</Typography>
                            <Grid container spacing={3}>
                                <Grid size={6}>
                                    <Controller name="name" control={control}
                                                rules={{
                                                    required: {
                                                        value: "required",
                                                        message: "Name is required"
                                                    },
                                                    maxLength: {
                                                        value: 25,
                                                        message: "Name must not exceed 25 characters"
                                                    },
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <TextField {...field} error={!!error} variant="standard" label="Name" fullWidth={true}/>
                                                )}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <Controller name="status" control={control}
                                                rules={{
                                                    required: {
                                                        value: "required",
                                                        message: "Status is required"
                                                    },
                                                }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <FormControl variant={'standard'} fullWidth={true}>
                                                        <InputLabel>Status</InputLabel>
                                                        <Select label="Status" {...field} value={field.value || ''} error={!!error}>
                                                            { Object.keys(GLOBAL_STATUSES).map((_status) => {
                                                                return (<MenuItem value={_status} key={_status}>{_status}</MenuItem>)
                                                            }) }
                                                        </Select>
                                                    </FormControl>
                                                )}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    <Box sx={{textAlign: 'right', marginTop: 3}}>
                        <LoadingButton variant="contained" type="submit" loading={loading} disabled={loading}>{btnLabel}</LoadingButton>
                    </Box>
                </Grid>
            </Grid>
        </form>
    )
}

export default ServiceForm
