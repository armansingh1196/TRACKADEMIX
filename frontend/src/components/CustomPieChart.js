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

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin-top: 24px;
  width: 100%;
  max-width: 380px;
  padding: 0 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.45};
  transform: scale(${props => props.active ? 1.03 : 1});
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    opacity: 0.9;
  }
`;

const LegendColor = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  box-shadow: 0 0 10px ${props => props.color}50;
`;

const LegendLabel = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${props => props.active ? '#F5F5FF' : 'rgba(226, 232, 255, 0.6)'};
  white-space: nowrap;
`;

const LegendValue = styled.span`
  color: rgba(226, 232, 255, 0.35);
  font-weight: 500;
  margin-left: auto;
  font-size: 0.75rem;
`;

// Renders the active segment with glow + center SVG label text
const renderActiveShape = (props) => {
  const {
    cx, cy,
    innerRadius, outerRadius,
    startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  const percentage = (percent * 100).toFixed(1);

  return (
    <g>
      {/* Glow layer */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.18}
        style={{ filter: `drop-shadow(0 0 10px ${fill})` }}
      />
      {/* Main active segment — slightly larger */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* ── Center label rendered in SVG so it's always perfectly centered ── */}

      {/* Batch name — large bold */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 800,
          fill: '#F5F5FF',
          letterSpacing: '-0.03em',
        }}
      >
        {payload.name}
      </text>

      {/* Class count — small muted */}
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          fontWeight: 600,
          fill: 'rgba(226,232,255,0.45)',
        }}
      >
        {value} {value === 1 ? 'Class' : 'Classes'}
      </text>

      {/* Percentage pill — rendered as rounded rect + text */}
      <rect
        x={cx - 32}
        y={cy + 22}
        width={64}
        height={18}
        rx={9}
        fill={fill + '1A'}
        stroke={fill + '40'}
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 31}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 700,
          fill: fill,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {percentage}% SHARE
      </text>
    </g>
  );
};

// Default (inactive) center label when hovering nothing
const renderCenterDefault = (cx, cy, activeItem, activeColor, total) => {
  const percentage = total > 0 ? ((activeItem.value / total) * 100).toFixed(1) : '0';
  return (
    <g>
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 800,
          fill: '#F5F5FF',
          letterSpacing: '-0.03em',
        }}
      >
        {activeItem.name}
      </text>
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          fontWeight: 600,
          fill: 'rgba(226,232,255,0.45)',
        }}
      >
        {activeItem.value} {activeItem.value === 1 ? 'Class' : 'Classes'}
      </text>
      <rect
        x={cx - 32}
        y={cy + 22}
        width={64}
        height={18}
        rx={9}
        fill={activeColor + '1A'}
        stroke={activeColor + '40'}
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 31}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 700,
          fill: activeColor,
          letterSpacing: '0.04em',
        }}
      >
        {percentage}% SHARE
      </text>
    </g>
  );
};

const CustomPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const activeItem = data[activeIndex] || data[0] || { name: 'N/A', value: 0 };
  const activeColor = COLORS[activeIndex % COLORS.length];

  // Fixed chart dimensions so cy is exactly calculable
  const CHART_HEIGHT = 240;
  const cx = '50%';
  const cy = CHART_HEIGHT / 2; // exact pixel center

  return (
    <ChartWrapper>
      <div style={{ width: '100%', height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx={cx}
              cy={cy}
              innerRadius={68}
              outerRadius={100}
              dataKey="value"
              onMouseEnter={onPieEnter}
              stroke="rgba(10, 10, 26, 0.5)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{ outline: 'none' }}
                />
              ))}
            </Pie>

            {/* Always-visible default center label via customized layer */}
            <g>
              {renderCenterDefault('50%', cy, activeItem, activeColor, total)}
            </g>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <LegendGrid>
        {data.map((entry, index) => {
          const color = COLORS[index % COLORS.length];
          const active = activeIndex === index;
          return (
            <LegendItem
              key={entry.name}
              active={active}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <LegendColor color={color} />
              <LegendLabel active={active}>{entry.name}</LegendLabel>
              <LegendValue>{entry.value}</LegendValue>
            </LegendItem>
          );
        })}
      </LegendGrid>
    </ChartWrapper>
  );
};

export default CustomPieChart;