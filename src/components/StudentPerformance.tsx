
import React, { useEffect, useState } from "react";
import DashboardCard from './ui/DashboardCard';
import { Users } from "lucide-react";
import { Badge } from "./ui/badge";

export interface Student {
  id: string;
  name: string;
  registration: string;
  class: string;
  school?: string;
  presenceDays?: number;
  absenceDays?: number;
  attendance?: number;
  grade?: number;
}

const StudentPerformance = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      const parsed = JSON.parse(storedStudents);
      setStudents(parsed);
    }
  }, []);

  return (
    <DashboardCard 
      title="Desempenho dos Alunos"
      headerClassName="flex justify-between items-center"
    >
      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum aluno cadastrado</p>
          <p className="text-sm">Cadastre alunos para ver o desempenho</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Turma</th>
                <th className="px-4 py-2 text-left">Escola</th>
                <th className="px-4 py-2 text-left">Matrícula</th>
                <th className="px-4 py-2 text-left">Dias de Presença</th>
                <th className="px-4 py-2 text-left">Dias de Falta</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.class}</td>
                  <td className="px-4 py-2">{student.school || "-"}</td>
                  <td className="px-4 py-2">{student.registration}</td>
                  <td className="px-4 py-2">
                    <Badge className="bg-green-100 text-green-700">
                      {student.presenceDays ?? 0}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge className="bg-red-100 text-red-700">
                      {student.absenceDays ?? 0}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
};

export default StudentPerformance;
