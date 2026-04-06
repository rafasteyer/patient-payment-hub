import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/'           },
  { label: 'Pacientes',      path: '/pacientes'  },
  { label: 'Lista de Espera',path: '/espera'     },
  { label: 'Pendências',     path: '/pendencias' },
  { label: 'Financeiro',     path: '/financeiro' },
];

export function TopBar() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    if (dark) { root.classList.add('dark'); setIsDark(true); }
    else       { root.classList.remove('dark'); setIsDark(false); }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !isDark;
    root.classList.toggle('dark', next);
    localStorage.theme = next ? 'dark' : 'light';
    setIsDark(next);
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'TM';

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Usuário';

  return (
    <header className="app-topbar">
      {/* Brand name */}
      <span className="text-lg font-bold text-brand mr-6 select-none tracking-tight">
        Clínica TM
      </span>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              clsx('topnav-link', isActive && 'active')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Alternar tema"
          className="sidebar-btn"
        >
          {isDark
            ? <Sun  size={18} strokeWidth={1.8} className="text-amber-400" />
            : <Moon size={18} strokeWidth={1.8} />}
        </button>

        {/* Notification bell */}
        <button className="sidebar-btn" title="Notificações">
          <Bell size={18} strokeWidth={1.8} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User avatar + name */}
        <div className="flex items-center gap-2 cursor-default select-none">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col leading-none">
            <span className="text-sm font-semibold text-text">{displayName}</span>
            <span className="text-xs text-text-muted truncate max-w-[140px]">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
