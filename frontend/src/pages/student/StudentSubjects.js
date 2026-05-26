import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { 
    Container, Box, Typography, CircularProgress, Grid, Paper, Stack,
    Table, TableHead, TableBody, TableContainer, TableCell, TableRow
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
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');
    const [selectedSemester, setSelectedSemester] = useState(null);

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

    const currentSemesterString = currentUser?.sclassName?.semester || "1";
    const currentSemesterNum = parseInt(currentSemesterString) || 1;
    const currentBatch = currentUser?.sclassName?.batch || "N/A";

    /* Strip cosmetic suffixes like "(Sem 6)" / "(2022)" that bloat
       names and duplicate the semester chip context. */
    const cleanSubName = (raw) => (raw || 'Subject').replace(/\s*\((?:Sem\s*\d+|\d{4})\)\s*$/i, '').trim();

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

    const populatedSemesters = Object.keys(groupedMarks).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const latestPopulatedSem = populatedSemesters.length ? populatedSemesters[populatedSemesters.length - 1] : currentSemesterNum;

    // Auto-select the most recent semester that has data (so the user
    // lands on a populated view instead of an empty "Sem 7" state).
    // Drive this from userDetails directly so we don't race the
    // subjectMarks setter (which runs in a separate effect tick and
    // would let "fallback to current sem" win on the first paint).
    useEffect(() => {
        if (selectedSemester) return;
        if (!userDetails || Array.isArray(userDetails)) return;     // not loaded yet
        const exams = userDetails.examResult || [];
        if (exams.length === 0) {
            setSelectedSemester(currentSemesterNum.toString());
            return;
        }
        const sems = [...new Set(exams.map(e => parseInt(e.subjects?.semester || 0)).filter(n => n > 0))].sort((a, b) => a - b);
        setSelectedSemester(String(sems[sems.length - 1] || currentSemesterNum));
    }, [userDetails, selectedSemester, currentSemesterNum]);

    const allSemesters = Array.from({ length: currentSemesterNum }, (_, i) => (i + 1).toString());

    const handleSectionChange = (newSection) => {
        setSelectedSection(newSection);
    };

    const renderTableSection = () => {
        if (!selectedSemester) return null;
        if (!groupedMarks[selectedSemester] || groupedMarks[selectedSemester].length === 0) {
            return (
                <GlassCard sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 56, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                        Records pending publication
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: latestPopulatedSem !== parseInt(selectedSemester) ? 3 : 0 }}>
                        Exam results for Semester {selectedSemester} have not been released yet.
                    </Typography>
                    {latestPopulatedSem !== parseInt(selectedSemester) && populatedSemesters.length > 0 && (
                        <Typography
                            onClick={() => setSelectedSemester(String(latestPopulatedSem))}
                            sx={{
                                display: 'inline-block', cursor: 'pointer',
                                color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem',
                                px: 2, py: 1, borderRadius: '10px',
                                border: '1px solid rgba(124,77,255,0.25)',
                                background: 'rgba(124,77,255,0.06)',
                                '&:hover': { background: 'rgba(124,77,255,0.12)' },
                            }}
                        >
                            View Semester {latestPopulatedSem} results →
                        </Typography>
                    )}
                </GlassCard>
            );
        }

        const semesterMarks = groupedMarks[selectedSemester];
        const theoryMarks = semesterMarks.filter(r => r.subjects?.subject_type === 'Theory' || !r.subjects?.subject_type);
        const practicalMarks = semesterMarks.filter(r => r.subjects?.subject_type === 'Practical');

        const calculatePercentage = (marks, total) => {
            return Math.round((marks / total) * 100);
        };

        const renderMarksTable = (marksArray, isPractical) => {
            if (marksArray.length === 0) return null;
            
            const maxInternal = isPractical ? 20 : 30;
            const maxExternal = isPractical ? 30 : 70;
            const passInternal = isPractical ? 8 : 12;
            const passExternal = isPractical ? 12 : 28;
            const maxTotal = isPractical ? 50 : 100;

            return (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <TypeDot color={isPractical ? '#60A5FA' : '#A78BFA'} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {isPractical ? 'Practical / Lab Assessment' : 'Theory Assessment'}
                        </Typography>
                    </Box>
                    <SleekTableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <HeaderCell>Subject Name</HeaderCell>
                                    <HeaderCell align="center">Internal ({maxInternal})</HeaderCell>
                                    <HeaderCell align="center">External ({maxExternal})</HeaderCell>
                                    <HeaderCell align="center">Total ({maxTotal})</HeaderCell>
                                    <HeaderCell align="center">Score %</HeaderCell>
                                    <HeaderCell align="right">Status</HeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {marksArray.map((result, index) => {
                                    const internal = result.internal_marks || 0;
                                    const external = result.external_marks || 0;
                                    const totalMarks = result.marks_obtained || 0;
                                    
                                    const isIntPass = internal >= passInternal;
                                    const isExtPass = external >= passExternal;
                                    const isPassing = totalMarks >= (maxTotal * 0.4) && isIntPass && isExtPass;
                                    const percentage = calculatePercentage(totalMarks, maxTotal);

                                    return (
                                        <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <DataCell sx={{ fontWeight: 600, color: '#F5F5FF' }}>
                                                {cleanSubName(result.subjects.sub_name)}
                                            </DataCell>
                                            <DataCell align="center" sx={{ color: isIntPass ? 'rgba(255,255,255,0.8)' : '#F87171' }}>
                                                {internal} {isIntPass ? '' : <FailTag>(F)</FailTag>}
                                            </DataCell>
                                            <DataCell align="center" sx={{ color: isExtPass ? 'rgba(255,255,255,0.8)' : '#F87171' }}>
                                                {external} {isExtPass ? '' : <FailTag>(F)</FailTag>}
                                            </DataCell>
                                            <DataCell align="center" sx={{ fontWeight: 800, color: isPassing ? 'var(--primary)' : '#F87171', fontSize: '0.95rem' }}>
                                                {totalMarks}
                                            </DataCell>
                                            <DataCell align="center" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                                                {percentage}%
                                            </DataCell>
                                            <DataCell align="right">
                                                <MiniStatus className={isPassing ? 'pass' : 'fail'}>
                                                    {isPassing ? 'Qualified' : 'Requires Impr.'}
                                                </MiniStatus>
                                            </DataCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </SleekTableContainer>
                </Box>
            );
        };

        /* Semester summary tiles — derived from the same dataset */
        const totalSubjects = semesterMarks.length;
        let totalObtained = 0; let totalMax = 0; let qualified = 0; let top = null;
        semesterMarks.forEach(r => {
            const isPractical = r.subjects?.subject_type === 'Practical';
            const max = isPractical ? 50 : 100;
            const got = r.marks_obtained || 0;
            const passInt = isPractical ? 8 : 12;
            const passExt = isPractical ? 12 : 28;
            totalObtained += got;
            totalMax += max;
            const isPass = got >= max * 0.4 && (r.internal_marks || 0) >= passInt && (r.external_marks || 0) >= passExt;
            if (isPass) qualified++;
            const pct = (got / max) * 100;
            if (!top || pct > top.pct) top = { name: cleanSubName(r.subjects?.sub_name), pct, score: got, max };
        });
        const semesterPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
        const passRate = totalSubjects > 0 ? Math.round((qualified / totalSubjects) * 100) : 0;

        return (
            <>
                <GlassCard sx={{ p: { xs: 3, md: 5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <IconBadge>
                                <SchoolOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 24 }} />
                            </IconBadge>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    Semester {selectedSemester} Transcript
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)' }}>
                                    Detailed view of internal and external assessments
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {renderMarksTable(theoryMarks, false)}
                    {renderMarksTable(practicalMarks, true)}
                </GlassCard>

                {/* Semester at-a-glance */}
                <GlassCard sx={{ p: { xs: 3, md: 4 }, mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                        <Typography sx={{ fontFamily: 'var(--font-heading)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(226,232,255,0.45)' }}>
                            Semester {selectedSemester} · At a glance
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <SummaryTile>
                                <span className="lab">Overall</span>
                                <span className="val" style={{ color: semesterPct >= 60 ? '#34D399' : semesterPct >= 40 ? '#FBBF24' : '#F87171' }}>{semesterPct}%</span>
                                <span className="sub">aggregate marks</span>
                            </SummaryTile>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <SummaryTile>
                                <span className="lab">Pass Rate</span>
                                <span className="val" style={{ color: passRate === 100 ? '#34D399' : passRate >= 70 ? '#FBBF24' : '#F87171' }}>{passRate}%</span>
                                <span className="sub">{qualified} of {totalSubjects} qualified</span>
                            </SummaryTile>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <SummaryTile>
                                <span className="lab">Subjects</span>
                                <span className="val" style={{ color: '#A78BFA' }}>{totalSubjects}</span>
                                <span className="sub">{theoryMarks.length} theory · {practicalMarks.length} practical</span>
                            </SummaryTile>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <SummaryTile>
                                <span className="lab">Top Subject</span>
                                <span className="val topName" style={{ color: '#60A5FA' }}>{top?.name || '—'}</span>
                                <span className="sub">{top ? `${top.score}/${top.max} · ${Math.round(top.pct)}%` : 'no data'}</span>
                            </SummaryTile>
                        </Grid>
                    </Grid>
                </GlassCard>
            </>
        );
    };

    const renderChartSection = () => {
        const chartData = subjectMarks.map(result => ({
            subName: { subName: cleanSubName(result.subjects?.sub_name) },
            marksObtained: result.marks_obtained || 0
        }));

        return (
            <GlassCard sx={{ p: { xs: 3, md: 5 }, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <IconBadge style={{ background: 'rgba(167, 139, 250, 0.1)', borderColor: 'rgba(167, 139, 250, 0.2)' }}>
                        <InsertChartIcon sx={{ color: '#A78BFA', fontSize: 24 }} />
                    </IconBadge>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            Cumulative Performance
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)' }}>
                            Historical marks distribution across all semesters
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    <CustomBarChart chartData={chartData} dataKey="marksObtained" />
                </Box>
            </GlassCard>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 12 }}>
            <AppHeader 
                title="Academic Records" 
                subtitle={`Current Semester: ${currentSemesterString} | Batch: ${currentBatch}`} 
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Stack spacing={4} sx={{ mt: 2 }}>
                    {subjectMarks.length > 0 ? (
                        <>
                            {/* Semester Selector & View Toggle Row */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                {selectedSection === 'table' ? (
                                    <Box sx={{ 
                                        display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, flexGrow: 1,
                                        '&::-webkit-scrollbar': { height: '4px' },
                                        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }
                                    }}>
                                        {allSemesters.map(sem => (
                                            <SemesterChip
                                                key={sem}
                                                $active={selectedSemester === sem}
                                                onClick={() => setSelectedSemester(sem)}
                                            >
                                                Semester {sem}
                                            </SemesterChip>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ flexGrow: 1 }} />
                                )}

                                <ViewToggle>
                                        <ToggleButton
                                            $active={selectedSection === 'table'}
                                            onClick={() => handleSectionChange('table')}
                                        >
                                            <TableChartIcon sx={{ fontSize: 16 }} />
                                            Transcripts
                                        </ToggleButton>
                                        <ToggleButton
                                            $active={selectedSection === 'chart'}
                                            onClick={() => handleSectionChange('chart')}
                                        >
                                            <InsertChartIcon sx={{ fontSize: 16 }} />
                                            Analytics
                                        </ToggleButton>
                                    </ViewToggle>
                            </Box>

                            {selectedSection === 'table' ? renderTableSection() : renderChartSection()}
                        </>
                    ) : subjectsList && subjectsList.length > 0 ? (
                        <GlassCard sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 3, fontFamily: 'Plus Jakarta Sans' }}>
                                Currently Enrolled Subjects
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
                            <AssignmentIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 3 }} />
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                No Records Available
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                Your academic records have not been uploaded to the portal yet.
                            </Typography>
                        </GlassCard>
                    )}
                </Stack>
            )}
        </Container>
    );
};

