import {useState, useContext} from 'react'
import {useNavigate} from "react-router";
import {Box, Alert, Typography, Button} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {TextField, InputAdornment, IconButton} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {NavLink} from "react-router-dom"
import {useForm, Controller} from "react-hook-form"
import {AdminContext} from '../../hooks/AdminContext';
import {AdminLogin, UserPermissions} from "../../services/auth/auth.service";
import {GetProjects} from "../../services/projects.service";
import {ROUTES, SUBSCRIPTION_STATUS, constants} from "../../utils/constants";
import FormInput from "../../components/FormInput";

function Signin() {
    const adminContext: any = useContext(AdminContext)
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const {control, handleSubmit} = useForm({
        mode: "onChange",
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        await AdminLogin(data).then((data) => {
            if (data.status) {
                adminContext.setAdmin(data.admin)
                adminContext.setToken(data.token)
                const developerUuid = data.admin?.developerUuid
                Promise.all([
                    UserPermissions(),
                    GetProjects(developerUuid),
                ]).then(([permissionsResponse, projectsResponse]) => {
                    setLoading(false)
                    adminContext.setPermissions(permissionsResponse.data)
                    if (projectsResponse?.status && projectsResponse.data?.length) {
                        const firstProjectUuid = projectsResponse.data[0].uuid
                        localStorage.setItem(constants.PROJECT_UUID, firstProjectUuid)
                        adminContext.setProjectUuid(firstProjectUuid)
                    }
                    if (permissionsResponse.status) {
                        if(permissionsResponse.data.admin?.subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED){
                            navigate(ROUTES.SUBSCRIPTION.BILLING)
                        }else{
                            navigate(ROUTES.DASHBOARD)
                        }
                    } else {
                        setErrorMessage('Permission denied!')
                    }
                }).catch((error) => {
                    setLoading(false)
                    console.log(error)
                    setErrorMessage(error.response.data.message)
                })
            } else {
                setErrorMessage(data.message)
                setLoading(false)
            }
        }).catch((error) => {
            setLoading(false)
            setErrorMessage(error.response.data.message)
        })
    };

    return (
        <Box>
            {
                errorMessage ? <Alert severity="error" sx={{mb: 3}}>{errorMessage}</Alert> : <></>
            }
            <Typography variant="h6" sx={{mb: 3, fw: 500}}>Welcome</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller name="email" control={control}
                    rules={{
                        required: {
                            value: "required",
                            message: "Email is required"
                        },
                        maxLength: {
                            value: 100,
                            message: "Email must not be exceed 100 characters"
                        },
                    }}
                    render={({field, fieldState: {error}}) => (
                        <FormInput fullWidth={true} error={error} field={field} value={field.value || ''} sx={{mb: 2}} helperText={error ? error.message : ''} label={'Email'}/>
                    )}
                />
                <Controller name="password" control={control}
                    rules={{
                        required: {
                            value: "required",
                            message: "Password is required"
                        },
                        maxLength: {
                            value: 64,
                            message: "Password must not be exceed 64 characters"
                        },
                    }}
                    render={({field, fieldState: {error}}) => (
                        <TextField variant="standard" {...field} error={!!error}
                             type={showPassword ? 'text' : 'password'} label="Password" sx={{mb: 3}}
                             fullWidth helperText={error ? error.message : ''}
                             InputProps={{
                                 endAdornment: (
                                     <InputAdornment position="end">
                                         <IconButton
                                             onClick={handleTogglePasswordVisibility}
                                             edge="end">
                                             {showPassword ? <VisibilityOff/> : <Visibility/>}
                                         </IconButton>
                                     </InputAdornment>
                                 ),
                             }}
                        />
                    )}
                />
                <Box sx={{mb: 3}}>
                    <Button size="small" component={NavLink} to={ROUTES.AUTH.FORGOT_PASSWORD}>Forgot password</Button>
                </Box>
                <Box sx={{textAlign: 'right'}}>
                    <LoadingButton variant="contained" type="submit" loading={loading}>Sign in</LoadingButton>
                </Box>
            </form>
        </Box>
    )
}

export default Signin
