import { useState, useEffect } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer, MainContent } from '../../components/styles';
import Logout from '../Logout';
import StudentSideBar from './StudentSideBar';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import StudentComplain from './StudentComplain';
import StudentAIInsights from './StudentAIInsights';
import StudentDocuments from './StudentDocuments';
import AccountMenu from '../../components/AccountMenu';
import styled from 'styled-components';

const StudentDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);

    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
            <CssBaseline />
            {/* ── Ambient orbs — ChooseUser aesthetic ── */}
            <div className="ambient-orb" style={{ top: '-10%', right: '-5%', width: 650, height: 650, background: 'radial-gradient(circle, rgba(68,138,255,0.13) 0%, transparent 65%)', animationDuration: '24s' }} />
            <div className="ambient-orb" style={{ bottom: '-15%', left: '-6%', width: 550, height: 550, background: 'radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 65%)', animationDelay: '-9s', animationDuration: '28s' }} />
            <div className="ambient-orb" style={{ top: '45%', left: '42%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 65%)', animationDelay: '-17s', animationDuration: '32s' }} />
            <AppBar open={open} position='fixed' elevation={0}>
                <Toolbar sx={{ pr: '24px', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '240px' }}>
                        <IconButton
                            color="inherit"
                            aria-label="toggle drawer"
                            onClick={toggleDrawer}
                            sx={{ mr: 2, color: 'var(--primary)' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <BrandLogo>
                            TRACAD<span>EMIX</span>
                        </BrandLogo>
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{ 
                            flexGrow: 1, 
                            fontWeight: 700, 
                            fontFamily: 'var(--font-heading)', 
                            color: 'rgba(226,232,255,0.6)',
                            opacity: 1,
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                            letterSpacing: '0.1em',
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        STUDENT PORTAL
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>
            
            <Drawer variant={isMobile ? "temporary" : "permanent"} open={open} onClose={() => setOpen(false)}>
                <Toolbar />
                <Box sx={{ overflow: 'hidden', height: '100%' }}>
                    <List component="nav" sx={{ p: 0 }}>
                        <StudentSideBar open={open} />
                    </List>
                </Box>
            </Drawer>

            <MainContent open={open}>
                <Toolbar />
                <ContentWrapper>
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />
                        <Route path="/Student/subjects" element={<StudentSubjects />} />
                        <Route path="/Student/complain" element={<StudentComplain />} />
                        <Route path="/Student/ai-insights" element={<StudentAIInsights />} />
                        <Route path="/Student/documents" element={<StudentDocuments />} />
                        <Route path="/logout" element={<Logout />} />

                    </Routes>
                </ContentWrapper>
            </MainContent>
        </Box>
    );
}

export default StudentDashboard;

const BrandLogo = styled(Typography)`
  font-weight: 800 !important;
  color: #F5F5FF !important;
  font-family: var(--font-display) !important;
  letter-spacing: -0.025em !important;
  font-size: 1.125rem !important;

  @media (max-width: 600px) {
    font-size: 1rem !important;
  }

  span {
    color: #7C4DFF;
  }
`;

const ContentWrapper = styled(Box)`
  padding: 24px 28px;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  overflow-x: hidden;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 16px 14px;
  }

  @media (max-width: 600px) {
    padding: 12px 10px;
  }
`;