import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress, Box, Typography, MenuItem, Select, FormControl, InputLabel, Grid, Container, Stack } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import AppButton from '../../../components/common/AppButton';
import AppTextField from '../../../components/common/AppTextField';
import AppHeader from '../../../components/common/AppHeader';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const { status, currentUser, response } = useSelector(state => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);

    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [sclassName, setSclassName] = useState('');

    const adminID = currentUser._id;
    const role = "Student";
    const attendance = [];

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if (sclassName === "") {
            setMessage("Please select a classname");
            setShowPopup(true);
        } else {
            setLoader(true);
            dispatch(registerUser({ name, rollNum, password, sclassName, adminID, role, attendance }, role));
        }
    };

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate(-1);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, response, dispatch]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <AppHeader 
                title="Student Registration" 
                subtitle="Enroll a new student into the institutional database and assign their credentials."
            />
            
            <StyledPaper>
                <Grid container spacing={6}>
                    <Grid item xs={12} md={4}>
                        <IllustrationBox>
                            <IconCircle>
                                <PersonAddAlt1OutlinedIcon sx={{ fontSize: 48, color: 'var(--primary)' }} />
                            </IconCircle>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 2, fontFamily: 'Outfit' }}>
                                New Enrollment
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Ensure all details are accurate. Roll numbers must be unique within the academic year.
                            </Typography>
                        </IllustrationBox>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <form onSubmit={submitHandler}>
                            <Stack spacing={4}>
                                <AppTextField
                                    fullWidth
                                    label="Student Full Name"
                                    placeholder="Enter the student's full name"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                />
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        {situation === "Class" ? (
                                             <AppTextField
                                                fullWidth
                                                label="Class ID"
                                                value={sclassName}
                                                disabled
                                            />
                                        ) : (
                                            <FormControl fullWidth>
                                                <InputLabel id="class-select-label" sx={{ color: 'var(--text-muted)' }}>Target Class</InputLabel>
                                                <StyledSelect
                                                    labelId="class-select-label"
                                                    value={className}
                                                    label="Target Class"
                                                    onChange={changeHandler}
                                                    required
                                                >
                                                    <MenuItem value="Select Class">Select Class</MenuItem>
                                                    {sclassesList.map((classItem, index) => (
                                                        <MenuItem key={index} value={classItem.sclassName}>
                                                            {classItem.sclassName}
                                                        </MenuItem>
                                                    ))}
                                                </StyledSelect>
                                            </FormControl>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <AppTextField
                                            fullWidth
                                            label="Roll Number"
                                            type="number"
                                            placeholder="Unique Roll No."
                                            value={rollNum}
                                            onChange={(event) => setRollNum(event.target.value)}
                                            required
                                        />
                                    </Grid>
                                </Grid>

                                <AppTextField
                                    fullWidth
                                    label="Account Password"
                                    type="password"
                                    placeholder="Create a default access password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    autoComplete="new-password"
                                />

                                <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                                    <AppButton 
                                        type="submit" 
                                        variant="contained" 
                                        disabled={loader}
                                        sx={{ 
                                            flex: 2, 
                                            py: 1.8, 
                                            background: 'var(--gradient-vibrant) !important',
                                            boxShadow: '0 8px 24px rgba(255, 128, 102, 0.2)'
                                        }}
                                    >
                                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Register Student'}
                                    </AppButton>
                                    <AppButton 
                                        variant="outlined" 
                                        onClick={() => navigate(-1)}
                                        sx={{ flex: 1, color: 'white', borderColor: 'var(--border)' }}
                                    >
                                        Back
                                    </AppButton>
                                </Box>
                            </Stack>
                        </form>
                    </Grid>
                </Grid>
            </StyledPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddStudent;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Box)`
  padding: 56px;
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${fadeIn} 0.8s ease-out;
`;

const IllustrationBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  justify-content: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24px;
  border: 1px solid var(--border);
`;

const IconCircle = styled(Box)`
  width: 96px;
  height: 96px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
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