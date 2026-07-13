import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GENDERS, LEAD_SOURCE, LEAD_STATUS, LEAD_TYPE, PERMISSIONS, ROUTES} from "../../utils/constants";
import {NavLink, useParams} from 'react-router-dom';
import {GetLead} from "../../services/lead.service";
import PageTitle from "../../components/PageTitle";
import Grid from '@mui/material/Grid2';
import {
    Box,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    Typography
} from "@mui/material";
import dayjs from "dayjs";
import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import {hasPermission} from "../../utils/permissions";

function ViewLead() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.LEAD.LIST, name: 'Leads' }, {name: 'View Lead' }])
        GetLead(id).then((lead) => {
            setRecord(lead)
            setLoading(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={record.fullName} backTo={ROUTES.LEAD.LIST}/>
            {loading ?
                <Box sx={{textAlign: 'center'}}>
                    <CircularProgress/>
                </Box>
                :
                <>
                    <Typography variant="subtitle2" sx={{mb: 1.5}} color={'primary'}>Lead Details</Typography>
                    <Grid container spacing={2} sx={{mb: 3}}>
                        <Grid container size={9}>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Name</Typography>
                                <Typography variant="subtitle2">{record.fullName}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Gym</Typography>
                                <Typography variant="subtitle2"><Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline={'none'}>{record.gym.name}</Link></Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Gender</Typography>
                                <Typography variant="subtitle2">{GENDERS[record.gender]}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>DOB</Typography>
                                <Typography variant="subtitle2">{record.dob ? dayjs(record.dob).format("MMM DD, YYYY") : '-'}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Phone</Typography>
                                <Typography variant="subtitle2">{record.phone}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Address</Typography>
                                <Typography variant="subtitle2">{record.address || '-'}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Email</Typography>
                                <Typography variant="subtitle2">{record.email || '-'}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Country</Typography>
                                <Typography variant="subtitle2">{record.country.name}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Created</Typography>
                                <Typography variant="subtitle2">{dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy.fullName}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Updated</Typography>
                                <Typography variant="subtitle2">{record.lastUpdatedBy ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy.fullName : '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Typography variant="subtitle2" sx={{mb: 1.5}} color={'primary'}>Lead options</Typography>
                    <Grid container spacing={2}>
                        <Grid container size={9}>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Lead type</Typography>
                                <Typography
                                    variant="subtitle2">{record.leadType ? LEAD_TYPE[record.leadType] : '-'}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Source</Typography>
                                <Typography
                                    variant="subtitle2">{record.source ? LEAD_SOURCE[record.source] : '-'}</Typography>
                            </Grid>
                            <Grid size={3} sx={{mb: 3}}>
                                <Typography variant="subtitle2" color={'primary'} gutterBottom>Lead status</Typography>
                                <Typography variant="subtitle2"><Chip label={record.leadStatus} color={record.leadStatus === LEAD_STATUS.HOT ? 'error' : 'primary'}/></Typography>
                            </Grid>
                        </Grid>
                        {
                            record.isParent && record.linkedAccounts?.length ?
                                <Grid size={12}>
                                    <Typography variant="subtitle2" sx={{mb: 1.5}} color={'primary'}>Child Accounts</Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><Typography variant="subtitle2" color={'primary'}>Name</Typography></TableCell>
                                                <TableCell><Typography variant="subtitle2" color={'primary'}>Gender</Typography></TableCell>
                                                <TableCell><Typography variant="subtitle2" color={'primary'}>DOB</Typography></TableCell>
                                                <TableCell><Typography variant="subtitle2" color={'primary'}>Phone</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                record.linkedAccounts.map((e) => {
                                                    return (
                                                        <TableRow>
                                                            <TableCell>{e.fullName}</TableCell>
                                                            <TableCell>{GENDERS[e.gender]}</TableCell>
                                                            <TableCell>{dayjs(e.dob).format("MMM DD, YYYY")}</TableCell>
                                                            <TableCell>{e.phone || '-'}</TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </TableBody>
                                    </Table>
                                </Grid>
                                : <></>
                        }
                    </Grid>
                </>
            }
        </>
    )
}
export default ViewLead