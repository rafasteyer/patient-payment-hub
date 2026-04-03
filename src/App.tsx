import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { Finance } from './pages/Finance';
import { Waitlist } from './pages/Waitlist';
import { Tasks } from './pages/Tasks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Default Route goes to Pacientes as it is Priority */}
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
