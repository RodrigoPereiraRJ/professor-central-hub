
import React, { useState, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isSameDay, isAfter, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import DashboardCard from "./ui/DashboardCard";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // para exportar o calendário

const daysOptions = [
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
];

const dayIndexToName = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex"
};

function getWorkingDatesOfMonth(selectedDays: number[]) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });
  return days.filter((date) => {
    const dow = getDay(date);
    return selectedDays.includes(dow) && dow >= 1 && dow <= 5;
  });
}

interface StudentAttendanceFormValues {
  name: string;
  registration: string;
  school: string;
  class: string;
  teachingDays: number[];
}

interface RegisteredStudent {
  id: string;
  name: string;
  registration: string;
  school: string;
  class: string;
  teachingDays: number[];
  attendance: { date: string; type: "presenca" | "falta" }[];
}

type PanelMode = "initial" | "register" | "duplicateModal" | "viewAttendance";

// --- AJUDARES PARA PDF ---
async function exportAttendanceToPDF(ref: HTMLElement, student: RegisteredStudent, presencas: number, faltas: number) {
  const canvas = await html2canvas(ref);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF('p', 'mm', "a4");
  // Titulos
  pdf.setFontSize(16);
  pdf.text(`Frequência de ${student.name}`, 15, 15);
  pdf.setFontSize(12);
  pdf.text(`Matrícula: ${student.registration}`, 15, 25);
  pdf.text(`Turma: ${student.class}`, 15, 32);
  pdf.text(`Período: ${format(new Date(), "MMMM yyyy", { locale: ptBR })}`, 15, 39);
  pdf.text(`Presenças: ${presencas}   Faltas: ${faltas}`, 15, 46);
  pdf.addImage(imgData, 'PNG', 15, 50, 180, 80);
  pdf.save(`frequencia_${student.registration}.pdf`);
}

