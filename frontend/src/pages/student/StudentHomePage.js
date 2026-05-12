import React, { useEffect, useState } from 'react'
import { Container, Grid, Box, Typography, Button, TextField } from '@mui/material'
import { api } from '../../api/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { calculateOverallAttendancePercentage } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import SeeNotice from '../../components/SeeNotice';
import SubjectIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIcon from "@mui/icons-material/TaskOutlined";
import DashboardCard from '../../components/common/DashboardCard';
import AppHeader from '../../components/common/AppHeader';
import AttendanceHeatmap from '../../components/AttendanceHeatmap';
import styled from 'styled-components';

const StudentHomePage = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [studyHours, setStudyHours] = useState('');
    const [hasLoggedToday, setHasLoggedToday] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);
    const classID = currentUser?.sclassName?.id || currentUser?.sclassName?._id;

    const theoryRadarData = aiInsight?.examResults?.filter(exam => exam.subjects?.subject_type === 'Theory' || !exam.subjects?.subject_type).map(exam => ({
        subject: exam.subjects?.sub_name?.split(' ')[0] || "Unknown",
        marks: exam.marks_obtained || 0,
        fullMark: 100
    })) || [];

    const practicalRadarData = aiInsight?.examResults?.filter(exam => exam.subjects?.subject_type === 'Practical').map(exam => ({
        subject: exam.subjects?.sub_name?.split(' ')[0] || "Unknown",
        marks: exam.marks_obtained || 0,
        fullMark: 50
    })) || [];

    useEffect(() => {
        if (currentUser?._id && classID) {
            dispatch(getUserDetails(currentUser._id, "Student"));
            dispatch(getSubjectList(classID, "ClassSubjects"));
            
            const checkLog = async () => {
                try {
                    const response = await api.get(`/Student/StudyLogCheck/${currentUser._id}`);
                    setHasLoggedToday(response.data.hasLogged);
                } catch (err) {
                    console.error("Error checking study log:", err);
                }
            };
            checkLog();

            const fetchAI = async () => {
                try {
                    const response = await api.get(`/Student/AIRecommendations/${currentUser._id}`);
                    setAiInsight(response.data);
                } catch (err) {
                    console.error("Error fetching AI insights:", err);
                }
            };
            fetchAI();
        }
    }, [dispatch, currentUser?._id, classID]);

    const handleStudyHoursSubmit = async () => {
        if (!studyHours) return;
        try {
            await api.put(`/Student/StudyLog/${currentUser._id}`, {
                date: new Date().toISOString().slice(0, 10),
                hoursLogged: studyHours
            });
            alert("Study hours logged successfully!");
            setStudyHours('');
            setHasLoggedToday(true);
        } catch (err) {
            console.error("Error logging study hours:", err);
            const errMsg = err.response?.data?.message || "Failed to log study hours.";
            alert(errMsg);
        }
    };

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const stats = [
        { title: 'Current Semester', value: currentUser?.sclassName?.semester || 1, icon: <SubjectIcon />, color: '#845EC2' },
        { title: 'Total Subjects', value: subjectsList?.length || 0, icon: <AssignmentIcon />, color: '#FF8066' },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 2 }}>
            <AppHeader 
                title={`Hello, ${currentUser.name}`} 
                subtitle={`${currentUser.schoolName} | ${currentUser?.sclassName?.sclassName} (Batch ${currentUser?.sclassName?.batch || 'N/A'})`} 
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                    <Grid container spacing={2}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <DashboardCard {...stat} />
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <AttendanceHeatmap studentID={currentUser._id} />
                        </Grid>
                        <Grid item xs={12}>
                            <SectionPaper sx={{ p: 3, mt: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: 'var(--font-heading)' }}>
                                    Daily Study Tracker
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField 
                                        type="number" 
                                        placeholder={hasLoggedToday ? "Already logged for today" : "Hours studied today..."} 
                                        value={studyHours}
                                        onChange={(e) => setStudyHours(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        disabled={hasLoggedToday}
                                        sx={{ 
                                            flexGrow: 1,
                                            input: { color: 'white' },
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                borderRadius: '12px',
                                                '& fieldset': { borderColor: 'var(--border)' },
                                            }
                                        }}
                                    />
                                    <Button 
                                        variant="contained" 
                                        onClick={handleStudyHoursSubmit}
                                        disabled={hasLoggedToday}
                                        sx={{ borderRadius: '12px', py: 1, px: 3, fontWeight: 700 }}
                                    >
                                        {hasLoggedToday ? "Logged" : "Log Hours"}
                                    </Button>
                                </Box>
                                {hasLoggedToday && (
                                    <Typography variant="caption" sx={{ color: 'var(--secondary)', mt: 1, display: 'block', fontWeight: 600 }}>
                                        You have already put study hours for today.
                                    </Typography>
                                )}
                            </SectionPaper>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <SectionPaper>
                            <SeeNotice />
                        </SectionPaper>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Part 1: AI Recommendations */}
                        <ChartPaper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center', color: 'var(--secondary)', letterSpacing: 1, fontFamily: 'var(--font-heading)' }}>
                                AI Performance Summary
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                {aiInsight ? (
                                    <>
                                        <Box sx={{ 
                                            width: '100px', 
                                            height: '100px', 
                                            borderRadius: '50%', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            bgcolor: aiInsight.ai_insight.performance_band === 'High' ? 'rgba(34, 197, 94, 0.1)' : aiInsight.ai_insight.performance_band === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: aiInsight.ai_insight.performance_band === 'High' ? '#22c55e' : aiInsight.ai_insight.performance_band === 'Medium' ? '#eab308' : '#ef4444',
                                            border: `2px solid ${aiInsight.ai_insight.performance_band === 'High' ? '#22c55e' : aiInsight.ai_insight.performance_band === 'Medium' ? '#eab308' : '#ef4444'}`
                                        }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {aiInsight.ai_insight.performance_band}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.85rem', mt: 1, maxWidth: '100%', wordBreak: 'break-word' }}>
                                            {aiInsight.ai_insight.recommendations[0] || "Keep up the good work!"}
                                        </Typography>

                                        {/* Summary Metrics Row */}
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1.5, width: '100%', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', pt: 1.5 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>ATTENDANCE</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round(aiInsight.features?.attendance_rate || 0)}%</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>THEORY AVG</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>{Math.round((aiInsight.features?.external_avg_theory / 70) * 100 || 0)}%</Typography>
                                            </Box>
                                        </Box>

                                        {aiInsight.subjectAlerts && aiInsight.subjectAlerts.length > 0 && (
                                            <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, textAlign: 'center', mt: 1 }}>
                                                ⚠️ Attention needed in some subjects!
                                            </Typography>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-muted)' }}>Loading...</Typography>
                                )}
                            </Box>
                        </ChartPaper>

                        {/* Part 2: Theory Subject Performance */}
                        <ChartPaper sx={{ p: 3, flexGrow: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center', color: 'var(--secondary)', letterSpacing: 1, fontFamily: 'var(--font-heading)' }}>
                                Theory Performance
                            </Typography>
                            {theoryRadarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={theoryRadarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                        <Radar name="Marks" dataKey="marks" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>No Theory Data</Typography>
                                </Box>
                            )}
                        </ChartPaper>

                        {/* Part 3: Practical Subject Performance */}
                        <ChartPaper sx={{ p: 3, flexGrow: 1, mt: 2 }}>
                            <Typography variant="overline" sx={{ fontWeight: 800, mb: 1, display: 'block', textAlign: 'center', color: 'var(--secondary)', letterSpacing: 1, fontFamily: 'var(--font-heading)' }}>
                                Practical Performance
                            </Typography>
                            {practicalRadarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={practicalRadarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 50]} stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                                        <Radar name="Marks" dataKey="marks" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>No Practical Data</Typography>
                                </Box>
                            )}
                        </ChartPaper>
                    </Box>
                </Grid>
            </Grid>

        </Container>
    );
};

export default StudentHomePage;


const SectionPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 16px;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
`;

const ChartPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  border-radius: 32px;
  border: 1px solid var(--border);
  padding: 28px;
  box-shadow: var(--shadow-md);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: var(--transition);
  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
  }
`;