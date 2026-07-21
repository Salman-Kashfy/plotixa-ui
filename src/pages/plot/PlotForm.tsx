import { useContext, useEffect, useState } from 'react';
import {
    Box, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem,
    IconButton, Tooltip, FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../../components/FormInput';
import ProgressBar from '../../components/ProgressBar';
import {
    GetPlotBlocks, CreatePlotBlock, UpdatePlotBlock, DeletePlotBlock,
    GetPlotCategories, CreatePlotCategory, UpdatePlotCategory, DeletePlotCategory,
} from '../../services/plot.service';
import { hasPermission } from '../../utils/permissions';
import { PERMISSIONS } from '../../utils/constants';
import CrudOptionDialog, { CrudOption } from './CrudOptionDialog';
import { ToastContext } from '../../hooks/ToastContext';

type Props = {
    data?: any;
    callback: (data: any) => void;
    btnLabel: string;
    loading: boolean;
    formLoader?: boolean;
    create?: boolean;
};

function PlotForm({ data = {}, callback, btnLabel, loading, formLoader = false, create = false }: Props) {
    const toastContext: any = useContext(ToastContext);
    const [blocks, setBlocks] = useState<CrudOption[]>([]);
    const [categories, setCategories] = useState<CrudOption[]>([]);
    const [blocksLoading, setBlocksLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    const canManageBlocks = hasPermission(PERMISSIONS.PLOT_BLOCK.CREATE) ||
        hasPermission(PERMISSIONS.PLOT_BLOCK.UPDATE) ||
        hasPermission(PERMISSIONS.PLOT_BLOCK.DELETE);

    const canManageCategories = hasPermission(PERMISSIONS.PLOT_CATEGORY.CREATE) ||
        hasPermission(PERMISSIONS.PLOT_CATEGORY.UPDATE) ||
        hasPermission(PERMISSIONS.PLOT_CATEGORY.DELETE);

    const defaultValues = {
        id: '',
        blockId: '',
        categoryId: '',
        noOfPlots: '',
    };

    const { control, handleSubmit, reset } = useForm({
        mode: 'onChange',
        defaultValues: Object.keys(data).length === 0 ? defaultValues : {
            id: data.id || '',
            blockId: data.block?.id || '',
            categoryId: data.category?.id || '',
            noOfPlots: data.noOfPlots || '',
        },
    });

    const fetchBlocks = () => {
        setBlocksLoading(true);
        GetPlotBlocks().then((d) => { setBlocks(d); setBlocksLoading(false); })
            .catch(() => setBlocksLoading(false));
    };

    const fetchCategories = () => {
        setCategoriesLoading(true);
        GetPlotCategories().then((d) => { setCategories(d); setCategoriesLoading(false); })
            .catch(() => setCategoriesLoading(false));
    };

    useEffect(() => {
        fetchBlocks();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (Object.keys(data).length) {
            reset({
                id: data.id || '',
                blockId: data.block?.id || '',
                categoryId: data.category?.id || '',
                noOfPlots: data.noOfPlots || '',
            });
        }
    }, [data, reset]);

    const onSubmit = (formData: any) => {
        if (!formData.blockId || !formData.categoryId) {
            toastContext.setToastSeverity('error');
            toastContext.setToastMessage('Block and Category are required.');
            toastContext.setToast(true);
            return;
        }
        const _data: any = {
            blockId: formData.blockId,
            categoryId: formData.categoryId,
        };
        if (formData.id) _data.id = formData.id;
        if (create) _data.noOfPlots = Number(formData.noOfPlots);
        callback(_data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <ProgressBar formLoader={loading || formLoader}>{null}</ProgressBar>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 } }}>Plot Details</Typography>
                    <Grid container spacing={3}>

                        {/* Block */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                <Controller
                                    name="blockId"
                                    control={control}
                                    rules={{ required: { value: true, message: 'Block is required' } }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant="standard" fullWidth error={!!error}>
                                            <InputLabel>Block</InputLabel>
                                            <Select {...field} label="Block" disabled={blocksLoading}>
                                                <MenuItem value=""><em>Select block</em></MenuItem>
                                                {blocks.map((b) => (
                                                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                                {canManageBlocks && (
                                    <Tooltip title="Manage blocks">
                                        <IconButton size="small" onClick={() => setBlockDialogOpen(true)} sx={{ mb: 0.5 }}>
                                            <SettingsIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>

                        {/* Category */}
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                <Controller
                                    name="categoryId"
                                    control={control}
                                    rules={{ required: { value: true, message: 'Category is required' } }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormControl variant="standard" fullWidth error={!!error}>
                                            <InputLabel>Category</InputLabel>
                                            <Select {...field} label="Category" disabled={categoriesLoading}>
                                                <MenuItem value=""><em>Select category</em></MenuItem>
                                                {categories.map((c) => (
                                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                                ))}
                                            </Select>
                                            {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
                                        </FormControl>
                                    )}
                                />
                                {canManageCategories && (
                                    <Tooltip title="Manage categories">
                                        <IconButton size="small" onClick={() => setCategoryDialogOpen(true)} sx={{ mb: 0.5 }}>
                                            <SettingsIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Grid>

                        {/* No of Plots — create only */}
                        {create && (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Controller
                                    name="noOfPlots"
                                    control={control}
                                    rules={{
                                        required: { value: true, message: 'No of plots is required' },
                                        min: { value: 1, message: 'Must be at least 1' },
                                    }}
                                    render={({ field, fieldState: { error } }) => (
                                        <FormInput
                                            fullWidth
                                            type="number"
                                            error={error}
                                            field={field}
                                            value={field.value}
                                            label="No of Plots"
                                        />
                                    )}
                                />
                            </Grid>
                        )}

                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ mt: 3, textAlign: { xs: 'center', md: 'right' } }}>
                <LoadingButton
                    variant="contained"
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {btnLabel}
                </LoadingButton>
            </Box>

            {/* Block CRUD Dialog */}
            <CrudOptionDialog
                open={blockDialogOpen}
                title="Manage Blocks"
                onClose={() => setBlockDialogOpen(false)}
                onUpdated={(updated) => setBlocks(updated)}
                permissions={{
                    canCreate: hasPermission(PERMISSIONS.PLOT_BLOCK.CREATE),
                    canUpdate: hasPermission(PERMISSIONS.PLOT_BLOCK.UPDATE),
                    canDelete: hasPermission(PERMISSIONS.PLOT_BLOCK.DELETE),
                }}
                fetchItems={GetPlotBlocks}
                createItem={CreatePlotBlock}
                updateItem={UpdatePlotBlock}
                deleteItem={DeletePlotBlock}
            />

            {/* Category CRUD Dialog */}
            <CrudOptionDialog
                open={categoryDialogOpen}
                title="Manage Categories"
                onClose={() => setCategoryDialogOpen(false)}
                onUpdated={(updated) => setCategories(updated)}
                permissions={{
                    canCreate: hasPermission(PERMISSIONS.PLOT_CATEGORY.CREATE),
                    canUpdate: hasPermission(PERMISSIONS.PLOT_CATEGORY.UPDATE),
                    canDelete: hasPermission(PERMISSIONS.PLOT_CATEGORY.DELETE),
                }}
                fetchItems={GetPlotCategories}
                createItem={CreatePlotCategory}
                updateItem={UpdatePlotCategory}
                deleteItem={DeletePlotCategory}
            />
        </form>
    );
}

export default PlotForm;
