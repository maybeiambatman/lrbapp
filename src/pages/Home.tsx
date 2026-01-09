import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Shield } from 'lucide-react';
import { Button, Card, Input } from '../components/common';
import { useStore } from '../store/useStore';
import { generateId } from '../utils/handicap';

export function Home() {
  const navigate = useNavigate();
  const { setCurrentUser, setCurrentTrip, getTripByCode, isAdmin, admins } = useStore();

  const [mode, setMode] = useState<'select' | 'join' | 'admin'>('select');
  const [tripCode, setTripCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');

  const handleJoinTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tripCode.trim() || !playerName.trim()) {
      setError('Please enter both trip code and your name');
      return;
    }

    const trip = getTripByCode(tripCode.trim());
    if (!trip) {
      setError('Trip not found. Please check the code and try again.');
      return;
    }

    const player = trip.players.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (!player) {
      setError('Your name is not on the roster. Please contact the trip admin.');
      return;
    }

    setCurrentUser({
      id: player.id,
      name: player.name,
      isAdmin: false,
      createdAt: Date.now(),
    });
    setCurrentTrip(trip);
    navigate('/trip');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminEmail.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isAdmin(adminEmail.trim())) {
      setError('You are not registered as an admin. Contact the app owner to get admin access.');
      return;
    }

    setCurrentUser({
      id: generateId(),
      name: adminEmail.trim(),
      email: adminEmail.trim(),
      isAdmin: true,
      createdAt: Date.now(),
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#006747] flex items-center justify-center p-4">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="text-center mb-10">
          {/* Gold circle with trophy */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#f4d03f] via-[#d4af37] to-[#b8960c] rounded-full shadow-2xl mb-6 border-4 border-white/20">
            <Trophy className="h-12 w-12 text-[#004d35]" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 font-['Playfair_Display'] tracking-tight">
            Golf Trip Manager
          </h1>
          <p className="text-[#d4af37] text-lg font-medium italic">
            A Tradition Unlike Any Other
          </p>
        </div>

        {mode === 'select' && (
          <Card className="shadow-2xl border-t-4 border-[#d4af37]">
            <div className="space-y-4">
              <Button
                onClick={() => setMode('join')}
                variant="gold"
                className="w-full justify-start gap-4 py-4"
                size="lg"
              >
                <Users className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Join a Trip</div>
                  <div className="text-sm opacity-80">Enter your trip code</div>
                </div>
              </Button>

              <Button
                onClick={() => setMode('admin')}
                variant="secondary"
                className="w-full justify-start gap-4 py-4"
                size="lg"
              >
                <Shield className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold text-lg">Admin Login</div>
                  <div className="text-sm opacity-70">Manage trips and courses</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-[#006747]/20 text-center">
              <p className="text-sm text-[#006747]/60">
                Admin: {admins.join(', ')}
              </p>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card className="shadow-2xl border-t-4 border-[#d4af37]" title="Join a Trip">
            <form onSubmit={handleJoinTrip} className="space-y-5">
              <Input
                label="Trip Code"
                placeholder="Enter 6-character code"
                value={tripCode}
                onChange={(e) => setTripCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-[0.3em] uppercase font-mono font-bold"
              />

              <Input
                label="Your Name"
                placeholder="As it appears on the roster"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode('select');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" variant="gold" className="flex-1">
                  Enter Tournament
                </Button>
              </div>
            </form>
          </Card>
        )}

        {mode === 'admin' && (
          <Card className="shadow-2xl border-t-4 border-[#d4af37]" title="Admin Login">
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <Input
                label="Admin Email"
                type="email"
                placeholder="Enter your email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode('select');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Login
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Footer text */}
        <p className="text-center text-white/40 text-sm mt-8">
          Manage your golf trips, track scores, and settle up
        </p>
      </div>
    </div>
  );
}
