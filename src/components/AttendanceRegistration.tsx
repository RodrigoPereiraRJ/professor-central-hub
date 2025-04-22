
import React, { useState, useEffect } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Search } from 'lucide-react';
import { Student } from './StudentPerformance';

const attendanceFormSchema = z.object({
  name: z.string().min(1, 'Nome do aluno é obrigatório'),
  school: z.string().min(1, 'Nome da escola é obrigatório'),
  class: z.string().min(1, 'Turma é obrigatória'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  attendance: z.number().min(0).max(100).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

const AttendanceRegistration = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  }, []);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      name: '',
      school: '',
      class: '',
      registration: '',
      attendance: 0,
    },
  });

  const searchStudent = () => {
    const { name, registration, class: className } = form.getValues();
    
    // Busca o aluno com base nos critérios preenchidos
    const student = students.find(s => 
      (name && s.name.toLowerCase().includes(name.toLowerCase())) ||
      (registration && s.registration === registration) ||
      (className && s.class === className)
    );
    
    if (student) {
      setFoundStudent(student);
      form.setValue('name', student.name);
      form.setValue('class', student.class);
      form.setValue('registration', student.registration);
      form.setValue('attendance', student.attendance || 0);
      setIsEditing(true);
    } else {
      toast({
        title: "Aluno não encontrado",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
      setFoundStudent(null);
    }
  };

  const onSubmit = (data: AttendanceFormValues) => {
    if (foundStudent) {
      // Atualiza a frequência do aluno existente
      const updatedStudents = students.map(student => {
        if (student.id === foundStudent.id) {
          return { ...student, attendance: data.attendance || 0 };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      toast({
        title: "Frequência atualizada!",
        description: `A frequência de ${data.name} foi atualizada para ${data.attendance}%.`,
      });
      
      // Limpa o formulário e o aluno encontrado
      form.reset();
      setFoundStudent(null);
      setIsEditing(false);
    }
  };

  return (
    <DashboardCard 
      title="Registro de Frequência" 
      icon={<UserCheck className="h-5 w-5" />}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Aluno</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
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
              name="registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de matrícula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {!isEditing ? (
            <Button type="button" onClick={searchStudent} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar Aluno
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <FormLabel>Frequência</FormLabel>
                <div className="flex items-center space-x-4">
                  <div className="flex-grow">
                    <FormField
                      control={form.control}
                      name="attendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <span>%</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Progresso de frequência:</p>
                <Progress 
                  value={form.watch('attendance') || 0} 
                  className="h-2" 
                />
                <p className="text-xs text-right mt-1">{form.watch('attendance') || 0}% de presença</p>
              </div>
              
              <Button type="submit" className="w-full">
                Registrar Frequência
              </Button>
            </div>
          )}
        </form>
      </Form>
    </DashboardCard>
  );
};

export default AttendanceRegistration;
