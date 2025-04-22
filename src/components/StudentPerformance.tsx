
import React, { useEffect, useState } from "react";
import DashboardCard from './ui/DashboardCard';
import { Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { STUDENT_UPDATED_EVENT } from "./ClassOverview";

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
  teachingDays?: number[];
  attendance?: Array<{ date: string; type: string }>;
}

const StudentPerformance = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    console.log("StudentPerformance - Buscando alunos...");
    
    // Função para carregar os dados dos alunos
    const loadStudentData = () => {
      // Tenta buscar do localStorage usando diferentes chaves
      const tryGetStudents = () => {
        // Verificar primeiro em "students"
        const storedStudents = localStorage.getItem("students");
        if (storedStudents) {
          try {
            const parsed: Student[] = JSON.parse(storedStudents);
            console.log("StudentPerformance - Alunos encontrados em 'students':", parsed);
            return parsed;
          } catch (e) {
            console.error("Erro ao parsear 'students':", e);
          }
        }
        
        // Verificar em "alunosDashboard" como fallback
        const alunosDashboard = localStorage.getItem("alunosDashboard");
        if (alunosDashboard) {
          try {
            const parsed = JSON.parse(alunosDashboard);
            console.log("StudentPerformance - Alunos encontrados em 'alunosDashboard':", parsed);
            
            // Processamos os dados para calcular presença e ausência
            return parsed.map((stu: any) => {
              // Calcula dias de presença e ausência com base no array de attendance
              let presenceDays = 0;
              let absenceDays = 0;
              
              if (Array.isArray(stu.attendance)) {
                stu.attendance.forEach((record: { type: string }) => {
                  if (record.type === "presenca") {
                    presenceDays++;
                  } else if (record.type === "falta") {
                    absenceDays++;
                  }
                });
              }
              
              return {
                id: stu.id || String(Date.now()),
                name: stu.name || "",
                registration: stu.registration || "",
                class: stu.class || "",
                school: stu.school || "",
                presenceDays,
                absenceDays,
                attendance: stu.attendance || []
              };
            });
          } catch (e) {
            console.error("Erro ao parsear 'alunosDashboard':", e);
          }
        }
        
        console.log("StudentPerformance - Nenhum aluno encontrado no localStorage");
        return [];
      };

      const students = tryGetStudents();
      
      if (students && students.length > 0) {
        console.log("StudentPerformance - Dados processados:", students);
        setStudents(students);
      } else {
        console.log("StudentPerformance - Nenhum aluno para exibir");
        setStudents([]);
      }
    };

    // Carrega os dados inicialmente
    loadStudentData();

    // Adiciona um event listener para o evento de atualização
    const handleStudentUpdate = () => {
      console.log("StudentPerformance - Evento de atualização detectado, recarregando dados...");
      loadStudentData();
    };

    window.addEventListener(STUDENT_UPDATED_EVENT, handleStudentUpdate);

    // Cleanup do event listener quando o componente for desmontado
    return () => {
      window.removeEventListener(STUDENT_UPDATED_EVENT, handleStudentUpdate);
    };
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
