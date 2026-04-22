import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import CircularProgress
import { Button, Container, Typography, CircularProgress } from '@mui/material';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></div>;
    }

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Teacher Details
            </Typography>
            <Typography variant="h6" gutterBottom>
                Teacher Name: {teacherDetails?.name}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Class Name: {teacherDetails?.teachSclass?.sclassName}
            </Typography>
            {isSubjectNamePresent ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        Subject Name: {teacherDetails?.teachSubject?.subName}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Subject Sessions: {teacherDetails?.teachSubject?.sessions}
                    </Typography>
                </>
            ) : (
                <Button variant="contained" onClick={handleAddSubject}>
                    Add Subject
                </Button>
            )}
        </Container>
    );
};

export default TeacherDetails;