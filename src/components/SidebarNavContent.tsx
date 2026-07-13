import { NavLink } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import crmLogo from '../assets/cloudfitnest.png';
import crmIcon from '../assets/cloudfitnest-icon.png';
import { hasPermission } from '../utils/permissions';
import { getVisibleNavItems, sidebarNavItems } from './navigation/sidebarNavConfig';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

type SidebarNavContentProps = {
    expanded?: boolean;
    onNavigate?: () => void;
};

function SidebarNavContent({ expanded = true, onNavigate }: SidebarNavContentProps) {
    const theme = useTheme();
    const iconStyles = { color: theme.palette.mode === 'dark' ? '#00f5ff' : '#444', fontSize: '1.2rem' };
    const labelTypography = { fontSize: '0.875rem' };
    const listBtnStyles = { height: 36, px: 2.5 };
    const visibleItems = getVisibleNavItems(sidebarNavItems, hasPermission);

    return (
        <>
            <DrawerHeader sx={{ justifyContent: 'center' }}>
                <img
                    src={expanded ? crmLogo : crmIcon}
                    alt="CloudFitnest"
                    style={{ height: '25px', filter: theme.palette.mode === 'dark' ? 'invert(1)' : '' }}
                />
            </DrawerHeader>
            <Divider />
            <List sx={{ pb: 2 }}>
                {visibleItems.map((item) => (
                    <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
                        <Tooltip
                            title={item.label}
                            placement="right"
                            disableHoverListener={expanded}
                            disableFocusListener={expanded}
                        >
                            <ListItemButton
                                component={NavLink}
                                to={item.route}
                                onClick={onNavigate}
                                sx={[
                                    listBtnStyles,
                                    expanded ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                                ]}
                            >
                                <ListItemIcon
                                    sx={[
                                        { minWidth: 0, justifyContent: 'center' },
                                        expanded ? { mr: 2 } : { mr: 'auto' },
                                    ]}
                                >
                                    <item.Icon sx={iconStyles} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    sx={[expanded ? { opacity: 1 } : { opacity: 0 }]}
                                    primaryTypographyProps={labelTypography}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

export default SidebarNavContent;
