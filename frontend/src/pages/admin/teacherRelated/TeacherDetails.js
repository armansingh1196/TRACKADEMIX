import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Avatar } from '@mui/material';
import styled from 'styled-components';
import AppButton from '../../../components/common/AppButton';

// Icons
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <HeaderBox>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                    Professor Profile
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                    Detailed overview of faculty assignments and credentials.
                </Typography>
            </HeaderBox>

            <ProfileCard>
                <ProfileHeader>
                    <Avatar 
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            bgcolor: 'var(--primary)',
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            boxShadow: '0 8px 24px rgba(132, 94, 194, 0.4)'
                        }}
                    >
                        {teacherDetails?.name ? teacherDetails.name.charAt(0).toUpperCase() : 'P'}
                    </Avatar>
                    <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
                            {teacherDetails?.name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Faculty Member
                        </Typography>
                    </Box>
                </ProfileHeader>

                <DetailsGrid>
                    <DetailItem>
                        <IconWrapper className="blue">
                            <ClassOutlinedIcon />
                        </IconWrapper>
                        <Box>
                            <Typography className="label">Assigned Class</Typography>
                            <Typography className="value">{teacherDetails?.teachSclass?.sclassName || "Unassigned"}</Typography>
                        </Box>
                    </DetailItem>

                    {isSubjectNamePresent ? (
                        <>
                            <DetailItem>
                                <IconWrapper className="green">
                                    <MenuBookOutlinedIcon />
                                </IconWrapper>
                                <Box>
                                    <Typography className="label">Subject Specialization</Typography>
                                    <Typography className="value">{teacherDetails?.teachSubject?.subName}</Typography>
                                </Box>
                            </DetailItem>
                            <DetailItem>
                                <IconWrapper className="orange">
                                    <ScheduleOutlinedIcon />
                                </IconWrapper>
                                <Box>
                                    <Typography className="label">Total Sessions</Typography>
                                    <Typography className="value">{teacherDetails?.teachSubject?.sessions}</Typography>
                                </Box>
                            </DetailItem>
                        </>
                    ) : (
                        <ActionContainer>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>No Subject Assigned</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>This professor is not currently assigned to teach any specific subject for their class.</Typography>
                            </Box>
                            <AppButton 
                                variant="contained" 
                                onClick={handleAddSubject}
                                startIcon={<AddCircleOutlineIcon />}
                                sx={{ 
                                    background: 'var(--gradient-vibrant) !important',
                                    boxShadow: '0 8px 16px rgba(255, 128, 102, 0.3) !important',
                                    px: 4,
                                    py: 1.5
                                }}
                            >
                                Assign Subject
                            </AppButton>
                        </ActionContainer>
                    )}
                </DetailsGrid>
            </ProfileCard>
        </Container>
    );
};

export default TeacherDetails;

// Styled Components
const HeaderBox = styled(Box)`
    margin-bottom: 32px;
    color: var(--text-main);
`;

const ProfileCard = styled(Box)`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    overflow: hidden;
    animation: fadeIn 0.6s ease-out;
`;

const ProfileHeader = styled(Box)`
    padding: 40px;
    background: linear-gradient(135deg, rgba(132, 94, 194, 0.1) 0%, rgba(255, 128, 102, 0.05) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;

    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
    }
`;

const DetailsGrid = styled(Box)`
    padding: 40px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
`;

const DetailItem = styled(Box)`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.02);
    transition: var(--transition);

    &:hover {
        transform: translateY(-2px);
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
        font-weight: 700;
        margin-bottom: 4px;
    }

    .value {
        font-size: 1.1rem;
        color: white;
        font-weight: 600;
    }
`;

const IconWrapper = styled(Box)`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 24px;
    }

    &.blue {
        background: rgba(66, 165, 245, 0.1);
        color: #42a5f5;
    }

    &.green {
        background: rgba(102, 187, 106, 0.1);
        color: #66bb6a;
    }

    &.orange {
        background: rgba(255, 167, 38, 0.1);
        color: #ffa726;
    }
`;

const ActionContainer = styled(Box)`
    grid-column: 1 / -1;
    padding: 32px;
    background: rgba(255, 128, 102, 0.05);
    border: 1px dashed rgba(255, 128, 102, 0.3);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;