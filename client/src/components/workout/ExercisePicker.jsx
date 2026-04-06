import { useState } from 'react'
import { useExercises } from '../../hooks/useWorkout'

export default function ExercisePicker({ selectedIds, onAdd }) {
  const { data: exercises = [] } = useExercises()
  const [search, setSearch] = useState('')

  const filtered = exercises.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-3 py-3 border-b border-gray-100 bg-gray-50">
        <input
          className="input text-sm"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No exercises found</p>
        ) : (
          filtered.map(ex => {
            const isAdded = selectedIds.includes(ex.id)
            return (
              <div key={ex.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{ex.name}</p>
                  {ex.bodyAreas.length > 0 && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {ex.bodyAreas.map(b => b.name).join(', ')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => !isAdded && onAdd(ex)}
                  disabled={isAdded}
                  className={`ml-4 flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    isAdded
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isAdded ? 'Added' : '+ Add'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
