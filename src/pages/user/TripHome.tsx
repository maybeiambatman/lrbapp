import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Flag, Clock } from 'lucide-react';
import { Button, Card } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';

export function TripHome() {
  const { currentTrip, currentUser, courses, scores } = useStore();

  if (!currentTrip || !currentUser) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">No trip selected</h2>
          <p className="text-gray-500 mt-2">Please join a trip first.</p>
          <Link to="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const player = currentTrip.players.find((p) => p.id === currentUser.id);
  const playerScores = scores.filter(
    (s) => s.tripId === currentTrip.id && s.playerId === currentUser.id
  );
  const completedRounds = playerScores.filter((s) => s.isComplete).length;

  // Get today's tee times for the current player
  const playerTeeTimes = currentTrip.teeTimes.filter((tt) =>
    tt.playerIds.includes(currentUser.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser.name}!</h1>
          <p className="text-green-100">{currentTrip.name}</p>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{currentTrip.startDate} - {currentTrip.endDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{currentTrip.players.length} players</span>
            </div>
          </div>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{player?.handicap || '-'}</p>
              <p className="text-sm text-gray-500">Your Handicap</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {completedRounds}/{currentTrip.numberOfRounds}
              </p>
              <p className="text-sm text-gray-500">Rounds Played</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">${currentTrip.purseTotal}</p>
              <p className="text-sm text-gray-500">Total Purse</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">${player?.buyIn || 0}</p>
              <p className="text-sm text-gray-500">Your Buy-in</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/trip/scores">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Flag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enter Scores</h3>
                  <p className="text-sm text-gray-500">Record your round</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/trip/leaderboard">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Leaderboard</h3>
                  <p className="text-sm text-gray-500">See standings</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/trip/purse">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">$</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Purse</h3>
                  <p className="text-sm text-gray-500">View winnings</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Tee Times */}
        <Card title="Your Tee Times" subtitle="Schedule for the trip">
          {playerTeeTimes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tee times scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {playerTeeTimes
                .sort((a, b) => a.roundNumber - b.roundNumber)
                .map((tt) => {
                  const course = courses.find(
                    (c) => c.id === currentTrip.courses[tt.roundNumber - 1]
                  );
                  const groupPlayers = tt.playerIds
                    .map((id) => currentTrip.players.find((p) => p.id === id)?.name)
                    .filter(Boolean);

                  return (
                    <div
                      key={tt.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-xs text-gray-500">Round</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {tt.roundNumber}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{tt.time}</span>
                        </div>
                        {course && (
                          <p className="text-sm text-gray-600">{course.name}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {groupPlayers.map((name, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded ${
                                name === currentUser.name
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        {/* Your Scores */}
        <Card title="Your Scores" subtitle="Round by round performance">
          {playerScores.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No scores entered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2">Round</th>
                    <th className="pb-2">Course</th>
                    <th className="pb-2 text-center">Gross</th>
                    <th className="pb-2 text-center">Net</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {playerScores
                    .sort((a, b) => a.roundNumber - b.roundNumber)
                    .map((score) => {
                      const course = courses.find((c) => c.id === score.courseId);
                      return (
                        <tr key={score.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">Round {score.roundNumber}</td>
                          <td className="py-3 text-sm text-gray-600">
                            {course?.name || 'Unknown'}
                          </td>
                          <td className="py-3 text-center">{score.grossTotal}</td>
                          <td className="py-3 text-center font-medium text-green-600">
                            {score.netTotal}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                score.isComplete
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {score.isComplete ? 'Complete' : 'In Progress'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
