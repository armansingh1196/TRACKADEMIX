import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { getClassDetails, getClassStudents, getSubjectList } from "../../../redux/sclassRelated/sclassHandle";
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Box, Container, Typography, Tab, IconButton, CircularProgress, Grid, Paper, Stack
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { resetSubjects } from "../../../redux/sclassRelated/sclassSlice";
import AppButton from "../../../components/common/AppButton";
import AppHeader from "../../../components/common/AppHeader";
import TableTemplate from "../../../components/TableTemplate";
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import styled from "styled-components";

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

const ClassDetails = () => {
    const params = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { subjectsList, sclassStudents, sclassDetails, loading, response, getresponse } = useSelector((state) => state.sclass);

    const classID = params.id

    useEffect(() => {
        dispatch(getClassDetails(classID, "Sclass"));
        dispatch(getSubjectList(classID, "ClassSubjects"))
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getClassStudents(classID));
                dispatch(resetSubjects())
                dispatch(getSubjectList(classID, "ClassSubjects"))
                setMessage("Operation completed successfully")
                setShowPopup(true)
            })
            .catch(() => {
                setMessage("Failed to perform delete operation")
                setShowPopup(true)
            })
    }

    const subjectColumns = [
        { id: 'name', label: 'Subject Name', minWidth: 170 },
        { id: 'code', label: 'Subject Code', minWidth: 100 },
    ]

    const subjectRows = subjectsList && subjectsList.length > 0 && subjectsList.map((subject) => {
        return {
            name: subject.subName,
            code: subject.subCode,
            id: subject._id,
        };
    })

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")} size="small">
                    <DeleteIcon color="error" sx={{ fontSize: 20 }} />
                </IconButton>
                <AppButton
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}
                >
                    View
                </AppButton >
            </Box>
        );
    };

    const subjectActions = [
        {
            icon: <PostAddIcon />, name: 'Add New Subject',
            action: () => navigate("/Admin/addsubject/" + classID)
        },
        {
            icon: <DeleteIcon />, name: 'Delete All Subjects',
            action: () => deleteHandler(classID, "SubjectsClass")
        }
    ];

    const ClassSubjectsSection = () => {
        return (
            <>
                {response ?
                    <EmptyStateBox>
                        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                            No subjects found for this class.
                        </Typography>
                        <AppButton
                            variant="contained"
                            onClick={() => navigate("/Admin/addsubject/" + classID)}
                        >
                            Add Your First Subject
                        </AppButton>
                    </EmptyStateBox>
                    :
                    <Stack spacing={3}>
                        <SectionHeading variant="h5">Academic Subjects</SectionHeading>
                        <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                        <SpeedDialTemplate actions={subjectActions} />
                    </Stack>
                }
            </>
        )
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    })

    const StudentsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => deleteHandler(row.id, "Student")} size="small">
                    <PersonRemoveIcon color="error" sx={{ fontSize: 20 }} />
                </IconButton>
                <AppButton
                    variant="contained"
                    size="small"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                >
                    View
                </AppButton>
                <AppButton
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: 'var(--border)', color: 'white' }}
                    onClick={() => navigate("/Admin/students/student/attendance/" + row.id)}
                >
                    Attendance
                </AppButton>
            </Box>
        );
    };

    const studentActions = [
        {
            icon: <PersonAddAlt1Icon />, name: 'Add New Student',
            action: () => navigate("/Admin/class/addstudents/" + classID)
        },
        {
            icon: <PersonRemoveIcon />, name: 'Delete All Students',
            action: () => deleteHandler(classID, "StudentsClass")
        },
    ];

    const ClassStudentsSection = () => {
        return (
            <>
                {getresponse ? (
                    <EmptyStateBox>
                        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                            No students enrolled in this class.
                        </Typography>
                        <AppButton
                            variant="contained"
                            onClick={() => navigate("/Admin/class/addstudents/" + classID)}
                        >
                            Enroll Students
                        </AppButton>
                    </EmptyStateBox>
                ) : (
                    <Stack spacing={3}>
                        <SectionHeading variant="h5">Student Roster</SectionHeading>
                        <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                        <SpeedDialTemplate actions={studentActions} />
                    </Stack>
                )}
            </>
        )
    }

    const ClassTeachersSection = () => {
        return (
            <EmptyStateBox>
                <Typography variant="h6" sx={{ color: 'var(--text-muted)' }}>
                    Teacher assignment management coming soon.
                </Typography>
            </EmptyStateBox>
        )
    }

    const ClassDetailsSection = () => {
        const numberOfSubjects = subjectsList.length;
        const numberOfStudents = sclassStudents.length;

        const stats = [
            { label: 'Enrolled Students', value: numberOfStudents, icon: <PeopleAltOutlinedIcon />, color: 'var(--primary)' },
            { label: 'Active Subjects', value: numberOfSubjects, icon: <AssignmentOutlinedIcon />, color: 'var(--secondary)' },
            { label: 'Class Status', value: 'Active', icon: <SchoolOutlinedIcon />, color: 'var(--success)' },
        ]

        return (
            <Box sx={{ py: 2 }}>
                <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <StatCard>
                                <IconBox sx={{ background: `${stat.color}15`, color: stat.color }}>
                                    {stat.icon}
                                </IconBox>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit' }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </StatCard>
                        </Grid>
                    ))}
                </Grid>
                
                <GlassBox sx={{ mt: 4, p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>
                        Quick Actions
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <AppButton variant="contained" onClick={() => navigate("/Admin/class/addstudents/" + classID)}>
                            Add Students
                        </AppButton>
                        <AppButton variant="outlined" sx={{ color: 'white', borderColor: 'var(--border)' }} onClick={() => navigate("/Admin/addsubject/" + classID)}>
                            Manage Subjects
                        </AppButton>
                    </Stack>
                </GlassBox>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title={`Class: ${sclassDetails?.sclassName || 'Loading...'}`}
                subtitle="Detailed overview of academic performance, students, and subjects."
            />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Box sx={{ width: '100%', mt: 4 }}>
                    <TabContext value={value}>
                        <TabListContainer>
                            <TabList 
                                onChange={handleChange} 
                                sx={{ 
                                    '& .MuiTab-root': { 
                                        color: 'var(--text-muted)', 
                                        fontWeight: 800,
                                        fontFamily: 'Outfit',
                                        px: 4
                                    },
                                    '& .Mui-selected': { 
                                        color: 'white !important' 
                                    },
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        background: 'var(--gradient-vibrant)'
                                    }
                                }}
                            >
                                <Tab label="Overview" value="1" />
                                <Tab label="Subjects" value="2" />
                                <Tab label="Students" value="3" />
                                <Tab label="Teachers" value="4" />
                            </TabList>
                        </TabListContainer>
                        
                        <TabPanel value="1" sx={{ px: 0 }}><ClassDetailsSection /></TabPanel>
                        <TabPanel value="2" sx={{ px: 0 }}><ClassSubjectsSection /></TabPanel>
                        <TabPanel value="3" sx={{ px: 0 }}><ClassStudentsSection /></TabPanel>
                        <TabPanel value="4" sx={{ px: 0 }}><ClassTeachersSection /></TabPanel>
                    </TabContext>
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ClassDetails;

const TabListContainer = styled(Box)`
  background: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  margin-bottom: 24px;
  overflow: hidden;
`;

const StatCard = styled(Paper)`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 20px !important;
`;

const IconBox = styled(Box)`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  svg { font-size: 28px; }
`;

const GlassBox = styled(Box)`
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
`;

const EmptyStateBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 32px;
  border: 2px dashed var(--border);
`;

const SectionHeading = styled(Typography)`
  font-family: 'Outfit', sans-serif !important;
  font-weight: 800 !important;
  color: white !important;
  margin-bottom: 16px !important;
`;