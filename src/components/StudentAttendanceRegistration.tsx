
import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isSameDay, isAfter, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm, Controller } from "react-hook-form";
import DashboardCard from "./ui/DashboardCard";
import { useToast } from "@/hooks/use-toast";

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

// helpers para identificar dias da semana (Monday=1 ... Friday=5)
function getWorkingDatesOfMonth(selectedDays: number[]) {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });

  // Segunda a Sexta, mas só nos dias marcados pelo professor
  return days.filter((date) => {
    const dow = getDay(date); // domingo=0
    // segunda=1, ... sexta=5
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
  attendance: string[]; // ISO dates
}

export default function StudentAttendanceRegistration() {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "calendar">("form");
  const [currentStudent, setCurrentStudent] = useState<RegisteredStudent | null>(null);
  const [selectedAttendance, setSelectedAttendance] = useState<string[]>([]);

  const form = useForm<StudentAttendanceFormValues>({
    defaultValues: {
      name: "",
      registration: "",
      school: "",
      class: "",
      teachingDays: [],
    },
  });

  // Handle form submit
  function onSubmit(data: StudentAttendanceFormValues) {
    if (data.teachingDays.length === 0) {
      toast({
        title: "Selecione ao menos um dia de aula.",
        variant: "destructive"
      });
      return;
    }
    const aluno: RegisteredStudent = {
      ...data,
      id: Date.now().toString(),
      attendance: []
    };
    setCurrentStudent(aluno);
    setSelectedAttendance([]);
    setStep("calendar");
  }

  // Salva aluno no localStorage (com frequência)
  function handleSaveAttendance() {
    if (!currentStudent) return;
    const alunos = JSON.parse(localStorage.getItem("alunosDashboard") || "[]");
    alunos.push({
      ...currentStudent,
      attendance: selectedAttendance
    });
    localStorage.setItem("alunosDashboard", JSON.stringify(alunos));
    toast({
      title: "Aluno cadastrado com frequência!",
      description: `${currentStudent.name} foi cadastrado com frequência inicial de ${selectedAttendance.length} dias.`,
      variant: "default"
    });
    setStep("form");
    setCurrentStudent(null);
    setSelectedAttendance([]);
    form.reset();
  }

  // Função de renderização do calendário interativo
  function renderCalendar() {
    if (!currentStudent) return null;
    const monthWorkingDates = getWorkingDatesOfMonth(currentStudent.teachingDays);

    // Agrupar dias por semana
    const weeks = [];
    let week: Date[] = [];
    let lastWeekNumber = null;
    monthWorkingDates.forEach((date, i) => {
      const weekNumber = Math.floor((date.getDate() + getDay(startOfMonth(date)) - 1) / 7);
      if (lastWeekNumber !== null && weekNumber !== lastWeekNumber) {
        weeks.push(week);
        week = [];
      }
      week.push(date);
      lastWeekNumber = weekNumber;
      // Adiciona a última semana:
      if (i === monthWorkingDates.length - 1) weeks.push(week);
    });

    const today = new Date();

    function isPastOrToday(date: Date) {
      return isBefore(date, today) || isToday(date);
    }

    function togglePresence(date: Date) {
      const iso = date.toISOString().slice(0, 10);
      if (!isPastOrToday(date)) return;
      setSelectedAttendance((prev) =>
        prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
      );
    }

    return (
      <div>
        <div className="mb-4">
          <div className="flex gap-2 text-sm mb-2 text-muted-foreground">
            {Object.values(dayIndexToName).map(day => (
              <span key={day} className="flex-1 text-center">{day}</span>
            ))}
          </div>
          {/* Renderização das semanas */}
          {weeks.map((dias, wi) => (
            <div key={wi} className="flex gap-2 mb-2">
              {[1,2,3,4,5].map(idx => {
                // acha o dia dentro desta semana com o dia da semana certo
                const dia = dias.find(d => getDay(d) === idx);
                if (!dia) {
                  return <div className="flex-1 h-10" key={idx}></div>;
                }
                const iso = dia.toISOString().slice(0,10);
                const marcado = selectedAttendance.includes(iso);
                const blocked = !isPastOrToday(dia);

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
        <Button className="w-full" type="button" onClick={handleSaveAttendance}>
          Salvar Frequência do Aluno
        </Button>
      </div>
    );
  }

  return (
    <DashboardCard title="Cadastro e Frequência do Aluno">
      {step === "form" && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <FormField
              control={form.control}
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
              control={form.control}
              name="registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="Matrícula do aluno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              Avançar para Frequência
            </Button>
          </form>
        </Form>
      )}
      {step === "calendar" && renderCalendar()}
    </DashboardCard>
  );
}
