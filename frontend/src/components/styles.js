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

/* ── Navigation Bar — translucent blur with accent-tinted bottom border ── */
export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    background: 'rgba(6, 8, 24, 0.82) !important',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderBottom: '1px solid rgba(124, 77, 255, 0.1)',
    boxShadow: 'none !important',
    transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important, margin 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        padding: '0 8px',
    },
}));

/* ── Sidebar — deep glass panel with accent-tinted border ── */
export const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important, background-color 0.3s !important',
        boxSizing: 'border-box',
        background: 'rgba(6, 8, 24, 0.92) !important',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRight: '1px solid rgba(124, 77, 255, 0.08)',
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
    transition: 'margin-left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important, padding 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important',
    marginLeft: open ? drawerWidth : collapsedWidth,
    [theme.breakpoints.down('md')]: {
        marginLeft: 0,
    },
}));

/* ── Table Cells — Inter with tabular-nums for aligned data ── */
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: 'rgba(124, 77, 255, 0.06)',
        color: 'rgba(124, 77, 255, 0.85)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        textTransform: 'uppercase',
        fontSize: '0.6875rem',
        letterSpacing: '0.1em',
        borderBottom: '1px solid rgba(124, 77, 255, 0.12)',
        padding: '12px 16px',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '0.875rem',
        color: 'rgba(226, 232, 255, 0.78)',
        borderBottom: '1px solid rgba(124, 77, 255, 0.06)',
        fontFamily: 'var(--font-body)',
        fontWeight: 400,
        fontFeatureSettings: "'tnum'",
        letterSpacing: '-0.011em',
        padding: '12px 16px',
    },
}));

/* ── Table Row ── */
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'background 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(124, 77, 255, 0.04)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));