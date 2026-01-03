import React, { useState } from 'react';
import { Plus, Edit2, Users, Clock, Trophy, Copy, Check } from 'lucide-react';
import { Button, Card, Input, Modal, Select } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { generateId, generateTripCode } from '../../utils/handicap';
import type { Trip, TripPlayer, TeeTime, Prize, Course } from '../../types';

export function TripManagement() {
  const { trips, courses, addTrip } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'teetimes' | 'prizes'>('roster');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create trip form state
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [buyIn, setBuyIn] = useState('100');
  const [numRounds, setNumRounds] = useState('4');

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateTripCode();
    const numberOfRounds = parseInt(numRounds);

    // Create default prizes
    const defaultPrizes: Prize[] = [
      {
        id: generateId(),
        name: 'Overall Best Net',
        type: 'best_cumulative_net',
        amount: 0,
      },
    ];

    // Add per-round prizes
    for (let i = 1; i <= numberOfRounds; i++) {
      defaultPrizes.push({
        id: generateId(),
        name: `Round ${i} Best Net`,
        type: 'best_net_round',
        roundNumber: i,
        amount: 0,
      });
      defaultPrizes.push({
        id: generateId(),
        name: `Round ${i} Closest to Pin`,
        type: 'closest_to_pin',
        roundNumber: i,
        amount: 0,
      });
    }

    const trip: Trip = {
      id: generateId(),
      name: tripName,
      code,
      startDate,
      endDate,
      buyInAmount: parseFloat(buyIn),
      numberOfRounds,
      players: [],
      courses: [],
      teeTimes: [],
      prizes: defaultPrizes,
      purseTotal: 0,
      createdBy: 'admin',
      createdAt: Date.now(),
      isActive: true,
    };

    addTrip(trip);
    setShowCreateModal(false);
    setTripName('');
    setStartDate('');
    setEndDate('');
    setBuyIn('100');
    setNumRounds('4');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
            <p className="text-gray-500">Create and manage golf trips</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No trips yet
              </h3>
              <p className="text-gray-500 mb-4">Create your first golf trip</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </div>
          </Card>
        ) : selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBack={() => setSelectedTrip(null)}
            courses={courses}
          />
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card key={trip.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trip.name}
                      </h3>
                      <button
                        onClick={() => copyCode(trip.code)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono hover:bg-gray-200"
                      >
                        {trip.code}
                        {copiedCode === trip.code ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>{trip.startDate} - {trip.endDate}</span>
                      <span>{trip.players.length} players</span>
                      <span>${trip.purseTotal} purse</span>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => setSelectedTrip(trip)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Trip Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Trip"
          size="lg"
        >
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <Input
              label="Trip Name"
              placeholder="e.g., Myrtle Beach 2024"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Buy-in Amount ($)"
                type="number"
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
                required
              />
              <Input
                label="Number of Rounds"
                type="number"
                min={1}
                max={10}
                value={numRounds}
                onChange={(e) => setNumRounds(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Trip</Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

// Trip Detail Component
function TripDetail({
  trip,
  activeTab,
  setActiveTab,
  onBack,
  courses,
}: {
  trip: Trip;
  activeTab: 'roster' | 'teetimes' | 'prizes';
  setActiveTab: (tab: 'roster' | 'teetimes' | 'prizes') => void;
  onBack: () => void;
  courses: Course[];
}) {
  const { addPlayerToTrip, removePlayerFromTrip, updatePrizes, addTeeTime, updateTrip } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            &larr; Back to Trips
          </Button>
          <h2 className="text-xl font-bold text-gray-900">{trip.name}</h2>
          <p className="text-sm text-gray-500">Code: {trip.code}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">${trip.purseTotal}</p>
          <p className="text-sm text-gray-500">Total Purse</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Roster
        </button>
        <button
          onClick={() => setActiveTab('teetimes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'teetimes'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Tee Times
        </button>
        <button
          onClick={() => setActiveTab('prizes')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'prizes'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trophy className="h-4 w-4 inline mr-2" />
          Prizes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'roster' && (
        <RosterTab trip={trip} addPlayerToTrip={addPlayerToTrip} removePlayerFromTrip={removePlayerFromTrip} />
      )}
      {activeTab === 'teetimes' && (
        <TeeTimesTab trip={trip} courses={courses} addTeeTime={addTeeTime} updateTrip={updateTrip} />
      )}
      {activeTab === 'prizes' && (
        <PrizesTab trip={trip} updatePrizes={updatePrizes} />
      )}
    </div>
  );
}

// Roster Tab
function RosterTab({
  trip,
  addPlayerToTrip,
  removePlayerFromTrip,
}: {
  trip: Trip;
  addPlayerToTrip: (tripId: string, player: TripPlayer) => void;
  removePlayerFromTrip: (tripId: string, playerId: string) => void;
}) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [handicap, setHandicap] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayerToTrip(trip.id, {
      id: generateId(),
      name: playerName,
      handicap: parseFloat(handicap),
      buyIn: trip.buyInAmount,
      joinedAt: Date.now(),
    });
    setPlayerName('');
    setHandicap('');
    setShowAddPlayer(false);
  };

  return (
    <Card title="Players" actions={
      <Button size="sm" onClick={() => setShowAddPlayer(true)}>
        <Plus className="h-4 w-4 mr-1" />
        Add Player
      </Button>
    }>
      {trip.players.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No players added yet. Add players to the roster.
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Handicap</th>
              <th className="pb-2">Buy-in</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {trip.players.map((player) => (
              <tr key={player.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{player.name}</td>
                <td className="py-3">{player.handicap}</td>
                <td className="py-3">${player.buyIn}</td>
                <td className="py-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removePlayerFromTrip(trip.id, player.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        title="Add Player"
      >
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <Input
            label="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
          <Input
            label="Handicap"
            type="number"
            step="0.1"
            value={handicap}
            onChange={(e) => setHandicap(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddPlayer(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Player</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// Tee Times Tab
function TeeTimesTab({
  trip,
  courses,
  addTeeTime,
  updateTrip,
}: {
  trip: Trip;
  courses: Course[];
  addTeeTime: (tripId: string, teeTime: TeeTime) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
}) {
  const [selectedRound, setSelectedRound] = useState(1);
  const [showAddTeeTime, setShowAddTeeTime] = useState(false);
  const [teeTimeTime, setTeeTimeTime] = useState('08:00');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const roundCourses = [...trip.courses];
  while (roundCourses.length < trip.numberOfRounds) {
    roundCourses.push('');
  }

  const handleCourseChange = (roundIndex: number, courseId: string) => {
    const newCourses = [...roundCourses];
    newCourses[roundIndex] = courseId;
    updateTrip(trip.id, { courses: newCourses });
  };

  const handleAddTeeTime = (e: React.FormEvent) => {
    e.preventDefault();
    addTeeTime(trip.id, {
      id: generateId(),
      roundNumber: selectedRound,
      time: teeTimeTime,
      playerIds: selectedPlayers,
    });
    setTeeTimeTime('08:00');
    setSelectedPlayers([]);
    setShowAddTeeTime(false);
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const roundTeeTimes = trip.teeTimes.filter((tt) => tt.roundNumber === selectedRound);

  return (
    <div className="space-y-6">
      {/* Round Selector and Course Assignment */}
      <Card title="Round Setup">
        <div className="space-y-4">
          {Array.from({ length: trip.numberOfRounds }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-medium w-24">Round {i + 1}</span>
              <Select
                options={[
                  { value: '', label: 'Select course...' },
                  ...courses.map((c) => ({ value: c.id, label: c.name })),
                ]}
                value={roundCourses[i] || ''}
                onChange={(value) => handleCourseChange(i, value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Tee Times */}
      <Card
        title={`Round ${selectedRound} Tee Times`}
        actions={
          <div className="flex gap-2 items-center">
            <Select
              options={Array.from({ length: trip.numberOfRounds }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Round ${i + 1}`,
              }))}
              value={selectedRound.toString()}
              onChange={(v) => setSelectedRound(parseInt(v))}
            />
            <Button size="sm" onClick={() => setShowAddTeeTime(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tee Time
            </Button>
          </div>
        }
      >
        {roundTeeTimes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tee times set for this round
          </div>
        ) : (
          <div className="space-y-3">
            {roundTeeTimes
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((tt) => (
                <div key={tt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-lg">{tt.time}</span>
                  <div className="flex flex-wrap gap-2">
                    {tt.playerIds.map((playerId) => {
                      const player = trip.players.find((p) => p.id === playerId);
                      return (
                        <span
                          key={playerId}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                        >
                          {player?.name || 'Unknown'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showAddTeeTime}
        onClose={() => setShowAddTeeTime(false)}
        title="Add Tee Time"
      >
        <form onSubmit={handleAddTeeTime} className="space-y-4">
          <Input
            label="Time"
            type="time"
            value={teeTimeTime}
            onChange={(e) => setTeeTimeTime(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Players (up to 4)
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trip.players.map((player) => (
                <label
                  key={player.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(player.id)}
                    onChange={() => togglePlayer(player.id)}
                    disabled={
                      selectedPlayers.length >= 4 &&
                      !selectedPlayers.includes(player.id)
                    }
                    className="rounded border-gray-300"
                  />
                  <span>{player.name}</span>
                  <span className="text-sm text-gray-500">({player.handicap})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddTeeTime(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedPlayers.length === 0}>
              Add Tee Time
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Prizes Tab
function PrizesTab({
  trip,
  updatePrizes,
}: {
  trip: Trip;
  updatePrizes: (tripId: string, prizes: Prize[]) => void;
}) {
  const [prizes, setPrizes] = useState(trip.prizes);
  const [showAddPrize, setShowAddPrize] = useState(false);
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeAmount, setNewPrizeAmount] = useState('');

  const handleAmountChange = (prizeId: string, amount: string) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === prizeId ? { ...p, amount: parseFloat(amount) || 0 } : p))
    );
  };

  const handleSave = () => {
    updatePrizes(trip.id, prizes);
  };

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrize: Prize = {
      id: generateId(),
      name: newPrizeName,
      type: 'custom',
      amount: parseFloat(newPrizeAmount) || 0,
    };
    setPrizes([...prizes, newPrize]);
    setNewPrizeName('');
    setNewPrizeAmount('');
    setShowAddPrize(false);
  };

  const totalPrizes = prizes.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card
      title="Prize Configuration"
      actions={
        <Button size="sm" onClick={() => setShowAddPrize(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Prize
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="font-medium">Total Purse</span>
          <span className="text-xl font-bold text-green-600">${trip.purseTotal}</span>
        </div>

        <div className="divide-y">
          {prizes.map((prize) => (
            <div key={prize.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-medium">{prize.name}</span>
                {prize.roundNumber && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                    Round {prize.roundNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>$</span>
                <input
                  type="number"
                  value={prize.amount}
                  onChange={(e) => handleAmountChange(prize.id, e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-right"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="font-medium">Total Prizes: </span>
            <span className={totalPrizes > trip.purseTotal ? 'text-red-600' : 'text-green-600'}>
              ${totalPrizes}
            </span>
            {totalPrizes > trip.purseTotal && (
              <span className="text-sm text-red-600 ml-2">
                (exceeds purse by ${totalPrizes - trip.purseTotal})
              </span>
            )}
          </div>
          <Button onClick={handleSave}>Save Prizes</Button>
        </div>
      </div>

      <Modal
        isOpen={showAddPrize}
        onClose={() => setShowAddPrize(false)}
        title="Add Custom Prize"
      >
        <form onSubmit={handleAddPrize} className="space-y-4">
          <Input
            label="Prize Name"
            value={newPrizeName}
            onChange={(e) => setNewPrizeName(e.target.value)}
            placeholder="e.g., Longest Drive"
            required
          />
          <Input
            label="Amount"
            type="number"
            value={newPrizeAmount}
            onChange={(e) => setNewPrizeAmount(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddPrize(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Prize</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
