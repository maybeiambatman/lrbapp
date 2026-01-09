import { useState, useRef } from 'react';
import { Plus, Edit2, Save, X, Upload, Camera, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/handicap';
import { parseScorecardImage, convertParsedTees, type ParsedScorecard } from '../../utils/scorecardParser';
import type { Course, Hole, Tee } from '../../types';

function CourseForm({
  course,
  onSave,
  onCancel,
}: {
  course?: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(course?.name || '');
  const [tees, setTees] = useState<Tee[]>(
    course?.tees?.length ? course.tees : [{
      id: generateId(),
      name: 'White',
      color: '#f5f5f5',
      rating: 72,
      slope: 113,
    }]
  );
  const [holes, setHoles] = useState<Hole[]>(
    course?.holes || Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      handicapRank: i + 1,
      yards: 350,
    }))
  );

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ status: '', progress: 0 });
  const [scanResult, setScanResult] = useState<ParsedScorecard | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleHoleChange = (index: number, field: keyof Hole, value: number) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const result = await parseScorecardImage(file, (progress) => {
        setScanProgress(progress);
      });

      setScanResult(result);

      // Apply parsed data to form
      if (result.courseName && !name) {
        setName(result.courseName);
      }

      // Apply tees data (convert parsed tees to Tee type with IDs)
      if (result.tees.length > 0) {
        setTees(convertParsedTees(result.tees));
      }

      // Apply holes data
      setHoles(result.holes);

    } catch (err) {
      setScanError('Failed to scan scorecard. Please enter data manually.');
      console.error('OCR error:', err);
    } finally {
      setIsScanning(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTeeChange = (teeId: string, field: keyof Tee, value: string | number) => {
    setTees(tees.map(t =>
      t.id === teeId ? { ...t, [field]: value } : t
    ));
  };

  const addTee = () => {
    setTees([...tees, {
      id: generateId(),
      name: '',
      rating: 70,
      slope: 113,
    }]);
  };

  const removeTee = (teeId: string) => {
    if (tees.length > 1) {
      setTees(tees.filter(t => t.id !== teeId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use first tee's rating/slope as legacy values for backwards compatibility
    const primaryTee = tees[0];
    onSave({
      id: course?.id || generateId(),
      name,
      tees,
      rating: primaryTee?.rating,
      slope: primaryTee?.slope,
      holes,
      createdBy: course?.createdBy || 'admin',
      createdAt: course?.createdAt || Date.now(),
    });
  };

  const totalPar = holes.reduce((sum, h) => sum + h.par, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Scorecard Scanner */}
      {!course && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            id="scorecard-upload"
          />

          {isScanning ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-[#006747] mx-auto mb-4 animate-spin" />
              <p className="font-medium text-gray-900">{scanProgress.status}</p>
              <div className="mt-3 w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#006747] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{scanProgress.progress}% complete</p>
            </div>
          ) : scanResult ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Scorecard preview"
                    className="w-32 h-auto rounded-lg border shadow-sm"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-[#006747]" />
                    <span className="font-medium text-[#006747]">Scorecard scanned!</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round(scanResult.confidence)}% confidence)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Review and adjust the values below. OCR may not be perfect for all scorecards.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Scan Another
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <label
              htmlFor="scorecard-upload"
              className="cursor-pointer block text-center"
            >
              <div className="flex justify-center gap-4 mb-4">
                <div className="p-3 bg-[#006747]/10 rounded-full">
                  <Upload className="h-8 w-8 text-[#006747]" />
                </div>
                <div className="p-3 bg-[#006747]/10 rounded-full">
                  <Camera className="h-8 w-8 text-[#006747]" />
                </div>
              </div>
              <p className="font-medium text-gray-900 mb-1">
                Scan Scorecard Photo
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Upload or take a photo of the scorecard to auto-fill par and handicap values
              </p>
              <Button type="button" variant="secondary">
                <Upload className="h-4 w-4 mr-2" />
                Choose Image or Take Photo
              </Button>
            </label>
          )}

          {scanError && (
            <div className="flex items-center gap-2 mt-4 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{scanError}</span>
            </div>
          )}
        </div>
      )}

      <Input
        label="Course Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Tees Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Tees & Ratings</h3>
            <p className="text-sm text-gray-500">Add each tee with its course rating and slope</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addTee}>
            <Plus className="h-4 w-4 mr-1" />
            Add Tee
          </Button>
        </div>

        <div className="space-y-3">
          {tees.map((tee) => (
            <div key={tee.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {/* Color indicator */}
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: tee.color || '#9ca3af' }}
              />

              {/* Tee Name */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Tee name (e.g., Gold, Blue)"
                  value={tee.name}
                  onChange={(e) => handleTeeChange(tee.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                />
              </div>

              {/* Rating */}
              <div className="w-24">
                <label className="text-xs text-gray-500 mb-1 block">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="60"
                  max="80"
                  value={tee.rating}
                  onChange={(e) => handleTeeChange(tee.id, 'rating', parseFloat(e.target.value) || 70)}
                  className="w-full px-2 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                />
              </div>

              {/* Slope */}
              <div className="w-20">
                <label className="text-xs text-gray-500 mb-1 block">Slope</label>
                <input
                  type="number"
                  min="55"
                  max="155"
                  value={tee.slope}
                  onChange={(e) => handleTeeChange(tee.id, 'slope', parseInt(e.target.value) || 113)}
                  className="w-full px-2 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-[#006747] focus:border-transparent"
                />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeTee(tee.id)}
                disabled={tees.length <= 1}
                className={`p-2 rounded-lg transition-colors ${
                  tees.length <= 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-red-500 hover:bg-red-50'
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {scanResult && scanResult.tees.length > 0 && (
          <div className="mt-3 text-sm text-[#006747] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Found {scanResult.tees.length} tee{scanResult.tees.length > 1 ? 's' : ''} from scorecard scan</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Hole Information</h3>
          <span className="text-sm text-gray-600">Total Par: {totalPar}</span>
        </div>

        {/* Front 9 */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Front 9</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Hole</th>
                  {holes.slice(0, 9).map((_, i) => (
                    <th key={i} className="px-2 py-1 text-center w-16">
                      {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center">Out</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1 font-medium">Par</td>
                  {holes.slice(0, 9).map((hole, i) => (
                    <td key={i} className="px-1 py-1">
                      <select
                        value={hole.par}
                        onChange={(e) =>
                          handleHoleChange(i, 'par', parseInt(e.target.value))
                        }
                        className="w-full px-1 py-1 border rounded text-center"
                      >
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center font-medium">
                    {holes.slice(0, 9).reduce((sum, h) => sum + h.par, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-medium">Hdcp</td>
                  {holes.slice(0, 9).map((hole, i) => (
                    <td key={i} className="px-1 py-1">
                      <input
                        type="number"
                        min={1}
                        max={18}
                        value={hole.handicapRank}
                        onChange={(e) =>
                          handleHoleChange(i, 'handicapRank', parseInt(e.target.value))
                        }
                        className="w-full px-1 py-1 border rounded text-center"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Back 9 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Back 9</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Hole</th>
                  {holes.slice(9, 18).map((_, i) => (
                    <th key={i} className="px-2 py-1 text-center w-16">
                      {i + 10}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-center">In</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1 font-medium">Par</td>
                  {holes.slice(9, 18).map((hole, i) => (
                    <td key={i} className="px-1 py-1">
                      <select
                        value={hole.par}
                        onChange={(e) =>
                          handleHoleChange(i + 9, 'par', parseInt(e.target.value))
                        }
                        className="w-full px-1 py-1 border rounded text-center"
                      >
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center font-medium">
                    {holes.slice(9, 18).reduce((sum, h) => sum + h.par, 0)}
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 font-medium">Hdcp</td>
                  {holes.slice(9, 18).map((hole, i) => (
                    <td key={i} className="px-1 py-1">
                      <input
                        type="number"
                        min={1}
                        max={18}
                        value={hole.handicapRank}
                        onChange={(e) =>
                          handleHoleChange(i + 9, 'handicapRank', parseInt(e.target.value))
                        }
                        className="w-full px-1 py-1 border rounded text-center"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Course
        </Button>
      </div>
    </form>
  );
}

export function CourseManagement() {
  const { courses, addCourse, updateCourse } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();

  const handleSave = (course: Course) => {
    if (editingCourse) {
      updateCourse(course.id, course);
    } else {
      addCourse(course);
    }
    setShowForm(false);
    setEditingCourse(undefined);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(undefined);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#006747]">Course Management</h1>
            <p className="text-gray-500">Add and manage golf course scorecards</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          )}
        </div>

        {showForm ? (
          <Card title={editingCourse ? 'Edit Course' : 'Add New Course'}>
            <CourseForm
              course={editingCourse}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add your first golf course to get started
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span>Par: {course.holes.reduce((s, h) => s + h.par, 0)}</span>
                      {course.tees && course.tees.length > 0 ? (
                        <span className="flex items-center gap-2">
                          {course.tees.map((tee) => (
                            <span key={tee.id} className="inline-flex items-center gap-1">
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: tee.color || '#9ca3af' }}
                              />
                              <span>{tee.name}: {tee.rating}/{tee.slope}</span>
                            </span>
                          ))}
                        </span>
                      ) : (
                        <>
                          {course.rating && <span>Rating: {course.rating}</span>}
                          {course.slope && <span>Slope: {course.slope}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(course)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
