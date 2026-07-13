import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useParams} from "react-router-dom";
import {Controller, useForm} from "react-hook-form";
import {ROUTES} from "../../utils/constants";
import {Alert, Box, IconButton, InputAdornment, TextField, Typography} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {isValidPassword} from "../../utils/validations";
import CircularProgress from "@mui/material/CircularProgress";
import {ValidateInvite,Invite} from "../../services/auth/reset.password";

function Invitation() {
    const navigate = useNavigate()
    const { inviteLink } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadBtn, setLoadBtn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [title, setTitle] = useState('');
    const [validLink, setValidLink] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    const {control, handleSubmit} = useForm({mode: "onChange", defaultValues: {password: '', inviteLink}})

    const onSubmit = async (data) => {
        setErrorMessage('')
        setLoadBtn(true)
        Invite(data).then((data) => {
            if (data.status) {
                navigate(ROUTES.AUTH.LOGIN)
            } else {
                setErrorMessage(data.errorMessage)
            }
            setLoadBtn(false)
        }).catch((e) => {
            setLoadBtn(false)
            setErrorMessage(e.message)
        })

    }

    const validateLink = async () => {
        ValidateInvite(inviteLink).then((data) => {
            if (data.status) {
                setValidLink(true)
                setTitle(data.admin.firstName)
            } else {
                setErrorMessage('Invalid or expired link')
            }
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
            setErrorMessage(e.message)
        })
    }

    useEffect( () => {
        validateLink()
    },[])

    return (
        <Box>
            {
                errorMessage ? <Alert severity="error" sx={{mb: 3}}>{errorMessage}</Alert> : <></>
            }
            <>
                {
                    loading ?
                    <Box sx={{textAlign: 'center'}}>
                        <CircularProgress sx={{mt:2.5}}/>
                        <Typography variant="h6" sx={{mt: 1}}>Verifying</Typography>
                    </Box> : <></>

                }
            </>
            {
                validLink ?
                    <Box>
                        <Typography variant="h6" sx={{mb:0.5, fw: 500}}>Welcome, {title}!</Typography>
                        <Typography variant="subtitle1" sx={{mb:2}}>Setup your account password</Typography>
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                            <Box sx={{textAlign: 'right'}}>
                                <LoadingButton variant="contained" type="submit" loading={loadBtn}>Set Password</LoadingButton>
                            </Box>
                        </form>
                    </Box>
                :<></>
            }
        </Box>
    )
}
export default Invitation