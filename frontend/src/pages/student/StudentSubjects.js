import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { 
    BottomNavigation, BottomNavigationAction, Container, 
    Box, Typography, CircularProgress, Grid, Paper, Stack,
    Table, TableHead, TableBody
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart'
import AppHeader from '../../components/common/AppHeader';
import styled, { keyframes } from 'styled-components';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails])

    useEffect(() => {
        if (subjectMarks.length === 0 && currentUser?.sclassName) {
            const classId = currentUser?.sclassName?._id || currentUser?.sclassName;
            dispatch(getSubjectList(classId, "ClassSubjects"));
        }
    }, [subjectMarks, dispatch, currentUser?.sclassName]);

    const currentSemester = currentUser?.sclassName?.semester || 1;
    const currentBatch = currentUser?.sclassName?.batch || "N/A";

    // Group marks by semester using the new relational structure
    // result shape: { subject_id, marks_obtained, subjects: { sub_name, semester } }
    const groupedMarks = subjectMarks.reduce((acc, result) => {
        if (!result.subjects) return acc;
        const sem = result.subjects.semester || 'Unknown';
        if (!acc[sem]) {
            acc[sem] = [];
        }
        acc[sem].push(result);
        return acc;
    }, {});

    const sortedSemesters = Object.keys(groupedMarks).sort((a, b) => parseInt(a) - parseInt(b));

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => (
        <Stack spacing={4}>
            {sortedSemesters.map(semester => {
                const semesterMarks = groupedMarks[semester];
                const theoryMarks = semesterMarks.filter(r => r.subjects?.subject_type === 'Theory' || !r.subjects?.subject_type);
                const practicalMarks = semesterMarks.filter(r => r.subjects?.subject_type === 'Practical');

                return (
                    <GlassCard sx={{ p: 4 }} key={semester}>
                        <SectionHeader>
                            <TableChartIcon sx={{ color: 'var(--primary)', fontSize: 32 }} />
                            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                                Semester {semester} Performance
                            </Typography>
                        </SectionHeader>

                        {/* Theory Table */}
                        <Typography variant="subtitle1" sx={{ color: 'var(--primary)', mt: 2, mb: 1, fontWeight: 700 }}>
                            THEORY SUBJECTS
                        </Typography>
                        <Table sx={{ mt: 1 }}>
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Subject Name</StyledTableCell>
                                    <StyledTableCell align="center">Obtained Marks</StyledTableCell>
                                    <StyledTableCell align="right">Status</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {theoryMarks.map((result, index) => {
                                    const marks = result.marks_obtained || 0;
                                    const isPassing = marks >= 40;
                                    return (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell sx={{ color: 'white', fontWeight: 600 }}>
                                                {result.subjects.sub_name}
                                            </StyledTableCell>
                                            <StyledTableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: '1.1rem' }}>
                                                {marks}
                                            </StyledTableCell>
                                            <StyledTableCell align="right">
                                                <StatusBadge className={isPassing ? 'pass' : 'fail'}>
                                                    {isPassing ? 'Qualified' : 'Requires Improvement'}
                                                </StatusBadge>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Practical Table */}
                        {practicalMarks.length > 0 && (
                            <>
                                <Typography variant="subtitle1" sx={{ color: 'var(--secondary)', mt: 4, mb: 1, fontWeight: 700 }}>
                                    PRACTICAL / LAB SUBJECTS
                                </Typography>
                                <Table sx={{ mt: 1 }}>
                                    <TableHead>
                                        <StyledTableRow>
                                            <StyledTableCell>Subject Name</StyledTableCell>
                                            <StyledTableCell align="center">Obtained Marks</StyledTableCell>
                                            <StyledTableCell align="right">Status</StyledTableCell>
                                        </StyledTableRow>
                                    </TableHead>
                                    <TableBody>
                                        {practicalMarks.map((result, index) => {
                                            const marks = result.marks_obtained || 0;
                                            const isPassing = marks >= 20; // 40% of 50 is 20
                                            return (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCell sx={{ color: 'white', fontWeight: 600 }}>
                                                        {result.subjects.sub_name}
                                                    </StyledTableCell>
                                                    <StyledTableCell align="center" sx={{ color: 'var(--primary-light)', fontWeight: 800, fontSize: '1.1rem' }}>
                                                        {marks}
                                                    </StyledTableCell>
                                                    <StyledTableCell align="right">
                                                        <StatusBadge className={isPassing ? 'pass' : 'fail'}>
                                                            {isPassing ? 'Qualified' : 'Requires Improvement'}
                                                        </StatusBadge>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </GlassCard>
                );
            })}
        </Stack>
    );

    const renderChartSection = () => {
        // Flatten marks and rename properties for the chart to consume them easily
        const chartData = subjectMarks.map(result => ({
            subName: { subName: result.subjects?.sub_name || "Unknown" },
            marksObtained: result.marks_obtained || 0
        }));

        return (
            <GlassCard sx={{ p: 4, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                <SectionHeader>
                    <InsertChartIcon sx={{ color: 'var(--secondary)', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                        Cumulative Performance Analytics
                    </Typography>
                </SectionHeader>
                <Box sx={{ flexGrow: 1, mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CustomBarChart chartData={chartData} dataKey="marksObtained" />
                </Box>
            </GlassCard>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 10 }}>
            <AppHeader 
                title="Subject Analytics" 
                subtitle={`Current Semester: ${currentSemester} | Batch: ${currentBatch}`} 
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Stack spacing={4} sx={{ mt: 4 }}>
                    {subjectMarks.length > 0 ? (
                        <>
                            {selectedSection === 'table' ? renderTableSection() : renderChartSection()}
                            
                            <NavigationWrapper elevation={3}>
                                <BottomNavigation 
                                    value={selectedSection} 
                                    onChange={handleSectionChange} 
                                    showLabels
                                    sx={{ background: 'transparent' }}
                                >
                                    <StyledNavItem
                                        label="Tabular View"
                                        value="table"
                                        icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
                                    />
                                    <StyledNavItem
                                        label="Visual Trends"
                                        value="chart"
                                        icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
                                    />
                                </BottomNavigation>
                            </NavigationWrapper>
                        </>
                    ) : subjectsList && subjectsList.length > 0 ? (
                        <GlassCard sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 3, fontFamily: 'Outfit' }}>
                                Assigned Subjects
                            </Typography>
                            <Grid container spacing={2}>
                                {subjectsList.map((sub, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>
                                                {sub.sub_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                                Code: {sub.sub_code} | Sem: {sub.semester}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </GlassCard>
                    ) : (
                        <GlassCard sx={{ p: 8, textAlign: 'center' }}>
                            <AssignmentIcon sx={{ fontSize: 64, color: 'var(--text-muted)', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                No Records Found
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                                Your exam results haven't been published by the faculty yet.
                            </Typography>
                        </GlassCard>
                    )}
                </Stack>
            )}
        </Container>
    );
};

export default StudentSubjects;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  backdrop-filter: blur(24px);
  border-radius: 32px !important;
  border: 1px solid var(--border) !important;
  box-shadow: var(--shadow-xl) !important;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
`;

const SectionHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatusBadge = styled('span')`
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &.pass {
    background: rgba(75, 181, 67, 0.1);
    color: #4BB543;
    border: 1px solid rgba(75, 181, 67, 0.2);
  }
  
  &.fail {
    background: rgba(255, 75, 43, 0.1);
    color: #ff4b2b;
    border: 1px solid rgba(255, 75, 43, 0.2);
  }
`;

const NavigationWrapper = styled(Paper)`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 320px;
  background: rgba(26, 24, 31, 0.8) !important;
  backdrop-filter: blur(16px);
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
  z-index: 1000;
`;

const StyledNavItem = styled(BottomNavigationAction)`
  color: var(--text-muted) !important;
  &.Mui-selected {
    color: var(--primary) !important;
    font-weight: 800;
  }
  .MuiBottomNavigationAction-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    margin-top: 4px;
  }
`;