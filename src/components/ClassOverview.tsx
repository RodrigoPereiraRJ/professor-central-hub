
import React, { useState } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronRight, Users } from 'lucide-react';
import ClassDetailsPanel from './ClassDetailsPanel';

interface ClassData {
  id: string;
  name: string;
  students: number;
  gradesPercentage: number;
  attendancePercentage: number;
  hasPendingActivities: boolean;
}

const ClassOverview = () => {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Sample data - in a real app this would come from an API
  const classes: ClassData[] = [
    { 
      id: '1', 
      name: '9º Ano A - Matemática', 
      students: 32, 
      gradesPercentage: 75, 
      attendancePercentage: 90,
      hasPendingActivities: true
    },
    { 
      id: '2', 
      name: '8º Ano B - Matemática', 
      students: 28, 
      gradesPercentage: 100, 
      attendancePercentage: 95,
      hasPendingActivities: false
    },
    { 
      id: '3', 
      name: '7º Ano C - Matemática', 
      students: 30, 
      gradesPercentage: 60, 
      attendancePercentage: 80,
      hasPendingActivities: true
    }
  ];

  const handleClassClick = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
      <DashboardCard title="Resumo de Turmas">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium">Turma</th>
                <th className="text-center py-2 px-2 font-medium">Alunos</th>
                <th className="text-center py-2 px-2 font-medium">Notas</th>
                <th className="text-center py-2 px-2 font-medium">Frequência</th>
                <th className="text-center py-2 px-2 font-medium">Status</th>
                <th className="text-right py-2 px-2 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classData) => (
                <tr key={classData.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{classData.name}</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center">
                      <Users size={16} className="mr-1 text-gray-500" />
                      {classData.students}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            classData.gradesPercentage === 100 
                              ? 'bg-green-500' 
                              : classData.gradesPercentage >= 70 
                                ? 'bg-dashboard-blue' 
                                : 'bg-yellow-500'
                          }`} 
                          style={{ width: `${classData.gradesPercentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">{classData.gradesPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            classData.attendancePercentage >= 90 
                              ? 'bg-green-500' 
                              : classData.attendancePercentage >= 70 
                                ? 'bg-dashboard-blue' 
                                : 'bg-yellow-500'
                          }`} 
                          style={{ width: `${classData.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm">{classData.attendancePercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {classData.hasPendingActivities && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle size={14} className="mr-1" />
                        Pendências
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleClassClick(classData)}
                    >
                      <span className="mr-1">Detalhes</span>
                      <ChevronRight size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {selectedClass && (
        <ClassDetailsPanel 
          classData={selectedClass} 
          isOpen={isPanelOpen} 
          onClose={handleClosePanel} 
        />
      )}
    </>
  );
};

export default ClassOverview;
