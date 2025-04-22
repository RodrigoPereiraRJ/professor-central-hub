
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

const DashboardCard = ({
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  children
}: DashboardCardProps) => {
  return (
    <Card className={cn("shadow-sm h-full", className)}>
      <CardHeader className={cn("pb-2", headerClassName)}>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("pt-2", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
