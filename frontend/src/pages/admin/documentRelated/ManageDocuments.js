import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel, Stack, IconButton, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { api } from '../../../api/client';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import AppTextField from '../../../components/common/AppTextField';
import Popup from '../../../components/Popup';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

const CATEGORIES = ['Marksheet', 'Exam Schedule', 'Exam Form', 'Important Notice', 'Syllabus', 'General'];

const CATEGORY_COLORS = {
    'Marksheet': '#34D399',
    'Exam Schedule': '#FBBF24',
    'Exam Form': '#60A5FA',
    'Important Notice': '#F87171',
    'Syllabus': '#A78BFA',
    'General': '#94A3B8'
};

const ManageDocuments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser?._id;

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');

    // Upload form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [classList, setClassList] = useState([]);
    const [targetClass, setTargetClass] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    useEffect(() => {
        fetchDocuments();
        fetchClasses();
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

    const fetchClasses = async () => {
        try {
            const res = await api.get(`/SclassList/${adminID}`);
            if (!res.data.message) {
                setClassList(res.data);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
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
            // Step 1: Get signed upload URL
            const urlRes = await api.post('/DocumentUploadUrl', {
                fileName: selectedFile.name,
                fileType: selectedFile.type
            });
            
            const { signedUrl, token, path, publicUrl } = urlRes.data;

            // Step 2: Upload file directly to Supabase Storage
            await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': selectedFile.type },
                body: selectedFile
            });

            // Step 3: Save document metadata
            await api.post('/DocumentUpload', {
                title,
                category,
                description,
                file_url: publicUrl,
                file_name: selectedFile.name,
                file_size: selectedFile.size,
                uploaded_by: currentUser?.name || 'Admin',
                uploader_role: 'Admin',
                admin_id: adminID,
                target_class: targetClass || null
            });

            setMessage("Document uploaded successfully!");
            setShowPopup(true);
            setTitle('');
            setCategory('General');
            setDescription('');
            setSelectedFile(null);
            setTargetClass('');
            fetchDocuments();
        } catch (err) {
            console.error("Upload error:", err);
            setMessage("Failed to upload document. Please try again.");
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

    const filteredDocs = filterCategory === 'All'
        ? documents
        : documents.filter(d => d.category === filterCategory);

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <AppHeader
                title="Document Management"
                subtitle="Upload and manage marksheets, exam schedules, and important documents for students."
            />

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Upload Form */}
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
                                    Distribute files to students
                                </Typography>
                            </Box>
                        </Box>

                        <form onSubmit={handleUpload}>
                            <Stack spacing={2.5}>
                                <AppTextField
                                    fullWidth
                                    label="Document Title"
                                    placeholder="e.g., Semester 3 Marksheet"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />

                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: 'var(--text-muted)' }}>Category</InputLabel>
                                    <StyledSelect
                                        value={category}
                                        label="Category"
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
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

                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: 'var(--text-muted)' }}>Target Class (Optional)</InputLabel>
                                    <StyledSelect
                                        value={targetClass}
                                        label="Target Class (Optional)"
                                        onChange={(e) => setTargetClass(e.target.value)}
                                    >
                                        <MenuItem value="">All Classes</MenuItem>
                                        {classList.map(cls => (
                                            <MenuItem key={cls._id} value={cls._id}>{cls.sclassName}</MenuItem>
                                        ))}
                                    </StyledSelect>
                                </FormControl>

                                <AppTextField
                                    fullWidth
                                    label="Description (Optional)"
                                    placeholder="Brief description of the document"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={2}
                                />

                                <DropZone onClick={() => document.getElementById('file-input').click()}>
                                    <input
                                        id="file-input"
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                                        onChange={handleFileSelect}
                                    />
                                    {selectedFile ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <InsertDriveFileOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 24 }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ color: '#F5F5FF', fontWeight: 600, fontSize: '0.8rem' }}>
                                                    {selectedFile.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)' }}>
                                                    {formatFileSize(selectedFile.size)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CloudUploadOutlinedIcon sx={{ color: 'rgba(124,77,255,0.5)', fontSize: 32, mb: 1 }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 600, fontSize: '0.8rem' }}>
                                                Click to select a file
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)' }}>
                                                PDF, DOC, XLS, JPG, PNG (Max 10MB)
                                            </Typography>
                                        </Box>
                                    )}
                                </DropZone>

                                <AppButton
                                    type="submit"
                                    variant="contained"
                                    disabled={uploading || !selectedFile || !title}
                                    sx={{ py: 1.5, background: 'var(--gradient-primary) !important' }}
                                >
                                    {uploading ? <CircularProgress size={22} color="inherit" /> : 'Upload Document'}
                                </AppButton>
                            </Stack>
                        </form>
                    </GlassCard>
                </Grid>

                {/* Document List */}
                <Grid item xs={12} md={7}>
                    <GlassCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <IconBadge>
                                    <FolderOpenOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </IconBadge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        All Documents
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                                    </Typography>
                                </Box>
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <StyledSelect
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    displayEmpty
                                    sx={{ fontSize: '0.8rem' }}
                                >
                                    <MenuItem value="All">All Categories</MenuItem>
                                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </StyledSelect>
                            </FormControl>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress sx={{ color: 'var(--primary)' }} />
                            </Box>
                        ) : filteredDocs.length === 0 ? (
                            <EmptyState>
                                <DescriptionOutlinedIcon sx={{ fontSize: 40, color: 'rgba(124,77,255,0.3)', mb: 1 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 600 }}>
                                    No documents uploaded yet
                                </Typography>
                            </EmptyState>
                        ) : (
                            <DocList>
                                {filteredDocs.map((doc, idx) => (
                                    <DocCard key={doc._id || idx} delay={idx * 0.04}>
                                        <CategoryStripe color={CATEGORY_COLORS[doc.category] || '#94A3B8'} />
                                        <Box sx={{ flex: 1, minWidth: 0, p: '14px 16px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#F5F5FF', fontSize: '0.85rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {doc.title}
                                                </Typography>
                                                <Chip
                                                    label={doc.category}
                                                    size="small"
                                                    sx={{
                                                        background: `${CATEGORY_COLORS[doc.category]}14`,
                                                        color: CATEGORY_COLORS[doc.category],
                                                        border: `1px solid ${CATEGORY_COLORS[doc.category]}30`,
                                                        fontWeight: 700,
                                                        fontSize: '0.6rem',
                                                        height: 22,
                                                        flexShrink: 0
                                                    }}
                                                />
                                            </Box>
                                            {doc.description && (
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.4)', display: 'block', mb: 0.5, lineHeight: 1.3 }}>
                                                    {doc.description}
                                                </Typography>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                                                    {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </Typography>
                                                {doc.file_name && (
                                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)' }}>
                                                        {doc.file_name}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(doc._id)}
                                                sx={{ color: 'rgba(248,113,113,0.5)', '&:hover': { color: '#F87171', background: 'rgba(248,113,113,0.08)' } }}
                                            >
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

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ManageDocuments;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GlassCard = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 20px;
  border: 1px solid rgba(124, 77, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 28px;
  animation: ${fadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;

  @media (max-width: 600px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const IconBadge = styled(Box)`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StyledSelect = styled(Select)`
  border-radius: 14px !important;
  color: white !important;
  & .MuiOutlinedInput-notchedOutline { border-color: var(--border) !important; }
  &:hover .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; }
  &.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; border-width: 2px !important; }
  & .MuiSelect-select { padding: 14px !important; }
  & .MuiSvgIcon-root { color: rgba(226,232,255,0.4); }
`;

const DropZone = styled(Box)`
  border: 2px dashed rgba(124, 77, 255, 0.2);
  border-radius: 14px;
  padding: 24px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: rgba(124, 77, 255, 0.02);
  min-height: 80px;

  &:hover {
    border-color: rgba(124, 77, 255, 0.4);
    background: rgba(124, 77, 255, 0.05);
  }
`;

const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(124, 77, 255, 0.2);
    border-radius: 10px;
  }
`;

const DocCard = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(124, 77, 255, 0.06);
  animation: ${fadeUp} 0.35s ${p => p.delay || 0}s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(124, 77, 255, 0.15);
  }
`;

const CategoryStripe = styled.div`
  width: 3px;
  background: ${p => p.color || 'var(--primary)'};
  flex-shrink: 0;
  opacity: 0.7;
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(124, 77, 255, 0.12);
  border-radius: 14px;
`;
