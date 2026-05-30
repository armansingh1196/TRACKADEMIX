import { Container, Grid, Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeeNotice from '../../components/SeeNotice';
import { getClassStudents, getSubjectDetails } from '../../redux/sclassRelated/sclassHandle';
import styled, { keyframes } from 'styled-components';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const TeacherHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { subjectDetails, sclassStudents } = useSelector((state) => state.sclass);

    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;

    useEffect(() => {
        if (subjectID) dispatch(getSubjectDetails(subjectID, "Subject"));
        if (classID)  dispatch(getClassStudents(classID));
    }, [dispatch, subjectID, classID]);

    /* Clean cosmetic suffixes ("(2022)" / "(Sem N)"). The teacher's
       display name might already be "Prof. Sneha (2022)" — strip the
       year tag and avoid stacking "Prof. Prof." in the greeting. */
    const cleanName = (raw) => (raw || '').replace(/\s*\(\d{4}\)\s*$/i, '').trim();
    const cleanSubject = (raw) => (raw || 'Subject').replace(/\s*\((?:Sem\s*\d+|\d{4})\)\s*$/i, '').trim();

    const displayName = cleanName(currentUser?.name || 'Faculty').replace(/^Prof\.?\s*/i, '');
    const firstName = displayName.split(' ')[0] || 'Faculty';
    const subjectName = cleanSubject(currentUser?.teachSubject?.subName);
    const className = currentUser?.teachSclass?.sclassName || '—';
    const schoolName = currentUser?.school?.schoolName || 'your institution';

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const sessionsPlanned = parseInt(subjectDetails?.sessions || 0) || 0;
    const enrolled = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
    const subjectType = currentUser?.teachSubject?.subjectType || subjectDetails?.subject_type || 'Theory';

    const metrics = [
        { label: 'Enrolled',  value: enrolled,        sub: 'students',                 color: '#A78BFA' },
        { label: 'Sessions',  value: sessionsPlanned, sub: 'planned',                  color: '#60A5FA' },
        { label: 'Subject',   value: subjectType,     sub: subjectName,                color: '#34D399' },
        { label: 'Class',     value: className,       sub: `Sem ${currentUser?.teachSclass?.semester || '—'}`, color: '#2DD4BF' },
    ];

    const actions = [
        { icon: <HowToRegOutlinedIcon />,  label: 'Mark Attendance',  sub: 'Record today\'s session', path: '/Teacher/class', color: '#A78BFA' },
        { icon: <EditNoteOutlinedIcon />,  label: 'Enter Marks',      sub: 'Internal & external',     path: '/Teacher/class', color: '#60A5FA' },
        { icon: <PeopleAltOutlinedIcon />, label: 'Class Roster',     sub: `${enrolled} students`,    path: '/Teacher/class', color: '#34D399' },
        { icon: <TopicOutlinedIcon />,     label: 'Documents',        sub: 'Share course files',      path: '/Teacher/documents', color: '#FBBF24' },
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
                        Prof. {firstName}
                        <span className="dot">.</span>
                    </HeroTitle>
                    <HeroSubtitle>
                        {subjectName}
                        <Dot />
                        {className}
                        <Dot />
                        {schoolName}
                    </HeroSubtitle>
                </Box>
            </Hero>

            {/* ── METRIC STRIP ── */}
            <MetricStrip>
                {metrics.map((m, i) => (
                    <MetricCell key={m.label} style={{ animationDelay: `${0.08 + i * 0.06}s` }}>
                        <span className="eyebrow">{m.label}</span>
                        <span className="value" style={{ color: m.color }} title={String(m.value)}>{m.value}</span>
                        <span className="sub" title={m.sub}>{m.sub}</span>
                    </MetricCell>
                ))}
            </MetricStrip>

            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>

                {/* ── LEFT ── */}
                <Grid item xs={12} md={7}>
                    {/* Quick actions */}
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <SectionHead>
                            <SectionLabel>Quick Actions</SectionLabel>
                            <SectionHint>Jump straight to the work</SectionHint>
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

                    {/* Notices */}
                    <GlassCard sx={{ p: 3 }}>
                        <SeeNotice />
                    </GlassCard>
                </Grid>

                {/* ── RIGHT ── */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                        {/* Course identity */}
                        <GlassCard sx={{ p: 3 }}>
                            <SectionHead>
                                <SectionLabel>Course Identity</SectionLabel>
                                <SectionHint>Current assignment</SectionHint>
                            </SectionHead>

                            <CourseRow>
                                <CourseKey>Subject</CourseKey>
                                <CourseValue>{subjectName}</CourseValue>
                            </CourseRow>
                            <CourseRow>
                                <CourseKey>Type</CourseKey>
                                <CourseValue style={{ color: subjectType === 'Practical' ? '#60A5FA' : '#A78BFA' }}>{subjectType}</CourseValue>
                            </CourseRow>
                            <CourseRow>
                                <CourseKey>Class</CourseKey>
                                <CourseValue>{className}</CourseValue>
                            </CourseRow>
                            <CourseRow>
                                <CourseKey>Semester</CourseKey>
                                <CourseValue>{currentUser?.teachSclass?.semester || '—'}</CourseValue>
                            </CourseRow>
                            <CourseRow>
                                <CourseKey>Batch</CourseKey>
                                <CourseValue>{currentUser?.teachSclass?.batch || '—'}</CourseValue>
                            </CourseRow>
                            <CourseRow $last>
                                <CourseKey>Sessions Planned</CourseKey>
                                <CourseValue style={{ color: '#34D399', fontFamily: 'var(--font-display)' }}>{sessionsPlanned}</CourseValue>
                            </CourseRow>
                        </GlassCard>

                        {/* Verified faculty note */}
                        <GlassCard sx={{ p: 3, background: 'rgba(124, 77, 255, 0.04) !important' }}>
                            <SectionLabel>Faculty Verified</SectionLabel>
                            <Typography sx={{ color: 'rgba(226,232,255,0.72)', fontSize: '0.85rem', mt: 1.5, lineHeight: 1.55, letterSpacing: '-0.01em' }}>
                                Your account is verified as faculty on the <strong style={{ color: '#F5F5FF' }}>{schoolName}</strong> institutional portal.
                            </Typography>
                            <Typography sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.72rem', mt: 1.5 }}>
                                Email: {currentUser?.email || '—'}
                            </Typography>
                        </GlassCard>

                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TeacherHomePage;

/* ─────────────────────────────────────────
   Styled — shares the editorial system used
   by StudentHomePage so the two roles feel
   like the same product.
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
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.15;
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

const CourseRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, ${p => p.$last ? 0 : 0.05});
  gap: 12px;
  min-width: 0;
`;

const CourseKey = styled.span`
  font-family: var(--font-heading);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(226, 232, 255, 0.42);
`;

const CourseValue = styled.span`
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  color: #F5F5FF;
  letter-spacing: -0.015em;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;
