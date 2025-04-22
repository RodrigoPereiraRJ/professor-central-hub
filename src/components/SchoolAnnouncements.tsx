
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, FileText, Info } from 'lucide-react';

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

const Announcement = ({ title, date, type, hasAttachment }: AnnouncementProps) => {
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
    </div>
  );
};

const SchoolAnnouncements = () => {
  // Sample data - in a real app this would come from an API
  const announcements: AnnouncementProps[] = [
    {
      id: '1',
      title: 'Reunião de Conselho de Classe - 2º Bimestre',
      date: '30/04/2025 às 14:00',
      type: 'meeting',
      hasAttachment: true
    },
    {
      id: '2',
      title: 'Prazo final para lançamento de notas',
      date: '05/05/2025',
      type: 'reminder'
    },
    {
      id: '3',
      title: 'Feriado Municipal - Aniversário da Cidade',
      date: '12/05/2025',
      type: 'event'
    }
  ];

  return (
    <DashboardCard 
      title="Avisos da Coordenação"
      headerClassName="flex items-center justify-between"
    >
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <Announcement key={announcement.id} {...announcement} />
        ))}
      </div>
    </DashboardCard>
  );
};

export default SchoolAnnouncements;