export default function StudentAttendanceRegistration() {
  const { toast } = useToast();
  const [mode, setMode] = useState<PanelMode>("initial");
  const [foundStudent, setFoundStudent] = useState<RegisteredStudent | null>(null);
  const [attendanceDraft, setAttendanceDraft] = useState<{ date: string; type: "presenca" | "falta" }[]>([]);
  const [registrationInput, setRegistrationInput] = useState<string>("");
  const pendingFormDataRef = useRef<StudentAttendanceFormValues | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Formulário para cadastro de novo aluno
  const registerForm = useForm<StudentAttendanceFormValues>({
    defaultValues: {
      name: "",
      registration: "",
      school: "",
      class: "",
      teachingDays: [],
    },
  });

  // Formulário para consulta por matrícula
  const searchForm = useForm<{ registration: string }>({
    defaultValues: {
      registration: "",
    },
  });

  function findStudentByRegistration(mat: string): RegisteredStudent | undefined {
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]");
    return alunos.find((stu: RegisteredStudent) => stu.registration === mat);
  }

  function handleRegister(data: StudentAttendanceFormValues) {
    const cadastroExistente = findStudentByRegistration(data.registration);
    if (cadastroExistente) {
      pendingFormDataRef.current = data;
      setFoundStudent(cadastroExistente);
      setMode("duplicateModal");
      return;
    }
    const aluno: RegisteredStudent = {
      ...data,
      id: Date.now().toString(),
      attendance: [],
    };
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]");
    alunos.push(aluno);
    localStorage.setItem("alunosDashboard", JSON.stringify(alunos));
    toast({
      title: "Aluno cadastrado com sucesso!",
      description: `${aluno.name} (${aluno.registration}) adicionado.`,
    });
    setMode("viewAttendance");
    setFoundStudent(aluno);
    setAttendanceDraft([]);
    registerForm.reset();
  }

  function handleSearchAttendance(data: { registration: string }) {
    const aluno = findStudentByRegistration(data.registration.trim());
    if (!aluno) {
      toast({
        title: "Aluno não encontrado",
        description: "Matrícula não localizada.",
        variant: "destructive",
      });
      setFoundStudent(null);
      setAttendanceDraft([]);
      return;
    }
    setFoundStudent(aluno);
    setAttendanceDraft(aluno.attendance ?? []);
    setMode("viewAttendance");
  }

  function handleSaveAttendance() {
    if (!foundStudent) return;
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]") as RegisteredStudent[];
    const idx = alunos.findIndex(stu => stu.id === foundStudent.id);
    if (idx >= 0) {
      alunos[idx] = { ...alunos[idx], attendance: attendanceDraft };
      localStorage.setItem("alunosDashboard", JSON.stringify(alunos));
      toast({
        title: "Frequência salva!",
        description: `${foundStudent.name} (${foundStudent.registration}) teve presença salva.`,
      });
      setFoundStudent(alunos[idx]);
    }
  }

  function handleRegistrationInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    registerForm.setValue("registration", value);
    setRegistrationInput(value);

    if (value.length >= 3) {
      const exists = findStudentByRegistration(value);
      if (exists) {
        pendingFormDataRef.current = registerForm.getValues();
        setFoundStudent(exists);
        setMode("duplicateModal");
      }
    }
  }

  // Renderização do calendário interativo ajustado para PRESENÇA/FALTA (verde/vermelho)
  function renderAttendanceCalendar(student: RegisteredStudent, localAttendance: { date: string; type: "presenca" | "falta" }[], setLocalAttendance: (v: { date: string; type: "presenca" | "falta" }[]) => void, allowEdit = true) {
    const monthWorkingDates = getWorkingDatesOfMonth(student.teachingDays);

    // Organiza por semanas
    const weeks: Date[][] = [];
    let week: Date[] = [];
    let lastWeekNumber: number | null = null;
    monthWorkingDates.forEach((date, i) => {
      const weekNumber = Math.floor((date.getDate() + getDay(startOfMonth(date)) - 1) / 7);
      if (lastWeekNumber !== null && weekNumber !== lastWeekNumber) {
        weeks.push(week);
        week = [];
      }
      week.push(date);
      lastWeekNumber = weekNumber;
      if (i === monthWorkingDates.length - 1) weeks.push(week);
    });

    const today = new Date();

    function isPastOrToday(date: Date) {
      return isBefore(date, today) || isToday(date);
    }

    function togglePresenceType(date: Date) {
      if (!allowEdit) return;
      const iso = date.toISOString().slice(0, 10);
      if (!isPastOrToday(date)) return;
      const index = localAttendance.findIndex(a => a.date === iso);
      let newValue: { date: string; type: "presenca" | "falta" }[] = [];
      if (index === -1) {
        newValue = [...localAttendance, { date: iso, type: "presenca" }];
      } else if (localAttendance[index].type === "presenca") {
        // torna falta
        newValue = localAttendance.map((a, i) =>
          i === index ? { ...a, type: "falta" } : a
        );
      } else {
        // remove
        newValue = localAttendance.filter((a, i) => i !== index);
      }
      setLocalAttendance(newValue);
    }

    return (
      <div ref={calendarRef}>
        <div className="mb-4">
          <div className="flex gap-2 text-sm mb-2 text-muted-foreground">
            {Object.values(dayIndexToName).map(day => (
              <span key={day} className="flex-1 text-center">{day}</span>
            ))}
          </div>
          {weeks.map((dias, wi) => (
            <div key={wi} className="flex gap-2 mb-2">
              {[1,2,3,4,5].map(idx => {
                const dia = dias.find(d => getDay(d) === idx);
                if (!dia) return <div className="flex-1 h-10" key={idx}></div>;
                const iso = dia.toISOString().slice(0,10);
                const registro = localAttendance.find(a => a.date === iso);
                const marcado = !!registro;
                const falta = registro?.type === "falta";
                const presenca = registro?.type === "presenca";
                const blocked = !isPastOrToday(dia) || !allowEdit;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => togglePresenceType(dia)}
                    disabled={blocked}
                    className={`flex-1 rounded p-2 h-10 border text-sm transition-colors
                      ${presenca ? "bg-green-500 text-white border-green-600" : ""}
                      ${falta ? "bg-red-500 text-white border-red-600" : ""}
                      ${!marcado && !blocked ? "bg-white border-gray-300" : ""}
                      ${blocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    title={format(dia, "EEEE',' dd/MM/yyyy", { locale: ptBR })}
                  >
                    {format(dia, "dd")}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 inline-block mr-1"></div> Presença &nbsp;|&nbsp;
            <div className="w-4 h-4 rounded bg-red-500 inline-block mr-1"></div> Falta &nbsp;|&nbsp;
            <div className="w-4 h-4 rounded border border-gray-300 bg-white inline-block ml-2 mr-1"></div> Não marcado &nbsp;|&nbsp;
            <div className="w-4 h-4 rounded border bg-gray-100 opacity-30 inline-block ml-2 mr-1"></div> Futuro/bloqueado
          </div>
        </div>
        {allowEdit && (
          <Button className="w-full" type="button" onClick={handleSaveAttendance}>
            Salvar Frequência do Aluno
          </Button>
        )}
      </div>
    );
  }

  // Totais de presença/falta baseado no attendanceDraft
  function getTotals(teachingDays: number[], attendanceArr: { date: string; type: "presenca" | "falta" }[]) {
    const validDays = getWorkingDatesOfMonth(teachingDays)
      .map(date => date.toISOString().slice(0, 10));
    let presencas = 0;
    let faltas = 0;
    validDays.forEach(d => {
      const reg = attendanceArr.find(a => a.date === d);
      if (reg?.type === "presenca") presencas +=1;
      else if (reg?.type === "falta") faltas +=1;
    });
    return { presencas, faltas, total: validDays.length };
  }

  // --- Painel principal por modo ---
  let content: React.ReactNode = null;
  switch (mode) {
    case "initial":
      content = (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário de Cadastro */}
          <div>
            <h3 className="text-lg font-bold mb-2">Cadastrar Novo Aluno</h3>
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Aluno</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Matrícula do aluno"
                          {...field}
                          value={registerForm.watch("registration")}
                          onChange={handleRegistrationInputChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da escola" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turma</FormLabel>
                      <FormControl>
                        <Input placeholder="Turma (ex: 9º Ano A)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="teachingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias da Semana que Você Leciona</FormLabel>
                      <div className="flex gap-3">
                        {daysOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={field.value.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, option.value]);
                                } else {
                                  field.onChange(field.value.filter((v) => v !== option.value));
                                }
                              }}
                              className="accent-primary mr-1"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit">
                  Cadastrar Aluno
                </Button>
              </form>
            </Form>
          </div>
          {/* Consulta de Frequência por Matrícula */}
          <div>
            <h3 className="text-lg font-bold mb-2">Acessar Frequência por Matrícula</h3>
            <Form {...searchForm}>
              <form
                onSubmit={searchForm.handleSubmit(handleSearchAttendance)}
                className="space-y-4"
              >
                <FormField
                  control={searchForm.control}
                  name="registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula do Aluno</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite a matrícula"
                          {...field}
                          value={searchForm.watch("registration")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit">
                  Buscar Frequência
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
      break;
    case "duplicateModal":
      content = (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Matrícula já cadastrada!</AlertDialogTitle>
              <AlertDialogDescription>
                A matrícula informada já existe no sistema.<br />
                Deseja visualizar os dados de frequência deste aluno?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setMode("initial");
                setFoundStudent(null);
                setAttendanceDraft([]);
              }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setMode("viewAttendance");
                  setAttendanceDraft(foundStudent?.attendance || []);
                }}
              >
                Visualizar Presença
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      break;
    case "viewAttendance":
      if (!foundStudent) {
        content = (
          <div className="text-center py-10">
            <p>Nenhum aluno selecionado.</p>
            <Button className="mt-6" onClick={() => setMode("initial")}>
              Voltar
            </Button>
          </div>
        );
      } else {
        // Cálculo de totais
        const { presencas, faltas, total } = getTotals(foundStudent.teachingDays, attendanceDraft);
        content = (
          <div>
            <div className="mb-4 grid md:grid-cols-2 gap-2">
              <div>
                <div className="text-base font-bold mb-1">{foundStudent.name}</div>
                <div className="text-sm text-muted-foreground mb-1">Matrícula: <b>{foundStudent.registration}</b></div>
                <div className="text-sm text-muted-foreground mb-1">Turma: <b>{foundStudent.class}</b></div>
                <div className="text-sm text-muted-foreground mb-1">
                  Dias de aula:{" "}
                  {foundStudent.teachingDays.map(idx => dayIndexToName[idx]).join(", ")}
                </div>
                <div className="text-sm text-muted-foreground">Escola: {foundStudent.school}</div>
              </div>
              <div className="flex items-end justify-end gap-2 flex-wrap">
                <Button variant="secondary" onClick={() => setMode("initial")}>Voltar</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (!calendarRef.current) return;
                    await exportAttendanceToPDF(calendarRef.current, foundStudent, presencas, faltas);
                    toast({
                      title: "PDF gerado!",
                      description: "O arquivo foi exportado. Confira seus downloads.",
                    });
                  }}
                >
                  Exportar para PDF
                </Button>
              </div>
            </div>
            <div className="mb-2">
              <h4 className="font-medium mb-2">Calendário de Frequência</h4>
              <div className="mb-2 text-[15px]">
                <b>Presenças:</b> <span className="text-green-600">{presencas}</span> &nbsp;
                <b>Faltas:</b> <span className="text-red-600">{faltas}</span> &nbsp;
                <b>Total de dias:</b> {total}
              </div>
              {renderAttendanceCalendar(
                foundStudent,
                attendanceDraft,
                setAttendanceDraft,
                true // permite edição
              )}
            </div>
          </div>
        );
      }
      break;
    default:
      content = null;
  }

  return (
    <DashboardCard title="Cadastro e Frequência do Aluno">
      {content}
    </DashboardCard>
  );
}
