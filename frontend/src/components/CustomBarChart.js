import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

/* ── Dark glassmorphic tooltip ── */
const TooltipBox = styled.div`
    background: rgba(13, 11, 34, 0.92);
    border: 1px solid rgba(124, 77, 255, 0.25);
    border-radius: 12px;
    padding: 10px 14px;
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    min-width: 130px;
`;

const TooltipSubject = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -0.01em;
    margin-bottom: 6px;
    line-height: 1.2;
`;

const TooltipRow = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-muted);
    line-height: 1.6;

    span {
        color: var(--text-1);
        font-weight: 700;
    }
`;

const CustomTooltipContent = ({ active, payload, dataKey }) => {
    if (active && payload && payload.length) {
        const { subject, attendancePercentage, totalClasses, attendedClasses, marksObtained, subName } = payload[0].payload;

        return (
            <TooltipBox>
                {dataKey === 'attendancePercentage' ? (
                    <>
                        <TooltipSubject>{subject}</TooltipSubject>
                        <TooltipRow>Attended: <span>{attendedClasses}/{totalClasses}</span></TooltipRow>
                        <TooltipRow>Rate: <span>{attendancePercentage}%</span></TooltipRow>
                    </>
                ) : (
                    <>
                        <TooltipSubject>{subName?.subName || subName}</TooltipSubject>
                        <TooltipRow>Marks: <span>{marksObtained}</span></TooltipRow>
                    </>
                )}
            </TooltipBox>
        );
    }
    return null;
};

const COLORS = ['#845EC2', '#448AFF', '#2DD4BF', '#FBBF24', '#F87171', '#00C9A7', '#FF9671'];

const CustomBarChart = ({ chartData, dataKey }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis
                    dataKey={dataKey === 'marksObtained' ? 'subName.subName' : 'subject'}
                    stroke="var(--text-muted)"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
                    axisLine={{ stroke: 'rgba(124,77,255,0.15)' }}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    stroke="var(--text-muted)"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                />
                <Tooltip
                    content={<CustomTooltipContent dataKey={dataKey} />}
                    cursor={{ fill: 'rgba(124, 77, 255, 0.06)', radius: 8 }}
                />
                <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CustomBarChart;