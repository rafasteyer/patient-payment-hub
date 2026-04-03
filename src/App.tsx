import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Finance } from './pages/Finance';
import { Waitlist } from './pages/Waitlist';
import { Tasks } from './pages/Tasks';
import { Login } from './pages/Login';

// Protected Route Wrapper
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Patients />} />
          <Route path="espera" element={<Waitlist />} />
          <Route path="pendencias" element={<Tasks />} />
          <Route path="financeiro" element={<Finance />} />
          <Route path="*" element={<Navigate to="/pacientes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
