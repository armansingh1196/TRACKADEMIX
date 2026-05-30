import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, CircularProgress, Stack, 
    TextField, Grid, Paper 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import AppButton from "../../components/common/AppButton";
import AppHeader from "../../components/common/AppHeader";
import Popup from "../../components/Popup";
import styled, { keyframes } from 'styled-components';
import { api } from '../../api/client';

const BulkMarkMarks = () => {
    const dispatch = useDispatch();
    const { sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const [marksList, setMarksList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;
    const cleanSubName = (raw) => (raw || 'Subject').replace(/\s*\((?:Sem\s*\d+|\d{4})\)\s*$/i, '').trim();
    const displaySubName = `${cleanSubName(currentUser.teachSubject?.subName)} (Sem ${currentUser.teachSclass?.semester || 'N/A'})`;
    const subjectType = currentUser.teachSubject?.subjectType || 'Theory';
    const isPractical = subjectType === 'Practical';
    const maxInternal = isPractical ? 25 : 30;
    const maxExternal = isPractical ? 25 : 70;

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID]);

    useEffect(() => {
        if (sclassStudents && sclassStudents.length > 0) {
            setMarksList(sclassStudents.map(student => {
                const existingMark = student.exam_marks?.find(m => m.subName === subjectID);
                return {
                    student_id: student._id,
                    name: student.name,
                    rollNum: student.rollNum,
                    internalMarks: existingMark ? existingMark.internal_marks : 0,
                    externalMarks: existingMark ? existingMark.external_marks : 0
                };
            }));
        }
    }, [sclassStudents, subjectID]);

    const handleMarkChange = (id, field, value, max) => {
        const mark = Math.min(max, Math.max(0, parseInt(value) || 0));
        setMarksList(prev => prev.map(item => 
            item.student_id === id 
                ? { ...item, [field]: mark }
                : item
        ));
    };

    const submitHandler = async () => {
        setLoader(true);
        try {
            const marksData = marksList.map(item => ({
                student_id: item.student_id,
                subject_id: subjectID,
                internal_marks: item.internalMarks,
                external_marks: item.externalMarks
            }));

            await api.post(`/Teacher/BulkMarks`, { marksData });
            setMessage("Exam marks updated successfully!");
            setShowPopup(true);
        } catch (err) {
            setMessage("Failed to update marks. Please try again.");
            setShowPopup(true);
        } finally {
            setLoader(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Bulk Marks Entry" 
                subtitle={`Upload examination marks for ${currentUser.teachSclass?.sclassName} - ${displaySubName}`}
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Stack spacing={4} sx={{ mt: 4 }}>
                    <Grid container spacing={1}>
                        {marksList.map((row) => (
                            <Grid item xs={12} sm={6} md={3} lg={3} key={row.student_id}>
                                <Paper 
                                    sx={{ 
                                        p: 1.5, 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        background: 'rgba(20, 20, 30, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { 
                                            borderColor: 'rgba(99, 102, 241, 0.5)',
                                            background: 'rgba(99, 102, 241, 0.08)',
                                            transform: 'translateY(-2px)'
                                        }
                                }}>
                                    <Box sx={{ mb: 1.5 }}>
                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.3px', fontSize: '0.65rem' }}>
                                            {row.rollNum}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2, mt: 0.2 }}>
                                            {row.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField 
                                            label={`Internal (${maxInternal})`}
                                            type="number"
                                            variant="outlined"
                                            size="small"
                                            value={row.internalMarks}
                                            onChange={(e) => handleMarkChange(row.student_id, 'internalMarks', e.target.value, maxInternal)}
                                            InputLabelProps={{ shrink: true, style: { fontSize: '0.75rem', color: 'var(--text-muted)' } }}
                                            InputProps={{
                                                inputProps: { min: 0, max: maxInternal, style: { fontSize: '0.8rem', padding: '6px 8px' } },
                                                sx: { 
                                                    color: 'white', 
                                                    fontWeight: 700,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                    '&:hover fieldset': { borderColor: 'var(--primary) !important' },
                                                }
                                            }}
                                            sx={{ flex: 1 }}
                                        />
                                        <TextField 
                                            label={`External (${maxExternal})`}
                                            type="number"
                                            variant="outlined"
                                            size="small"
                                            value={row.externalMarks}
                                            onChange={(e) => handleMarkChange(row.student_id, 'externalMarks', e.target.value, maxExternal)}
                                            InputLabelProps={{ shrink: true, style: { fontSize: '0.75rem', color: 'var(--text-muted)' } }}
                                            InputProps={{
                                                inputProps: { min: 0, max: maxExternal, style: { fontSize: '0.8rem', padding: '6px 8px' } },
                                                sx: { 
                                                    color: 'white', 
                                                    fontWeight: 700,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                    '&:hover fieldset': { borderColor: 'var(--primary) !important' },
                                                }
                                            }}
                                            sx={{ flex: 1 }}
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
                            disabled={loader || marksList.length === 0}
                            sx={{ minWidth: 200 }}
                        >
                            {loader ? <CircularProgress size={24} /> : "Publish Marks"}
                        </AppButton>
                    </Box>
                </Stack>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default BulkMarkMarks;


