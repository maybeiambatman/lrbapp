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
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="bg-[#006747] text-white shadow-lg">
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-[#b8960c] via-[#d4af37] to-[#b8960c]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center">
                <Trophy className="h-6 w-6 text-[#004d35]" />
              </div>
              <div>
                <span className="text-xl font-bold font-['Playfair_Display'] tracking-wide">Golf Trip</span>
                <span className="hidden sm:inline text-xl font-bold font-['Playfair_Display'] tracking-wide"> Manager</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 font-medium ${
                    location.pathname === item.path
                      ? 'bg-[#004d35] text-[#d4af37]'
                      : 'text-white/90 hover:bg-[#004d35] hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User info and logout */}
            <div className="hidden md:flex items-center gap-4">
              {currentUser && (
                <>
                  <span className="text-sm text-white/80 font-medium">
                    {currentUser.name}
                    {currentUser.isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-[#d4af37] text-[#004d35] text-xs rounded font-semibold">
                        Admin
                      </span>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white hover:bg-[#004d35]"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded hover:bg-[#004d35] transition-colors"
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
          <div className="md:hidden border-t border-[#004d35]">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded transition-colors ${
                    location.pathname === item.path
                      ? 'bg-[#004d35] text-[#d4af37]'
                      : 'text-white/90 hover:bg-[#004d35]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-white/90 hover:bg-[#004d35] rounded transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#006747]/10 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-[#006747]/60 font-medium">
            A Tradition Unlike Any Other
          </p>
        </div>
      </footer>
    </div>
  );
}
