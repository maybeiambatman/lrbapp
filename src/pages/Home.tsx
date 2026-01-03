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
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Golf Trip Manager</h1>
          <p className="text-green-200">Manage your golf trips and winnings</p>
        </div>

        {mode === 'select' && (
          <Card className="animate-fade-in">
            <div className="space-y-4">
              <Button
                onClick={() => setMode('join')}
                className="w-full justify-start gap-3"
                size="lg"
              >
                <Users className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Join a Trip</div>
                  <div className="text-sm text-green-200">Enter a trip code to join</div>
                </div>
              </Button>

              <Button
                onClick={() => setMode('admin')}
                variant="secondary"
                className="w-full justify-start gap-3"
                size="lg"
              >
                <Shield className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Admin Login</div>
                  <div className="text-sm text-gray-500">Manage trips and courses</div>
                </div>
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Admin emails: {admins.join(', ')}
              </p>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card title="Join a Trip">
            <form onSubmit={handleJoinTrip} className="space-y-4">
              <Input
                label="Trip Code"
                placeholder="Enter 6-character code"
                value={tripCode}
                onChange={(e) => setTripCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-xl tracking-widest uppercase"
              />

              <Input
                label="Your Name"
                placeholder="As it appears on the roster"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
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
                  Join Trip
                </Button>
              </div>
            </form>
          </Card>
        )}

        {mode === 'admin' && (
          <Card title="Admin Login">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="Enter your email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
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
      </div>
    </div>
  );
}
