import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckSquare, DollarSign, LayoutDashboard, LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/'           },
  { icon: Users,           label: 'Pacientes',       path: '/pacientes'  },
  { icon: Clock,           label: 'Lista de Espera', path: '/espera'     },
  { icon: CheckSquare,     label: 'Pendências',      path: '/pendencias' },
  { icon: DollarSign,      label: 'Financeiro',      path: '/financeiro' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <aside className="app-sidebar">
      {/* Logo mark */}
      <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white font-bold text-base select-none">
        TM
      </div>

      {/* Nav icons */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={label}
            className={({ isActive }) =>
              clsx('sidebar-btn', isActive && 'active')
            }
          >
            <Icon size={20} strokeWidth={1.8} />
          </NavLink>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col gap-1 mt-auto">
        <div className="w-8 h-px bg-sidebar-border mx-auto mb-2" />
        <button
          onClick={async () => {
            await signOut();
            navigate('/login', { replace: true });
          }}
          title="Sair"
          className="sidebar-btn text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
        >
          <LogOut size={18} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
