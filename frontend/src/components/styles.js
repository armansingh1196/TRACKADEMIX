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

/* ── iOS Navigation Bar — exact translucent blur like iOS top bar ── */
export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    background: 'rgba(0, 0, 0, 0.78) !important',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderBottom: '1px solid rgba(84, 84, 88, 0.55)',
    boxShadow: 'none !important',
    transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: '0 8px',
    },
}));

/* ── iOS Sidebar — deep glass panel ── */
export const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: 'width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxSizing: 'border-box',
        background: 'rgba(10, 10, 14, 0.88) !important',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRight: '1px solid rgba(84, 84, 88, 0.45)',
        overflowX: 'hidden',
        height: '100vh',
        zIndex: theme.zIndex.drawer,
        ...(!open && {
            width: collapsedWidth,
            [theme.breakpoints.down('md')]: {
                width: 0,
                transform: 'translateX(-100%)',
            },
        }),
    },
}));

/* ── Main Content Area ── */
export const MainContent = styled('main', {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    backgroundColor: 'var(--bg-base)',
    transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    marginLeft: open ? drawerWidth : collapsedWidth,
    [theme.breakpoints.down('md')]: {
        marginLeft: 0,
    },
}));

/* ── iOS-style Table Cells ── */
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'rgba(110, 63, 243, 0.06)',
        color: 'rgba(110, 63, 243, 0.85)',
        fontFamily: 'var(--font-sf)',
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.6875rem',  /* 11px — iOS caption 2 */
        letterSpacing: '0.08em',
        borderBottom: '1px solid rgba(84, 84, 88, 0.55)',
        padding: '12px 16px',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '0.9375rem',  /* 15px — iOS subhead */
        color: 'rgba(235, 235, 245, 0.75)',
        borderBottom: '1px solid rgba(84, 84, 88, 0.2)',
        fontFamily: 'var(--font-sf)',
        fontWeight: 400,
        padding: '12px 16px',
    },
}));

/* ── iOS Table Row ── */
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'background 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(110, 63, 243, 0.04)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));