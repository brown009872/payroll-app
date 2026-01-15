import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { Layout } from './components/Layout';
import { EmployeeList } from './features/employees/EmployeeList';
import { DailyAttendance } from './features/attendance/DailyAttendance';
import { WeeklySummary } from './features/reports/WeeklySummary';
import { ExportPanel } from './features/reports/ExportPanel';
import { ResultSchedule } from './features/schedule/ResultSchedule';
import { S2ALedger } from './features/s2a/S2ALedger';

function App() {
  const [activeTab, setActiveTab] = useState('s2a');
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
      case 's2a':
        return <S2ALedger />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <DailyAttendance />;
      case 'result-schedule':
        return <ResultSchedule />;
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
