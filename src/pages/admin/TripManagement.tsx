import React, { useState } from 'react';
import { Plus, Edit2, Users, Clock, Trophy, Copy, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Modal, Select } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { generateId, generateTripCode } from '../../utils/handicap';
import type { Trip, TripPlayer, TeeTime, Prize, Course } from '../../types';

export function TripManagement() {
  const { trips, courses, addTrip, deleteTrip } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'teetimes' | 'prizes'>('roster');

  // Derive selectedTrip from store to ensure it's always up-to-date
  const selectedTrip = selectedTripId ? trips.find(t => t.id === selectedTripId) || null : null;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Delete confirmation state
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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

  const handleDeleteTrip = () => {
    if (tripToDelete && deleteConfirmation === tripToDelete.name) {
      deleteTrip(tripToDelete.id);
      setTripToDelete(null);
      setDeleteConfirmation('');
    }
  };

  const openDeleteModal = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    setTripToDelete(trip);
    setDeleteConfirmation('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#006747]">Trip Management</h1>
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
            onBack={() => setSelectedTripId(null)}
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
                          <Check className="h-3 w-3 text-[#006747]" />
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
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setSelectedTripId(trip.id)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button variant="danger" onClick={(e) => openDeleteModal(trip, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!tripToDelete}
          onClose={() => {
            setTripToDelete(null);
            setDeleteConfirmation('');
          }}
          title="Delete Trip"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this trip will permanently remove all player data, scores, tee times, and prize configurations.
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                To confirm deletion, type the trip name:{' '}
                <span className="font-bold text-gray-900">{tripToDelete?.name}</span>
              </p>
              <Input
                placeholder="Type trip name to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setTripToDelete(null);
                  setDeleteConfirmation('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteTrip}
                disabled={deleteConfirmation !== tripToDelete?.name}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Trip
              </Button>
            </div>
          </div>
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
          <p className="text-2xl font-bold text-[#006747]">${trip.purseTotal}</p>
          <p className="text-sm text-gray-500">Total Purse</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-[#006747] text-[#006747]'
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
              ? 'border-[#006747] text-[#006747]'
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
              ? 'border-[#006747] text-[#006747]'
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

  const handleAddRound = () => {
    const newRoundNumber = trip.numberOfRounds + 1;

    // Add new prizes for the new round
    const newPrizes: Prize[] = [
      ...trip.prizes,
      {
        id: generateId(),
        name: `Round ${newRoundNumber} Best Net`,
        type: 'best_net_round',
        roundNumber: newRoundNumber,
        amount: 0,
      },
      {
        id: generateId(),
        name: `Round ${newRoundNumber} Closest to Pin`,
        type: 'closest_to_pin',
        roundNumber: newRoundNumber,
        amount: 0,
      },
    ];

    updateTrip(trip.id, {
      numberOfRounds: newRoundNumber,
      prizes: newPrizes,
    });
  };

  const handleRemoveRound = (roundIndex: number) => {
    if (trip.numberOfRounds <= 1) return; // Don't allow removing the last round

    const roundNumber = roundIndex + 1;

    // Remove course for this round
    const newCourses = [...roundCourses];
    newCourses.splice(roundIndex, 1);

    // Remove tee times for this round and shift subsequent round numbers down
    const newTeeTimes = trip.teeTimes
      .filter(tt => tt.roundNumber !== roundNumber)
      .map(tt => tt.roundNumber > roundNumber
        ? { ...tt, roundNumber: tt.roundNumber - 1 }
        : tt
      );

    // Remove prizes for this round and shift subsequent round numbers down
    const newPrizes = trip.prizes
      .filter(p => p.roundNumber !== roundNumber)
      .map(p => {
        if (p.roundNumber && p.roundNumber > roundNumber) {
          const newRoundNum = p.roundNumber - 1;
          return {
            ...p,
            roundNumber: newRoundNum,
            name: p.name.replace(`Round ${p.roundNumber}`, `Round ${newRoundNum}`),
          };
        }
        return p;
      });

    updateTrip(trip.id, {
      numberOfRounds: trip.numberOfRounds - 1,
      courses: newCourses,
      teeTimes: newTeeTimes,
      prizes: newPrizes,
    });

    // Reset selected round if it was the removed one
    if (selectedRound > trip.numberOfRounds - 1) {
      setSelectedRound(Math.max(1, trip.numberOfRounds - 1));
    }
  };

  return (
    <div className="space-y-6">
      {/* Round Selector and Course Assignment */}
      <Card
        title="Round Setup"
        actions={
          <Button size="sm" onClick={handleAddRound}>
            <Plus className="h-4 w-4 mr-1" />
            Add Round
          </Button>
        }
      >
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
              <button
                onClick={() => handleRemoveRound(i)}
                disabled={trip.numberOfRounds <= 1}
                className={`p-2 rounded-lg transition-colors ${
                  trip.numberOfRounds <= 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-red-500 hover:bg-red-50'
                }`}
                title={trip.numberOfRounds <= 1 ? 'Cannot remove the only round' : 'Remove round'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
                          className="px-2 py-1 bg-[#006747]/20 text-[#006747] rounded text-sm"
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
  const { scores, courses } = useStore();
  const [prizes, setPrizes] = useState(trip.prizes);
  const [showAddPrize, setShowAddPrize] = useState(false);
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeAmount, setNewPrizeAmount] = useState('');

  // Get par 3 holes for a round's course
  const getPar3Holes = (roundNumber?: number) => {
    if (!roundNumber) return [];
    const courseId = trip.courses[roundNumber - 1];
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];
    return course.holes.filter(h => h.par === 3);
  };

  // Get scores for this trip to show current leaders
  const tripScores = scores.filter(s => s.tripId === trip.id);

  const handleAmountChange = (prizeId: string, amount: string) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === prizeId ? { ...p, amount: parseFloat(amount) || 0 } : p))
    );
  };

  const handleCtpHoleChange = (prizeId: string, hole: string) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === prizeId ? { ...p, ctpHole: parseInt(hole) || undefined } : p))
    );
  };

  const handleWinnerChange = (prizeId: string, winnerId: string) => {
    setPrizes((prev) =>
      prev.map((p) => (p.id === prizeId ? { ...p, winnerId: winnerId || undefined } : p))
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

  // Get current leader for a round (for display)
  const getRoundLeader = (roundNumber: number) => {
    const roundScores = tripScores
      .filter(s => s.roundNumber === roundNumber && s.isComplete)
      .sort((a, b) => a.netTotal - b.netTotal);
    return roundScores[0];
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
          <span className="text-xl font-bold text-[#006747]">${trip.purseTotal}</span>
        </div>

        <div className="divide-y">
          {prizes.map((prize) => {
            const isCTP = prize.type === 'closest_to_pin';
            const isBestNetRound = prize.type === 'best_net_round';
            const currentLeader = prize.roundNumber ? getRoundLeader(prize.roundNumber) : null;

            return (
              <div key={prize.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
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

                {/* CTP specific controls */}
                {isCTP && (
                  <div className="flex flex-wrap gap-4 pl-4 border-l-2 border-orange-200">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">CTP Hole:</label>
                      {(() => {
                        const par3Holes = getPar3Holes(prize.roundNumber);
                        return par3Holes.length > 0 ? (
                          <select
                            value={prize.ctpHole || ''}
                            onChange={(e) => handleCtpHoleChange(prize.id, e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Select par 3</option>
                            {par3Holes.map((h) => (
                              <option key={h.number} value={h.number}>Hole {h.number}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            {prize.roundNumber ? 'No course assigned' : 'Select round first'}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Winner:</label>
                      <select
                        value={prize.winnerId || ''}
                        onChange={(e) => handleWinnerChange(prize.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="">Select winner</option>
                        {trip.players.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Show current leader for best net round prizes */}
                {isBestNetRound && currentLeader && (
                  <div className="text-sm text-gray-500 pl-4">
                    Current leader: <span className="font-medium text-[#006747]">{currentLeader.playerName}</span>
                    {' '}(Net: {currentLeader.netTotal})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="font-medium">Total Prizes: </span>
            <span className={totalPrizes > trip.purseTotal ? 'text-red-600' : 'text-[#006747]'}>
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
