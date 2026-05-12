import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, CircularProgress, Stack, 
    TextField, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper 
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
    const subName = currentUser.teachSubject?.subName;
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
                subtitle={`Upload examination marks for ${currentUser.teachSclass?.sclassName} - ${subName}`}
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Stack spacing={4} sx={{ mt: 4 }}>
                    <GlassCard>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ background: 'rgba(132, 94, 194, 0.1)' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>Roll No</TableCell>
                                        <TableCell sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>Student Name</TableCell>
                                        <TableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>Internal ({maxInternal})</TableCell>
                                        <TableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>External ({maxExternal})</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {marksList.map((row) => (
                                        <StyledTableRow key={row.student_id}>
                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>{row.rollNum}</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>{row.name}</TableCell>
                                            <TableCell align="center">
                                                <TextField 
                                                    type="number"
                                                    variant="outlined"
                                                    size="small"
                                                    value={row.internalMarks}
                                                    onChange={(e) => handleMarkChange(row.student_id, 'internalMarks', e.target.value, maxInternal)}
                                                    InputProps={{
                                                        inputProps: { min: 0, max: maxInternal },
                                                        sx: { 
                                                            color: 'white', 
                                                            fontWeight: 800,
                                                            textAlign: 'center',
                                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                            '&:hover fieldset': { borderColor: 'var(--primary) !important' },
                                                        }
                                                    }}
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField 
                                                    type="number"
                                                    variant="outlined"
                                                    size="small"
                                                    value={row.externalMarks}
                                                    onChange={(e) => handleMarkChange(row.student_id, 'externalMarks', e.target.value, maxExternal)}
                                                    InputProps={{
                                                        inputProps: { min: 0, max: maxExternal },
                                                        sx: { 
                                                            color: 'white', 
                                                            fontWeight: 800,
                                                            textAlign: 'center',
                                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                            '&:hover fieldset': { borderColor: 'var(--primary) !important' },
                                                        }
                                                    }}
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </GlassCard>

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

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  td {
    border-bottom: 1px solid rgba(176, 168, 185, 0.05) !important;
  }
`;
