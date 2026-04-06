import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWorkoutPlans, useWorkoutPlan, useCompleteExercise } from '../../hooks/useWorkout'
import ActiveExerciseCard from '../../components/workout/ActiveExerciseCard'
import RestTimer from '../../components/workout/RestTimer'

export default function ActiveWorkoutPage() {
  const { dayId } = useParams()
  const navigate = useNavigate()
  const completeExercise = useCompleteExercise()

  // Find the plan that contains this day
  const { data: plans = [] } = useWorkoutPlans()
  const activePlan = plans.find(p => p.isActive)
  const { data: fullPlan, isLoading } = useWorkoutPlan(activePlan?.id)

  const day = fullPlan?.days?.find(d => d.id === dayId)
  const exercises = day?.exercises ?? []

  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('exercise') // 'exercise' | 'rest-setup' | 'rest' | 'complete'
  const [restMinutes, setRestMinutes] = useState(2)
  const [restSeconds, setRestSeconds] = useState(0)
  const [form, setForm] = useState({ sets: '', reps: '', weight: '' })

  // Pre-fill form with last values when exercise changes
  useEffect(() => {
    const ex = exercises[currentIndex]
    if (ex) {
      setForm({
        sets: ex.lastSets != null ? String(ex.lastSets) : ex.targetSets != null ? String(ex.targetSets) : '',
        reps: ex.lastReps != null ? String(ex.lastReps) : ex.targetReps != null ? String(ex.targetReps) : '',
        weight: ex.lastWeight != null ? String(ex.lastWeight) : ex.targetWeight != null ? String(ex.targetWeight) : '',
      })
    }
  }, [currentIndex, day])

  async function handleCompleteExercise() {
    const ex = exercises[currentIndex]
    await completeExercise.mutateAsync({
      id: ex.id,
      sets: form.sets !== '' ? form.sets : null,
      reps: form.reps !== '' ? form.reps : null,
      weight: form.weight !== '' ? form.weight : null,
    })
    setPhase('rest-setup')
  }

  function handleStartRest() {
    setRestSeconds(Math.round(restMinutes * 60))
    setPhase('rest')
  }

  function handleRestComplete() {
    advanceToNextExercise()
  }

  function advanceToNextExercise() {
    const next = currentIndex + 1
    if (next >= exercises.length) {
      setPhase('complete')
    } else {
      setCurrentIndex(next)
      setPhase('exercise')
    }
  }

  if (isLoading || !day) {
    return (
      <div className="text-sm text-gray-400">
        {isLoading ? 'Loading…' : 'Day not found.'}
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No exercises in this day.</p>
        <Link to="/workout" className="btn-primary">Back to Plans</Link>
      </div>
    )
  }

  // ── Complete screen ───────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workout Complete!</h1>
        <p className="text-gray-500 mb-2">Day {day.dayNumber} · {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} done</p>
        <button onClick={() => navigate('/workout')} className="btn-primary mt-6 px-8">
          Finish
        </button>
      </div>
    )
  }

  const currentEx = exercises[currentIndex]

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/workout" className="hover:text-gray-600">Workouts</Link>
          <span>/</span>
          <span className="text-gray-700">Day {day.dayNumber}</span>
        </nav>
        <span className="text-sm font-medium text-gray-500">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise phase */}
      {phase === 'exercise' && (
        <div className="space-y-5">
          <ActiveExerciseCard
            dayExercise={currentEx}
            form={form}
            onChange={setForm}
          />
          <button
            onClick={handleCompleteExercise}
            disabled={completeExercise.isPending}
            className="btn-primary w-full py-3 text-base"
          >
            {completeExercise.isPending ? 'Saving…' : 'Complete Exercise ✓'}
          </button>
        </div>
      )}

      {/* Rest setup phase */}
      {phase === 'rest-setup' && (
        <div className="text-center space-y-5 py-6">
          <div className="text-4xl">✅</div>
          <h2 className="text-lg font-bold text-gray-900">Nice work!</h2>
          <p className="text-gray-500 text-sm">How long do you want to rest?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRestMinutes(m => Math.max(0.5, m - 0.5))}
              className="w-10 h-10 rounded-full border border-gray-300 text-lg font-bold hover:bg-gray-50"
            >
              −
            </button>
            <div className="text-3xl font-bold text-gray-900 w-24 text-center tabular-nums">
              {restMinutes % 1 === 0 ? `${restMinutes}m` : `${restMinutes}m`}
            </div>
            <button
              type="button"
              onClick={() => setRestMinutes(m => Math.min(10, m + 0.5))}
              className="w-10 h-10 rounded-full border border-gray-300 text-lg font-bold hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={advanceToNextExercise} className="btn-secondary">
              Skip Rest
            </button>
            <button onClick={handleStartRest} className="btn-primary px-8">
              Start Timer
            </button>
          </div>
        </div>
      )}

      {/* Rest timer phase */}
      {phase === 'rest' && (
        <div className="text-center space-y-4 py-6">
          <h2 className="text-base font-semibold text-gray-700">Rest Time</h2>
          {currentIndex + 1 < exercises.length && (
            <p className="text-sm text-gray-500">
              Next up: <strong>{exercises[currentIndex + 1].exercise.name}</strong>
            </p>
          )}
          <RestTimer
            initialSeconds={restSeconds}
            onComplete={handleRestComplete}
          />
        </div>
      )}
    </div>
  )
}
