import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWorkoutPlan, useCreatePlan, useUpdatePlan } from '../../hooks/useWorkout'
import DayBuilder from '../../components/workout/DayBuilder'

const DAY_TYPE_LABELS = {
  UPPER: 'Upper Body',
  LOWER: 'Lower Body',
  FULL_BODY: 'Full Body',
  CARDIO: 'Cardio',
  REST: 'Rest',
}

function emptyDay(dayNumber) {
  return { dayNumber, dayType: 'UPPER', label: '', exercises: [] }
}

function initDays(count) {
  return Array.from({ length: count }, (_, i) => emptyDay(i + 1))
}

export default function PlanBuilderPage() {
  const { id: planId } = useParams()
  const navigate = useNavigate()
  const isEditing = !!planId

  const { data: existingPlan, isLoading: planLoading } = useWorkoutPlan(planId)
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()

  const [step, setStep] = useState(0)
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [plan, setPlan] = useState({ name: '', daysPerWeek: 3, days: initDays(3) })

  // Populate form when editing an existing plan
  useEffect(() => {
    if (existingPlan) {
      setPlan({
        name: existingPlan.name,
        daysPerWeek: existingPlan.daysPerWeek,
        days: existingPlan.days.map(day => ({
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          label: day.label || '',
          exercises: day.exercises.map(de => ({
            exerciseId: de.exerciseId,
            exerciseName: de.exercise.name,
            sortOrder: de.sortOrder,
            targetSets: de.targetSets ?? '',
            targetReps: de.targetReps ?? '',
            targetWeight: de.targetWeight ?? '',
          })),
        })),
      })
    }
  }, [existingPlan])

  function handleDaysPerWeekChange(value) {
    const n = Math.min(7, Math.max(1, Number(value)))
    const current = plan.days
    let days
    if (n > current.length) {
      days = [
        ...current,
        ...Array.from({ length: n - current.length }, (_, i) =>
          emptyDay(current.length + i + 1)
        ),
      ]
    } else {
      days = current.slice(0, n)
    }
    setPlan(p => ({ ...p, daysPerWeek: n, days }))
  }

  function handleDayChange(index, updatedDay) {
    setPlan(p => {
      const days = [...p.days]
      days[index] = updatedDay
      return { ...p, days }
    })
  }

  async function handleSave() {
    const payload = {
      name: plan.name.trim(),
      daysPerWeek: plan.daysPerWeek,
      days: plan.days.map(day => ({
        dayNumber: day.dayNumber,
        dayType: day.dayType,
        label: day.label || null,
        exercises: day.exercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          sortOrder: ex.sortOrder ?? idx,
          targetSets: ex.targetSets !== '' ? Number(ex.targetSets) : null,
          targetReps: ex.targetReps !== '' ? Number(ex.targetReps) : null,
          targetWeight: ex.targetWeight !== '' ? Number(ex.targetWeight) : null,
        })),
      })),
    }
    if (isEditing) {
      await updatePlan.mutateAsync({ id: planId, ...payload })
    } else {
      await createPlan.mutateAsync(payload)
    }
    navigate('/workout')
  }

  const isSaving = createPlan.isPending || updatePlan.isPending

  if (isEditing && planLoading) {
    return <div className="text-sm text-gray-400">Loading…</div>
  }

  // ── Step 0: Name + days per week ─────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="max-w-lg">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link to="/workout" className="hover:text-gray-600">Workouts</Link>
          <span>/</span>
          <span className="text-gray-700">{isEditing ? 'Edit Plan' : 'New Plan'}</span>
        </nav>

        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Plan' : 'Create Workout Plan'}
        </h1>

        <StepIndicator current={0} total={3} />

        <div className="space-y-5 mt-6">
          <div>
            <label className="label">Plan Name</label>
            <input
              className="input"
              placeholder="e.g. Push / Pull / Legs"
              value={plan.name}
              onChange={e => setPlan(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Days Per Week</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleDaysPerWeekChange(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                    plan.daysPerWeek === n
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            disabled={!plan.name.trim()}
            onClick={() => setStep(1)}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Configure Days →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 1: Configure each day ────────────────────────────────────────────
  if (step === 1) {
    const currentDay = plan.days[currentDayIndex]
    const isLastDay = currentDayIndex === plan.days.length - 1

    return (
      <div className="max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link to="/workout" className="hover:text-gray-600">Workouts</Link>
          <span>/</span>
          <span className="text-gray-700">{isEditing ? 'Edit Plan' : 'New Plan'}</span>
        </nav>

        <h1 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h1>
        <p className="text-sm text-gray-500 mb-5">{plan.daysPerWeek} days per week</p>

        <StepIndicator current={1} total={3} />

        {/* Day tabs */}
        <div className="flex gap-1 mt-5 mb-5 flex-wrap">
          {plan.days.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentDayIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentDayIndex === idx
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Day {idx + 1}
              {day.dayType && (
                <span className="ml-1 text-xs opacity-70">
                  {DAY_TYPE_LABELS[day.dayType]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Day {currentDayIndex + 1}</h3>
          <DayBuilder
            day={currentDay}
            onChange={updated => handleDayChange(currentDayIndex, updated)}
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => currentDayIndex > 0 ? setCurrentDayIndex(i => i - 1) : setStep(0)}
            className="btn-secondary"
          >
            ← Back
          </button>

          {isLastDay ? (
            <button type="button" onClick={() => setStep(2)} className="btn-primary">
              Review Plan →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentDayIndex(i => i + 1)}
              className="btn-primary"
            >
              Next Day →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Step 2: Review ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link to="/workout" className="hover:text-gray-600">Workouts</Link>
        <span>/</span>
        <span className="text-gray-700">{isEditing ? 'Edit Plan' : 'New Plan'}</span>
      </nav>

      <h1 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h1>
      <p className="text-sm text-gray-500 mb-5">{plan.daysPerWeek} days per week</p>

      <StepIndicator current={2} total={3} />

      <div className="space-y-3 mt-6">
        {plan.days.map((day, idx) => (
          <div key={idx} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-900">Day {idx + 1}</span>
                <span className="ml-2 badge bg-gray-100 text-gray-600">
                  {DAY_TYPE_LABELS[day.dayType]}
                </span>
                {day.label && (
                  <span className="ml-2 text-sm text-gray-500">{day.label}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setCurrentDayIndex(idx); setStep(1) }}
                className="text-xs text-primary-600 hover:underline"
              >
                Edit
              </button>
            </div>
            {day.dayType !== 'REST' && day.exercises.length > 0 ? (
              <ul className="space-y-1">
                {day.exercises.map(ex => (
                  <li key={ex.exerciseId} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                    <span className="flex-1">{ex.exerciseName}</span>
                    {(ex.targetSets || ex.targetReps || ex.targetWeight) && (
                      <span className="text-xs text-gray-400">
                        {[
                          ex.targetSets && `${ex.targetSets} sets`,
                          ex.targetReps && `${ex.targetReps} reps`,
                          ex.targetWeight && `${ex.targetWeight}kg`,
                        ].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : day.dayType !== 'REST' ? (
              <p className="text-xs text-gray-400">No exercises assigned</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={() => setStep(1)} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </div>
  )
}

function StepIndicator({ current, total }) {
  const labels = ['Basics', 'Days', 'Review']
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 ${i <= current ? 'text-primary-600' : 'text-gray-300'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i < current ? 'bg-primary-600 text-white' :
              i === current ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{label}</span>
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 ${i < current ? 'bg-primary-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
