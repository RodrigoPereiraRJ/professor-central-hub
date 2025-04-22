
import React from 'react';
import { X, Book, Calendar, AlertCircle, FileText, Users, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface ClassData {
  id: string;
  name: string;
  students: number;
  gradesPercentage: number;
  attendancePercentage: number;
  hasPendingActivities: boolean;
}

interface ClassDetailsPanelProps {
  classData: ClassData;
  isOpen: boolean;
  onClose: () => void;
}

const ClassDetailsPanel = ({ classData, isOpen, onClose }: ClassDetailsPanelProps) => {
  // Sample data - in a real app this would come from an API based on classData.id
  const pendingActivities = [
    { id: '1', name: 'Avaliação Bimestral', dueDate: '28/04/2025', type: 'grades' },
    { id: '2', name: 'Aula 15/04', dueDate: '15/04/2025', type: 'attendance' }
  ];

  const recentActivities = [
    { id: '1', name: 'Trabalho em Grupo', dueDate: '10/04/2025', submissions: 28, total: 32 },
    { id: '2', name: 'Lista de Exercícios', dueDate: '05/04/2025', submissions: 30, total: 32 }
  ];

  const lowPerformingStudents = [
    { id: '1', name: 'Carlos Oliveira', average: 5.5, attendance: '75%' },
    { id: '2', name: 'Márcia Santos', average: 5.8, attendance: '80%' },
    { id: '3', name: 'Pedro Almeida', average: 5.2, attendance: '65%' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl flex items-center justify-between">
            <span>{classData.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </SheetTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <Users size={16} className="mr-1" />
              <span className="text-sm">{classData.students} alunos</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Book size={14} className="mr-1" />
              Matemática
            </Badge>
          </div>
        </SheetHeader>
        
        <div className="space-y-6">
          {classData.hasPendingActivities && (
            <div>
              <h3 className="font-medium text-red-600 flex items-center mb-2">
                <AlertCircle size={16} className="mr-1" />
                Pendências
              </h3>
              <div className="space-y-2">
                {pendingActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="p-3 rounded border bg-red-50 border-red-100 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-gray-500">Vencimento: {activity.dueDate}</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">
                      {activity.type === 'grades' ? 'Lançar Notas' : 'Registrar'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <FileText size={16} className="mr-1" />
              Atividades Recentes
            </h3>
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="p-3 rounded border flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-500">Entregas: {activity.submissions}/{activity.total}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <span className="text-xs">Ver</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              Alunos em Atenção
            </h3>
            <div className="space-y-2">
              {lowPerformingStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="p-3 rounded border flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-gray-500">Média: <span className="text-red-500 font-medium">{student.average}</span></span>
                      <span className="text-gray-500">Presença: {student.attendance}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <span className="text-xs">Ver</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <SheetFooter className="flex-col sm:flex-row gap-2 sm:justify-start">
          <Button variant="outline" className="w-full sm:w-auto">
            <Calendar size={16} className="mr-1" />
            Plano de Aulas
          </Button>
          <Button className="w-full sm:w-auto">
            <FileText size={16} className="mr-1" />
            Lançar Notas
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ClassDetailsPanel;
