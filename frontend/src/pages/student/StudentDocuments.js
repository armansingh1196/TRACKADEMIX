import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Chip, Tabs, Tab, TextField, InputAdornment, IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { api } from '../../api/client';
import AppHeader from '../../components/common/AppHeader';
import AppButton from '../../components/common/AppButton';

import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

const CATEGORIES = ['Exam Schedule', 'Exam Form', 'Important Notice', 'Syllabus', 'General'];

const CATEGORY_COLORS = {
    'Exam Schedule': '#FBBF24',
    'Exam Form': '#60A5FA',
    'Important Notice': '#F87171',
    'Syllabus': '#A78BFA',
    'General': '#94A3B8'
};

const CATEGORY_ICONS = {
    'Exam Schedule': <EventNoteOutlinedIcon sx={{ fontSize: 18 }} />,
    'Exam Form': <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />,
    'Important Notice': <CampaignOutlinedIcon sx={{ fontSize: 18 }} />,
    'Syllabus': <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />,
    'General': <WidgetsOutlinedIcon sx={{ fontSize: 18 }} />
};

const StudentDocuments = () => {
    const { currentUser } = useSelector((state) => state.user);
    const adminID = currentUser?.school?._id || currentUser?.school;
    const classID = currentUser?.sclassName?._id || currentUser?.sclassName;

    const [tabIndex, setTabIndex] = useState(0);

    // General Docs
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

    // Personal Docs
    const [personalDocs, setPersonalDocs] = useState([]);
    const [isVerified, setIsVerified] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');

    useEffect(() => {
        if (adminID && classID) fetchDocuments();
    }, [adminID, classID]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/DocumentListStudent/${adminID}/${classID}`);
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

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!password) return;
        setVerifyLoading(true);
        setVerifyError('');
        try {
            const res = await api.post('/VerifyAndFetchPersonalDocs', {
                studentId: currentUser._id,
                password
            });
            if (res.data.message && (res.data.message === "Invalid password" || res.data.message === "Student not found")) {
                setVerifyError(res.data.message);
            } else if (res.data.message === "No documents found") {
                setIsVerified(true);
                setPersonalDocs([]);
            } else {
                setIsVerified(true);
                setPersonalDocs(res.data);
            }
        } catch (err) {
            setVerifyError("Verification failed. Try again.");
        } finally {
            setVerifyLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    const filteredDocs = filterCategory === 'All' ? documents : documents.filter(d => d.category === filterCategory);

    // Group by category for the summary cards
    const categoryCounts = {};
    CATEGORIES.forEach(c => { categoryCounts[c] = 0; });
    documents.forEach(d => { if (categoryCounts[d.category] !== undefined) categoryCounts[d.category]++; });

    return (
        <Container maxWidth="lg" sx={{ mt: 1, mb: 2 }}>
            <AppHeader
                title="Documents"
                subtitle="Access marksheets, exam schedules, and important institutional documents."
            />

            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3, mt: 2 }}>
                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{
                    '& .MuiTab-root': { color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'none' },
                    '& .Mui-selected': { color: '#F5F5FF' },
                    '& .MuiTabs-indicator': { backgroundColor: 'var(--primary)' }
                }}>
                    <Tab label="General Documents" />
                    <Tab label="My Marksheets" />
                </Tabs>
            </Box>

            {tabIndex === 0 && (
                <>
                    {/* Category Summary Cards */}
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                        {CATEGORIES.map(cat => (
                            <Grid item xs={6} sm={4} md={2} key={cat}>
                                <CategoryCard
                                    active={filterCategory === cat ? 'true' : 'false'}
                                    color={CATEGORY_COLORS[cat]}
                                    onClick={() => setFilterCategory(filterCategory === cat ? 'All' : cat)}
                                >
                                    <Box sx={{ color: CATEGORY_COLORS[cat], display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        {CATEGORY_ICONS[cat]}
                                    </Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#F5F5FF', fontSize: '0.7rem', letterSpacing: '-0.01em' }}>
                                        {cat}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.3)', fontSize: '0.65rem' }}>
                                        {categoryCounts[cat]} file{categoryCounts[cat] !== 1 ? 's' : ''}
                                    </Typography>
                                </CategoryCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Documents */}
                    <GlassCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <IconBadge>
                                    <FolderOpenOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                </IconBadge>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        {filterCategory === 'All' ? 'All Documents' : filterCategory}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                        {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} available
                                    </Typography>
                                </Box>
                            </Box>
                            {filterCategory !== 'All' && (
                                <Chip
                                    label="Show All"
                                    size="small"
                                    onClick={() => setFilterCategory('All')}
                                    sx={{
                                        background: 'rgba(124,77,255,0.1)',
                                        color: 'var(--primary)',
                                        border: '1px solid rgba(124,77,255,0.2)',
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        '&:hover': { background: 'rgba(124,77,255,0.2)' }
                                    }}
                                />
                            )}
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
                                <CircularProgress size={36} sx={{ color: 'var(--primary)' }} />
                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontWeight: 500 }}>Loading documents...</Typography>
                            </Box>
                        ) : filteredDocs.length === 0 ? (
                            <EmptyState>
                                <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'rgba(124,77,255,0.25)', mb: 1.5 }} />
                                <Typography variant="body1" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 700, mb: 0.5 }}>
                                    No Documents Available
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.3)', fontSize: '0.8rem' }}>
                                    Documents uploaded by your institution will appear here.
                                </Typography>
                            </EmptyState>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredDocs.map((doc, idx) => (
                                    <Grid item xs={12} sm={6} key={doc._id || idx}>
                                        <DocumentCard delay={idx * 0.05}>
                                            <CategoryStripe color={CATEGORY_COLORS[doc.category] || '#94A3B8'} />
                                            <Box sx={{ flex: 1, minWidth: 0, p: '16px 18px' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                    <FileIcon color={CATEGORY_COLORS[doc.category]}>
                                                        {CATEGORY_ICONS[doc.category] || <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} />}
                                                    </FileIcon>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#F5F5FF', fontSize: '0.85rem', mb: 0.3, lineHeight: 1.3 }}>
                                                            {doc.title}
                                                        </Typography>
                                                        <Chip
                                                            label={doc.category}
                                                            size="small"
                                                            sx={{
                                                                background: `${CATEGORY_COLORS[doc.category]}14`,
                                                                color: CATEGORY_COLORS[doc.category],
                                                                border: `1px solid ${CATEGORY_COLORS[doc.category]}25`,
                                                                fontWeight: 700,
                                                                fontSize: '0.58rem',
                                                                height: 20,
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {doc.description && (
                                                    <Typography variant="caption" sx={{ color: 'rgba(226,232,255,0.45)', display: 'block', mb: 1, lineHeight: 1.4, fontSize: '0.75rem' }}>
                                                        {doc.description}
                                                    </Typography>
                                                )}

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                    <MetaItem>
                                                        <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                                                        {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </MetaItem>
                                                    {doc.uploaded_by && (
                                                        <MetaItem>
                                                            <PersonOutlineRoundedIcon sx={{ fontSize: 12 }} />
                                                            {doc.uploaded_by}
                                                        </MetaItem>
                                                    )}
                                                    {doc.file_size && (
                                                        <MetaItem>{formatFileSize(doc.file_size)}</MetaItem>
                                                    )}
                                                </Box>

                                                <Box sx={{ mt: 1.5 }}>
                                                    <DownloadButton onClick={() => window.open(doc.file_url, '_blank')}>
                                                        <DownloadRoundedIcon sx={{ fontSize: 15 }} />
                                                        Download
                                                    </DownloadButton>
                                                </Box>
                                            </Box>
                                        </DocumentCard>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </GlassCard>
                </>
            )}

            {tabIndex === 1 && (
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8}>
                        <GlassCard>
                            {!isVerified ? (
                                <Box sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
                                    <LockBadge>
                                        <LockOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                                    </LockBadge>
                                    <Typography variant="h5" sx={{ color: '#F5F5FF', fontWeight: 800, mb: 1 }}>
                                        Secure Access
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.5)', mb: 4, lineHeight: 1.6 }}>
                                        Your marksheets are confidential. Please enter your account password to verify your identity.
                                    </Typography>

                                    <form onSubmit={handleVerify}>
                                        <StyledTextField
                                            fullWidth
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <VpnKeyOutlinedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            sx={{ color: 'rgba(255,255,255,0.3)' }}
                                                        >
                                                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={{ mb: 3 }}
                                        />

                                        {verifyError && (
                                            <Typography variant="caption" sx={{ color: '#F87171', display: 'block', mb: 2, textAlign: 'left' }}>
                                                {verifyError}
                                            </Typography>
                                        )}

                                        <AppButton type="submit" fullWidth disabled={verifyLoading || !password} sx={{ py: 1.5 }}>
                                            {verifyLoading ? <CircularProgress size={24} color="inherit" /> : 'Unlock Marksheets'}
                                        </AppButton>
                                    </form>
                                </Box>
                            ) : (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <IconBadge sx={{ background: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.2)' }}>
                                                <SchoolOutlinedIcon sx={{ color: '#34D399', fontSize: 20 }} />
                                            </IconBadge>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                                    My Marksheets
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.4)', fontSize: '0.75rem' }}>
                                                    Confidential • {currentUser.name} ({currentUser.rollNum})
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <AppButton variant="outlined" onClick={() => setIsVerified(false)} sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                            Lock Session
                                        </AppButton>
                                    </Box>

                                    {personalDocs.length === 0 ? (
                                        <EmptyState>
                                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: 'rgba(52, 211, 153, 0.2)', mb: 1.5 }} />
                                            <Typography variant="body1" sx={{ color: 'rgba(226,232,255,0.5)', fontWeight: 700, mb: 0.5 }}>
                                                No Marksheets Found
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(226,232,255,0.3)', fontSize: '0.8rem' }}>
                                                Your marksheets have not been uploaded yet.
                                            </Typography>
                                        </EmptyState>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {personalDocs.map((doc, idx) => (
                                                <Grid item xs={12} sm={6} key={doc._id || idx}>
                                                    <DocumentCard delay={idx * 0.05} sx={{ borderLeft: '3px solid #34D399' }}>
                                                        <Box sx={{ flex: 1, minWidth: 0, p: '16px 18px' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                                <FileIcon color="#34D399">
                                                                    <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
                                                                </FileIcon>
                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#F5F5FF', fontSize: '0.85rem', mb: 0.3, lineHeight: 1.3 }}>
                                                                        {doc.title}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={`Semester ${doc.semester}`}
                                                                        size="small"
                                                                        sx={{
                                                                            background: `#34D39914`,
                                                                            color: '#34D399',
                                                                            border: `1px solid #34D39925`,
                                                                            fontWeight: 700,
                                                                            fontSize: '0.58rem',
                                                                            height: 20,
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                                                                <MetaItem>
                                                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
                                                                    {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </MetaItem>
                                                                {doc.file_size && (
                                                                    <MetaItem>{formatFileSize(doc.file_size)}</MetaItem>
                                                                )}
                                                            </Box>

                                                            <Box sx={{ mt: 1.5 }}>
                                                                <DownloadButton onClick={() => window.open(doc.file_url, '_blank')} style={{ color: '#34D399', background: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.2)' }}>
                                                                    <DownloadRoundedIcon sx={{ fontSize: 15 }} />
                                                                    Download PDF
                                                                </DownloadButton>
                                                            </Box>
                                                        </Box>
                                                    </DocumentCard>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
                            )}
                        </GlassCard>
                    </Grid>
                </Grid>
            )}

        </Container>
    );
};

