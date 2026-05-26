import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, CircularProgress, Chip, Select, MenuItem, FormControl } from '@mui/material';
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

const CATEGORIES = ['Marksheet', 'Exam Schedule', 'Exam Form', 'Important Notice', 'Syllabus', 'General'];

const CATEGORY_COLORS = {
    'Marksheet': '#34D399',
    'Exam Schedule': '#FBBF24',
    'Exam Form': '#60A5FA',
    'Important Notice': '#F87171',
    'Syllabus': '#A78BFA',
    'General': '#94A3B8'
};

const CATEGORY_ICONS = {
    'Marksheet': <SchoolOutlinedIcon sx={{ fontSize: 18 }} />,
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

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

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

const DocumentCard = styled.div`
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
