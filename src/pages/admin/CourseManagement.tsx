import { useState } from 'react';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { Button, Card, Input } from '../../components/common';
import { Layout } from '../../components/common/Layout';
import { useStore } from '../../store/useStore';
import { generateId } from '../../utils/handicap';
import type { Course, Hole } from '../../types';

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
  const [rating, setRating] = useState(course?.rating?.toString() || '72');
  const [slope, setSlope] = useState(course?.slope?.toString() || '113');
  const [holes, setHoles] = useState<Hole[]>(
    course?.holes || Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      handicapRank: i + 1,
      yards: 350,
    }))
  );

  const handleHoleChange = (index: number, field: keyof Hole, value: number) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: course?.id || generateId(),
      name,
      rating: parseFloat(rating),
      slope: parseInt(slope),
      holes,
      createdBy: course?.createdBy || 'admin',
      createdAt: course?.createdAt || Date.now(),
    });
  };

  const totalPar = holes.reduce((sum, h) => sum + h.par, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Course Rating"
          type="number"
          step="0.1"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        />
        <Input
          label="Slope Rating"
          type="number"
          value={slope}
          onChange={(e) => setSlope(e.target.value)}
        />
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
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.name}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>Par: {course.holes.reduce((s, h) => s + h.par, 0)}</span>
                      {course.rating && <span>Rating: {course.rating}</span>}
                      {course.slope && <span>Slope: {course.slope}</span>}
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
