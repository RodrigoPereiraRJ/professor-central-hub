
import React, { useState } from "react";
import { BookText, FileText, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "./ui/DashboardCard";
import LaunchGradeModal from "./LaunchGradeModal";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  variant: "blue" | "yellow" | "red" | "purple";
}

const colorVariants = {
  blue: "bg-dashboard-blue-light text-dashboard-blue hover:bg-dashboard-blue hover:text-white",
  yellow: "bg-dashboard-yellow-light text-dashboard-yellow-dark hover:bg-dashboard-yellow hover:text-white",
  red: "bg-dashboard-red-light text-dashboard-red hover:bg-dashboard-red hover:text-white",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white",
};

const ActionCard = ({ icon, title, onClick, variant }: ActionCardProps) => {
  return (
    <Button
      variant="ghost"
      className={`h-full p-4 flex flex-col items-center justify-center gap-3 rounded-lg transition-all ${colorVariants[variant]}`}
      onClick={onClick}
    >
      <div className="text-2xl">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
    </Button>
  );
};

const QuickActions = () => {
  const [gradeModalOpen, setGradeModalOpen] = useState(false);

  return (
    <>
      <DashboardCard title="Atalhos Rápidos">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            icon={<BookText size={24} />}
            title="Lançar Nota"
            variant="blue"
            onClick={() => setGradeModalOpen(true)}
          />
          <ActionCard
            icon={<FileText size={24} />}
            title="Criar Atividade"
            variant="yellow"
            onClick={() => { /* logic */ }}
          />
          <ActionCard
            icon={<Upload size={24} />}
            title="Enviar Material"
            variant="red"
            onClick={() => { /* logic */ }}
          />
          <ActionCard
            icon={<MessageSquare size={24} />}
            title="Mensagens"
            variant="purple"
            onClick={() => { /* logic */ }}
          />
        </div>
      </DashboardCard>
      <LaunchGradeModal open={gradeModalOpen} onClose={() => setGradeModalOpen(false)} />
    </>
  );
};

export default QuickActions;
