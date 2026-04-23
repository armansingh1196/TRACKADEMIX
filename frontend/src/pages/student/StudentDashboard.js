import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer, MainContent } from '../../components/styles';
import Logout from '../Logout';
import StudentSideBar from './StudentSideBar';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';
import StudentComplain from './StudentComplain';
import AccountMenu from '../../components/AccountMenu';
import styled from 'styled-components';

const StudentDashboard = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--bg-main)' }}>
            <CssBaseline />
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
                            fontWeight: 800, 
                            fontFamily: 'Outfit', 
                            color: 'white',
                            opacity: 0.8,
                            fontSize: '1rem',
                            letterSpacing: '1px'
                        }}
                    >
                        STUDENT PORTAL
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>
            
            <Drawer variant="permanent" open={open}>
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
                        <Route path="/logout" element={<Logout />} />

                    </Routes>
                </ContentWrapper>
            </MainContent>
        </Box>
    );
}

export default StudentDashboard;

const BrandLogo = styled(Typography)`
  font-weight: 900 !important;
  color: white !important;
  font-family: 'Outfit', sans-serif !important;
  letter-spacing: 1px !important;
  font-size: 1.25rem !important;
  
  span {
    color: var(--primary);
  }
`;

const ContentWrapper = styled(Box)`
  padding: 32px;
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;