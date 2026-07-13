import {useContext, useEffect, useState, SyntheticEvent} from 'react'
import {BreadcrumbContext} from '../../hooks/BreadcrumbContext';
import {CUSTOMER_TABS, PERMISSIONS, ROUTES} from "../../utils/constants";
import {useParams} from 'react-router-dom';
import {GetCustomer} from "../../services/customer.service";
import PageTitle from "../../components/PageTitle";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CustomerDetails from './CustomerDetails';
import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {hasPermission} from "../../utils/permissions";
import {useNavigate} from "react-router";
import SessionContract from "../session-contract/SessionContract";
import Payment from "../payment/Payment";
import Membership from "../membership/Membership";

function ViewCustomer() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const [loading, setLoading] = useState(true);
    const { id, tab } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState({});
    const btn = {
        to: ROUTES.CUSTOMER.EDIT(id),
        icon: <ModeEditIcon/>,
        show: hasPermission(PERMISSIONS.CUSTOMER.UPSERT),
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{to:ROUTES.CUSTOMER.LIST, name: 'Customers' }, {name: 'View Customer' }])
        GetCustomer(id).then((customer) => {
            setRecord(customer)
            setLoading(false)
        })
    }, []);

    const handleTabChange = (event: SyntheticEvent, newValue) => {
        navigate(ROUTES.CUSTOMER.TAB(id, newValue))
    };

    return (
        <>
            <PageTitle title={record.fullName} backTo={ROUTES.CUSTOMER.LIST} btn={btn}/>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tab}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList
                            onChange={handleTabChange}
                            aria-label="Customer tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab label={CUSTOMER_TABS.DETAILS.toUpperCase()} value={CUSTOMER_TABS.DETAILS} />
                            <Tab label={CUSTOMER_TABS.MEMBERSHIPS.toUpperCase()} value={CUSTOMER_TABS.MEMBERSHIPS} />
                            {
                                hasPermission(PERMISSIONS.SESSION_CONTRACT.LIST) ?
                                    <Tab label={CUSTOMER_TABS.CONTRACTS.toUpperCase()} value={CUSTOMER_TABS.CONTRACTS} />
                                    :<></>
                            }
                            {
                                hasPermission(PERMISSIONS.PAYMENT.LIST) ?
                                    <Tab label={CUSTOMER_TABS.PAYMENTS.toUpperCase()} value={CUSTOMER_TABS.PAYMENTS} />
                                    :<></>
                            }
                        </TabList>
                    </Box>
                    <TabPanel value={CUSTOMER_TABS.DETAILS} sx={{ px: { xs: 0, sm: 2 } }}>
                        {
                            tab === CUSTOMER_TABS.DETAILS ?
                                <>
                                    { loading ?
                                        <Box sx={{textAlign: 'center'}}>
                                            <CircularProgress/>
                                        </Box>
                                        :<CustomerDetails record={record}/>
                                    }
                                </>
                            :<></>
                        }
                    </TabPanel>
                    <TabPanel value={CUSTOMER_TABS.MEMBERSHIPS} sx={{ px: { xs: 0, sm: 2 } }}>
                        {
                            tab === CUSTOMER_TABS.MEMBERSHIPS ?
                                <Membership customer={record}/>
                                :<></>
                        }
                    </TabPanel>
                    <TabPanel value={CUSTOMER_TABS.CONTRACTS} sx={{ px: { xs: 0, sm: 2 } }}>
                        {
                            tab === CUSTOMER_TABS.CONTRACTS ?
                                <SessionContract customer={record}/>
                                :<></>
                        }
                    </TabPanel>
                    <TabPanel value={CUSTOMER_TABS.PAYMENTS} sx={{ px: { xs: 0, sm: 2 } }}>
                        {
                            tab === CUSTOMER_TABS.PAYMENTS ?
                                <Payment customer={record}/>
                                :<></>
                        }
                    </TabPanel>
                </TabContext>
            </Box>
        </>
    )
}

export default ViewCustomer
