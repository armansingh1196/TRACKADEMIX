import { Container, Grid, Box, Typography, Paper, Stack } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import styled, { keyframes } from 'styled-components';

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
        dispatch(getClassStudents(classID));
    }, [dispatch, subjectID, classID]);

    const stats = [
        { title: 'Enrolled Students', value: sclassStudents?.length, icon: <PeopleAltOutlinedIcon />, color: '#845EC2' },
        { title: 'Planned Sessions', value: subjectDetails?.sessions || 0, icon: <TopicOutlinedIcon />, color: '#FF8066' },
        { title: 'Marked Today', value: 'Yes', icon: <EventAvailableOutlinedIcon />, color: '#4BB543' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
            <AppHeader 
                title={`Welcome, Prof. ${currentUser.name}`} 
                subtitle={`Managing Academic Records for ${currentUser.teachSubject?.subName} | ${currentUser.teachSclass?.sclassName}`} 
            />

            <Grid container spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <DashboardCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <SectionPaper>
                        <Box sx={{ p: 1 }}>
                            <SeeNotice />
                        </Box>
                    </SectionPaper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <GlassCard sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 3 }}>
                            Course Quick-Links
                        </Typography>
                        <Stack spacing={2}>
                            <QuickLinkBox>
                                <Typography variant="subtitle2" sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>
                                    LATEST SESSION
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                    {currentUser.teachSubject?.subName} - Roll Call
                                </Typography>
                            </QuickLinkBox>
                            <QuickLinkBox>
                                <Typography variant="subtitle2" sx={{ color: 'var(--secondary)', fontWeight: 800 }}>
                                    BATCH INFO
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                    {currentUser.teachSclass?.sclassName} Details
                                </Typography>
                            </QuickLinkBox>
                        </Stack>
                        
                        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid var(--border)' }}>
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                                Your account is verified as Senior Faculty for the {currentUser.schoolName} institutional portal.
                            </Typography>
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherHomePage;

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

const QuickLinkBox = styled(Box)`
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border-radius: 20px;
  border: 1px solid var(--border);
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--primary);
    transform: translateX(5px);
  }
`;