export default StudentDocuments;

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

const LockBadge = styled(Box)`
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(124, 77, 255, 0.05);
  border: 1px solid rgba(124, 77, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(124, 77, 255, 0.1);
`;

const CategoryCard = styled(Box)`
  background: ${p => p.active === 'true' ? `${p.color}10` : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid ${p => p.active === 'true' ? `${p.color}30` : 'rgba(124, 77, 255, 0.06)'};
  border-radius: 14px;
  padding: 14px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
  text-align: center;
  animation: ${fadeUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  &:hover {
    background: ${p => `${p.color}08`};
    border-color: ${p => `${p.color}25`};
    transform: translateY(-2px);
  }
`;

const DocumentCard = styled(Box)`
  display: flex;
  align-items: stretch;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(124, 77, 255, 0.06);
  animation: ${fadeUp} 0.4s ${p => p.delay || 0}s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.25s ease;
  height: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(124, 77, 255, 0.18);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
`;

const CategoryStripe = styled.div`
  width: 3px;
  background: ${p => p.color || 'var(--primary)'};
  flex-shrink: 0;
  opacity: 0.7;
`;

const FileIcon = styled(Box)`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${p => `${p.color}12`};
  border: 1px solid ${p => `${p.color}25`};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.color};
`;

const MetaItem = styled(Typography)`
  && {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.68rem;
    color: rgba(226, 232, 255, 0.3);
    font-weight: 500;
  }
`;

const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.2);
  color: var(--primary);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    border-color: rgba(124, 77, 255, 0.35);
    transform: translateY(-1px);
  }
`;

const EmptyState = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(124, 77, 255, 0.12);
  border-radius: 14px;
  text-align: center;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    color: white;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
  }
  & .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.1);
  }
  & .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(124, 77, 255, 0.5);
  }
  & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: var(--primary);
    border-width: 2px;
  }
  & input::placeholder {
    color: rgba(255, 255, 255, 0.3);
    opacity: 1;
  }
`;
