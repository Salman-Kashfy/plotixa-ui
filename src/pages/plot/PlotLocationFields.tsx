import { useContext, useEffect, useState } from 'react';
import {
    Box, FormControl, FormHelperText, InputLabel, IconButton,
    MenuItem, Select, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SettingsIcon from '@mui/icons-material/Settings';
import { Control, Controller } from 'react-hook-form';
import { AdminContext } from '../../hooks/AdminContext';
import { PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';
import {
    GetBlocks, UpsertBlock, DeletePlotBlock,
    GetPlotCategories, CreatePlotCategory, UpdatePlotCategory, DeletePlotCategory,
} from '../../services/plot.service';
import CrudOptionDialog, { CrudOption } from './CrudOptionDialog';

type Props = {
    control: Control<any>;
};

function PlotLocationFields({ control }: Props) {
    const adminContext: any = useContext(AdminContext);
    const [blocks, setBlocks] = useState<CrudOption[]>([]);
    const [categories, setCategories] = useState<CrudOption[]>([]);
    const [blocksLoading, setBlocksLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    const canManageBlocks = hasPermission(PERMISSIONS.BLOCK.UPSERT) ||
        hasPermission(PERMISSIONS.BLOCK.DELETE);
    const canManageCategories = hasPermission(PERMISSIONS.CATEGORY.UPSERT) ||
        hasPermission(PERMISSIONS.CATEGORY.DELETE);

    const fetchBlocks = () => {
        setBlocksLoading(true);
        GetBlocks({ projectUuid: adminContext.projectUuid })
            .then((items) => {
                setBlocks(items);
                setBlocksLoading(false);
            })
            .catch(() => setBlocksLoading(false));
    };

    const fetchCategories = () => {
        setCategoriesLoading(true);
        GetPlotCategories({ projectUuid: adminContext.projectUuid })
            .then((items) => {
                setCategories(items);
                setCategoriesLoading(false);
            })
            .catch(() => setCategoriesLoading(false));
    };

    useEffect(() => {
        fetchBlocks();
        fetchCategories();
    }, [adminContext.projectUuid]);

    return (
        <>
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
                                    {blocks.map((block) => (
                                        <MenuItem key={block.uuid} value={block.uuid}>{block.name}</MenuItem>
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
                                    {categories.map((category) => (
                                        <MenuItem key={category.uuid} value={category.uuid}>{category.name}</MenuItem>
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

            <CrudOptionDialog
                open={blockDialogOpen}
                title="Manage Blocks"
                onClose={() => setBlockDialogOpen(false)}
                onUpdated={setBlocks}
                permissions={{
                    canCreate: hasPermission(PERMISSIONS.BLOCK.UPSERT),
                    canUpdate: hasPermission(PERMISSIONS.BLOCK.UPSERT),
                    canDelete: hasPermission(PERMISSIONS.BLOCK.DELETE),
                }}
                fetchItems={() => GetBlocks({ projectUuid: adminContext.projectUuid })}
                createItem={({ name }) => UpsertBlock({ name, projectUuid: adminContext.projectUuid })}
                updateItem={(uuid, { name }) => UpsertBlock({ uuid, name, projectUuid: adminContext.projectUuid })}
                deleteItem={DeletePlotBlock}
            />
            <CrudOptionDialog
                open={categoryDialogOpen}
                title="Manage Categories"
                onClose={() => setCategoryDialogOpen(false)}
                onUpdated={setCategories}
                permissions={{
                    canCreate: hasPermission(PERMISSIONS.CATEGORY.UPSERT),
                    canUpdate: hasPermission(PERMISSIONS.CATEGORY.UPSERT),
                    canDelete: hasPermission(PERMISSIONS.CATEGORY.DELETE),
                }}
                fetchItems={() => GetPlotCategories({ projectUuid: adminContext.projectUuid })}
                createItem={({ name }) => CreatePlotCategory({ name, projectUuid: adminContext.projectUuid })}
                updateItem={(id, { name }) => UpdatePlotCategory(id, { name, projectUuid: adminContext.projectUuid })}
                deleteItem={DeletePlotCategory}
            />
        </>
    );
}

export default PlotLocationFields;
