import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Trophy,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Flag,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from './Button';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, currentTrip, setCurrentUser, setCurrentTrip } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTrip(null);
    navigate('/');
  };

  const navItems = currentUser?.isAdmin
    ? [
        { path: '/admin', icon: Settings, label: 'Dashboard' },
        { path: '/admin/courses', icon: Flag, label: 'Courses' },
        { path: '/admin/trips', icon: Trophy, label: 'Trips' },
      ]
    : currentTrip
    ? [
        { path: '/trip', icon: Home, label: 'Trip Home' },
        { path: '/trip/scores', icon: Flag, label: 'Enter Scores' },
        { path: '/trip/leaderboard', icon: Trophy, label: 'Leaderboard' },
        { path: '/trip/purse', icon: Users, label: 'Purse' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Trophy className="h-8 w-8" />
              <span className="text-xl font-bold">Golf Trip Manager</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User info and logout */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser && (
                <>
                  <span className="text-sm text-green-100">
                    {currentUser.name}
                    {currentUser.isAdmin && ' (Admin)'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white hover:bg-green-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-600">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-800 text-white'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-green-100 hover:bg-green-600 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
