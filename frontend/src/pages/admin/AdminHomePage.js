import { Container, Grid, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeeNotice from '../../components/SeeNotice';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import CustomPieChart from '../../components/CustomPieChart';
import styled, { keyframes } from 'styled-components';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const AdminHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser }  = useSelector((state) => state.user);

    const adminID = currentUser?._id;

    useEffect(() => {
        if (!adminID) return;
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
    }, [adminID, dispatch]);

    /* ── Safely derived stats ── */
    const studentsArr = Array.isArray(studentsList) ? studentsList : [];
    const classesArr  = Array.isArray(sclassesList) ? sclassesList : [];
    const teachersArr = Array.isArray(teachersList) ? teachersList : [];

    const totalStudents = studentsArr.length;
    const totalTeachers = teachersArr.length;
    const totalClasses  = classesArr.length;
    const batches       = [...new Set(classesArr.map(s => s.batch).filter(Boolean))];

    const batchDataRaw = classesArr.reduce((acc, c) => {
        const batch = c.batch || 'Unassigned';
        acc[batch] = (acc[batch] || 0) + 1;
        return acc;
    }, {});
    const chartData = Object.entries(batchDataRaw).map(([name, value]) => ({ name, value }));

    /* Header utilities */
    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const firstName = (currentUser?.name || 'Administrator').split(' ')[0];

    const metrics = [
        { label: 'Students',  value: totalStudents,  sub: 'across the institute', color: '#A78BFA' },
        { label: 'Faculty',   value: totalTeachers,  sub: 'active educators',     color: '#60A5FA' },
        { label: 'Classes',   value: totalClasses,   sub: 'sections registered',  color: '#34D399' },
        { label: 'Batches',   value: batches.length, sub: 'admission years',      color: '#2DD4BF' },
    ];

    const actions = [
        { icon: <PersonAddAltOutlinedIcon />, label: 'Add Student',      sub: 'Enrol a new scholar',     path: '/Admin/addstudents',  color: '#A78BFA' },
        { icon: <GroupAddOutlinedIcon />,    label: 'Add Faculty',       sub: 'Onboard a teacher',       path: '/Admin/teachers',     color: '#60A5FA' },
        { icon: <AddBoxOutlinedIcon />,      label: 'Manage Subjects',   sub: 'Subjects & sessions',     path: '/Admin/subjects',     color: '#34D399' },
        { icon: <CampaignOutlinedIcon />,    label: 'Publish Notice',    sub: 'Announce institute-wide', path: '/Admin/addnotice',    color: '#FBBF24' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 6, position: 'relative', zIndex: 1 }}>

            {/* ── HERO ── */}
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
                        Administrator
                        <Dot />
                        {currentUser?.schoolName || 'Institution'}
                        <Dot />
                        Institutional control panel
                    </HeroSubtitle>
                </Box>
            </Hero>

            {/* ── METRIC STRIP ── */}
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

                {/* ── LEFT: Quick actions + Notices ── */}
                <Grid item xs={12} md={7}>
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <SectionHead>
                            <SectionLabel>Administrative Actions</SectionLabel>
                            <SectionHint>Common operations</SectionHint>
                        </SectionHead>
                        <Grid container spacing={1.5} sx={{ mt: 1.5 }}>
                            {actions.map((a, i) => (
                                <Grid item xs={12} sm={6} key={a.label}>
                                    <ActionLink onClick={() => navigate(a.path)} $color={a.color} style={{ animationDelay: `${i * 0.05}s` }}>
                                        <ActionIcon $color={a.color}>{a.icon}</ActionIcon>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#F5F5FF', fontSize: '0.875rem', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                                                {a.label}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(226,232,255,0.42)', fontSize: '0.75rem', mt: '2px', lineHeight: 1.3 }}>
                                                {a.sub}
                                            </Typography>
                                        </Box>
                                        <ChevronRightIcon className="chev" sx={{ fontSize: 16, color: a.color, opacity: 0.5 }} />
                                    </ActionLink>
                                </Grid>
                            ))}
                        </Grid>
                    </GlassCard>

                    <GlassCard sx={{ p: 3 }}>
                        <SeeNotice />
                    </GlassCard>
                </Grid>

                {/* ── RIGHT: Batch distribution + Census ── */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <GlassCard sx={{ p: 3 }}>
                            <SectionHead>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <SchoolOutlinedIcon sx={{ fontSize: 13, color: '#A78BFA' }} />
                                    <SectionLabel>Batch Distribution</SectionLabel>
                                </Box>
                                <SectionHint>{classesArr.length} class section{classesArr.length === 1 ? '' : 's'}</SectionHint>
                            </SectionHead>
                            <Box sx={{ mt: 1, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {chartData.length > 0 ? (
                                    <CustomPieChart data={chartData} />
                                ) : (
                                    <Typography sx={{ color: 'rgba(226, 232, 255, 0.35)', fontSize: '0.85rem' }}>
                                        No batch data yet
                                    </Typography>
                                )}
                            </Box>
                        </GlassCard>

                        <GlassCard sx={{ p: 3 }}>
                            <SectionHead>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                    <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: '#60A5FA' }} />
                                    <SectionLabel>Institute Census</SectionLabel>
                                </Box>
                                <SectionHint>Live counts</SectionHint>
                            </SectionHead>
                            <CensusRow>
                                <CensusLeft>
                                    <PeopleAltOutlinedIcon sx={{ fontSize: 18, color: '#A78BFA' }} />
                                    <span>Total students</span>
                                </CensusLeft>
                                <CensusValue style={{ color: '#A78BFA' }}>{totalStudents}</CensusValue>
                            </CensusRow>
                            <CensusRow>
                                <CensusLeft>
                                    <AccountBalanceOutlinedIcon sx={{ fontSize: 18, color: '#60A5FA' }} />
                                    <span>Total faculty</span>
                                </CensusLeft>
                                <CensusValue style={{ color: '#60A5FA' }}>{totalTeachers}</CensusValue>
                            </CensusRow>
                            <CensusRow>
                                <CensusLeft>
                                    <SchoolOutlinedIcon sx={{ fontSize: 18, color: '#34D399' }} />
                                    <span>Class sections</span>
                                </CensusLeft>
                                <CensusValue style={{ color: '#34D399' }}>{totalClasses}</CensusValue>
                            </CensusRow>
                            <CensusRow $last>
                                <CensusLeft>
                                    <EventOutlinedIcon sx={{ fontSize: 18, color: '#2DD4BF' }} />
                                    <span>Admission batches</span>
                                </CensusLeft>
                                <CensusValue style={{ color: '#2DD4BF' }}>{batches.length}</CensusValue>
                            </CensusRow>
                        </GlassCard>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;

/* Shared editorial styles (mirrors student/teacher dashboards) */
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
  font-size: clamp(2.2rem, 5.5vw, 3.4rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.045em !important;
  line-height: 1 !important;
  color: #F5F5FF !important;
  word-break: break-word !important;
  .dot { color: #7C4DFF; }
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
`;

const Dot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(226, 232, 255, 0.28);
  margin: 0 10px;
  display: inline-block;
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sub {
    font-family: var(--font-body);
    font-size: 0.72rem;
    color: rgba(226, 232, 255, 0.42);
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
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

const ActionLink = styled(Box)`
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

const ActionIcon = styled(Box)`
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

const CensusRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, ${p => p.$last ? 0 : 0.05});
`;

const CensusLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: rgba(226, 232, 255, 0.78);
  letter-spacing: -0.01em;
`;

const CensusValue = styled.span`
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
`;
