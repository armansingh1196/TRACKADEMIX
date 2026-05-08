import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, CircularProgress, Stack, 
    Paper, TextField, Grid, Switch
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import AppButton from "../../components/common/AppButton";
import AppHeader from "../../components/common/AppHeader";
import Popup from "../../components/Popup";
import styled, { keyframes } from 'styled-components';
import { api } from '../../api/client';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const { sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const [attendanceList, setAttendanceList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;
    const teacherID = currentUser._id;

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0) {
            setAttendanceList(sclassStudents.map(student => ({
                student_id: student._id,
                name: student.name,
                rollNum: student.rollNum,
                status: 'Present' // Default to present
            })));
        }
    }, [sclassStudents]);

    const toggleStatus = (id) => {
        setAttendanceList(prev => prev.map(item => 
            item.student_id === id 
                ? { ...item, status: item.status === 'Present' ? 'Absent' : 'Present' }
                : item
        ));
    };

    const submitHandler = async () => {
        setLoader(true);
        try {
            const attendanceData = attendanceList.map(item => ({
                student_id: item.student_id,
                subject_id: subjectID,
                teacher_id: teacherID,
                sclass_id: classID,
                date: selectedDate,
                status: item.status
            }));

            await api.post(`/Teacher/BulkAttendance`, { attendanceData });
            setMessage("Attendance records submitted successfully!");
            setShowPopup(true);
        } catch (err) {
            setMessage("Failed to submit attendance. Please try again.");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Daily Session Roll Call" 
                subtitle={`Mark attendance for ${currentUser.teachSclass?.sclassName} - ${currentUser.teachSubject?.subName}`}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                    label="Class Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                        minWidth: 200, 
                        bgcolor: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'var(--border)' },
                            '&:hover fieldset': { borderColor: 'var(--primary)' },
                        },
                        '& .MuiInputLabel-root': { color: 'var(--text-muted)' }
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Stack spacing={4} sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                        {attendanceList.map((row) => (
                            <Grid item xs={12} md={6} key={row.student_id}>
                                <Paper sx={{ 
                                    p: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { 
                                        borderColor: 'var(--primary)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'var(--shadow-md)'
                                    }
                                }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                                            {row.rollNum}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 700 }}>
                                            {row.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="body2" sx={{ color: row.status === 'Present' ? '#4BB543' : '#ff4b2b', fontWeight: 700 }}>
                                            {row.status}
                                        </Typography>
                                        <Switch 
                                            checked={row.status === 'Present'} 
                                            onChange={() => toggleStatus(row.student_id)}
                                            sx={{ 
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#4BB543' },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4BB543' },
                                                '& .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.1)' }
                                            }}
                                        />
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <AppButton 
                            variant="contained" 
                            size="large" 
                            onClick={submitHandler}
                            disabled={loader || attendanceList.length === 0}
                            sx={{ minWidth: 200 }}
                        >
                            {loader ? <CircularProgress size={24} /> : "Submit Attendance"}
                        </AppButton>
                    </Box>
                </Stack>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default MarkAttendance;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 24px !important;
  overflow: hidden;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;
