import {Box, Card, CardContent, Input, Typography, CircularProgress} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import {blue, grey} from "@mui/material/colors";
import {useContext, useState} from "react";
import {ToastContext} from "../hooks/ToastContext";
import CloseIcon from '@mui/icons-material/Close';
import {UploadFile,DeleteFile} from '../services/common.service';
import {apiUrl, constants} from "../utils/constants";

function UploadImage({id, title, alt, callback, preview, setPreview}) {
    const [loading, setLoading] = useState(false);
    const [filename, setFilename] = useState('');
    const toastContext:any = useContext(ToastContext)
    const onUpload = function (e) {
        let error:string = ''
        const file = e.target.files[0]
        const fileSize = 1000 * 1000 // 1MB
        const extension = file.type.split("/").pop()
        if(file.size > fileSize){
            error = 'File size must not exceed 1MB'
        }else if(!['jpeg','jpg','png'].includes(extension)){
            error = 'Only .png, .jpg allowed'
        }
        if(error){
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage(error)
            toastContext.setToast(true)
            e.target.value = '';
            setPreview('')
            callback('')
            return
        }
        setLoading(true)
        const reader = new FileReader();
        reader.onload = function (e) {
            UploadFile(constants.API_URL+apiUrl.uploadImage,file)
            .then((response) => {
                if(response.status){
                    setPreview(e.target.result)
                    setFilename(response.file_uploaded)
                    callback(response.file_uploaded)
                }else{
                    toastContext.setToastSeverity('error')
                    toastContext.setToastMessage(response.message)
                    toastContext.setToast(true)
                    e.target.value = '';
                    clearFileInput()
                }
                setLoading(false)
            }).catch((error) => {
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(error.message)
                toastContext.setToast(true)
                e.target.value = '';
                clearFileInput()
                setLoading(false)
            })
        }
        reader.readAsDataURL(file);
    }

    const clearFileInput = () => {
        const fileInput = document.getElementById(id);
        if (fileInput) {
            fileInput.value = '';
        }
    }

    const removePicture = async () => {
        clearFileInput()
        setPreview('')
        callback('')
        if(filename) {
            await DeleteFile(constants.API_URL+apiUrl.deleteFile,filename)
        }
    }
    return (
        <Card>
            <CardContent sx={{p:3}}>
                { preview ?
                    <Box className={'upload-image-container'} sx={{position: 'relative'}}>
                        <Box sx={{
                            position: 'absolute',
                            display: loading ? 'flex' : 'none',
                            zIndex: 3,
                            height: '100%',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.8)'
                        }}>
                            <CircularProgress/>
                        </Box>
                        <Box sx={{
                            position: 'absolute',
                            display: loading ? 'none' : 'inline',
                            zIndex: 2,
                            top: 0,
                            right:0,
                            padding: 1,
                            cursor: 'pointer'
                        }}>
                            <CloseIcon onClick={removePicture} color="primary" sx={{textShadow: '0 1px 1px 1px rgba(0, 0, 0, 0.2)'}}/>
                        </Box>
                        <img src={preview} alt={alt}/>
                    </Box>
                    :
                    <label htmlFor={id}>
                        <Box sx={{border: '2px dashed rgb(204, 204, 204)',textAlign: 'center', p:3, cursor: loading || preview ? 'default' : 'pointer'}}>
                            <AddPhotoAlternateIcon sx={{fontSize: '60px', color: blue[700]}} />
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="subtitle2" sx={{color: grey[400]}}>(Only .png, .jpg allowed)</Typography>
                            <Input type="file" id={id} sx={{display: 'none'}} onChange={onUpload}/>
                        </Box>
                    </label>
                }
            </CardContent>
        </Card>
    )
}
export default UploadImage