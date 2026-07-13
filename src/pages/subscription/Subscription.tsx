import ActiveSubscription from '../../components/ActiveSubscription'
import {useContext, useEffect, useState} from "react";
import {BreadcrumbContext} from "../../hooks/BreadcrumbContext";
import PageTitle from "../../components/PageTitle";
import {GetBrand} from "../../services/brand.service";
import {getAuthBrand, hasPermission} from "../../utils/permissions";
import {Box} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {PERMISSIONS, ROUTES} from "../../utils/constants";

function Subscription() {
    const breadcrumbContext:any = useContext(BreadcrumbContext)
    const brandId = getAuthBrand()
    const [brand, setBrand] = useState({});
    const [loader,setLoader] = useState(true)
    const btn = {
        to: ROUTES.SUBSCRIPTION.BILLING,
        label: 'Billing',
        show: hasPermission(PERMISSIONS.SUBSCRIPTION.BILLING),
    }

    const fetchBrand = () => {
        setLoader(true)
        GetBrand(brandId).then(async (brand) => {
            setBrand(brand)
            setLoader(false)
        }).catch(() => {
            setLoader(false)
        })
    }

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{name: 'Subscription' }])
        fetchBrand()
    }, []);

    return (
        <>
            <PageTitle title={'Subscription'} btn={btn}/>
            <>
                {loader ?
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <CircularProgress color="primary"/>
                    </Box>
                    : <ActiveSubscription subscription={brand.subscription} loader={loader}/>
                }
            </>
        </>
    )
}

export default Subscription