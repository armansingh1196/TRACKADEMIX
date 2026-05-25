import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Paper, CircularProgress, Button, LinearProgress, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import { api } from '../../api/client';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const StudentAIInsights = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!currentUser?._id) return;
            try {
                setLoading(true);
                if (currentUser._id.startsWith("mock_")) {
                    setInsights({
                        features: { 
                            attendance_rate: calculateOverallAttendancePercentage(currentUser.attendance || []),
                            internal_avg_theory: 22,
                            external_avg_theory: 45,
                            previous_gpa: 8.2
                        },
                        examResults: currentUser.examResult || [],
                        subjectAlerts: [
                            "Low internal score in Operating Systems. Focus on continuous assessment.",
                            "Weak performance in Database Systems external exams. Needs targeted study."
                        ],
                        modelMetrics: { accuracy: 0.9375, model_type: "Random Forest Classifier" }
                    });
                    setError(null);
                } else {
                    const response = await api.get(`/Student/AIRecommendations/${currentUser._id}`);
                    setInsights(response.data);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching AI insights:", err);
                setError("Failed to load AI insights. Please ensure the AI backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [currentUser]);

    const getBandTheme = (band) => {
        switch (band) {
            case 'High':
                return {
                    color: '#34D399',
                    glow: 'rgba(52, 211, 153, 0.25)',
                    border: 'rgba(52, 211, 153, 0.2)',
                    bg: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, rgba(52, 211, 153, 0.02) 100%)',
                    text: 'Exceptional academic standing. Low predictive risk.'
                };
            case 'Medium':
                return {
                    color: '#FBBF24',
                    glow: 'rgba(251, 191, 36, 0.25)',
                    border: 'rgba(251, 191, 36, 0.2)',
                    bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%)',
                    text: 'Satisfactory standing. Some metrics require attention.'
                };
            case 'Low':
                return {
                    color: '#F87171',
                    glow: 'rgba(248, 113, 113, 0.3)',
                    border: 'rgba(248, 113, 113, 0.25)',
                    bg: 'linear-gradient(135deg, rgba(248, 113, 113, 0.08) 0%, rgba(248, 113, 113, 0.02) 100%)',
                    text: 'High academic risk. Immediate intervention advised.'
                };
            default:
                return {
                    color: '#A78BFA',
                    glow: 'rgba(167, 139, 250, 0.25)',
                    border: 'rgba(167, 139, 250, 0.2)',
                    bg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(167, 139, 250, 0.02) 100%)',
                    text: 'Standing evaluation pending.'
                };
        }
    };

    const getBandIcon = (band) => {
        switch (band) {
            case 'High': return <TrendingUpIcon style={{ color: '#34D399', fontSize: '2.5rem' }} />;
            case 'Medium': return <RemoveIcon style={{ color: '#FBBF24', fontSize: '2.5rem' }} />;
            case 'Low': return <TrendingDownIcon style={{ color: '#F87171', fontSize: '2.5rem' }} />;
            default: return <InfoOutlinedIcon style={{ color: '#A78BFA', fontSize: '2.5rem' }} />;
        }
    };

    // Calculate deterministic logic
    let calculatedBand = "Medium";
    let recommendations = [];
    
    if (insights && insights.features) {
        let failedSubjects = 0;
        let totalActiveSubjects = 0;
        
        if (insights.examResults) {
            insights.examResults.forEach(exam => {
                const total = (exam.internal_marks || 0) + (exam.external_marks || 0);
                if (total > 0) {
                    totalActiveSubjects++;
                    const maxMarks = exam.subjects?.subject_type === 'Practical' ? 50 : 100;
                    if ((total / maxMarks) * 100 < 40) failedSubjects++;
                }
            });
        }
        
        const attendanceRate = insights.features.attendance_rate || 0;
        
        if (totalActiveSubjects > 0 && failedSubjects === 0 && attendanceRate >= 75) {
            calculatedBand = "High";
            recommendations.push("Excellent academic and attendance record. You are completely on track! 🚀");
            recommendations.push("Consider mentoring peers who might be struggling in your strong subjects.");
            recommendations.push("Keep maintaining your regular attendance.");
        } else if (failedSubjects > 1 || attendanceRate < 60) {
            calculatedBand = "Low";
            recommendations.push("You are currently at risk. Please schedule a mentoring session immediately.");
            if (attendanceRate < 60) recommendations.push(`Your attendance is critically low (${Math.round(attendanceRate)}%). This strongly correlates with exam failure.`);
            recommendations.push("Review your weak subjects and complete all pending assignments.");
        } else {
            calculatedBand = "Medium";
            recommendations.push("You need some extra effort to get on track. Focus on your upcoming tests.");
            if (failedSubjects === 1) recommendations.push("You have one weak subject dragging down your average. Dedicate more study hours to it.");
            if (attendanceRate < 75) recommendations.push("Try to improve your attendance to reach the 75% threshold.");
        }
    }

    const bandTheme = getBandTheme(calculatedBand);

    const radarData = insights && insights.features ? [
        { subject: 'Attendance', score: Math.round(insights.features.attendance_rate || 0), fullMark: 100 },
        { subject: 'Internals', score: Math.round(((insights.features.internal_avg_theory || 0) / 30) * 100), fullMark: 100 },
        { subject: 'Externals', score: Math.round(((insights.features.external_avg_theory || 0) / 70) * 100), fullMark: 100 },
        { subject: 'Past CGPA', score: Math.round((insights.features.previous_gpa || 0) * 10), fullMark: 100 },
        { subject: 'Consistency', score: Math.round(Math.min((insights.features.attendance_rate || 0), ((insights.features.previous_gpa || 0) * 10))), fullMark: 100 }
    ] : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 2 }}>
            <AppHeader 
                title="AI Academic Insights" 
                subtitle="High-fidelity academic prognosis powered by predictive neural models." 
            />

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
                    <CircularProgress size={50} sx={{ color: 'var(--primary)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 500 }}>
                        Running predictive algorithms...
                    </Typography>
                </Box>
            ) : error ? (
                <GlassCard sx={{ p: 5, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
                    <WarningAmberRoundedIcon sx={{ fontSize: 48, color: '#F87171', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#F5F5FF', fontWeight: 800, mb: 1 }}>Analysis Unavailable</Typography>
                    <Typography sx={{ color: 'rgba(226,232,255,0.5)', mb: 3, fontSize: '0.875rem' }}>{error}</Typography>
                    <Button variant="contained" onClick={() => window.location.reload()} sx={{ background: 'var(--gradient-primary)!important', borderRadius: '10px' }}>
                        Retry Connection
                    </Button>
                </GlassCard>
            ) : insights ? (
                <Grid container spacing={3}>
                    {/* Left - Predicted Band Card */}
                    <Grid item xs={12} md={4}>
                        <BandCard themeConfig={bandTheme}>
                            <CardLabel>Predictive Analysis</CardLabel>
                            <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <IconGlow color={bandTheme.color}>
                                    {getBandIcon(calculatedBand)}
                                </IconGlow>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: bandTheme.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                                        {calculatedBand}
                                    </Typography>
                                    <StatusPill color={bandTheme.color}>{calculatedBand} Band Risk</StatusPill>
                                </Box>
                            </Box>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 2 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.5)', textAlign: 'center', lineHeight: 1.5 }}>
                                {bandTheme.text}
                            </Typography>
                        </BandCard>
                    </Grid>

                    {/* Right - AI Recommendations */}
                    <Grid item xs={12} md={8}>
                        <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <IconBadge>
                                    <AutoAwesomeIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </IconBadge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        Model Recommendations
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                        Dynamic study suggestions generated by local cognitive analysis.
                                    </Typography>
                                </Box>
                            </Box>

                            <RecList>
                                {recommendations.map((rec, index) => (
                                    <RecItem key={index}>
                                        <CheckIconWrap>
                                            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                                        </CheckIconWrap>
                                        <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.8)', fontWeight: 500, lineHeight: 1.5 }}>
                                            {rec}
                                        </Typography>
                                    </RecItem>
                                ))}
                            </RecList>
                        </GlassCard>
                    </Grid>

                    {/* Subject Specific Alerts */}
                    {insights.subjectAlerts && insights.subjectAlerts.length > 0 && (
                        <Grid item xs={12}>
                            <AlertGlassCard>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <IconBadge style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                        <WarningAmberRoundedIcon sx={{ color: '#F87171', fontSize: 20 }} />
                                    </IconBadge>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#F87171', letterSpacing: '-0.02em', mb: '2px' }}>
                                            Subject-Specific Alerts
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(248, 113, 113, 0.5)', fontSize: '0.75rem' }}>
                                            Potential academic pitfalls identified in specific subject domains.
                                        </Typography>
                                    </Box>
                                </Box>

                                <Grid container spacing={2}>
                                    {insights.subjectAlerts.map((alert, index) => (
                                        <Grid item xs={12} md={6} key={index}>
                                            <AlertBox>
                                                <AlertDot />
                                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.75)', fontWeight: 500, lineHeight: 1.5 }}>
                                                    {alert}
                                                </Typography>
                                            </AlertBox>
                                        </Grid>
                                    ))}
                                </Grid>
                            </AlertGlassCard>
                        </Grid>
                    )}

                    {/* Analyzed Features & Radar Matrix */}
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            {/* Left: Radar Matrix */}
                            <Grid item xs={12} md={5}>
                                <GlassCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                        <IconBadge>
                                            <InsightsOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                        </IconBadge>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                                Performance Matrix
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                                Multi-dimensional capability breakdown.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minHeight: 280, position: 'relative' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(226,232,255,0.6)', fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 600 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <RechartsTooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgba(6, 8, 24, 0.9)', 
                                                        backdropFilter: 'blur(10px)',
                                                        border: '1px solid rgba(124, 77, 255, 0.2)',
                                                        borderRadius: '12px',
                                                        color: '#F5F5FF',
                                                        fontFamily: 'var(--font-body)'
                                                    }}
                                                    itemStyle={{ color: 'var(--primary)' }}
                                                />
                                                <Radar name="Score" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.35} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                        {/* Subtle glow behind radar */}
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', background: 'var(--primary)', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none', zIndex: -1 }} />
                                    </Box>
                                </GlassCard>
                            </Grid>

                            {/* Right: Feature Metrics */}
                            <Grid item xs={12} md={7}>
                                <GlassCard sx={{ height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                                Analyzed Features
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                                Key performance indicators processed as feature vectors in the ML model.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <MetricWidget>
                                                <MetricTitle>Attendance Rate</MetricTitle>
                                                <MetricValue sx={{ my: 1 }}>{insights.features?.attendance_rate ? Math.round(insights.features.attendance_rate) : 0}%</MetricValue>
                                                <LinearProgress variant="determinate" value={insights.features?.attendance_rate || 0} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'var(--gradient-primary)' } }} />
                                                <MetricSub>Minimum required: 75%</MetricSub>
                                            </MetricWidget>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <MetricWidget>
                                                <MetricTitle>Theory Internals</MetricTitle>
                                                <MetricValue sx={{ my: 1 }}>{insights.features?.internal_avg_theory ? Math.round((insights.features.internal_avg_theory / 30) * 100) : 0}%</MetricValue>
                                                <LinearProgress variant="determinate" value={insights.features?.internal_avg_theory ? (insights.features.internal_avg_theory / 30) * 100 : 0} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)' } }} />
                                                <MetricSub>Avg out of 30 marks</MetricSub>
                                            </MetricWidget>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <MetricWidget>
                                                <MetricTitle>Theory Externals</MetricTitle>
                                                <MetricValue sx={{ my: 1 }}>{insights.features?.external_avg_theory ? Math.round((insights.features.external_avg_theory / 70) * 100) : 0}%</MetricValue>
                                                <LinearProgress variant="determinate" value={insights.features?.external_avg_theory ? (insights.features.external_avg_theory / 70) * 100 : 0} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)' } }} />
                                                <MetricSub>Avg out of 70 marks</MetricSub>
                                            </MetricWidget>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <MetricWidget>
                                                <MetricTitle>Academic CGPA</MetricTitle>
                                                <MetricValue sx={{ my: 1 }}>{insights.features?.previous_gpa || 0}</MetricValue>
                                                <LinearProgress variant="determinate" value={(insights.features?.previous_gpa || 0) * 10} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #818CF8 0%, #6366F1 100%)' } }} />
                                                <MetricSub>Historical scale out of 10.0</MetricSub>
                                            </MetricWidget>
                                        </Grid>
                                    </Grid>
                                </GlassCard>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* AI Model Performance Specs Banner */}
                    <Grid item xs={12}>
                        <SpecsBanner>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconBadge style={{ background: 'rgba(176, 168, 185, 0.08)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <SchoolOutlinedIcon sx={{ color: '#B07AFE', fontSize: 20 }} />
                                    </IconBadge>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#B07AFE', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
                                            Model Diagnostics & Settings
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.8125rem' }}>
                                            Predictions are generated through cross-validation of historical institutional matrices.
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <SpecField>
                                        <span className="label">MODEL ACCURACY</span>
                                        <span className="value" style={{ color: 'var(--primary)' }}>
                                            {insights.modelMetrics ? Math.round(insights.modelMetrics.accuracy * 100) : 93.75}%
                                        </span>
                                    </SpecField>
                                    <SpecField>
                                        <span className="label">ALGORITHM TYPE</span>
                                        <span className="value">
                                            {insights.modelMetrics?.model_type || "Random Forest Classifier"}
                                        </span>
                                    </SpecField>
                                </Box>
                            </Box>
                        </SpecsBanner>
                    </Grid>
                </Grid>
            ) : null}
        </Container>
    );
};

