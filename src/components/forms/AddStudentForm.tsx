
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const studentFormSchema = z.object({
  name: z.string().min(1, 'Nome do aluno é obrigatório'),
  registration: z.string().min(1, 'Matrícula é obrigatória'),
  class: z.string().min(1, 'Turma é obrigatória'),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export function AddStudentForm() {
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
    // Here you would integrate with your backend
    console.log('Student data:', data);
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
