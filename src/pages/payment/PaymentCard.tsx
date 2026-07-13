import { useState, KeyboardEvent, ReactNode } from 'react';
import {
    Box,
    Card,
    CardContent,
    Collapse,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export type ListColumn = {
    id: string;
    label: string;
    minWidth?: number;
};

export type PaymentListRow = Record<string, ReactNode | string | number> & {
    id: string;
};

type PaymentCardProps = {
    row: PaymentListRow;
    columns: ListColumn[];
};

function PaymentCard({ row, columns }: PaymentCardProps) {
    const [expanded, setExpanded] = useState(false);
    const displayColumns = columns.filter((column) => column.id !== 'actions');

    const toggleExpanded = () => setExpanded((prev) => !prev);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowDown' && !expanded) {
            event.preventDefault();
            setExpanded(true);
        }
        if (event.key === 'ArrowUp' && expanded) {
            event.preventDefault();
            setExpanded(false);
        }
    };

    return (
        <Card
            variant="outlined"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            sx={{ outline: 'none', '&:focus-visible': { boxShadow: 2 } }}
        >
            <CardContent sx={{ pb: expanded ? 1 : 2, '&:last-child': { pb: expanded ? 1 : 2 } }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                        {displayColumns.map((column, index) => (
                            <Box key={column.id}>
                                {index === 0 ? (
                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                        {row[column.id]}
                                    </Typography>
                                ) : (
                                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                        <Typography variant="body2" color="text.secondary" component="span">
                                            {column.label}:
                                        </Typography>
                                        <Box component="span" sx={{ typography: 'body2' }}>
                                            {row[column.id]}
                                        </Box>
                                    </Stack>
                                )}
                            </Box>
                        ))}
                    </Stack>
                    <IconButton
                        size="small"
                        aria-label={expanded ? 'Hide actions' : 'Show actions'}
                        aria-expanded={expanded}
                        onClick={toggleExpanded}
                        sx={{
                            mt: -0.5,
                            transform: expanded ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </IconButton>
                </Stack>
                <Collapse in={expanded}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            pt: 1.5,
                            mt: 1,
                            borderTop: 1,
                            borderColor: 'divider',
                        }}
                    >
                        {row.actions}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

export default PaymentCard;
