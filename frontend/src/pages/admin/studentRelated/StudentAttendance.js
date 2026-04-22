import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';

import {
    Box, InputLabel,
    MenuItem, Select,
    Typography, Stack,
    CircularProgress, FormControl, Container, Divider
} from '@mui/material';
import AppButton from '../../../components/common/AppButton';
import AppTextField from '../../../components/common/AppTextField';
import AppHeader from '../../../components/common/AppHeader';
import Popup from '../../../components/Popup';
import styled, { keyframes } from 'styled-components';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';

const StudentAttendance = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, statestatus } = useSelector((state) => state.student);
    const params = useParams()

    const [studentID, setStudentID] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [status, setStatus] = useState('');
    const [date, setDate] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        if (situation === "Student") {
            setStudentID(params.id);
            dispatch(getUserDetails(params.id, "Student"));
        }
        else if (situation === "Subject") {
            const { studentID, subjectID } = params
            setStudentID(studentID);
            dispatch(getUserDetails(studentID, "Student"));
            setChosenSubName(subjectID);
        }
    }, [situation, params, dispatch]);

    useEffect(() => {
        if (userDetails && userDetails.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails, situation]);

    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(
            (subject) => subject.subName === event.target.value
        );
        setSubjectName(selectedSubject.subName);
        setChosenSubName(selectedSubject._id);
    }

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(updateStudentFields(studentID, { subName: chosenSubName, status, date }, "StudentAttendance"))
    }

    useEffect(() => {
        if (response) {
            setLoader(false)
            setShowPopup(true)
            setMessage(response)
        }
        else if (statestatus === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Attendance Recorded Successfully")
        }
    }, [response, statestatus])

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <AppHeader 
                title="Mark Attendance" 
                subtitle="Daily academic engagement tracking and record updates."
            />
            
            <StyledPaper elevation={0}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <HeaderBox>
                            <IconCircle>
                                <HowToRegOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                            </IconCircle>
                            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 1 }}>
                                {userDetails?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                Enrollment ID: #{userDetails?.rollNum}
                            </Typography>
                        </HeaderBox>

                        <form onSubmit={submitHandler}>
                            <Stack spacing={3}>
                                {situation === "Student" && (
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'var(--text-muted)' }}>Select Subject</InputLabel>
                                        <StyledSelect
                                            value={subjectName}
                                            label="Select Subject"
                                            onChange={changeHandler}
                                            required
                                        >
                                            {subjectsList?.map((subject, index) => (
                                                <MenuItem key={index} value={subject.subName}>
                                                    {subject.subName}
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>
                                )}

                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: 'var(--text-muted)' }}>Attendance Status</InputLabel>
                                    <StyledSelect
                                        value={status}
                                        label="Attendance Status"
                                        onChange={(event) => setStatus(event.target.value)}
                                        required
                                    >
                                        <MenuItem value="Present">Present</MenuItem>
                                        <MenuItem value="Absent">Absent</MenuItem>
                                    </StyledSelect>
                                </FormControl>

                                <AppTextField
                                    label="Session Date"
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Box sx={{ pt: 3 }}>
                                    <AppButton 
                                        variant="contained" 
                                        fullWidth 
                                        type="submit" 
                                        disabled={loader}
                                        sx={{ 
                                            py: 1.8, 
                                            background: 'var(--gradient-primary) !important',
                                            boxShadow: '0 8px 24px rgba(132, 94, 194, 0.2)'
                                        }}
                                    >
                                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Record Attendance'}
                                    </AppButton>
                                    <AppButton 
                                        variant="text" 
                                        fullWidth 
                                        onClick={() => navigate(-1)}
                                        sx={{ mt: 2, color: 'var(--text-muted)' }}
                                    >
                                        Cancel
                                    </AppButton>
                                </Box>
                            </Stack>
                        </form>
                    </>
                )}
            </StyledPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    )
}

export default StudentAttendance

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${slideUp} 0.8s ease-out;
`;

const HeaderBox = styled(Box)`
  text-align: center;
  margin-bottom: 40px;
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

const StyledSelect = styled(Select)`
  border-radius: 14px !important;
  color: white !important;
  & .MuiOutlinedInput-notchedOutline {
    border-color: var(--border) !important;
  }
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: var(--primary) !important;
  }
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: var(--primary) !important;
    border-width: 2px !important;
  }
  & .MuiSelect-select {
    padding: 16px !important;
  }
`;