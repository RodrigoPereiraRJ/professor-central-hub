
import React, { useEffect, useState } from "react";
import DashboardCard from './ui/DashboardCard';
import { Users, BookOpen } from "lucide-react";
import { Badge } from "./ui/badge";

interface Student {
  id: string;
  name: string;
  registration: string;
  class: string;
}

interface ClassStats {
  className: string;
  totalStudents: number;
  registrations: string[];
}

const ClassOverview = () => {
  const [classStats, setClassStats] = useState<ClassStats[]>([]);

  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      const parsed: Student[] = JSON.parse(storedStudents);
      // Agrupar por turma
      const grouped = parsed.reduce<Record<string, string[]>>((acc, student) => {
        if (!acc[student.class]) acc[student.class] = [];
        acc[student.class].push(student.registration);
        return acc;
      }, {});
      // Montar stats
      const stats: ClassStats[] = Object.entries(grouped).map(([className, regs]) => ({
        className,
        totalStudents: regs.length,
        registrations: regs,
      }));
      setClassStats(stats);
    }
  }, []);

  return (
    <DashboardCard 
      title="Estatísticas das Turmas"
      headerClassName="flex justify-between items-center"
    >
      {classStats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhuma turma cadastrada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {classStats.map((stat) => (
            <div key={stat.className} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium flex items-center">
                  <Users size={18} className="mr-2" /> Turma: <span className="ml-1">{stat.className}</span>
                </div>
                <Badge>{stat.totalStudents} alunos</Badge>
              </div>
              <div>
                <span className="font-semibold">Matrículas:</span>
                <ul className="list-disc ml-6">
                  {stat.registrations.map((reg) => (
                    <li key={reg}>{reg}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};

export default ClassOverview;
