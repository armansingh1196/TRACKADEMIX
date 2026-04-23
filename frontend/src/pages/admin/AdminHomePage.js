import { Container, Grid, Box, Typography, Paper, Stack } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import CustomPieChart from '../../components/CustomPieChart';
import styled, { keyframes } from 'styled-components';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user)

    const adminID = currentUser._id

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    // Calculate Batch Distribution
    const batchDataRaw = sclassesList?.reduce((acc, curr) => {
        const batch = curr.batch || "Unassigned";
        acc[batch] = (acc[batch] || 0) + 1;
        return acc;
    }, {});

    const chartData = batchDataRaw ? Object.entries(batchDataRaw).map(([name, value]) => ({
        name,
        value
    })) : [];

    const stats = [
        { title: 'Total Students', value: studentsList?.length, icon: <PeopleAltOutlinedIcon />, color: '#845EC2' },
        { title: 'Active Batches', value: [...new Set(sclassesList?.map(s => s.batch))].length, icon: <SchoolOutlinedIcon />, color: '#FF8066' },
        { title: 'Core Faculty', value: teachersList?.length, icon: <AccountBalanceOutlinedIcon />, color: '#C34A36' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title="Institutional Intelligence" 
                subtitle={`Welcome back, ${currentUser.name}. Monitoring ${currentUser.schoolName} performance.`} 
            />
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <DashboardCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <SectionPaper sx={{ minHeight: 460 }}>
                        <Box sx={{ p: 2 }}>
                            <SeeNotice />
                        </Box>
                    </SectionPaper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <GlassCard sx={{ height: '100%', p: 4, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                            <AssessmentOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 28 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>
                                Batch Distribution
                            </Typography>
                        </Box>
                        
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
                            {chartData.length > 0 ? (
                                <CustomPieChart data={chartData} />
                            ) : (
                                <Typography sx={{ color: 'var(--text-muted)' }}>No batch data available</Typography>
                            )}
                        </Box>
                        
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                                Analytics represent the current active enrollment across all 8 semesters.
                            </Typography>
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SectionPaper = styled(Box)`
  background: var(--bg-card);
  border-radius: 32px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.6s ease-out;
`;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  backdrop-filter: blur(24px);
  border-radius: 32px !important;
  border: 1px solid var(--border) !important;
  box-shadow: var(--shadow-xl) !important;
  animation: ${fadeIn} 0.8s ease-out;
`;