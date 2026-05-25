import { useEffect, useState, Fragment } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip, CircularProgress, Typography, Grid, Paper, Chip } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import styled, { keyframes } from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { api } from '../../../api/client';

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);

  const adminID = currentUser?._id;

  useEffect(() => {
    if (adminID) {
      dispatch(getAllSclasses(adminID, "Sclass"));
    }
  }, [adminID, dispatch]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [promoting, setPromoting] = useState(false);

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
        setMessage("Operation completed successfully");
        setShowPopup(true);
      })
      .catch(() => {
        setMessage("Failed to delete class");
        setShowPopup(true);
      });
  };

  const handlePromoteBatch = async (batchName) => {
    if (!window.confirm(`Are you sure you want to promote all sections in Batch ${batchName} to the next semester?`)) return;
    
    setPromoting(true);
    try {
        const result = await api.post(`/Sclass/Promote`, {
            batch: batchName,
            adminID: adminID
        });
        setMessage(result.data.message || "Batch promoted successfully");
        setShowPopup(true);
        dispatch(getAllSclasses(adminID, "Sclass"));
    } catch (err) {
        console.error(err);
        setMessage("Failed to promote batch. Check server logs.");
        setShowPopup(true);
    } finally {
        setPromoting(false);
    }
  };

  // Group classes by batch
  const groupedClasses = sclassesList && Array.isArray(sclassesList) ? sclassesList.reduce((acc, curr) => {
    const batch = curr.batch || "Legacy / Unassigned";
    if (!acc[batch]) acc[batch] = [];
    acc[batch].push(curr);
    return acc;
  }, {}) : {};

  const sclassColumns = [
    { id: 'name', label: 'Section Name', minWidth: 100 },
    { id: 'year', label: 'Academic Year', minWidth: 100 },
    { id: 'semester', label: 'Semester', minWidth: 100 },
  ];

  const SclassButtonHaver = ({ row }) => {
    const actions = [
      { icon: <PostAddIcon />, name: 'Add Subjects', action: () => navigate("/Admin/addsubject/" + row.id) },
      { icon: <PersonAddAlt1Icon />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
    ];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => deleteHandler(row.id, "Sclass")} size="small">
          <DeleteIcon color="error" sx={{ fontSize: 20 }} />
        </IconButton>
        <AppButton 
            variant="contained" 
            size="small"
            onClick={() => navigate("/Admin/classes/class/" + row.id)}
        >
          View
        </AppButton>
        <ActionMenu actions={actions} />
      </Box>
    );
  };

  const ActionMenu = ({ actions }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    return (
      <Fragment>
          <IconButton
            size="small"
            sx={{ border: '1px solid var(--border)' }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <SpeedDialIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 8,
            sx: { 
                borderRadius: '16px', 
                mt: 1, 
                minWidth: 180,
                background: 'var(--bg-surface) !important',
                border: '1px solid var(--border)',
                '& .MuiMenuItem-root': {
                    color: 'white',
                    py: 1.5,
                    '&:hover': { background: 'rgba(255,255,255,0.05)' }
                }
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {actions.map((action, index) => (
            <MenuItem key={index} onClick={action.action}>
              <ListItemIcon sx={{ minWidth: 32, color: 'var(--primary-light)' }}>
                {action.icon}
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{action.name}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Fragment>
    );
  }

  const globalActions = [
    { icon: <AddCardIcon />, name: 'Add New Section', action: () => navigate("/Admin/addclass") },
    { icon: <DeleteIcon />, name: 'Wipe All Data', action: () => deleteHandler(adminID, "Sclasses") },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
        <AppHeader 
            title="Institutional Batches" 
            subtitle="Manage academic sections and track semester-wise progression." 
            rightSide={
                <AppButton 
                    variant="contained" 
                    startIcon={<AddCardIcon />}
                    onClick={() => navigate("/Admin/addclass")}
                    sx={{ background: 'var(--gradient-primary) !important', borderRadius: '10px' }}
                >
                    Establish Section
                </AppButton>
            }
        />
        
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: 'var(--primary)' }} />
            </Box>
        ) : (
            <Box sx={{ mt: 3 }}>
                {Object.keys(groupedClasses).length === 0 ? (
                    <EmptyStateBox className="fade-in">
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(124, 77, 255, 0.06)', display: 'flex', alignItems: 'center', justify: 'center', mb: 2, border: '1px solid rgba(124, 77, 255, 0.12)' }}>
                            <SchoolOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 32 }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#F5F5FF', mb: 1, fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>
                            No Active Batches
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(226, 232, 255, 0.4)', mb: 3, maxWidth: 300, textAlign: 'center', fontSize: '0.875rem' }}>
                            Create your first academic sections to track courses, students, and semester grades.
                        </Typography>
                        <AppButton variant="contained" onClick={() => navigate("/Admin/addclass")} sx={{ background: 'var(--gradient-primary) !important', borderRadius: '10px' }}>
                            Establish Your First Section
                        </AppButton>
                    </EmptyStateBox>
                ) : (
                    <Grid container spacing={3}>
                        {Object.entries(groupedClasses).map(([batchName, classes]) => (
                            <Grid item xs={12} key={batchName}>
                                <PremiumBatchCard className="fade-in">
                                    <BatchHeader>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <IconBadge>
                                                <SchoolOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                            </IconBadge>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px', fontFamily: 'Plus Jakarta Sans' }}>
                                                    Batch {batchName}
                                                </Typography>
                                                <StatusChip 
                                                    label={`${classes.length} Active ${classes.length === 1 ? 'Section' : 'Sections'}`} 
                                                    size="small" 
                                                />
                                            </Box>
                                        </Box>
                                        <AppButton 
                                            variant="outlined" 
                                            startIcon={promoting ? <CircularProgress size={16} /> : <TrendingUpIcon />}
                                            onClick={() => handlePromoteBatch(batchName)}
                                            disabled={promoting}
                                            sx={{ 
                                                borderColor: 'rgba(124, 77, 255, 0.3)', 
                                                color: '#B07AFE', 
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderColor: 'rgba(124, 77, 255, 0.5)',
                                                    background: 'rgba(124, 77, 255, 0.04)'
                                                }
                                            }}
                                        >
                                            Promote Semester
                                        </AppButton>
                                    </BatchHeader>
                                    
                                    <TableWrapper>
                                        <TableTemplate 
                                            buttonHaver={SclassButtonHaver} 
                                            columns={sclassColumns} 
                                            rows={classes.map(s => ({
                                                name: s.sclassName,
                                                year: `${s.year}${s.year === 1 ? 'st' : s.year === 2 ? 'nd' : s.year === 3 ? 'rd' : 'th'} Year`,
                                                semester: `Sem ${s.semester}`,
                                                id: s._id
                                            }))} 
                                        />
                                    </TableWrapper>
                                </PremiumBatchCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
                <SpeedDialTemplate actions={globalActions} />
            </Box>
        )}
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Box>
  );
};

export default ShowClasses;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PremiumBatchCard = styled(Paper)`
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 24px !important;
  border: 1px solid rgba(124, 77, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  padding: 28px !important;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: rgba(124, 77, 255, 0.16) !important;
    background: rgba(255, 255, 255, 0.04) !important;
    box-shadow: 0 16px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08) !important;
  }

  @media (max-width: 600px) {
    padding: 18px !important;
    border-radius: 16px !important;
  }
`;

const BatchHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const IconBadge = styled(Box)`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(124, 77, 255, 0.08);
  border: 1px solid rgba(124, 77, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatusChip = styled(Chip)`
  background: rgba(124, 77, 255, 0.12) !important;
  color: #B07AFE !important;
  border: 1px solid rgba(124, 77, 255, 0.2) !important;
  font-family: 'Inter', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.6875rem !important;
  height: 20px !important;
  margin-top: 4px;
`;

const TableWrapper = styled(Box)`
  & > div {
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    background: rgba(255, 255, 255, 0.01) !important;
    box-shadow: none !important;
    border-radius: 16px !important;
  }
`;

const EmptyStateBox = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06);
  border-radius: 24px !important;
  border: 1px solid rgba(124, 77, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
  padding: 40px !important;
  box-sizing: border-box;
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
`;