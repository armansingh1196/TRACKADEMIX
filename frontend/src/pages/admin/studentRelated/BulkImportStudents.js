import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { 
    Box, Container, Typography, Paper, Grid, Stack, 
    MenuItem, Select, FormControl, InputLabel, CircularProgress 
} from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import Popup from '../../../components/Popup';

const BulkImportStudents = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);
    const { sclassesList } = useSelector((state) => state.sclass);

    const [sclassName, setSclassName] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const rows = text.split('\n').slice(1); // Skip header
                const data = rows.map(row => {
                    const [name, rollNum, password] = row.split(',');
                    const cleanedName = name?.trim();
                    const cleanedRoll = rollNum?.trim();
                    const isValid = cleanedName && cleanedRoll && !isNaN(cleanedRoll);
                    return { 
                        name: cleanedName, 
                        rollNum: cleanedRoll, 
                        password: password?.trim() || "123456",
                        isValid 
                    };
                }).filter(item => item.name || item.rollNum);
                setPreview(data.slice(0, 10)); // Show more for preview
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!sclassName || !file) {
            setMessage("Please select a class and upload a CSV file.");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1);
            const students = [];
            let hasInvalidRows = false;

            rows.forEach(row => {
                const [name, rollNum, password] = row.split(',');
                const cleanedName = name?.trim();
                const cleanedRoll = rollNum?.trim();
                
                if (cleanedName && cleanedRoll) {
                    if (isNaN(cleanedRoll)) {
                        hasInvalidRows = true;
                    } else {
                        students.push({ 
                            name: cleanedName, 
                            rollNum: cleanedRoll, 
                            password: password?.trim() || "123456",
                            sclassName: sclassName 
                        });
                    }
                }
            });

            if (hasInvalidRows) {
                setMessage("Some rows have invalid roll numbers. Please fix and re-upload.");
                setShowPopup(true);
                setLoader(false);
                return;
            }

            if (students.length === 0) {
                setMessage("No valid student data found in CSV.");
                setShowPopup(true);
                setLoader(false);
                return;
            }

            try {
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/StudentBulkReg`, {
                    students,
                    adminID: currentUser._id
                });
                setMessage(res.data.message);
                setShowPopup(true);
                setTimeout(() => navigate(-1), 2000);
            } catch (err) {
                setMessage("Upload failed. Check your CSV format.");
                setShowPopup(true);
            } finally {
                setLoader(false);
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,RollNumber,Password\nArjun Kumar,2022001,bit123\nSneha Kumari,2022002,bit123";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_template.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <AppHeader 
                title="Bulk Enrollment" 
                subtitle="Upload a CSV file to enroll multiple students simultaneously." 
            />

            <Grid container spacing={4} sx={{ mt: 2 }}>
                <Grid item xs={12} md={5}>
                    <GlassCard sx={{ p: 4 }}>
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                    Step 1: Preparation
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                                    Download the template and fill in student details.
                                </Typography>
                                <AppButton 
                                    variant="outlined" 
                                    startIcon={<FileDownloadOutlinedIcon />}
                                    onClick={downloadTemplate}
                                    fullWidth
                                >
                                    Download Template
                                </AppButton>
                            </Box>

                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                                    Step 2: Selection
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel sx={{ color: 'var(--text-muted)' }}>Target Class</InputLabel>
                                    <StyledSelect
                                        value={sclassName}
                                        label="Target Class"
                                        onChange={(e) => setSclassName(e.target.value)}
                                    >
                                        {sclassesList.map((item) => (
                                            <MenuItem key={item._id} value={item._id}>{item.sclassName}</MenuItem>
                                        ))}
                                    </StyledSelect>
                                </FormControl>

                                <UploadZone component="label">
                                    <FileUploadOutlinedIcon sx={{ fontSize: 40, color: 'var(--primary)', mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                                        {file ? file.name : "Click to Upload CSV"}
                                    </Typography>
                                    <input type="file" hidden accept=".csv" onChange={handleFileChange} />
                                </UploadZone>
                            </Box>

                            <AppButton 
                                variant="contained" 
                                fullWidth 
                                onClick={handleUpload}
                                disabled={loader || !file || !sclassName}
                                sx={{ py: 2, background: 'var(--gradient-vibrant) !important' }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Commit Bulk Enrollment"}
                            </AppButton>
                        </Stack>
                    </GlassCard>
                </Grid>

                <Grid item xs={12} md={7}>
                    <GlassCard sx={{ p: 4, minHeight: '400px' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 3 }}>
                            Data Preview
                        </Typography>
                        {preview.length > 0 ? (
                            <Stack spacing={2}>
                                {preview.map((item, i) => (
                                    <PreviewItem key={i} style={{ opacity: item.isValid ? 1 : 0.5, border: item.isValid ? '1px solid var(--border)' : '1px solid var(--accent)' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 800 }}>{item.name || "Missing Name"}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Roll: {item.rollNum || "Missing Roll"}</Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: item.isValid ? 'var(--primary-light)' : 'var(--accent)', fontWeight: 700 }}>
                                            {item.isValid ? "Valid Row" : "Invalid Format"}
                                        </Typography>
                                    </PreviewItem>
                                ))}
                                <Typography variant="caption" sx={{ color: 'var(--text-muted)', textAlign: 'center', mt: 2 }}>
                                    Showing first {preview.length} rows...
                                </Typography>
                            </Stack>
                        ) : (
                            <Box sx={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '20px' }}>
                                <Typography sx={{ color: 'var(--text-muted)' }}>No file uploaded yet.</Typography>
                            </Box>
                        )}
                    </GlassCard>
                </Grid>
            </Grid>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>

    );
};

export default BulkImportStudents;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Paper)`
    background: var(--bg-card) !important;
    backdrop-filter: blur(24px);
    border-radius: 32px !important;
    border: 1px solid var(--border) !important;
    animation: ${fadeIn} 0.6s ease-out;
`;

const UploadZone = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    border: 2px dashed var(--border);
    border-radius: 24px;
    cursor: pointer;
    transition: var(--transition);
    
    &:hover {
        background: rgba(255,255,255,0.03);
        border-color: var(--primary);
    }
`;

const StyledSelect = styled(Select)`
    border-radius: 14px !important;
    color: white !important;
    & .MuiOutlinedInput-notchedOutline { border-color: var(--border) !important; }
`;

const PreviewItem = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(255,255,255,0.02);
    border-radius: 16px;
    border: 1px solid var(--border);
`;
