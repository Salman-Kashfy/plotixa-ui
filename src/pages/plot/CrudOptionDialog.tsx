import { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, IconButton, List, ListItem, ListItemText,
    TextField, Box, CircularProgress, Typography, Divider,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type CrudOption = { id: string; name: string };

type Permissions = {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};

type Props = {
    open: boolean;
    title: string;
    onClose: () => void;
    onUpdated: (items: CrudOption[]) => void;
    permissions: Permissions;
    fetchItems: () => Promise<CrudOption[]>;
    createItem: (data: { name: string }) => Promise<any>;
    updateItem: (id: string, data: { name: string }) => Promise<any>;
    deleteItem: (id: string) => Promise<any>;
};

function CrudOptionDialog({
    open, title, onClose, onUpdated, permissions,
    fetchItems, createItem, updateItem, deleteItem,
}: Props) {
    const [items, setItems] = useState<CrudOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const refresh = () => {
        setLoading(true);
        fetchItems().then((data) => {
            setItems(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        if (open) refresh();
    }, [open]);

    const handleAdd = () => {
        if (!newName.trim()) return;
        setSavingId('new');
        createItem({ name: newName.trim() }).then((res) => {
            setSavingId(null);
            if (res.status) { setNewName(''); setAdding(false); refresh(); }
        }).catch(() => setSavingId(null));
    };

    const handleUpdate = (id: string) => {
        if (!editingName.trim()) return;
        setSavingId(id);
        updateItem(id, { name: editingName.trim() }).then((res) => {
            setSavingId(null);
            if (res.status) { setEditingId(null); refresh(); }
        }).catch(() => setSavingId(null));
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        deleteItem(id).then((res) => {
            setDeletingId(null);
            if (res.status) refresh();
        }).catch(() => setDeletingId(null));
    };

    const handleClose = () => {
        onUpdated(items);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : (
                    <List disablePadding>
                        {items.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                                No items yet.
                            </Typography>
                        )}
                        {items.map((item, index) => (
                            <Box key={item.id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{ py: 0.5 }}
                                    secondaryAction={
                                        editingId === item.id ? (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => handleUpdate(item.id)} disabled={savingId === item.id}>
                                                    {savingId === item.id ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" color="success" />}
                                                </IconButton>
                                                <IconButton size="small" onClick={() => setEditingId(null)}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {permissions.canUpdate && (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => { setEditingId(item.id); setEditingName(item.name); }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {permissions.canDelete && (
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
                                                            {deletingId === item.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        )
                                    }
                                >
                                    {editingId === item.id ? (
                                        <TextField
                                            variant="standard"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item.id)}
                                            autoFocus
                                            size="small"
                                            sx={{ pr: 10 }}
                                            fullWidth
                                        />
                                    ) : (
                                        <ListItemText primary={item.name} />
                                    )}
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                )}
                {adding && (
                    <>
                        <Divider />
                        <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                                variant="standard"
                                placeholder="Name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                autoFocus
                                fullWidth
                                size="small"
                            />
                            <IconButton size="small" onClick={handleAdd} disabled={savingId === 'new'} color="success">
                                {savingId === 'new' ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" />}
                            </IconButton>
                            <IconButton size="small" onClick={() => { setAdding(false); setNewName(''); }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
                {permissions.canCreate && !adding && (
                    <Button startIcon={<AddIcon />} size="small" onClick={() => setAdding(true)}>
                        Add
                    </Button>
                )}
                <Box sx={{ ml: 'auto' }}>
                    <Button onClick={handleClose} variant="contained" size="small">Done</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default CrudOptionDialog;
