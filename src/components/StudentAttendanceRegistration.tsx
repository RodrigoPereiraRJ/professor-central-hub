
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
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  attendance: string[];
}

type PanelMode = "initial" | "register" | "duplicateModal" | "viewAttendance";

export default function StudentAttendanceRegistration() {
  const { toast } = useToast();
  const [mode, setMode] = useState<PanelMode>("initial");
  const [foundStudent, setFoundStudent] = useState<RegisteredStudent | null>(null);
  const [attendanceDraft, setAttendanceDraft] = useState<string[]>([]);
  const [registrationInput, setRegistrationInput] = useState<string>("");
  const pendingFormDataRef = useRef<StudentAttendanceFormValues | null>(null); // para guardar tentativa de novo cadastro

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

  // --- Lógica de busca em storage
  function findStudentByRegistration(mat: string): RegisteredStudent | undefined {
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]");
    return alunos.find((stu: RegisteredStudent) => stu.registration === mat);
  }

  // --- SUBMISSÃO DO FORMULÁRIO DE CADASTRO ---
  function handleRegister(data: StudentAttendanceFormValues) {
    // Checagem automática de matrícula duplicada
    const cadastroExistente = findStudentByRegistration(data.registration);
    if (cadastroExistente) {
      pendingFormDataRef.current = data; // salva tentativa, pode ser útil depois
      setFoundStudent(cadastroExistente);
      setMode("duplicateModal"); // aciona modal
      return;
    }
    // Normal: salva novo aluno
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

  // --- SUBMISSÃO FORMULÁRIO CONSULTA ---
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

  // --- Atualizar frequência e salvar ---
  function handleSaveAttendance() {
    if (!foundStudent) return;
    // Atualiza storage
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]") as RegisteredStudent[];
    const idx = alunos.findIndex(stu => stu.id === foundStudent.id);
    if (idx >= 0) {
      alunos[idx] = { ...alunos[idx], attendance: attendanceDraft };
      localStorage.setItem("alunosDashboard", JSON.stringify(alunos));
      toast({
        title: "Frequência salva!",
        description: `${foundStudent.name} (${foundStudent.registration}) teve presença salva.`,
      });
      // Atualiza state para refletir mudanças
      setFoundStudent(alunos[idx]);
    }
  }

  // --- Monitoramento em tempo real do campo matrícula no cadastro para verificação ---
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

  // --- Renderização do calendário interativo ---
  function renderAttendanceCalendar(student: RegisteredStudent, localAttendance: string[], setLocalAttendance: (v: string[]) => void, allowEdit = true) {
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

    function togglePresence(date: Date) {
      if (!allowEdit) return;
      const iso = date.toISOString().slice(0, 10);
      if (!isPastOrToday(date)) return;
      setLocalAttendance((prev) =>
        prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]);
    }

    return (
      <div>
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
                const marcado = localAttendance.includes(iso);
                const blocked = !isPastOrToday(dia) || !allowEdit;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => togglePresence(dia)}
                    disabled={blocked}
                    className={`flex-1 rounded p-2 h-10 border text-sm transition-colors
                      ${marcado ? "bg-green-500 text-white border-green-600" : "bg-white border-gray-300"}
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
            <div className="w-4 h-4 rounded bg-green-500 inline-block mr-1"></div> Presença registrada |
            <div className="w-4 h-4 rounded border border-gray-300 bg-white inline-block ml-2 mr-1"></div> Não marcado |
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
      // Modal de duplicidade
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
                  // Vai para painel de frequência daquele aluno
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
              <div className="flex items-end justify-end">
                <Button variant="secondary" onClick={() => setMode("initial")}>Voltar</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Calendário de Frequência</h4>
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
