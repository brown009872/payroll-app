import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { Layout } from './components/Layout';
import { EmployeeList } from './features/employees/EmployeeList';
import { DailyAttendance } from './features/attendance/DailyAttendance';

import { WeeklySummary } from './features/reports/WeeklySummary';
import { ExportPanel } from './features/reports/ExportPanel';
import { WorkSchedule } from './features/schedule/WorkSchedule';

function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const { fetchInitialData, subscribeToRealtime, unsubscribeRealtime, isLoading } = useAppStore();

  useEffect(() => {
    fetchInitialData();
    subscribeToRealtime();
    return () => {
      unsubscribeRealtime();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading data...</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <DailyAttendance />;
      case 'schedule':
        return <WorkSchedule />;
      case 'summary':
        return <WeeklySummary />;
      case 'export':
        return <ExportPanel />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
