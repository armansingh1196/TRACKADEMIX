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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer, MainContent } from '../../components/styles';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';
import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherViewStudent from './TeacherViewStudent';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';
import MarkAttendance from './MarkAttendance';
import styled from 'styled-components';

const TeacherDashboard = () => {
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
                        PROFESSOR PORTAL
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>
            
            <Drawer variant="permanent" open={open}>
                <Toolbar />
                <Box sx={{ overflow: 'hidden', height: '100%' }}>
                    <List component="nav" sx={{ p: 0 }}>
                        <TeacherSideBar open={open} />
                    </List>
                </Box>
            </Drawer>

            <MainContent open={open}>
                <Toolbar />
                <ContentWrapper>
                    <Routes>
                        <Route path="/" element={<TeacherHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/profile" element={<TeacherProfile />} />
                        <Route path="/Teacher/complain" element={<TeacherComplain />} />
                        <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                        <Route path="/Teacher/attendance" element={<MarkAttendance />} />
                        <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />
                        <Route path="/Teacher/class/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </ContentWrapper>
            </MainContent>
        </Box>
    );
}


export default TeacherDashboard;

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