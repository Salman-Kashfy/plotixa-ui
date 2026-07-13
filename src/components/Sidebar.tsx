import { CSSObject, styled, Theme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import SidebarNavContent from './SidebarNavContent';
import { DRAWER_WIDTH } from './navigation/sidebarNavConfig';

const openedMixin = (theme: Theme): CSSObject => ({
    width: DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

    const drawerPaperProps = {
        sx: {
            scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
    },
};

type DesktopSidebarProps = {
    open: boolean;
};

export function DesktopSidebar({ open }: DesktopSidebarProps) {
    return (
        <Drawer variant="permanent" open={open} PaperProps={drawerPaperProps}>
            <SidebarNavContent expanded={open} />
        </Drawer>
    );
}

type MobileSidebarDrawerProps = {
    open: boolean;
    onClose: () => void;
};

export function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps) {
    return (
        <MuiDrawer
            variant="temporary"
            anchor="left"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
                ...drawerPaperProps,
                sx: {
                    ...drawerPaperProps.sx,
                    width: DRAWER_WIDTH,
                },
            }}
        >
            <SidebarNavContent expanded onNavigate={onClose} />
        </MuiDrawer>
    );
}

export { DRAWER_WIDTH };
