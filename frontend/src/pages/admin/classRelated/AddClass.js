import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography, Grid, MenuItem } from "@mui/material";
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
    const [batch, setBatch] = useState("2022-26");
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, response, tempDetails, currentUser } = useSelector(state => state.user);
    const adminID = currentUser._id;

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const submitHandler = (event) => {
        event.preventDefault()
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
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, response, dispatch, tempDetails]);

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AppHeader 
                title="Institutional Expansion" 
                subtitle="Define a new academic batch and semester for tracking."
            />
            
            <FormWrapper>
                <IconCircle>
                    <ClassOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                </IconCircle>
                
                <form onSubmit={submitHandler}>
                    <Stack spacing={4}>
                        <AppTextField
                            label="Class / Section Name"
                            placeholder="e.g. CSE-A"
                            value={sclassName}
                            onChange={(event) => setSclassName(event.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />

                        <AppTextField
                            label="Batch Period"
                            placeholder="e.g. 2022-2026"
                            value={batch}
                            onChange={(event) => setBatch(event.target.value)}
                            required
                            fullWidth
                        />

                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <AppTextField
                                    select
                                    label="Academic Year"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    fullWidth
                                >
                                    {[1, 2, 3, 4].map((y) => (
                                        <MenuItem key={y} value={y}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</MenuItem>
                                    ))}
                                </AppTextField>
                            </Grid>
                            <Grid item xs={6}>
                                <AppTextField
                                    select
                                    label="Semester"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    fullWidth
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                        <MenuItem key={s} value={s}>Sem {s}</MenuItem>
                                    ))}
                                </AppTextField>
                            </Grid>
                        </Grid>

                        <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
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
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Establish Batch"}
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
  margin-top: 40px;
  animation: ${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1);
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