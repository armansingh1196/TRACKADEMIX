import { useEffect, useState, Fragment } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip, Container, CircularProgress, Typography, Grid, Paper } from '@mui/material';
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

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sclassesList, loading, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector(state => state.user);

  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

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

  const sclassColumns = [
    { id: 'name', label: 'Class Name', minWidth: 100 },
    { id: 'batch', label: 'Batch', minWidth: 120 },
    { id: 'year', label: 'Year', minWidth: 100 },
    { id: 'semester', label: 'Semester', minWidth: 100 },
  ];

  const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => ({
    name: sclass.sclassName,
    batch: sclass.batch || "N/A",
    year: sclass.year ? `${sclass.year}${sclass.year === 1 ? 'st' : sclass.year === 2 ? 'nd' : sclass.year === 3 ? 'rd' : 'th'} Year` : "N/A",
    semester: sclass.semester ? `Sem ${sclass.semester}` : "N/A",
    id: sclass._id,
  }));


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
          View Details
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
        <Tooltip title="Manage Students & Subjects">
          <AppButton
            variant="outlined"
            size="small"
            sx={{ borderColor: 'var(--border)', color: 'white' }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            endIcon={<SpeedDialIcon sx={{ fontSize: '16px !important' }} />}
          >
            Manage
          </AppButton>
        </Tooltip>
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

  const actions = [
    { icon: <AddCardIcon />, name: 'Add New Class', action: () => navigate("/Admin/addclass") },
    { icon: <DeleteIcon />, name: 'Delete All Classes', action: () => deleteHandler(adminID, "Sclasses") },
  ];

  return (
    <Box sx={{ p: 4 }}>
        <AppHeader 
            title="Class Management" 
            subtitle="Organize your institution's classes and their academic structures." 
        />
        
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: 'var(--primary)' }} />
            </Box>
        ) : (
            <Box sx={{ mt: 4 }}>
                {getresponse ? (
                    <EmptyStateBox>
                        <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                            No academic classes have been defined yet.
                        </Typography>
                        <AppButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                            Create Your First Class
                        </AppButton>
                    </EmptyStateBox>
                ) : (
                    <GlassCard>
                        {Array.isArray(sclassesList) && sclassesList.length > 0 && (
                            <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
                        )}
                        <SpeedDialTemplate actions={actions} />
                    </GlassCard>
                )}
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
  border-radius: 24px !important;
  overflow: hidden;
`;

const EmptyStateBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 32px;
  border: 2px dashed var(--border);
`;