import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography, Grid, MenuItem } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from "../../../components/Popup";
import AppTextField from "../../../components/common/AppTextField";
import AppButton from "../../../components/common/AppButton";
import AppHeader from "../../../components/common/AppHeader";
import styled, { keyframes } from "styled-components";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");
    const [batch, setBatch] = useState("2024-2028");
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, response, tempDetails, currentUser, error } = useSelector(state => state.user);
    const adminID = currentUser?._id;

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Dynamic Batch Options based on current year
    const currentYear = new Date().getFullYear();
    const batchOptions = [
        `${currentYear}-${currentYear + 4}`,
        `${currentYear - 1}-${currentYear + 3}`,
        `${currentYear - 2}-${currentYear + 2}`,
        `${currentYear - 3}-${currentYear + 1}`,
    ];

    const submitHandler = (event) => {
        event.preventDefault()
        if (!adminID) {
            setMessage("Session expired. Please login again.");
            setShowPopup(true);
            return;
        }
        setLoader(true)
        const fields = { sclassName, batch, year, semester, adminID };
        dispatch(addStuff(fields, "Sclass"))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            dispatch(underControl())
            navigate("/Admin/classes")
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response || "Failed to create class");
            setShowPopup(true)
            setLoader(false)
            dispatch(underControl())
        }
        else if (status === 'error') {
            setMessage("Network error or server misconfiguration. Please check if database migrations are applied.");
            setShowPopup(true)
            setLoader(false)
            dispatch(underControl())
        }
    }, [status, navigate, response, dispatch, tempDetails]);

    const handleSemesterChange = (val) => {
        setSemester(val);
        setYear(Math.ceil(val / 2));
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AppHeader 
                title="Establish Batch" 
                subtitle="Define a new academic section within the 4-year institutional cycle."
            />
            
            <FormWrapper className="fade-in">
                <IconCircle>
                    <ClassOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                </IconCircle>
                
                <form onSubmit={submitHandler}>
                    <Stack spacing={4}>
                        <AppTextField
                            label="Section / Class Name"
                            placeholder="e.g. CSE-A"
                            value={sclassName}
                            onChange={(event) => setSclassName(event.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />

                        <AppTextField
                            select
                            label="Academic Batch Cycle"
                            value={batch}
                            onChange={(event) => setBatch(event.target.value)}
                            required
                            fullWidth
                        >
                            {batchOptions.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt} Batch</MenuItem>
                            ))}
                        </AppTextField>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <AppTextField
                                    select
                                    label="Current Semester"
                                    value={semester}
                                    onChange={(e) => handleSemesterChange(e.target.value)}
                                    fullWidth
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <MenuItem key={s} value={s}>Semester {s}</MenuItem>
                                    ))}
                                </AppTextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <AppTextField
                                    disabled
                                    label="Calculated Year"
                                    value={`${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year`}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ pt: 2, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <AppButton 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => navigate(-1)}
                                sx={{ color: 'white', borderColor: 'var(--border)' }}
                            >
                                Cancel
                            </AppButton>
                            <AppButton
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Establish Section"}
                            </AppButton>
                        </Box>
                    </Stack>
                </form>
            </FormWrapper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    )
}

export default AddClass

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FormWrapper = styled(Box)`
  width: 100%;
  max-width: 560px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  margin-top: 20px;
  
  @media (max-width: 600px) {
    padding: 24px;
    border-radius: 24px;
  }
`;

const IconCircle = styled(Box)`
  width: 80px;
  height: 80px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;