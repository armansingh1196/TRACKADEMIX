import React, { useEffect, useState } from 'react'
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tab, Container, Typography, BottomNavigation, BottomNavigationAction, Paper, CircularProgress } from '@mui/material'; // Import CircularProgress
import { BlueButton, GreenButton, PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import styled from 'styled-components';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Grid } from '@mui/material';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const ViewSubject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, getresponse, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [selectedSection, setSelectedSection] = useState('attendance');
  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const studentColumns = [
    { id: 'rollNum', label: 'Roll No.', minWidth: 100 },
    { id: 'name', label: 'Name', minWidth: 170 },
  ]

  const studentRows = sclassStudents.map((student) => {
    return {
      rollNum: student.rollNum,
      name: student.name,
      id: student._id,
    };
  })

  const StudentsAttendanceButtonHaver = ({ row }) => {
    return (
      <>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Admin/students/student/" + row.id)}
        >
          View
        </BlueButton>
      </>
    );
  };

  const StudentsMarksButtonHaver = ({ row }) => {
    return (
      <>
        <BlueButton
          variant="contained"
          onClick={() => navigate("/Admin/students/student/" + row.id)}
        >
          View
        </BlueButton>
        <PurpleButton variant="contained"
          onClick={() => navigate(`/Admin/subject/student/marks/${row.id}/${subjectID}`)}>
          Provide Marks
        </PurpleButton>
      </>
    );
  };

  const SubjectStudentsSection = () => {
    return (
      <>
        {getresponse ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 4, minHeight: '200px' }}> {/* Added minHeight for better centering */}
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              No students found for this subject.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/class/addstudents/" + classID)}
              >
                Add Students
              </GreenButton>
            </Box>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Students List:
            </Typography>

            <TableTemplate buttonHaver={StudentsAttendanceButtonHaver} columns={studentColumns} rows={studentRows} />

          </>
        )}
      </>
    )
  }

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <StyledPaper elevation={0}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 900, fontFamily: 'Outfit', mb: 4, letterSpacing: '-1px' }}>
          Subject <span>Details</span>
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><AutoStoriesIcon /></IconBox>
              <Box>
                <Label>Subject Name</Label>
                <Value>{subjectDetails && subjectDetails.subName}</Value>
              </Box>
            </DetailCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><CodeIcon /></IconBox>
              <Box>
                <Label>Subject Code</Label>
                <Value>{subjectDetails && subjectDetails.subCode}</Value>
              </Box>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><AccessTimeIcon /></IconBox>
              <Box>
                <Label>Subject Sessions</Label>
                <Value>{subjectDetails && subjectDetails.sessions}</Value>
              </Box>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><GroupIcon /></IconBox>
              <Box>
                <Label>Number of Students</Label>
                <Value>{numberOfStudents}</Value>
              </Box>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><SchoolIcon /></IconBox>
              <Box>
                <Label>Class Name</Label>
                <Value>{subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName.sclassName}</Value>
              </Box>
            </DetailCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DetailCard>
              <IconBox><SchoolIcon /></IconBox>
              <Box>
                <Label>Teacher</Label>
                <Value>{subjectDetails && subjectDetails.teacher ? subjectDetails.teacher.name : "Not Assigned"}</Value>
              </Box>
            </DetailCard>
          </Grid>
        </Grid>

        {!(subjectDetails && subjectDetails.teacher) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <GreenButton variant="contained"
              onClick={() => navigate("/Admin/teachers/addteacher/" + subjectDetails._id)}
              sx={{ py: 1.5, px: 4, borderRadius: '12px', fontWeight: 700 }}
            >
              Add Subject Teacher
            </GreenButton>
          </Box>
        )}
      </StyledPaper>
    );
  }

  return (
    <>
      {subloading ? ( // Display loading spinner when subloading is true
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ width: '100%', typography: 'body1', }} >
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} sx={{ 
                  position: 'fixed', 
                  width: '100%', 
                  bgcolor: 'rgba(17, 16, 22, 0.8)', 
                  backdropFilter: 'blur(20px)', 
                  zIndex: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'Outfit',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    py: 2
                  },
                  '& .Mui-selected': {
                    color: '#845ec2 !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#845ec2',
                    height: '3px',
                    borderRadius: '3px'
                  }
                }}>
                  <Tab label="Details" value="1" />
                  <Tab label="Students" value="2" />
                </TabList>
              </Box>
              <Container sx={{ marginTop: "3rem", marginBottom: "4rem" }}>
                <TabPanel value="1">
                  <SubjectDetailsSection />
                </TabPanel>
                <TabPanel value="2">
                  <SubjectStudentsSection />
                </TabPanel>
              </Container>
            </TabContext>
          </Box>
        </>
      )}
    </>
  )
}

const StyledPaper = styled(Paper)`
  padding: 40px;
  background: rgba(176, 168, 185, 0.05) !important;
  backdrop-filter: blur(24px);
  border-radius: 30px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  margin-top: 2rem;

  span {
    background: linear-gradient(135deg, #845ec2 0%, #ff8066 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const DetailCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-5px);
    border-color: rgba(132, 94, 194, 0.3);
  }
`;

const IconBox = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(132, 94, 194, 0.1);
  color: #845ec2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 24px;
  }
`;

const Label = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const Value = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  font-family: 'Outfit', sans-serif;
`;

export default ViewSubject