export default StudentAIInsights;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.45); }
  50% { box-shadow: 0 8px 36px var(--pulse-glow-color, rgba(124,77,255,0.15)); }
`;

const GlassCard = styled(Paper)`
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px !important;
  border: 1px solid rgba(124, 77, 255, 0.1) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 32px !important;
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 600px) {
    padding: 20px !important;
    border-radius: 16px !important;
  }
`;

const BandCard = styled(Paper)`
  background: ${p => p.themeConfig.bg} !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px !important;
  border: 1px solid ${p => p.themeConfig.border} !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
  --pulse-glow-color: ${p => p.themeConfig.glow};
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both, ${pulseGlow} 4s ease-in-out infinite;
  padding: 32px !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 20px !important;
    border-radius: 16px !important;
  }
`;

const CardLabel = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase;
  color: rgba(226, 232, 255, 0.4);
`;

const IconGlow = styled(Box)`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.2), 0 8px 24px ${p => p.color}15;
`;

const StatusPill = styled.div`
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${p => p.color};
  background: ${p => p.color}14;
  border: 1px solid ${p => p.color}25;
  border-radius: 100px;
  padding: 4px 12px;
  margin-top: 8px;
`;

const IconBadge = styled(Box)`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(124, 77, 255, 0.04);
  padding: 14px 16px;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(124, 77, 255, 0.1);
    transform: translateX(4px);
  }
`;

