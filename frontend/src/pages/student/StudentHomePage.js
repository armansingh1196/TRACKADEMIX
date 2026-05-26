import React, { useEffect, useState } from 'react'
import { Container, Grid, Box, Typography, LinearProgress } from '@mui/material'
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

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
            const isMock = currentUser._id.startsWith("mock_");

            if (!isMock) {
                dispatch(getUserDetails(currentUser._id, "Student"));
                dispatch(getSubjectList(classID, "ClassSubjects"));
            }

            const fetchAI = async () => {
                if (isMock) {
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
        // Real users get attendance from the backend (getStudentDetail).
        // Mock users carry attendance on currentUser itself.
        if (currentUser?._id?.startsWith("mock_")) {
            setSubjectAttendance(currentUser.attendance || []);
        } else if (userDetails && !Array.isArray(userDetails)) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails, currentUser]);

    /* ── Derived metrics ── */
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const attendanceOK = overallAttendancePercentage >= 75;

    const theoryRadarData = aiInsight?.examResults
        ?.filter(e => e.subjects?.subject_type === 'Theory' || !e.subjects?.subject_type)
        .slice(0, 6)
        .map(exam => {
            let s = exam.subjects?.sub_name || "Unknown";
            if (s.includes("Software Engineering")) s = "SE";
            if (s.includes("Operating Systems")) s = "OS";
            if (s.includes("Database Systems")) s = "DB";
            if (s.includes("Data Structures")) s = "DSA";
            if (s.includes("Algorithms")) s = "Algo";
            if (s.length > 9) s = s.split(' ').map(w => w[0]).join('').toUpperCase();
            return { subject: s, marks: exam.marks_obtained || 0, fullMark: 100 };
        }) || [];

    const theoryAvg = Math.round((aiInsight?.features?.external_avg_theory / 70) * 100 || 0);

    /* ── AI Performance band ── */
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
        High:   { color: '#34D399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.22)', icon: <TrendingUpIcon />,   label: 'On Track',     text: 'Excellent standing' },
        Medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.22)', icon: <RemoveIcon />,       label: 'Steady',       text: 'Some areas need attention' },
        Low:    { color: '#F87171', bg: 'rgba(248,113,113,0.08)',  border: 'rgba(248,113,113,0.22)',icon: <TrendingDownIcon />, label: 'At Risk',      text: 'Immediate action required' },
    };
    const bc = bandConfig[band];

    /* ── Quick Access ── */
    const quickLinks = [
        { icon: <BookOutlinedIcon />,        label: 'Transcripts',    sub: 'Academic records',     path: '/Student/subjects',    color: '#A78BFA' },
        { icon: <FolderOutlinedIcon />,      label: 'Documents',      sub: 'Course files',         path: '/Student/documents',   color: '#60A5FA' },
        { icon: <LockOutlinedIcon />,        label: 'My Marksheets',  sub: 'Private result sheets',path: '/Student/documents',   color: '#34D399' },
        { icon: <AutoAwesomeIcon />,         label: 'AI Insights',    sub: 'Performance analysis', path: '/Student/ai-insights', color: '#FBBF24' },
    ];

    /* ── Header utilities ── */
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();
    const todayStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });
    const firstName = currentUser?.name?.split(' ')[0] || 'Student';

    /* ── Unified metric strip ── */
    const metrics = [
        { label: 'Attendance', value: `${Math.round(overallAttendancePercentage)}%`, sub: attendanceOK ? 'Eligible' : 'Below 75%', color: attendanceOK ? '#34D399' : '#F87171' },
        { label: 'Theory Avg', value: `${theoryAvg}%`, sub: theoryAvg >= 60 ? 'On pace' : 'Push harder', color: '#A78BFA' },
        { label: 'Subjects',   value: subjectsList?.length || 0, sub: 'This semester', color: '#60A5FA' },
        { label: 'Semester',   value: currentUser?.sclassName?.semester || 1, sub: currentUser?.sclassName?.sclassName || '—', color: '#2DD4BF' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 6, position: 'relative', zIndex: 1 }}>

            {/* ─────────────────────────────────────────
                  HERO  —  editorial greeting + dial
              ───────────────────────────────────────── */}
            <Hero>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Eyebrow>
                        <EventOutlinedIcon sx={{ fontSize: 12 }} />
                        {greeting} · {todayStr}
                    </Eyebrow>
                    <HeroTitle>
                        {firstName}
                        <span className="dot">.</span>
                    </HeroTitle>
                    <HeroSubtitle>
                        {currentUser?.sclassName?.sclassName || '—'}
                        <Dot />
                        Batch {currentUser?.sclassName?.batch || 'N/A'}
                        <Dot />
                        Semester {currentUser?.sclassName?.semester || 1}
                    </HeroSubtitle>
                </Box>

                <AttendanceDial $ok={attendanceOK}>
                    <svg viewBox="0 0 120 120" className="ring">
                        <circle cx="60" cy="60" r="52" className="track" />
                        <circle
                            cx="60" cy="60" r="52"
                            className="bar"
                            style={{
                                strokeDasharray: 2 * Math.PI * 52,
                                strokeDashoffset: (2 * Math.PI * 52) * (1 - Math.min(overallAttendancePercentage, 100) / 100),
                            }}
                        />
                    </svg>
                    <div className="inner">
                        <div className="pct">{Math.round(overallAttendancePercentage)}<span>%</span></div>
                        <div className="lab">Attendance</div>
                    </div>
                </AttendanceDial>
            </Hero>

            {/* ─────────────────────────────────────────
                  METRIC STRIP  —  4 cohesive figures
              ───────────────────────────────────────── */}
            <MetricStrip>
                {metrics.map((m, i) => (
                    <MetricCell key={m.label} style={{ animationDelay: `${0.08 + i * 0.06}s` }}>
                        <span className="eyebrow">{m.label}</span>
                        <span className="value" style={{ color: m.color }}>{m.value}</span>
                        <span className="sub">{m.sub}</span>
                    </MetricCell>
                ))}
            </MetricStrip>

            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>

                {/* ─── LEFT column ─── */}
                <Grid item xs={12} md={7}>

                    {/* Quick Access */}
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <SectionHead>
                            <SectionLabel>Quick Access</SectionLabel>
                            <SectionHint>Jump to a workspace</SectionHint>
                        </SectionHead>
                        <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                            {quickLinks.map((q, i) => (
                                <Grid item xs={6} sm={6} key={q.label}>
                                    <QuickLink onClick={() => navigate(q.path)} $color={q.color} style={{ animationDelay: `${i * 0.05}s` }}>
                                        <QuickIcon $color={q.color}>{q.icon}</QuickIcon>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#F5F5FF', fontSize: '0.875rem', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                                                {q.label}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(226,232,255,0.42)', fontSize: '0.75rem', mt: '2px', lineHeight: 1.3 }}>
                                                {q.sub}
                                            </Typography>
                                        </Box>
                                        <ChevronRightIcon className="chev" sx={{ fontSize: 16, color: q.color, opacity: 0.5 }} />
                                    </QuickLink>
                                </Grid>
                            ))}
                        </Grid>
                    </GlassCard>

                    {/* Attendance hub: heatmap + breakdown */}
                    <GlassCard sx={{ mb: 2.5 }}>
                        <Box sx={{ px: 3, pt: 3 }}>
                            <SectionHead>
                                <SectionLabel>Attendance Activity</SectionLabel>
                                <SectionHint>Day-by-day participation</SectionHint>
                            </SectionHead>
                        </Box>
                        <AttendanceHeatmap studentID={currentUser._id} />

                        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                            <Divider />
                            <BreakdownGrid>
                                <BreakdownRow>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '6px' }}>
                                        <span className="lab">Present</span>
                                        <span className="val" style={{ color: '#34D399' }}>{Math.round(overallAttendancePercentage)}%</span>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={overallAttendancePercentage}
                                        sx={{
                                            height: 5, borderRadius: 3,
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#34D399,#10B981)', borderRadius: 3 },
                                        }}
                                    />
                                </BreakdownRow>
                                <BreakdownRow>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '6px' }}>
                                        <span className="lab">Absent</span>
                                        <span className="val" style={{ color: '#F87171' }}>{Math.round(100 - overallAttendancePercentage)}%</span>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={100 - overallAttendancePercentage}
                                        sx={{
                                            height: 5, borderRadius: 3,
                                            bgcolor: 'rgba(255,255,255,0.04)',
                                            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#F87171,#EF4444)', borderRadius: 3 },
                                        }}
                                    />
                                </BreakdownRow>
                            </BreakdownGrid>

                            <ThresholdRow $ok={attendanceOK}>
                                <span className="key">Minimum required</span>
                                <span className="status">
                                    {attendanceOK ? '✓ Eligible (≥ 75%)' : '⚠ Below 75% threshold'}
                                </span>
                            </ThresholdRow>
                        </Box>
                    </GlassCard>
                </Grid>

                {/* ─── RIGHT column ─── */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* AI performance + Theory radar — unified */}
                        <GlassCard
                            onClick={() => navigate('/Student/ai-insights')}
                            sx={{
                                p: 3, cursor: 'pointer',
                                borderColor: `${bc.border} !important`,
                                background: `${bc.bg} !important`,
                                '&:hover': { borderColor: `${bc.color}66 !important`, transform: 'translateY(-3px)' },
                                transition: 'all 0.25s var(--ease-out)',
                            }}
                        >
                            <SectionHead>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <InsightsOutlinedIcon sx={{ fontSize: 13, color: bc.color }} />
                                    <SectionLabel>AI Performance</SectionLabel>
                                </Box>
                                <SectionHint>Tap for full report →</SectionHint>
                            </SectionHead>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                                <BandIcon $color={bc.color}>{bc.icon}</BandIcon>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: bc.color, letterSpacing: '-0.025em', lineHeight: 1, fontSize: '1.5rem' }}>
                                        {bc.label}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(226,232,255,0.5)', fontSize: '0.78rem', mt: '4px' }}>
                                        {bc.text}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mt: 2.5, mb: 2 }} />

                            {/* Theory radar — embedded */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                                <SchoolOutlinedIcon sx={{ fontSize: 13, color: 'rgba(226,232,255,0.45)' }} />
                                <SectionLabel sx={{ color: 'rgba(226,232,255,0.45) !important' }}>Theory Performance</SectionLabel>
                            </Box>
                            {theoryRadarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={210}>
                                    <RadarChart cx="50%" cy="52%" outerRadius="72%" data={theoryRadarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: 'rgba(226,232,255,0.55)', fontSize: 10, fontFamily: 'Inter' }}
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Marks"
                                            dataKey="marks"
                                            stroke={bc.color}
                                            strokeWidth={1.5}
                                            fill={bc.color}
                                            fillOpacity={0.22}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4, color: 'rgba(226,232,255,0.3)' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>No data available</Typography>
                                </Box>
                            )}
                        </GlassCard>

                    </Box>
                </Grid>

                {/* ─── Notices — full width ─── */}
                <Grid item xs={12}>
                    <GlassCard sx={{ p: 3 }}>
                        <SeeNotice />
                    </GlassCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentHomePage;

