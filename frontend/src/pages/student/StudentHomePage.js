import React, { useEffect, useState } from 'react'
import { Container, Grid, Box } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import SeeNotice from '../../components/SeeNotice';
import SubjectIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIcon from "@mui/icons-material/TaskOutlined";
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import styled from 'styled-components';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const classID = currentUser.sclassName._id

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
        dispatch(getSubjectList(classID, "ClassSubjects"));
    }, [dispatch, currentUser._id, classID]);

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const stats = [
        { title: 'Total Subjects', value: subjectsList?.length, icon: <SubjectIcon />, color: '#845EC2' },
        { title: 'Performance', value: 85, icon: <AssignmentIcon />, color: '#FF8066' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title={`Hello, ${currentUser.name}`} 
                subtitle={`Track your progress and attendance at ${currentUser.schoolName}.`} 
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <DashboardCard {...stat} />
                    </Grid>
                ))}
                <Grid item xs={12} sm={12} md={4}>
                    <ChartPaper>
                        <Typography variant="overline" sx={{ fontWeight: 800, mb: 2, display: 'block', textAlign: 'center', color: 'var(--secondary)', letterSpacing: 1 }}>
                            Overall Attendance
                        </Typography>
                        <Box sx={{ height: 160, display: 'flex', justifyContent: 'center' }}>
                            {subjectAttendance.length > 0 ? (
                                <CustomPieChart data={chartData} />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                                    No records available
                                </Box>
                            )}
                        </Box>
                    </ChartPaper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <SectionPaper>
                        <SeeNotice />
                    </SectionPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentHomePage;

const Typography = ({ children, variant, sx }) => (
    <Box component="div" sx={{ typography: variant, ...sx }}>{children}</Box>
);

const SectionPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
`;

const ChartPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 28px;
  box-shadow: var(--shadow-md);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: var(--transition);
  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
  }
`;