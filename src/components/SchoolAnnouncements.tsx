
import React, { useState, useEffect } from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Bell, Calendar, FileText, Info, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementProps {
  id: string;
  title: string;
  date: string;
  type: 'info' | 'reminder' | 'meeting' | 'event';
  hasAttachment?: boolean;
}

const typeConfig = {
  info: {
    icon: <Info size={16} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  reminder: {
    icon: <Bell size={16} />,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  meeting: {
    icon: <Calendar size={16} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  event: {
    icon: <Calendar size={16} />,
    color: 'bg-green-100 text-green-700 border-green-200'
  }
};

const Announcement = ({ title, date, type, hasAttachment, id, onDelete }: AnnouncementProps & { onDelete?: (id: string) => void }) => {
  return (
    <div className="flex items-start p-3 border rounded-lg">
      <div className={`p-2 rounded-full ${typeConfig[type].color} mr-3`}>
        {typeConfig[type].icon}
      </div>
      <div className="flex-grow">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
      {hasAttachment && (
        <Button variant="ghost" size="sm" className="mt-1">
          <FileText size={14} className="mr-1" />
          <span className="text-xs">Anexo</span>
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" className="mt-1 text-red-500 hover:text-red-700" onClick={() => onDelete(id)}>
          <Trash2 size={14} />
        </Button>
      )}
    </div>
  );
};

const announcementFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['info', 'reminder', 'meeting', 'event'], {
    required_error: 'Tipo é obrigatório',
  }),
  hasAttachment: z.boolean().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

const SchoolAnnouncements = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementProps[]>([]);
  
  useEffect(() => {
    const storedAnnouncements = localStorage.getItem('announcements');
    if (storedAnnouncements) {
      setAnnouncements(JSON.parse(storedAnnouncements));
    }
  }, []);
  
  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      date: '',
      type: 'info',
      hasAttachment: false,
    },
  });
  
  const onSubmit = (data: AnnouncementFormValues) => {
    const newAnnouncement: AnnouncementProps = {
      id: Date.now().toString(),
      ...data,
    };
    
    const updatedAnnouncements = [...announcements, newAnnouncement];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    
    toast({
      title: "Aviso adicionado!",
      description: "O aviso foi adicionado com sucesso.",
    });
    
    form.reset();
  };
  
  const handleDeleteAnnouncement = (id: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    
    toast({
      title: "Aviso removido!",
      description: "O aviso foi removido com sucesso.",
    });
  };

  return (
    <DashboardCard 
      title="Avisos da Coordenação"
      headerClassName="flex items-center justify-between"
    >
      <div className="flex justify-end mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Adicionar Aviso
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Adicionar Novo Aviso</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do aviso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 30/04/2025 às 14:00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="info">Informação</SelectItem>
                            <SelectItem value="reminder">Lembrete</SelectItem>
                            <SelectItem value="meeting">Reunião</SelectItem>
                            <SelectItem value="event">Evento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasAttachment"
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
                          <FormLabel>Tem anexo</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Adicionar Aviso
                  </Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum aviso cadastrado</p>
            <p className="text-sm">Adicione avisos para que apareçam aqui</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Announcement 
              key={announcement.id} 
              {...announcement} 
              onDelete={handleDeleteAnnouncement}
            />
          ))
        )}
      </div>
    </DashboardCard>
  );
};

export default SchoolAnnouncements;
