import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Collapse, Table, TableBody, TableHead, TableRow, Typography, Tab, Container, CircularProgress, Avatar, TableContainer, Paper, Chip } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { KeyboardArrowDown, KeyboardArrowUp, Add as AddIcon } from '@mui/icons-material';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import CustomPieChart from '../../components/CustomPieChart'
import { StyledTableCell, StyledTableRow } from '../../components/styles';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import AppButton from '../../components/common/AppButton';
import styled from 'styled-components';

const TeacherViewStudent = () => {
    const navigate = useNavigate()
    const params = useParams()
    const dispatch = useDispatch()
    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const studentID = params.id
    const address = "Student"
    
    const teachSubject = currentUser.teachSubject?.subName
    const teachSubjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID])

    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const subjectData = Object.entries(groupAttendanceBySubject(subjectAttendance))
        .filter(([subName]) => subName === teachSubject)
        .map(([subName, { subCode, present, sessions }]) => {
            const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
            return {
                subject: subName,
                attendancePercentage: subjectAttendancePercentage,
                totalClasses: sessions,
                attendedClasses: present
            };
    });

    const SectionHeader = ({ title, onToggle, currentView, showToggle = true }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>{title}</Typography>
            {showToggle && (
                <ToggleGroup>
                    <ToggleButton 
                        className={currentView === 'table' ? 'active' : ''} 
                        onClick={() => onToggle('table')}
                    >
                        <TableChartIcon fontSize="small" /> Table
                    </ToggleButton>
                    <ToggleButton 
                        className={currentView === 'chart' ? 'active' : ''} 
                        onClick={() => onToggle('chart')}
                    >
                        <InsertChartIcon fontSize="small" /> Chart
                    </ToggleButton>
                </ToggleGroup>
            )}
        </Box>
    );

    const StudentAttendanceSection = () => {
        const renderTableSection = () => {
            return (
                <GlassContainer>
                    <SectionHeader title={`Attendance: ${teachSubject}`} currentView={selectedSection} onToggle={setSelectedSection} />
                    
                    <StyledTableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Subject</StyledTableCell>
                                    <StyledTableCell align="center">Present</StyledTableCell>
                                    <StyledTableCell align="center">Total Sessions</StyledTableCell>
                                    <StyledTableCell align="center">Percentage</StyledTableCell>
                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                                if (subName === teachSubject) {
                                    const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                                    return (
                                        <TableBody key={index}>
                                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <StyledTableCell sx={{ fontWeight: 600 }}>{subName}</StyledTableCell>
                                                <StyledTableCell align="center">{present}</StyledTableCell>
                                                <StyledTableCell align="center">{sessions}</StyledTableCell>
                                                <StyledTableCell align="center">
                                                    <Chip 
                                                        label={`${subjectAttendancePercentage}%`} 
                                                        color={subjectAttendancePercentage > 75 ? "success" : subjectAttendancePercentage > 50 ? "warning" : "error"}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </StyledTableCell>
                                                <StyledTableCell align="center">
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small"
                                                        onClick={() => handleOpen(subId)}
                                                        sx={{ borderColor: 'var(--primary)', color: 'white', '&:hover': { background: 'rgba(132, 94, 194, 0.1)' } }}
                                                    >
                                                        {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />} Details
                                                    </Button>
                                                </StyledTableCell>
                                            </TableRow>
                                            <TableRow>
                                                <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0, border: 'none' }} colSpan={5}>
                                                    <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                                            <Typography variant="subtitle2" gutterBottom sx={{ color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                                                                Daily Log
                                                            </Typography>
                                                            <Table size="small" aria-label="purchases">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <StyledTableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</StyledTableCell>
                                                                        <StyledTableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</StyledTableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {allData.map((data, idx) => {
                                                                        const date = new Date(data.date);
                                                                        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                        return (
                                                                            <TableRow key={idx}>
                                                                                <StyledTableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>{dateString}</StyledTableCell>
                                                                                <StyledTableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                                                    <Typography sx={{ color: data.status === 'Present' ? '#4caf50' : '#f44336', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                                        {data.status}
                                                                                    </Typography>
                                                                                </StyledTableCell>
                                                                            </TableRow>
                                                                        )
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </StyledTableCell>
                                            </TableRow>
                                        </TableBody>
                                    )
                                }
                                return null;
                            })}
                        </Table>
                    </StyledTableContainer>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'var(--text-muted)' }}>
                            Overall Attendance: <span style={{ color: 'white', fontWeight: 800 }}>{overallAttendancePercentage.toFixed(2)}%</span>
                        </Typography>
                        <AppButton 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)}
                            sx={{ background: 'var(--gradient-vibrant) !important' }}
                        >
                            Add Attendance
                        </AppButton>
                    </Box>
                </GlassContainer>
            )
        }
        
        const renderChartSection = () => {
            return (
                <GlassContainer>
                    <SectionHeader title="Attendance Analytics" currentView={selectedSection} onToggle={setSelectedSection} />
                    <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                        {subjectData.length > 0 ? (
                            <CustomBarChart chartData={subjectData} dataKey="attendancePercentage" />
                        ) : (
                            <Typography sx={{ color: 'var(--text-muted)', textAlign: 'center', mt: 5 }}>No data available for chart.</Typography>
                        )}
                    </Box>
                </GlassContainer>
            )
        }
        
        return (
            <>
                {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0
                    ? (
                        <>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}
                        </>
                    )
                    : (
                        <EmptyStateCard>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>No Attendance Records</Typography>
                            <Typography sx={{ color: 'var(--text-muted)', mb: 3 }}>This student does not have any attendance data logged for your subject yet.</Typography>
                            <AppButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)} sx={{ background: 'var(--gradient-vibrant) !important' }}>
                                Add First Record
                            </AppButton>
                        </EmptyStateCard>
                    )
                }
            </>
        )
    }

    const StudentMarksSection = () => {
        const teachSubjectMarks = Array.isArray(subjectMarks) ? subjectMarks.filter(res => res.subName && res.subName.subName === teachSubject) : [];

        const renderTableSection = () => {
            return (
                <GlassContainer>
                    <SectionHeader title={`Marks: ${teachSubject}`} currentView={selectedSection} onToggle={setSelectedSection} />
                    <StyledTableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Subject</StyledTableCell>
                                    <StyledTableCell align="right">Marks Obtained</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teachSubjectMarks.map((result, index) => (
                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <StyledTableCell sx={{ fontWeight: 600 }}>{result.subName.subName}</StyledTableCell>
                                        <StyledTableCell align="right">
                                            <Typography sx={{ fontWeight: 700, color: 'var(--secondary)' }}>{result.marksObtained}</Typography>
                                        </StyledTableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <AppButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)} sx={{ background: 'var(--gradient-vibrant) !important' }}>
                            Add / Update Marks
                        </AppButton>
                    </Box>
                </GlassContainer>
            )
        }
        
        const renderChartSection = () => {
            return (
                <GlassContainer>
                    <SectionHeader title="Performance Analytics" currentView={selectedSection} onToggle={setSelectedSection} />
                    <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                        {teachSubjectMarks.length > 0 ? (
                            <CustomBarChart chartData={teachSubjectMarks} dataKey="marksObtained" />
                        ) : (
                            <Typography sx={{ color: 'var(--text-muted)', textAlign: 'center', mt: 5 }}>No data available for chart.</Typography>
                        )}
                    </Box>
                </GlassContainer>
            )
        }
        
        return (
            <>
                {teachSubjectMarks.length > 0
                    ? (
                        <>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}
                        </>
                    )
                    : (
                        <EmptyStateCard>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>No Exam Marks</Typography>
                            <Typography sx={{ color: 'var(--text-muted)', mb: 3 }}>This student does not have any exam marks recorded for your subject yet.</Typography>
                            <AppButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)} sx={{ background: 'var(--gradient-vibrant) !important' }}>
                                Add Marks
                            </AppButton>
                        </EmptyStateCard>
                    )
                }
            </>
        )
    }

    const StudentDetailsSection = () => {
        return (
            <ProfileCard>
                <ProfileHeader>
                    <Avatar 
                        sx={{ 
                            width: 120, 
                            height: 120, 
                            bgcolor: 'var(--primary)',
                            fontSize: '3rem',
                            fontWeight: 700,
                            boxShadow: '0 8px 24px rgba(132, 94, 194, 0.4)'
                        }}
                    >
                        {userDetails?.name ? userDetails.name.charAt(0).toUpperCase() : 'S'}
                    </Avatar>
                    <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
                            {userDetails.name}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Student Profile
                        </Typography>
                    </Box>
                </ProfileHeader>

                <GridContainer>
                    <DetailsGrid>
                        <DetailItem>
                            <IconWrapper className="blue">
                                <BadgeOutlinedIcon />
                            </IconWrapper>
                            <Box>
                                <Typography className="label">Roll Number</Typography>
                                <Typography className="value">{userDetails.rollNum}</Typography>
                            </Box>
                        </DetailItem>

                        <DetailItem>
                            <IconWrapper className="green">
                                <ClassOutlinedIcon />
                            </IconWrapper>
                            <Box>
                                <Typography className="label">Class Enrolled</Typography>
                                <Typography className="value">{sclassName?.sclassName || "N/A"}</Typography>
                            </Box>
                        </DetailItem>

                        <DetailItem>
                            <IconWrapper className="orange">
                                <SchoolOutlinedIcon />
                            </IconWrapper>
                            <Box>
                                <Typography className="label">Institution</Typography>
                                <Typography className="value">{studentSchool?.schoolName || "N/A"}</Typography>
                            </Box>
                        </DetailItem>
                    </DetailsGrid>

                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                        <PieChartContainer>
                            <Typography variant="subtitle2" sx={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, mb: 2, textAlign: 'center' }}>
                                Overall Attendance
                            </Typography>
                            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                                <CustomPieChart data={chartData} />
                            </Box>
                        </PieChartContainer>
                    )}
                </GridContainer>
            </ProfileCard>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <HeaderBox>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                    Student Overview
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
                    View student profile, attendance, and performance records for your subject.
                </Typography>
            </HeaderBox>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <Box sx={{ width: '100%', typography: 'body1' }} >
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
                            <StyledTabList onChange={handleChange} variant="scrollable" scrollButtons="auto">
                                <StyledTab label="Profile Details" value="1" />
                                <StyledTab label="Attendance Records" value="2" />
                                <StyledTab label="Exam Marks" value="3" />
                            </StyledTabList>
                        </Box>
                        
                        <TabPanel value="1" sx={{ p: 0 }}>
                            <StudentDetailsSection />
                        </TabPanel>
                        <TabPanel value="2" sx={{ p: 0 }}>
                            <StudentAttendanceSection />
                        </TabPanel>
                        <TabPanel value="3" sx={{ p: 0 }}>
                            <StudentMarksSection />
                        </TabPanel>
                    </TabContext>
                </Box>
            )}
        </Container>
    )
}

