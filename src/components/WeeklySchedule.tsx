
import React, { useState, useEffect } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

interface ScheduleItemProps {
  id: string;
  time: string;
  subject: string;
  class: string;
  school: string;
  description: string;
  hasAlert?: boolean;
  alertType?: "attendance" | "grades" | "material";
}

const alertTypes = {
  attendance: {
    text: 'Frequência não registrada',
    color: 'bg-orange-100 text-orange-700'
  },
  grades: {
    text: 'Notas pendentes',
    color: 'bg-red-100 text-red-700'
  },
  material: {
    text: 'Material a enviar',
    color: 'bg-blue-100 text-blue-700'
  }
};

const ScheduleItem = ({ 
  id, 
  time, 
  subject, 
  class: className, 
  school,
  description,
  hasAlert, 
  alertType,
  onDelete 
}: ScheduleItemProps & { onDelete?: (id: string) => void }) => {
  return (
    <div className="flex items-start p-2 border-l-4 border-dashboard-blue mb-2 bg-white rounded-r shadow-sm hover:shadow transition-all cursor-pointer relative group">
      <div className="w-16 text-xs font-medium text-gray-500">{time}</div>
      <div className="flex-grow">
        <div className="font-medium">{subject}</div>
        <div className="text-sm text-gray-500">{className}</div>
        <div className="text-xs text-gray-400">{school}</div>
        <div className="text-xs text-gray-800 mt-1 italic">{description}</div>
        {hasAlert && alertType && (
          <Badge variant="outline" className={`mt-1 ${alertTypes[alertType].color}`}>
            {alertTypes[alertType].text}
          </Badge>
        )}
      </div>
      {onDelete && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 h-6 w-6 p-0"
          onClick={() => onDelete(id)}
        >
          <Trash2 size={14} />
        </Button>
      )}
    </div>
  );
};

const weekDays = [
  { label: 'Segunda', value: 'segunda' },
  { label: 'Terça', value: 'terca' },
  { label: 'Quarta', value: 'quarta' },
  { label: 'Quinta', value: 'quinta' },
  { label: 'Sexta', value: 'sexta' },
];

const WeekDayColumn = ({ 
  day, 
  date, 
  items, 
  onDelete 
}: { 
  day: string; 
  date: string; 
  items: ScheduleItemProps[]; 
  onDelete?: (id: string) => void 
}) => {
  return (
    <div className="flex-1 min-w-[230px]">
      <div className="text-center mb-2">
        <div className="font-medium">{day}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <ScheduleItem key={item.id} {...item} onDelete={onDelete} />
        ))}
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            Nenhuma aula agendada
          </div>
        )}
      </div>
    </div>
  );
};

const scheduleFormSchema = z.object({
  day: z.string({ required_error: "Selecione um dia da semana" }),
  time: z.string().min(1, 'Horário é obrigatório'),
  subject: z.string().min(1, 'Disciplina é obrigatória'),
  class: z.string().min(1, 'Turma é obrigatória'),
  school: z.string().min(1, 'Escola é obrigatória'),
  description: z.string().min(1, "Descrição da aula é obrigatória"),
  hasAlert: z.boolean().optional(),
  alertType: z.enum(["attendance", "grades", "material"]).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const getFormattedDate = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay() + 1 + dayOffset);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const WeeklySchedule = () => {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<Record<string, ScheduleItemProps[]>>({
    segunda: [],
    terca: [],
    quarta: [],
    quinta: [],
    sexta: [],
  });

  useEffect(() => {
    const storedSchedule = localStorage.getItem('weeklySchedule');
    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      day: '',
      time: '',
      subject: '',
      class: '',
      school: '',
      description: '',
      hasAlert: false,
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    const { day, ...itemData } = data;

    const newItem: ScheduleItemProps = {
      id: Date.now().toString(),
      ...itemData,
    };

    const updatedSchedule = {
      ...schedule,
      [day]: [...(schedule[day] || []), newItem],
    };

    setSchedule(updatedSchedule);
    localStorage.setItem('weeklySchedule', JSON.stringify(updatedSchedule));

    toast({
      title: "Aula agendada!",
      description: `${data.subject} (${data.description}) para ${data.class} foi agendada para ${weekDays.find(d => d.value === day)?.label}.`,
    });

    form.reset();
  };

  const handleDeleteScheduleItem = (day: string, id: string) => {
    const updatedDaySchedule = schedule[day].filter(item => item.id !== id);

    const updatedSchedule = {
      ...schedule,
      [day]: updatedDaySchedule,
    };

    setSchedule(updatedSchedule);
    localStorage.setItem('weeklySchedule', JSON.stringify(updatedSchedule));

    toast({
      title: "Aula removida!",
      description: "A aula foi removida da agenda.",
    });
  };

  return (
    <DashboardCard
      title="Agenda da Semana"
      headerClassName="flex items-center justify-between"
      contentClassName="overflow-x-auto"
    >
      <div className="flex justify-end mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Adicionar Aula
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Aula na Agenda</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia da Semana</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {weekDays.map((day) => (
                              <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 07:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disciplina</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Matemática" {...field} />
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
                          <Input placeholder="Ex: 9º Ano A" {...field} />
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
                        <FormLabel>Escola</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da escola" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da aula</FormLabel>
                        <FormControl>
                          <Input placeholder="Resumo, tema ou objetivo da aula" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasAlert"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-gray-300 text-dashboard-blue focus:ring-dashboard-blue"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tem alerta</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {form.watch('hasAlert') && (
                    <FormField
                      control={form.control}
                      name="alertType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Alerta</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de alerta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="attendance">Frequência</SelectItem>
                              <SelectItem value="grades">Notas</SelectItem>
                              <SelectItem value="material">Material</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <Button type="submit" className="w-full">
                    Adicionar Aula
                  </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {weekDays.map((day, index) => (
          <WeekDayColumn
            key={day.value}
            day={day.label}
            date={getFormattedDate(index)}
            items={schedule[day.value] || []}
            onDelete={(id) => handleDeleteScheduleItem(day.value, id)}
          />
        ))}
      </div>
    </DashboardCard>
  );
};

export default WeeklySchedule;
