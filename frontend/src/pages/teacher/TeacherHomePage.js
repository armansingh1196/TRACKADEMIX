import { Container, Grid, Box } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import styled from 'styled-components';

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
        { title: 'Class Students', value: sclassStudents?.length, icon: <PeopleAltOutlinedIcon />, color: '#845EC2' },
        { title: 'Total Topics', value: subjectDetails?.sessions, icon: <TopicOutlinedIcon />, color: '#FF8066' },
        { title: 'Tests Taken', value: 24, icon: <AssignmentOutlinedIcon />, color: '#C34A36' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title={`Welcome, Prof. ${currentUser.name}`} 
                subtitle={`Managing ${currentUser.teachSubject?.subName} for ${currentUser.teachSclass?.sclassName}.`} 
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <DashboardCard {...stat} />
                    </Grid>
                ))}
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

export default TeacherHomePage;

const SectionPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
`;