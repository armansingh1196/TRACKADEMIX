import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api/client';
import {
    Box,
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    Select,
    MenuItem,
    Chip,
    CircularProgress
} from '@mui/material';
import styled from 'styled-components';

const AttendanceRecord = () => {
    const { currentUser } = useSelector((state) => state.user);
    const subjectID = currentUser.teachSubject?._id;

    const [records, setRecords] = useState([]);
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!subjectID) {
                setError("No subject assigned.");
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/Teacher/AttendanceRecords/${subjectID}`);
                const data = response.data;
                
                // Group by date
                const grouped = data.reduce((acc, curr) => {
                    if (!acc[curr.date]) {
                        acc[curr.date] = [];
                    }
                    acc[curr.date].push(curr);
                    return acc;
                }, {});

                setRecords(grouped);
                const uniqueDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
                setDates(uniqueDates);
                if (uniqueDates.length > 0) {
                    setSelectedDate(uniqueDates[0]);
                }
            } catch (err) {
                console.error("Failed to fetch attendance records:", err);
                setError("Failed to load records. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [subjectID]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography color="error" variant="h6">{error}</Typography>
            </Container>
        );
    }

    const currentRecords = records[selectedDate] || [];

    // Calculate summary statistics
    const totalStudents = currentRecords.length;
    const presentCount = currentRecords.filter(r => r.status === 'Present').length;
    const absentCount = totalStudents - presentCount;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <HeaderBox>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                    Attendance Summary
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                    Review past attendance records for your class
                </Typography>
            </HeaderBox>

            <ContentGrid>
                <ControlsCard elevation={0}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Select Date
                    </Typography>
                    {dates.length > 0 ? (
                        <FormControl fullWidth variant="outlined">
                            <Select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-main)',
                                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                                    '.MuiSvgIcon-root': { color: 'var(--text-main)' }
                                }}
                            >
                                {dates.map(date => (
                                    <MenuItem key={date} value={date}>{date}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography sx={{ color: 'var(--text-muted)' }}>No attendance records found.</Typography>
                    )}
                </ControlsCard>

                {dates.length > 0 && (
                    <SummaryCards>
                        <StatCard>
                            <Typography className="label">Present</Typography>
                            <Typography className="value present">{presentCount}</Typography>
                        </StatCard>
                        <StatCard>
                            <Typography className="label">Absent</Typography>
                            <Typography className="value absent">{absentCount}</Typography>
                        </StatCard>
                        <StatCard>
                            <Typography className="label">Overall %</Typography>
                            <Typography className="value">{attendancePercentage}%</Typography>
                        </StatCard>
                    </SummaryCards>
                )}
            </ContentGrid>

            {dates.length > 0 && (
                <StyledTableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Roll No.</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.students?.roll_num}</TableCell>
                                    <TableCell>{record.students?.name}</TableCell>
                                    <TableCell align="right">
                                        <Chip 
                                            label={record.status} 
                                            color={record.status === 'Present' ? 'success' : 'error'}
                                            size="small"
                                            sx={{ fontWeight: 600, borderRadius: '8px' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Container>
    );
};

export default AttendanceRecord;

const HeaderBox = styled(Box)`
    margin-bottom: 32px;
    color: var(--text-main);
`;

const ContentGrid = styled(Box)`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    margin-bottom: 32px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const ControlsCard = styled(Paper)`
    padding: 24px;
    border-radius: 20px !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(10px);
`;

const SummaryCards = styled(Box)`
    display: flex;
    gap: 16px;

    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const StatCard = styled(Box)`
    flex: 1;
    padding: 24px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .label {
        font-size: 0.85rem;
        text-transform: uppercase;
        color: var(--text-muted);
        font-weight: 700;
        margin-bottom: 8px;
    }

    .value {
        font-size: 2.5rem;
        font-weight: 800;
        font-family: 'Outfit', sans-serif;
        line-height: 1;
        color: var(--text-main);

        &.present { color: #4caf50; }
        &.absent { color: #f44336; }
    }
`;

const StyledTableContainer = styled(TableContainer)`
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 20px !important;

    .MuiTableCell-root {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-main);
    }
    
    .MuiTableHead-root .MuiTableCell-root {
        background: rgba(255, 255, 255, 0.03);
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }
`;
