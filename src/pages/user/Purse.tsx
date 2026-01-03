import { useMemo } from 'react';
import { Trophy, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { calculateLeaderboard, calculatePurse } from '../../utils/leaderboard';

export function Purse() {
  const { currentTrip, currentUser, scores } = useStore();

  const leaderboard = useMemo(() => {
    if (!currentTrip) return [];
    return calculateLeaderboard(currentTrip, scores);
  }, [currentTrip, scores]);

  const purseEntries = useMemo(() => {
    if (!currentTrip) return [];
    return calculatePurse(currentTrip, scores, leaderboard);
  }, [currentTrip, scores, leaderboard]);

  if (!currentTrip) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Please join a trip first.</p>
        </div>
      </Layout>
    );
  }

  const currentPlayerEntry = purseEntries.find((e) => e.playerId === currentUser?.id);
  const totalPrizesPaid = currentTrip.prizes
    .filter((p) => p.winnerId)
    .reduce((sum, p) => sum + p.amount, 0);
  const remainingPurse = currentTrip.purseTotal - totalPrizesPaid;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purse & Winnings</h1>
          <p className="text-gray-500">{currentTrip.name}</p>
        </div>

        {/* Purse Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Total Purse</p>
              <p className="text-2xl font-bold text-gray-900">${currentTrip.purseTotal}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Prizes Awarded</p>
              <p className="text-2xl font-bold text-gray-900">${totalPrizesPaid}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">${remainingPurse}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div
                className={`h-8 w-8 mx-auto mb-2 flex items-center justify-center ${
                  currentPlayerEntry?.netPosition === 0
                    ? 'text-gray-400'
                    : currentPlayerEntry?.netPosition && currentPlayerEntry.netPosition > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {currentPlayerEntry?.netPosition === 0 ? (
                  <Minus className="h-8 w-8" />
                ) : currentPlayerEntry?.netPosition && currentPlayerEntry.netPosition > 0 ? (
                  <TrendingUp className="h-8 w-8" />
                ) : (
                  <TrendingDown className="h-8 w-8" />
                )}
              </div>
              <p className="text-sm text-gray-500">Your Net</p>
              <p
                className={`text-2xl font-bold ${
                  currentPlayerEntry?.netPosition === 0
                    ? 'text-gray-400'
                    : currentPlayerEntry?.netPosition && currentPlayerEntry.netPosition > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {currentPlayerEntry?.netPosition !== undefined
                  ? currentPlayerEntry.netPosition >= 0
                    ? `+$${currentPlayerEntry.netPosition}`
                    : `-$${Math.abs(currentPlayerEntry.netPosition)}`
                  : '-'}
              </p>
            </div>
          </Card>
        </div>

        {/* Prize List */}
        <Card title="Prizes">
          <div className="divide-y">
            {currentTrip.prizes.map((prize) => {
              const winner = currentTrip.players.find((p) => p.id === prize.winnerId);
              return (
                <div key={prize.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        winner ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}
                    >
                      <Trophy
                        className={`h-5 w-5 ${
                          winner ? 'text-yellow-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{prize.name}</div>
                      {prize.roundNumber && (
                        <div className="text-sm text-gray-500">
                          Round {prize.roundNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${prize.amount}</div>
                    {winner ? (
                      <div className="text-sm text-gray-500">{winner.name}</div>
                    ) : (
                      <div className="text-sm text-gray-400">Not awarded</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Player Winnings */}
        <Card title="Player Standings">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Player</th>
                  <th className="pb-3 font-medium text-center">Buy-in</th>
                  <th className="pb-3 font-medium text-center">Winnings</th>
                  <th className="pb-3 font-medium text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {purseEntries.map((entry) => {
                  const player = currentTrip.players.find(
                    (p) => p.id === entry.playerId
                  );
                  const isCurrentUser = entry.playerId === currentUser?.id;

                  return (
                    <tr
                      key={entry.playerId}
                      className={`border-b last:border-0 ${
                        isCurrentUser ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.playerName}</span>
                          {isCurrentUser && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        {entry.prizes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.prizes.map((prize, i) => (
                              <span
                                key={i}
                                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded"
                              >
                                {prize.prizeName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-center text-red-600">
                        -${player?.buyIn || 0}
                      </td>
                      <td className="py-4 text-center text-green-600">
                        +${entry.totalWinnings}
                      </td>
                      <td
                        className={`py-4 text-right font-bold ${
                          entry.netPosition === 0
                            ? 'text-gray-400'
                            : entry.netPosition > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {entry.netPosition >= 0
                          ? `+$${entry.netPosition}`
                          : `-$${Math.abs(entry.netPosition)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Money Distribution */}
        <Card title="Money Flow">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Total Collected</div>
                <div className="text-sm text-gray-500">
                  {currentTrip.players.length} players × ${currentTrip.buyInAmount}
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">
                ${currentTrip.purseTotal}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-800">Total Prizes</div>
                <div className="text-sm text-green-600">
                  {currentTrip.prizes.length} prizes configured
                </div>
              </div>
              <div className="text-xl font-bold text-green-700">
                ${currentTrip.prizes.reduce((sum, p) => sum + p.amount, 0)}
              </div>
            </div>

            {currentTrip.prizes.reduce((sum, p) => sum + p.amount, 0) !==
              currentTrip.purseTotal && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-medium text-yellow-800">Unallocated</div>
                  <div className="text-sm text-yellow-600">
                    Purse minus prizes
                  </div>
                </div>
                <div className="text-xl font-bold text-yellow-700">
                  $
                  {currentTrip.purseTotal -
                    currentTrip.prizes.reduce((sum, p) => sum + p.amount, 0)}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
