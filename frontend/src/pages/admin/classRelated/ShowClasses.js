import { useEffect, useState, Fragment } from 'react';
import { IconButton, Box, Menu, MenuItem, ListItemIcon, Tooltip, Container, CircularProgress } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
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
    setMessage("Sorry the delete function has been disabled for now.");
    setShowPopup(true);
  };

  const sclassColumns = [
    { id: 'name', label: 'Class Name', minWidth: 170 },
  ];

  const sclassRows = sclassesList && sclassesList.length > 0 && sclassesList.map((sclass) => ({
    name: sclass.sclassName,
    id: sclass._id,
  }));

  const SclassButtonHaver = ({ row }) => {
    const actions = [
      { icon: <PostAddIcon />, name: 'Add Subjects', action: () => navigate("/Admin/addsubject/" + row.id) },
      { icon: <PersonAddAlt1Icon />, name: 'Add Student', action: () => navigate("/Admin/class/addstudents/" + row.id) },
    ];
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <IconButton onClick={() => deleteHandler(row.id, "Sclass")} size="small">
          <DeleteIcon color="error" />
        </IconButton>
        <AppButton 
            variant="contained" 
            color="secondary" 
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
        <Tooltip title="Manage Students & Subjects">
          <AppButton
            variant="outlined"
            size="small"
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
            sx: { borderRadius: '12px', mt: 1, minWidth: 180 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {actions.map((action, index) => (
            <MenuItem key={index} onClick={action.action}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {action.icon}
              </ListItemIcon>
              <Typography variant="body2">{action.name}</Typography>
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <AppHeader 
            title="Class Management" 
            subtitle="Organize your institution's classes and their academic structures." 
        />
        
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        ) : (
            <Box sx={{ mt: 2 }}>
                {getresponse ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                        <Typography variant="h6" color="textSecondary">No classes found.</Typography>
                        <AppButton variant="contained" color="primary" onClick={() => navigate("/Admin/addclass")}>
                            Create Your First Class
                        </AppButton>
                    </Box>
                ) : (
                    <>
                        {Array.isArray(sclassesList) && sclassesList.length > 0 && (
                            <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
                        )}
                        <SpeedDialTemplate actions={actions} />
                    </>
                )}
            </Box>
        )}
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  );
};

export default ShowClasses;

const Typography = ({ children, variant, sx, color }) => (
    <Box component="div" sx={{ typography: variant, color, ...sx }}>{children}</Box>
);