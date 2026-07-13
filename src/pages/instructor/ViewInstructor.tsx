import {useEffect, useState, useContext} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {GLOBAL_STATUSES, PERMISSIONS, ROUTES} from "../../utils/constants";
import PageTitle from "../../components/PageTitle";
import {GetInstructor} from "../../services/instructor.service";
import {NavLink, useParams} from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {startCase,toLower} from "lodash";
import dayjs from "dayjs";
import Link from "@mui/material/Link";
import * as React from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {hasPermission} from "../../utils/permissions";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import IconButton from "@mui/material/IconButton";

function ViewInstructor() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const btn = [
        {
            to: ROUTES.PT_COMMISSION.VIEW(id),
            icon: <AltRouteIcon/>,
            show: hasPermission(PERMISSIONS.PT_COMMISSION.VIEW),
            backgroundColor: 'primary'
        },
        {
            to: ROUTES.INSTRUCTOR.EDIT(id),
            icon: <ModeEditIcon/>,
            show: hasPermission(PERMISSIONS.INSTRUCTOR.UPSERT),
        }
    ]

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.INSTRUCTOR.LIST, name: 'Instructors' }, {name: 'View Instructor' }])
        GetInstructor(id).then((instructor) => {
            setRecord(instructor)
            setLoading(false)
        })
    }, []);

    return (
        <>
            <PageTitle title={record.fullName} backTo={ROUTES.INSTRUCTOR.LIST} btn={btn}/>
            <Grid container spacing={2}>
                <Grid size={3} sx={{textAlign: 'center'}}>
                    {
                        <Card>
                            <CardContent>
                                {
                                    loading ?
                                        <Box sx={{textAlign: 'center'}}>
                                            <CircularProgress/>
                                        </Box>
                                        :<>
                                            {record?.photo ?
                                                <img className={'responsive'} src={record.photo} alt={record.fullName}/>
                                                : <AccountCircleIcon sx={{fontSize: 130}} color={'disabled'}/>
                                            }
                                        </>
                                }
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
                        <Card>
                            <CardContent>
                                <TableContainer>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Name:</TableCell>
                                                <TableCell>{record.fullName}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Gender:</TableCell>
                                                <TableCell>{startCase(toLower(record.gender.replace(/_/g,' ')))}</TableCell>
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
                                                <TableCell>{record.email}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Country:</TableCell>
                                                <TableCell>{record.country.name}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Gym:</TableCell>
                                                <TableCell><Link component={NavLink} to={ROUTES.GYM.VIEW(record.gym.id)} underline={'none'}>{record.gym.name}</Link></TableCell>
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
            </Grid>
        </>
    )
}

export default ViewInstructor
