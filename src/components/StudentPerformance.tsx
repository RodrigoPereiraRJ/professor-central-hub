
import React, { useState, useEffect } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddStudentForm } from './forms/AddStudentForm';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./ui/table";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export interface Student {
  id: string;
  name: string;
  registration: string;
  class: string;
  attendance?: number;
}

const StudentPerformance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<Record<string, Student[]>>({});

  useEffect(() => {
    // Recuperar alunos do localStorage
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      const parsedStudents = JSON.parse(storedStudents);
      setStudents(parsedStudents);
      
      // Agrupar alunos por turma
      const grouped = parsedStudents.reduce((acc: Record<string, Student[]>, student: Student) => {
        if (!acc[student.class]) {
          acc[student.class] = [];
        }
        acc[student.class].push(student);
        return acc;
      }, {});
      
      setGroupedStudents(grouped);
    }
  }, []);

  const handleAddStudent = (newStudent: Student) => {
    const updatedStudents = [...students, {...newStudent, id: Date.now().toString(), attendance: 0}];
    setStudents(updatedStudents);
    
    // Atualizar agrupamento
    const newGrouped = {...groupedStudents};
    if (!newGrouped[newStudent.class]) {
      newGrouped[newStudent.class] = [];
    }
    newGrouped[newStudent.class].push({...newStudent, id: Date.now().toString(), attendance: 0});
    setGroupedStudents(newGrouped);
    
    // Salvar no localStorage
    localStorage.setItem('students', JSON.stringify(updatedStudents));
  };

  return (
    <DashboardCard 
      title="Desempenho dos Alunos"
      headerClassName="flex justify-between items-center"
    >
      <div className="flex justify-between items-center pb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Adicionar Aluno
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Novo Aluno</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AddStudentForm onAddStudent={handleAddStudent} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {Object.keys(groupedStudents).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum aluno cadastrado</p>
          <p className="text-sm">Adicione alunos para ver o desempenho</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedStudents).map(([className, classStudents]) => (
            <div key={className} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <UserCheck className="mr-2" size={20} />
                Turma: {className}
                <Badge className="ml-2">{classStudents.length} alunos</Badge>
              </h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Frequência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.registration}</TableCell>
                      <TableCell>
                        <div className="w-full flex items-center gap-2">
                          <Progress value={student.attendance || 0} className="h-2" />
                          <span className="text-xs whitespace-nowrap">{student.attendance || 0}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default StudentPerformance;
