
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Student {
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

interface LaunchGradeModalProps {
  open: boolean;
  onClose: () => void;
}

const AVERAGE = 5;

const LaunchGradeModal: React.FC<LaunchGradeModalProps> = ({ open, onClose }) => {
  const [matricula, setMatricula] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const findStudentByMatricula = (registration: string) => {
    console.log("Buscando aluno com matrícula:", registration);
    
    // Tentar buscar em "students"
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      try {
        const students: Student[] = JSON.parse(storedStudents);
        console.log("Alunos em 'students':", students);
        const found = students.find((s) => s.registration === registration);
        if (found) {
          console.log("Aluno encontrado em 'students':", found);
          return found;
        }
      } catch (e) {
        console.error("Erro ao parsear 'students':", e);
      }
    }
    
    // Tentar buscar em "alunosDashboard" como fallback
    const alunosDashboard = localStorage.getItem("alunosDashboard");
    if (alunosDashboard) {
      try {
        const students = JSON.parse(alunosDashboard);
        console.log("Alunos em 'alunosDashboard':", students);
        const found = students.find((s: any) => s.registration === registration);
        if (found) {
          console.log("Aluno encontrado em 'alunosDashboard':", found);
          // Converter para o formato esperado de Student
          return {
            id: found.id || String(Date.now()),
            name: found.name,
            registration: found.registration,
            class: found.class,
            school: found.school,
            presenceDays: found.presenceDays || 0,
            absenceDays: found.absenceDays || 0,
            grade: found.grade
          };
        }
      } catch (e) {
        console.error("Erro ao parsear 'alunosDashboard':", e);
      }
    }
    
    console.log("Nenhum aluno encontrado com a matrícula:", registration);
    return null;
  };

  const handleSearch = () => {
    setSuccess(null);
    setError(null);
    
    if (!matricula.trim()) {
      setError("Por favor, informe uma matrícula.");
      return;
    }
    
    const found = findStudentByMatricula(matricula.trim());
    if (found) {
      setStudent(found);
      setGrade(found.grade ?? "");
    } else {
      setStudent(null);
      setError("Aluno não encontrado com a matrícula informada.");
    }
  };

  const handleSave = () => {
    if (!student || grade === "") return;
    
    // Salvar em ambos os locais de armazenamento para garantir
    saveStudentGrade("students", student, grade);
    saveStudentGrade("alunosDashboard", student, grade);
    
    setSuccess("Nota lançada com sucesso!");
    setStudent({ ...student, grade: typeof grade === "string" ? Number(grade) : grade });
  };
  
  const saveStudentGrade = (storageKey: string, student: Student, grade: number | string) => {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;
    
    try {
      let students = JSON.parse(storedData);
      
      // Verificar se é um array
      if (Array.isArray(students)) {
        students = students.map((s: any) => {
          // Verificar se é o mesmo aluno pela matrícula ou ID
          if ((s.registration && s.registration === student.registration) || 
              (s.id && s.id === student.id)) {
            return { 
              ...s, 
              grade: typeof grade === "string" ? Number(grade) : grade 
            };
          }
          return s;
        });
        
        localStorage.setItem(storageKey, JSON.stringify(students));
        console.log(`Nota salva em '${storageKey}'`);
      }
    } catch (e) {
      console.error(`Erro ao salvar nota em '${storageKey}':`, e);
    }
  };

  const gradeColor =
    grade === ""
      ? ""
      : typeof grade === "number"
      ? grade >= AVERAGE
        ? "text-green-600 font-bold"
        : "text-red-600 font-bold"
      : "";

  return (
    <Dialog open={open}>
      <DialogContent onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
        <DialogHeader>
          <DialogTitle>Lançar Nota</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm font-medium">Matrícula do Aluno</label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite a matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              autoFocus
              className="w-full"
            />
            <Button type="button" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {student && (
            <>
              <div>
                <div className="text-sm"><b>Nome:</b> {student.name}</div>
                <div className="text-sm"><b>Turma:</b> {student.class}</div>
                <div className="text-sm"><b>Escola:</b> {student.school ?? "-"}</div>
                <div className="text-sm"><b>Matrícula:</b> {student.registration}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nota do Aluno (Média: <span className="font-bold text-blue-600">{AVERAGE}</span>)</label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value === "" ? "" : Number(e.target.value))}
                />
                {grade !== "" && (
                  <span className={gradeColor + " block mt-1"}>
                    Nota: <span>{grade}</span>
                  </span>
                )}
              </div>
              <Button className="w-full" onClick={handleSave}>
                Salvar Nota
              </Button>
              {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
            </>
          )}
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} className="w-full mt-2">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchGradeModal;
