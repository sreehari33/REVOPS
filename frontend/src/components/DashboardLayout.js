import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut,
  Wrench,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ownerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/managers', label: 'Managers', icon: Users },
    { path: '/payments', label: 'Payments', icon: CreditCard },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const managerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/jobs/new', label: 'New Job', icon: Briefcase },
    { path: '/payments', label: 'Payments', icon: CreditCard }
  ];

  const navItems = user?.role === 'owner' ? ownerNavItems : managerNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary" strokeWidth={2} />
            <h1 className="text-2xl font-black tracking-tighter uppercase">RevOps</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-mono">
            {user?.role === 'owner' ? 'Owner' : 'Manager'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-semibold tracking-wide uppercase">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-card border-b border-border p-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black tracking-tighter uppercase">RevOps</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background z-30 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="outline"
              className="w-full justify-start mt-4"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
