import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function PieChartGeneral({ data, innerRadius, title, loading = false }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const chartSize = isMobile ? 220 : 240;
    const radius = isMobile ? Math.min(innerRadius, 70) : innerRadius;

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {title}
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <SkeletonLoader params={{ width: chartSize, height: chartSize, borderRadius: '50%' }} />
                    </Box>
                ) : !data?.length ? (
                    <Box
                        sx={{
                            height: chartSize,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" align="center">
                            No data for this period
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        <PieChart
                            series={[{ data, innerRadius: radius }]}
                            width={chartSize}
                            height={chartSize}
                            margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            slotProps={{
                                legend: {
                                    direction: isMobile ? 'row' : 'column',
                                    position: { vertical: 'bottom', horizontal: 'middle' },
                                },
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
