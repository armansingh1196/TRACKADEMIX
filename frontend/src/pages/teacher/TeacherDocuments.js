import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel, Stack, IconButton, Chip, Tabs, Tab } from '@mui/material';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { api } from '../../api/client';
import AppHeader from '../../components/common/AppHeader';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';
import Popup from '../../components/Popup';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

const CATEGORIES = ['Marksheet', 'Exam Schedule', 'Exam Form', 'Important Notice', 'Syllabus', 'General'];

const CATEGORY_COLORS = {
    'Marksheet': '#34D399',
    'Exam Schedule': '#FBBF24',
    'Exam Form': '#60A5FA',
    'Important Notice': '#F87171',
    'Syllabus': '#A78BFA',
    'General': '#94A3B8'
};

const TeacherDocuments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser?.school?._id;
    const classID = currentUser?.teachSclass?._id;

    const [tabIndex, setTabIndex] = useState(0);

    // General Docs State
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');

    // Bulk Marksheet State
    const [bulkFiles, setBulkFiles] = useState([]);
    const [semester, setSemester] = useState('1');
    const [bulkUploading, setBulkUploading] = useState(false);

    useEffect(() => {
        if (adminID) fetchDocuments();
    }, [adminID]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/DocumentList/${adminID}`);
            if (res.data.message) {
                setDocuments([]);
            } else {
                setDocuments(res.data);
            }
        } catch (err) {
            console.error("Error fetching documents:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title) {
            setMessage("Please provide a title and select a file.");
            setShowPopup(true);
            return;
        }

        setUploading(true);
        try {
            const urlRes = await api.post('/DocumentUploadUrl', {
                fileName: selectedFile.name,
                fileType: selectedFile.type
            });

            const { signedUrl, path, publicUrl } = urlRes.data;

            await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': selectedFile.type },
                body: selectedFile
            });

            await api.post('/DocumentUpload', {
                title,
                category,
                description,
                file_url: publicUrl,
                file_name: selectedFile.name,
                file_size: selectedFile.size,
                uploaded_by: currentUser?.name || 'Professor',
                uploader_role: 'Teacher',
                admin_id: adminID,
                target_class: classID || null
            });

            setMessage("Document uploaded successfully!");
            setShowPopup(true);
            setTitle('');
            setCategory('General');
            setDescription('');
            setSelectedFile(null);
            fetchDocuments();
        } catch (err) {
            console.error("Upload error:", err);
            setMessage("Failed to upload document.");
            setShowPopup(true);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        try {
            await api.delete(`/Document/${docId}`);
            setMessage("Document deleted.");
            setShowPopup(true);
            fetchDocuments();
        } catch (err) {
            setMessage("Failed to delete document.");
            setShowPopup(true);
        }
    };

    // Bulk upload logic
    const handleBulkFileSelect = (e) => {
        if (e.target.files) {
            setBulkFiles(Array.from(e.target.files));
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (bulkFiles.length === 0) {
            setMessage("Please select PDF files named by Roll Number.");
            setShowPopup(true);
            return;
        }
        setBulkUploading(true);
        try {
            const uploadedDocs = [];
            for (let file of bulkFiles) {
                // Extract roll number from filename (assuming '2022027.pdf' -> '2022027')
                const rollNum = file.name.split('.')[0];

                const urlRes = await api.post('/DocumentUploadUrl', {
                    fileName: file.name,
                    fileType: file.type
                });

                const { signedUrl, publicUrl } = urlRes.data;

                await fetch(signedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file
                });

                uploadedDocs.push({
                    rollNum,
                    title: `Semester ${semester} Marksheet`,
                    semester: semester,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_size: file.size
                });
            }

            const bulkRes = await api.post('/PersonalDocumentBulkUpload', {
                documents: uploadedDocs,
                admin_id: adminID,
                uploaded_by: currentUser?.name || 'Professor'
            });

            setMessage(bulkRes.data.message || "Bulk upload completed.");
            setShowPopup(true);
            setBulkFiles([]);
            setSemester('1');
        } catch (err) {
            console.error("Bulk upload error:", err);
            setMessage("Failed to bulk upload documents.");
            setShowPopup(true);
        } finally {
            setBulkUploading(false);
        }
    };

    const filteredDocs = filterCategory === 'All' ? documents : documents.filter(d => d.category === filterCategory);

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader
                title="Documents"
                subtitle={`Upload and manage documents for ${currentUser?.teachSclass?.sclassName || 'your class'}`}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3, mt: 2 }}>
                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{
                    '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'none' },
                    '& .Mui-selected': { color: '#F5F5FF' },
                    '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
                }}>
                    <Tab label="General Documents" />
                    <Tab label="Bulk Upload Marksheets" />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <Grid container spacing={3}>
                    {/* Upload */}
                    <Grid item xs={12} md={5}>
                        <GlassCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <IconBadge>
                                    <CloudUploadOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </IconBadge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        Upload Document
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                        Share files with your students
                                    </Typography>
                                </Box>
                            </Box>

                            <form onSubmit={handleUpload}>
                                <Stack spacing={2.5}>
                                    <AppTextField fullWidth label="Document Title" placeholder="e.g., Unit Test 1 Schedule" value={title} onChange={(e) => setTitle(e.target.value)} required />

                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'var(--text-muted)' }}>Category</InputLabel>
                                        <StyledSelect value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                                            {CATEGORIES.map(c => (
                                                <MenuItem key={c} value={c}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c] }} />
                                                        {c}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </StyledSelect>
                                    </FormControl>

                                    <AppTextField fullWidth label="Description (Optional)" placeholder="Brief note" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} />

                                    <DropZone onClick={() => document.getElementById('teacher-file-input').click()}>
                                        <input id="teacher-file-input" type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />
                                        {selectedFile ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <InsertDriveFileOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 24 }} />
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: '#F5F5FF', fontWeight: 600, fontSize: '0.8rem' }}>{selectedFile.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)' }}>{formatFileSize(selectedFile.size)}</Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <CloudUploadOutlinedIcon sx={{ color: 'rgba(124,77,255,0.5)', fontSize: 32, mb: 1 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 600, fontSize: '0.8rem' }}>Click to select a file</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)' }}>PDF, DOC, XLS, JPG, PNG</Typography>
                                            </Box>
                                        )}
                                    </DropZone>

                                    <AppButton type="submit" variant="contained" disabled={uploading || !selectedFile || !title} sx={{ py: 1.5, background: 'var(--gradient-primary) !important' }}>
                                        {uploading ? <CircularProgress size={22} color="inherit" /> : 'Upload Document'}
                                    </AppButton>
                                </Stack>
                            </form>
                        </GlassCard>
                    </Grid>

                    {/* List */}
                    <Grid item xs={12} md={7}>
                        <GlassCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <IconBadge><FolderOpenOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} /></IconBadge>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>Uploaded Documents</Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>{documents.length} file{documents.length !== 1 ? 's' : ''}</Typography>
                                    </Box>
                                </Box>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <StyledSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} sx={{ fontSize: '0.8rem' }}>
                                        <MenuItem value="All">All</MenuItem>
                                        {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                    </StyledSelect>
                                </FormControl>
                            </Box>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: 'var(--primary)' }} /></Box>
                            ) : filteredDocs.length === 0 ? (
                                <EmptyState>
                                    <DescriptionOutlinedIcon sx={{ fontSize: 40, color: 'rgba(124,77,255,0.3)', mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 600 }}>No documents yet</Typography>
                                </EmptyState>
                            ) : (
                                <DocList>
                                    {filteredDocs.map((doc, idx) => (
                                        <DocCard key={doc._id || idx} delay={idx * 0.04}>
                                            <CategoryStripe color={CATEGORY_COLORS[doc.category] || '#94A3B8'} />
                                            <Box sx={{ flex: 1, minWidth: 0, p: '14px 16px' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#F5F5FF', fontSize: '0.85rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</Typography>
                                                    <Chip label={doc.category} size="small" sx={{ background: `${CATEGORY_COLORS[doc.category]}14`, color: CATEGORY_COLORS[doc.category], border: `1px solid ${CATEGORY_COLORS[doc.category]}30`, fontWeight: 700, fontSize: '0.6rem', height: 22, flexShrink: 0 }} />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                                                        {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                                                <IconButton size="small" onClick={() => handleDelete(doc._id)} sx={{ color: 'rgba(248,113,113,0.5)', '&:hover': { color: '#F87171', background: 'rgba(248,113,113,0.08)' } }}>
                                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        </DocCard>
                                    ))}
                                </DocList>
                            )}
                        </GlassCard>
                    </Grid>
                </Grid>
            )}

            {tabIndex === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <GlassCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <IconBadge>
                                    <PeopleAltOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </IconBadge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        Bulk Upload Marksheets
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                        Upload PDFs named by student roll number (e.g. 2022027.pdf)
                                    </Typography>
                                </Box>
                            </Box>

                            <form onSubmit={handleBulkUpload}>
                                <Stack spacing={2.5}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'var(--text-muted)' }}>Semester</InputLabel>
                                        <StyledSelect value={semester} label="Semester" onChange={(e) => setSemester(e.target.value)}>
                                            {[1,2,3,4,5,6,7,8].map(s => <MenuItem key={s} value={s.toString()}>Semester {s}</MenuItem>)}
                                        </StyledSelect>
                                    </FormControl>

                                    <DropZone onClick={() => document.getElementById('bulk-file-input').click()}>
                                        <input id="bulk-file-input" type="file" hidden multiple accept=".pdf" onChange={handleBulkFileSelect} />
                                        {bulkFiles.length > 0 ? (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" sx={{ color: '#F5F5FF', fontWeight: 600, fontSize: '1rem', mb: 1 }}>{bulkFiles.length} files selected</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)' }}>Ready to upload for Semester {semester}</Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center' }}>
                                                <CloudUploadOutlinedIcon sx={{ color: 'rgba(124,77,255,0.5)', fontSize: 32, mb: 1 }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 600, fontSize: '0.8rem' }}>Click to select multiple PDFs</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)' }}>Name files by roll number (e.g. 2022027.pdf)</Typography>
                                            </Box>
                                        )}
                                    </DropZone>

                                    <AppButton type="submit" variant="contained" disabled={bulkUploading || bulkFiles.length === 0} sx={{ py: 1.5, background: 'var(--gradient-primary) !important' }}>
                                        {bulkUploading ? <CircularProgress size={22} color="inherit" /> : `Upload ${bulkFiles.length} Marksheets`}
                                    </AppButton>
                                </Stack>
                            </form>
                        </GlassCard>
                    </Grid>
                </Grid>
            )}

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default TeacherDocuments;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 28px;
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  @media (max-width: 600px) { padding: 20px; border-radius: 16px; }
`;

const IconBadge = styled(Box)`
  width: 38px; height: 38px; border-radius: 10px;
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.15);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const StyledSelect = styled(Select)`
  border-radius: 14px !important; color: white !important;
  & .MuiOutlinedInput-notchedOutline { border-color: var(--border) !important; }
  &:hover .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; }
  &.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; }
  & .MuiSelect-select { padding: 14px !important; }
  & .MuiSvgIcon-root { color: rgba(226,232,255,0.4); }
`;

const DropZone = styled(Box)`
  border: 2px dashed rgba(124, 77, 255, 0.2); border-radius: 14px; padding: 24px 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease; background: rgba(124, 77, 255, 0.02); min-height: 80px;
  &:hover { border-color: rgba(124, 77, 255, 0.4); background: rgba(124, 77, 255, 0.05); }
`;

const DocList = styled.div`
  display: flex; flex-direction: column; gap: 8px; max-height: 520px;
  overflow-y: auto; padding-right: 4px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(124, 77, 255, 0.2); border-radius: 10px; }
`;

const DocCard = styled.div`
  display: flex; align-items: stretch; border-radius: 12px; overflow: hidden;
  background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(124, 77, 255, 0.06);
  animation: ${fadeUp} 0.35s ${p => p.delay || 0}s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.2s ease;
  &:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(124, 77, 255, 0.15); }
`;

const CategoryStripe = styled.div`
  width: 3px; background: ${p => p.color || 'var(--primary)'}; flex-shrink: 0; opacity: 0.7;
`;

const EmptyState = styled(Box)`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(124, 77, 255, 0.12); border-radius: 14px;
`;
