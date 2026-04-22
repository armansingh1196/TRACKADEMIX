import React, { useEffect, useState } from "react";
import { Button, Grid, Box, Typography, CircularProgress, Container, IconButton, Tooltip } from "@mui/material";
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

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const { status, currentUser, response } = useSelector(state => state.user);

    const sclassName = params.id
    const adminID = currentUser._id
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
        const fields = {
            sclassName,
            subjects: subjects.map((subject) => ({
                subName: subject.subName,
                subCode: subject.subCode,
                sessions: subject.sessions,
            })),
            adminID,
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
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, response, dispatch]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <StyledPaper elevation={0}>
                <HeaderBox>
                    <IconCircle>
                        <AssignmentOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                    </IconCircle>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 1 }}>
                        Configure Subjects
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Assign core academic subjects and weekly session requirements.
                    </Typography>
                </HeaderBox>

                <form onSubmit={submitHandler}>
                    {subjects.map((subject, index) => (
                        <SubjectCard key={index}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <AppTextField
                                        fullWidth
                                        label="Subject Name"
                                        placeholder="e.g. Mathematics"
                                        value={subject.subName}
                                        onChange={handleSubjectChange(index, 'subName')}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <AppTextField
                                        fullWidth
                                        label="Code"
                                        placeholder="e.g. MATH101"
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
                                            <IconButton onClick={handleRemoveSubject(index)} color="error">
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

                    <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate(-1)} sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                            Cancel
                        </Button>
                        <AppButton 
                            variant="contained" 
                            type="submit" 
                            disabled={loader}
                            sx={{ 
                                minWidth: 160,
                                background: 'var(--gradient-vibrant) !important',
                                boxShadow: '0 8px 24px rgba(255, 128, 102, 0.2)'
                            }}
                        >
                            {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Subjects'}
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
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

const StyledPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${fadeIn} 0.8s ease-out;
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
  border-radius: 20px;
  border: 1px solid var(--border);
  margin-bottom: 16px;
  transition: var(--transition);
  
  &:hover {
    border-color: rgba(132, 94, 194, 0.3);
    background: rgba(255, 255, 255, 0.04);
  }
`;