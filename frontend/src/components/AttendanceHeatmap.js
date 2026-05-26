import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Tooltip, CircularProgress } from '@mui/material';
import { api } from '../api/client';

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const RANGES = [
    { label: '1M', value: 30, full: '1 Month' },
    { label: '3M', value: 90, full: '3 Months' },
    { label: '6M', value: 180, full: '6 Months' },
    { label: '1Y', value: 365, full: '1 Year' },
];

const AttendanceHeatmap = ({ studentID }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(365);
    const [animating, setAnimating] = useState(false);
    const prevRange = useRef(365);

    useEffect(() => {
        const fetchHeatmap = async () => {
            setLoading(true);
            if (studentID.startsWith('mock_')) {
                const today = new Date();
                const d1 = new Date(today); d1.setDate(today.getDate() - 1);
                const d2 = new Date(today); d2.setDate(today.getDate() - 2);
                const d3 = new Date(today); d3.setDate(today.getDate() - 3);
                setData([
                    { date: d1.toISOString().split('T')[0], count: 3, total: 3 },
                    { date: d2.toISOString().split('T')[0], count: 2, total: 3 },
                    { date: d3.toISOString().split('T')[0], count: 0, total: 2 },
                    { date: today.toISOString().split('T')[0], count: 1, total: 1 },
                ]);
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/Student/Heatmap/${studentID}`);
                setData(response.data);
            } catch (err) {
                console.error('Failed to fetch heatmap', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeatmap();
    }, [studentID]);

    const handleRangeChange = (val) => {
        if (val === range) return;
        setAnimating(true);
        setTimeout(() => {
            prevRange.current = val;
            setRange(val);
            setAnimating(false);
        }, 180);
    };

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
                dayOfWeek: d.getDay(),
                month: d.getMonth(),
                day: d.getDate(),
                intensity: record ? (record.count / record.total) : 0,
                present: record ? record.count : 0,
                total: record ? record.total : 0,
                hasData: !!record,
            });
        }
        return days;
    };

    // Compute stats
    const computeStats = (days) => {
        const attended = days.filter(d => d.hasData && d.present > 0).length;
        const total = days.filter(d => d.hasData).length;
        // Current streak (consecutive days with attendance from today backwards)
        let streak = 0;
        const reversed = [...days].reverse();
        for (const d of reversed) {
            if (d.hasData && d.present > 0) streak++;
            else if (d.hasData) break;
        }
        return { attended, total, streak };
    };

    // Build month markers for the header
    const buildMonthMarkers = (days, cols) => {
        const markers = [];
        let lastMonth = -1;
        days.forEach((d, i) => {
            const col = Math.floor(i / 7);
            if (d.month !== lastMonth) {
                markers.push({ col, label: new Date(d.date).toLocaleString('default', { month: 'short' }) });
                lastMonth = d.month;
            }
        });
        return markers;
    };

    if (loading && data.length === 0) return (
        <HeatmapContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={22} sx={{ color: 'var(--primary)' }} />
            </Box>
        </HeatmapContainer>
    );

    const days = generateDays();
    const stats = computeStats(days);
    const cols = Math.ceil(days.length / 7);

    // Pad from start so day[0] aligns to its correct weekday row
    const firstDayOfWeek = days.length > 0 ? days[0].dayOfWeek : 0;
    const paddedCells = [
        ...Array(firstDayOfWeek).fill(null),
        ...days,
    ];

    const monthMarkers = buildMonthMarkers(days, cols);
    // Adjust marker col offsets for padding
    const adjustedMarkers = monthMarkers.map(m => ({ ...m, col: m.col + Math.floor(firstDayOfWeek / 7) }));

    // Total columns including padding offset columns
    const totalCols = Math.ceil(paddedCells.length / 7);

    return (
        <HeatmapContainer>
            {/* Header Row */}
            <HeaderRow>
                <TitleBlock>
                    <Title>Attendance Consistency</Title>
                    <Subtitle>Daily session participation overview</Subtitle>
                </TitleBlock>
                <RangePills>
                    {RANGES.map(r => (
                        <RangePill
                            key={r.value}
                            active={range === r.value}
                            onClick={() => handleRangeChange(r.value)}
                            title={r.full}
                        >
                            {r.label}
                        </RangePill>
                    ))}
                </RangePills>
            </HeaderRow>

            {/* Grid Area */}
            <GridArea animating={animating}>
                {/* Week-day labels column */}
                <WeekLabels>
                    {/* empty top corner to align with month row */}
                    <div style={{ height: 20 }} />
                    {WEEK_LABELS.map((lbl, i) => (
                        <WeekLabel key={i} hide={i % 2 === 0}>{lbl}</WeekLabel>
                    ))}
                </WeekLabels>

                {/* Scrollable right side: month row + cell grid */}
                <GridRight>
                    {/* Month header */}
                    <MonthRow cols={totalCols}>
                        {adjustedMarkers.map((m, i) => (
                            <MonthLabel key={i} style={{ gridColumnStart: m.col + 1 }}>
                                {m.label}
                            </MonthLabel>
                        ))}
                    </MonthRow>

                    {/* Cell grid */}
                    <CellGrid cols={totalCols}>
                        {paddedCells.map((day, i) => {
                            if (!day) return <EmptyCell key={`pad-${i}`} />;
                            const level = day.total === 0 ? 0 : Math.ceil(day.intensity * 4);
                            const tooltipTitle = day.hasData
                                ? `${day.date}: ${day.present}/${day.total} sessions`
                                : `${day.date}: No class`;
                            return (
                                <Tooltip
                                    key={i}
                                    title={<TooltipContent>{tooltipTitle}</TooltipContent>}
                                    arrow
                                    disableInteractive
                                    placement="top"
                                >
                                    <Cell level={level} delay={i * 0.002} />
                                </Tooltip>
                            );
                        })}
                    </CellGrid>
                </GridRight>
            </GridArea>

            {/* Footer: stats + legend */}
            <Footer>
                <StatChips>
                    <StatChip>
                        <StatDot color="var(--primary)" />
                        <StatVal>{stats.attended}</StatVal>
                        <StatKey>days present</StatKey>
                    </StatChip>
                    <StatDivider />
                    <StatChip>
                        <StatDot color="var(--success)" />
                        <StatVal>{stats.streak}</StatVal>
                        <StatKey>day streak</StatKey>
                    </StatChip>
                    <StatDivider />
                    <StatChip>
                        <StatDot color="var(--text-muted)" />
                        <StatVal>{range}</StatVal>
                        <StatKey>days shown</StatKey>
                    </StatChip>
                </StatChips>

                <Legend>
                    <LegendLabel>Less</LegendLabel>
                    {[0, 1, 2, 3, 4].map(l => (
                        <LegendCell key={l} level={l} />
                    ))}
                    <LegendLabel>More</LegendLabel>
                </Legend>
            </Footer>
        </HeatmapContainer>
    );
};

export default AttendanceHeatmap;

/* ── Keyframes ── */
const fadeIn = keyframes`
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
`;

const gridReveal = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

/* ── Styled Components ── */
const HeatmapContainer = styled(Box)`
    padding: 24px 28px;
    background: rgba(255, 255, 255, 0.025);
    border-radius: 20px;
    border: 1px solid var(--border);
    backdrop-filter: blur(16px);
    overflow: hidden;

    @media (max-width: 600px) {
        padding: 16px;
        border-radius: 16px;
    }
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
`;

const TitleBlock = styled.div``;

const Title = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.975rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.02em;
`;

const Subtitle = styled.div`
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    margin-top: 2px;
`;

const RangePills = styled.div`
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(124, 77, 255, 0.12);
    border-radius: 100px;
    padding: 3px;
`;

const RangePill = styled.button`
    background: ${p => p.active
        ? 'linear-gradient(135deg, #7C4DFF 0%, #9B6FF8 100%)'
        : 'transparent'};
    color: ${p => p.active ? '#fff' : 'var(--text-muted)'};
    border: none;
    border-radius: 100px;
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding: 4px 10px;
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: ${p => p.active ? '0 2px 10px rgba(124, 77, 255, 0.35)' : 'none'};
    white-space: nowrap;

    &:hover {
        color: ${p => p.active ? '#fff' : 'var(--text-2)'};
        background: ${p => p.active
            ? 'linear-gradient(135deg, #7C4DFF 0%, #9B6FF8 100%)'
            : 'rgba(255,255,255,0.06)'};
    }
`;

const GridArea = styled.div`
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    opacity: ${p => p.animating ? 0 : 1};
    transition: opacity 0.18s ease;

    &::-webkit-scrollbar { height: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(124, 77, 255, 0.2); border-radius: 10px; }
`;

const WeekLabels = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-top: 0;
    flex-shrink: 0;
`;

const WeekLabel = styled.div`
    height: 13px;
    font-size: 0.6rem;
    font-weight: 600;
    color: ${p => p.hide ? 'transparent' : 'var(--text-muted)'};
    display: flex;
    align-items: center;
    user-select: none;
    width: 24px;
`;

const GridRight = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
`;

const MonthRow = styled.div`
    display: grid;
    grid-template-columns: repeat(${p => p.cols}, 16px);
    gap: 3px;
    height: 20px;
    align-items: center;
`;

const MonthLabel = styled.div`
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    white-space: nowrap;
    user-select: none;
    grid-row: 1;
`;

const CellGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(${p => p.cols}, 13px);
    grid-template-rows: repeat(7, 13px);
    grid-auto-flow: column;
    gap: 3px;
    animation: ${gridReveal} 0.3s ease forwards;
`;

const levelColors = {
    0: 'rgba(255, 255, 255, 0.05)',
    1: '#ef4444', // Red (very low attendance)
    2: '#f59e0b', // Orange (medium-low)
    3: '#84cc16', // Lime (medium-high)
    4: '#10b981', // Green (perfect/high)
};

const Cell = styled.div`
    width: 13px;
    height: 13px;
    border-radius: 3px;
    background-color: ${p => levelColors[p.level] || levelColors[0]};
    cursor: pointer;
    border: 1px solid transparent;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.15s ease,
                border-color 0.15s ease;
    animation: ${fadeIn} 0.4s ${p => p.delay || 0}s ease both;

    &:hover {
        transform: scale(1.35);
        z-index: 10;
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
        border-color: rgba(255, 255, 255, 0.35);
    }
`;

const EmptyCell = styled.div`
    width: 13px;
    height: 13px;
    border-radius: 3px;
    visibility: hidden;
`;

const TooltipContent = styled.span`
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
`;

/* ── Footer ── */
const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    flex-wrap: wrap;
    gap: 10px;
`;

const StatChips = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const StatChip = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const StatDot = styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => p.color};
    flex-shrink: 0;
`;

const StatVal = styled.span`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--text-1);
`;

const StatKey = styled.span`
    font-size: 0.68rem;
    font-weight: 500;
    color: var(--text-muted);
`;

const StatDivider = styled.div`
    width: 1px;
    height: 12px;
    background: rgba(124, 77, 255, 0.2);
`;

const Legend = styled.div`
    display: flex;
    align-items: center;
    gap: 3px;
`;

const LegendLabel = styled.span`
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--text-muted);
    margin: 0 3px;
`;

const LegendCell = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: ${p => levelColors[p.level]};
`;
