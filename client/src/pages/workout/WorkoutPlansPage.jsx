import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWorkoutPlans, useWorkoutPlan, useActivatePlan, useDeletePlan } from '../../hooks/useWorkout'
import { format } from 'date-fns'

const DAY_TYPE_LABELS = {
  UPPER: 'Upper',
  LOWER: 'Lower',
  FULL_BODY: 'Full Body',
  CARDIO: 'Cardio',
  REST: 'Rest',
}

const DAY_TYPE_COLORS = {
  UPPER: 'bg-blue-50 text-blue-700',
  LOWER: 'bg-green-50 text-green-700',
  FULL_BODY: 'bg-purple-50 text-purple-700',
  CARDIO: 'bg-orange-50 text-orange-700',
  REST: 'bg-gray-50 text-gray-500',
}

export default function WorkoutPlansPage() {
  const navigate = useNavigate()
  const { data: plans = [], isLoading } = useWorkoutPlans()
  const activatePlan = useActivatePlan()
  const deletePlan = useDeletePlan()
  const [deleteTarget, setDeleteTarget] = useState(null)

  const activePlan = plans.find(p => p.isActive)

  async function handleDelete() {
    await deletePlan.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Workouts</h1>
          <nav className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Plans</span>
            <span>·</span>
            <Link to="/workout/exercises" className="hover:text-primary-600 transition-colors">
              Exercise Library
            </Link>
          </nav>
        </div>
        <Link to="/workout/plans/new" className="btn-primary">
          + New Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-400">Loading…</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏋</p>
          <p className="text-lg font-medium mb-1">No workout plans yet</p>
          <p className="text-sm mb-5">Create your first plan to get started.</p>
          <Link to="/workout/plans/new" className="btn-primary">
            Create a Plan
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active plan quick-start */}
          {activePlan && <ActivePlanSection planId={activePlan.id} planName={activePlan.name} />}

          {/* All plans list */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              My Plans
            </h2>
            <div className="space-y-3">
              {plans.map(plan => (
                <div key={plan.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                      {plan.isActive && (
                        <span className="badge bg-green-100 text-green-700 text-xs">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.daysPerWeek} day{plan.daysPerWeek !== 1 ? 's' : ''}/week
                      · {plan._count?.days ?? 0} day{plan._count?.days !== 1 ? 's' : ''} configured
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!plan.isActive && (
                      <button
                        onClick={() => activatePlan.mutate(plan.id)}
                        disabled={activatePlan.isPending}
                        className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:border-primary-400 hover:text-primary-600 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <Link
                      to={`/workout/plans/${plan.id}/edit`}
                      className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(plan)}
                      className="text-xs px-2.5 py-1 border border-gray-200 text-gray-400 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete plan?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{deleteTarget.name}</strong> will be permanently deleted including all configured days.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deletePlan.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletePlan.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivePlanSection({ planId, planName }) {
  const navigate = useNavigate()
  const { data: fullPlan } = useWorkoutPlan(planId)
  const days = fullPlan?.days ?? []

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Plan</h2>
        <span className="text-sm font-semibold text-gray-900">{planName}</span>
      </div>
      {days.length === 0 ? (
        <div className="text-sm text-gray-400">Loading days…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {days.map(day => {
            const lastPerformed = day.exercises
              .map(e => e.lastPerformedAt)
              .filter(Boolean)
              .sort()
              .pop()
            const exerciseCount = day.exercises.length
            const isRest = day.dayType === 'REST'

            return (
              <button
                key={day.id}
                onClick={() => !isRest && navigate(`/workout/active/${day.id}`)}
                disabled={isRest}
                className={`card p-4 text-left transition-all ${
                  isRest
                    ? 'opacity-60 cursor-default'
                    : 'hover:shadow-md hover:border-primary-200 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Day {day.dayNumber}</span>
                  {!isRest && (
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <span className={`badge text-xs ${DAY_TYPE_COLORS[day.dayType]}`}>
                  {DAY_TYPE_LABELS[day.dayType]}
                </span>
                {day.label && (
                  <p className="text-xs text-gray-600 mt-1 font-medium">{day.label}</p>
                )}
                {!isRest && (
                  <p className="text-xs text-gray-400 mt-2">
                    {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
                  </p>
                )}
                {lastPerformed && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last: {format(new Date(lastPerformed), 'MMM d')}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
