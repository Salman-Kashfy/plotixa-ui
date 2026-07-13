import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from "@mui/lab/LoadingButton";

export default function AppDialog({open,handleDialogClose,title,body,dialogBtnLoading,dialogBtnLabel,onSubmit}) {
    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleDialogClose}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{body}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    {onSubmit && <LoadingButton variant="contained" loading={dialogBtnLoading} disabled={dialogBtnLoading} onClick={onSubmit}>{dialogBtnLabel}</LoadingButton>}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}