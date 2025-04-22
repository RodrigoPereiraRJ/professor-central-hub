
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { Badge } from "@/components/ui/badge";
import { Calendar } from 'lucide-react';

interface ScheduleItemProps {
  time: string;
  subject: string;
  class: string;
  hasAlert?: boolean;
  alertType?: 'attendance' | 'grades' | 'material';
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

const ScheduleItem = ({ time, subject, class: className, hasAlert, alertType }: ScheduleItemProps) => {
  return (
    <div className="flex items-start p-2 border-l-4 border-dashboard-blue mb-2 bg-white rounded-r shadow-sm hover:shadow transition-all cursor-pointer">
      <div className="w-16 text-xs font-medium text-gray-500">{time}</div>
      <div className="flex-grow">
        <div className="font-medium">{subject}</div>
        <div className="text-sm text-gray-500">{className}</div>
        {hasAlert && alertType && (
          <Badge variant="outline" className={`mt-1 ${alertTypes[alertType].color}`}>
            {alertTypes[alertType].text}
          </Badge>
        )}
      </div>
    </div>
  );
};

const WeekDayColumn = ({ day, date, items }: { day: string; date: string; items: ScheduleItemProps[] }) => {
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="text-center mb-2">
        <div className="font-medium">{day}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <ScheduleItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

const WeeklySchedule = () => {
  // This would normally come from an API or state
  const scheduleData = [
    {
      day: 'Segunda',
      date: '22/04',
      items: [
        { time: '07:30', subject: 'Matemática', class: '9º Ano A', hasAlert: true, alertType: 'attendance' },
        { time: '10:15', subject: 'Matemática', class: '8º Ano B' }
      ]
    },
    {
      day: 'Terça',
      date: '23/04',
      items: [
        { time: '07:30', subject: 'Matemática', class: '7º Ano C' },
        { time: '10:15', subject: 'Matemática', class: '9º Ano A', hasAlert: true, alertType: 'grades' }
      ]
    },
    {
      day: 'Quarta',
      date: '24/04',
      items: [
        { time: '07:30', subject: 'Matemática', class: '8º Ano B' },
        { time: '10:15', subject: 'Matemática', class: '7º Ano C', hasAlert: true, alertType: 'material' }
      ]
    },
    {
      day: 'Quinta',
      date: '25/04',
      items: [
        { time: '07:30', subject: 'Matemática', class: '9º Ano A' },
        { time: '10:15', subject: 'Matemática', class: '8º Ano B' }
      ]
    },
    {
      day: 'Sexta',
      date: '26/04',
      items: [
        { time: '07:30', subject: 'Matemática', class: '7º Ano C' },
        { time: '10:15', subject: 'Reunião', class: 'Coordenação' }
      ]
    }
  ];

  return (
    <DashboardCard 
      title="Agenda da Semana" 
      headerClassName="flex items-center justify-between"
      contentClassName="overflow-x-auto"
    >
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {scheduleData.map((day, index) => (
          <WeekDayColumn 
            key={index} 
            day={day.day} 
            date={day.date} 
            items={day.items} 
          />
        ))}
      </div>
    </DashboardCard>
  );
};

export default WeeklySchedule;
