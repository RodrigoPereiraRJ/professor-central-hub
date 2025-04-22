
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { Badge } from "@/components/ui/badge";
import { BookText, Calendar, FileText, History, Upload, Users } from 'lucide-react';

interface ActivityProps {
  id: string;
  action: 'grade' | 'attendance' | 'material' | 'activity' | 'message';
  description: string;
  target: string;
  datetime: string;
}

const actionIcons = {
  grade: <BookText size={16} />,
  attendance: <Calendar size={16} />,
  material: <Upload size={16} />,
  activity: <FileText size={16} />,
  message: <Users size={16} />
};

const actionColors = {
  grade: 'bg-blue-100 text-blue-700',
  attendance: 'bg-green-100 text-green-700',
  material: 'bg-purple-100 text-purple-700',
  activity: 'bg-amber-100 text-amber-700',
  message: 'bg-pink-100 text-pink-700'
};

const ActivityHistory = () => {
  // Sample data - in a real app this would come from an API
  const activities: ActivityProps[] = [
    {
      id: '1',
      action: 'grade',
      description: 'Notas lançadas',
      target: 'Trabalho em Grupo - 9º Ano A',
      datetime: 'Hoje, 10:45'
    },
    {
      id: '2',
      action: 'attendance',
      description: 'Frequência registrada',
      target: 'Aula 20/04 - 8º Ano B',
      datetime: 'Hoje, 09:30'
    },
    {
      id: '3',
      action: 'material',
      description: 'Material enviado',
      target: 'Apostila de Exercícios - 7º Ano C',
      datetime: 'Ontem, 15:20'
    },
    {
      id: '4',
      action: 'activity',
      description: 'Atividade criada',
      target: 'Avaliação Bimestral - 9º Ano A',
      datetime: 'Ontem, 14:15'
    },
    {
      id: '5',
      action: 'message',
      description: 'Mensagem enviada',
      target: 'Responsáveis - 8º Ano B',
      datetime: '19/04, 16:30'
    }
  ];

  return (
    <DashboardCard 
      title="Atividades Recentes" 
      headerClassName="flex items-center"
    >
      <div className="relative pl-6 space-y-0 before:absolute before:left-2.5 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative mb-4">
            <div className={`absolute -left-6 p-1.5 rounded-full ${actionColors[activity.action]}`}>
              {actionIcons[activity.action]}
            </div>
            <div className="pt-0.5">
              <div className="font-medium">{activity.description}</div>
              <div className="text-gray-600 text-sm">{activity.target}</div>
              <div className="text-gray-400 text-xs mt-1">{activity.datetime}</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default ActivityHistory;
