import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import Alert from '@mui/material/Alert';
import {ToastContext} from '../hooks/ToastContext';
import {useContext} from "react";

const Toast = ({toast, toastMessage, toastSeverity = 'success', autoHideDuration=1500, vertical='top', horizontal = 'center'}) => {
    const toastContext:any = useContext(ToastContext)
    const handleClose = () => {
        toastContext.setToast(false)
    }

    return (
        <>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={toast}
                onClose={handleClose}
                TransitionComponent={Slide}
                key={Math.random()}
                autoHideDuration={autoHideDuration}>
                <Alert onClose={handleClose} severity={toastSeverity}>{toastMessage}</Alert>
            </Snackbar>
        </>
    )
}

export default Toast