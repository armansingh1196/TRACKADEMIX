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
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';
import styled from 'styled-components';

const AdminDashboard = () => {
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
                        INSTITUTIONAL MANAGEMENT
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>
            
            <Drawer variant="permanent" open={open}>
                <Toolbar /> {/* Spacer for AppBar */}
                <Box sx={{ overflow: 'hidden', height: '100%' }}>
                    <List component="nav" sx={{ p: 0 }}>
                        <SideBar open={open} />
                    </List>
                </Box>
            </Drawer>

            <MainContent open={open}>
                <Toolbar /> {/* Spacer for AppBar */}
                <ContentWrapper>
                    <Routes>
                        <Route path="/" element={<AdminHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                        <Route path="/Admin/profile" element={<AdminProfile />} />
                        <Route path="/Admin/complains" element={<SeeComplains />} />

                        {/* Notice */}
                        <Route path="/Admin/addnotice" element={<AddNotice />} />
                        <Route path="/Admin/notices" element={<ShowNotices />} />

                        {/* Subject */}
                        <Route path="/Admin/subjects" element={<ShowSubjects />} />
                        <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                        <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                        <Route path="/Admin/class/subject/:classID/:subjectID" element={<ViewSubject />} />
                        <Route path="/Admin/subject/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Admin/subject/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />

                        {/* Class */}
                        <Route path="/Admin/addclass" element={<AddClass />} />
                        <Route path="/Admin/classes" element={<ShowClasses />} />
                        <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                        <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                        {/* Student */}
                        <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                        <Route path="/Admin/students" element={<ShowStudents />} />
                        <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                        <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                        <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                        {/* Teacher */}
                        <Route path="/Admin/teachers" element={<ShowTeachers />} />
                        <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                        <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                        <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                        <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                        <Route path="/Admin/teachers/addteacher/:id" element={<AddTeacher />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </ContentWrapper>
            </MainContent>
        </Box>
    );
}

export default AdminDashboard

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