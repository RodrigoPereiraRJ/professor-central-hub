
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
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      const students: Student[] = JSON.parse(storedStudents);
      return students.find((s) => s.registration === registration);
    }
    return null;
  };

  const handleSearch = () => {
    setSuccess(null);
    setError(null);
    const found = findStudentByMatricula(matricula.trim());
    if (found) {
      setStudent(found);
      setGrade(found.grade ?? "");
    } else {
      setStudent(null);
      setError("Aluno não encontrado.");
    }
  };

  const handleSave = () => {
    if (!student || grade === "") return;
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      let students: Student[] = JSON.parse(storedStudents);
      students = students.map((s) =>
        s.id === student.id ? { ...s, grade: typeof grade === "string" ? Number(grade) : grade } : s
      );
      localStorage.setItem("students", JSON.stringify(students));
      setSuccess("Nota lançada com sucesso!");
      setStudent({ ...student, grade: typeof grade === "string" ? Number(grade) : grade });
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
