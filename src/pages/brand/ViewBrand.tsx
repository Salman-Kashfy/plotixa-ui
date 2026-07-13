import {useContext, useEffect, useState} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {constants, GLOBAL_STATUSES, PERMISSIONS, ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetBrand} from "../../services/brand.service";
import PageTitle from "../../components/PageTitle";
import {ToastContext} from "../../hooks/ToastContext";
import {TableContainer, Table, TableBody, TableRow, TableCell, Card, CardContent, Box, Chip} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from 'dayjs';
import * as React from "react";
import {hasPermission} from "../../utils/permissions";
import ModeEditIcon from '@mui/icons-material/ModeEdit';

function ViewBrand() {
    const breadcrumbContext: any = useContext(BreadcrumbContext)
    const toastContext: any = useContext(ToastContext)
    const [loading, setLoading] = useState(true);
    const {id} = useParams();
    const [data, setData] = useState({});
    const btn = {
        to: ROUTES.BRAND.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.BRAND.UPDATE),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to: ROUTES.BRAND.LIST, name: 'Brands'}, {name: 'View Brand'}])
        GetBrand(id).then((brand) => {
            setData(brand)
            setLoading(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={data?.name} backTo={ROUTES.BRAND.LIST} btn={btn}/>
            <Grid container spacing={2}>
                <Grid size={6}>
                    { loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            {
                                                data?.logo ?
                                                    <TableRow>
                                                        <TableCell colSpan={2}><img class={'responsive'} src={constants.BASE_URL+'/uploads/brands/'+data.logo} alt={data.name}/></TableCell>
                                                    </TableRow>
                                                    :<></>
                                            }
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Brand Name:</TableCell>
                                                <TableCell>{data.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Legal Name:</TableCell>
                                                <TableCell>{data.legalName}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Country:</TableCell>
                                                <TableCell>{data.country.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Brand Email:</TableCell>
                                                <TableCell>{data.email}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Phone:</TableCell>
                                                <TableCell>{data.phone}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Created:</TableCell>
                                                <TableCell>{ dayjs(data.createdAt).format("MMM DD, YYYY") + ' By ' + data.createdBy.fullName }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Updated:</TableCell>
                                                <TableCell>{ data.lastUpdatedBy ? dayjs(data.updatedAt).format("MMM DD, YYYY") + ' By ' + data.lastUpdatedBy.fullName : '-' }</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status:</TableCell>
                                                <TableCell><Chip label={data.status} color={ data.status === GLOBAL_STATUSES.ACTIVE ? 'success' : '' } /></TableCell>
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

export default ViewBrand
