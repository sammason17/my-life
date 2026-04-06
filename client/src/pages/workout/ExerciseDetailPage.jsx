import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useExercise, useUpdateExercise, useDeleteExercise } from '../../hooks/useWorkout'
import VideoEmbed from '../../components/workout/VideoEmbed'
import ExerciseModal from '../../components/workout/ExerciseModal'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: exercise, isLoading } = useExercise(id)
  const updateExercise = useUpdateExercise()
  const deleteExercise = useDeleteExercise()

  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave(data) {
    await updateExercise.mutateAsync({ id, ...data })
    setEditing(false)
  }

  async function handleDelete() {
    await deleteExercise.mutateAsync(id)
    navigate('/workout/exercises')
  }

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading…</div>
  }

  if (!exercise) {
    return <div className="text-sm text-gray-500">Exercise not found.</div>
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link to="/workout" className="hover:text-gray-600">Workouts</Link>
        <span>/</span>
        <Link to="/workout/exercises" className="hover:text-gray-600">Exercises</Link>
        <span>/</span>
        <span className="text-gray-700">{exercise.name}</span>
      </nav>

      <div className="flex items-start justify-between gap-3 mb-5">
        <h1 className="text-xl font-bold text-gray-900">{exercise.name}</h1>
        {exercise.ownerId === user?.userId && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Video */}
      <div className="mb-5">
        <VideoEmbed url={exercise.videoUrl} />
      </div>

      {/* Tags */}
      {exercise.categories.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {exercise.categories.map(cat => (
              <span key={cat.id} className="badge bg-primary-50 text-primary-700 text-sm px-3 py-1">
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {exercise.bodyAreas.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Body Areas</p>
          <div className="flex flex-wrap gap-2">
            {exercise.bodyAreas.map(area => (
              <span key={area.id} className="badge bg-indigo-50 text-indigo-600 text-sm px-3 py-1">
                {area.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <ExerciseModal
          exercise={exercise}
          onClose={() => setEditing(false)}
          onSave={handleSave}
          loading={updateExercise.isPending}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete exercise?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{exercise.name}</strong> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleteExercise.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteExercise.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
