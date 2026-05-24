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

const CenterLabel = styled.div`
  position: absolute;
  top: 40%; /* slightly adjusted for Recharts centering alignment */
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BatchName = styled.div`
  font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #F5F5FF;
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const BatchValue = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(226, 232, 255, 0.45);
  margin-top: 4px;
`;

const BatchPercentage = styled.div`
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${props => props.color};
  background: ${props => props.color}12;
  border: 1px solid ${props => props.color}25;
  padding: 3px 8px;
  border-radius: 100px;
  margin-top: 8px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
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

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      {/* Premium ambient glow behind the segment */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.2}
        style={{ filter: 'drop-shadow(0 0 8px ' + fill + ')' }}
      />
      {/* Main active segment with slight expansion */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 3}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
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
  const activePercentage = total > 0 ? ((activeItem.value / total) * 100).toFixed(1) : 0;
  const activeColor = COLORS[activeIndex % COLORS.length];

  return (
    <ChartWrapper>
      <div style={{ width: '100%', height: 220, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={88}
              dataKey="value"
              onMouseEnter={onPieEnter}
              stroke="rgba(10, 10, 26, 0.4)"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{
                    outline: 'none',
                    filter: activeIndex === index ? `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}40)` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <CenterLabel>
          <BatchName>{activeItem.name}</BatchName>
          <BatchValue>{activeItem.value} {activeItem.value === 1 ? 'Class' : 'Classes'}</BatchValue>
          <BatchPercentage color={activeColor}>{activePercentage}% Share</BatchPercentage>
        </CenterLabel>
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