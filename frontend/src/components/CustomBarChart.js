 // import React from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// const chartData = [
//     {
//         name: "Amphibians",
//         value: 2488,
//     },
//     {
//         name: "Birds",
//         value: 1445,
//     },
//     {
//         name: "Crustaceans",
//         value: 743,
//     },
// ];

// const dataFormatter = (value) => {
//     return "$ " + Intl.NumberFormat("us").format(value).toString();
// };
// const CustomBarChart = () => {
//     return (
//         <BarChart width={500} height={300} data={chartData}>
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip formatter={dataFormatter} />
//             <Bar dataKey="value" fill="blue" />
//         </BarChart>
//     );
// };

// export default CustomBarChart

// import React from "react";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
// import styled from "styled-components";

// const chartData = [
//     {
//         subject: "Math",
//         attendancePercentage: 80,
//         totalClasses: 50,
//         attendedClasses: Math.round((80 / 100) * 50),
//     },
//     {
//         subject: "Science",
//         attendancePercentage: 90,
//         totalClasses: 60,
//         attendedClasses: Math.round((90 / 100) * 60),
//     },
//     {
//         subject: "History",
//         attendancePercentage: 70,
//         totalClasses: 45,
//         attendedClasses: Math.round((70 / 100) * 45),
//     },
// ];

// const CustomTooltip = styled.div`
//   background-color: #fff;
//   border-radius: 4px;
//   padding: 10px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
// `;

// const TooltipText = styled.p`
//   margin: 0;
//   font-weight: bold;
// `;

// const CustomTooltipContent = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//         const { subject, attendancePercentage, totalClasses, attendedClasses } = payload[0].payload;

//         return (
//             <CustomTooltip>
//                 <TooltipText>{subject}</TooltipText>
//                 <TooltipText>Attendance: {attendancePercentage}%</TooltipText>
//                 <TooltipText>Attended Classes: {attendedClasses}</TooltipText>
//                 <TooltipText>Total Classes: {totalClasses}</TooltipText>
//             </CustomTooltip>
//         );
//     }

//     return null;
// };

// const colors = ["#0088FE", "#00C49F", "#FFBB28"];

// const CustomBarChart = () => {
//     return (
//         <BarChart width={500} height={300} data={chartData}>
//             <XAxis dataKey="subject" />
//             <YAxis />
//             <Tooltip content={<CustomTooltipContent />} />
//             <Bar dataKey="attendancePercentage">
//                 {chartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
//                 ))}
//             </Bar>
//         </BarChart>
//     );
// };

// export default CustomBarChart;

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import styled from "styled-components";

const CustomTooltip = styled.div`
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const TooltipText = styled.p`
  margin: 0;
  font-weight: bold;
  color:#1e1e1e;
`;

const TooltipMain = styled.h3`
  margin: 0;
  margin-bottom: 8px;
  font-weight: 800;
  color: var(--primary);
  font-family: 'Outfit';
`;

const CustomTooltipContent = ({ active, payload, dataKey }) => {
    if (active && payload && payload.length) {
        const { subject, attendancePercentage, totalClasses, attendedClasses, marksObtained, subName } = payload[0].payload;

        return (
            <CustomTooltip>
                {dataKey === "attendancePercentage" ? (
                    <>
                        <TooltipMain>{subject}</TooltipMain>
                        <TooltipText>Attended: ({attendedClasses}/{totalClasses})</TooltipText>
                        <TooltipText>{attendancePercentage}%</TooltipText>
                    </>
                ) : (
                    <>
                        <TooltipMain>{subName.subName}</TooltipMain>
                        <TooltipText>Marks: {marksObtained}</TooltipText>
                    </>
                )}
            </CustomTooltip>
        );
    }

    return null;
};

const COLORS = ['#845EC2', '#FF9671', '#FFC75F', '#F9F871', '#00C9A7', '#4D8076', '#C34A36'];

const CustomBarChart = ({ chartData, dataKey }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                    dataKey={dataKey === "marksObtained" ? "subName.subName" : "subject"} 
                    stroke="var(--text-muted)"
                    tick={{ fill: 'var(--text-muted)' }}
                />
                <YAxis 
                    domain={[0, 100]} 
                    stroke="var(--text-muted)"
                    tick={{ fill: 'var(--text-muted)' }}
                />
                <Tooltip 
                    content={<CustomTooltipContent dataKey={dataKey} />} 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// Removed legacy color generation functions

export default CustomBarChart;