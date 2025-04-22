
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Users, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddStudentForm } from './forms/AddStudentForm';

const StudentPerformance = () => {
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
              <AddStudentForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="text-center py-8 text-gray-500">
        <Users size={48} className="mx-auto mb-4 opacity-50" />
        <p>Nenhum aluno cadastrado</p>
        <p className="text-sm">Adicione alunos para ver o desempenho</p>
      </div>
    </DashboardCard>
  );
};

export default StudentPerformance;
