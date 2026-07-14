import dayjs from "dayjs";
import { useMemo } from "react";
import { ORDER_TYPE, ORDER_TYPE_NAME } from "../../utils/constants";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from "@mui/material";
import SkeletonLoader from "../../components/SkeletonLoader";

function DailyStacking({ payments, height = undefined, loading = false }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const chartHeight = height ?? (isMobile ? 260 : 300);

    const dates = useMemo(
        () => [...new Set(payments.map((p) => dayjs(p.createdAt).format('YYYY-MM-DD')))].sort(),
        [payments]
    );

    const series = useMemo(() => {
        const grouped = new Map();
        const orderTypes = [
            ORDER_TYPE.MEMBERSHIP,
            ORDER_TYPE.PRIVATE_COACH,
            ORDER_TYPE.GYM_CLASS,
        ];

        for (const payment of payments) {
            const date = dayjs(payment.createdAt).format('YYYY-MM-DD');
            const type = payment.orderType;
            if (!grouped.has(date)) grouped.set(date, {});
            grouped.get(date)[type] = (grouped.get(date)[type] || 0) + payment.amount;
        }

        const sortedDates = [...grouped.keys()].sort();
        return orderTypes.map((type) => ({
            label: ORDER_TYPE_NAME[type],
            stack: 'total',
            data: sortedDates.map((date) => grouped.get(date)?.[type] || 0),
        }));
    }, [payments]);

    return (
        <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Revenue by day
                </Typography>
                {loading ? (
                    <SkeletonLoader params={{ width: '100%', height: chartHeight, borderRadius: '4px' }} />
                ) : payments.length === 0 ? (
                    <Box
                        sx={{
                            height: chartHeight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No revenue data for this period
                        </Typography>
                    </Box>
                ) : (
                    <BarChart
                        height={chartHeight}
                        margin={{
                            top: 16,
                            right: isMobile ? 8 : 16,
                            left: isMobile ? 36 : 48,
                            bottom: isMobile ? 32 : 24,
                        }}
                        xAxis={[
                            {
                                data: dates,
                                scaleType: 'band',
                                valueFormatter: (dateStr) => dayjs(dateStr).format(isMobile ? 'MMM D' : 'MMM DD'),
                            },
                        ]}
                        yAxis={[{
                            scaleType: 'linear',
                            valueFormatter: (value) => {
                                if (Number(value) <= 9999) {
                                    return value.toFixed(0).toString();
                                }
                                return `${(Number(value) / 1000).toFixed(0)}k`;
                            },
                        }]}
                        series={series}
                        tooltip={{
                            axis: 'x',
                            trigger: 'item',
                            formatter: ({ dataIndex }) => {
                                const date = dates[dataIndex];
                                return dayjs(date).format('MMM DD, YYYY');
                            },
                        }}
                        sx={{ width: '100%', maxWidth: '100%' }}
                    />
                )}
            </CardContent>
        </Card>
    );
}

export default DailyStacking;
