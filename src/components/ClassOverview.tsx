import React, { useState } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from 'lucide-react';
import { AddClassForm } from './forms/AddClassForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertCircle, ChevronRight } from 'lucide-react';
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
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleClassClick = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>
    <DashboardCard 
      title="Resumo de Turmas"
      headerClassName="flex justify-between items-center"
    >
      <div className="flex justify-between items-center pb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Adicionar Turma
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Nova Turma</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AddClassForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma turma cadastrada</p>
          <p className="text-sm">Clique em "Adicionar Turma" para começar</p>
        </div>
      ) : (
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
      )}
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
