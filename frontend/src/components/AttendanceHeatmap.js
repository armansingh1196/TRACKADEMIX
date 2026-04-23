import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Box, Typography, Tooltip, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import axios from 'axios';

const AttendanceHeatmap = ({ studentID }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(365); // Default to 1 Year

    useEffect(() => {
        const fetchHeatmap = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Student/Heatmap/${studentID}`);
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch heatmap", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, [studentID]);

    const handleRangeChange = (event, newRange) => {
        if (newRange !== null) setRange(newRange);
    };

    // Generate days based on range
    const generateDays = () => {
        const days = [];
        const today = new Date();
        for (let i = range - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const record = data.find(r => r.date === dateStr);
            days.push({
                date: dateStr,
                intensity: record ? (record.count / record.total) : 0,
                present: record ? record.count : 0,
                total: record ? record.total : 0
            });
        }
        return days;
    };

    if (loading && data.length === 0) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
        </Box>
    );

    const days = generateDays();

    return (
        <HeatmapContainer>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 0.5 }}>
                        Attendance Consistency
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        Visualizing daily session participation
                    </Typography>
                </Box>
                
                <StyledTabs
                    value={range}
                    exclusive
                    onChange={handleRangeChange}
                    size="small"
                >
                    <ToggleButton value={30}>1 Month</ToggleButton>
                    <ToggleButton value={90}>3 Months</ToggleButton>
                    <ToggleButton value={180}>6 Months</ToggleButton>
                    <ToggleButton value={365}>1 Year</ToggleButton>
                </StyledTabs>
            </Box>
            
            <GridWrapper range={range}>
                {days.map((day, i) => {
                    const level = day.total === 0 ? 0 : Math.ceil(day.intensity * 4);
                    return (
                        <Tooltip 
                            key={i} 
                            title={`${day.date}: ${day.present}/${day.total} sessions`}
                            arrow
                            disableInteractive
                        >
                            <Cell className={`level-${level}`} />
                        </Tooltip>
                    );
                })}
            </GridWrapper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Legend>
                    <span>Less Frequent</span>
                    <Box className="cell level-0" />
                    <Box className="cell level-1" />
                    <Box className="cell level-2" />
                    <Box className="cell level-3" />
                    <Box className="cell level-4" />
                    <span>More Frequent</span>
                </Legend>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                    Showing last {range} days
                </Typography>
            </Box>
        </HeatmapContainer>
    );
};

export default AttendanceHeatmap;

const HeatmapContainer = styled(Box)`
    padding: 32px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 32px;
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
`;

const GridWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(${props => props.range > 180 ? 53 : props.range > 30 ? 20 : 10}, 1fr);
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    gap: 6px;
    width: 100%;
    overflow-x: auto;
    padding: 10px 0;
    
    /* Custom Scrollbar */
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
    &::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
`;

const Cell = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
        transform: scale(1.15);
        z-index: 10;
        box-shadow: 0 0 8px rgba(132, 94, 194, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.4);
        filter: brightness(1.1);
    }

    &.level-0 { background-color: rgba(255, 255, 255, 0.05); }
    &.level-1 { background-color: #3d2b56; }
    &.level-2 { background-color: #5d3b8e; }
    &.level-3 { background-color: #845EC2; }
    &.level-4 { background-color: #B392E6; }
`;


const StyledTabs = styled(ToggleButtonGroup)`
    background: rgba(255,255,255,0.03);
    border-radius: 14px;
    padding: 4px;
    border: 1px solid var(--border);

    .MuiToggleButton-root {
        border: none !important;
        border-radius: 10px !important;
        color: var(--text-muted);
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        text-transform: none;
        padding: 6px 16px;
        transition: all 0.3s ease;

        &.Mui-selected {
            background: var(--gradient-primary) !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(132, 94, 194, 0.2);
        }

        &:hover {
            background: rgba(255,255,255,0.05);
        }
    }
`;

const Legend = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 700;

    .cell {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }

    .level-0 { background-color: rgba(255, 255, 255, 0.05); }
    .level-1 { background-color: #3d2b56; }
    .level-2 { background-color: #5d3b8e; }
    .level-3 { background-color: #845EC2; }
    .level-4 { background-color: #B392E6; }
`;

