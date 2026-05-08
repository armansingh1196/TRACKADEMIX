import React, { useEffect, useState } from "react";
import { Button, Grid, Box, Typography, CircularProgress, Container, IconButton, Tooltip, MenuItem } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';
import AppTextField from "../../../components/common/AppTextField";
import AppButton from "../../../components/common/AppButton";
import styled, { keyframes } from "styled-components";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);
    const [targetSemester, setTargetSemester] = useState(1);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const { status, currentUser, response } = useSelector(state => state.user);

    const sclassName = params.id
    const adminID = currentUser?._id
    const address = "Subject"

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    const handleSubjectChange = (index, field) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index][field] = event.target.value;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if (!adminID) {
            setMessage("Session expired. Please login again.");
            setShowPopup(true);
            return;
        }
        const fields = {
            sclassName,
            subjects: subjects.map((subject) => ({
                subName: subject.subName,
                subCode: subject.subCode,
                sessions: subject.sessions,
            })),
            adminID,
            semester: targetSemester
        };
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response || "Failed to add subjects")
            setShowPopup(true)
            setLoader(false)
            dispatch(underControl())
        }
    }, [status, navigate, response, dispatch]);

    return (
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
            <StyledPaper className="fade-in">
                <HeaderBox>
                    <IconCircle>
                        <AssignmentOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                    </IconCircle>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'white', mb: 1 }}>
                        Configure Subjects
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                        Assign academic content for a specific semester in the B.Tech timeline.
                    </Typography>
                </HeaderBox>

                <form onSubmit={submitHandler}>
                    <Box sx={{ mb: 6, p: 3, background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--primary)', mb: 2, fontWeight: 700 }}>
                            GLOBAL PARAMETERS
                        </Typography>
                        <AppTextField
                            select
                            fullWidth
                            label="Target Semester"
                            value={targetSemester}
                            onChange={(e) => setTargetSemester(e.target.value)}
                            helperText="All subjects below will be assigned to this semester."
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                            ))}
                        </AppTextField>
                    </Box>

                    <Stack spacing={2}>
                        <Typography variant="subtitle2" sx={{ color: 'var(--primary)', px: 1, fontWeight: 700 }}>
                            SUBJECT LIST
                        </Typography>
                        {subjects.map((subject, index) => (
                            <SubjectCard key={index}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <AppTextField
                                            fullWidth
                                            label="Subject Name"
                                            placeholder="e.g. Data Structures"
                                            value={subject.subName}
                                            onChange={handleSubjectChange(index, 'subName')}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <AppTextField
                                            fullWidth
                                            label="Code"
                                            placeholder="e.g. CS201"
                                            value={subject.subCode}
                                            onChange={handleSubjectChange(index, 'subCode')}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <AppTextField
                                            fullWidth
                                            label="Sessions"
                                            type="number"
                                            placeholder="Weekly"
                                            value={subject.sessions}
                                            onChange={handleSubjectChange(index, 'sessions')}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        {index > 0 ? (
                                            <Tooltip title="Remove Subject">
                                                <IconButton onClick={handleRemoveSubject(index)} sx={{ color: '#ef4444' }}>
                                                    <RemoveCircleOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Add Another Subject">
                                                <IconButton onClick={handleAddSubject} sx={{ color: 'var(--secondary)' }}>
                                                    <AddCircleOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Grid>
                                </Grid>
                            </SubjectCard>
                        ))}
                    </Stack>

                    <Box sx={{ mt: 5, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <AppButton 
                            variant="outlined" 
                            fullWidth 
                            onClick={() => navigate(-1)}
                            sx={{ color: 'white', borderColor: 'var(--border)' }}
                        >
                            Cancel
                        </AppButton>
                        <AppButton 
                            variant="contained" 
                            fullWidth
                            type="submit" 
                            disabled={loader}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Register Subjects'}
                        </AppButton>
                    </Box>
                </form>
            </StyledPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
}

export default SubjectForm

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Box)`
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  
  @media (max-width: 600px) {
    padding: 24px;
    border-radius: 24px;
  }
`;

const HeaderBox = styled(Box)`
  text-align: center;
  margin-bottom: 48px;
`;

const IconCircle = styled(Box)`
  width: 72px;
  height: 72px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;

const SubjectCard = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--secondary);
    background: rgba(255, 255, 255, 0.04);
  }

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const Stack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;