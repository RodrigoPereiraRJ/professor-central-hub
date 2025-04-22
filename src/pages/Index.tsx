
import React from 'react';
import Header from '@/components/Header';
import QuickActions from '@/components/QuickActions';
import WeeklySchedule from '@/components/WeeklySchedule';
import ClassOverview from '@/components/ClassOverview';
import StudentPerformance from '@/components/StudentPerformance';
import RecentSubmissions from '@/components/RecentSubmissions';
import SchoolAnnouncements from '@/components/SchoolAnnouncements';
import ActivityHistory from '@/components/ActivityHistory';
import AttendanceRegistration from '@/components/AttendanceRegistration';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Painel de Controle</h1>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <QuickActions />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <WeeklySchedule />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ClassOverview />
            <StudentPerformance />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AttendanceRegistration />
            <SchoolAnnouncements />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <RecentSubmissions />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <ActivityHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
