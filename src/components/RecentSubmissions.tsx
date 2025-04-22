
import React from 'react';
import DashboardCard from './ui/DashboardCard';
import { FileText } from 'lucide-react';

const RecentSubmissions = () => {
  return (
    <DashboardCard title="Últimas Entregas de Atividades">
      <div className="text-center py-8 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p>Nenhuma entrega pendente</p>
        <p className="text-sm">As entregas dos alunos aparecerão aqui</p>
      </div>
    </DashboardCard>
  );
};

export default RecentSubmissions;
