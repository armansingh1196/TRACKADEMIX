import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
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
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Internal Exam Score</Typography>
                                        <Typography variant="h5">{Math.round(insights.features.internal_exam_score)}%</Typography>
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Weekly Study Hours</Typography>
                                        <Typography variant="h5">{Math.round(insights.features.study_hours_per_week)}h</Typography>
                                    </MetricBox>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <MetricBox>
                                        <Typography variant="caption">Previous GPA</Typography>
                                        <Typography variant="h5">{insights.features.previous_gpa}</Typography>
                                    </MetricBox>
                                </Grid>
                            </Grid>
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
