import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {CUSTOMER_TABS, GENDERS, LEAD_SOURCE, LEAD_STATUS, LEAD_TYPE, PERMISSIONS, ROUTES} from "../../utils/constants";
import {NavLink, useParams} from 'react-router-dom';
import {GetLead} from "../../services/lead.service";
import PageTitle from "../../components/PageTitle";
import Grid from '@mui/material/Grid2';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Typography
} from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import {hasPermission} from "../../utils/permissions";
import AppDialog from "../../components/AppDialog";
import {ConvertLeadToCustomer} from "../../services/lead.service";
import {ToastContext} from "../../hooks/ToastContext";
import {useNavigate} from "react-router";

function ViewLead() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const toastContext:any = useContext(ToastContext)
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dialogBtnLoading, setDialogBtnLoading] = useState(false);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const [open, setOpen] = React.useState(false);
    const handleDialogOpen = () => {
        setOpen(true);
    };
    const btn = {
        label: 'Convert Lead',
        show: hasPermission(PERMISSIONS.CUSTOMER.UPSERT),
        onClick: handleDialogOpen
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

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.LEAD.LIST, name: 'Leads' }, {name: 'View Lead' }])
        GetLead(id).then((lead) => {
            setRecord(lead)
            setLoading(false)
        })
    }, [id]);

    return (
        <>
            <PageTitle title={record.fullName} backTo={ROUTES.LEAD.LIST} btn={btn} />
            <Grid container spacing={2} sx={{mb:2}}>
                <Grid size={6}>
                    {loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <AppDialog open={open} handleDialogClose={handleDialogClose} title={'Lead Conversion'} body={'Converting a lead is an irreversible process. Would you like to proceed ?'} dialogBtnLoading={dialogBtnLoading} dialogBtnLabel={'Confirm'} onSubmit={convertLead}/>
                            <CardContent>
                                <Typography variant="h6" sx={{mb: 1.5, pl: 1.5}} color={'primary'}>Lead Details</Typography>
                                <Divider/>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Name:</TableCell>
                                                <TableCell>{record.fullName}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Gym:</TableCell>
                                                <TableCell><Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline={'none'}>{record.gym.name}</Link></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Gender:</TableCell>
                                                <TableCell>{GENDERS[record.gender]}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>DOB:</TableCell>
                                                <TableCell>{record.dob ? dayjs(record.dob).format("MMM DD, YYYY") : '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Phone:</TableCell>
                                                <TableCell>{record.phone}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Email:</TableCell>
                                                <TableCell>{record.email || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Country:</TableCell>
                                                <TableCell>{record.country.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Address:</TableCell>
                                                <TableCell>{record.address || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Created:</TableCell>
                                                <TableCell>{ dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy.fullName }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Updated:</TableCell>
                                                <TableCell>{ record.lastUpdatedBy ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy.fullName : '-' }</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid size={6}>
                    {loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <>
                            <Card sx={{mb:2}}>
                                <CardContent>
                                    <Typography variant="h6" sx={{mb: 1.5, pl: 1.5}} color={'primary'}>Lead Sales</Typography>
                                    <Divider/>
                                    <TableContainer>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Lead type:</TableCell>
                                                    <TableCell>{record.leadType ? LEAD_TYPE[record.leadType] : '-'}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Source:</TableCell>
                                                    <TableCell>{record.source ? LEAD_SOURCE[record.source] : '-'}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Lead status:</TableCell>
                                                    <TableCell><Chip label={record.leadStatus} color={ record.leadStatus === LEAD_STATUS.HOT ? 'error' : 'primary' } /></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                            { !record.isParent ?
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" sx={{mb: 1.5, pl: 1.5}} color={'primary'}>Parent Lead</Typography>
                                        <Divider/>
                                        <TableContainer>
                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Name:</TableCell>
                                                        <TableCell><Link component={NavLink} to={ROUTES.LEAD.VIEW(record.parentLead.id)} underline={'none'}>{record.parentLead.fullName}</Link></TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Source:</TableCell>
                                                        <TableCell>{record.parentLead.phone}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                                :<></>
                            }
                        </>
                    }
                </Grid>
            </Grid>
            {
                record.isParent && record.linkedAccounts?.length ?
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 1.5, pl: 1.5}} color={'primary'}>Child Accounts</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name:</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Gender:</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>DOB:</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Phone:</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        record.linkedAccounts.map((e) => {
                                            return (
                                                <TableRow>
                                                    <TableCell><Link component={NavLink} to={ROUTES.LEAD.VIEW(e.id)} underline={'none'}>{e.fullName}</Link></TableCell>
                                                    <TableCell>{GENDERS[e.gender]}</TableCell>
                                                    <TableCell>{dayjs(e.dob).format("MMM DD, YYYY")}</TableCell>
                                                    <TableCell>{e.phone || '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                :<></>
            }
        </>
    )
}
export default ViewLead