
import React, { useState, useEffect } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, BookOpen } from 'lucide-react';
import { AddClassForm } from './forms/AddClassForm';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertCircle, ChevronRight } from 'lucide-react';
import ClassDetailsPanel from './ClassDetailsPanel';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./ui/table";

export interface ClassData {
  id: string;
  name: string;
  subject: string;
  period: string;
  students?: number;
  gradesPercentage?: number;
  attendancePercentage?: number;
  hasPendingActivities?: boolean;
}

const ClassOverview = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    // Recuperar classes do localStorage
    const storedClasses = localStorage.getItem('classes');
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    }
  }, []);

  const handleAddClass = (newClass: Omit<ClassData, 'id'>) => {
    const classData: ClassData = {
      ...newClass,
      id: Date.now().toString(),
      students: 0,
      gradesPercentage: 0,
      attendancePercentage: 0,
      hasPendingActivities: false
    };
    
    const updatedClasses = [...classes, classData];
    setClasses(updatedClasses);
    
    // Salvar no localStorage
    localStorage.setItem('classes', JSON.stringify(updatedClasses));
  };

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
              <AddClassForm onAddClass={handleAddClass} />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classData) => (
                <TableRow key={classData.id}>
                  <TableCell className="font-medium">{classData.name}</TableCell>
                  <TableCell>{classData.subject}</TableCell>
                  <TableCell>{classData.period}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1 text-gray-500" />
                      {classData.students || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleClassClick(classData)}
                    >
                      <span className="mr-1">Detalhes</span>
                      <ChevronRight size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
