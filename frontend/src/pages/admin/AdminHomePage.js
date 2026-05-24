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
                    <GlassCard sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column' }}>
                        <SeeNotice />
                    </GlassCard>
                </Grid>
                <Grid item xs={12} md={5}>
                    <GlassCard sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
  background: rgba(255, 255, 255, 0.055);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.1);
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 600px) {
    border-radius: 14px;
    padding: 12px;
  }
`;

const GlassCard = styled(Paper)`
  background: rgba(255, 255, 255, 0.055) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px !important;
  border: 1px solid rgba(124, 77, 255, 0.1) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1) !important;
  animation: ${fadeIn} 0.8s ease-out;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(124, 77, 255, 0.25) !important;
    background: rgba(255, 255, 255, 0.08) !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,77,255,0.12), inset 0 1px 0 rgba(255,255,255,0.14) !important;
  }
`;