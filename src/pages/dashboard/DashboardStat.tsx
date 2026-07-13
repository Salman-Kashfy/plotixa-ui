import { Box, Typography, useTheme } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import SkeletonLoader from '../../components/SkeletonLoader';

function DashboardStat({ title, value, icon, iconBg, loading }: any) {
    const theme = useTheme();
    const iconDimension = { width: { xs: 40, sm: 45 }, height: { xs: 40, sm: 45 }, borderRadius: '4px' };
    const iconStyle = {
        ...iconDimension,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: iconBg,
        flexShrink: 0,
    };
    const cardStyle = {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
        height: '100%',
    };
    const skeletonStyles = {
        statValue: { width: '18px', height: '29px' },
        statTitle: { width: '125px', height: '10px', borderRadius: '2px' },
    };

    return (
        <Card sx={cardStyle}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pb: { xs: '12px !important', sm: '12px !important' } }}>
                <Box display="flex" justifyContent="flex-start" gap={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                    {loading ? (
                        <SkeletonLoader params={{ width: 45, height: 45, borderRadius: '4px' }} />
                    ) : (
                        <Box sx={iconStyle}>{icon}</Box>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        {loading ? (
                            <>
                                <SkeletonLoader params={skeletonStyles.statValue} sx={{ mb: 1 }} />
                                <SkeletonLoader params={skeletonStyles.statTitle} />
                            </>
                        ) : (
                            <>
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{ mb: 0, mt: '-2px', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                >
                                    {value}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ wordBreak: 'break-word', lineHeight: 1.3 }}
                                >
                                    {title}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default DashboardStat;
