import ExercisePicker from './ExercisePicker'

const DAY_TYPES = [
  { value: 'UPPER', label: 'Upper Body' },
  { value: 'LOWER', label: 'Lower Body' },
  { value: 'FULL_BODY', label: 'Full Body' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'REST', label: 'Rest Day' },
]

export default function DayBuilder({ day, onChange }) {
  function setField(field, value) {
    onChange({ ...day, [field]: value })
  }

  function addExercise(exercise) {
    const already = day.exercises.some(e => e.exerciseId === exercise.id)
    if (already) return
    onChange({
      ...day,
      exercises: [
        ...day.exercises,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sortOrder: day.exercises.length,
          targetSets: '',
          targetReps: '',
          targetWeight: '',
        },
      ],
    })
  }

  function removeExercise(exerciseId) {
    onChange({
      ...day,
      exercises: day.exercises
        .filter(e => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, sortOrder: i })),
    })
  }

  function updateExercise(exerciseId, field, value) {
    onChange({
      ...day,
      exercises: day.exercises.map(e =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e
      ),
    })
  }

  function moveExercise(index, direction) {
    const newExercises = [...day.exercises]
    const target = index + direction
    if (target < 0 || target >= newExercises.length) return
    ;[newExercises[index], newExercises[target]] = [newExercises[target], newExercises[index]]
    onChange({
      ...day,
      exercises: newExercises.map((e, i) => ({ ...e, sortOrder: i })),
    })
  }

  const isRest = day.dayType === 'REST'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Day Type</label>
          <select
            className="input"
            value={day.dayType}
            onChange={e => setField('dayType', e.target.value)}
          >
            {DAY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Label <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            className="input"
            placeholder="e.g. Push Day"
            value={day.label}
            onChange={e => setField('label', e.target.value)}
          />
        </div>
      </div>

      {!isRest && (
        <>
          {/* Assigned exercises */}
          {day.exercises.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Exercises ({day.exercises.length})
              </p>
              {day.exercises.map((ex, idx) => (
                <div key={ex.exerciseId} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate">{ex.exerciseName}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveExercise(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(idx, 1)}
                        disabled={idx === day.exercises.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.exerciseId)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Sets</label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        placeholder="—"
                        value={ex.targetSets}
                        onChange={e => updateExercise(ex.exerciseId, 'targetSets', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Reps</label>
                      <input
                        type="number"
                        min="1"
                        className="input text-sm"
                        placeholder="—"
                        value={ex.targetReps}
                        onChange={e => updateExercise(ex.exerciseId, 'targetReps', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="input text-sm"
                        placeholder="—"
                        value={ex.targetWeight}
                        onChange={e => updateExercise(ex.exerciseId, 'targetWeight', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Picker */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Exercises</p>
            <ExercisePicker
              selectedIds={day.exercises.map(e => e.exerciseId)}
              onAdd={addExercise}
            />
          </div>
        </>
      )}

      {isRest && (
        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
          Rest day — no exercises needed.
        </div>
      )}
    </div>
  )
}
