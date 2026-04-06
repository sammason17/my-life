import { useState } from 'react'
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  useExerciseCategories,
  useBodyAreas,
} from '../../hooks/useWorkout'
import ExerciseCard from '../../components/workout/ExerciseCard'
import ExerciseModal from '../../components/workout/ExerciseModal'

export default function ExercisesPage() {
  const { data: exercises = [], isLoading } = useExercises()
  const { data: categories = [] } = useExerciseCategories()
  const { data: bodyAreas = [] } = useBodyAreas()
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise()
  const deleteExercise = useDeleteExercise()

  const [modal, setModal] = useState(null) // null | 'create' | exercise object
  const [search, setSearch] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [filterBodyAreaId, setFilterBodyAreaId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = !filterCategoryId || ex.categories.some(c => c.id === filterCategoryId)
    const matchesArea = !filterBodyAreaId || ex.bodyAreas.some(b => b.id === filterBodyAreaId)
    return matchesSearch && matchesCat && matchesArea
  })

  async function handleSave(data) {
    if (modal === 'create') {
      await createExercise.mutateAsync(data)
    } else {
      await updateExercise.mutateAsync({ id: modal.id, ...data })
    }
    setModal(null)
  }

  async function handleDelete() {
    await deleteExercise.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const isSaving = createExercise.isPending || updateExercise.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          + New Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="input flex-1 min-w-40"
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input"
          value={filterCategoryId}
          onChange={e => setFilterCategoryId(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input"
          value={filterBodyAreaId}
          onChange={e => setFilterBodyAreaId(e.target.value)}
        >
          <option value="">All body areas</option>
          {bodyAreas.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No exercises found</p>
          {exercises.length === 0 && (
            <p className="text-sm">Create your first exercise to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(ex => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onEdit={setModal}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal && (
        <ExerciseModal
          exercise={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={isSaving}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete exercise?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{deleteTarget.name}</strong> will be permanently deleted and removed from any workout plans.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
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