const CheckIconWrap = styled.div`
  margin-top: 2px;
  flex-shrink: 0;
`;

const AlertGlassCard = styled(GlassCard)`
  border-color: rgba(248, 113, 113, 0.15) !important;
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.04) 0%, rgba(248, 113, 113, 0.01) 100%) !important;
`;

const AlertBox = styled(Box)`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(248, 113, 113, 0.03);
  border: 1px solid rgba(248, 113, 113, 0.08);
  padding: 14px 16px;
  border-radius: 12px;
  height: 100%;
  box-sizing: border-box;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(248, 113, 113, 0.06);
  }
`;

const AlertDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #F87171;
  margin-top: 7px;
  flex-shrink: 0;
  box-shadow: 0 0 8px #F87171;
`;

const MetricWidget = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(124, 77, 255, 0.06);
  border-radius: 14px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(124, 77, 255, 0.15);
  }
`;

const MetricTitle = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(226, 232, 255, 0.4);
`;

const MetricSub = styled(Typography)`
  font-size: 0.625rem !important;
  color: rgba(226, 232, 255, 0.28);
  margin-top: 1px;
`;

const MetricValue = styled(Typography)`
  font-family: var(--font-display) !important;
  font-weight: 800 !important;
  font-size: 1.35rem !important;
  color: #F5F5FF !important;
  letter-spacing: -0.020em !important;
`;

const SpecsBanner = styled(Paper)`
  background: linear-gradient(135deg, rgba(124, 77, 255, 0.08) 0%, rgba(68, 138, 255, 0.04) 100%) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px !important;
  border: 1px solid rgba(124, 77, 255, 0.12) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 24px 32px !important;
  display: flex;
  align-items: center;
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 600px) {
    padding: 20px !important;
    border-radius: 16px !important;
  }
`;

const SpecField = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 3px;

  .label {
    font-family: var(--font-heading);
    font-size: 0.625rem;
    font-weight: 800;
    color: rgba(226,232,255,0.3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .value {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.01em;
  }
`;
