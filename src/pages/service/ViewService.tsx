import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import {NavLink, useParams} from 'react-router-dom';
import {GetService} from "../../services/service.service";
import PageTitle from "../../components/PageTitle";
import Grid from "@mui/material/Grid2";
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
    Typography
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import {first,startCase} from "lodash";
import dayjs from "dayjs";
import Divider from "@mui/material/Divider";
import LaunchIcon from '@mui/icons-material/Launch';
import {AdminContext} from "../../hooks/AdminContext";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {hasPermission} from "../../utils/permissions";

function ViewService() {
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = {
        to: ROUTES.SERVICE.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.SERVICE.UPSERT),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.SERVICE.LIST, name: 'Services' }, {name: 'View Service' }])
        GetService(id).then((service) => {
            setRecord(service)
            setLoading(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={record.name} backTo={ROUTES.SERVICE.LIST} btn={btn}/>
            <Grid container spacing={2}>
                <Grid size={6}>
                    { loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{mb:1.5,pl:1.5}} color={'primary'}>Service Details</Typography>
                                <Divider/>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Name:</TableCell>
                                                <TableCell>{record.name}</TableCell>
                                            </TableRow>
                                            {
                                                ROLE.SUPER_ADMIN === adminContext.admin.role.name.toLowerCase() ?
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Brand:</TableCell>
                                                        <TableCell>
                                                            <Link component={NavLink} to={ROUTES.BRAND.VIEW(record.brand.id)} underline={'none'}>{record.brand.name}</Link>
                                                        </TableCell>
                                                    </TableRow>
                                                    :<></>
                                            }
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Session Count:</TableCell>
                                                <TableCell>{record.totalSessions}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Price/session:</TableCell>
                                                <TableCell>{record.brand.country.currency.symbol+record.totalCost}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Total Cost:</TableCell>
                                                <TableCell>{record.brand.country.currency.symbol+record.totalCost}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Duration:</TableCell>
                                                <TableCell>{record.sessionDuration} mins</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Validity:</TableCell>
                                                <TableCell>{record.serviceValidity} days</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 'bold'}}>Service Category:</TableCell>
                                                <TableCell>{first(record.serviceCategory).name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Description:</TableCell>
                                                <TableCell>{record.description || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Created:</TableCell>
                                                <TableCell>{ dayjs(record.createdAt).format("MMM DD, YYYY") + ' By ' + record.createdBy.fullName }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Updated:</TableCell>
                                                <TableCell>{ record.lastUpdatedBy ? dayjs(record.updatedAt).format("MMM DD, YYYY") + ' By ' + record.lastUpdatedBy.fullName : '-' }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status:</TableCell>
                                                <TableCell><Chip label={record.status} color={ record.status === GLOBAL_STATUSES.ACTIVE ? 'success' : '' } /></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    }
                </Grid>
                <Grid size={6}>
                    { loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{mb:1.5}} color={'primary'}>Service options</Typography>
                                <Divider/>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Booking Status:</TableCell>
                                                <TableCell><Chip label={record.isBookable ? 'Open' : 'Close'} color={ record.isBookable ? 'success' : '' } /></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Commissionable:</TableCell>
                                                <TableCell><Chip label={record.commissionable ? 'Yes' : 'No'} color={ record.commissionable ? 'success' : '' } /></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Service Pack:</TableCell>
                                                <TableCell><Chip label={record.servicePack ? 'Yes' : 'No'} color={ record.servicePack ? 'success' : '' } /></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Service Type:</TableCell>
                                                <TableCell>{ startCase(record.serviceType.replace(/_SESSION/g,' ').toLowerCase()) }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Session Site:</TableCell>
                                                <TableCell>{ startCase(record.sessionSiteType.toLowerCase()) }</TableCell>
                                            </TableRow>
                                            {
                                                record.sessionSiteType === 'ONLINE' ?
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Web URL:</TableCell>
                                                        <TableCell>
                                                            <Button href={record.onlineLink} target="_blank" rel="noreferrer" variant={'contained'} size="small" endIcon={<LaunchIcon />}>LINK</Button>
                                                        </TableCell>
                                                    </TableRow>: <></>
                                            }
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Package Features:</TableCell>
                                                <TableCell>{ record.packageFeatures.map((e) => {
                                                    return (<Chip label={e} sx={{mr:0.5}}/>)
                                                }) }</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    }
                </Grid>
            </Grid>
        </>
    )
}

export default ViewService
