
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText } from 'lucide-react';

interface SubmissionProps {
  id: string;
  activity: string;
  class: string;
  date: string;
  status: 'pending' | 'graded';
  submissions: number;
  total: number;
}

const RecentSubmissions = () => {
  // Sample data - in a real app this would come from an API
  const submissions: SubmissionProps[] = [
    {
      id: '1',
      activity: 'Trabalho em Grupo: Frações',
      class: '9º Ano A',
      date: '20/04/2025',
      status: 'pending',
      submissions: 28,
      total: 32
    },
    {
      id: '2',
      activity: 'Lista de Exercícios: Equações',
      class: '8º Ano B',
      date: '18/04/2025',
      status: 'graded',
      submissions: 25,
      total: 28
    },
    {
      id: '3',
      activity: 'Avaliação Bimestral',
      class: '7º Ano C',
      date: '17/04/2025',
      status: 'pending',
      submissions: 27,
      total: 30
    },
    {
      id: '4',
      activity: 'Exercícios: Geometria',
      class: '9º Ano A',
      date: '15/04/2025',
      status: 'graded',
      submissions: 30,
      total: 32
    }
  ];

  return (
    <DashboardCard title="Últimas Entregas de Atividades">
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div 
            key={submission.id} 
            className="p-3 flex items-center justify-between border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${
                submission.status === 'pending' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {submission.status === 'pending' ? (
                  <Clock size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
              </div>
              <div>
                <div className="font-medium flex items-center">
                  {submission.activity}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {submission.class}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Entregue em: {submission.date} • {submission.submissions} de {submission.total} entregas
                </div>
              </div>
            </div>
            <Button 
              variant={submission.status === 'pending' ? 'default' : 'outline'} 
              size="sm" 
              className="whitespace-nowrap"
            >
              <FileText size={14} className="mr-1" />
              {submission.status === 'pending' ? 'Corrigir' : 'Ver'}
            </Button>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default RecentSubmissions;
