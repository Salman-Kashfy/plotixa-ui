import {useContext, useState} from 'react'
import {useNavigate} from "react-router";
import {Box, Alert, Typography, Button} from '@mui/material';
import {InputLabel, Input} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {TextField, InputAdornment, IconButton} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {useForm, Controller} from "react-hook-form"
import {OTP_CHANNEL, ROUTES} from "../../utils/constants";
import OtpInput from 'react-otp-input';
import ProgressBar from "../../components/ProgressBar";
import {isValidEmail, isValidPassword} from "../../utils/validations";
import {NavLink} from "react-router-dom";
import {CreateOtp, ResetPassword, VerifyOtp} from "../../services/auth/reset.password";
import {ToastContext} from "../../hooks/ToastContext";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

enum StepForm {
    VERIFY_IDENTIFIER = 'VERIFY_IDENTIFIER',
    VERIFY_OTP = 'VERIFY_OTP',
    SET_PASSWORD = 'SET_PASSWORD',
}

function ForgotPassword() {
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const resetForm = useForm({ mode: "onChange", defaultValues: {identifier: '', type: 'PASSWORD_RESET', channel: OTP_CHANNEL.EMAIL}})
    const otpForm = useForm({ mode: "onChange", defaultValues: {code: ''}})
    const passwordForm = useForm({ mode: "onChange", defaultValues: {password: ''}})

    /**
    * Step form toggler
    * */
    const [title, setTitle] = useState('Account Recovery')
    const [step, setStep] = useState<StepForm>(StepForm.VERIFY_IDENTIFIER);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    const changeStep = (_step:StepForm) => {
        switch (_step) {
            case StepForm.VERIFY_IDENTIFIER:
                setTitle('Account Recovery')
                break
            case StepForm.VERIFY_OTP:
                setTitle('Verify OTP')
                break
            case StepForm.SET_PASSWORD:
                setTitle('Update Password')
                break
        }
        setStep(_step)
    }

    const createOtp = async (data) => {
        setLoading(true)
        setErrorMessage('')
        CreateOtp(data).then((response) => {
            if(response.status){
                changeStep(StepForm.VERIFY_OTP)
            }else{
                setErrorMessage(response.errorMessage)
            }
            setLoading(false)
        }).catch((e) => {
            console.log(e)
            setLoading(false)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Something went wrong. Please contact support.')
            toastContext.setToast(true)
        })
    }

    const verifyOtp = async (data) => {
        setLoading(true)
        setErrorMessage('')
        const values = resetForm.getValues();
        VerifyOtp({...data,...values}).then((response) => {
            if(response.status){
                changeStep(StepForm.SET_PASSWORD)
            }else{
                setErrorMessage(response.errorMessage)
            }
            setLoading(false)
        }).catch((e) => {
            console.log(e)
            setLoading(false)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Something went wrong. Please contact support.')
            toastContext.setToast(true)
        })
    }

    const resetPassword = async (data) => {
        setLoading(true)
        setErrorMessage('')
        ResetPassword({...data,...resetForm.getValues(),...otpForm.getValues(),...passwordForm.getValues()}).then((response) => {
            if(response.status){
                navigate(ROUTES.AUTH.LOGIN)
            }else{
                setErrorMessage(response.errorMessage)
            }
            setLoading(false)
        }).catch((e) => {
            console.log(e)
            setLoading(false)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Something went wrong. Please contact support.')
            toastContext.setToast(true)
        })
    }

    return (
        <Box>
            <Box sx={{position: 'absolute', width: '100%', top: 0, left: 0}}>
                <ProgressBar formLoader={loading} />
            </Box>
            {
                errorMessage ? <Alert severity="error" sx={{mb: 3}}>{errorMessage}</Alert> : <></>
            }
            <Typography variant="h6" sx={{mb: 1, fw: 500}}>
                {
                    step !== StepForm.VERIFY_IDENTIFIER ?
                        <IconButton onClick={() => step === StepForm.VERIFY_OTP ? changeStep(StepForm.VERIFY_IDENTIFIER) : changeStep(StepForm.VERIFY_OTP) } sx={{ mr: 1 }}>
                            <KeyboardBackspaceIcon />
                        </IconButton> : <></>
                }
                {title}
            </Typography>
            <Box>
                {
                    step === StepForm.VERIFY_IDENTIFIER ?
                        <form onSubmit={resetForm.handleSubmit(createOtp)}>
                            <Controller name="identifier" control={resetForm.control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Email is required"
                                    },
                                    maxLength: {
                                        value: 100,
                                        message: "Email must not be exceed 100 characters"
                                    },
                                    validate: (value) => {
                                        if(value){
                                            if(value.length>100){
                                                return "Email must not exceed 100 characters."
                                            }else if(!isValidEmail(value)){
                                                return "Invalid email format."
                                            }
                                        }
                                        return true;
                                    }
                                }}
                                render={({field, fieldState: {error}}) => (
                                    <TextField {...field} error={!!error} variant="standard" label="Email" fullWidth sx={{mb: 2}} helperText={error ? error.message : ''}>
                                        <InputLabel>Email address</InputLabel>
                                        <Input fullWidth={true}/>
                                    </TextField>
                                )}
                            />
                            <Box sx={{mb: 3}}>
                                <Button size="small" component={NavLink} to={ROUTES.AUTH.LOGIN}>Already have an account</Button>
                            </Box>
                            <Box sx={{textAlign: 'right', mt: 3}}>
                                <LoadingButton variant="contained" type="submit" loading={loading}>Next</LoadingButton>
                            </Box>
                        </form>
                    : <></>
                }
            </Box>
            <Box>
                {
                    step === StepForm.VERIFY_OTP ?
                        <form onSubmit={otpForm.handleSubmit(verifyOtp)}>
                            <Typography variant="subtitle1">An otp has been sent to your email.</Typography>
                            <Controller name="code" control={otpForm.control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Otp is required"
                                    }
                                }}
                                render={({field, fieldState: {error}}) => (
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                                        <OtpInput
                                            value={field.value}
                                            onChange={(event) => field.onChange(event)}
                                            numInputs={5}
                                            renderSeparator={<span style={{marginRight: '10px'}}></span>}
                                            inputStyle={{
                                                width: '45px',
                                                height: '45px',
                                                fontSize: '18px',
                                                border: '0',
                                                borderBottom: '2px solid #aaa',
                                                outline: 'none'
                                            }}
                                            renderInput={(props) => <input {...props} />}/>
                                    </Box>
                                )}
                            />
                            <Box sx={{textAlign: 'right', mt: 3}}>
                                <LoadingButton variant="contained" type="submit" loading={loading}>Verify</LoadingButton>
                            </Box>
                        </form>
                    : <></>
                }
            </Box>
            <Box>
                {
                    step === StepForm.SET_PASSWORD ?
                        <form onSubmit={otpForm.handleSubmit(resetPassword)}>
                            <Typography variant="subtitle1" sx={{mb: 2}}>Reset your password</Typography>
                            <Controller name="password" control={passwordForm.control}
                                rules={{
                                    required: {
                                        value: "required",
                                        message: "Password is required"
                                    },
                                    maxLength: {
                                        value: 64,
                                        message: "Password must not be exceed 64 characters"
                                    },
                                    minLength: {
                                        value: 8,
                                        message: "Password must have at least 8 characters"
                                    },
                                    validate: (value:string) => {
                                        if(value && !isValidPassword(value)){
                                            return 'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character'
                                        }
                                    }
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
                            <Box sx={{textAlign: 'right', mt: 3}}>
                                <LoadingButton variant="contained" type="submit" loading={loading}>Reset Password</LoadingButton>
                            </Box>
                        </form>
                    : <></>
                }
            </Box>
        </Box>
    )
}

export default ForgotPassword