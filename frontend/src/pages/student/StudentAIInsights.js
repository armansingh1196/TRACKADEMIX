import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Paper, CircularProgress, Button, LinearProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { api } from '../../api/client';
import styled from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

const StudentAIInsights = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/Student/AIRecommendations/${currentUser._id}`);
                setInsights(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching AI insights:", err);
                setError("Failed to load AI insights. Please ensure the AI backend is running.");
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?._id) {
            fetchInsights();
        }
    }, [currentUser]);

    const getBandColor = (band) => {
        switch (band) {
            case 'High': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#ef4444';
            default: return 'var(--text-secondary)';
        }
    };

    const getBandIcon = (band) => {
        switch (band) {
            case 'High': return <TrendingUpIcon style={{ color: '#10b981', fontSize: '2rem' }} />;
            case 'Medium': return <RemoveIcon style={{ color: '#f59e0b', fontSize: '2rem' }} />;
            case 'Low': return <TrendingDownIcon style={{ color: '#ef4444', fontSize: '2rem' }} />;
            default: return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 2 }}>
            <AppHeader 
                title="AI Academic Insights" 
                subtitle="Personalized performance predictions and recommendations" 
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : error ? (
                <SectionPaper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error" variant="h6">{error}</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </SectionPaper>
            ) : insights ? (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <SectionPaper sx={{ textAlign: 'center', p: 4, height: '100%' }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'var(--text-muted)' }}>
                                Predicted Performance
                            </Typography>
                            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                {getBandIcon(insights.ai_insight.performance_band)}
                                <Typography variant="h3" sx={{ fontWeight: 900, color: getBandColor(insights.ai_insight.performance_band) }}>
                                    {insights.ai_insight.performance_band}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                                Based on your current attendance, internal marks, and study logs.
                            </Typography>
                        </SectionPaper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <SectionPaper sx={{ p: 4, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <AutoAwesomeIcon sx={{ color: 'var(--primary)', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                                    Recommendations for You
                                </Typography>
                            </Box>
                            
                            <Box component="ul" sx={{ pl: 2 }}>
                                {insights.ai_insight.recommendations.map((rec, index) => (
                                    <Box component="li" key={index} sx={{ mb: 2, color: 'var(--text-main)' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {rec}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </SectionPaper>
                    </Grid>

                    {insights.subjectAlerts && insights.subjectAlerts.length > 0 && (
                        <Grid item xs={12}>
                            <SectionPaper sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <TrendingDownIcon sx={{ color: '#ef4444', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                                        Subject Specific Alerts
                                    </Typography>
                                </Box>
                                
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {insights.subjectAlerts.map((alert, index) => (
                                        <Box component="li" key={index} sx={{ mb: 2, color: 'var(--text-main)' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {alert}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </SectionPaper>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <SectionPaper sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, fontFamily: 'var(--font-heading)' }}>
                                Analyzed Metrics
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Attendance Rate</Typography>
                                        <Typography variant="h5">{Math.round(insights.features.attendance_rate)}%</Typography>
                                        <LinearProgress variant="determinate" value={insights.features.attendance_rate} sx={{ mt: 1, borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--primary)' } }} />
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Theory Internal</Typography>
                                        <Typography variant="h5">{Math.round((insights.features.internal_avg_theory / 30) * 100)}%</Typography>
                                        <LinearProgress variant="determinate" value={(insights.features.internal_avg_theory / 30) * 100} sx={{ mt: 1, borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }} />
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Theory External</Typography>
                                        <Typography variant="h5">{Math.round((insights.features.external_avg_theory / 70) * 100)}%</Typography>
                                        <LinearProgress variant="determinate" value={(insights.features.external_avg_theory / 70) * 100} sx={{ mt: 1, borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Previous GPA</Typography>
                                        <Typography variant="h5">{insights.features.previous_gpa}</Typography>
                                        <LinearProgress variant="determinate" value={(insights.features.previous_gpa / 10) * 100} sx={{ mt: 1, borderRadius: 5, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#845EC2' } }} />
                                    </MetricBox>
                                </Grid>
                            </Grid>
                        </SectionPaper>
                    </Grid>

                    {/* AI Model Performance Row */}
                    <Grid item xs={12}>
                        <SectionPaper sx={{ p: 4, background: 'linear-gradient(135deg, rgba(132, 85, 194, 0.1) 0%, rgba(255, 128, 102, 0.1) 100%) !important' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--secondary)', mb: 0.5 }}>
                                        AI MODEL PERFORMANCE
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                        This model is trained on historical data to predict student success.
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>ACCURACY</Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'var(--primary)' }}>
                                            {insights.modelMetrics ? Math.round(insights.modelMetrics.accuracy * 100) : 88}%
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>MODEL TYPE</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--text-main)', mt: 0.5 }}>
                                            {insights.modelMetrics?.model_type || "Random Forest"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </SectionPaper>
                    </Grid>
                </Grid>
            ) : null}
        </Container>
    );
};

export default StudentAIInsights;

const SectionPaper = styled(Paper)`
  background: rgba(176, 168, 185, 0.03) !important;
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  box-shadow: var(--shadow-md) !important;
  backdrop-filter: blur(10px);
`;

const MetricBox = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  
  caption {
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  h5 {
    font-weight: 900;
    color: var(--primary);
    margin-top: 8px;
  }
`;
