import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import styled from 'styled-components';

const COLORS = [
  '#7C4DFF', // Electric Indigo
  '#2DD4BF', // Cyan / Teal
  '#FBBF24', // Amber
  '#3B82F6', // Blue
  '#EC4899', // Rose Pink
  '#10B981', // Emerald
  '#8B5CF6'  // Deep Violet
];

// Recharts passes REAL computed pixel cx/cy here — always perfectly centered
const makeActiveShape = (total) => (props) => {
  const {
    cx, cy,
    innerRadius, outerRadius,
    startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  const percentage = (percent * 100).toFixed(1);
  const pillW = 72;
  const pillH = 20;

  return (
    <g>
      {/* Ambient glow behind active segment */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.18}
        style={{ filter: `drop-shadow(0 0 10px ${fill})` }}
      />
      {/* Active segment slightly expanded */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* ── Center label — uses real pixel cx/cy from Recharts ── */}

      {/* Batch name */}
      <text
        x={cx} y={cy - 16}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
          fontSize: '1.2rem',
          fontWeight: 800,
          fill: '#F5F5FF',
          letterSpacing: '-0.03em',
        }}
      >
        {payload.name}
      </text>

      {/* Class count */}
      <text
        x={cx} y={cy + 8}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.72rem',
          fontWeight: 600,
          fill: 'rgba(226,232,255,0.5)',
        }}
      >
        {value} {value === 1 ? 'Class' : 'Classes'}
      </text>

      {/* Percentage pill */}
      <rect
        x={cx - pillW / 2}
        y={cy + 22}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill={fill + '22'}
        stroke={fill + '55'}
        strokeWidth={1}
      />
      <text
        x={cx} y={cy + 32}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.58rem',
          fontWeight: 700,
          fill: fill,
          letterSpacing: '0.05em',
        }}
      >
        {percentage}% SHARE
      </text>
    </g>
  );
};

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 20px;
  margin-top: 20px;
  width: 100%;
  padding: 0 4px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  opacity: ${props => props.$active ? 1 : 0.45};
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover { opacity: 0.9; }
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 0 0 8px ${props => props.$color}60;
  flex-shrink: 0;
`;

const LegendText = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.$active ? '#F5F5FF' : 'rgba(226,232,255,0.55)'};
  white-space: nowrap;
`;

const LegendCount = styled.span`
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(226,232,255,0.3);
  margin-left: 2px;
`;

const CustomPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  // Memoize activeShape with total baked in
  const activeShape = makeActiveShape(total);

  return (
    <ChartWrapper>
      {/* Fixed height so cy="50%" = exactly 120px — Recharts resolves to real pixels in renderActiveShape */}
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={activeShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={102}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              stroke="rgba(8, 8, 24, 0.6)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ outline: 'none' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <LegendRow>
        {data.map((entry, index) => {
          const color = COLORS[index % COLORS.length];
          const active = activeIndex === index;
          return (
            <LegendItem
              key={entry.name}
              $active={active}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <LegendDot $color={color} />
              <LegendText $active={active}>{entry.name}</LegendText>
              <LegendCount>{entry.value}</LegendCount>
            </LegendItem>
          );
        })}
      </LegendRow>
    </ChartWrapper>
  );
};

export default CustomPieChart;