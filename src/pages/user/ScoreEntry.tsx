import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import {
  calculateCourseHandicap,
  calculateStrokesPerHole,
  generateId,
} from '../../utils/handicap';
import type { HoleScore, RoundScore } from '../../types';

export function ScoreEntry() {
  const navigate = useNavigate();
  const { currentTrip, currentUser, courses, scores, addScore, updateScore } = useStore();

  const [selectedRound, setSelectedRound] = useState(1);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<number[]>(Array(18).fill(0));
  const [closestToPin, setClosestToPin] = useState<{
    holeNumber: number;
    distance: string;
  } | null>(null);
  const [existingScoreId, setExistingScoreId] = useState<string | null>(null);

  const course = currentTrip
    ? courses.find((c) => c.id === currentTrip.courses[selectedRound - 1])
    : null;

  const player = currentTrip?.players.find((p) => p.id === currentUser?.id);
  const handicap = player?.handicap || 0;

  const courseHandicap = course
    ? calculateCourseHandicap(handicap, course.slope, course.rating)
    : handicap;

  const strokesMap = course
    ? calculateStrokesPerHole(courseHandicap, course.holes)
    : new Map();

  // Load existing score if any
  useEffect(() => {
    if (currentTrip && currentUser) {
      const existing = scores.find(
        (s) =>
          s.tripId === currentTrip.id &&
          s.playerId === currentUser.id &&
          s.roundNumber === selectedRound
      );
      if (existing) {
        setExistingScoreId(existing.id);
        setHoleScores(existing.holes.map((h) => h.grossScore));
        setClosestToPin(existing.closestToPin || null);
      } else {
        setExistingScoreId(null);
        setHoleScores(Array(18).fill(0));
        setClosestToPin(null);
      }
    }
  }, [selectedRound, currentTrip, currentUser, scores]);

  if (!currentTrip || !currentUser) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Please join a trip first.</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Enter Scores</h1>
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No course assigned for Round {selectedRound} yet.
              </p>
              <Select
                label="Select Round"
                options={Array.from({ length: currentTrip.numberOfRounds }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Round ${i + 1}`,
                }))}
                value={selectedRound.toString()}
                onChange={(v) => setSelectedRound(parseInt(v))}
              />
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentHoleData = course.holes[currentHole - 1];
  const strokes = strokesMap.get(currentHole) || 0;
  const grossScore = holeScores[currentHole - 1];
  const netScore = grossScore - strokes;

  const handleScoreChange = (score: number) => {
    const newScores = [...holeScores];
    newScores[currentHole - 1] = score;
    setHoleScores(newScores);
  };

  const calculateTotals = () => {
    let grossTotal = 0;
    let netTotal = 0;
    const holes: HoleScore[] = [];

    course.holes.forEach((hole, index) => {
      const gross = holeScores[index];
      const strokesReceived = strokesMap.get(hole.number) || 0;
      const net = gross - strokesReceived;

      grossTotal += gross;
      netTotal += net;

      holes.push({
        holeNumber: hole.number,
        grossScore: gross,
        netScore: net,
        strokesReceived,
      });
    });

    return { grossTotal, netTotal, holes };
  };

  const handleSave = () => {
    const { grossTotal, netTotal, holes } = calculateTotals();
    const isComplete = holeScores.every((s) => s > 0);

    const scoreData: RoundScore = {
      id: existingScoreId || generateId(),
      tripId: currentTrip.id,
      playerId: currentUser.id,
      playerName: currentUser.name,
      roundNumber: selectedRound,
      courseId: course.id,
      handicap,
      holes,
      grossTotal,
      netTotal,
      isComplete,
      closestToPin: closestToPin || undefined,
      updatedAt: Date.now(),
    };

    if (existingScoreId) {
      updateScore(existingScoreId, scoreData);
    } else {
      addScore(scoreData);
    }

    navigate('/trip/leaderboard');
  };

  const frontNine = course.holes.slice(0, 9);
  const backNine = course.holes.slice(9, 18);
  const frontNineTotal = holeScores.slice(0, 9).reduce((a, b) => a + b, 0);
  const backNineTotal = holeScores.slice(9, 18).reduce((a, b) => a + b, 0);
  const totalGross = frontNineTotal + backNineTotal;

  // Check if this hole is a par 3 (potential closest to pin)
  const isPar3 = currentHoleData.par === 3;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter Scores</h1>
            <p className="text-gray-500">{course.name}</p>
          </div>
          <Select
            options={Array.from({ length: currentTrip.numberOfRounds }, (_, i) => ({
              value: (i + 1).toString(),
              label: `Round ${i + 1}`,
            }))}
            value={selectedRound.toString()}
            onChange={(v) => setSelectedRound(parseInt(v))}
          />
        </div>

        {/* Handicap Info */}
        <Card>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Your Handicap: </span>
              <span className="font-medium">{handicap}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Course Handicap: </span>
              <span className="font-medium">{courseHandicap}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Strokes: </span>
              <span className="font-medium">{courseHandicap}</span>
            </div>
          </div>
        </Card>

        {/* Current Hole Entry */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
                disabled={currentHole === 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div>
                <div className="text-4xl font-bold text-green-700">
                  Hole {currentHole}
                </div>
                <div className="text-lg text-gray-600">
                  Par {currentHoleData.par}
                  {strokes > 0 && (
                    <span className="ml-2 text-green-600">
                      ({strokes} stroke{strokes > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
                disabled={currentHole === 18}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Score buttons */}
            <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreChange(score)}
                  className={`
                    aspect-square rounded-lg text-xl font-bold transition-all
                    ${
                      grossScore === score
                        ? 'bg-green-600 text-white scale-110'
                        : 'bg-white text-gray-700 hover:bg-green-100'
                    }
                  `}
                >
                  {score}
                </button>
              ))}
            </div>

            {grossScore > 0 && (
              <div className="flex justify-center gap-8 pt-4">
                <div>
                  <div className="text-sm text-gray-500">Gross</div>
                  <div className="text-2xl font-bold">{grossScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Net</div>
                  <div className="text-2xl font-bold text-green-600">{netScore}</div>
                </div>
              </div>
            )}

            {/* Closest to Pin for Par 3s */}
            {isPar3 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-700">Closest to Pin</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    placeholder="Distance (e.g., 4'6&quot;)"
                    value={closestToPin?.holeNumber === currentHole ? closestToPin.distance : ''}
                    onChange={(e) =>
                      setClosestToPin({
                        holeNumber: currentHole,
                        distance: e.target.value,
                      })
                    }
                    className="w-32 text-center"
                  />
                  {closestToPin?.holeNumber === currentHole && closestToPin.distance && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setClosestToPin(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Scorecard Overview */}
        <Card title="Scorecard">
          <div className="overflow-x-auto">
            {/* Front 9 */}
            <div className="mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">Hole</th>
                    {frontNine.map((h) => (
                      <th
                        key={h.number}
                        className={`px-2 py-1 text-center cursor-pointer hover:bg-gray-200 ${
                          currentHole === h.number ? 'bg-green-200' : ''
                        }`}
                        onClick={() => setCurrentHole(h.number)}
                      >
                        {h.number}
                      </th>
                    ))}
                    <th className="px-2 py-1 text-center font-bold">Out</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-1 font-medium">Par</td>
                    {frontNine.map((h) => (
                      <td key={h.number} className="px-2 py-1 text-center text-gray-500">
                        {h.par}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-medium">
                      {frontNine.reduce((s, h) => s + h.par, 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-1 font-medium">Strokes</td>
                    {frontNine.map((h) => {
                      const s = strokesMap.get(h.number) || 0;
                      return (
                        <td key={h.number} className="px-2 py-1 text-center text-green-600">
                          {s > 0 ? s : ''}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-medium">Score</td>
                    {frontNine.map((h, i) => (
                      <td
                        key={h.number}
                        className={`px-2 py-1 text-center font-medium cursor-pointer ${
                          currentHole === h.number ? 'bg-green-100' : ''
                        } ${holeScores[i] > 0 ? '' : 'text-gray-300'}`}
                        onClick={() => setCurrentHole(h.number)}
                      >
                        {holeScores[i] > 0 ? holeScores[i] : '-'}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-bold">
                      {frontNineTotal > 0 ? frontNineTotal : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Back 9 */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">Hole</th>
                    {backNine.map((h) => (
                      <th
                        key={h.number}
                        className={`px-2 py-1 text-center cursor-pointer hover:bg-gray-200 ${
                          currentHole === h.number ? 'bg-green-200' : ''
                        }`}
                        onClick={() => setCurrentHole(h.number)}
                      >
                        {h.number}
                      </th>
                    ))}
                    <th className="px-2 py-1 text-center font-bold">In</th>
                    <th className="px-2 py-1 text-center font-bold">Tot</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-2 py-1 font-medium">Par</td>
                    {backNine.map((h) => (
                      <td key={h.number} className="px-2 py-1 text-center text-gray-500">
                        {h.par}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-medium">
                      {backNine.reduce((s, h) => s + h.par, 0)}
                    </td>
                    <td className="px-2 py-1 text-center font-medium">
                      {course.holes.reduce((s, h) => s + h.par, 0)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-2 py-1 font-medium">Strokes</td>
                    {backNine.map((h) => {
                      const s = strokesMap.get(h.number) || 0;
                      return (
                        <td key={h.number} className="px-2 py-1 text-center text-green-600">
                          {s > 0 ? s : ''}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1"></td>
                    <td className="px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 font-medium">Score</td>
                    {backNine.map((h, i) => (
                      <td
                        key={h.number}
                        className={`px-2 py-1 text-center font-medium cursor-pointer ${
                          currentHole === h.number ? 'bg-green-100' : ''
                        } ${holeScores[i + 9] > 0 ? '' : 'text-gray-300'}`}
                        onClick={() => setCurrentHole(h.number)}
                      >
                        {holeScores[i + 9] > 0 ? holeScores[i + 9] : '-'}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-center font-bold">
                      {backNineTotal > 0 ? backNineTotal : '-'}
                    </td>
                    <td className="px-2 py-1 text-center font-bold text-green-700">
                      {totalGross > 0 ? totalGross : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/trip')} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Scores
          </Button>
        </div>
      </div>
    </Layout>
  );
}
