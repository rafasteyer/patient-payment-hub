import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Clock, CheckSquare, DollarSign, LayoutDashboard, Moon, Sun, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
 { icon: Users, label: 'Pacientes', path: '/pacientes' },
 { icon: Clock, label: 'Lista de Espera', path: '/espera' },
 { icon: CheckSquare, label: 'Pendências', path: '/pendencias' },
 { icon: DollarSign, label: 'Financeiro', path: '/financeiro' },
 { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
];

export function NavigationTabs() {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [isDark, setIsDark] = useState(false);

 useEffect(() => {
 const root = document.documentElement;
 if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
 root.classList.add('dark');
 setIsDark(true);
 } else {
 root.classList.remove('dark');
 setIsDark(false);
 }
 }, []);

 const toggleTheme = () => {
 const root = document.documentElement;
 if (isDark) {
 root.classList.remove('dark');
 localStorage.theme = 'light';
 setIsDark(false);
 } else {
 root.classList.add('dark');
 localStorage.theme = 'dark';
 setIsDark(true);
 }
 };

 return (
 <nav className="bg-industrial-surface border-b border-industrial-border sticky top-0 z-50 transition-colors">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex justify-between items-center h-16">
 <div className="flex flex-1">
 <div className="flex-shrink-0 flex items-center mr-8">
 <span className="text-xl font-bold text-industrial-accent">Clínica TM</span>
 </div>
 <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
 {NAV_ITEMS.map((item) => (
 <NavLink
 key={item.path}
 to={item.path}
 className={({ isActive }) =>
 clsx(
"inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
 isActive
 ?"border-industrial-accent text-industrial-accent"
 :"border-transparent text-industrial-text-muted hover:text-gray-700 :text-gray-200 hover:border-gray-300 :border-gray-600"
 )
 }
 >
 <item.icon className="w-4 h-4 mr-2"/>
 {item.label}
 </NavLink>
 ))}
 </div>
 </div>
 
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center ml-auto gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-industrial-text-muted hover:text-industrial-accent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                            title="Alternar tema"
                        >
                            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <div className="w-px h-6 bg-industrial-border mx-1"></div>
                        <button
                            onClick={async () => {
                                await signOut();
                                navigate('/login', { replace: true });
                            }}
                            className="p-2 flex items-center gap-2 rounded-lg text-industrial-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none"
                            title={`Sair (${user?.email || ''})`}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
 </div>
 </nav>
 );
}
