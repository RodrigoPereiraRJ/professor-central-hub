
import React, { useEffect, useState } from "react";
import DashboardCard from "./ui/DashboardCard";

interface RegisteredStudent {
  id: string;
  name: string;
  registration: string;
  school: string;
  class: string;
  teachingDays: number[];
}

const daysMap: { [k: number]: string } = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
};

const AllStudentsList: React.FC = () => {
  const [students, setStudents] = useState<RegisteredStudent[]>([]);

  useEffect(() => {
    // Busca pelo storage dedicado cadastrado no fluxo de frequência
    const raw = localStorage.getItem("alunosDashboard");
    if (raw) {
      setStudents(JSON.parse(raw));
    } else {
      // Fallback caso não haja alunos cadastrados
      setStudents([]);
    }
  }, []);

  return (
    <DashboardCard
      title="Lista de Todos os Alunos Cadastrados"
      description="Veja abaixo todos os alunos, com matrícula, escola e dias de aula."
      contentClassName="overflow-x-auto"
    >
      {students.length === 0 ? (
        <div className="py-8 text-center text-gray-600">Nenhum aluno cadastrado até o momento.</div>
      ) : (
        <table className="min-w-full bg-white text-sm rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Nome</th>
              <th className="py-2 px-4 border-b text-left">Matrícula</th>
              <th className="py-2 px-4 border-b text-left">Escola</th>
              <th className="py-2 px-4 border-b text-left">Turma</th>
              <th className="py-2 px-4 border-b text-left">Dias de Aula</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu) => (
              <tr key={stu.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{stu.name}</td>
                <td className="py-2 px-4">{stu.registration}</td>
                <td className="py-2 px-4">{stu.school || "-"}</td>
                <td className="py-2 px-4">{stu.class || "-"}</td>
                <td className="py-2 px-4">
                  {Array.isArray(stu.teachingDays) && stu.teachingDays.length > 0
                    ? stu.teachingDays.map((d) => daysMap[d] || d).join(", ")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardCard>
  );
};

export default AllStudentsList;
