import { useState, KeyboardEvent, ReactNode } from 'react';
import {
    Box,
    Card,
    CardContent,
    Collapse,
    IconButton,
    Stack,
    SxProps,
    Theme,
    Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export type ListColumn = {
    id: string;
    label: string;
    minWidth?: number;
};

export type ListingRow = Record<string, ReactNode | string | number> & {
    id: string;
    actions?: ReactNode;
};

type ListingCardProps = {
    row: ListingRow;
    columns: ListColumn[];
    sx?: SxProps<Theme>;
};

function ListingCard({ row, columns, sx }: ListingCardProps) {
    const [expanded, setExpanded] = useState(false);
    const displayColumns = columns.filter((column) => column.id !== 'actions');
    const hasActions = Boolean(row.actions);

    const toggleExpanded = () => setExpanded((prev) => !prev);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!hasActions) return;
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
            tabIndex={hasActions ? 0 : undefined}
            onKeyDown={handleKeyDown}
            sx={{ outline: 'none', '&:focus-visible': { boxShadow: 2 }, ...sx }}
        >
            <CardContent sx={{ pb: expanded ? 1 : 2, '&:last-child': { pb: expanded ? 1 : 2 } }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                        {displayColumns.map((column, index) => (
                            <Box key={column.id}>
                                {index === 0 ? (
                                    <Box
                                        sx={{
                                            typography: 'subtitle1',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {row[column.id]}
                                    </Box>
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
                    {hasActions ? (
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
                    ) : null}
                </Stack>
                {hasActions ? (
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
                ) : null}
            </CardContent>
        </Card>
    );
}

export default ListingCard;
