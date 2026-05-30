import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../api/client';
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
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
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }}>
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
                <Grid container spacing={1}>
                    {currentRecords.map((record) => (
                        <Grid item xs={12} sm={6} md={3} lg={3} key={record.id || record._id || Math.random()}>
                            <Paper 
                                sx={{ 
                                    p: 1.25, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    background: 'rgba(20, 20, 30, 0.4)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { 
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        transform: 'translateY(-2px)'
                                    }
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.3px', fontSize: '0.65rem' }}>
                                        {record.students?.rollNum || record.students?.roll_num || '—'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2, mt: 0.2 }}>
                                        {record.students?.name || 'Unknown'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Chip 
                                        label={record.status} 
                                        size="small"
                                        sx={{ 
                                            fontWeight: 600, 
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            height: '22px',
                                            backgroundColor: record.status === 'Present' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: record.status === 'Present' ? '#10B981' : '#EF4444',
                                            border: `1px solid ${record.status === 'Present' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                                        }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
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
        font-family: 'Plus Jakarta Sans', sans-serif;
        line-height: 1;
        color: var(--text-main);

        &.present { color: #4caf50; }
        &.absent { color: #f44336; }
    }
`;

