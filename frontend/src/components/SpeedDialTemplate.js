import React from 'react'
import { SpeedDial, SpeedDialAction, styled, Zoom } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const SpeedDialTemplate = ({ actions }) => {
    return (
        <CustomSpeedDial
            ariaLabel="Action SpeedDial"
            icon={<AddIcon sx={{ fontSize: 28 }} />}
            direction="up"
            TransitionComponent={Zoom}
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                    FabProps={{
                        sx: {
                            bgcolor: 'var(--bg-surface)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'var(--primary)',
                            }
                        }
                    }}
                />
            ))}
        </CustomSpeedDial>
    )
}

export default SpeedDialTemplate

const CustomSpeedDial = styled(SpeedDial)`
  position: fixed;
  bottom: 32px;
  right: 32px;
  
  .MuiSpeedDial-fab {
    background: var(--gradient-primary);
    box-shadow: 0 8px 32px rgba(132, 94, 194, 0.4);
    width: 64px;
    height: 64px;
    
    &:hover {
      background: var(--gradient-primary);
      transform: scale(1.1) rotate(90deg);
      box-shadow: 0 12px 40px rgba(132, 94, 194, 0.6);
    }
    
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;