import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, CircularProgress, Stack, 
    Checkbox, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import AppButton from "../../components/common/AppButton";
import AppHeader from "../../components/common/AppHeader";
import Popup from "../../components/Popup";
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const { sclassStudents, loading } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    const [attendanceList, setAttendanceList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

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
            const today = new Date().toISOString().split('T')[0];
            const attendanceData = attendanceList.map(item => ({
                student_id: item.student_id,
                subject_id: subjectID,
                teacher_id: teacherID,
                sclass_id: classID,
                date: today,
                status: item.status
            }));

            await axios.post(`${process.env.REACT_APP_BASE_URL}/Teacher/BulkAttendance`, { attendanceData });
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
                                        <TableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>Present</TableCell>
                                        <TableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800 }}>Absent</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendanceList.map((row) => (
                                        <StyledTableRow key={row.student_id}>
                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>{row.rollNum}</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>{row.name}</TableCell>
                                            <TableCell align="center">
                                                <Checkbox 
                                                    checked={row.status === 'Present'} 
                                                    onChange={() => toggleStatus(row.student_id)}
                                                    sx={{ color: 'var(--primary)', '&.Mui-checked': { color: '#4BB543' } }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Checkbox 
                                                    checked={row.status === 'Absent'} 
                                                    onChange={() => toggleStatus(row.student_id)}
                                                    sx={{ color: 'var(--border)', '&.Mui-checked': { color: '#ff4b2b' } }}
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

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  td {
    border-bottom: 1px solid rgba(176, 168, 185, 0.05) !important;
  }
`;
