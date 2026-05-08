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
import styled from 'styled-components';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
            <Box sx={{ mt: 2 }}>
                {Object.keys(groupedClasses).length === 0 ? (
                    <EmptyStateBox className="fade-in">
                        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2, fontFamily: 'var(--font-heading)' }}>
                            No active batches found in the system.
                        </Typography>
                        <AppButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                            Establish Your First Section
                        </AppButton>
                    </EmptyStateBox>
                ) : (
                    <Grid container spacing={4}>
                        {Object.entries(groupedClasses).map(([batchName, classes]) => (
                            <Grid item xs={12} key={batchName}>
                                <BatchGroup className="fade-in">
                                    <BatchHeader>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'var(--font-heading)' }}>
                                                Batch {batchName}
                                            </Typography>
                                            <Chip 
                                                label={`${classes.length} Active Sections`} 
                                                size="small" 
                                                sx={{ background: 'rgba(132, 94, 194, 0.1)', color: 'var(--primary)', fontWeight: 700 }} 
                                            />
                                        </Box>
                                        <AppButton 
                                            variant="outlined" 
                                            startIcon={promoting ? <CircularProgress size={16} /> : <TrendingUpIcon />}
                                            onClick={() => handlePromoteBatch(batchName)}
                                            disabled={promoting}
                                            sx={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                        >
                                            Promote Semester
                                        </AppButton>
                                    </BatchHeader>
                                    
                                    <GlassCard sx={{ mt: 2 }}>
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
                                    </GlassCard>
                                </BatchGroup>
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

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 20px !important;
  overflow: hidden;
`;

const BatchGroup = styled(Box)`
  margin-bottom: 8px;
`;

const BatchHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
`;

const EmptyStateBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.01);
  border-radius: 32px;
  border: 2px dashed var(--border);
`;