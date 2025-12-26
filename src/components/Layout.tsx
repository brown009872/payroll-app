import React from 'react';
import { Users, Calendar, BarChart3, FileText, CalendarRange } from 'lucide-react';
import { cn } from './ui/Button';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
    const navigation = [
        { name: 'Employees', id: 'employees', icon: Users },
        { name: 'Daily Attendance', id: 'attendance', icon: Calendar },
        { name: 'Work Schedule', id: 'schedule', icon: CalendarRange },
        { name: 'Weekly Summary', id: 'summary', icon: BarChart3 },
        { name: 'Export', id: 'export', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-blue-600">Payroll App</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navigation.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onTabChange(item.id)}
                                        className={cn(
                                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                                            activeTab === item.id
                                                ? 'border-blue-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        )}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-10">
                <main>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
