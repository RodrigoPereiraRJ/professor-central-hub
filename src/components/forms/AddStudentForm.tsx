
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/components/StudentPerformance';

const studentFormSchema = z.object({
  name: z.string().min(1, 'Nome do aluno é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  class: z.string().min(1, 'Turma é obrigatória'),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface AddStudentFormProps {
  onAddStudent?: (student: Student) => void;
}

export function AddStudentForm({ onAddStudent }: AddStudentFormProps) {
  const { toast } = useToast();
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      registration: '',
      class: '',
    },
  });

  function onSubmit(data: StudentFormValues) {
    const newStudent: Student = {
      id: Date.now().toString(),
      name: data.name,  // Garantir que name é fornecido
      registration: data.registration,  // Garantir que registration é fornecido
      class: data.class,  // Garantir que class é fornecido
      presenceDays: 0,
      absenceDays: 0,
      attendance: 0,
    };
    
    // Se houver callback, chama-o
    if (onAddStudent) {
      onAddStudent(newStudent);
    } else {
      // Se não, salva diretamente no localStorage
      const storedStudents = localStorage.getItem('students');
      const students = storedStudents ? JSON.parse(storedStudents) : [];
      students.push(newStudent);
      localStorage.setItem('students', JSON.stringify(students));
      
      // Também salvar em alunosDashboard para consistência
      try {
        const alunosDashboard = localStorage.getItem('alunosDashboard');
        const alunos = alunosDashboard ? JSON.parse(alunosDashboard) : [];
        alunos.push({
          id: newStudent.id,
          name: newStudent.name,
          registration: newStudent.registration,
          class: newStudent.class,
          teachingDays: []
        });
        localStorage.setItem('alunosDashboard', JSON.stringify(alunos));
      } catch (e) {
        console.error("Erro ao salvar em alunosDashboard:", e);
      }
    }
    
    toast({
      title: "Aluno adicionado com sucesso!",
      description: `${data.name} foi adicionado à turma ${data.class}.`,
    });
    
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full">
          Adicionar Aluno
        </Button>
      </form>
    </Form>
  );
}
