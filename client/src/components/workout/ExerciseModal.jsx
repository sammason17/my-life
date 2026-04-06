import { useState, useEffect } from 'react'
import { useExerciseCategories, useBodyAreas } from '../../hooks/useWorkout'

export default function ExerciseModal({ exercise, onClose, onSave, loading }) {
  const { data: categories = [] } = useExerciseCategories()
  const { data: bodyAreas = [] } = useBodyAreas()

  const [form, setForm] = useState({
    name: '',
    videoUrl: '',
    categoryIds: [],
    bodyAreaIds: [],
  })

  useEffect(() => {
    if (exercise) {
      setForm({
        name: exercise.name,
        videoUrl: exercise.videoUrl || '',
        categoryIds: exercise.categories.map(c => c.id),
        bodyAreaIds: exercise.bodyAreas.map(b => b.id),
      })
    }
  }, [exercise])

  function toggleItem(field, id) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(id)
        ? f[field].filter(x => x !== id)
        : [...f[field], id],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {exercise ? 'Edit Exercise' : 'New Exercise'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="label">Exercise Name</label>
            <input
              className="input"
              placeholder="e.g. Bench Press"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Video URL <span className="text-gray-400 font-normal">(YouTube or Vimeo)</span></label>
            <input
              className="input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
            />
          </div>

          <div>
            <label className="label mb-2">Exercise Categories</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleItem('categoryIds', cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.categoryIds.includes(cat.id)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2">Body Areas</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {bodyAreas.map(area => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleItem('bodyAreaIds', area.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.bodyAreaIds.includes(area.id)
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : exercise ? 'Save Changes' : 'Create Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
