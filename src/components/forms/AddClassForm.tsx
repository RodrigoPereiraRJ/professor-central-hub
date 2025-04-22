
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { ClassData } from '@/components/ClassOverview';

const classFormSchema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
  subject: z.string().min(1, 'Disciplina é obrigatória'),
  period: z.string().min(1, 'Período é obrigatório'),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

interface AddClassFormProps {
  onAddClass?: (classData: Omit<ClassData, 'id'>) => void;
}

export function AddClassForm({ onAddClass }: AddClassFormProps) {
  const { toast } = useToast();
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      subject: '',
      period: '',
    },
  });

  function onSubmit(data: ClassFormValues) {
    const newClass = {
      ...data,
      students: 0,
      gradesPercentage: 0,
      attendancePercentage: 0,
      hasPendingActivities: false
    };
    
    // Se houver callback, chama-o
    if (onAddClass) {
      onAddClass(newClass);
    } else {
      // Se não, salva diretamente no localStorage
      const storedClasses = localStorage.getItem('classes');
      const classes = storedClasses ? JSON.parse(storedClasses) : [];
      classes.push({
        ...newClass,
        id: Date.now().toString()
      });
      localStorage.setItem('classes', JSON.stringify(classes));
    }
    
    toast({
      title: "Turma criada com sucesso!",
      description: `${data.name} foi adicionada ao sistema.`,
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
              <FormLabel>Nome da Turma</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 9º Ano A" {...field} />
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
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Período</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Matutino" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Adicionar Turma
        </Button>
      </form>
    </Form>
  );
}
