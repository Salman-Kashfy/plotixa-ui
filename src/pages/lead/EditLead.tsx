import {useContext, useEffect, useState} from 'react'
import LeadForm from "../lead/LeadForm";
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {CUSTOMER_TABS, PERMISSIONS, ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {ConvertLeadToCustomer, GetLead, UpdateLead} from "../../services/lead.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import AppDialog from "../../components/AppDialog";
import * as React from "react";
import {hasPermission} from "../../utils/permissions";
import {useNavigate} from "react-router";

function EditLead() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const [loading, setLoading] = useState(false);
    const [formLoader, setFormLoader] = useState(true);
    const [dialogBtnLoading, setDialogBtnLoading] = useState(false);
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const handleDialogOpen = () => {
        setOpen(true);
    };
    const btn = {
        label: 'Convert Lead',
        show: hasPermission(PERMISSIONS.CUSTOMER.UPSERT),
        onClick: handleDialogOpen
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.LEAD.LIST, name: 'Leads' }, {name: 'Edit Lead' }])
        GetLead(id).then((lead) => {
            setRecord(lead)
            setFormLoader(false)
        })
    }, []);

    const onSubmit = (data) => {
        setLoading(true)
        UpdateLead(data).then((response) => {
            if(response.status){
                toastContext.setToastSeverity('success')
                toastContext.setToastMessage('Updated successfully.')
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
            }
            toastContext.setToast(true)
            setLoading(false)
        })
    }

    const handleDialogClose = () => {
        setOpen(false);
    };

    const convertLead = () => {
        setDialogBtnLoading(true)
        ConvertLeadToCustomer({leadId:id}).then((response) => {
            setDialogBtnLoading(false)
            handleDialogClose()
            if(response.status){
                navigate(ROUTES.CUSTOMER.TAB(response.data.id, CUSTOMER_TABS.DETAILS))
            }else{
                toastContext.setToastSeverity('error')
                toastContext.setToastMessage(response.errorMessage)
                toastContext.setToast(true)
            }
        }).catch((error) => {
            setDialogBtnLoading(false)
            toastContext.setToastSeverity('error')
            toastContext.setToastMessage('Something went wrong. Kindly contact support.')
            toastContext.setToast(true)
            console.log(error)
        })
    };

    return (
        <>
            <AppDialog open={open} handleDialogClose={handleDialogClose} title={'Lead Conversion'} body={'Converting a lead is an irreversible process. Would you like to proceed ?'} dialogBtnLoading={dialogBtnLoading} dialogBtnLabel={'Confirm'} onSubmit={convertLead}/>
            <PageTitle title={'Edit Lead'} backTo={ROUTES.LEAD.LIST} btn={btn}/>
            { record?.customerId ?
                <Grid container spacing={3}>
                    <Grid size={9}>
                        <Stack sx={{ width: '100%', mb:2 }} spacing={2}>
                            <Alert severity="info">This lead has been converted to a customer. Some details may be outdated.</Alert>
                        </Stack>
                    </Grid>
                </Grid>
                : <></>
            }
            <LeadForm record={record} callback={onSubmit} btnLabel={'Save Changes'} loading={loading} formLoader={formLoader}/>
        </>
    )
}

export default EditLead