/* ─────────────────────────────────────────
   Styled — editorial glassmorphic system
   ───────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Hero = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 36px 4px 28px;
  flex-wrap: wrap;
  animation: ${fadeUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 600px) {
    padding: 20px 0 18px;
    gap: 20px;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-heading);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(124, 77, 255, 0.85);
  background: rgba(124, 77, 255, 0.06);
  border: 1px solid rgba(124, 77, 255, 0.18);
  padding: 5px 12px;
  border-radius: 100px;
  margin-bottom: 14px;
`;

const HeroTitle = styled(Typography)`
  font-family: var(--font-display) !important;
  font-size: clamp(2.4rem, 6vw, 3.6rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.045em !important;
  line-height: 1 !important;
  color: #F5F5FF !important;

  .dot {
    color: #7C4DFF;
  }
`;

const HeroSubtitle = styled(Typography)`
  font-family: var(--font-body) !important;
  font-size: 0.9375rem !important;
  color: rgba(226, 232, 255, 0.52) !important;
  letter-spacing: -0.011em !important;
  margin-top: 12px !important;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(226, 232, 255, 0.28);
  margin: 0 10px;
  display: inline-block;
`;

const AttendanceDial = styled(Box)`
  position: relative;
  width: 132px;
  height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .ring {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;

    .track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 6;
    }
    .bar {
      fill: none;
      stroke: ${p => p.$ok ? '#34D399' : '#F87171'};
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
      filter: drop-shadow(0 0 8px ${p => p.$ok ? 'rgba(52,211,153,0.35)' : 'rgba(248,113,113,0.35)'});
    }
  }

  .inner {
    text-align: center;
    z-index: 1;
  }
  .pct {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: ${p => p.$ok ? '#34D399' : '#F87171'};
    letter-spacing: -0.04em;
    line-height: 1;
    font-variant-numeric: tabular-nums;

    span {
      font-size: 1rem;
      opacity: 0.6;
      margin-left: 1px;
    }
  }
  .lab {
    font-family: var(--font-heading);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(226, 232, 255, 0.38);
    margin-top: 4px;
  }
`;

const MetricStrip = styled(Box)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`;

const MetricCell = styled(Box)`
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(124, 77, 255, 0.08);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  animation: ${fadeUp} 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.22s var(--ease-out);

  &:hover {
    border-color: rgba(124, 77, 255, 0.22);
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-2px);
  }

  .eyebrow {
    font-family: var(--font-heading);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(226, 232, 255, 0.4);
  }
  .value {
    font-family: var(--font-display);
    font-size: 1.65rem;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .sub {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: rgba(226, 232, 255, 0.42);
    letter-spacing: -0.01em;
  }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation: ${fadeUp} 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: 0.15s;
`;

const SectionHead = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SectionLabel = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-size: 0.65rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase;
  color: rgba(226, 232, 255, 0.45) !important;
`;

const SectionHint = styled(Typography)`
  font-family: var(--font-body) !important;
  font-size: 0.7rem !important;
  color: rgba(226, 232, 255, 0.32) !important;
  letter-spacing: -0.01em !important;
`;

const QuickLink = styled(Box)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.22s var(--ease-out);
  opacity: 0;
  animation: ${fadeUp} 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  .chev { transition: transform 0.2s var(--ease-out), opacity 0.2s var(--ease-out); }

  &:hover {
    background: ${p => p.$color}10;
    border-color: ${p => p.$color}38;
    transform: translateY(-2px);

    .chev { transform: translateX(3px); opacity: 1 !important; }
  }
`;

const QuickIcon = styled(Box)`
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: ${p => p.$color}14;
  border: 1px solid ${p => p.$color}26;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color};
  flex-shrink: 0;

  svg { font-size: 19px; }
`;

const Divider = styled(Box)`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124, 77, 255, 0.16), transparent);
  margin: 16px 0;
`;

const BreakdownGrid = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const BreakdownRow = styled(Box)`
  .lab {
    font-family: var(--font-heading);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(226, 232, 255, 0.42);
  }
  .val {
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
`;

const ThresholdRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);

  .key {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: rgba(226, 232, 255, 0.35);
    letter-spacing: -0.01em;
  }
  .status {
    font-family: var(--font-heading);
    font-size: 0.72rem;
    font-weight: 800;
    color: ${p => p.$ok ? '#34D399' : '#F87171'};
    letter-spacing: -0.01em;
  }
`;

const BandIcon = styled(Box)`
  width: 54px;
  height: 54px;
  border-radius: 15px;
  background: ${p => p.$color}1A;
  border: 1px solid ${p => p.$color}33;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color};
  flex-shrink: 0;
  box-shadow: 0 4px 18px ${p => p.$color}22;

  svg { font-size: 24px; }
`;
