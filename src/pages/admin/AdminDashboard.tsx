import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Trophy, Users, Plus, Settings } from 'lucide-react';
import { Button, Card, Input, Modal } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';

export function AdminDashboard() {
  const { trips, courses, admins, addAdmin, removeAdmin, currentUser } = useStore();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const activeTrips = trips.filter((t) => t.isActive);
  const totalPlayers = trips.reduce((sum, t) => sum + t.players.length, 0);
  const totalPurse = trips.reduce((sum, t) => sum + t.purseTotal, 0);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminEmail.trim()) {
      addAdmin(newAdminEmail.trim());
      setNewAdminEmail('');
      setShowAdminModal(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#006747]">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your golf trips and courses</p>
          </div>
          <Button onClick={() => setShowAdminModal(true)} variant="secondary">
            <Settings className="h-4 w-4 mr-2" />
            Manage Admins
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#d4af37]/20 rounded-lg">
                <Trophy className="h-6 w-6 text-[#d4af37]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Trips</p>
                <p className="text-2xl font-bold text-gray-900">{activeTrips.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006747]/10 rounded-lg">
                <Flag className="h-6 w-6 text-[#006747]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#006747]/10 rounded-lg">
                <Users className="h-6 w-6 text-[#006747]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Players</p>
                <p className="text-2xl font-bold text-gray-900">{totalPlayers}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#d4af37]/20 rounded-lg">
                <span className="text-2xl text-[#d4af37]">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Purse</p>
                <p className="text-2xl font-bold text-[#006747]">${totalPurse}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Courses" subtitle="Manage golf course scorecards">
            <div className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No courses added yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {courses.slice(0, 5).map((course) => (
                    <li key={course.id} className="py-2 flex justify-between items-center">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-sm text-gray-500">
                        {course.holes.length} holes
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/courses">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {courses.length === 0 ? 'Add Your First Course' : 'Manage Courses'}
                </Button>
              </Link>
            </div>
          </Card>

          <Card title="Trips" subtitle="Create and manage golf trips">
            <div className="space-y-4">
              {trips.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No trips created yet</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {trips.slice(0, 5).map((trip) => (
                    <li key={trip.id} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{trip.name}</span>
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                          {trip.code}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {trip.players.length} players
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/trips">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {trips.length === 0 ? 'Create Your First Trip' : 'Manage Trips'}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Admin Management Modal */}
        <Modal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          title="Manage Admins"
        >
          <div className="space-y-4">
            <form onSubmit={handleAddAdmin} className="flex gap-2">
              <Input
                placeholder="Email address"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </form>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Admins</h4>
              <ul className="space-y-2">
                {admins.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{email}</span>
                    {email !== currentUser?.email && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeAdmin(email)}
                      >
                        Remove
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
