import { useEffect, useState, useContext } from 'react';
import {
    Card, CardContent, Box, Stack, CircularProgress,
    Table, TableBody, TableCell, TableContainer,
    TableFooter, TableHead, TablePagination, TableRow,
    IconButton, FormControl, InputLabel, Select, MenuItem,
    useTheme, useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NavLink } from 'react-router-dom';
import { BreadcrumbContext } from '../../hooks/BreadcrumbContext';
import { ToastContext } from '../../hooks/ToastContext';
import { ROUTES, constants, PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import { GetPlots, DeletePlot, GetPlotBlocks, GetPlotCategories } from '../../services/plot.service';
import PageTitle from '../../components/PageTitle';
import TableSpinner from '../../components/TableSpinner';
import NoRowsFound from '../../components/NoRowsFound';
import ListingCard from '../../components/ListingCard';

function Plot() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const breadcrumbContext: any = useContext(BreadcrumbContext);
    const toastContext: any = useContext(ToastContext);
    const [page, setPage] = useState(0);
    const [paging, setPaging] = useState({ totalPages: 0, totalResultCount: 0 });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<any[]>([]);
    const [blocks, setBlocks] = useState<{ id: string; name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [blockId, setBlockId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const btn = {
        to: ROUTES.PLOT.CREATE,
        label: 'Add Plot',
        show: hasPermission(PERMISSIONS.PLOT.CREATE),
    };

    const columns = [
        { id: 'plot',     label: 'Plot',     minWidth: 120 },
        { id: 'category', label: 'Category', minWidth: 160 },
        { id: 'actions',  label: 'Actions',  minWidth: 100 },
    ];

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

    const handleBlockChange = (value: string) => { setBlockId(value); setPage(0); };
    const handleCategoryChange = (value: string) => { setCategoryId(value); setPage(0); };

    const handleDelete = (id: string) => {
        DeletePlot(id).then((res) => {
            if (res.status) {
                toastContext.setToastSeverity('success');
                toastContext.setToastMessage('Plot deleted.');
                toastContext.setToast(true);
                fetchRows();
            }
        });
    };

    const fetchRows = () => {
        if (!loading) setLoading(true);
        const params: any = {};
        if (blockId) params.blockId = blockId;
        if (categoryId) params.categoryId = categoryId;
        GetPlots({ page: page + 1 }, params).then((response: any) => {
            const list = response.data || [];
            setRows(list.map((e: any) => ({
                id: e.id,
                plot: `${e.block?.name || ''}-${e.plotNo}`,
                category: e.category?.name || '—',
                actions: (
                    <Box sx={{ display: 'flex' }}>
                        {hasPermission(PERMISSIONS.PLOT.UPDATE) && (
                            <IconButton component={NavLink} to={ROUTES.PLOT.EDIT(e.id)} color="warning" size="small">
                                <ModeEditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {hasPermission(PERMISSIONS.PLOT.DELETE) && (
                            <IconButton color="error" size="small" onClick={() => handleDelete(e.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ),
            })));
            setPaging(response.paging || { totalPages: 0, totalResultCount: 0 });
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        breadcrumbContext.setBreadcrumb([{ name: 'Plots' }]);
        GetPlotBlocks().then(setBlocks);
        GetPlotCategories().then(setCategories);
    }, []);

    useEffect(() => { fetchRows(); }, [page, blockId, categoryId]);

    return (
        <>
            <PageTitle title="Plots" btn={btn} />
            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Block</InputLabel>
                                <Select value={blockId} onChange={(e) => handleBlockChange(e.target.value)} label="Block">
                                    <MenuItem value="">All</MenuItem>
                                    {blocks.map((b) => (
                                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)} label="Category">
                                    <MenuItem value="">All</MenuItem>
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box>
                        {isMobile ? (
                            <>
                                <Stack spacing={2} sx={{ opacity: loading && rows.length ? 0.5 : 1 }}>
                                    {rows.map((row) => (
                                        <ListingCard key={row.id} row={row} columns={columns} />
                                    ))}
                                </Stack>
                                {loading && !rows.length ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : null}
                                {!loading && !rows.length ? (
                                    <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        No plots found
                                    </Box>
                                ) : null}
                            </>
                        ) : (
                            <TableContainer sx={{ overflowX: 'auto' }}>
                                <Table stickyHeader aria-label="plots table" sx={{ minWidth: 450 }}>
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((col) => (
                                                <TableCell key={col.id} style={{ minWidth: col.minWidth }}>
                                                    {col.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row) => (
                                            <TableRow hover key={row.id} sx={{ opacity: loading ? 0.2 : 1 }}>
                                                {columns.map((col) => (
                                                    <TableCell key={col.id}>{row[col.id]}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                        <TableSpinner loading={loading} colSpan={columns.length} rowCount={rows.length} />
                                        <NoRowsFound loading={loading} colSpan={columns.length} rowCount={rows.length} />
                                    </TableBody>
                                    <TableFooter>
                                        {loading && !rows.length ? (
                                            <TableSpinner loading colSpan={columns.length} rowCount={rows.length} />
                                        ) : null}
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        )}
                        <TablePagination
                            component="div"
                            count={paging.totalResultCount}
                            rowsPerPage={constants.PER_PAGE}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPageOptions={[]}
                        />
                    </Box>
                </CardContent>
            </Card>
        </>
    );
}

export default Plot;