export default TeacherViewStudent

// --- Styled Components ---

const HeaderBox = styled(Box)`
    margin-bottom: 32px;
    color: var(--text-main);
`;

const StyledTabList = styled(TabList)`
    .MuiTabs-indicator {
        background-color: var(--primary);
        height: 3px;
        border-radius: 3px 3px 0 0;
    }
`;

const StyledTab = styled(Tab)`
    color: var(--text-muted) !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
    text-transform: none !important;
    font-size: 1rem !important;
    min-width: 120px !important;

    &.Mui-selected {
        color: white !important;
    }
`;

const ProfileCard = styled(Box)`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    overflow: hidden;
    animation: fadeIn 0.6s ease-out;
`;

const ProfileHeader = styled(Box)`
    padding: 40px;
    background: linear-gradient(135deg, rgba(132, 94, 194, 0.1) 0%, rgba(255, 128, 102, 0.05) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;

    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
    }
`;

const GridContainer = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 32px;
    padding: 40px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const DetailsGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    align-content: start;
`;

const PieChartContainer = styled(Box)`
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
`;

const DetailItem = styled(Box)`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.02);
    transition: var(--transition);

    &:hover {
        transform: translateY(-2px);
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .label {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
        font-weight: 700;
        margin-bottom: 4px;
    }

    .value {
        font-size: 1.1rem;
        color: white;
        font-weight: 600;
    }
`;

const IconWrapper = styled(Box)`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 24px;
    }

    &.blue { background: rgba(66, 165, 245, 0.1); color: #42a5f5; }
    &.green { background: rgba(102, 187, 106, 0.1); color: #66bb6a; }
    &.orange { background: rgba(255, 167, 38, 0.1); color: #ffa726; }
`;

const GlassContainer = styled(Box)`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 32px;
    animation: fadeIn 0.4s ease-out;

    @media (max-width: 600px) {
        padding: 20px;
    }
`;

const EmptyStateCard = styled(Box)`
    background: rgba(255, 128, 102, 0.05);
    border: 1px dashed rgba(255, 128, 102, 0.3);
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 0.4s ease-out;
`;

const ToggleGroup = styled(Box)`
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ToggleButton = styled(Box)`
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: var(--transition);

    &:hover {
        color: white;
    }

    &.active {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

const StyledTableContainer = styled(TableContainer)`
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 16px !important;

    .MuiTableCell-root {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-main);
    }
    
    .MuiTableHead-root .MuiTableCell-root {
        background: rgba(0, 0, 0, 0.2);
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 1px;
    }
`;