export default StudentSubjects;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Paper)`
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 24px !important;
  border: 1px solid rgba(124, 77, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const IconBadge = styled(Box)`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SemesterChip = styled.button`
  background: ${p => p.$active ? 'rgba(124, 77, 255, 0.15)' : 'transparent'};
  color: ${p => p.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.4)'};
  border: 1px solid ${p => p.$active ? 'rgba(124, 77, 255, 0.4)' : 'rgba(255, 255, 255, 0.07)'};
  border-radius: 8px;
  padding: 5px 13px;
  font-family: 'Inter', sans-serif;
  font-weight: ${p => p.$active ? 700 : 500};
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
  letter-spacing: 0.02em;
  box-shadow: ${p => p.$active ? '0 0 10px rgba(124, 77, 255, 0.2)' : 'none'};

  &:hover {
    background: rgba(124, 77, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(124, 77, 255, 0.25);
  }
`;

const SummaryTile = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(124, 77, 255, 0.08);
  border-radius: 14px;
  height: 100%;

  .lab {
    font-family: var(--font-heading);
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(226, 232, 255, 0.4);
  }
  .val {
    font-family: var(--font-display);
    font-size: 1.55rem;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .val.topName {
    font-size: 1rem;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: -0.02em;
  }
  .sub {
    font-family: var(--font-body);
    font-size: 0.7rem;
    color: rgba(226, 232, 255, 0.42);
    letter-spacing: -0.01em;
  }
`;

const SleekTableContainer = styled(TableContainer)`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
`;

const HeaderCell = styled(TableCell)`
  && {
    background: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 0.4);
    font-family: 'Inter', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 12px 16px;
  }
`;

const DataCell = styled(TableCell)`
  && {
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    padding: 14px 16px;
    transition: background 0.2s ease;
  }
`;

const FailTag = styled.span`
  color: #F87171;
  font-size: 0.7rem;
  font-weight: 800;
  margin-left: 4px;
`;

const TypeDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => p.color};
  box-shadow: 0 0 8px ${p => p.color};
`;

const MiniStatus = styled.div`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &.pass {
    background: rgba(52, 211, 153, 0.1);
    color: #34D399;
    border: 1px solid rgba(52, 211, 153, 0.2);
  }
  
  &.fail {
    background: rgba(248, 113, 113, 0.1);
    color: #F87171;
    border: 1px solid rgba(248, 113, 113, 0.2);
  }
`;

const ViewToggle = styled(Box)`
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${p => p.$active ? 'var(--primary)' : 'transparent'};
  color: ${p => p.$active ? '#FFF' : 'rgba(255, 255, 255, 0.5)'};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${p => p.$active ? '0 4px 12px rgba(124, 77, 255, 0.3)' : 'none'};

  &:hover {
    color: #FFF;
    background: ${p => p.$active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;