import {
    styled,
    AppBar as MuiAppBar,
    Drawer as MuiDrawer,
    TableCell,
    TableRow,
    tableCellClasses,
} from '@mui/material';

const drawerWidth = 260;
const collapsedWidth = 72;

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    background: 'rgba(26, 24, 31, 0.8) !important',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
}));

export const Drawer = styled(MuiDrawer, { 
    shouldForwardProp: (prop) => prop !== 'open' 
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        background: 'var(--bg-main) !important',
        borderRight: '1px solid var(--border)',
        overflowX: 'hidden',
        ...(!open && {
            overflowX: 'hidden',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: collapsedWidth,
        }),
    },
}));

export const MainContent = styled('main', {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ open }) => ({
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    backgroundColor: 'var(--bg-main)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'rgba(132, 94, 194, 0.05)',
        color: 'var(--primary-light)',
        fontWeight: 800,
        fontFamily: 'Outfit',
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '1px',
        borderBottom: '1px solid var(--border)',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: 'var(--text-secondary)',
        borderBottom: '1px solid rgba(176, 168, 185, 0.05)',
        fontFamily: 'Inter',
        fontWeight: 500,
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));