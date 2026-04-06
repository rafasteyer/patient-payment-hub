import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export function MainLayout() {
  return (
    <div className="app-shell">
      {/* Left icon sidebar */}
      <Sidebar />

      {/* Right: top bar + content */}
      <div className="app-body">
        <TopBar />
        <main className="app-content">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
