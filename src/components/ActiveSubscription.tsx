import {Box, Card, CardContent, Chip, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import {SUBSCRIPTION_PLAN_TYPES, SUBSCRIPTION_STATUS} from "../utils/constants";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import StarBorderPurple500Icon from "@mui/icons-material/StarBorderPurple500";
import TokenIcon from "@mui/icons-material/Token";
import ProgressBar from "./ProgressBar";

const iconStyles = { fontSize: 45, color: '#fff' }
const SUBSCRIPTION_ICON = {
    [SUBSCRIPTION_PLAN_TYPES.FREE_TRIAL]: <HistoryOutlinedIcon sx={iconStyles}/>,
    [SUBSCRIPTION_PLAN_TYPES.STARTER]: <AutoGraphOutlinedIcon sx={iconStyles}/>,
    [SUBSCRIPTION_PLAN_TYPES.GROWTH]: <StarBorderPurple500Icon sx={iconStyles}/>,
    [SUBSCRIPTION_PLAN_TYPES.PROFESSIONAL]: <TokenIcon sx={iconStyles}/>,
}

const ActiveSubscription = ({subscription, loader}) => {

    const formatBillingCycle = (duration: number, billingCycle:string): string => {
        const unit = billingCycle.toLowerCase(); // 'day', 'week', 'month', 'year'
        const pluralizedUnit = duration === 1 ? unit : `${unit}s`;

        return `Every ${duration === 1 ? '' : duration} ${pluralizedUnit}`;
    }

    return (
        <Card sx={{mb:3}}>
            <ProgressBar formLoader={loader}/>
            <CardContent sx={{p:3}}>
                {
                    loader ?
                        <></>
                        :
                        <Box sx={{display:'flex'}}>
                            <Box sx={{pl:1,pr:4}}>
                                <Box sx={{width: 100, height:100, backgroundColor:'primary.main', borderRadius: 4, display: 'flex', alignItems:'center', justifyContent: 'center'}}>
                                    {SUBSCRIPTION_ICON[subscription.type]}
                                </Box>
                            </Box>
                            <Box sx={{flex:1}}>
                                <Typography variant="h6" sx={{mb:2}}>{subscription.name}</Typography>
                                <Grid container size={12}>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Gym(s)</Typography>
                                        <Typography variant="subtitle2">{subscription.gymCount}</Typography>
                                    </Grid>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Price</Typography>
                                        <Typography variant="subtitle2">{subscription.currencySymbol+subscription.price}</Typography>
                                    </Grid>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Billing</Typography>
                                        <Typography variant="subtitle2">{ subscription.type !== SUBSCRIPTION_PLAN_TYPES.FREE_TRIAL ? formatBillingCycle(subscription.duration, subscription.billingCycle) : 'N/A' }</Typography>
                                    </Grid>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Validity</Typography>
                                        <Typography variant="subtitle2">{dayjs(subscription.expiryDate).format("MMM DD, YYYY")}</Typography>
                                    </Grid>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Status</Typography>
                                        <Chip label={subscription.status} color={ subscription.status === SUBSCRIPTION_STATUS.ACTIVE ? 'success' : ( subscription.status === SUBSCRIPTION_STATUS.GRACE ? 'warning' : 'error' ) } />
                                    </Grid>
                                    <Grid size={3} sx={{mb:3}}>
                                        <Typography variant="subtitle1" color={'primary'} sx={{fontWeight:500}} gutterBottom>Days</Typography>
                                        <Typography variant="subtitle2">{Number(dayjs(subscription.expiryDate).diff(dayjs(),'day'))+1}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                }
            </CardContent>
        </Card>
    )
}

export default ActiveSubscription