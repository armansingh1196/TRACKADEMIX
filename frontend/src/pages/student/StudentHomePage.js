import React, { useEffect, useState } from 'react'
import { Container, Grid, Box, Typography, LinearProgress, Chip } from '@mui/material'
import { api } from '../../api/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import SeeNotice from '../../components/SeeNotice';
import AttendanceHeatmap from '../../components/AttendanceHeatmap';
import styled, { keyframes } from 'styled-components';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userDetails, currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [aiInsight, setAiInsight] = useState(null);
    const classID = currentUser?.sclassName?.id || currentUser?.sclassName?._id;

    useEffect(() => {
        if (currentUser?._id && classID) {
            dispatch(getUserDetails(currentUser._id, "Student"));
            dispatch(getSubjectList(classID, "ClassSubjects"));

            const fetchAI = async () => {
                if (currentUser._id.startsWith("mock_")) {
                    setAiInsight({
                        features: { attendance_rate: calculateOverallAttendancePercentage(currentUser.attendance || []) },
                        examResults: currentUser.examResult || [],
                    });
                    return;
                }
                try {
                    const response = await api.get(`/Student/AIRecommendations/${currentUser._id}`);
                    setAiInsight(response.data);
                } catch (err) { console.error("Error fetching AI insights:", err); }
            };
            fetchAI();
        }
    }, [dispatch, currentUser?._id, classID]);

    useEffect(() => {
        if (userDetails) setSubjectAttendance(userDetails.attendance || []);
    }, [userDetails]);

    // --- Derived metrics ---
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);

    const theoryRadarData = aiInsight?.examResults?.filter(e => e.subjects?.subject_type === 'Theory' || !e.subjects?.subject_type).slice(0, 6).map(exam => {
        let s = exam.subjects?.sub_name || "Unknown";
        if (s.includes("Software Engineering")) s = "SE";
        if (s.includes("Operating Systems")) s = "OS";
        if (s.includes("Database Systems")) s = "DB";
        if (s.includes("Data Structures")) s = "DSA";
        if (s.includes("Algorithms")) s = "Algo";
        if (s.length > 9) s = s.split(' ').map(w => w[0]).join('').toUpperCase();
        return { subject: s, marks: exam.marks_obtained || 0, fullMark: 100 };
    }) || [];

    // --- AI Band ---
    let band = "Medium";
    if (aiInsight?.examResults) {
        let failed = 0; let total = 0;
        let maxSem = 1;
        aiInsight.examResults.forEach(e => {
            const s = parseInt(e.subjects?.semester || 1);
            if (s > maxSem) maxSem = s;
        });
        const active = aiInsight.examResults.filter(e => parseInt(e.subjects?.semester || 1) === maxSem);
        active.forEach(exam => {
            total++;
            const t = (exam.internal_marks || 0) + (exam.external_marks || 0);
            if ((t / (exam.subjects?.subject_type === 'Practical' ? 50 : 100)) * 100 < 40) failed++;
        });
        const att = aiInsight.features?.attendance_rate || 100;
        if (total > 0 && failed === 0 && att >= 75) band = "High";
        else if (failed > 1 || att < 60) band = "Low";
    }

    const bandConfig = {
        High:   { color: '#34D399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.2)',  icon: <TrendingUpIcon />,   label: 'On Track',    text: 'Excellent standing' },
        Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)', icon: <RemoveIcon />,      label: 'Needs Effort', text: 'Some areas need attention' },
        Low:    { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)',icon: <TrendingDownIcon />, label: 'At Risk',      text: 'Immediate action required' },
    };
    const bc = bandConfig[band];

    const quickLinks = [
        { icon: <BookOutlinedIcon />, label: 'Transcripts', sub: 'View academic records', path: '/Student/subjects', color: '#A78BFA' },
        { icon: <FolderOutlinedIcon />, label: 'Documents', sub: 'Access course files', path: '/Student/documents', color: '#60A5FA' },
        { icon: <LockOutlinedIcon />, label: 'My Marksheets', sub: 'Private result sheets', path: '/Student/documents', color: '#34D399' },
        { icon: <AutoAwesomeIcon />, label: 'AI Insights', sub: 'Performance analysis', path: '/Student/ai-insights', color: '#FBBF24' },
    ];

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>

            {/* ── Hero greeting row ── */}
            <HeroRow>
                <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                        {getGreeting()}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#F5F5FF', letterSpacing: '-0.035em', lineHeight: 1.1, mt: 0.5 }}>
                        {currentUser.name.split(' ')[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.45)', mt: 1 }}>
                        {currentUser?.sclassName?.sclassName} &middot; Batch {currentUser?.sclassName?.batch || 'N/A'} &middot; Sem {currentUser?.sclassName?.semester || 1}
                    </Typography>
                </Box>
                {/* Attendance pill */}
                <AttPill pct={overallAttendancePercentage}>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {Math.round(overallAttendancePercentage)}%
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7 }}>
                        Attendance
                    </Typography>
                </AttPill>
            </HeroRow>

            <Grid container spacing={2.5} sx={{ mt: 0 }}>

                {/* ── LEFT column ── */}
                <Grid item xs={12} md={8}>

                    {/* Quick Access */}
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <SectionLabel>Quick Access</SectionLabel>
                        <Grid container spacing={1.5} sx={{ mt: 1 }}>
                            {quickLinks.map((q, i) => (
                                <Grid item xs={6} sm={3} key={i}>
                                    <QuickLink onClick={() => navigate(q.path)} color={q.color}>
                                        <QuickIcon color={q.color}>{q.icon}</QuickIcon>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F5F5FF', mt: 1, fontSize: '0.8rem' }}>
                                            {q.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.68rem', lineHeight: 1.3 }}>
                                            {q.sub}
                                        </Typography>
                                        <ChevronRightIcon sx={{ fontSize: 14, color: q.color, mt: 0.5, opacity: 0.6 }} />
                                    </QuickLink>
                                </Grid>
                            ))}
                        </Grid>
                    </GlassCard>

                    {/* Attendance Heatmap */}
                    <GlassCard sx={{ mb: 2.5 }}>
                        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                            <SectionLabel>Attendance Activity</SectionLabel>
                        </Box>
                        <AttendanceHeatmap studentID={currentUser._id} />
                    </GlassCard>

                    {/* Attendance bar breakdown */}
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <SectionLabel>Attendance Breakdown</SectionLabel>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 600 }}>Present</Typography>
                                    <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700 }}>{Math.round(overallAttendancePercentage)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={overallAttendancePercentage}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #34D399, #10B981)', borderRadius: 3 } }} />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 600 }}>Absent</Typography>
                                    <Typography variant="caption" sx={{ color: '#F87171', fontWeight: 700 }}>{Math.round(100 - overallAttendancePercentage)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={100 - overallAttendancePercentage}
                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #F87171, #EF4444)', borderRadius: 3 } }} />
                            </Box>
                            <Box sx={{ mt: 0.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.35)', fontWeight: 600 }}>Minimum Required</Typography>
                                <Typography variant="caption" sx={{ color: overallAttendancePercentage >= 75 ? '#34D399' : '#F87171', fontWeight: 800 }}>
                                    {overallAttendancePercentage >= 75 ? '✓ Eligible (≥75%)' : '⚠ Below 75% Threshold'}
                                </Typography>
                            </Box>
                        </Box>
                    </GlassCard>

                    {/* Notices */}
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CampaignOutlinedIcon sx={{ color: '#A78BFA', fontSize: 18 }} />
                            <SectionLabel>Notices & Announcements</SectionLabel>
                        </Box>
                        <SeeNotice />
                    </GlassCard>
                </Grid>

                {/* ── RIGHT column ── */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* AI Status Card */}
                        <GlassCard
                            onClick={() => navigate('/Student/ai-insights')}
                            sx={{ p: 3, cursor: 'pointer', borderColor: `${bc.border} !important`, background: `${bc.bg} !important`, '&:hover': { borderColor: `${bc.color}55 !important`, transform: 'translateY(-3px)' }, transition: 'all 0.2s ease' }}
                        >
                            <SectionLabel>AI Performance</SectionLabel>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: `${bc.color}18`, border: `1px solid ${bc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: bc.color, flexShrink: 0 }}>
                                    {bc.icon}
                                </Box>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: bc.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                        {bc.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 500 }}>
                                        {bc.text}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3, mt: 2.5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#F5F5FF' }}>{Math.round(aiInsight?.features?.attendance_rate || 0)}%</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theory Avg</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#F5F5FF' }}>{Math.round((aiInsight?.features?.external_avg_theory / 70) * 100 || 0)}%</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#F5F5FF' }}>{subjectsList?.length || 0}</Typography>
                                </Box>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: bc.color, fontWeight: 700, opacity: 0.8 }}>
                                View full analysis →
                            </Typography>
                        </GlassCard>

                        {/* Theory Radar */}
                        <GlassCard sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SchoolOutlinedIcon sx={{ color: '#A78BFA', fontSize: 16 }} />
                                <SectionLabel>Theory Performance</SectionLabel>
                            </Box>
                            {theoryRadarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={theoryRadarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(226,232,255,0.5)', fontSize: 10, fontFamily: 'Inter' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Marks" dataKey="marks" stroke="var(--primary)" strokeWidth={1.5} fill="var(--primary)" fillOpacity={0.25} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(226,232,255,0.3)' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>No data available</Typography>
                                </Box>
                            )}
                        </GlassCard>

                        {/* Stats tiles */}
                        <Grid container spacing={1.5}>
                            {[
                                { label: 'Current Semester', value: currentUser?.sclassName?.semester || 1, color: '#A78BFA' },
                                { label: 'Total Subjects', value: subjectsList?.length || 0, color: '#60A5FA' },
                            ].map((s, i) => (
                                <Grid item xs={6} key={i}>
                                    <StatTile color={s.color}>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 600, fontSize: '0.68rem', mt: 0.5 }}>{s.label}</Typography>
                                    </StatTile>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentHomePage;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.025) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05);
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const HeroRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 28px 0 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const AttPill = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 28px;
  border-radius: 18px;
  background: ${p => p.pct >= 75 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)'};
  border: 1px solid ${p => p.pct >= 75 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'};
  color: ${p => p.pct >= 75 ? '#34D399' : '#F87171'};
  box-shadow: 0 4px 20px ${p => p.pct >= 75 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)'};
`;

const SectionLabel = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-size: 0.65rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase;
  color: rgba(226, 232, 255, 0.35);
`;

const QuickLink = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 110px;

  &:hover {
    background: ${p => p.color}0f;
    border-color: ${p => p.color}30;
    transform: translateY(-2px);
  }
`;

const QuickIcon = styled(Box)`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${p => p.color}14;
  border: 1px solid ${p => p.color}22;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.color};

  svg { font-size: 18px; }
`;

const StatTile = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid ${p => p.color}18;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  gap: 6px;
`;