import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'

// ── Exercise Categories ───────────────────────────────────────────────────────

export function useExerciseCategories() {
  return useQuery({
    queryKey: ['workout', 'exercise-categories'],
    queryFn: () => api.get('/workout/exercise-categories').then(r => r.data),
  })
}

export function useCreateExerciseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => api.post('/workout/exercise-categories', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercise-categories'] })
      toast.success('Category created')
    },
    onError: () => toast.error('Failed to create category'),
  })
}

export function useUpdateExerciseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/workout/exercise-categories/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercise-categories'] })
      toast.success('Category updated')
    },
    onError: () => toast.error('Failed to update category'),
  })
}

export function useDeleteExerciseCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.delete(`/workout/exercise-categories/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercise-categories'] })
      toast.success('Category deleted')
    },
    onError: () => toast.error('Failed to delete category'),
  })
}

// ── Body Areas ────────────────────────────────────────────────────────────────

export function useBodyAreas() {
  return useQuery({
    queryKey: ['workout', 'body-areas'],
    queryFn: () => api.get('/workout/body-areas').then(r => r.data),
  })
}

export function useCreateBodyArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => api.post('/workout/body-areas', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'body-areas'] })
      toast.success('Body area created')
    },
    onError: () => toast.error('Failed to create body area'),
  })
}

export function useUpdateBodyArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/workout/body-areas/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'body-areas'] })
      toast.success('Body area updated')
    },
    onError: () => toast.error('Failed to update body area'),
  })
}

export function useDeleteBodyArea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.delete(`/workout/body-areas/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'body-areas'] })
      toast.success('Body area deleted')
    },
    onError: () => toast.error('Failed to delete body area'),
  })
}

// ── Exercises ─────────────────────────────────────────────────────────────────

export function useExercises() {
  return useQuery({
    queryKey: ['workout', 'exercises'],
    queryFn: () => api.get('/workout/exercises').then(r => r.data),
  })
}

export function useExercise(id) {
  return useQuery({
    queryKey: ['workout', 'exercises', id],
    queryFn: () => api.get(`/workout/exercises/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => api.post('/workout/exercises', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercises'] })
      toast.success('Exercise created')
    },
    onError: () => toast.error('Failed to create exercise'),
  })
}

export function useUpdateExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/workout/exercises/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercises'] })
      qc.invalidateQueries({ queryKey: ['workout', 'exercises', id] })
      toast.success('Exercise updated')
    },
    onError: () => toast.error('Failed to update exercise'),
  })
}

export function useDeleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.delete(`/workout/exercises/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'exercises'] })
      toast.success('Exercise deleted')
    },
    onError: () => toast.error('Failed to delete exercise'),
  })
}

// ── Workout Plans ─────────────────────────────────────────────────────────────

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workout', 'plans'],
    queryFn: () => api.get('/workout/plans').then(r => r.data),
  })
}

export function useWorkoutPlan(id) {
  return useQuery({
    queryKey: ['workout', 'plans', id],
    queryFn: () => api.get(`/workout/plans/${id}`).then(r => r.data),
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: data => api.post('/workout/plans', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'plans'] })
      toast.success('Plan created')
    },
    onError: () => toast.error('Failed to create plan'),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/workout/plans/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['workout', 'plans'] })
      qc.invalidateQueries({ queryKey: ['workout', 'plans', id] })
      toast.success('Plan updated')
    },
    onError: () => toast.error('Failed to update plan'),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.delete(`/workout/plans/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'plans'] })
      toast.success('Plan deleted')
    },
    onError: () => toast.error('Failed to delete plan'),
  })
}

export function useActivatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.patch(`/workout/plans/${id}/activate`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'plans'] })
      toast.success('Plan activated')
    },
    onError: () => toast.error('Failed to activate plan'),
  })
}

// ── Active workout ────────────────────────────────────────────────────────────

export function useCompleteExercise() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/workout/day-exercises/${id}/complete`, data).then(r => r.data),
    onSuccess: (data) => {
      // Invalidate the plan that contains this day exercise so last values refresh
      qc.invalidateQueries({ queryKey: ['workout', 'plans'] })
    },
    onError: () => toast.error('Failed to save exercise'),
  })
}
