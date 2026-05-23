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

    const [aiInsight, setAiInsight] = useState(null);
    const classID = currentUser?.sclassName?.id || currentUser?.sclassName?._id;

    const theoryRadarData = aiInsight?.examResults?.filter(exam => exam.subjects?.subject_type === 'Theory' || !exam.subjects?.subject_type).map(exam => {
        let subName = exam.subjects?.sub_name || "Unknown";
        // Shorten long names gracefully
        if (subName.includes("Software Engineering")) subName = "Soft. Eng";
        if (subName.includes("Operating Systems")) subName = "OS";
        if (subName.includes("Database Systems")) subName = "Database";
        if (subName.includes("Data Structures")) subName = "DSA";
        if (subName.includes("Algorithms")) subName = "Algorithms";
        return {
            subject: subName,
            marks: exam.marks_obtained || 0,
            fullMark: 100
        };
    }) || [];

    const practicalRadarData = aiInsight?.examResults?.filter(exam => exam.subjects?.subject_type === 'Practical').map(exam => {
        let subName = exam.subjects?.sub_name || "Unknown";
        // Remove LAB suffix and year
        subName = subName.replace(/ LAB(\s*\(\d+\))?/i, '');
        // Shorten names
        if (subName.includes("Computer Networks")) subName = "Comp. Net";
        if (subName.includes("Computer Graphics")) subName = "Comp. Graph";
        if (subName.includes("Data Science")) subName = "Data Sci";
        return {
            subject: subName,
            marks: exam.marks_obtained || 0,
            fullMark: 50
        };
    }) || [];

    useEffect(() => {
        if (currentUser?._id && classID) {
            dispatch(getUserDetails(currentUser._id, "Student"));
            dispatch(getSubjectList(classID, "ClassSubjects"));
            


            const fetchAI = async () => {
                if (currentUser._id.startsWith("mock_")) {
                    setAiInsight({
                        features: { attendance_rate: calculateOverallAttendancePercentage(currentUser.attendance || []) },
                        examResults: currentUser.examResult || [],
                        subjectAlerts: [
                            "Low internal score in Operating Systems. Focus on continuous assessment.",
                            "Weak performance in Database Systems external exams. Needs targeted study."
                        ]
                    });
                    return;
                }
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
        { title: 'Current Semester', value: currentUser?.sclassName?.semester || 1, icon: <SubjectIcon />, color: '#7C4DFF' },
        { title: 'Total Subjects', value: subjectsList?.length || 0, icon: <AssignmentIcon />, color: '#FF8066' },
    ];

    // --- DYNAMIC AI PERFORMANCE LOGIC ---
    let frontendPerformanceBand = "Medium";
    let frontendRecommendation = "Loading...";

    if (aiInsight && aiInsight.examResults) {
        let totalActiveSubjects = 0;
        let failedSubjects = 0;

        aiInsight.examResults.forEach(exam => {
            const internal = exam.internal_marks || 0;
            const external = exam.external_marks || 0;
            const total = internal + external;
            
            if (total > 0) {
                totalActiveSubjects++;
                const isPractical = exam.subjects?.subject_type === 'Practical';
                const maxMarks = isPractical ? 50 : 100;
                const percentage = (total / maxMarks) * 100;
                if (percentage < 40) {
                    failedSubjects++;
                }
            }
        });

        const attendanceRate = aiInsight.features?.attendance_rate || 100;

        if (totalActiveSubjects > 0 && failedSubjects === 0 && attendanceRate >= 75) {
            frontendPerformanceBand = "High";
        } else if (failedSubjects > 1 || attendanceRate < 60) {
            frontendPerformanceBand = "Low";
        }

        if (frontendPerformanceBand === "High") {
            frontendRecommendation = "Excellent academic and attendance record. You are completely on track! 🚀";
        } else if (frontendPerformanceBand === "Low") {
            frontendRecommendation = "You are currently at risk. Please schedule a mentoring session and review your weak subjects.";
        } else {
            frontendRecommendation = "You need some extra effort to get on track. Focus on your upcoming tests.";
        }
    }
    // ------------------------------------

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
                                            padding: '12px 24px', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            background: frontendPerformanceBand === 'High' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))' : frontendPerformanceBand === 'Medium' ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(234, 179, 8, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
                                            color: frontendPerformanceBand === 'High' ? '#4ade80' : frontendPerformanceBand === 'Medium' ? '#facc15' : '#f87171',
                                            border: `1px solid ${frontendPerformanceBand === 'High' ? 'rgba(34, 197, 94, 0.3)' : frontendPerformanceBand === 'Medium' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}>
                                            <Typography variant="h4" sx={{ lineHeight: 1 }}>
                                                {frontendPerformanceBand === 'High' ? '🚀' : frontendPerformanceBand === 'Medium' ? '💡' : '⚠️'}
                                            </Typography>
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, mb: -0.5 }}>
                                                    Status
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                    {frontendPerformanceBand === 'High' ? 'On Track' : frontendPerformanceBand === 'Medium' ? 'Needs Effort' : 'At Risk'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-main)', fontWeight: 500, fontSize: '0.85rem', mt: 1, maxWidth: '100%', wordBreak: 'break-word' }}>
                                            {frontendRecommendation}
                                        </Typography>

                                        {/* Summary Metrics Row */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5, width: '100%', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', pt: 1.5 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>ATTENDANCE</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--primary)' }}>{Math.round(aiInsight.features?.attendance_rate || 0)}%</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>THEORY AVG</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>{Math.round((aiInsight.features?.external_avg_theory / 70) * 100 || 0)}%</Typography>
                                            </Box>
                                        </Box>
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
  background: rgba(255, 255, 255, 0.055);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.1);
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);

  @media (max-width: 600px) {
    border-radius: 14px;
    padding: 12px;
  }
`;

const ChartPaper = styled(Box)`
  background: rgba(255, 255, 255, 0.055);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.1);
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  @media (max-width: 600px) {
    padding: 14px;
    border-radius: 14px;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(124, 77, 255, 0.25);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,77,255,0.12), inset 0 1px 0 rgba(255,255,255,0.14);
  }
`;