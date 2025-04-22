
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StudentPerformance = () => {
  // Sample data - in a real app this would come from an API
  const performanceData = [
    { 
      turma: '9º Ano A', 
      media: 7.5, 
      bimestre1: 7.2, 
      bimestre2: 7.5, 
      bimestre3: 7.8, 
      bimestre4: 8.0, 
      abaixoDaMedia: 15 
    },
    { 
      turma: '8º Ano B', 
      media: 8.2, 
      bimestre1: 7.8, 
      bimestre2: 8.1, 
      bimestre3: 8.3, 
      bimestre4: 8.5, 
      abaixoDaMedia: 5 
    },
    { 
      turma: '7º Ano C', 
      media: 6.9, 
      bimestre1: 6.5, 
      bimestre2: 6.8, 
      bimestre3: 7.1, 
      bimestre4: 7.2, 
      abaixoDaMedia: 25 
    },
  ];

  // For the evolution chart
  const evolutionData = performanceData.map(item => [
    { name: '1° Bim', [item.turma]: item.bimestre1 },
    { name: '2° Bim', [item.turma]: item.bimestre2 },
    { name: '3° Bim', [item.turma]: item.bimestre3 },
    { name: '4° Bim', [item.turma]: item.bimestre4 }
  ]).flat();

  // Merge the evolution data by name (bimester)
  const mergedEvolutionData = evolutionData.reduce((acc, curr) => {
    const existingItem = acc.find(item => item.name === curr.name);
    if (existingItem) {
      // Merge the current item into the existing one
      Object.keys(curr).forEach(key => {
        if (key !== 'name') {
          existingItem[key] = curr[key];
        }
      });
      return acc;
    } else {
      // Add the new item to the accumulator
      return [...acc, curr];
    }
  }, []);

  // For the below average chart
  const belowAverageData = performanceData.map(item => ({
    name: item.turma,
    Percentual: (item.abaixoDaMedia / 100) * 100
  }));

  // Custom tooltip for the evolution chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-md border rounded">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardCard title="Desempenho dos Alunos">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mergedEvolutionData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip content={<CustomTooltip />} />
            {performanceData.map((item, index) => (
              <Bar 
                key={item.turma} 
                dataKey={item.turma} 
                fill={index === 0 ? '#1E88E5' : index === 1 ? '#4CAF50' : '#FFCA28'} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {performanceData.map((item, index) => (
          <div key={item.turma} className="text-center">
            <div className="text-sm font-medium">{item.turma}</div>
            <div className="text-xl font-bold mt-1">{item.media.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Média Geral</div>
            <div className="mt-2 text-sm text-red-500">
              {item.abaixoDaMedia}% abaixo da média
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default StudentPerformance;
