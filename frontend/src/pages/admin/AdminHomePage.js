import { Container, Grid, Box } from '@mui/material'
import SeeNotice from '../../components/SeeNotice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import styled from 'styled-components';

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

    const stats = [
        { title: 'Total Students', value: studentsList?.length, icon: <PeopleAltOutlinedIcon />, color: '#845EC2' },
        { title: 'Total Classes', value: sclassesList?.length, icon: <SchoolOutlinedIcon />, color: '#FF8066' },
        { title: 'Total Professors', value: teachersList?.length, icon: <AccountBalanceOutlinedIcon />, color: '#C34A36' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title="Institutional Overview" 
                subtitle={`Welcome back, ${currentUser.name}. Here is what's happening at ${currentUser.schoolName}.`} 
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

export default AdminHomePage;

const SectionPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
`;