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
import { GetExpenseTypes, CreateExpenseType, UpdateExpenseType, DeleteExpenseType } from '../../services/expense.service';
import { PERMISSIONS } from '../../utils/constants';
import { hasPermission } from '../../utils/permissions';

type ExpenseType = { id: string; name: string };

type Props = {
    open: boolean;
    onClose: () => void;
    onUpdated: (types: ExpenseType[]) => void;
};

function ExpenseTypeDialog({ open, onClose, onUpdated }: Props) {
    const [types, setTypes] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const canCreate = hasPermission(PERMISSIONS.EXPENSE_TYPE.CREATE);
    const canUpdate = hasPermission(PERMISSIONS.EXPENSE_TYPE.UPDATE);
    const canDelete = hasPermission(PERMISSIONS.EXPENSE_TYPE.DELETE);

    const fetchTypes = () => {
        setLoading(true);
        GetExpenseTypes().then((data) => {
            setTypes(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        if (open) fetchTypes();
    }, [open]);

    const handleAdd = () => {
        if (!newName.trim()) return;
        setSavingId('new');
        CreateExpenseType({ name: newName.trim() }).then((res) => {
            setSavingId(null);
            if (res.status) {
                setNewName('');
                setAdding(false);
                fetchTypes();
            }
        }).catch(() => setSavingId(null));
    };

    const handleUpdate = (id: string) => {
        if (!editingName.trim()) return;
        setSavingId(id);
        UpdateExpenseType(id, { name: editingName.trim() }).then((res) => {
            setSavingId(null);
            if (res.status) {
                setEditingId(null);
                fetchTypes();
            }
        }).catch(() => setSavingId(null));
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        DeleteExpenseType(id).then((res) => {
            setDeletingId(null);
            if (res.status) fetchTypes();
        }).catch(() => setDeletingId(null));
    };

    const handleClose = () => {
        onUpdated(types);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Manage Expense Types
                <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : (
                    <List disablePadding>
                        {types.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
                                No expense types yet.
                            </Typography>
                        )}
                        {types.map((type, index) => (
                            <Box key={type.id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{ py: 0.5 }}
                                    secondaryAction={
                                        editingId === type.id ? (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => handleUpdate(type.id)} disabled={savingId === type.id}>
                                                    {savingId === type.id ? <CircularProgress size={16} /> : <CheckIcon fontSize="small" color="success" />}
                                                </IconButton>
                                                <IconButton size="small" onClick={() => setEditingId(null)}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {canUpdate && (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => { setEditingId(type.id); setEditingName(type.name); }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {canDelete && (
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDelete(type.id)} disabled={deletingId === type.id} color="error">
                                                            {deletingId === type.id ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        )
                                    }
                                >
                                    {editingId === type.id ? (
                                        <TextField
                                            variant="standard"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(type.id)}
                                            autoFocus
                                            size="small"
                                            sx={{ pr: 10 }}
                                            fullWidth
                                        />
                                    ) : (
                                        <ListItemText primary={type.name} />
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
                                placeholder="Type name"
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
                {canCreate && !adding && (
                    <Button startIcon={<AddIcon />} size="small" onClick={() => setAdding(true)}>
                        Add Type
                    </Button>
                )}
                <Box sx={{ ml: 'auto' }}>
                    <Button onClick={handleClose} variant="contained" size="small">Done</Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default ExpenseTypeDialog;
