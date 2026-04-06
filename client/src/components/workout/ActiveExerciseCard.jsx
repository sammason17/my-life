import { format } from 'date-fns'
import VideoEmbed from './VideoEmbed'

export default function ActiveExerciseCard({ dayExercise, form, onChange }) {
  const { exercise, targetSets, targetReps, targetWeight, lastSets, lastReps, lastWeight, lastPerformedAt } = dayExercise
  const hasLast = lastSets || lastReps || lastWeight

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{exercise.name}</h2>

      {/* Category / body area tags */}
      <div className="flex flex-wrap gap-1.5">
        {exercise.categories.map(c => (
          <span key={c.id} className="badge bg-primary-50 text-primary-700 text-xs">{c.name}</span>
        ))}
        {exercise.bodyAreas.map(b => (
          <span key={b.id} className="badge bg-indigo-50 text-indigo-600 text-xs">{b.name}</span>
        ))}
      </div>

      {/* Video */}
      {exercise.videoUrl && (
        <VideoEmbed url={exercise.videoUrl} />
      )}

      {/* Reference info */}
      <div className="grid grid-cols-2 gap-3">
        {(targetSets || targetReps || targetWeight) && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-600 mb-1">Target</p>
            <p className="text-sm text-blue-800 font-semibold">
              {[
                targetSets && `${targetSets} sets`,
                targetReps && `${targetReps} reps`,
                targetWeight && `${targetWeight}kg`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}
        {hasLast && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">
              Last time{lastPerformedAt ? ` · ${format(new Date(lastPerformedAt), 'MMM d')}` : ''}
            </p>
            <p className="text-sm text-gray-700 font-semibold">
              {[
                lastSets && `${lastSets} sets`,
                lastReps && `${lastReps} reps`,
                lastWeight && `${lastWeight}kg`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label text-sm">Sets</label>
          <input
            type="number"
            min="1"
            className="input text-center text-lg font-semibold"
            placeholder={targetSets || lastSets || '—'}
            value={form.sets}
            onChange={e => onChange({ ...form, sets: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-sm">Reps</label>
          <input
            type="number"
            min="1"
            className="input text-center text-lg font-semibold"
            placeholder={targetReps || lastReps || '—'}
            value={form.reps}
            onChange={e => onChange({ ...form, reps: e.target.value })}
          />
        </div>
        <div>
          <label className="label text-sm">Weight (kg)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            className="input text-center text-lg font-semibold"
            placeholder={targetWeight || lastWeight || '—'}
            value={form.weight}
            onChange={e => onChange({ ...form, weight: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
