import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ExerciseCard({ exercise, onEdit, onDelete }) {
  const { user } = useAuth()
  const isOwner = exercise.ownerId === user?.userId

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/workout/exercises/${exercise.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
        >
          {exercise.name}
        </Link>
        {isOwner && <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(exercise)}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(exercise)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>}
      </div>

      {exercise.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {exercise.categories.map(cat => (
            <span key={cat.id} className="badge bg-primary-50 text-primary-700">
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {exercise.bodyAreas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {exercise.bodyAreas.map(area => (
            <span key={area.id} className="badge bg-indigo-50 text-indigo-600">
              {area.name}
            </span>
          ))}
        </div>
      )}

      {exercise.videoUrl && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Video attached
        </div>
      )}
    </div>
  )
}
