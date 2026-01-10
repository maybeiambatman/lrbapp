import { useState, useMemo } from 'react';
import { Trophy, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Select } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { calculateLeaderboard, getBestNetForRound } from '../../utils/leaderboard';
import { formatScoreToPar, calculateCoursePar } from '../../utils/handicap';

export function Leaderboard() {
  const { currentTrip, courses, scores } = useStore();
  const [selectedRound, setSelectedRound] = useState<'all' | number>('all');
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const leaderboard = useMemo(() => {
    if (!currentTrip) return [];
    return calculateLeaderboard(currentTrip, scores);
  }, [currentTrip, scores]);

  if (!currentTrip) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Please join a trip first.</p>
        </div>
      </Layout>
    );
  }

  // Filter leaderboard by round if selected
  const filteredLeaderboard = useMemo(() => {
    if (selectedRound === 'all') return leaderboard;

    return leaderboard
      .map((entry) => {
        const roundData = entry.rounds.find((r) => r.roundNumber === selectedRound);
        return {
          ...entry,
          totalGross: roundData?.grossScore || 0,
          totalNet: roundData?.netScore || 0,
          roundsCompleted: roundData?.isComplete ? 1 : 0,
        };
      })
      .filter((e) => e.rounds.some((r) => r.roundNumber === selectedRound))
      .sort((a, b) => a.totalNet - b.totalNet);
  }, [leaderboard, selectedRound]);

  // Calculate course par for the selected round
  const roundCourse =
    selectedRound !== 'all'
      ? courses.find((c) => c.id === currentTrip.courses[selectedRound - 1])
      : null;
  const coursePar = roundCourse ? calculateCoursePar(roundCourse.holes) : 72;

  // Get total par across all rounds played
  const totalPar = useMemo(() => {
    if (selectedRound !== 'all') return coursePar;
    let total = 0;
    currentTrip.courses.forEach((courseId) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        total += calculateCoursePar(course.holes);
      }
    });
    return total || 72 * currentTrip.numberOfRounds;
  }, [selectedRound, currentTrip, courses, coursePar]);

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-[#f4d03f]/20 to-[#d4af37]/20 border-[#d4af37]';
      case 2:
        return 'bg-gray-100 border-gray-400';
      case 3:
        return 'bg-orange-100 border-orange-400';
      default:
        return 'bg-[#faf9f6] border-gray-200';
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-[#d4af37]" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-400" />;
      default:
        return <span className="w-5 text-center font-bold text-gray-500">{position}</span>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#006747]">Leaderboard</h1>
            <p className="text-gray-500">{currentTrip.name}</p>
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Rounds' },
              ...Array.from({ length: currentTrip.numberOfRounds }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Round ${i + 1}`,
              })),
            ]}
            value={selectedRound.toString()}
            onChange={(v) => setSelectedRound(v === 'all' ? 'all' : parseInt(v))}
          />
        </div>

        {/* Leaderboard Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Leader</p>
              <p className="text-lg font-bold text-gray-900">
                {filteredLeaderboard[0]?.playerName || '-'}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Best Net</p>
              <p className="text-lg font-bold text-[#006747]">
                {filteredLeaderboard[0]
                  ? formatScoreToPar(
                      filteredLeaderboard[0].totalNet,
                      selectedRound === 'all'
                        ? totalPar * (filteredLeaderboard[0].roundsCompleted || 1) / currentTrip.numberOfRounds
                        : coursePar
                    )
                  : '-'}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">Players</p>
              <p className="text-lg font-bold text-gray-900">{filteredLeaderboard.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {selectedRound === 'all' ? 'Total Purse' : 'Round Prize'}
              </p>
              <p className="text-lg font-bold text-[#006747]">
                ${currentTrip.purseTotal}
              </p>
            </div>
          </Card>
        </div>

        {/* Main Leaderboard */}
        <Card>
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scores entered yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Scores will appear here once players start entering them
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeaderboard.map((entry, index) => {
                const isExpanded = expandedPlayer === entry.playerId;
                const position = index + 1;

                return (
                  <div key={entry.playerId}>
                    <div
                      className={`
                        flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 cursor-pointer
                        transition-all active:scale-[0.99] hover:shadow-md
                        ${getPositionStyle(position)}
                      `}
                      onClick={() =>
                        setExpandedPlayer(isExpanded ? null : entry.playerId)
                      }
                    >
                      {/* Position */}
                      <div className="flex-shrink-0 w-6 sm:w-8">
                        {getPositionIcon(position)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {entry.playerName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          <span className="hidden sm:inline">Hdcp: {entry.handicap} | </span>
                          <span className="sm:hidden">H:{entry.handicap} · </span>
                          {entry.roundsCompleted} rd{entry.roundsCompleted !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="flex gap-3 sm:gap-6 items-center">
                        <div className="text-center hidden sm:block">
                          <div className="text-xs text-gray-500">Gross</div>
                          <div className="font-medium">{entry.totalGross || '-'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Net</div>
                          <div className="font-bold text-[#006747] text-base sm:text-lg">
                            {entry.totalNet || '-'}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Round Details */}
                    {isExpanded && (
                      <div className="mt-2 ml-6 sm:ml-12 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Round Details</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                          {entry.rounds.map((round) => {
                            const course = courses.find(
                              (c) => c.id === currentTrip.courses[round.roundNumber - 1]
                            );
                            return (
                              <div
                                key={round.roundNumber}
                                className="bg-white p-3 rounded-lg border"
                              >
                                <div className="text-sm text-gray-500 mb-1">
                                  Round {round.roundNumber}
                                </div>
                                <div className="text-xs text-gray-400 mb-2 truncate">
                                  {course?.name || 'TBD'}
                                </div>
                                <div className="flex justify-between">
                                  <div>
                                    <div className="text-xs text-gray-500">Gross</div>
                                    <div className="font-medium">{round.grossScore}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500">Net</div>
                                    <div className="font-bold text-[#006747]">
                                      {round.netScore}
                                    </div>
                                  </div>
                                </div>
                                {!round.isComplete && (
                                  <div className="mt-2">
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      In Progress
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Round Winners */}
        {selectedRound === 'all' && (
          <Card title="Round Winners">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: currentTrip.numberOfRounds }, (_, i) => {
                const roundNum = i + 1;
                const bestNet = getBestNetForRound(scores, currentTrip.id, roundNum);
                const course = courses.find(
                  (c) => c.id === currentTrip.courses[i]
                );

                return (
                  <div key={roundNum} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Round {roundNum}</h4>
                        <p className="text-sm text-gray-500">{course?.name || 'TBD'}</p>
                      </div>
                      {bestNet && (
                        <Trophy className="h-5 w-5 text-[#d4af37]" />
                      )}
                    </div>
                    {bestNet ? (
                      <div className="flex justify-between items-center mt-3">
                        <span className="font-medium">{bestNet.playerName}</span>
                        <div className="text-right">
                          <span className="text-[#006747] font-bold">
                            Net: {bestNet.netTotal}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            (Gross: {bestNet.grossTotal})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-3">
                        No completed scores yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
