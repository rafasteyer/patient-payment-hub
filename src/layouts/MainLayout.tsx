import { Outlet } from 'react-router-dom';
import { NavigationTabs } from '../components/NavigationTabs';

export function MainLayout() {
 return (
 <div className="min-h-screen bg-industrial-bg text-industrial-text font-sans flex flex-col">
 <NavigationTabs />
 <main className="flex-1 w-full p-4 sm:p-8 overflow-y-auto">
 <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
 <Outlet />
 </div>
 </main>
 </div>
 );
}
