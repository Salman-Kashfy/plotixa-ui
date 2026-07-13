import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GLOBAL_STATUSES, PERMISSIONS, ROLE, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetGym} from "../../services/gym.service";
import {useParams} from "react-router-dom";
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
import dayjs from "dayjs";
import {NavLink} from "react-router-dom";
import Link from '@mui/material/Link';
import * as React from "react";
import Divider from '@mui/material/Divider';
import {AdminContext} from "../../hooks/AdminContext";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {hasPermission} from "../../utils/permissions";
import {startCase,toLower} from "lodash";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';

function ViewGym() {
    const adminContext = useContext(AdminContext)
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = [
        {
            to: ROUTES.GYM.EDIT(id),
            icon: <ModeEditIcon/>,
            backgroundColor: 'warning',
            show: hasPermission(PERMISSIONS.GYM.UPDATE),
        },
        {
            to: ROUTES.GYM.OPTIONS(id),
            icon: <SettingsSuggestIcon/>,
            backgroundColor: 'success',
            show: hasPermission(PERMISSIONS.GYM.UPDATE),
        }
    ]

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.GYM.LIST, name: 'Gyms' }, {name: 'View Gym' }])
        GetGym(id).then((gym) => {
            setRecord(gym)
            setLoading(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={record?.name} backTo={ROUTES.GYM.LIST} btn={btn}/>
            <Grid container spacing={2}>
                <Grid size={6}>
                    { loading ?
                        <Box sx={{textAlign: 'center'}}>
                            <CircularProgress/>
                        </Box>
                        :
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{mb:1.5,pl:1.5}} color={'primary'}>Gym details</Typography>
                                <Divider/>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Name:</TableCell>
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
                                                <TableCell sx={{ fontWeight: 'bold' }}>Email:</TableCell>
                                                <TableCell>{record.email}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Phone:</TableCell>
                                                <TableCell>{record.phone}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Description:</TableCell>
                                                <TableCell>{record.description || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Tax Mode:</TableCell>
                                                <TableCell>{startCase(toLower((record.taxMode)))}</TableCell>
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
                                <Typography variant="h6" sx={{mb:1.5}} color={'primary'}>Gym Address</Typography>
                                <Divider/>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Unit no:</TableCell>
                                                <TableCell>{record.unitNumber || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Floor:</TableCell>
                                                <TableCell>{record.floorNo || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Building:</TableCell>
                                                <TableCell>{record.building || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Street:</TableCell>
                                                <TableCell>{record.street || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Postal Code:</TableCell>
                                                <TableCell>{record.zipCode || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>City:</TableCell>
                                                <TableCell>{record.city.name || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Short address:</TableCell>
                                                <TableCell>{record.shortAddress || '-'}</TableCell>
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

export default ViewGym
