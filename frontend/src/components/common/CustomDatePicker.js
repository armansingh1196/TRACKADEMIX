import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Popover, IconButton } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CustomDatePicker = ({ date, setDate, label = "Select Date (YYYY-MM-DD)" }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date(date ? date + 'T00:00:00' : Date.now()));

    const openDatePicker = (e) => setAnchorEl(e.currentTarget);
    const closeDatePicker = () => setAnchorEl(null);

    const handleDateSelect = (day) => {
        const yyyy = currentMonth.getFullYear();
        const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        closeDatePicker();
    };

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const blanksArray = Array.from({ length: firstDay });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <>
            <DateTrigger onClick={openDatePicker} hasvalue={!!date ? 1 : 0}>
                {date ? date : label}
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'rgba(200,210,255,0.3)' }} />
            </DateTrigger>
            
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={closeDatePicker}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        background: 'rgba(10, 13, 30, 0.85)',
                        backdropFilter: 'blur(30px)',
                        WebkitBackdropFilter: 'blur(30px)',
                        border: '1px solid rgba(124,77,255,0.2)',
                        borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                        padding: '16px',
                        width: '290px',
                        color: '#F5F5FF'
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <IconButton size="small" onClick={prevMonth} sx={{ color: 'rgba(200,210,255,0.6)' }}><ChevronLeftIcon /></IconButton>
                    <Box sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </Box>
                    <IconButton size="small" onClick={nextMonth} sx={{ color: 'rgba(200,210,255,0.6)' }}><ChevronRightIcon /></IconButton>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1.5, textAlign: 'center' }}>
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <Box key={d} sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(124,77,255,0.7)', textTransform: 'uppercase' }}>{d}</Box>
                    ))}
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px 4px' }}>
                    {blanksArray.map((_, i) => <Box key={`blank-${i}`} />)}
                    {daysArray.map(day => {
                        const yyyy = currentMonth.getFullYear();
                        const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
                        const dd = String(day).padStart(2, '0');
                        const isSelected = date === `${yyyy}-${mm}-${dd}`;
                        
                        return (
                            <DayButton 
                                key={day} 
                                isselected={isSelected ? 1 : 0}
                                onClick={() => handleDateSelect(day)}
                            >
                                {day}
                            </DayButton>
                        );
                    })}
                </Box>
            </Popover>
        </>
    );
};

export default CustomDatePicker;

const inputBase = `
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(124,77,255,0.12);
    border-radius: 13px;
    padding: 11px 14px;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    color: #F5F5FF;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    box-sizing: border-box;

    &:focus {
        border-color: rgba(124,77,255,0.5);
        box-shadow: 0 0 0 3px rgba(124,77,255,0.08);
    }
`;

const DateTrigger = styled.div`
    ${inputBase}
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: ${p => p.hasvalue ? '#F5F5FF' : 'rgba(200,210,255,0.3)'};
    
    &:hover {
        background: rgba(255,255,255,0.05);
    }
`;

const DayButton = styled.div`
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-family: Inter, sans-serif;
    font-weight: ${p => p.isselected ? 800 : 500};
    border-radius: 8px;
    cursor: pointer;
    background: ${p => p.isselected ? 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)' : 'transparent'};
    color: ${p => p.isselected ? '#FFF' : '#F5F5FF'};
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
    
    &:hover {
        background: ${p => p.isselected ? 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)' : 'rgba(124,77,255,0.2)'};
        transform: ${p => p.isselected ? 'none' : 'scale(1.15)'};
    }
`;
